const AWS = require("aws-sdk");
const sharp = require("sharp");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// Configure AWS SDK for Cloudflare R2
AWS.config.update({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: "auto", // R2 uses 'auto' as the region
  endpoint: process.env.R2_ENDPOINT, // Fixed endpoint format
  s3ForcePathStyle: true, // Required for R2
  signatureVersion: "v4",
});

// Debug: Check if R2 credentials are loaded
console.log("R2 Configuration:");
console.log(
  "- Access Key ID:",
  process.env.R2_ACCESS_KEY_ID ? "Set" : "Missing"
);
console.log(
  "- Secret Access Key:",
  process.env.R2_SECRET_ACCESS_KEY ? "Set" : "Missing"
);
console.log("- Bucket Name:", process.env.R2_BUCKET_NAME ? "Set" : "Missing");
console.log("- Endpoint:", process.env.R2_ENDPOINT ? "Set" : "Missing");

const s3 = new AWS.S3();

// R2 bucket configuration
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const BUCKET_REGION = "auto"; // R2 uses 'auto' region

// Universal image dimensions
const UNIVERSAL_WIDTH = 800;
const UNIVERSAL_HEIGHT = 600;
const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 150;

// Custom storage for multer to work with R2
const customStorage = multer.memoryStorage();

// Configure multer for R2 upload
const upload = multer({
  storage: customStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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

// Process image while preserving aspect ratio
const processImage = async (imageBuffer, cropData = null) => {
  try {
    let processedImage = sharp(imageBuffer);

    // Get image metadata to determine optimal compression and sizing
    const metadata = await sharp(imageBuffer).metadata();

    // Calculate optimal quality based on image size
    let quality = 70; // Default quality
    if (metadata.width > 2000 || metadata.height > 2000) {
      quality = 60; // Lower quality for very large images
    } else if (metadata.width > 1000 || metadata.height > 1000) {
      quality = 65; // Medium quality for large images
    }

    // Only resize if the image is very large (for performance)
    // Keep aspect ratio intact and don't force specific dimensions
    const maxDimension = 2048; // Maximum width or height
    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      processedImage = processedImage.resize(maxDimension, maxDimension, {
        fit: "inside", // Preserve aspect ratio, don't crop
        withoutEnlargement: true, // Don't enlarge small images
      });
    }

    // Convert to JPEG with optimized compression
    const processedBuffer = await processedImage
      .jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true, // Use mozjpeg for better compression
        chromaSubsampling: "4:2:0", // Better compression for photos
      })
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
};

// Create thumbnail with better compression
const createThumbnail = async (imageBuffer) => {
  try {
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 50, // Lower quality for thumbnails
        progressive: true,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();

    return thumbnailBuffer;
  } catch (error) {
    console.error("Error creating thumbnail:", error);
    throw new Error("Failed to create thumbnail");
  }
};

// Upload processed image to R2
const uploadProcessedImage = async (
  imageBuffer,
  fileName,
  folder = "processed"
) => {
  try {
    // Use the correct key structure that matches the actual file storage
    const key = `tripmap-photos/poi-photos/${folder}/${fileName}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read",
      Metadata: {
        "processed-at": new Date().toISOString(),
      },
    };

    const result = await s3.upload(uploadParams).promise();

    // Return the correct URL structure
    return {
      s3Key: key,
      s3Url: result.Location,
      s3Bucket: BUCKET_NAME,
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload image to R2");
  }
};

// Delete image from R2
const deleteImage = async (s3Key) => {
  try {
    // Validate s3Key
    if (!s3Key) {
      console.warn(
        "Attempted to delete image with null/undefined s3Key:",
        s3Key
      );
      return true; // Return success to avoid breaking the deletion process
    }

    console.log(`Attempting to delete from R2: ${s3Key}`);
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
    };

    await s3.deleteObject(deleteParams).promise();
    console.log(`Successfully deleted from R2: ${s3Key}`);
    return true;
  } catch (error) {
    console.error(`Error deleting from R2 for key ${s3Key}:`, error);
    throw new Error(`Failed to delete image from R2: ${error.message}`);
  }
};

// Get signed URL for direct upload (if needed)
const getSignedUrl = async (fileName, contentType) => {
  try {
    const key = `tripmap-photos/poi-photos/original/${Date.now()}-${uuidv4()}-${fileName}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Expires: 300, // 5 minutes
    };

    const signedUrl = await s3.getSignedUrlPromise("putObject", params);
    return {
      signedUrl,
      key,
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
};

// Extract EXIF data from image
const extractExifData = async (imageBuffer) => {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const exif = metadata.exif;

    if (!exif) {
      return null;
    }

    // Parse EXIF data (you might want to use a dedicated EXIF library)
    // For now, return basic metadata
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      hasProfile: metadata.hasProfile,
      hasAlpha: metadata.hasAlpha,
    };
  } catch (error) {
    console.error("Error extracting EXIF data:", error);
    return null;
  }
};

// Generate unique filename
const generateFileName = (originalName, prefix = "") => {
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

module.exports = {
  upload,
  processImage,
  createThumbnail,
  uploadProcessedImage,
  deleteImage,
  getSignedUrl,
  extractExifData,
  generateFileName,
  UNIVERSAL_WIDTH,
  UNIVERSAL_HEIGHT,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
};
