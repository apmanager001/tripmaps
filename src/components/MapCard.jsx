"use client";
import Link from "next/link";
import { MapPin, Clock, Eye, Heart } from "lucide-react";

const MapCard = ({ map, showActions = true, className = "", onClick }) => {
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
  const totalPOIs = (map?.pois || map?.poi_ids || []).length;
  const totalPhotos =
    (map?.pois || map?.poi_ids || []).reduce(
      (total, poi) => total + (poi.photos?.length || 0),
      0
    ) || 0;

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(map);
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

      {/* Content Overlay */}
      <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-200 transition-colors break-words drop-shadow-lg">
                {map.mapName || "Untitled Map"}
              </h3>
              <div className="badge badge-outline badge-sm flex-shrink-0 bg-white/20 border-white/30 text-white">
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-white/80">
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
