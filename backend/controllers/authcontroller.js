const User = require("../model/user.js");
const dotenv = require("dotenv").config();
const { hashPassword, comparePassword } = require("../helpers/auth.js");
const jwt = require("jsonwebtoken");
const {
  generateProfilePresignedUrl,
} = require("../services/profilePictureService");

//register endpoint
const registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters.",
      });
    }
    // Check username
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({
        success: false,
        message: "Username is already being used.",
      });
    }
    // Check email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email is already being used.",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Format date
    const date = new Date();
    const todaysDate = `${
      date.getMonth() + 1
    }-${date.getDate()}-${date.getFullYear()}`;

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "member",
      createdDate: todaysDate,
    });

    return res.status(201).json({ success: true, user });
  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find by email OR username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email or username.",
      });
    }

    // Check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Password Incorrect",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        email: user.email,
        _id: user._id, // Use _id consistently
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("tripMaps", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      user: { username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

//logout user
const logoutUser = async (req, res) => {
  try {
    // Clear the tripMaps cookie (consistent with login)
    res.clearCookie("tripMaps").send("User logged out successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error logging out");
  }
};

//verify user is logged in
const verifyUser = async (req, res) => {
  try {
    const token = req.cookies?.tripMaps;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select(
      "username email profilePicture role"
    ); // Use _id

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate presigned URLs for profile pictures if they exist
    if (user.profilePicture?.s3Key) {
      const presignedUrl = await generateProfilePresignedUrl(
        user.profilePicture.s3Key
      );
      if (presignedUrl) {
        user.profilePicture.s3Url = presignedUrl;
      }

      if (user.profilePicture?.thumbnailKey) {
        const thumbnailPresignedUrl = await generateProfilePresignedUrl(
          user.profilePicture.thumbnailKey
        );
        if (thumbnailPresignedUrl) {
          user.profilePicture.thumbnailUrl = thumbnailPresignedUrl;
        }
      }
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Verification error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
        code: "INVALID_TOKEN",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please log in again.",
      code: "AUTH_FAILED",
    });
  }
};

// Google OAuth
const googleAuth = async (req, res) => {
  try {
    // Redirect to Google OAuth
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile`;
    res.redirect(googleAuthUrl);
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

// Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code not provided",
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token");
    }

    // Get user info from Google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userData = await userResponse.json();

    // Check if user exists
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      // Create new user
      const date = new Date();
      const todaysDate = `${
        date.getMonth() + 1
      }-${date.getDate()}-${date.getFullYear()}`;

      user = await User.create({
        username:
          userData.name.replace(/\s+/g, "").toLowerCase() +
          Math.floor(Math.random() * 1000),
        email: userData.email,
        password: "oauth_user", // Placeholder for OAuth users
        role: "member",
        createdDate: todaysDate,
        oauthProvider: "google",
        oauthId: userData.id,
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        email: user.email,
        _id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("tripMaps", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

// Facebook OAuth
const facebookAuth = async (req, res) => {
  try {
    // Redirect to Facebook OAuth
    const facebookAuthUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&response_type=code&scope=email`;
    res.redirect(facebookAuthUrl);
  } catch (error) {
    console.error("Facebook auth error:", error);
    res.status(500).json({
      success: false,
      message: "Facebook authentication failed",
    });
  }
};

// Facebook OAuth callback
const facebookCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code not provided",
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(
      "https://graph.facebook.com/v12.0/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          code,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token");
    }

    // Get user info from Facebook
    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`
    );
    const userData = await userResponse.json();

    // Check if user exists
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      // Create new user
      const date = new Date();
      const todaysDate = `${
        date.getMonth() + 1
      }-${date.getDate()}-${date.getFullYear()}`;

      user = await User.create({
        username:
          userData.name.replace(/\s+/g, "").toLowerCase() +
          Math.floor(Math.random() * 1000),
        email: userData.email,
        password: "oauth_user", // Placeholder for OAuth users
        role: "member",
        createdDate: todaysDate,
        oauthProvider: "facebook",
        oauthId: userData.id,
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        email: user.email,
        _id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("tripMaps", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("Facebook callback error:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`
    );
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
};
