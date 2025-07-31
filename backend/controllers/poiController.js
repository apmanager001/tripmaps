const POI = require("../model/poi");
const Map = require("../model/tripMaps");
const POITag = require("../model/poiTag");
const Tag = require("../model/tag");
const POILike = require("../model/poiLike");
const EditHistory = require("../model/editHistory");
const mongoose = require("mongoose");
const Photo = require("../model/photo");
const {
  generatePresignedUrl,
  generatePresignedUrlsForPhotos,
} = require("../helpers/photoHelpers");

// Create a new POI
const createPOI = async (req, res) => {
  try {
    const {
      map_id,
      lat,
      lng,
      locationName,
      date_visited,
      description,
      googleMapsLink,
      tags,
      isPrivate = false,
    } = req.body;
    const userId = req.user._id;

    // Verify map exists and user owns it (if map_id is provided)
    if (map_id) {
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
    }

    // Create POI
    const newPOI = new POI({
      map_id: map_id || null, // Allow POIs without maps
      user_id: userId,
      lat,
      lng,
      locationName,
      date_visited: date_visited || new Date(),
      description,
      googleMapsLink,
      isPrivate,
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
      .populate("map_id", "mapName user_id")
      .populate("photos"); // Use the virtual field to populate photos

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

    // Generate presigned URLs for photos if they exist
    const photosWithUrls =
      poi.photos && Array.isArray(poi.photos)
        ? await generatePresignedUrlsForPhotos(poi.photos)
        : [];

    // Add photos to the POI object
    const poiWithPhotos = {
      ...poi.toObject(),
      photos: photosWithUrls,
    };

    res.json({
      success: true,
      data: {
        poi: poiWithPhotos,
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
    const {
      lat,
      lng,
      locationName,
      date_visited,
      tags,
      description,
      googleMapsLink,
      isPrivate,
    } = req.body;
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
    if (description !== undefined) updateData.description = description;
    if (googleMapsLink !== undefined)
      updateData.googleMapsLink = googleMapsLink;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

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

    // Find all photos associated with this POI
    const photos = await Photo.find({ poi_id: id });
    console.log(`Found ${photos.length} photos to delete for POI ${id}`);

    // Delete photos from R2 storage
    const { deleteImage } = require("../services/s3Service");

    // Create a flat array of all delete promises
    const photoDeletePromises = [];
    photos.forEach((photo) => {
      console.log(`Adding delete promise for main photo: ${photo.s3Key}`);
      photoDeletePromises.push(deleteImage(photo.s3Key));
      if (photo.thumbnailKey) {
        console.log(
          `Adding delete promise for thumbnail: ${photo.thumbnailKey}`
        );
        photoDeletePromises.push(deleteImage(photo.thumbnailKey));
      } else {
        console.log(`No thumbnail key found for photo: ${photo.s3Key}`);
      }
    });

    // Cascade delete related data
    try {
      await Promise.all([
        POI.findByIdAndDelete(id),
        POITag.deleteMany({ poi_id: id }),
        Photo.deleteMany({ poi_id: id }), // Delete all photos from database
        ...photoDeletePromises, // Delete photo files from R2
      ]);
      console.log(`Successfully deleted POI ${id} and all associated files`);
    } catch (error) {
      console.error(`Error during POI deletion for ${id}:`, error);
      // Still try to delete the POI and database records even if R2 deletion fails
      await Promise.all([
        POI.findByIdAndDelete(id),
        POITag.deleteMany({ poi_id: id }),
        Photo.deleteMany({ poi_id: id }),
      ]);
      console.log(
        `POI ${id} deleted from database, but some R2 files may remain`
      );
    }

    // Record edit history
    await new EditHistory({
      user_id: userId,
      target_type: "poi",
      target_id: id,
      change_summary: "Deleted POI",
    }).save();

    res.json({
      success: true,
      message: "POI and all associated photos deleted successfully",
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
      .populate("photos") // Include photos for map POIs
      .sort({ createdAt: 1 });

    // Get tags for each POI, add likes count, and generate presigned URLs for photos
    const poisWithTags = await Promise.all(
      pois.map(async (poi) => {
        const poiTags = await POITag.find({ poi_id: poi._id }).populate(
          "tag_id",
          "name"
        );

        // Generate presigned URLs for photos if they exist
        const photosWithUrls =
          poi.photos && Array.isArray(poi.photos)
            ? await generatePresignedUrlsForPhotos(poi.photos)
            : [];

        return {
          ...poi.toObject(),
          tags: poiTags.map((pt) => pt.tag_id),
          likesCount: poi.likes ? poi.likes.length : 0,
          photos: photosWithUrls,
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

    // Filter out POIs from private maps and add likes count
    const filteredPOIs = pois.filter((poi) => !poi.map_id.isPrivate);

    const poisWithLikesCount = filteredPOIs.map((poi) => ({
      ...poi.toObject(),
      likesCount: poi.likes ? poi.likes.length : 0,
    }));

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
        pois: poisWithLikesCount,
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

// Search POIs comprehensively (name, tags, description) - public only
const searchPOIsComprehensive = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const searchRegex = new RegExp(q, "i");

    // Search in POI name, description, and tags
    const pois = await POI.aggregate([
      {
        $lookup: {
          from: "poitags",
          localField: "_id",
          foreignField: "poi_id",
          as: "poiTags",
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "poiTags.tag_id",
          foreignField: "_id",
          as: "tags",
        },
      },
      {
        $lookup: {
          from: "tripMaps",
          localField: "map_id",
          foreignField: "_id",
          as: "map",
        },
      },
      {
        $unwind: {
          path: "$map",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "photos",
          localField: "_id",
          foreignField: "poi_id",
          as: "photos",
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { locationName: searchRegex },
                { description: searchRegex },
                { "tags.name": searchRegex },
              ],
            },
            {
              $or: [
                { map: { $exists: false } }, // POIs without maps
                { "map.isPrivate": false }, // POIs from public maps
              ],
            },
          ],
        },
      },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 1,
          locationName: 1,
          description: 1,
          lat: 1,
          lng: 1,
          photos: {
            $map: {
              input: "$photos",
              as: "photo",
              in: {
                _id: "$$photo._id",
                s3Key: "$$photo.s3Key",
                thumbnailKey: "$$photo.thumbnailKey",
                isPrimary: "$$photo.isPrimary",
                date_visited: "$$photo.date_visited",
                created_at: "$$photo.created_at",
              },
            },
          },
          date_visited: 1,
          googleMapsLink: 1,
          isPrivate: 1,
          createdAt: 1,
          updatedAt: 1,
          likes: 1,
          likesCount: 1,
          user_id: "$user",
          map_id: "$map",
          tags: 1,
        },
      },
    ]);

    // Generate presigned URLs for photos using the helper
    const poisWithPresignedUrls = await Promise.all(
      pois.map(async (poi) => {
        if (poi.photos && poi.photos.length > 0) {
          const photosWithUrls = await generatePresignedUrlsForPhotos(
            poi.photos
          );
          return {
            ...poi,
            photos: photosWithUrls,
          };
        }
        return poi;
      })
    );

    const total = await POI.aggregate([
      {
        $lookup: {
          from: "poitags",
          localField: "_id",
          foreignField: "poi_id",
          as: "poiTags",
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "poiTags.tag_id",
          foreignField: "_id",
          as: "tags",
        },
      },
      {
        $lookup: {
          from: "tripMaps",
          localField: "map_id",
          foreignField: "_id",
          as: "map",
        },
      },
      {
        $unwind: {
          path: "$map",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { locationName: searchRegex },
                { description: searchRegex },
                { "tags.name": searchRegex },
              ],
            },
            {
              $or: [{ map: { $exists: false } }, { "map.isPrivate": false }],
            },
          ],
        },
      },
      {
        $count: "total",
      },
    ]);

    res.json({
      success: true,
      data: {
        pois: poisWithPresignedUrls,
        pagination: {
          page,
          limit,
          total: total[0]?.total || 0,
          pages: Math.ceil((total[0]?.total || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error searching POIs comprehensively:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search POIs by name
const searchPOIsByName = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const searchRegex = new RegExp(q, "i");
    const pois = await POI.find({
      locationName: searchRegex,
    })
      .populate("user_id", "username")
      .populate("map_id", "mapName isPrivate user_id")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Filter out POIs from private maps (only if they have a map_id)
    const filteredPOIs = pois.filter((poi) => {
      // If POI has no map_id, include it (independent POIs)
      if (!poi.map_id) return true;
      // If POI has a map_id, only include if the map is not private
      return !poi.map_id.isPrivate;
    });

    // Get tags for each POI and add likes count
    const poisWithTags = await Promise.all(
      filteredPOIs.map(async (poi) => {
        const poiTags = await POITag.find({ poi_id: poi._id }).populate(
          "tag_id",
          "name"
        );
        return {
          ...poi.toObject(),
          tags: poiTags.map((pt) => pt.tag_id),
          likesCount: poi.likes ? poi.likes.length : 0,
        };
      })
    );

    const total = await POI.countDocuments({
      locationName: searchRegex,
    });

    res.json({
      success: true,
      data: {
        pois: poisWithTags,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error searching POIs by name:", error);
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
    if (map && map.isPrivate && map.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot like POI from private map",
      });
    }

    // Check if the user has already liked this POI
    const userHasLiked = poi.likes && poi.likes.includes(userId);

    if (userHasLiked) {
      // Unlike the POI - remove user from likes array
      const updatedPOI = await POI.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true }
      ).populate("user_id", "username");

      return res.json({
        success: true,
        data: {
          ...updatedPOI.toObject(),
          likesCount: updatedPOI.likes ? updatedPOI.likes.length : 0,
        },
        message: "POI unliked",
      });
    } else {
      // Like the POI - add user to likes array
      const updatedPOI = await POI.findByIdAndUpdate(
        id,
        { $addToSet: { likes: userId } },
        { new: true }
      ).populate("user_id", "username");

      return res.json({
        success: true,
        data: {
          ...updatedPOI.toObject(),
          likesCount: updatedPOI.likes ? updatedPOI.likes.length : 0,
        },
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
          select: "username",
        },
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

// Get all POIs for a user
const getUserPOIs = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const pois = await POI.find({ user_id: userId })
      .populate("map_id", "mapName")
      .populate("user_id", "username")
      .populate("photos") // Use virtual populate for photos
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get tags and photos for each POI
    const poisWithTagsAndPhotos = await Promise.all(
      pois.map(async (poi) => {
        const poiTags = await POITag.find({ poi_id: poi._id }).populate(
          "tag_id",
          "name"
        );

        // Generate presigned URLs for photos using the helper
        const photosWithUrls =
          poi.photos && Array.isArray(poi.photos)
            ? await generatePresignedUrlsForPhotos(poi.photos)
            : [];

        return {
          ...poi.toObject(),
          tags: poiTags.map((pt) => pt.tag_id),
          photos: photosWithUrls,
          likesCount: poi.likes ? poi.likes.length : 0,
          isLiked: poi.likes && poi.likes.includes(userId),
        };
      })
    );

    const total = await POI.countDocuments({ user_id: userId });

    res.json({
      success: true,
      data: poisWithTagsAndPhotos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user POIs:", error);
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
      // Filter out POIs without maps and only public maps
      {
        $match: {
          map: { $ne: [] }, // POIs must have a map
          "map.isPrivate": false, // Map must be public
        },
      },
      // Unwind the map array
      {
        $unwind: "$map",
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

// Get popular POIs with photos for homepage display
const getPopularPOIs = async (req, res) => {
  try {
    console.log("Fetching popular POIs...");

    // First, let's check what POIs exist
    const totalPOIs = await POI.countDocuments();
    console.log("Total POIs in database:", totalPOIs);

    // Check POIs with maps
    const poisWithMaps = await POI.countDocuments({
      map_id: { $exists: true, $ne: null },
    });
    console.log("POIs with maps:", poisWithMaps);

    // Check POIs with photos
    const poisWithPhotos = await POI.aggregate([
      {
        $lookup: {
          from: "photos",
          localField: "_id",
          foreignField: "poi_id",
          as: "photos",
        },
      },
      {
        $match: {
          photos: { $ne: [] },
        },
      },
      {
        $count: "count",
      },
    ]);
    console.log("POIs with photos:", poisWithPhotos[0]?.count || 0);

    // Fetch POIs from public maps with photos, sorted by likes (descending)
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
      // Join with Photo to get photos
      {
        $lookup: {
          from: "photos",
          localField: "_id",
          foreignField: "poi_id",
          as: "photos",
        },
      },
      // Filter: include POIs with public maps OR POIs without maps
      {
        $match: {
          $or: [
            // POIs with public maps
            {
              map: { $ne: [] },
              "map.isPrivate": false,
            },
            // POIs without maps (standalone POIs)
            {
              map: { $size: 0 },
            },
          ],
        },
      },
      // Add a computed field for likes count
      {
        $addFields: {
          likesCount: { $size: "$likes" },
        },
      },
      // Sort by likes count (descending)
      {
        $sort: { likesCount: -1 },
      },
      // Limit to 6 results
      {
        $limit: 6,
      },
      // Project the fields we want
      {
        $project: {
          _id: 1,
          locationName: 1,
          description: 1,
          likes: 1,
          likesCount: 1,
          photos: {
            $map: {
              input: "$photos",
              as: "photo",
              in: {
                _id: "$$photo._id",
                s3Key: "$$photo.s3Key",
                thumbnailKey: "$$photo.thumbnailKey",
                isPrimary: "$$photo.isPrimary",
                date_visited: "$$photo.date_visited",
                created_at: "$$photo.created_at",
              },
            },
          },
          user_id: { $arrayElemAt: ["$map.user_id", 0] },
          map_id: {
            $cond: {
              if: { $gt: [{ $size: "$map" }, 0] },
              then: {
                _id: { $arrayElemAt: ["$map._id", 0] },
                mapName: { $arrayElemAt: ["$map.mapName", 0] },
              },
              else: null,
            },
          },
        },
      },
    ]);

    console.log("Popular POIs found:", popularPOIs.length);
    console.log("Sample POI:", popularPOIs[0]);

    // Generate presigned URLs for photos using the helper
    const poisWithPresignedUrls = await Promise.all(
      popularPOIs.map(async (poi) => {
        if (poi.photos && poi.photos.length > 0) {
          const photosWithUrls = await generatePresignedUrlsForPhotos(
            poi.photos
          );
          return {
            ...poi,
            photos: photosWithUrls,
          };
        }
        return poi;
      })
    );

    // Populate user information for each POI
    const populatedPOIs = await POI.populate(poisWithPresignedUrls, [
      {
        path: "user_id",
        select: "username",
      },
    ]);

    return res.status(200).json({
      success: true,
      data: populatedPOIs,
    });
  } catch (error) {
    console.error("Error fetching popular POIs:", error);
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
  getUserPOIs,
  searchPOIsByLocation,
  searchPOIsByName,
  searchPOIsComprehensive,
  searchMapsByPOIName,
  getPopularLocations,
  getPopularPOIs,
  togglePOILike,
};
