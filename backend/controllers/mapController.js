const Map = require("../model/tripMaps");
const POI = require("../model/poi");
const Bookmark = require("../model/bookmark");
const MapComment = require("../model/mapComment");
const MapLike = require("../model/mapLike");
const POILike = require("../model/poiLike");
const POITag = require("../model/poiTag");
const Tag = require("../model/tag");
const User = require("../model/user");
const mongoose = require("mongoose");

// Create a new map
const createMap = async (req, res) => {
  try {
    const { mapName, coordArray, isPrivate = false } = req.body;
    const userId = req.user._id;

    if (!mapName || !coordArray || !Array.isArray(coordArray)) {
      return res.status(400).json({
        success: false,
        message: "Map name and coordinates array are required",
      });
    }

    // Create the map
    const newMap = new Map({
      user_id: userId,
      mapName,
      isPrivate,
    });

    const savedMap = await newMap.save();

    // Create POIs for each coordinate
    const poiPromises = coordArray.map(async (coord, index) => {
      const poi = new POI({
        map_id: savedMap._id,
        user_id: userId,
        lat: coord.lat,
        lng: coord.lng,
        locationName: coord.name || coord.locationName || null,
        date_visited: coord.date_visited || new Date(),
      });

      const savedPOI = await poi.save();

      // Handle tags if provided
      if (coord.tags && Array.isArray(coord.tags) && coord.tags.length > 0) {
        const tagPromises = coord.tags.map(async (tagName) => {
          // Find or create tag
          let tag = await Tag.findOne({ name: tagName });
          if (!tag) {
            tag = new Tag({ name: tagName });
            await tag.save();
          }

          // Create POI-Tag relationship
          const poiTag = new POITag({
            poi_id: savedPOI._id,
            tag_id: tag._id,
          });
          return poiTag.save();
        });

        await Promise.all(tagPromises);
      }

      return savedPOI;
    });

    await Promise.all(poiPromises);

    // Populate user info
    const populatedMap = await Map.findById(savedMap._id).populate(
      "user_id",
      "username email"
    );

    res.status(201).json({
      success: true,
      data: populatedMap,
    });
  } catch (error) {
    console.error("Error creating map:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get individual map with POIs
const getMap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    // Get map
    const map = await Map.findById(id).populate(
      "user_id",
      "username email bio"
    );

    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    // Check if user can access private map
    if (
      map.isPrivate &&
      (!userId || map.user_id._id.toString() !== userId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "This map is private",
      });
    }

    // Get POIs for this map
    const pois = await POI.find({ map_id: id }).sort({ createdAt: 1 });

    // Check POI likes for current user
    let poisWithLikes = pois;
    if (userId) {
      const poiLikes = await POILike.find({
        poi_id: { $in: pois.map((p) => p._id) },
        user_id: userId,
      });
      const likedPoiIds = poiLikes.map((like) => like.poi_id.toString());

      poisWithLikes = pois.map((poi) => ({
        ...poi.toObject(),
        isLiked: likedPoiIds.includes(poi._id.toString()),
      }));
    }

    // Increment view count if not the owner
    if (!userId || map.user_id._id.toString() !== userId.toString()) {
      await Map.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    // Get comments
    const comments = await MapComment.find({ map_id: id })
      .populate("user_id", "username")
      .sort({ createdAt: -1 })
      .limit(10);

    // Check if current user has bookmarked this map
    let isBookmarked = false;
    let isLiked = false;
    if (userId) {
      const bookmark = await Bookmark.findOne({ user_id: userId, map_id: id });
      isBookmarked = !!bookmark;

      // Check if user has liked this map
      const mapLike = await MapLike.findOne({ user_id: userId, map_id: id });
      isLiked = !!mapLike;
    }

    res.json({
      success: true,
      data: {
        map: {
          ...map.toObject(),
          isLiked,
        },
        pois: poisWithLikes,
        comments,
        isBookmarked,
      },
    });
  } catch (error) {
    console.error("Error fetching map:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user's maps
const getUserMaps = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query - show private maps only to owner
    const query = { user_id: userId };
    if (!currentUserId || currentUserId.toString() !== userId) {
      query.isPrivate = false;
    }

    const maps = await Map.find(query)
      .populate("user_id", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Map.countDocuments(query);

    res.json({
      success: true,
      data: {
        maps,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user maps:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update map
const updateMap = async (req, res) => {
  try {
    const { id } = req.params;
    const { mapName, isPrivate } = req.body;
    const userId = req.user._id;

    const map = await Map.findById(id);
    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    // Check ownership
    if (map.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this map",
      });
    }

    const updateData = {};
    if (mapName !== undefined) updateData.mapName = mapName;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

    const updatedMap = await Map.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user_id", "username email");

    res.json({
      success: true,
      data: updatedMap,
    });
  } catch (error) {
    console.error("Error updating map:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete map
const deleteMap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const map = await Map.findById(id);
    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    // Check ownership
    if (map.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this map",
      });
    }

    // Cascade delete related data
    await Promise.all([
      Map.findByIdAndDelete(id),
      POI.deleteMany({ map_id: id }),
      Bookmark.deleteMany({ map_id: id }),
      MapComment.deleteMany({ map_id: id }),
    ]);

    res.json({
      success: true,
      message: "Map deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting map:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Toggle map privacy
const toggleMapPrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const map = await Map.findById(id);
    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    // Check ownership
    if (map.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this map",
      });
    }

    const updatedMap = await Map.findByIdAndUpdate(
      id,
      { isPrivate: !map.isPrivate },
      { new: true }
    ).populate("user_id", "username email");

    res.json({
      success: true,
      data: updatedMap,
    });
  } catch (error) {
    console.error("Error toggling map privacy:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search maps
const searchMaps = async (req, res) => {
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
    const maps = await Map.find({
      mapName: searchRegex,
      isPrivate: false,
    })
      .populate("user_id", "username email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Map.countDocuments({
      mapName: searchRegex,
      isPrivate: false,
    });

    res.json({
      success: true,
      data: {
        maps,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error searching maps:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get popular maps
const getPopularMaps = async (req, res) => {
  try {
    // Fetch public maps sorted by likes (descending) and limit to 3
    const popularMaps = await Map.find({ isPrivate: false })
      .populate("user_id", "username email")
      .sort({ likes: -1 })
      .limit(3);

    return res.json({
      success: true,
      data: popularMaps,
    });
  } catch (error) {
    console.error("Error fetching popular maps:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Like/unlike map
const toggleMapLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const map = await Map.findById(id);
    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    // Check if user can access the map
    if (map.isPrivate && map.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot like private map",
      });
    }

    // Check if user has already liked this map
    const existingLike = await MapLike.findOne({ user_id: userId, map_id: id });

    if (existingLike) {
      // Unlike: remove the like record and decrement count
      await MapLike.findByIdAndDelete(existingLike._id);
      await Map.findByIdAndUpdate(id, { $inc: { likes: -1 } });

      res.json({
        success: true,
        message: "Map unliked successfully",
        data: { liked: false },
      });
    } else {
      // Like: create new like record and increment count
      await new MapLike({ user_id: userId, map_id: id }).save();
      await Map.findByIdAndUpdate(id, { $inc: { likes: 1 } });

      res.json({
        success: true,
        message: "Map liked successfully",
        data: { liked: true },
      });
    }
  } catch (error) {
    console.error("Error toggling map like:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createMap,
  getMap,
  getUserMaps,
  updateMap,
  deleteMap,
  toggleMapPrivacy,
  searchMaps,
  getPopularMaps,
  toggleMapLike,
};
