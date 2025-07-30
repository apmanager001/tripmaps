require("dotenv").config();
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

async function testPresignedUrls() {
  try {
    console.log("=== Testing Presigned URLs ===");

    // Test with one of the existing profile pictures
    const testKey =
      "tripmap-profile-photos/profile-pictures/profiles/profile-1753833421659-228b517f-03ef-4f85-a751-ce351e9f303e.jpg";

    console.log("Testing presigned URL for:", testKey);

    const presignedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: "tripmap-photos",
      Key: testKey,
      Expires: 3600, // 1 hour
    });

    console.log("✅ Presigned URL generated successfully!");
    console.log("URL:", presignedUrl);
    console.log("");

    // Test if we can access the file with the presigned URL
    console.log("Testing access to presigned URL...");
    const response = await fetch(presignedUrl);

    if (response.ok) {
      console.log("✅ Presigned URL is accessible!");
      console.log("Content-Type:", response.headers.get("content-type"));
      console.log("Content-Length:", response.headers.get("content-length"));
    } else {
      console.log("❌ Presigned URL is not accessible");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testPresignedUrls();
