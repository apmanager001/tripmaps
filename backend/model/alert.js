const mongoose = require("mongoose");
const { Schema } = mongoose;

const alertSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["follow", "comment", "like", "poi_like", "map_like"],
    required: true,
  },
  triggeredBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: false, // Optional for follow alerts
  },
  targetType: {
    type: String,
    enum: ["map", "poi", "comment", null],
    default: null,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
alertSchema.index({ user_id: 1, createdAt: -1 });
alertSchema.index({ user_id: 1, isRead: 1 });

const AlertModel = mongoose.model("Alert", alertSchema);

module.exports = AlertModel;
