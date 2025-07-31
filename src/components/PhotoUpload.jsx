import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Crop } from "lucide-react";
import ImageCropper from "./ImageCropper";
import toast from "react-hot-toast";

const PhotoUpload = ({
  poiId,
  onUploadSuccess,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropData, setCropData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error(
        `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`
      );
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (crop, pixelCrop) => {
    setCropData({
      x: pixelCrop.x,
      y: pixelCrop.y,
      width: pixelCrop.width,
      height: pixelCrop.height,
      scale: 1,
    });
  };

  const handleCropConfirm = (crop) => {
    setShowCropper(false);
    // The crop data is already set in handleCropComplete
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    setImagePreview(null);
    setCropData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !cropData) {
      toast.error("Please select and crop an image first");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);
      formData.append("cropData", JSON.stringify(cropData));
      formData.append("isPrimary", "false"); // Default to false, can be changed later

      const response = await fetch(`/api/pois/${poiId}/photos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Photo uploaded successfully!");
        setSelectedFile(null);
        setImagePreview(null);
        setCropData(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (onUploadSuccess) {
          onUploadSuccess(result.data.photo);
        }
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload photo");
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (acceptedTypes.includes(file.type) && file.size <= maxFileSize) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
          setShowCropper(true);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please select a valid image file under 2MB");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors ${
          selectedFile
            ? "border-green-500 bg-green-50"
            : "hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <div className="space-y-3">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload a photo
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop an image here, or click to select
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-400">
              Maximum file size: 2MB. Supported formats: JPEG, PNG, WebP, GIF
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-auto rounded-lg object-cover"
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreview(null);
                  setCropData(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowCropper(true)}
                className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Crop className="mr-1 h-4 w-4" />
                Crop Image
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !cropData}
                className="inline-flex items-center px-3 py-1 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Crop Status */}
      {cropData && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center">
            <Crop className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm text-green-800">
              Image cropped successfully! Ready to upload.
            </span>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && imagePreview && (
        <ImageCropper
          imageSrc={imagePreview}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
          aspectRatio={4 / 3}
          maxWidth={800}
          maxHeight={600}
        />
      )}
    </div>
  );
};

export default PhotoUpload;
