const mongoose = require("mongoose");

const mapLikeSchema = new mongoose.Schema(
  {
    map_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Map",
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
    // Ensure a user can only like a map once
    indexes: [{ map_id: 1, user_id: 1, unique: true }],
  }
);

module.exports = mongoose.model("MapLike", mapLikeSchema);
