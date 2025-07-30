const AWS = require("aws-sdk");
const sharp = require("sharp");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// Configure AWS SDK for Cloudflare R2 (Profile Pictures)
AWS.config.update({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: "auto", // R2 uses 'auto' as the region
  endpoint:
    process.env.R2_PROFILE_ENDPOINT ||
    "https://57504fc5bc651800ba47b85ed3c810bf.r2.cloudflarestorage.com",
  s3ForcePathStyle: true, // Use path-style URLs for R2 to avoid bucket name duplication
  signatureVersion: "v4",
});

const s3 = new AWS.S3();

// Profile picture bucket configuration - use the same bucket as POI photos
const PROFILE_BUCKET_NAME = process.env.R2_BUCKET_NAME || "tripmap-photos"; // Use same bucket as POI photos

// Profile picture dimensions
const PROFILE_PICTURE_SIZE = 400; // Square profile picture
const PROFILE_THUMBNAIL_SIZE = 150; // Smaller thumbnail for lists

// Custom storage for multer to work with R2
const customStorage = multer.memoryStorage();

// Configure multer for profile picture upload
const upload = multer({
  storage: customStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Process profile picture (square crop and resize)
const processProfilePicture = async (imageBuffer) => {
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();

    // Calculate optimal quality based on image size
    let quality = 80; // Default quality for profile pictures
    if (metadata.width > 2000 || metadata.height > 2000) {
      quality = 70; // Lower quality for very large images
    }

    // Process image to square format
    const processedBuffer = await sharp(imageBuffer)
      .resize(PROFILE_PICTURE_SIZE, PROFILE_PICTURE_SIZE, {
        fit: "cover", // Crop to square
        position: "center", // Center the crop
      })
      .jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error("Error processing profile picture:", error);
    throw new Error("Failed to process profile picture");
  }
};

// Create profile picture thumbnail
const createProfileThumbnail = async (imageBuffer) => {
  try {
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(PROFILE_THUMBNAIL_SIZE, PROFILE_THUMBNAIL_SIZE, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 70, // Lower quality for thumbnails
        progressive: true,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();

    return thumbnailBuffer;
  } catch (error) {
    console.error("Error creating profile thumbnail:", error);
    throw new Error("Failed to create profile thumbnail");
  }
};

// Upload profile picture to R2
const uploadProfilePicture = async (
  imageBuffer,
  fileName,
  folder = "profiles"
) => {
  try {
    // Use the correct key structure for the profile bucket
    const key = `${folder}/${fileName}`;

    const uploadParams = {
      Bucket: PROFILE_BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read",
      Metadata: {
        "processed-at": new Date().toISOString(),
      },
    };

    const result = await s3.upload(uploadParams).promise();

    return {
      s3Key: key,
      s3Url: result.Location,
      s3Bucket: PROFILE_BUCKET_NAME,
    };
  } catch (error) {
    console.error("Error uploading profile picture to R2:", error);
    throw new Error("Failed to upload profile picture to R2");
  }
};

// Delete profile picture from R2
const deleteProfilePicture = async (s3Key) => {
  try {
    // Validate s3Key
    if (!s3Key) {
      console.warn(
        "Attempted to delete profile picture with null/undefined s3Key:",
        s3Key
      );
      return true; // Return success to avoid breaking the deletion process
    }

    const deleteParams = {
      Bucket: PROFILE_BUCKET_NAME,
      Key: s3Key,
    };

    await s3.deleteObject(deleteParams).promise();
    return true;
  } catch (error) {
    console.error(
      `Error deleting profile picture from R2 for key ${s3Key}:`,
      error
    );
    throw new Error(
      `Failed to delete profile picture from R2: ${error.message}`
    );
  }
};

// Generate unique filename for profile pictures
const generateProfileFileName = (originalName, prefix = "") => {
  const timestamp = Date.now();
  const uuid = uuidv4();

  // Handle file extension properly
  let extension = "jpg"; // Default to jpg for processed images
  if (originalName && originalName.includes(".")) {
    const parts = originalName.split(".");
    if (parts.length > 1) {
      extension = parts[parts.length - 1].toLowerCase();
      // Ensure it's a valid image extension
      if (!["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
        extension = "jpg";
      }
    }
  }

  return `${prefix}${timestamp}-${uuid}.${extension}`;
};

// Generate presigned URL for profile picture access
const generateProfilePresignedUrl = async (s3Key) => {
  try {
    const presignedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: PROFILE_BUCKET_NAME,
      Key: s3Key,
      Expires: 3600, // 1 hour
    });

    return presignedUrl;
  } catch (error) {
    console.error("Error generating profile picture presigned URL:", error);
    return null;
  }
};

module.exports = {
  upload,
  processProfilePicture,
  createProfileThumbnail,
  uploadProfilePicture,
  deleteProfilePicture,
  generateProfileFileName,
  generateProfilePresignedUrl,
  PROFILE_PICTURE_SIZE,
  PROFILE_THUMBNAIL_SIZE,
};
