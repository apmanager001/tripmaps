const User = require("../model/user.js");
const Map = require("../model/tripMaps.js");
const Friend = require("../model/friends.js");
const crypto = require("crypto");

const dashboardGet = async (req, res) => {
  try {
    const userId = req.user._id; // Use _id from JWT payload
    const requestedId = req.params.id;

    if (requestedId !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    const user = await User.findById(userId).select(
      "email username role createdDate bio"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's maps using the new model structure
    const userMaps = await Map.find({ user_id: userId }).select(
      "_id mapName isPrivate likes views createdAt"
    );

    // Get friends using the new model structure
    const friends = await Friend.find({ following_user_id: userId }).populate(
      "followed_user_id",
      "username email bio"
    );

    res.status(200).json({
      user,
      maps: userMaps,
      friends: friends.map((f) => f.followed_user_id),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

const postNewMap = async (req, res) => {
  const { coordArray, mapName, isPrivate = false } = req.body;
  const userId = req.user._id; // Use _id from JWT payload

  try {
    // Create a single map with the new structure
    const newMap = new Map({
      user_id: userId,
      mapName,
      isPrivate,
    });

    const savedMap = await newMap.save();

    // If you need to create POIs for each coordinate, you would do that here
    // using the POI model, but for now we'll just return the map

    res.status(201).json(savedMap);
  } catch (error) {
    console.error("Error saving map:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllMaps = async (req, res) => {
  const userId = req.params.id;

  try {
    // Query the database to find all maps for the given userId
    const maps = await Map.find({ user_id: userId });

    res.status(200).json(maps);
  } catch (error) {
    console.error("Error fetching maps:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const togglePrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const map = await Map.findById(id);

    if (!map) {
      return res.status(404).json({ error: "Map not found" });
    }

    // Check if user owns this map
    if (map.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this map" });
    }

    // Toggle privacy
    map.isPrivate = !map.isPrivate;
    await map.save();

    res.status(200).json({
      success: true,
      isPrivate: map.isPrivate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  dashboardGet,
  postNewMap,
  getAllMaps,
  togglePrivacy,
};
