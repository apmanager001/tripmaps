"use client";
import { useState, useEffect } from "react";
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
  Info,
  Navigation,
} from "lucide-react";
import FlagModal from "./FlagModal";
import POIPhotoGallery from "./POIPhotoGallery";
import { createPortal } from "react-dom";

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
  mapLocation = false,
  onNavigateToMap,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flaggingPhoto, setFlaggingPhoto] = useState(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showDescriptionTooltip, setShowDescriptionTooltip] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if current user is the creator of this POI
  const isCreator =
    (isAuthenticated && poi?.user_id?._id === user._id) ||
    poi?.user_id === user._id;

  // Ensure we're on the client side for portal rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  // POI like mutation
  const likeMutation = useMutation({
    mutationFn: () => poiApi.likePOI(poi._id),
    onSuccess: (data) => {
      // Like success response
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
    // Like button clicked

    if (!isAuthenticated) {
      toast.error("Please log in to like POIs");
      return;
    }

    // Attempting to like POI
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

  const handleDescriptionToggle = (e) => {
    e.stopPropagation();
    setShowDescriptionTooltip(!showDescriptionTooltip);
  };

  const handleNavigateToMap = (e) => {
    e.stopPropagation();
    if (onNavigateToMap && poi.lat && poi.lng) {
      try {
        // Scroll to map element
        const mapElement = document.getElementById("map");
        if (mapElement) {
          mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        // Call the callback to zoom to this POI location
        const coordinates = { lat: poi.lat, lng: poi.lng };
        onNavigateToMap(coordinates);
      } catch (error) {
        console.error("Error navigating to map:", error);
        toast.error("Failed to navigate to map location");
      }
    }
  };

  const hasImage = poi.photos && poi.photos.length > 0;
  const primaryOrFirstPhoto = hasImage
    ? poi.photos.find((p) => p?.isPrimary) || poi.photos[0]
    : null;
  const imageUrl = primaryOrFirstPhoto
    ? primaryOrFirstPhoto?.s3Url || primaryOrFirstPhoto?.fullUrl
    : null;

  return (
    <>
      <div
        className={`relative bg-base-100 rounded-xl shadow-lg border border-base-300 h-full flex flex-col hover:shadow-xl transition-all duration-200 group overflow-hidden ${
          compact ? "max-w-sm" : ""
        } ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        {/* Background Image */}
        {hasImage ? (
          <div className="absolute inset-0 z-0">
            <img
              src={imageUrl}
              alt={poi.locationName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-neutral-400" />
          </div>
        )}

        {/* Content Overlay */}
        <div
          className={`relative z-10 flex flex-col h-full p-6 ${
            compact ? "p-4" : ""
          }`}
        >
          {/* Top Row - Action Buttons */}
          <div className="flex items-start justify-between mb-3">
            {/* Left side - Photo count badge */}
            <div className="flex-shrink-0">
              {hasImage && poi.photos.length > 1 && (
                <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                  +{poi.photos.length - 1} more
                </div>
              )}
            </div>

            {/* Right side - Flag and Delete buttons */}
            {showActions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {showFlagButton && hasImage && (
                  <div
                    className="tooltip tooltip-bottom tooltip-secondary"
                    data-tip="Flag photo"
                  >
                    <button
                      onClick={(e) =>
                        handleFlagPhoto(e, primaryOrFirstPhoto, poi)
                      }
                      className="cursor-pointer p-2 rounded-lg bg-black/60 hover:bg-red-600/80 text-white backdrop-blur-sm transition-all duration-200"
                    >
                      <Flag size={16} />
                    </button>
                  </div>
                )}

                {isCreator && (
                  <div className="tooltip tooltip-bottom" data-tip="Delete POI">
                    <button
                      onClick={handleDelete}
                      className="cursor-pointer p-2 rounded-lg bg-black/60 hover:bg-error/80 text-white backdrop-blur-sm transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Spacer to push content to bottom */}
          <div className="flex-1"></div>

          {/* Bottom Content */}
          <div className="space-y-4">
            {/* Title with Info Icon */}
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/point_of_interest/${poi._id}`}
                className="text-xl font-bold text-white line-clamp-2 hover:text-primary-focus transition-colors duration-200 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                {poi.locationName}
              </Link>

              {/* Description Icon Button */}
              {poi.description && (
                <div className="relative flex-shrink-0">
                  <button
                    onClick={handleDescriptionToggle}
                    onMouseEnter={() => setShowDescriptionTooltip(true)}
                    onMouseLeave={() => setShowDescriptionTooltip(false)}
                    className="p-2 rounded-lg bg-black/60 hover:bg-primary/80 text-white backdrop-blur-sm transition-all duration-200"
                  >
                    <Info size={16} />
                  </button>

                  {/* Description Tooltip */}
                  {showDescriptionTooltip && (
                    <div
                      className="absolute top-full right-0 mt-2 p-3 bg-black/90 text-white rounded-lg shadow-lg backdrop-blur-sm max-w-60 z-20"
                      style={{ width: "min(320px, calc(100vw - 2rem))" }}
                    >
                      <p className="text-sm leading-relaxed line-clamp-4">
                        {poi.description}
                      </p>
                      {/* Arrow pointing to button */}
                      <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {poi.tags && poi.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {poi.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="badge badge-primary badge-sm bg-primary/60 text-white border-0 backdrop-blur-sm"
                  >
                    {typeof tag === "object" ? tag.name : tag}
                  </span>
                ))}
                {poi.tags.length > 3 && (
                  <span className="badge badge-neutral badge-sm bg-neutral/80 text-white border-0 backdrop-blur-sm">
                    +{poi.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Coordinates */}
            {poi.lat && poi.lng && (
              <div className="text-xs text-white/80 drop-shadow-lg">
                📍 {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
              </div>
            )}

            {/* Photo date badge */}
            {hasImage && primaryOrFirstPhoto?.date_visited && (
              <div className="text-xs text-white/90 drop-shadow-lg badge badge-primary badge-sm bg-accent/60 border-0 backdrop-blur-sm">
                📅{" "}
                {new Date(
                  primaryOrFirstPhoto.date_visited
                ).toLocaleDateString()}
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between pt-2">
              {/* Privacy Status */}
              <div className="flex items-center gap-2">
                {poi.isPrivate ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm">
                    <Lock size={14} />
                    <span className="text-sm font-medium">Private</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm">
                    <Globe size={14} />
                    <span className="text-sm font-medium">Public</span>
                  </div>
                )}
              </div>

              {/* Like, View Photos, and Edit buttons */}
              <div className="flex items-center gap-2">
                {showLikeButton && (
                  <div
                    className="tooltip tooltip-top tooltip-secondary"
                    data-tip={
                      !isAuthenticated
                        ? "Please log in to like POIs"
                        : "Like this location"
                    }
                  >
                    <button
                      onClick={handleLike}
                      disabled={likeMutation.isPending || !isAuthenticated}
                      className={` flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200 backdrop-blur-sm ${
                        poi.isLiked
                          ? "bg-red-600/80 text-white shadow-lg"
                          : "bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={poi.isLiked ? "fill-current" : ""}
                      />
                      {poi.likesCount > 0 && (
                        <span className="text-sm font-medium">
                          {poi.likesCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Navigation Button */}
                {mapLocation && poi.lat && poi.lng && (
                  <div
                    className="tooltip tooltip-top"
                    data-tip="Navigate to location on map"
                  >
                    <button
                      onClick={handleNavigateToMap}
                      className="cursor-pointer p-2 rounded-lg bg-black/60 hover:bg-primary/80 text-white backdrop-blur-sm transition-all duration-200"
                    >
                      <Navigation size={16} />
                    </button>
                  </div>
                )}

                {/* View Photos Button */}
                {hasImage && (
                  <div
                    className="tooltip tooltip-top tooltip-secondary"
                    data-tip="View photos"
                  >
                    <button
                      onClick={handleViewPhotos}
                      className="cursor-pointer p-2 rounded-lg bg-black/60 hover:bg-primary/80 text-white backdrop-blur-sm transition-all duration-200"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                )}

                {showActions && isCreator && (
                  <div className="tooltip tooltip-top" data-tip="Edit POI">
                    <button
                      onClick={handleEdit}
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 hover:bg-primary/80 text-white backdrop-blur-sm transition-all duration-200"
                    >
                      <Edit size={16} />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Overlay Button */}
            {overlayButton && (
              <div className="flex justify-end">{overlayButton}</div>
            )}
          </div>
        </div>

        {/* Click overlay for photo gallery */}
        {hasImage && (
          <div
            className="absolute inset-0 z-5 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            onClick={handleViewPhotos}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 text-black px-4 py-2 rounded-lg font-medium">
                View Photos
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POI Photo Gallery */}
      <POIPhotoGallery
        isOpen={showPhotoGallery}
        onClose={() => setShowPhotoGallery(false)}
        poi={poi}
        initialPhotoIndex={selectedPhotoIndex}
        showFlagButton={showFlagButton}
        onFlagPhoto={handleFlagPhoto}
      />

      {/* Flag Modal - Rendered via Portal */}
      {showFlagModal &&
        flaggingPhoto &&
        isClient &&
        createPortal(
          <FlagModal
            isOpen={showFlagModal}
            onClose={handleCloseFlagModal}
            photoId={flaggingPhoto.id}
            photoUrl={flaggingPhoto.url}
            locationName={flaggingPhoto.locationName}
          />,
          document.body
        )}
    </>
  );
};

export default POICard;
