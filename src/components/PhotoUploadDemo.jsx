import React, { useState } from "react";
import {
  Camera,
  Upload,
  Crop,
  Image as ImageIcon,
  Star,
  Trash2,
} from "lucide-react";
import PhotoUpload from "./PhotoUpload";
import PhotoGallery from "./PhotoGallery";

const PhotoUploadDemo = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [demoPOIId, setDemoPOIId] = useState("demo-poi-123");

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Camera className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Photo Upload & Cropping Demo
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Experience our advanced photo upload system with automatic 4:3 ratio
          cropping, S3 integration, and universal image sizing (800x600px).
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Smart Upload</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Drag & drop or click to upload</li>
            <li>• 2MB file size limit</li>
            <li>• Supports JPEG, PNG, WebP, GIF</li>
            <li>• Automatic file validation</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Crop className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">4:3 Ratio Cropping</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Interactive crop interface</li>
            <li>• Maintains 4:3 aspect ratio</li>
            <li>• Darkened overlay outside crop area</li>
            <li>• Reset to default crop</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ImageIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Universal Sizing</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 800x600px standard size</li>
            <li>• 200x150px thumbnails</li>
            <li>• 80% JPEG quality optimization</li>
            <li>• S3 cloud storage</li>
          </ul>
        </div>
      </div>

      {/* Demo Tabs */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("upload")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "upload"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Photo Upload
              </div>
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "gallery"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Photo Gallery
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "upload" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Upload & Crop Interface
                </h3>
                <p className="text-gray-600 mb-4">
                  Try uploading an image to see the cropping interface in
                  action. The system will automatically show the 4:3 crop area
                  with a darkened overlay.
                </p>
              </div>

              <PhotoUpload
                poiId={demoPOIId}
                onUploadSuccess={(photo) => {
                  console.log("Upload successful:", photo);
                }}
                onUploadError={(error) => {
                  console.error("Upload failed:", error);
                }}
              />
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Photo Gallery & Management
                </h3>
                <p className="text-gray-600 mb-4">
                  View uploaded photos with full management capabilities
                  including setting primary photos, downloading, and deletion.
                </p>
              </div>

              <PhotoGallery
                poiId={demoPOIId}
                onPhotoUpdate={() => {
                  console.log("Photo gallery updated");
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Technical Implementation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Frontend Components</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                •{" "}
                <code className="bg-gray-200 px-1 rounded">
                  ImageCropper.jsx
                </code>{" "}
                - React crop interface
              </li>
              <li>
                •{" "}
                <code className="bg-gray-200 px-1 rounded">
                  PhotoUpload.jsx
                </code>{" "}
                - Upload with validation
              </li>
              <li>
                •{" "}
                <code className="bg-gray-200 px-1 rounded">
                  PhotoGallery.jsx
                </code>{" "}
                - Photo management
              </li>
              <li>
                •{" "}
                <code className="bg-gray-200 px-1 rounded">
                  react-image-crop
                </code>{" "}
                - Crop library
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Backend Services</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                • <code className="bg-gray-200 px-1 rounded">s3Service.js</code>{" "}
                - AWS S3 integration
              </li>
              <li>
                •{" "}
                <code className="bg-gray-200 px-1 rounded">
                  photoController.js
                </code>{" "}
                - Photo API endpoints
              </li>
              <li>
                • <code className="bg-gray-200 px-1 rounded">sharp</code> -
                Image processing
              </li>
              <li>
                • <code className="bg-gray-200 px-1 rounded">multer-s3</code> -
                Direct S3 uploads
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">How to Use</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start gap-3">
            <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              1
            </span>
            <p>Click "Choose Image" or drag and drop an image file (max 2MB)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              2
            </span>
            <p>
              The cropping interface will open automatically with a 4:3 ratio
              crop area
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              3
            </span>
            <p>
              Adjust the crop area by dragging corners or edges, or use the
              Reset button
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              4
            </span>
            <p>Click "Confirm Crop" to process and upload the image to S3</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              5
            </span>
            <p>
              View uploaded photos in the gallery with full management options
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadDemo;
