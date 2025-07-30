const User = require("../model/user");
const Map = require("../model/tripMaps");
const Friend = require("../model/friends");
const Bookmark = require("../model/bookmark");
const {
  generateProfilePresignedUrl,
} = require("../services/profilePictureService");

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
        maps,
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
    const { username, bio, emailPrivate } = req.body;

    // Check if user exists and is authorized
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (emailPrivate !== undefined) updateData.emailPrivate = emailPrivate;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: Date.now() },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      data: updatedUser,
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
      maps,
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
          mapCount: 1,
          totalViews: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: topUsers,
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
