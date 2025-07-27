const mongoose = require("mongoose");


const poiSchema = new mongoose.Schema(
  {
    map_id: { type: mongoose.Schema.Types.ObjectId, ref: "Map", index: true },
    lat: Number,
    lng: Number,
    locationName: String,
    date_visited: Date,
    likes: { type: Number, default: 0 },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("POI", poiSchema);