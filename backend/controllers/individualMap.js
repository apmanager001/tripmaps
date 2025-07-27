const Map = require("../model/tripMaps.js");
const POI = require("../model/poi.js");

const getIndividualMap = async (req, res) => {
  const mapId = req.params.id;

  try {
    const map = await Map.findById(mapId).populate("user_id", "username email");

    if (!map) {
      return res.status(404).json({ error: "Map not found" });
    }

    // Get POIs for this map
    const pois = await POI.find({ map_id: mapId });

    res.status(200).json({
      map,
      pois,
    });
  } catch (error) {
    console.error("Error fetching map:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getIndividualMap,
};
