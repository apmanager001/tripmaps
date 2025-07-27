const mongoose = require("mongoose");

const editHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target_type: { type: String, enum: ["map", "poi"], required: true },
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    change_summary: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("EditHistory", editHistorySchema);