const mongoose = require("mongoose");
const { Schema } = mongoose;

const mapSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mapName: String,
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Map", mapSchema);