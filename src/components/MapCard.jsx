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

  return (
    <div
      className={`group bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick ? handleCardClick : undefined}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail Gallery */}
        <div className="flex-shrink-0">
          {thumbnailImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-1 w-24 h-24 rounded-lg overflow-hidden">
              {thumbnailImages.map((image, index) => (
                <div key={index} className="relative bg-gray-200">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                  {/* Overlay for additional images indicator */}
                  {index === 3 && thumbnailImages.length === 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        +{totalPOIs - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {/* Fill empty slots with placeholder */}
              {Array.from({ length: 4 - thumbnailImages.length }).map(
                (_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="bg-gray-200 flex items-center justify-center"
                  >
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
              <MapPin size={24} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {map.mapName || "Untitled Map"}
                </h3>
                <div className="badge badge-outline badge-sm">
                  <MapPin size={12} className="mr-1" />
                  Map
                </div>
                {map.isPrivate && (
                  <div className="badge badge-warning badge-sm">Private</div>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>
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
                    <Eye size={14} className="text-blue-500" />
                    <span>{map.views || 0}</span>
                  </div>
                  <div
                    className="flex items-center gap-1"
                    title={`${map.likes || 0} likes`}
                  >
                    <Heart size={14} className="text-red-500" />
                    <span>{map.likes || 0}</span>
                  </div>
                </div>
              </div>

              {/* POI and Photo counts */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>
                    {totalPOIs} point{totalPOIs !== 1 ? "s" : ""} of interest
                  </span>
                </div>
                {totalPhotos > 0 && (
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {totalPhotos} photo{totalPhotos !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Description if available */}
              {map.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {map.description}
                </p>
              )}
            </div>

            {/* Action Button */}
            {showActions && (
              <Link
                href={`/maps/${map._id}`}
                className="btn btn-primary btn-sm group-hover:btn-secondary transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <MapPin size={16} className="mr-2" />
                Explore
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapCard;
