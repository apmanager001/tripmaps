# R2 Bucket Settings Troubleshooting Guide

## **1. Check Bucket Public Access Settings**

### **Required Settings:**

- **Public Access**: Must be enabled
- **Block Public Access**: Must be disabled
- **Object Ownership**: Should be "Bucket owner preferred" or "Bucket owner enforced"

### **Steps to Check:**

1. Go to Cloudflare Dashboard → R2 Object Storage
2. Select your bucket (`tripmap-photos`)
3. Go to **Settings** tab
4. Check **Public Access** section:
   - ✅ **Public Access**: Should be **Enabled**
   - ❌ **Block Public Access**: Should be **Disabled**

## **2. Check CORS Configuration**

### **Current CORS (from your message):**

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:5000"],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### **Missing Methods:**

Your CORS is missing **POST** method which is needed for file uploads.

### **Updated CORS Configuration:**

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:5000"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## **3. Check API Token Permissions**

### **Required Permissions:**

- **Object Read & Write** for your bucket
- **Bucket Read & Write** permissions

### **Steps to Check:**

1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Find your R2 API token
3. Check permissions include:
   - ✅ **Cloudflare R2:Edit** for your bucket
   - ✅ **Cloudflare R2:Read** for your bucket

## **4. Check Bucket Policy**

### **Required Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tripmap-photos/*"
    }
  ]
}
```

## **5. Test Upload with Simple Script**

Create a test script to verify R2 connectivity:

```javascript
// test-r2-upload.js
const AWS = require("aws-sdk");

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
    const testContent = "Hello R2!";
    const uploadParams = {
      Bucket: "tripmap-photos",
      Key: "test-upload.txt",
      Body: testContent,
      ContentType: "text/plain",
      ACL: "public-read",
    };

    console.log("Attempting upload...");
    const result = await s3.upload(uploadParams).promise();
    console.log("Upload successful:", result.Location);

    // Try to read it back
    const getParams = {
      Bucket: "tripmap-photos",
      Key: "test-upload.txt",
    };

    const readResult = await s3.getObject(getParams).promise();
    console.log("Read successful:", readResult.Body.toString());
  } catch (error) {
    console.error("Error:", error);
  }
}

testUpload();
```

## **6. Most Likely Issues:**

1. **Missing POST in CORS** (most common)
2. **Public access disabled**
3. **Incorrect API token permissions**
4. **Bucket policy blocking uploads**

## **7. Quick Fix Steps:**

1. **Update CORS** to include POST and DELETE methods
2. **Enable public access** on the bucket
3. **Check API token** has R2:Edit permissions
4. **Test with the simple script** above

## **8. Debug Information to Check:**

- What's the exact error message when you try to access the uploaded file URL?
- Can you see the file in the R2 dashboard under the bucket?
- Does the test script work?
- Are there any errors in the browser console when uploading?
