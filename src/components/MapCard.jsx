"use client";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  MapPin,
  Clock,
  Eye,
  Heart,
  Bookmark as BookmarkIcon,
  Notebook,
} from "lucide-react";
import { useState, useEffect } from "react";
import { socialApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const MapCard = ({
  map,
  showActions = true,
  showBookmark = true,
  className = "",
  onClick,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Initialize bookmark status on component mount and when map changes
  useEffect(() => {
    if (map.isBookmarked !== undefined) {
      setIsBookmarked(map.isBookmarked);
    }
  }, [map.isBookmarked, map._id]);
  // Get up to 4 POI images for thumbnail gallery
  const getThumbnailImages = () => {
    // Check different possible data structures
    const pois = map?.pois || map?.poi_ids || [];

    if (!pois || pois.length === 0) {
      return [];
    }
    const images = [];
    pois.forEach((poi, index) => {
      if (poi.photos && poi.photos.length > 0) {
        // Get the primary photo or first photo
        const primaryPhoto =
          poi.photos.find((photo) => photo.isPrimary) || poi.photos[0];
        const imageUrl =
          primaryPhoto?.s3Url ||
          primaryPhoto?.thumbnailUrl ||
          primaryPhoto?.fullUrl ||
          "/placeholder-image.jpg";

        images.push({
          url: imageUrl,
          alt: poi.locationName,
          poiId: poi._id,
        });
      }
    });

    return images.slice(0, 4); // Return max 4 images
  };

  const thumbnailImages = getThumbnailImages();
  // Use total counts from backend if available, otherwise calculate from POI array
  const totalPOIs =
    map?.totalPOICount || (map?.pois || map?.poi_ids || []).length;
  const totalPhotos =
    map?.totalPhotoCount ||
    (map?.pois || map?.poi_ids || []).reduce(
      (total, poi) => total + (poi.photos?.length || 0),
      0
    ) ||
    0;

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(map);
    }
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation(); // Prevent card click
    if (isBookmarking) return;

    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        await socialApi.removeBookmark(map._id);
        setIsBookmarked(false);
        toast.success("Map removed from Travel Journal");
      } else {
        await socialApi.bookmarkMap(map._id);
        setIsBookmarked(true);
        toast.success("Map added to Travel Journal");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Revert state on error
      setIsBookmarked(!isBookmarked);
      toast.error("Failed to update bookmark");
    } finally {
      setIsBookmarking(false);
    }
  };

  // Get the primary background image
  const backgroundImage =
    thumbnailImages.length > 0 ? thumbnailImages[0].url : null;
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick ? handleCardClick : undefined}
    >
      {/* Background Image */}
      {backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
      )}

      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Bookmark Button */}
      {showBookmark && isAuthenticated && (
        <div className="absolute top-3 right-3 z-20 flex flex-col">
          <button
            onClick={handleBookmarkClick}
            disabled={isBookmarking}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 group/bookmark self-end relative"
          >
            <BookmarkIcon
              size={18}
              className={`transition-all duration-200 ${
                isBookmarked
                  ? "fill-accent text-white/80 group-hover/bookmark:scale-110"
                  : "text-white/80 group-hover/bookmark:text-white group-hover/bookmark:scale-110"
              }`}
            />
            <div className="absolute top-full right-1 mt-1 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-white/20 text-xs text-white font-medium whitespace-nowrap opacity-0 group-hover/bookmark:opacity-100 transition-opacity duration-200 pointer-events-none">
              {isBookmarked
                ? "Remove from Travel Journal"
                : "Add to Travel Journal"}
            </div>
          </button>
        </div>
      )}

      {/* Content Overlay */}
      <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-200 transition-colors break-words drop-shadow-lg">
                {map.mapName || "Untitled Map"}
              </h3>
              <div className="badge badge-outline bg-primary/40 badge-sm flex-shrink-0  border-white/30 text-white">
                <MapPin size={12} className="mr-1" />
                Map
              </div>
              {map.isPrivate && (
                <div className="badge badge-warning badge-sm flex-shrink-0 bg-yellow-500/80 text-white border-0">
                  Private
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-white/90 mb-4">
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-white/80" />
                <span className="drop-shadow-sm">
                  {map.createdAt
                    ? new Date(map.createdAt).toLocaleDateString()
                    : "Unknown date"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-1"
                  title={`${map.views || 0} views`}
                >
                  <Eye size={14} className="text-blue-300" />
                  <span className="drop-shadow-sm">{map.views || 0}</span>
                </div>
                <div
                  className="flex items-center gap-1"
                  title={`${map.likes || 0} likes`}
                >
                  <Heart size={14} className="text-red-300" />
                  <span className="drop-shadow-sm">{map.likes || 0}</span>
                </div>
              </div>
            </div>

            {/* POI and Photo counts */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-white/80 bg-black/60 p-2 rounded-md w-fit">
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-white/70" />
                <span className="drop-shadow-sm">
                  {totalPOIs} point{totalPOIs !== 1 ? "s" : ""} of interest
                </span>
              </div>
              {totalPhotos > 0 && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-white/70"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="drop-shadow-sm">
                    {totalPhotos} photo{totalPhotos !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Description if available */}
            {map.description && (
              <p className="text-sm text-white/90 mt-2 line-clamp-2 drop-shadow-sm">
                {map.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Section - Action Button */}
        {showActions && (
          <div className="flex-shrink-0 self-start sm:self-center mt-4">
            <Link
              href={`/maps/${map._id}`}
              className="btn btn-primary btn-sm group-hover:btn-secondary transition-all duration-300 w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin size={16} className="mr-2" />
              Explore
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapCard;
