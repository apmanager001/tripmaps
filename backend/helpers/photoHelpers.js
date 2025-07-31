const AWS = require("aws-sdk");

// Configure AWS SDK for Cloudflare R2
AWS.config.update({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: "auto",
  endpoint: "https://57504fc5bc651800ba47b85ed3c810bf.r2.cloudflarestorage.com",
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Generate presigned URL for photo access
const generatePresignedUrl = async (s3Key) => {
  // Validate s3Key parameter
  if (!s3Key || typeof s3Key !== "string" || s3Key.trim() === "") {
    console.warn("Invalid s3Key provided:", s3Key);
    return null;
  }

  try {
    const presignedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Expires: 3600, // 1 hour
    });
    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

// Generate presigned URLs for an array of photos
const generatePresignedUrlsForPhotos = async (photos) => {
  if (!photos || photos.length === 0) {
    return [];
  }

  return await Promise.all(
    photos.map(async (photo, index) => {
      // Validate photo object
      if (!photo || typeof photo !== "object") {
        console.warn(`Invalid photo object at index ${index}:`, photo);
        return null;
      }

      const s3Url = await generatePresignedUrl(photo.s3Key);
      const thumbnailUrl = photo.thumbnailKey
        ? await generatePresignedUrl(photo.thumbnailKey)
        : null;

      return {
        ...(photo.toObject ? photo.toObject() : photo),
        s3Url,
        thumbnailUrl,
        fullUrl: s3Url, // Use s3Url as fullUrl since fullKey doesn't exist
      };
    })
  ).then((results) => results.filter((result) => result !== null)); // Filter out null results
};

module.exports = {
  generatePresignedUrl,
  generatePresignedUrlsForPhotos,
};
