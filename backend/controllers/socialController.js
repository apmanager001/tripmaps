const Friend = require("../model/friends");
const Bookmark = require("../model/bookmark");
const MapComment = require("../model/mapComment");
const CommentLike = require("../model/commentLike");
const User = require("../model/user");
const Map = require("../model/tripMaps");

// Friend management
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot follow yourself",
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already following
    const existingFollow = await Friend.findOne({
      following_user_id: currentUserId,
      followed_user_id: userId,
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "Already following this user",
      });
    }

    const newFollow = new Friend({
      following_user_id: currentUserId,
      followed_user_id: userId,
    });

    await newFollow.save();

    res.status(201).json({
      success: true,
      message: "Successfully followed user",
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const follow = await Friend.findOneAndDelete({
      following_user_id: currentUserId,
      followed_user_id: userId,
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "Not following this user",
      });
    }

    res.json({
      success: true,
      message: "Successfully unfollowed user",
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followers = await Friend.find({ followed_user_id: userId })
      .populate("following_user_id", "username email bio")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Friend.countDocuments({ followed_user_id: userId });

    res.json({
      success: true,
      data: {
        followers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const following = await Friend.find({ following_user_id: userId })
      .populate("followed_user_id", "username email bio")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Friend.countDocuments({ following_user_id: userId });

    res.json({
      success: true,
      data: {
        following,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Bookmark management
const bookmarkMap = async (req, res) => {
  try {
    const { mapId } = req.params;
    const userId = req.user._id;

    // Check if map exists and is public
    const map = await Map.findById(mapId);
    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    if (map.isPrivate && map.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot bookmark private map",
      });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      user_id: userId,
      map_id: mapId,
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: "Map already bookmarked",
      });
    }

    const newBookmark = new Bookmark({
      user_id: userId,
      map_id: mapId,
    });

    await newBookmark.save();

    res.status(201).json({
      success: true,
      message: "Map bookmarked successfully",
    });
  } catch (error) {
    console.error("Error bookmarking map:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const { mapId } = req.params;
    const userId = req.user._id;

    const bookmark = await Bookmark.findOneAndDelete({
      user_id: userId,
      map_id: mapId,
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    res.json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user can view bookmarks
    if (currentUserId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these bookmarks",
      });
    }

    const bookmarks = await Bookmark.find({ user_id: userId })
      .populate({
        path: "map_id",
        populate: {
          path: "user_id",
          select: "username email",
        },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Bookmark.countDocuments({ user_id: userId });

    res.json({
      success: true,
      data: {
        bookmarks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user bookmarks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Comment management
const addComment = async (req, res) => {
  try {
    const { mapId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    // Check if map exists and is public
    const map = await Map.findById(mapId);
    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    if (map.isPrivate && map.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot comment on private map",
      });
    }

    const newComment = new MapComment({
      map_id: mapId,
      user_id: userId,
      comment: comment.trim(),
    });

    const savedComment = await newComment.save();
    const populatedComment = await MapComment.findById(
      savedComment._id
    ).populate("user_id", "username");

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMapComments = async (req, res) => {
  try {
    const { mapId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if map exists and is public
    const map = await Map.findById(mapId);
    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    if (map.isPrivate) {
      return res.status(403).json({
        success: false,
        message: "Cannot view comments on private map",
      });
    }

    const comments = await MapComment.find({ map_id: mapId })
      .populate("user_id", "username")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await MapComment.countDocuments({ map_id: mapId });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching map comments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await MapComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check ownership
    if (comment.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    await MapComment.findByIdAndDelete(commentId);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Comment like management
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // Check if comment exists
    const comment = await MapComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if already liked
    const existingLike = await CommentLike.findOne({
      comment_id: commentId,
      user_id: userId,
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "Comment already liked",
      });
    }

    const newLike = new CommentLike({
      comment_id: commentId,
      user_id: userId,
    });

    await newLike.save();

    res.status(201).json({
      success: true,
      message: "Comment liked successfully",
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const like = await CommentLike.findOneAndDelete({
      comment_id: commentId,
      user_id: userId,
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }

    res.json({
      success: true,
      message: "Comment unliked successfully",
    });
  } catch (error) {
    console.error("Error unliking comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  // Friend management
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,

  // Bookmark management
  bookmarkMap,
  removeBookmark,
  getUserBookmarks,

  // Comment management
  addComment,
  getMapComments,
  deleteComment,

  // Comment like management
  likeComment,
  unlikeComment,
};
