const Alert = require("../model/alert");
const User = require("../model/user");
const tripMaps = require("../model/tripMaps");
const POI = require("../model/poi");
const { sendAlertEmail } = require("../services/emailService");

// Create a new alert
const createAlert = async (alertData) => {
  try {
    const { user_id, type, triggeredBy, targetId, targetType, message } =
      alertData;

    // Check if the user has alerts enabled for this type
    const user = await User.findById(user_id);
    if (!user || !user.alertSettings) {
      return null; // User doesn't exist or has no alert settings
    }

    // Check if the specific alert type is enabled
    let isEnabled = false;
    switch (type) {
      case "follow":
        isEnabled = user.alertSettings.followAlerts;
        break;
      case "comment":
        isEnabled = user.alertSettings.commentAlerts;
        break;
      case "like":
      case "poi_like":
      case "map_like":
        isEnabled = user.alertSettings.likeAlerts;
        break;
      default:
        isEnabled = false;
    }

    if (!isEnabled) {
      return null; // Alert type is disabled for this user
    }

    // Don't create alert if user is triggering action on their own content
    if (user_id.toString() === triggeredBy.toString()) {
      return null;
    }

    // Create the alert
    const alert = new Alert({
      user_id,
      type,
      triggeredBy,
      targetId,
      targetType,
      message,
    });

    await alert.save();

    // Check if email should be sent
    let shouldSendEmail = user.alertSettings.emailNotifications;

    if (shouldSendEmail) {
      switch (type) {
        case "follow":
          shouldSendEmail = user.alertSettings.emailFollowAlerts;
          break;
        case "comment":
          shouldSendEmail = user.alertSettings.emailCommentAlerts;
          break;
        case "like":
        case "poi_like":
        case "map_like":
          // For now, likes use the general email notification setting
          // You can add a specific emailLikeAlerts setting later if needed
          shouldSendEmail = true;
          break;
        default:
          shouldSendEmail = false;
      }
    }

    // Send email if enabled
    if (shouldSendEmail && user.email && user.emailVerified) {
      try {
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        let targetUrl = null;

        // Generate target URL based on alert type
        if (targetType === "map" && targetId) {
          targetUrl = `${baseUrl}/maps/${targetId}`;
        } else if (targetType === "poi" && targetId) {
          targetUrl = `${baseUrl}/point_of_interest/${targetId}`;
        } else if (type === "follow") {
          const triggerUser = await User.findById(triggeredBy);
          if (triggerUser) {
            targetUrl = `${baseUrl}/profile/${triggerUser.username}`;
          }
        }

        const emailResult = await sendAlertEmail(
          user.email,
          type,
          message,
          targetUrl
        );

        if (emailResult.success) {
          alert.emailSent = true;
          await alert.save();
        }
      } catch (emailError) {
        console.error("Error sending alert email:", emailError);
        // Don't fail the alert creation if email fails
      }
    }

    return alert;
  } catch (error) {
    console.error("Error creating alert:", error);
    throw error;
  }
};

// Get alerts for a user
const getUserAlerts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // Verify user is requesting their own alerts or is admin
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own alerts.",
      });
    }

    const query = { user_id: userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const alerts = await Alert.find(query)
      .populate("triggeredBy", "username profilePicture")
      .populate("targetId") // This will populate based on targetType
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Alert.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        alerts,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
};

// Mark alert as read
const markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Verify user owns this alert or is admin
    if (
      alert.user_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only mark your own alerts as read.",
      });
    }

    alert.isRead = true;
    await alert.save();

    res.status(200).json({
      success: true,
      message: "Alert marked as read",
      data: alert,
    });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark alert as read",
      error: error.message,
    });
  }
};

// Mark all alerts as read for a user
const markAllAlertsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is updating their own alerts or is admin
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own alerts.",
      });
    }

    const result = await Alert.updateMany(
      { user_id: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} alerts marked as read`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Error marking all alerts as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all alerts as read",
      error: error.message,
    });
  }
};

// Delete alert
const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Verify user owns this alert or is admin
    if (
      alert.user_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own alerts.",
      });
    }

    await Alert.findByIdAndDelete(alertId);

    res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete alert",
      error: error.message,
    });
  }
};

// Get alert count for a user
const getAlertCount = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own alert count or is admin
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own alert count.",
      });
    }

    const unreadCount = await Alert.countDocuments({
      user_id: userId,
      isRead: false,
    });

    const totalCount = await Alert.countDocuments({
      user_id: userId,
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching alert count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alert count",
      error: error.message,
    });
  }
};

// Helper function to create follow alert
const createFollowAlert = async (followedUserId, followerUserId) => {
  const follower = await User.findById(followerUserId);
  if (!follower) return null;

  return createAlert({
    user_id: followedUserId,
    type: "follow",
    triggeredBy: followerUserId,
    message: `${follower.username} started following you`,
  });
};

// Helper function to create comment alert
const createCommentAlert = async (mapId, commenterId, comment) => {
  try {
    const map = await tripMaps.findById(mapId).populate("user_id");
    const commenter = await User.findById(commenterId);

    if (!map || !commenter) return null;

    return createAlert({
      user_id: map.user_id._id,
      type: "comment",
      triggeredBy: commenterId,
      targetId: mapId,
      targetType: "map",
      message: `${commenter.username} commented on your map "${map.mapName}"`,
    });
  } catch (error) {
    console.error("Error creating comment alert:", error);
    return null;
  }
};

// Helper function to create like alert
const createLikeAlert = async (targetId, targetType, likerId) => {
  try {
    let targetOwner, targetName, message;
    const liker = await User.findById(likerId);

    if (!liker) return null;

    if (targetType === "map") {
      const map = await tripMaps.findById(targetId).populate("user_id");
      if (!map) return null;
      targetOwner = map.user_id._id;
      targetName = map.mapName;
      message = `${liker.username} liked your map "${targetName}"`;
    } else if (targetType === "poi") {
      const poi = await POI.findById(targetId).populate("user_id");
      if (!poi) return null;
      targetOwner = poi.user_id._id;
      targetName = poi.locationName || "POI";
      message = `${liker.username} liked your POI "${targetName}"`;
    } else {
      return null;
    }

    return createAlert({
      user_id: targetOwner,
      type: targetType === "map" ? "map_like" : "poi_like",
      triggeredBy: likerId,
      targetId,
      targetType,
      message,
    });
  } catch (error) {
    console.error("Error creating like alert:", error);
    return null;
  }
};

module.exports = {
  createAlert,
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  getAlertCount,
  createFollowAlert,
  createCommentAlert,
  createLikeAlert,
};
