const POI = require("../model/poi");
const Map = require("../model/tripMaps");
const POITag = require("../model/poiTag");
const Tag = require("../model/tag");
const POILike = require("../model/poiLike");
const EditHistory = require("../model/editHistory");
const mongoose = require("mongoose");

// Create a new POI
const createPOI = async (req, res) => {
  try {
    const { map_id, lat, lng, locationName, date_visited, tags } = req.body;
    const userId = req.user._id;

    // Verify map exists and user owns it
    const map = await Map.findById(map_id);
    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    if (map.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add POI to this map",
      });
    }

    // Create POI
    const newPOI = new POI({
      map_id,
      user_id: userId,
      lat,
      lng,
      locationName,
      date_visited: date_visited || new Date(),
    });

    const savedPOI = await newPOI.save();

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
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

    // Record edit history
    await new EditHistory({
      user_id: userId,
      target_type: "poi",
      target_id: savedPOI._id,
      change_summary: "Created new POI",
    }).save();

    const populatedPOI = await POI.findById(savedPOI._id).populate(
      "user_id",
      "username"
    );

    res.status(201).json({
      success: true,
      data: populatedPOI,
    });
  } catch (error) {
    console.error("Error creating POI:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get POI by ID
const getPOI = async (req, res) => {
  try {
    const { id } = req.params;

    const poi = await POI.findById(id)
      .populate("user_id", "username email")
      .populate("map_id", "mapName user_id");

    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI not found",
      });
    }

    // Get tags for this POI
    const poiTags = await POITag.find({ poi_id: id }).populate(
      "tag_id",
      "name"
    );

    const tags = poiTags.map((pt) => pt.tag_id);

    res.json({
      success: true,
      data: {
        poi,
        tags,
      },
    });
  } catch (error) {
    console.error("Error fetching POI:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update POI
const updatePOI = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, locationName, date_visited, tags } = req.body;
    const userId = req.user._id;

    const poi = await POI.findById(id);
    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI not found",
      });
    }

    // Check ownership
    if (poi.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this POI",
      });
    }

    const updateData = {};
    if (lat !== undefined) updateData.lat = lat;
    if (lng !== undefined) updateData.lng = lng;
    if (locationName !== undefined) updateData.locationName = locationName;
    if (date_visited !== undefined) updateData.date_visited = date_visited;

    const updatedPOI = await POI.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user_id", "username");

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await POITag.deleteMany({ poi_id: id });

      // Add new tags
      if (tags.length > 0) {
        const tagPromises = tags.map(async (tagName) => {
          let tag = await Tag.findOne({ name: tagName });
          if (!tag) {
            tag = new Tag({ name: tagName });
            await tag.save();
          }

          const poiTag = new POITag({
            poi_id: id,
            tag_id: tag._id,
          });
          return poiTag.save();
        });

        await Promise.all(tagPromises);
      }
    }

    // Record edit history
    await new EditHistory({
      user_id: userId,
      target_type: "poi",
      target_id: id,
      change_summary: "Updated POI details",
    }).save();

    res.json({
      success: true,
      data: updatedPOI,
    });
  } catch (error) {
    console.error("Error updating POI:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete POI
const deletePOI = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const poi = await POI.findById(id);
    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI not found",
      });
    }

    // Check ownership
    if (poi.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this POI",
      });
    }

    // Cascade delete related data
    await Promise.all([
      POI.findByIdAndDelete(id),
      POITag.deleteMany({ poi_id: id }),
    ]);

    // Record edit history
    await new EditHistory({
      user_id: userId,
      target_type: "poi",
      target_id: id,
      change_summary: "Deleted POI",
    }).save();

    res.json({
      success: true,
      message: "POI deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting POI:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get POIs by map ID
const getPOIsByMap = async (req, res) => {
  try {
    const { mapId } = req.params;
    const userId = req.user?._id;

    // Verify map exists and check privacy
    const map = await Map.findById(mapId);
    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    if (
      map.isPrivate &&
      (!userId || map.user_id.toString() !== userId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot access POIs of private map",
      });
    }

    const pois = await POI.find({ map_id: mapId })
      .populate("user_id", "username")
      .sort({ createdAt: 1 });

    // Get tags for each POI
    const poisWithTags = await Promise.all(
      pois.map(async (poi) => {
        const poiTags = await POITag.find({ poi_id: poi._id }).populate(
          "tag_id",
          "name"
        );

        return {
          ...poi.toObject(),
          tags: poiTags.map((pt) => pt.tag_id),
        };
      })
    );

    res.json({
      success: true,
      data: poisWithTags,
    });
  } catch (error) {
    console.error("Error fetching POIs by map:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search POIs by location
const searchPOIsByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Convert radius to degrees (approximate)
    const radiusInDegrees = radius / 111; // 1 degree ≈ 111 km

    const pois = await POI.find({
      lat: {
        $gte: parseFloat(lat) - radiusInDegrees,
        $lte: parseFloat(lat) + radiusInDegrees,
      },
      lng: {
        $gte: parseFloat(lng) - radiusInDegrees,
        $lte: parseFloat(lng) + radiusInDegrees,
      },
    })
      .populate("user_id", "username")
      .populate("map_id", "mapName isPrivate user_id")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Filter out POIs from private maps
    const filteredPOIs = pois.filter((poi) => !poi.map_id.isPrivate);

    const total = await POI.countDocuments({
      lat: {
        $gte: parseFloat(lat) - radiusInDegrees,
        $lte: parseFloat(lat) + radiusInDegrees,
      },
      lng: {
        $gte: parseFloat(lng) - radiusInDegrees,
        $lte: parseFloat(lng) + radiusInDegrees,
      },
    });

    res.json({
      success: true,
      data: {
        pois: filteredPOIs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error searching POIs by location:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Like/unlike POI
const togglePOILike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const poi = await POI.findById(id);
    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI not found",
      });
    }

    // Check if user can access the POI (map must be public or user must own it)
    const map = await Map.findById(poi.map_id);
    if (map.isPrivate && map.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot like POI from private map",
      });
    }

    // Check if the user has already liked this POI
    const existingLike = await POILike.findOne({ poi_id: id, user_id: userId });

    if (existingLike) {
      // Unlike the POI
      await POILike.findByIdAndDelete(existingLike._id);
      await POI.findByIdAndUpdate(id, { $inc: { likes: -1 } }, { new: true });
      return res.json({
        success: true,
        data: await POI.findById(id).populate("user_id", "username"),
        message: "POI unliked",
      });
    } else {
      // Like the POI
      const newLike = new POILike({
        poi_id: id,
        user_id: userId,
      });
      await newLike.save();
      await POI.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
      return res.json({
        success: true,
        data: await POI.findById(id).populate("user_id", "username"),
        message: "POI liked",
      });
    }
  } catch (error) {
    console.error("Error toggling POI like:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search maps by POI name
const searchMapsByPOIName = async (req, res) => {
  try {
    const { poiName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!poiName) {
      return res.status(400).json({
        success: false,
        message: "POI name is required",
      });
    }

    // Decode the POI name from URL encoding and create a case-insensitive regex
    const decodedPoiName = decodeURIComponent(poiName);
    const poiNameRegex = new RegExp(decodedPoiName, "i");

    // Find all POIs with matching location names
    const pois = await POI.find({
      locationName: poiNameRegex,
    })
      .populate({
        path: "map_id",
        select: "mapName isPrivate user_id createdAt",
        populate: {
          path: "user_id",
          select: "username"
        }
      })
      .populate("user_id", "username")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Filter out POIs from private maps and group by map
    const publicPOIs = pois.filter((poi) => !poi.map_id.isPrivate);

    // Group POIs by map to avoid duplicates
    const mapGroups = {};
    publicPOIs.forEach((poi) => {
      const mapId = poi.map_id._id.toString();
      if (!mapGroups[mapId]) {
        mapGroups[mapId] = {
          map: poi.map_id,
          pois: [],
          totalPOIs: 0,
        };
      }
      mapGroups[mapId].pois.push(poi);
      mapGroups[mapId].totalPOIs++;
    });

    // Convert to array and sort by map creation date
    const mapsWithPOIs = Object.values(mapGroups).sort(
      (a, b) => new Date(b.map.createdAt) - new Date(a.map.createdAt)
    );

    // Get total count for pagination
    const totalPOIs = await POI.countDocuments({
      locationName: poiNameRegex,
    });

    // Count unique public maps
    const totalMaps = await POI.aggregate([
      {
        $match: {
          locationName: poiNameRegex,
        },
      },
      {
        $lookup: {
          from: "maps",
          localField: "map_id",
          foreignField: "_id",
          as: "map",
        },
      },
      {
        $unwind: "$map",
      },
      {
        $match: {
          "map.isPrivate": false,
        },
      },
      {
        $group: {
          _id: "$map_id",
        },
      },
      {
        $count: "total",
      },
    ]);

    const total = totalMaps[0]?.total || 0;

    res.json({
      success: true,
      data: {
        poiName: decodedPoiName,
        maps: mapsWithPOIs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error searching maps by POI name:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get popular locations based on POI frequency
const getPopularLocations = async (req, res) => {
  try {
    // Fetch POIs from public maps, sorted by likes (descending) and limit to 5
    const popularPOIs = await POI.aggregate([
      // Join with Map to filter only public maps
      {
        $lookup: {
          from: "maps",
          localField: "map_id",
          foreignField: "_id",
          as: "map",
        },
      },
      // Unwind the map array
      {
        $unwind: "$map",
      },
      // Filter only public maps
      {
        $match: {
          "map.isPrivate": false,
        },
      },
      // Sort by likes (descending)
      {
        $sort: { likes: -1 },
      },
      // Limit to 5 results
      {
        $limit: 5,
      },
      // Project the fields we want
      {
        $project: {
          _id: 1,
          locationName: 1,
          lat: 1,
          lng: 1,
          likes: 1,
          date_visited: 1,
          "map.mapName": 1,
          "map.user_id": 1,
        },
      },
    ]);

    // Populate user information for each POI
    const populatedPOIs = await POI.populate(popularPOIs, [
      {
        path: "map.user_id",
        select: "username email",
      },
    ]);

    return res.status(200).json({
      success: true,
      data: populatedPOIs,
    });
  } catch (error) {
    console.error("Error fetching popular locations:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createPOI,
  getPOI,
  updatePOI,
  deletePOI,
  getPOIsByMap,
  searchPOIsByLocation,
  searchMapsByPOIName,
  getPopularLocations,
  togglePOILike,
};
