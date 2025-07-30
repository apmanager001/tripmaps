# S3 Integration Setup Guide

## Overview

This guide will help you set up AWS S3 for photo uploads in your TripMaps application. The system supports image cropping, universal sizing (800x600), and 2MB file size limits.

## Prerequisites

1. AWS Account (sign up at https://aws.amazon.com)
2. Access to AWS S3 Console
3. AWS IAM permissions

## Step 1: Create S3 Bucket

### 1.1 Create Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Set bucket name: `your-app-name-photos` (must be globally unique)
4. Choose region (recommend same as your app)
5. Keep default settings for now

### 1.2 Configure Bucket Permissions

1. Go to bucket → Permissions tab
2. Update bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. Uncheck "Block all public access" (since we want public read access for photos)

## Step 2: Create IAM User

### 2.1 Create User

1. Go to AWS IAM Console
2. Click "Users" → "Add user"
3. Username: `tripmaps-photo-upload`
4. Access type: "Programmatic access"

### 2.2 Attach Policies

1. Click "Attach existing policies directly"
2. Create custom policy with this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

### 2.3 Get Access Keys

1. After creating user, note down:
   - Access Key ID
   - Secret Access Key

## Step 3: Environment Variables

Add these to your backend `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

## Step 4: Folder Structure

Your S3 bucket will have this structure:

```
your-bucket-name/
├── poi-photos/
│   ├── original/          # Original uploaded files
│   ├── processed/         # Cropped and resized images (800x600)
│   └── thumbnails/        # Thumbnail images (200x150)
```

## Step 5: Test the Integration

### 5.1 Test Upload

1. Start your backend server
2. Use the photo upload endpoint: `POST /pois/:poiId/photos`
3. Send multipart form data with:
   - `photo`: Image file
   - `cropData`: JSON string (optional)
   - `isPrimary`: Boolean (optional)

### 5.2 Test File

- Use any image file under 2MB
- Supported formats: JPEG, PNG, WebP, GIF

## Features Implemented

### Backend

- ✅ S3 integration with AWS SDK
- ✅ Image processing with Sharp
- ✅ Universal sizing (800x600)
- ✅ Thumbnail generation (200x150)
- ✅ File size validation (2MB limit)
- ✅ EXIF data extraction
- ✅ Image cropping support
- ✅ Quality optimization (80% JPEG)

### Database Models

- ✅ **POI Model**: Enhanced with description, Google Maps link, privacy settings
- ✅ **Photo Model**: Complete S3 integration with metadata tracking

### API Endpoints

- ✅ `POST /pois/:poiId/photos` - Upload photo
- ✅ `GET /pois/:poiId/photos` - Get POI photos
- ✅ `PATCH /photos/:photoId/primary` - Set primary photo
- ✅ `DELETE /photos/:photoId` - Delete photo
- ✅ `GET /users/:userId/photos` - Get user photos
- ✅ `PUT /photos/:photoId` - Update photo (crop)

### Security Features

- ✅ File type validation
- ✅ File size limits
- ✅ User authorization checks
- ✅ S3 bucket security policies

## Image Processing Features

### Universal Sizing

- **Width**: 800px
- **Height**: 600px
- **Aspect Ratio**: 4:3
- **Fit**: Cover (maintains aspect ratio)

### Quality Settings

- **JPEG Quality**: 80%
- **Thumbnail Quality**: 70%
- **Format**: JPEG (converted from any input)

### Cropping Support

- User-defined crop coordinates
- Maintains aspect ratio
- Automatic resizing after crop

## Next Steps

1. **Frontend Integration**: Add photo upload UI to POI components
2. **Image Cropper**: Implement client-side cropping interface
3. **Photo Gallery**: Create photo viewing and management interface
4. **CDN Integration**: Consider CloudFront for better performance
5. **Image Optimization**: Implement WebP conversion for modern browsers

## Troubleshooting

### Common Issues

1. **Upload Fails**

   - Check AWS credentials
   - Verify bucket permissions
   - Check file size limits

2. **Images Not Processing**

   - Verify Sharp installation
   - Check image format support
   - Review error logs

3. **S3 Access Denied**
   - Verify IAM user permissions
   - Check bucket policy
   - Ensure bucket is public for read access

### Support

- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- Sharp Documentation: https://sharp.pixelplumbing.com/
- AWS IAM Documentation: https://docs.aws.amazon.com/iam/
