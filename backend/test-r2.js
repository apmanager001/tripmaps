require("dotenv").config();

console.log("=== R2 Credentials Test ===");
console.log("Environment variables loaded:");
console.log(
  "- R2_ACCESS_KEY_ID:",
  process.env.R2_ACCESS_KEY_ID ? "Set" : "Missing"
);
console.log(
  "- R2_SECRET_ACCESS_KEY:",
  process.env.R2_SECRET_ACCESS_KEY ? "Set" : "Missing"
);
console.log(
  "- R2_BUCKET_NAME:",
  process.env.R2_BUCKET_NAME ? "Set" : "Missing"
);
console.log("- R2_ENDPOINT:", process.env.R2_ENDPOINT ? "Set" : "Missing");

if (
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.R2_BUCKET_NAME ||
  !process.env.R2_ENDPOINT
) {
  console.log("\n❌ Missing required R2 environment variables!");
  console.log("Please check your .env file in the backend directory.");
  process.exit(1);
}

console.log("\n✅ All R2 environment variables are set!");

// Test AWS SDK configuration
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

const s3 = new AWS.S3();

console.log("\n=== Testing R2 Connection ===");

// Test bucket access
s3.headBucket({ Bucket: process.env.R2_BUCKET_NAME }, (err, data) => {
  if (err) {
    console.log("❌ Failed to connect to R2 bucket:", err.message);
    console.log("Please check your R2 credentials and bucket name.");
  } else {
    console.log("✅ Successfully connected to R2 bucket!");
    console.log("Bucket:", process.env.R2_BUCKET_NAME);
  }
});
