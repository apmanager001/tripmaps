const AWS = require("aws-sdk");
const fetch = require("node-fetch");

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

// Proxy image from R2 with CORS headers
const proxyImage = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Image key is required",
      });
    }

    // Get the image from R2
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const result = await s3.getObject(params).promise();

    // Set CORS headers
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": result.ContentType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000", // Cache for 1 year
    });

    // Send the image buffer
    res.send(result.Body);
  } catch (error) {
    console.error("Error proxying image:", error);

    if (error.code === "NoSuchKey") {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to load image",
    });
  }
};

// Get presigned URL for image (alternative approach)
const getImageUrl = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Image key is required",
      });
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 3600, // 1 hour
    };

    const presignedUrl = await s3.getSignedUrlPromise("getObject", params);

    res.json({
      success: true,
      url: presignedUrl,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate image URL",
    });
  }
};

module.exports = {
  proxyImage,
  getImageUrl,
};
