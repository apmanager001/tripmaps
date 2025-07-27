const User = require("../model/user.js");
const dotenv = require("dotenv").config();
const { hashPassword, comparePassword } = require("../helpers/auth.js");
const jwt = require("jsonwebtoken");

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
    const user = await User.findById(decoded._id).select("username email"); // Use _id

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
};
