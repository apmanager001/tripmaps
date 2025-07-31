const mongoose = require("mongoose");
const { Schema } = mongoose;

const photoSchema = new Schema(
  {
    poi_id: {
      type: Schema.Types.ObjectId,
      ref: "POI",
      required: [true, "POI ID is required"],
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    // S3 file information
    s3Key: {
      type: String,
      required: [true, "S3 key is required"],
      unique: true,
    },

    thumbnailKey: {
      type: String,
      required: false, // Make it optional for existing photos
    },

    s3Bucket: {
      type: String,
      required: [true, "S3 bucket is required"],
    },

    s3Url: {
      type: String,
      required: [true, "S3 URL is required"],
    },

    // Image metadata
    originalFileName: {
      type: String,
      required: [true, "Original file name is required"],
    },

    fileSize: {
      type: Number,
      required: [true, "File size is required"],
      max: [10 * 1024 * 1024, "File size cannot exceed 10MB"], // 10MB limit
    },

    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      enum: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    },

    // Image dimensions (preserved from original)
    width: {
      type: Number,
      required: [true, "Image width is required"],
    },

    height: {
      type: Number,
      required: [true, "Image height is required"],
    },

    // Quality settings
    quality: {
      type: Number,
      default: 80, // JPEG quality (0-100)
      min: [10, "Quality must be at least 10"],
      max: [100, "Quality cannot exceed 100"],
    },

    // EXIF data (if available)
    exifData: {
      gps: {
        latitude: Number,
        longitude: Number,
      },
      dateTaken: Date,
      camera: String,
      settings: {
        iso: Number,
        aperture: Number,
        shutterSpeed: String,
      },
    },

    // Photo-specific date information
    date_visited: {
      type: Date,
      required: [true, "Date visited is required"],
    },

    // Removed cropData - no longer using cropping

    // Status
    isProcessed: {
      type: Boolean,
      default: false,
    },

    isPrimary: {
      type: Boolean,
      default: false, // Primary photo for the POI
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
photoSchema.index({ poi_id: 1, created_at: -1 });
photoSchema.index({ user_id: 1, created_at: -1 });
photoSchema.index({ s3Key: 1 }, { unique: true });
photoSchema.index({ isPrimary: 1, poi_id: 1 });

// Ensure only one primary photo per POI
photoSchema.index(
  { poi_id: 1, isPrimary: 1 },
  {
    unique: true,
    partialFilterExpression: { isPrimary: true },
  }
);

// Pre-save middleware to handle primary photo logic
photoSchema.pre("save", async function (next) {
  if (this.isPrimary && this.isModified("isPrimary")) {
    // Remove primary status from other photos of the same POI
    await this.constructor.updateMany(
      { poi_id: this.poi_id, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

// Virtual for full S3 URL
photoSchema.virtual("fullUrl").get(function () {
  return this.s3Url || null;
});

// Virtual for thumbnail URL (you can implement different sizes)
photoSchema.virtual("thumbnailUrl").get(function () {
  // You can implement different thumbnail sizes here
  if (!this.s3Url) return null;

  // If it's a presigned URL, return the same URL for now
  if (
    this.s3Url.includes("X-Amz-Signature") ||
    this.s3Url.includes("X-Amz-Credential")
  ) {
    return this.s3Url;
  }

  // Otherwise, try to replace the path for thumbnail
  try {
    return this.s3Url.replace("/original/", "/thumbnail/");
  } catch (error) {
    return this.s3Url; // Fallback to original URL
  }
});

// Ensure virtuals are serialized
photoSchema.set("toJSON", { virtuals: true });
photoSchema.set("toObject", { virtuals: true });

const PhotoModel = mongoose.model("Photo", photoSchema);

module.exports = PhotoModel;
