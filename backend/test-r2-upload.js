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

async function testUpload() {
  try {
    console.log("=== R2 Upload Test ===");
    console.log("Bucket:", process.env.R2_BUCKET_NAME);
    console.log(
      "Access Key ID:",
      process.env.R2_ACCESS_KEY_ID ? "Set" : "Missing"
    );
    console.log(
      "Secret Access Key:",
      process.env.R2_SECRET_ACCESS_KEY ? "Set" : "Missing"
    );
    console.log("");

    const testContent = "Hello R2! This is a test upload.";
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: "test-upload.txt",
      Body: testContent,
      ContentType: "text/plain",
      ACL: "public-read",
    };

    console.log("Attempting upload...");
    const result = await s3.upload(uploadParams).promise();
    console.log("✅ Upload successful!");
    console.log("Location:", result.Location);
    console.log("ETag:", result.ETag);
    console.log("");

    // Try to read it back
    console.log("Attempting to read back the uploaded file...");
    const getParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: "test-upload.txt",
    };

    const readResult = await s3.getObject(getParams).promise();
    console.log("✅ Read successful!");
    console.log("Content:", readResult.Body.toString());
    console.log("");

    // Try to list objects
    console.log("Listing objects in bucket...");
    const listParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 10,
    };

    const listResult = await s3.listObjectsV2(listParams).promise();
    console.log("✅ List successful!");
    console.log("Objects found:", listResult.Contents.length);
    listResult.Contents.forEach((obj) => {
      console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Error code:", error.code);
    console.error("Error status code:", error.statusCode);

    if (error.code === "AccessDenied") {
      console.log("\n💡 This looks like a permissions issue. Check:");
      console.log("  1. API token has R2:Edit permissions");
      console.log("  2. Bucket public access is enabled");
      console.log("  3. CORS includes POST method");
    } else if (error.code === "NoSuchBucket") {
      console.log("\n💡 Bucket not found. Check:");
      console.log("  1. R2_BUCKET_NAME is correct");
      console.log("  2. Bucket exists in your R2 dashboard");
    }
  }
}

testUpload();
