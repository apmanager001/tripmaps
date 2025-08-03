// User limits configuration
const USER_LIMITS = {
  MAX_POIS: 100,
  MAX_MAPS: 5,
};

const POI = require("../model/poi");
const tripMaps = require("../model/tripMaps");

/**
 * Middleware to check if user has reached their POI limit
 */
const checkPOILimit = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Count existing POIs for this user
    const poiCount = await POI.countDocuments({ userId });

    if (poiCount >= USER_LIMITS.MAX_POIS) {
      return res.status(403).json({
        success: false,
        message: `You have reached the maximum limit of ${USER_LIMITS.MAX_POIS} POIs. Please subscribe to get unlimited POIs or delete some POIs before creating new ones.`,
      });
    }

    next();
  } catch (error) {
    console.error("Error checking POI limit:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking POI limit",
    });
  }
};

/**
 * Middleware to check if user has reached their map limit
 */
const checkMapLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Count existing maps for this user
    const mapCount = await tripMaps.countDocuments({ userId });

    if (mapCount >= USER_LIMITS.MAX_MAPS) {
      return res.status(403).json({
        success: false,
        message: `You have reached the maximum limit of ${USER_LIMITS.MAX_MAPS} maps. Please subscribe to get unlimited maps ordelete some maps before creating new ones.`,
      });
    }

    next();
  } catch (error) {
    console.error("Error checking map limit:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking map limit",
    });
  }
};

module.exports = {
  checkPOILimit,
  checkMapLimit,
  USER_LIMITS,
};
