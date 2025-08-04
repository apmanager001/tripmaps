const Flag = require("../model/flag");
const Photo = require("../model/photo");
const POI = require("../model/poi");
const TripMaps = require("../model/tripMaps");
const User = require("../model/user");

// Create a new flag
const createFlag = async (req, res) => {
  try {
    const { photoId, reason, details } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!photoId) {
      return res.status(400).json({
        success: false,
        message: "Photo ID is required",
      });
    }

    // Get photo details
    const photo = await Photo.findById(photoId).populate("poi_id");
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    // Get POI details
    const poi = await POI.findById(photo.poi_id).populate("map_id");
    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI not found",
      });
    }

    // Check if user already flagged this photo
    const existingFlag = await Flag.findOne({
      photoId,
      flaggedBy: userId,
    });

    if (existingFlag) {
      return res.status(400).json({
        success: false,
        message: "You have already flagged this photo",
      });
    }

    // Create the flag
    const flag = new Flag({
      photoId,
      flaggedBy: userId,
      photoOwner: photo.user_id,
      poiId: photo.poi_id,
      mapId: poi.map_id,
      reason: reason || "other",
      details: details || "",
    });

    await flag.save();

    res.status(201).json({
      success: true,
      message: "Photo flagged successfully",
      data: flag,
    });
  } catch (error) {
    console.error("Error creating flag:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all flags (admin only)
const getAllFlags = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Admin check is handled by adminAuth middleware
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const query = {};
    if (status) {
      query.status = status;
    }

    const flags = await Flag.find(query)
      .populate("photoId", "s3Url s3Key")
      .populate("flaggedBy", "username email")
      .populate("photoOwner", "username email")
      .populate("poiId", "locationName")
      .populate("mapId", "mapName")
      .populate("reviewedBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Flag.countDocuments(query);

    res.json({
      success: true,
      data: flags,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error getting flags:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update flag status (admin only)
const updateFlagStatus = async (req, res) => {
  try {
    const { flagId } = req.params;
    const { status, adminNotes } = req.body;
    const userId = req.user._id;

    // Admin check is handled by adminAuth middleware
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const flag = await Flag.findById(flagId);
    if (!flag) {
      return res.status(404).json({
        success: false,
        message: "Flag not found",
      });
    }

    flag.status = status;
    flag.adminNotes = adminNotes;
    flag.reviewedBy = userId;
    flag.reviewedAt = new Date();

    await flag.save();

    res.json({
      success: true,
      message: "Flag status updated successfully",
      data: flag,
    });
  } catch (error) {
    console.error("Error updating flag status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get flags by user
const getFlagsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const flags = await Flag.find({ flaggedBy: userId })
      .populate("photoId", "s3Url s3Key")
      .populate("photoOwner", "username")
      .populate("poiId", "locationName")
      .populate("mapId", "mapName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Flag.countDocuments({ flaggedBy: userId });

    res.json({
      success: true,
      data: flags,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error getting user flags:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if user has flagged a specific photo
const checkUserFlag = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user._id;

    const flag = await Flag.findOne({
      photoId,
      flaggedBy: userId,
    });

    res.json({
      success: true,
      hasFlagged: !!flag,
      flag: flag || null,
    });
  } catch (error) {
    console.error("Error checking user flag:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createFlag,
  getAllFlags,
  updateFlagStatus,
  getFlagsByUser,
  checkUserFlag,
};
