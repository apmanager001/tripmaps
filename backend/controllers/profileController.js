const User = require("../model/user.js");
const Map = require("../model/tripMaps.js");

const profileGet = async (req, res) => {
  try {
    const username = req.params.id;
    // Find user by username
    const user = await User.findOne({ username }).select(
      "username email bio createdDate role"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find maps that belong to the user and are public
    const publicMaps = await Map.find({
      user_id: user._id,
      isPrivate: false,
    }).select("_id mapName likes views createdAt");

    res.status(200).json({
      user,
      maps: publicMaps,
    });
  } catch (error) {
    console.error("Error in profileGet:", error);
    res.status(500).json({ message: "Failed to fetch profile data" });
  }
};

module.exports = {
  profileGet,
};
