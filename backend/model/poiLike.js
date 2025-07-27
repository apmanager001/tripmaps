const mongoose = require("mongoose");

const poiLikeSchema = new mongoose.Schema(
  {
    poi_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "POI",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    // Ensure a user can only like a POI once
    indexes: [{ poi_id: 1, user_id: 1, unique: true }],
  }
);

module.exports = mongoose.model("POILike", poiLikeSchema);
