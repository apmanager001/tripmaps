const Photo = require("../model/photo");
const POI = require("../model/poi");
const sharp = require("sharp");
const {
  upload,
  processImage,
  createThumbnail,
  uploadProcessedImage,
  deleteImage,
  extractExifData,
  generateFileName,
} = require("../services/s3Service");

// Upload photo to POI
const uploadPhoto = async (req, res) => {
  try {
    const { poiId } = req.params;
    const { isPrimary = false, date_visited } = req.body;
    const userId = req.user._id;

    // Check if POI exists and user has permission
    const poi = await POI.findById(poiId);
    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI not found",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please select an image to upload.",
      });
    }

    const file = req.file;

    // Validate file size (additional check)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${Math.round(
          maxSize / 1024 / 1024
        )}MB. Your file is ${
          Math.round((file.size / 1024 / 1024) * 100) / 100
        }MB.`,
      });
    }

    // Validate file type
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only image files are allowed.",
      });
    }

    try {
      // Extract EXIF data
      const exifData = await extractExifData(file.buffer);

      // Process image (no cropping - preserving aspect ratio)
      const processedBuffer = await processImage(file.buffer);

      // Create thumbnail
      const thumbnailBuffer = await createThumbnail(processedBuffer);

      // Generate filenames with proper extensions
      const originalName = file.originalname || `photo-${Date.now()}.jpg`;
      const processedFileName = generateFileName(originalName, "processed-");
      const thumbnailFileName = generateFileName(originalName, "thumb-");

      // Upload processed image
      const processedUpload = await uploadProcessedImage(
        processedBuffer,
        processedFileName,
        "processed"
      );

      // Upload thumbnail
      const thumbnailUpload = await uploadProcessedImage(
        thumbnailBuffer,
        thumbnailFileName,
        "thumbnails"
      );

      // Determine date_visited: prioritize provided date, then EXIF date, then current date
      let photoDateVisited = new Date();
      if (date_visited) {
        photoDateVisited = new Date(date_visited);
      } else if (exifData && exifData.dateTaken) {
        photoDateVisited = new Date(exifData.dateTaken);
      }

      // Get actual image dimensions from processed image
      const processedImageMetadata = await sharp(processedBuffer).metadata();

      // Create photo record
      const photoData = {
        poi_id: poiId,
        user_id: userId,
        s3Key: processedUpload.s3Key,
        thumbnailKey: thumbnailUpload.s3Key,
        s3Bucket: processedUpload.s3Bucket,
        s3Url: processedUpload.s3Url,
        originalFileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: processedImageMetadata.width,
        height: processedImageMetadata.height,
        quality: 70, // Updated quality
        exifData,
        date_visited: photoDateVisited,
        isProcessed: true,
        isPrimary,
      };

      const photo = new Photo(photoData);
      await photo.save();

      // Update POI with photo count
      await POI.findByIdAndUpdate(poiId, { $inc: { photoCount: 1 } });

      res.json({
        success: true,
        data: {
          photo: {
            _id: photo._id,
            s3Url: photo.s3Url,
            thumbnailUrl: thumbnailUpload.s3Url,
            isPrimary: photo.isPrimary,
            date_visited: photo.date_visited,
            uploadedBy: userId,
            uploadedAt: photo.created_at,
          },
        },
        message: "Photo uploaded successfully",
      });
    } catch (processingError) {
      console.error("Error processing or uploading image:", processingError);
      return res.status(500).json({
        success: false,
        message:
          "Failed to process or upload image. Please try again with a smaller or different image.",
        error: processingError.message,
      });
    }
  } catch (error) {
    console.error("Error in uploadPhoto:", error);

    // Handle specific multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "File too large. Maximum size is 5MB. Please compress your image or choose a smaller file.",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message:
          "Unexpected file field. Please ensure you're uploading an image file.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
      error: error.message,
    });
  }
};

// Get photos for a POI
const getPOIPhotos = async (req, res) => {
  try {
    const { poiId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    // Check if POI exists
    const poi = await POI.findById(poiId);
    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI not found",
      });
    }

    // Get photos with pagination
    const photos = await Photo.find({ poi_id: poiId })
      .populate("user_id", "username")
      .sort({ isPrimary: -1, created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Photo.countDocuments({ poi_id: poiId });

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting POI photos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get photos",
    });
  }
};

// Set primary photo
const setPrimaryPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user._id;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    // Check if user owns the POI or the photo
    const poi = await POI.findById(photo.poi_id);
    if (
      !poi ||
      (poi.user_id.toString() !== userId.toString() &&
        photo.user_id.toString() !== userId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this photo",
      });
    }

    // Set as primary (the pre-save middleware will handle removing other primary photos)
    photo.isPrimary = true;
    await photo.save();

    res.json({
      success: true,
      message: "Primary photo updated successfully",
    });
  } catch (error) {
    console.error("Error setting primary photo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set primary photo",
    });
  }
};

// Delete photo
const deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user._id;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    // Check if user owns the photo (only photo uploader can delete)
    if (photo.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to delete this photo. Only the photo uploader can delete their photos.",
      });
    }

    console.log("Deleting photo:", {
      photoId: photo._id,
      s3Key: photo.s3Key,
      thumbnailKey: photo.thumbnailKey,
      hasThumbnail: !!photo.thumbnailKey,
    });

    // Delete from S3 - both main image and thumbnail (if thumbnail exists)
    const deletePromises = [deleteImage(photo.s3Key)];

    // Only delete thumbnail if it exists
    if (photo.thumbnailKey) {
      deletePromises.push(deleteImage(photo.thumbnailKey));
    }

    await Promise.all(deletePromises);

    // Delete photo record
    await Photo.findByIdAndDelete(photoId);

    // Update POI photo count
    await POI.findByIdAndUpdate(photo.poi_id, { $inc: { photoCount: -1 } });

    res.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete photo",
    });
  }
};

// Get user's photos
const getUserPhotos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const photos = await Photo.find({ user_id: userId })
      .populate("poi_id", "locationName lat lng")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Photo.countDocuments({ user_id: userId });

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting user photos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user photos",
    });
  }
};

// Update photo (crop, etc.)
const updatePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { cropData } = req.body;
    const userId = req.user._id;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    // Check if user owns the POI or the photo
    const poi = await POI.findById(photo.poi_id);
    if (
      !poi ||
      (poi.user_id.toString() !== userId.toString() &&
        photo.user_id.toString() !== userId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this photo",
      });
    }

    // Update crop data
    if (cropData) {
      photo.cropData = cropData;
      await photo.save();
    }

    res.json({
      success: true,
      message: "Photo updated successfully",
    });
  } catch (error) {
    console.error("Error updating photo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update photo",
    });
  }
};

module.exports = {
  uploadPhoto,
  getPOIPhotos,
  setPrimaryPhoto,
  deletePhoto,
  getUserPhotos,
  updatePhoto,
};
