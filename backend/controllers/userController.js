const User = require("../model/user");
const Map = require("../model/tripMaps");
const Friend = require("../model/friends");
const Bookmark = require("../model/bookmark");
const {
  generateProfilePresignedUrl,
} = require("../services/profilePictureService");
const { sendEmail } = require("./mailcontroller");
const crypto = require("crypto");

// Get user profile by ID or username
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    let user;
    if (isObjectId) {
      // If it's a valid ObjectId, search by _id
      user = await User.findById(id).select("-password");
    } else {
      // If it's not an ObjectId, search by username
      user = await User.findOne({ username: id }).select("-password");
    }

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

    // Get user's maps
    const maps = await Map.find({ user_id: user._id, isPrivate: false })
      .sort({ createdAt: -1 })
      .limit(10);

    // Add bookmark status to maps (for the current user viewing the profile)
    const currentUserId = req.user?._id;
    let mapsWithBookmarkStatus = maps;

    if (currentUserId) {
      const bookmarks = await Bookmark.find({
        user_id: currentUserId,
        map_id: { $in: maps.map((m) => m._id) },
      });
      const bookmarkedMapIds = bookmarks.map((b) => b.map_id.toString());

      mapsWithBookmarkStatus = maps.map((map) => ({
        ...map.toObject(),
        isBookmarked: bookmarkedMapIds.includes(map._id.toString()),
      }));
    } else {
      mapsWithBookmarkStatus = maps.map((map) => ({
        ...map.toObject(),
        isBookmarked: false,
      }));
    }

    // Get follower/following counts
    const followers = await Friend.countDocuments({
      followed_user_id: user._id,
    });
    const following = await Friend.countDocuments({
      following_user_id: user._id,
    });

    // Convert user to plain object to ensure all properties are included
    const userObject = user.toObject ? user.toObject() : user;

    // Manually add presigned URLs to the user object since they're not in the schema
    if (user.profilePicture?.s3Url) {
      userObject.profilePicture = userObject.profilePicture || {};
      userObject.profilePicture.s3Url = user.profilePicture.s3Url;
    }
    if (user.profilePicture?.thumbnailUrl) {
      userObject.profilePicture = userObject.profilePicture || {};
      userObject.profilePicture.thumbnailUrl = user.profilePicture.thumbnailUrl;
    }

    res.json({
      success: true,
      data: {
        user: userObject,
        maps: mapsWithBookmarkStatus,
        stats: {
          followers,
          following,
          totalMaps: maps.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, bio, emailPrivate, email, socialMedia, alertSettings } =
      req.body;

    // Check if user exists and is authorized
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    // Get current user to check if email is being changed
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData = {};
    let emailChanged = false;

    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (emailPrivate !== undefined) updateData.emailPrivate = emailPrivate;
    if (socialMedia) updateData.socialMedia = socialMedia;
    if (alertSettings) updateData.alertSettings = alertSettings;

    // Handle email change
    if (email && email !== currentUser.email) {
      emailChanged = true;
      updateData.email = email;
      updateData.emailVerified = false; // Set email as unverified

      // Clear any existing verification tokens
      updateData.emailVerificationToken = null;
      updateData.emailVerificationExpires = null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: Date.now() },
      { new: true, runValidators: true }
    ).select("-password");

    // Send verification email if email was changed
    if (emailChanged) {
      try {
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const emailVerificationToken = crypto
          .createHash("sha256")
          .update(verificationToken)
          .digest("hex");

        // Set token expiration (24 hours from now)
        const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Update user with verification token
        await User.findByIdAndUpdate(id, {
          emailVerificationToken,
          emailVerificationExpires,
        });

        // Create verification URL
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const logoUrl = `${process.env.FRONTEND_URL}/tripmap.webp`;

        // Send verification email using existing mail service
        const nodemailer = require("nodemailer");

        const transporter = nodemailer.createTransport({
          host: "smtp.zoho.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify Your New Email Address - TripMaps",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="${logoUrl}" alt="TripMaps Logo" style="max-width: 200px; height: auto;">
              </div>
              
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #2563eb; margin-bottom: 20px; text-align: center;">Email Address Changed 📧</h2>
                
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Hello ${currentUser.username},</p>
                
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Your email address has been successfully changed to <strong>${email}</strong>. To continue using your TripMaps account with full functionality, please verify your new email address.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">Verify New Email Address</a>
                </div>
                
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0;">
                  <p style="color: #92400e; font-size: 14px; margin: 0;">
                    <strong>Important:</strong> Until you verify your new email address, some features may be limited and you won't receive email notifications.
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                  <strong>Security reminder:</strong> This verification link will expire in 24 hours.
                </p>
                
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                  If you're having trouble clicking the button, copy and paste this link into your browser:
                </p>
                
                <p style="color: #2563eb; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
                  ${verificationUrl}
                </p>
                
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  If you didn't change your email address, please contact our support team immediately.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                  Best regards,<br>
                  <strong>The TripMaps Team</strong>
                </p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email verification sent for email change to:", email);
      } catch (emailError) {
        console.error(
          "Error sending verification email after email change:",
          emailError
        );
        // Don't fail the profile update if email sending fails
      }
    }

    res.json({
      success: true,
      data: updatedUser,
      message: emailChanged
        ? "Profile updated successfully! Please check your new email address for a verification link."
        : "Profile updated successfully!",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user dashboard data
const getUserDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is requesting their own dashboard
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this dashboard",
      });
    }

    // Get user data
    const user = await User.findById(id).select("-password");

    // Get user's maps (both private and public)
    const maps = await Map.find({ user_id: id }).sort({ createdAt: -1 });

    // Add bookmark status to maps (user's own maps are not bookmarked by default)
    const mapsWithBookmarkStatus = maps.map((map) => ({
      ...map.toObject(),
      isBookmarked: false, // User's own maps are not bookmarked by default
    }));

    // Get friends/following
    const friends = await Friend.find({ following_user_id: id })
      .populate("followed_user_id", "username email bio")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get bookmarks with populated map data
    const bookmarks = await Bookmark.find({ user_id: id })
      .populate({
        path: "map_id",
        populate: {
          path: "user_id",
          select: "username email",
        },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Return data in the format expected by the frontend
    res.json({
      success: true,
      user,
      maps: mapsWithBookmarkStatus,
      friends,
      bookmarks,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const searchRegex = new RegExp(q, "i");
    const users = await User.find({
      $or: [{ username: searchRegex }, { email: searchRegex }],
    })
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ username: 1 });

    const total = await User.countDocuments({
      $or: [{ username: searchRegex }, { email: searchRegex }],
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get top users (by map count and total views)
const getTopUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topUsers = await Map.aggregate([
      {
        $group: {
          _id: "$user_id",
          mapCount: { $sum: 1 },
          totalViews: { $sum: "$views" },
        },
      },
      {
        $sort: { mapCount: -1, totalViews: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          username: "$user.username",
          profilePicture: "$user.profilePicture",
          mapCount: 1,
          totalViews: 1,
        },
      },
    ]);

    // Generate presigned URLs for profile pictures
    const topUsersWithPresignedUrls = await Promise.all(
      topUsers.map(async (user) => {
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
        return user;
      })
    );

    res.json({
      success: true,
      data: topUsersWithPresignedUrls,
    });
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is deleting their own account
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this account",
      });
    }

    // Delete user's data (cascade delete)
    await Promise.all([
      User.findByIdAndDelete(id),
      Map.deleteMany({ user_id: id }),
      Friend.deleteMany({
        $or: [{ following_user_id: id }, { followed_user_id: id }],
      }),
      Bookmark.deleteMany({ user_id: id }),
    ]);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  searchUsers,
  getTopUsers,
  deleteUserAccount,
};
