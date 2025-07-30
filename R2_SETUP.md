# Cloudflare R2 Setup Guide

This guide will help you configure Cloudflare R2 for photo storage in your TripMaps application.

## Prerequisites

1. A Cloudflare account
2. Access to Cloudflare R2 storage

## Step 1: Create R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Enter a bucket name (e.g., `mytripmaps-photos`)
5. Choose your preferred location
6. Click **Create bucket**

## Step 2: Create API Token

1. In your Cloudflare dashboard, go to **My Profile** > **API Tokens**
2. Click **Create Token**
3. Choose **Custom token** template
4. Configure the token with the following permissions:
   - **Account** > **Cloudflare R2** > **Object Read & Write**
   - **Zone** > **Zone** > **Read** (if you want to use custom domains)
5. Set the **Account Resources** to include your account
6. Click **Continue to summary** and then **Create Token**
7. **Important**: Copy and save the token - you won't be able to see it again!

## Step 3: Get Your Account ID

1. In your Cloudflare dashboard, look at the URL or sidebar
2. Your Account ID is displayed in the format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. Copy this ID

## Step 4: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

### Where to find these values:

- **R2_ACCESS_KEY_ID**: This is your Cloudflare Account ID
- **R2_SECRET_ACCESS_KEY**: This is the API token you created in Step 2
- **R2_BUCKET_NAME**: The name of your R2 bucket (e.g., `mytripmaps-photos`)
- **R2_ENDPOINT**: `https://your_account_id.r2.cloudflarestorage.com` (replace `your_account_id` with your actual Account ID)

## Step 5: Configure CORS (Optional)

If you plan to upload directly from the frontend, you may need to configure CORS:

1. In your R2 bucket, go to **Settings** > **CORS**
2. Add a CORS policy:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## Step 6: Custom Domain (Optional)

To use a custom domain for your images:

1. In your R2 bucket, go to **Settings** > **Custom Domains**
2. Click **Connect Domain**
3. Follow the DNS configuration instructions
4. Update your environment variables to use the custom domain

## Step 7: Test the Configuration

You can test your R2 configuration by running:

```bash
# Test upload
curl -X PUT \
  -H "Authorization: Bearer your_api_token" \
  -H "Content-Type: text/plain" \
  --data "Hello R2!" \
  "https://your_account_id.r2.cloudflarestorage.com/your_bucket_name/test.txt"
```

## Environment Variables Summary

Replace the following in your `.env` file:

```env
# Remove or comment out AWS S3 variables
# AWS_ACCESS_KEY_ID=xxx
# AWS_SECRET_ACCESS_KEY=xxx
# AWS_REGION=xxx
# S3_BUCKET_NAME=xxx

# Add R2 variables
R2_ACCESS_KEY_ID=your_cloudflare_account_id
R2_SECRET_ACCESS_KEY=your_api_token
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

## Benefits of Cloudflare R2

- **Cost-effective**: No egress fees
- **Global CDN**: Built-in Cloudflare CDN
- **S3-compatible**: Easy migration from AWS S3
- **Simple pricing**: Pay only for storage and operations
- **Global edge locations**: Fast access worldwide

## Troubleshooting

### Common Issues:

1. **Authentication Error**: Double-check your Account ID and API token
2. **CORS Error**: Ensure CORS is properly configured if uploading from frontend
3. **Bucket Not Found**: Verify the bucket name and Account ID
4. **Permission Denied**: Ensure your API token has the correct permissions

### Debug Mode:

To enable debug logging, add this to your environment:

```env
DEBUG=aws-sdk:*
```

## Migration from AWS S3

If you're migrating from AWS S3:

1. Update environment variables as shown above
2. The code changes have already been made to the `s3Service.js` file
3. Test with a few images first
4. Consider using Cloudflare's migration tools for large datasets

## Security Best Practices

1. **Rotate API tokens** regularly
2. **Use least privilege** - only grant necessary permissions
3. **Monitor usage** through Cloudflare dashboard
4. **Enable logging** for audit trails
5. **Use custom domains** for better security control
