const mongoose = require("mongoose");
const { Schema } = mongoose;

const poiSchema = new Schema(
  {
    locationName: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
      maxlength: [100, "Location name cannot exceed 100 characters"],
    },

    lat: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Latitude must be between -90 and 90"],
      max: [90, "Latitude must be between -90 and 90"],
    },

    lng: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Longitude must be between -180 and 180"],
      max: [180, "Longitude must be between -180 and 180"],
    },

    date_visited: {
      type: Date,
      default: Date.now,
    },

    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      trim: true,
    },

    googleMapsLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty
          return /^https:\/\/maps\.google\.com\/|^https:\/\/goo\.gl\/maps\/|^https:\/\/www\.google\.com\/maps/.test(
            v
          );
        },
        message: "Please provide a valid Google Maps link",
      },
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    map_id: {
      type: Schema.Types.ObjectId,
      ref: "Map",
      default: null, // Allow POIs without maps
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    views: {
      type: Number,
      default: 0,
    },

    // Metadata
    created_at: {
      type: Date,
      default: Date.now,
    },

    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for better query performance
poiSchema.index({ user_id: 1, created_at: -1 });
poiSchema.index({ locationName: "text" });
poiSchema.index({ lat: 1, lng: 1 });
poiSchema.index({ isPrivate: 1 });

// Virtual for photo count
poiSchema.virtual("photoCount", {
  ref: "Photo",
  localField: "_id",
  foreignField: "poi_id",
  count: true,
});

// Ensure virtuals are serialized
poiSchema.set("toJSON", { virtuals: true });
poiSchema.set("toObject", { virtuals: true });

const POIModel = mongoose.model("POI", poiSchema);

module.exports = POIModel;
