const mongoose = require("mongoose");

const poiTagSchema = new mongoose.Schema({
  poi_id: { type: mongoose.Schema.Types.ObjectId, ref: "POI", required: true },
  tag_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tag", required: true },
});

module.exports = mongoose.model("POITag", poiTagSchema);