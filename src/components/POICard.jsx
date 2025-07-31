"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { poiApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import {
  MapPin,
  Edit,
  Eye,
  Trash2,
  Lock,
  Globe,
  Heart,
  Flag,
} from "lucide-react";
import FlagModal from "./FlagModal";
import POIPhotoGallery from "./POIPhotoGallery";

const POICard = ({
  poi,
  onEdit,
  onDelete,
  onViewPhotos,
  showActions = true,
  showLikeButton = true,
  showFlagButton = true,
  className = "",
  compact = false,
  onClick,
  overlayButton = null,
}) => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flaggingPhoto, setFlaggingPhoto] = useState(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // POI like mutation
  const likeMutation = useMutation({
    mutationFn: () => poiApi.likePOI(poi._id),
    onSuccess: (data) => {
      console.log("Like success response:", data);
      if (data.success) {
        toast.success("POI like updated");
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries(["individualMap"]);
        queryClient.invalidateQueries(["popularPOIs"]);
        queryClient.invalidateQueries(["search"]);
        queryClient.invalidateQueries(["userPOIs"]);
      } else {
        toast.error(data.message || "Failed to update POI like");
      }
    },
    onError: (error) => {
      console.error("Like error:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        stack: error.stack,
      });
      toast.error(`Failed to update POI like: ${error.message}`);
    },
  });

  const handleLike = (e) => {
    e.stopPropagation();
    console.log("Like button clicked, authentication status:", isAuthenticated);
    console.log("POI ID:", poi._id);

    if (!isAuthenticated) {
      toast.error("Please log in to like POIs");
      return;
    }

    console.log("Attempting to like POI...");
    likeMutation.mutate();
  };

  const handleFlagPhoto = (e, photo, poiData) => {
    e.stopPropagation();
    setFlaggingPhoto({
      id: photo._id,
      url: photo.s3Url || photo.fullUrl,
      locationName: poiData.locationName,
    });
    setShowFlagModal(true);
  };

  const handleCloseFlagModal = () => {
    setShowFlagModal(false);
    setFlaggingPhoto(null);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(poi._id, poi.locationName);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(poi);
    }
  };

  const handleViewPhotos = (e) => {
    e.stopPropagation();
    setSelectedPhotoIndex(0);
    setShowPhotoGallery(true);
  };

  return (
    <>
      <div
        className={`relative bg-base-100 rounded-xl shadow-lg border border-base-300 h-full flex flex-col hover:shadow-xl transition-all duration-200 group ${
          compact ? "max-w-sm" : ""
        } ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        {/* Photo Section */}
        {poi.photos && poi.photos.length > 0 ? (
          <div
            className={`relative overflow-hidden rounded-t-xl cursor-pointer group ${
              compact ? "h-32" : "h-48"
            }`}
            onClick={handleViewPhotos}
          >
            <img
              src={
                poi.photos[0]?.s3Url ||
                poi.photos[0]?.fullUrl ||
                "/placeholder-image.jpg"
              }
              alt={poi.locationName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Photo count badge */}
            {poi.photos.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                +{poi.photos.length - 1} more
              </div>
            )}
            {/* Primary photo indicator */}
            {poi.photos[0]?.isPrimary && (
              <div className="absolute top-3 left-3 bg-primary/80 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Primary
              </div>
            )}
            {/* Photo date badge */}
            {poi.photos[0]?.date_visited && (
              <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                📅 {new Date(poi.photos[0].date_visited).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`bg-base-300 rounded-t-xl flex items-center justify-center ${
              compact ? "h-32" : "h-48"
            }`}
          >
            <MapPin className="w-12 h-12 text-neutral-400" />
          </div>
        )}

        {/* Content Section */}
        <div className={`p-6 flex-1 flex flex-col ${compact ? "p-4" : ""}`}>
          {/* Title and Action Buttons Row */}
          <div className="flex items-start justify-between mb-3">
            <Link
              href={`/point_of_interest/${poi._id}`}
              className="text-lg font-semibold text-primary line-clamp-2 flex-1 mr-3 hover:text-primary-focus hover:underline transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {poi.locationName}
            </Link>

            {/* Flag and Delete buttons - moved to top right */}
            {showActions && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {showFlagButton && poi.photos && poi.photos.length > 0 && (
                  <button
                    onClick={(e) => handleFlagPhoto(e, poi.photos[0], poi)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-all duration-200"
                    title="Flag photo"
                  >
                    <Flag size={14} />
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-md hover:bg-error/10 text-neutral-500 hover:text-error transition-all duration-200"
                  title="Delete POI"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Action Icons Row - Like and Edit */}
          <div
            className={`flex items-center mb-4 p-2 bg-base-100 rounded-lg border border-base-200 ${
              showActions && showLikeButton ? "justify-between" : "justify-end"
            }`}
          >
            {/* Left side - Edit button (only when both buttons are shown) */}
            {showActions && showLikeButton && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-base-200 text-neutral-600 hover:text-primary hover:shadow-sm transition-all duration-200"
                title="Edit POI"
              >
                <Edit size={18} />
                <span className="text-sm font-medium">Edit</span>
              </button>
            )}

            {/* Right side - Like button (always on the right) */}
            {showLikeButton && (
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending || !isAuthenticated}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  poi.isLiked
                    ? "bg-red-50 text-red-600 border border-red-200 shadow-sm"
                    : "hover:bg-base-200 text-neutral-600 hover:shadow-sm"
                }`}
                title={!isAuthenticated ? "Please log in to like POIs" : ""}
              >
                <Heart
                  size={18}
                  className={poi.isLiked ? "fill-current" : ""}
                />
                {poi.likesCount > 0 && (
                  <span className="text-sm font-medium">{poi.likesCount}</span>
                )}
              </button>
            )}

            {/* Edit button when like button is not shown */}
            {showActions && !showLikeButton && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-base-200 text-neutral-600 hover:text-primary hover:shadow-sm transition-all duration-200"
                title="Edit POI"
              >
                <Edit size={18} />
                <span className="text-sm font-medium">Edit</span>
              </button>
            )}
          </div>

          {/* Description */}
          {poi.description && (
            <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
              {poi.description}
            </p>
          )}

          {/* Tags */}
          {poi.tags && poi.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {poi.tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="badge badge-primary badge-soft badge-xs"
                >
                  {typeof tag === "object" ? tag.name : tag}
                </span>
              ))}
              {poi.tags.length > 3 && (
                <span className="badge badge-neutral badge-soft badge-xs">
                  +{poi.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Coordinates */}
          {poi.lat && poi.lng && (
            <div className="text-xs text-neutral-500 mb-3">
              📍 {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
            </div>
          )}

          {/* Bottom Row - Privacy Status */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              {poi.isPrivate ? (
                <>
                  <Lock size={12} />
                  <span>Private</span>
                </>
              ) : (
                <>
                  <Globe size={12} />
                  <span>Public</span>
                </>
              )}
            </div>
            {overlayButton && (
              <div className="mt-3 flex justify-end">{overlayButton}</div>
            )}
          </div>
        </div>

        {/* Overlay Button */}
      </div>

      {/* Flag Modal */}
      {showFlagModal && flaggingPhoto && (
        <FlagModal
          isOpen={showFlagModal}
          onClose={handleCloseFlagModal}
          photoId={flaggingPhoto.id}
          photoUrl={flaggingPhoto.url}
          locationName={flaggingPhoto.locationName}
        />
      )}

      {/* POI Photo Gallery */}
      <POIPhotoGallery
        isOpen={showPhotoGallery}
        onClose={() => setShowPhotoGallery(false)}
        poi={poi}
        initialPhotoIndex={selectedPhotoIndex}
        showFlagButton={showFlagButton}
        onFlagPhoto={handleFlagPhoto}
      />
    </>
  );
};

export default POICard;
