"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, X, Flag } from "lucide-react";
import { toast } from "react-hot-toast";

const POIPhotoGallery = ({
  isOpen,
  onClose,
  poi,
  initialPhotoIndex = 0,
  onPhotoUpdate,
  showFlagButton = true,
  onFlagPhoto,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const containerRef = useRef(null);

  // Reset photo index when POI changes
  React.useEffect(() => {
    setCurrentPhotoIndex(initialPhotoIndex);
    // Reset zoom and drag state when photo changes
    setIsZoomed(false);
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setZoomOrigin({ x: 0, y: 0 });
    setHasDragged(false);
  }, [poi?._id, initialPhotoIndex]);

  if (!isOpen || !poi || !poi.photos || poi.photos.length === 0) {
    return null;
  }

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === poi.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? poi.photos.length - 1 : prev - 1
    );
  };

  const handleClose = () => {
    onClose();
  };

  const handleFlagPhoto = (e) => {
    if (onFlagPhoto) {
      // Close the photo gallery modal first
      onClose();
      // Then open the flag modal
      onFlagPhoto(e, poi.photos[currentPhotoIndex], poi);
    } else {
      toast.info("Flag functionality coming soon!");
    }
  };

  const handleMouseDown = (e) => {
    if (!isZoomed) return;

    e.preventDefault();
    setIsDragging(true);
    setHasDragged(false);
    setDragStart({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isZoomed || !isDragging) return;

    e.preventDefault();
    const newOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };

    // Check if we've moved enough to consider it a drag (threshold of 5px)
    const distance = Math.sqrt(
      Math.pow(e.clientX - (dragStart.x + dragOffset.x), 2) +
        Math.pow(e.clientY - (dragStart.y + dragOffset.y), 2)
    );

    if (distance > 5) {
      setHasDragged(true);
    }

    setDragOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset hasDragged after a short delay to allow click event to check it
    setTimeout(() => {
      setHasDragged(false);
    }, 100);
  };

  const handleZoom = (e) => {
    // Don't zoom if we just finished dragging
    if (hasDragged) {
      return;
    }

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isZoomed) {
      // Zoom in to clicked point
      const scaleX = x / rect.width;
      const scaleY = y / rect.height;

      // Calculate the zoom origin point
      const originX = scaleX * 100;
      const originY = scaleY * 100;

      setZoomOrigin({ x: originX, y: originY });
      setIsZoomed(true);
      setDragOffset({ x: 0, y: 0 });
    } else {
      // Zoom out
      setIsZoomed(false);
      setDragOffset({ x: 0, y: 0 });
      setZoomOrigin({ x: 0, y: 0 });
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-6xl h-5/6 max-h-screen bg-base-100 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
              <MapPin size={20} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg sm:text-xl text-primary truncate">
                {poi.locationName}
              </h3>
              <p className="text-sm text-neutral-600">
                Photo Gallery • {poi.photos.length} photo
                {poi.photos.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost hover:bg-error/10 hover:text-error flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-full">
          {/* Main Photo Display */}
          <div
            className="flex-1 relative bg-black overflow-hidden"
            style={{ height: "calc(100vh - 280px)" }}
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="w-full h-full flex items-center justify-center p-4 pb-8"
              style={{
                transform: isZoomed
                  ? `scale(2.5) translate(${dragOffset.x / 2.5}px, ${
                      dragOffset.y / 2.5
                    }px)`
                  : "scale(1)",
                transformOrigin: isZoomed
                  ? `${zoomOrigin.x}% ${zoomOrigin.y}%`
                  : "center center",
                transition: isZoomed ? "none" : "transform 0.3s ease-in-out",
                cursor: isZoomed
                  ? isDragging
                    ? "grabbing"
                    : "grab"
                  : "zoom-in",
              }}
              onClick={handleZoom}
            >
              <img
                src={
                  poi.photos[currentPhotoIndex]?.s3Url ||
                  poi.photos[currentPhotoIndex]?.fullUrl ||
                  "/placeholder-image.jpg"
                }
                alt={`Photo ${currentPhotoIndex + 1}`}
                className="w-auto h-auto max-w-full max-h-full object-contain pointer-events-none"
                style={{
                  maxWidth: "calc(100% - 32px)",
                  maxHeight: "calc(100% - 64px)",
                }}
              />
            </div>

            {/* Navigation Buttons */}
            {poi.photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 sm:left-6 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 sm:p-4 rounded-full hover:bg-black/80 transition-all duration-200 backdrop-blur-sm"
                >
                  <ChevronLeft size={20} className="sm:w-7 sm:h-7" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 sm:p-4 rounded-full hover:bg-black/80 transition-all duration-200 backdrop-blur-sm"
                >
                  <ChevronRight size={20} className="sm:w-7 sm:h-7" />
                </button>
              </>
            )}

            {/* Photo Counter */}
            <div className="absolute bottom-2 sm:bottom-6 left-2 sm:left-6 bg-black/60 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full backdrop-blur-sm">
              <span className="text-xs sm:text-sm font-medium">
                {currentPhotoIndex + 1} / {poi.photos.length}
              </span>
            </div>
          </div>

          {/* Sidebar with Details and Thumbnails */}
          <div className="w-full lg:w-80 bg-base-200 border-t lg:border-l lg:border-t-0 border-base-300 flex flex-col max-h-96 lg:max-h-full overflow-hidden">
            {/* Photo Details - Scrollable on mobile */}
            <div className="p-3 sm:p-6 border-b border-base-300 overflow-y-auto min-h-0 max-h-48 sm:max-h-none">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="font-semibold text-sm sm:text-lg text-primary">
                  Photo Details
                </h4>
                {showFlagButton && (
                  <button
                    onClick={handleFlagPhoto}
                    className="btn btn-xs sm:btn-sm btn-outline btn-error hover:bg-error hover:text-white transition-all duration-200"
                    title="Flag this photo"
                  >
                    <Flag size={12} className="sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Flag</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                {poi.photos[currentPhotoIndex]?.isPrimary && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-primary">
                      Primary Photo
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg">
                  <div className="p-1 sm:p-2 bg-info/20 rounded-lg">
                    <span className="text-info text-sm sm:text-lg">📅</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-500">Date Taken</p>
                    <p className="font-medium text-xs sm:text-base truncate">
                      {poi.photos[currentPhotoIndex]?.date_visited
                        ? new Date(
                            poi.photos[currentPhotoIndex].date_visited
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg">
                  <div className="p-1 sm:p-2 bg-success/20 rounded-lg">
                    <span className="text-success text-sm sm:text-lg">📤</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-500">Uploaded</p>
                    <p className="font-medium text-xs sm:text-base truncate">
                      {poi.photos[currentPhotoIndex]?.created_at
                        ? new Date(
                            poi.photos[currentPhotoIndex].created_at
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Thumbnails - Scrollable on mobile */}
            {poi.photos.length > 1 && (
              <div className="flex-1 p-3 sm:p-6 overflow-y-auto min-h-0">
                <h4 className="font-semibold text-sm sm:text-lg mb-3 sm:mb-4 text-primary">
                  All Photos
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3">
                  {poi.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === currentPhotoIndex
                          ? "border-primary shadow-lg"
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={
                          photo?.thumbnailUrl ||
                          photo?.s3Url ||
                          photo?.fullUrl ||
                          "/placeholder-image.jpg"
                        }
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-12 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {photo?.isPrimary && (
                        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-primary text-white text-xs px-1 py-0.5 rounded-full">
                          ★
                        </div>
                      )}
                      <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded-full">
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POIPhotoGallery;
