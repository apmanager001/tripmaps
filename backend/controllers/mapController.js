const Map = require("../model/tripMaps");
const POI = require("../model/poi");
const Bookmark = require("../model/bookmark");
const MapComment = require("../model/mapComment");
const MapLike = require("../model/mapLike");
const POILike = require("../model/poiLike");
const POITag = require("../model/poiTag");
const Tag = require("../model/tag");
const User = require("../model/user");
const Photo = require("../model/photo");
const Flag = require("../model/flag");
const { deleteImage } = require("../services/s3Service");
const mongoose = require("mongoose");
const { createLikeAlert } = require("./alertController");
const { generatePresignedUrlsForPhotos } = require("../helpers/photoHelpers");

// Helper function to create a new POI
const createNewPOI = async (coord, mapId, userId) => {
  const poi = new POI({
    map_id: mapId,
    user_id: userId,
    lat: coord.lat,
    lng: coord.lng,
    locationName: coord.name || coord.locationName || null,
    description: coord.description || "",
    googleMapsLink: coord.googleMapsLink || "",
    isPrivate: coord.isPrivate || false,
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
};

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

    // Create or link POIs for each coordinate
    const poiPromises = coordArray.map(async (coord, index) => {
      let savedPOI;

      // Check if this is an existing POI (has poi_id and isExistingPOI flag)
      if (coord.poi_id && coord.isExistingPOI) {
        // This is a reference to an existing POI - just link it to the map
        const existingPOI = await POI.findById(coord.poi_id);

        if (existingPOI) {
          // Update the existing POI to link it to this map
          savedPOI = await POI.findByIdAndUpdate(
            coord.poi_id,
            { map_id: savedMap._id },
            { new: true }
          );
          console.log(
            `Linked existing POI ${coord.poi_id} to map ${savedMap._id}`
          );
        } else {
          console.log(`Existing POI ${coord.poi_id} not found, skipping`);
          return null;
        }
      } else {
        // Create a new POI (has coordinates and other data)
        savedPOI = await createNewPOI(coord, savedMap._id, userId);
      }

      return savedPOI;
    });

    const poiResults = await Promise.all(poiPromises);
    const validPOIs = poiResults.filter((poi) => poi !== null);

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

    // Get POIs for this map with photos and tags
    const pois = await POI.find({ map_id: id }).sort({ createdAt: 1 });

    // Get photos and tags for each POI, and generate presigned URLs
    const poisWithPhotosAndTags = await Promise.all(
      pois.map(async (poi) => {
        // Get photos for this POI
        const PhotoModel = require("../model/photo");

        // Try different approaches to find photos
        let photos = await PhotoModel.find({ poi_id: poi._id })
          .sort({ isPrimary: -1, createdAt: -1 })
          .select(
            "s3Key thumbnailKey isPrimary created_at date_visited user_id"
          );

        // If no photos found, try with string ID
        if (photos.length === 0) {
          photos = await PhotoModel.find({ poi_id: poi._id.toString() })
            .sort({ isPrimary: -1, createdAt: -1 })
            .select(
              "s3Key thumbnailKey isPrimary created_at date_visited user_id"
            );
        }

        // Generate presigned URLs for photos using the helper
        const photosWithUrls = await generatePresignedUrlsForPhotos(photos);

        // Get tags for this POI
        const poiTags = await POITag.find({ poi_id: poi._id }).populate(
          "tag_id",
          "name"
        );

        const result = {
          ...poi.toObject(),
          photos: photosWithUrls,
          tags: poiTags.map((pt) => pt.tag_id),
          likesCount: poi.likes ? poi.likes.length : 0,
        };

        return result;
      })
    );

    // Check POI likes for current user
    let poisWithLikes = poisWithPhotosAndTags;
    if (userId) {
      const poiLikes = await POILike.find({
        poi_id: { $in: pois.map((p) => p._id) },
        user_id: userId,
      });
      const likedPoiIds = poiLikes.map((like) => like.poi_id.toString());

      poisWithLikes = poisWithPhotosAndTags.map((poi) => ({
        ...poi,
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

    // First, try to find the user by ID or username
    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      // If it's a valid ObjectId, search by _id
      user = await User.findById(userId);
    } else {
      // If it's not a valid ObjectId, search by username
      user = await User.findOne({ username: userId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build query - show private maps only to owner
    const query = { user_id: user._id };
    if (!currentUserId || currentUserId.toString() !== user._id.toString()) {
      query.isPrivate = false;
    }

    const maps = await Map.find(query)
      .populate("user_id", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Populate POIs with photos for each map and add total counts
    const mapsWithPOIs = await Promise.all(
      maps.map(async (map) => {
        const pois = await POI.find({ map_id: map._id })
          .populate({
            path: "photos",
            options: { sort: { isPrimary: -1, created_at: 1 } },
          })
          .limit(4); // Limit to 4 POIs for thumbnail display

        // Generate presigned URLs for photos in each POI
        const poisWithPresignedUrls = await Promise.all(
          pois.map(async (poi) => {
            if (poi.photos && poi.photos.length > 0) {
              const photosWithUrls = await generatePresignedUrlsForPhotos(
                poi.photos
              );
              return {
                ...poi.toObject(),
                photos: photosWithUrls,
              };
            }
            return poi.toObject();
          })
        );

        // Calculate total POI and photo count for this map
        const totalPOICount = await POI.countDocuments({ map_id: map._id });
        const poiIds = await POI.find({ map_id: map._id }).distinct("_id");
        const totalPhotoCount =
          poiIds.length > 0
            ? await Photo.countDocuments({ poi_id: { $in: poiIds } })
            : 0;

        return {
          ...map.toObject(),
          pois: poisWithPresignedUrls,
          totalPOICount,
          totalPhotoCount,
        };
      })
    );

    // Check bookmark status for current user
    let mapsWithBookmarks = mapsWithPOIs;
    if (currentUserId) {
      const bookmarks = await Bookmark.find({
        user_id: currentUserId,
        map_id: { $in: maps.map((m) => m._id) },
      });
      const bookmarkedMapIds = bookmarks.map((b) => b.map_id.toString());

      mapsWithBookmarks = mapsWithPOIs.map((map) => ({
        ...map,
        isBookmarked: bookmarkedMapIds.includes(map._id.toString()),
      }));
    } else {
      mapsWithBookmarks = mapsWithPOIs.map((map) => ({
        ...map,
        isBookmarked: false,
      }));
    }

    const total = await Map.countDocuments(query);

    res.json({
      success: true,
      data: {
        maps: mapsWithBookmarks,
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

    // Find POIs belonging to the map so we can delete related POI-level data
    const pois = await POI.find({ map_id: id }).select("_id");
    const poiIds = pois.map((p) => p._id);

    // Delete map and all related records. We delete POIs themselves (not preserve),
    // and remove any records tied to those POIs (likes, photos, tags), as well as
    // flags that reference the map or any of the POIs.

    // First, delete S3 objects for photos belonging to these POIs (if any).
    if (poiIds.length > 0) {
      try {
        const photos = await Photo.find({ poi_id: { $in: poiIds } }).select(
          "s3Key thumbnailKey"
        );

        const deletePromises = [];
        photos.forEach((p) => {
          if (p.s3Key) {
            deletePromises.push(
              deleteImage(p.s3Key).catch((err) => {
                console.error("Failed to delete S3 key:", p.s3Key, err);
                return null; // swallow error so other deletes continue
              })
            );
          }
          if (p.thumbnailKey) {
            deletePromises.push(
              deleteImage(p.thumbnailKey).catch((err) => {
                console.error(
                  "Failed to delete thumbnail key:",
                  p.thumbnailKey,
                  err
                );
                return null;
              })
            );
          }
        });

        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
      } catch (s3Err) {
        // Log and continue with DB deletions; don't block map deletion on S3 errors
        console.error("Error deleting S3 images for map delete:", s3Err);
      }
    }

    await Promise.all([
      // Delete the map itself
      Map.findByIdAndDelete(id),
      // Delete map likes
      MapLike.deleteMany({ map_id: id }),
      // Delete map bookmarks
      Bookmark.deleteMany({ map_id: id }),
      // Delete map comments
      MapComment.deleteMany({ map_id: id }),
      // Delete POI likes for POIs on this map
      POILike.deleteMany({ poi_id: { $in: poiIds } }),
      // Delete photos that belong to POIs on this map (DB docs)
      Photo.deleteMany({ poi_id: { $in: poiIds } }),
      // Delete POI-Tag relationships for these POIs
      POITag.deleteMany({ poi_id: { $in: poiIds } }),
      // Delete the POIs themselves
      POI.deleteMany({ map_id: id }),
      // Delete flags that reference the map or the POIs
      Flag.deleteMany({ $or: [{ mapId: id }, { poiId: { $in: poiIds } }] }),
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
    const currentUserId = req.user?._id;

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

    // Check bookmark status for current user
    let mapsWithBookmarks = maps;
    if (currentUserId) {
      const bookmarks = await Bookmark.find({
        user_id: currentUserId,
        map_id: { $in: maps.map((m) => m._id) },
      });
      const bookmarkedMapIds = bookmarks.map((b) => b.map_id.toString());

      mapsWithBookmarks = maps.map((map) => ({
        ...map.toObject(),
        isBookmarked: bookmarkedMapIds.includes(map._id.toString()),
      }));
    } else {
      mapsWithBookmarks = maps.map((map) => ({
        ...map.toObject(),
        isBookmarked: false,
      }));
    }

    const total = await Map.countDocuments({
      mapName: searchRegex,
      isPrivate: false,
    });

    res.json({
      success: true,
      data: {
        maps: mapsWithBookmarks,
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
    const currentUserId = req.user?._id;

    // Fetch public maps sorted by likes (descending) and limit to 6
    const popularMaps = await Map.find({ isPrivate: false })
      .populate("user_id", "username email")
      .sort({ likes: -1 })
      .limit(6);

    // Populate POIs with photos for each map
    const mapsWithPOIs = await Promise.all(
      popularMaps.map(async (map) => {
        // Get total POI count for this map
        const totalPOICount = await POI.countDocuments({ map_id: map._id });

        // Get total photo count for this map by counting photos in Photo collection
        const Photo = require("../model/photo");
        const poiIds = await POI.find({ map_id: map._id }).distinct("_id");
        const totalPhotoCount =
          poiIds.length > 0
            ? await Photo.countDocuments({
                poi_id: { $in: poiIds },
              })
            : 0;

        const pois = await POI.find({ map_id: map._id })
          .populate({
            path: "photos",
            options: { sort: { isPrimary: -1, created_at: 1 } },
          })
          .limit(4); // Limit to 4 POIs for thumbnail display

        // Generate presigned URLs for photos in each POI
        const poisWithPresignedUrls = await Promise.all(
          pois.map(async (poi) => {
            if (poi.photos && poi.photos.length > 0) {
              const photosWithUrls = await generatePresignedUrlsForPhotos(
                poi.photos
              );
              return {
                ...poi.toObject(),
                photos: photosWithUrls,
              };
            }
            return poi.toObject();
          })
        );

        return {
          ...map.toObject(),
          pois: poisWithPresignedUrls,
          totalPOICount,
          totalPhotoCount,
        };
      })
    );

    // Check bookmark status for current user
    let mapsWithBookmarks = mapsWithPOIs;
    if (currentUserId) {
      const bookmarks = await Bookmark.find({
        user_id: currentUserId,
        map_id: { $in: popularMaps.map((m) => m._id) },
      });
      const bookmarkedMapIds = bookmarks.map((b) => b.map_id.toString());

      mapsWithBookmarks = mapsWithPOIs.map((map) => ({
        ...map,
        isBookmarked: bookmarkedMapIds.includes(map._id.toString()),
      }));
    } else {
      mapsWithBookmarks = mapsWithPOIs.map((map) => ({
        ...map,
        isBookmarked: false,
      }));
    }

    return res.json({
      success: true,
      data: mapsWithBookmarks,
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

      // Create like alert
      try {
        await createLikeAlert(id, "map", userId);
      } catch (alertError) {
        console.error("Error creating map like alert:", alertError);
        // Don't fail the request if alert creation fails
      }

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
