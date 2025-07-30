import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Star,
  Trash2,
  Download,
  ExternalLink,
  MapPin,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const PhotoGallery = ({ poiId, onPhotoUpdate }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [poiId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pois/${poiId}/photos`);
      const result = await response.json();

      if (result.success) {
        setPhotos(result.data.photos);
      } else {
        throw new Error(result.message || "Failed to fetch photos");
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast.error("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (photoId) => {
    try {
      const response = await fetch(`/api/photos/${photoId}/primary`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Primary photo updated!");
        fetchPhotos(); // Refresh the list
        if (onPhotoUpdate) {
          onPhotoUpdate();
        }
      } else {
        throw new Error(result.message || "Failed to update primary photo");
      }
    } catch (error) {
      console.error("Error setting primary photo:", error);
      toast.error("Failed to update primary photo");
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Photo deleted successfully!");
        fetchPhotos(); // Refresh the list
        if (onPhotoUpdate) {
          onPhotoUpdate();
        }
      } else {
        throw new Error(result.message || "Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo");
    }
  };

  const handleDownload = (photo) => {
    const link = document.createElement("a");
    link.href = photo.s3Url;
    link.download = photo.originalFileName || "photo.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openLightbox = (photo) => {
    setSelectedPhoto(photo);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <ImageIcon className="mx-auto h-12 w-12 mb-4" />
        <p>No photos uploaded yet</p>
        <p className="text-sm">Upload the first photo to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo._id}
            className="relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Primary Badge */}
            {photo.isPrimary && (
              <div className="absolute top-2 left-2 z-10">
                <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Primary
                </div>
              </div>
            )}

            {/* Photo */}
            <div className="aspect-[4/3] relative">
              <img
                src={photo.s3Url}
                alt={photo.originalFileName || "POI Photo"}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => openLightbox(photo)}
              />

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <button
                    onClick={() => openLightbox(photo)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="View full size"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-700" />
                  </button>

                  {!photo.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(photo._id)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="Set as primary"
                    >
                      <Star className="h-4 w-4 text-gray-700" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDownload(photo)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-gray-700" />
                  </button>

                  <button
                    onClick={() => handleDeletePhoto(photo._id)}
                    className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Photo Info */}
            <div className="p-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {photo.originalFileName?.length > 20
                    ? `${photo.originalFileName.substring(0, 20)}...`
                    : photo.originalFileName}
                </span>
                <span>{(photo.fileSize / 1024 / 1024).toFixed(1)}MB</span>
              </div>

              {photo.user_id && (
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>by {photo.user_id.username}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {showLightbox && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image */}
            <img
              src={selectedPhoto.s3Url}
              alt={selectedPhoto.originalFileName || "POI Photo"}
              className="max-w-full max-h-full object-contain"
            />

            {/* Photo Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {selectedPhoto.originalFileName}
                  </p>
                  <p className="text-sm text-gray-300">
                    {(selectedPhoto.fileSize / 1024 / 1024).toFixed(2)}MB •
                    {selectedPhoto.width}×{selectedPhoto.height}px
                  </p>
                  {selectedPhoto.user_id && (
                    <p className="text-sm text-gray-300">
                      Uploaded by {selectedPhoto.user_id.username}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {!selectedPhoto.isPrimary && (
                    <button
                      onClick={() => {
                        handleSetPrimary(selectedPhoto._id);
                        closeLightbox();
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(selectedPhoto)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
