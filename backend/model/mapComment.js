const mongoose = require("mongoose");

const mapCommentSchema = new mongoose.Schema(
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
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MapComment", mapCommentSchema);
