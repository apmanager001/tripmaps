const mongoose = require("mongoose");

const flagSchema = new mongoose.Schema(
  {
    // Photo being flagged
    photoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      required: true,
    },

    // User who flagged the photo
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User who owns the photo
    photoOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // POI the photo belongs to
    poiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "POI",
      required: true,
    },

    // Map the POI belongs to
    mapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Map",
      required: true,
    },

    // Flag reason (optional)
    reason: {
      type: String,
      enum: ["inappropriate", "copyright", "spam", "other"],
      default: "other",
    },

    // Additional details
    details: {
      type: String,
      maxlength: 500,
    },

    // Flag status
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },

    // Admin notes
    adminNotes: {
      type: String,
      maxlength: 1000,
    },

    // Reviewed by admin
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Review date
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
flagSchema.index({ photoId: 1, flaggedBy: 1 }, { unique: true }); // Prevent duplicate flags from same user
flagSchema.index({ status: 1, createdAt: -1 }); // For admin dashboard
flagSchema.index({ photoOwner: 1 }); // For user's flagged photos

module.exports = mongoose.model("Flag", flagSchema);
