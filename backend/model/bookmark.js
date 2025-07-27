const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  map_id: { type: mongoose.Schema.Types.ObjectId, ref: "Map" },
});

module.exports = mongoose.model("Bookmark", bookmarkSchema);