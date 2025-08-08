"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./styles.css";
import {
  Plus,
  Minus,
  Pin,
  MapPin,
  Calendar,
  Info,
  ExternalLink,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
} from "lucide-react";
import { Map, Marker } from "@vis.gl/react-maplibre";
import { createPortal } from "react-dom";

const Maps = ({
  coordArray = [],
  onMapClick,
  isClickable = false,
  zoom,
  mapKey,
  onNavigateToLocation,
  navigateToCoordinates = null,
}) => {
  const [viewState, setViewState] = useState({
    longitude: -84.5,
    latitude: 44.5,
    zoom: zoom || 1,
  });
  const [clickedMarker, setClickedMarker] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [hoveredMarkerInfo, setHoveredMarkerInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // For forcing map refresh

  // Ensure we're on the client side for portal rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset view state when mapKey changes (component switch)
  useEffect(() => {
    setViewState({
      longitude: -84.5,
      latitude: 44.5,
      zoom: zoom || 1,
    });
  }, [mapKey, zoom]);

  // Handle escape key to close expanded map
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when map is expanded
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  // Calculate center and optimal zoom when coordArray changes
  useEffect(() => {
    if (coordArray.length === 0) return;

    const calcCenterAndBounds = (coords) => {
      // Filter out coordinates that are null, undefined, or have invalid lat/lng
      const validCoords = coords.filter(
        (p) =>
          p &&
          p.lat &&
          p.lng &&
          !isNaN(p.lat) &&
          !isNaN(p.lng) &&
          typeof p.lat === "number" &&
          typeof p.lng === "number"
      );

      if (validCoords.length === 0) return null;

      // Calculate bounds
      const lats = validCoords.map((p) => p.lat);
      const lngs = validCoords.map((p) => p.lng);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      // Calculate center
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      // Calculate optimal zoom based on bounds
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);

      let optimalZoom;
      if (validCoords.length === 1) {
        optimalZoom = 12; // Single point - closer zoom
      } else if (maxDiff < 0.01) {
        optimalZoom = 14; // Very close points
      } else if (maxDiff < 0.05) {
        optimalZoom = 12; // Close points
      } else if (maxDiff < 0.1) {
        optimalZoom = 10; // Medium distance
      } else if (maxDiff < 0.5) {
        optimalZoom = 8; // Far apart
      } else if (maxDiff < 1) {
        optimalZoom = 6; // Very far apart
      } else {
        optimalZoom = 4; // Extremely far apart
      }

      // Add padding to bounds for better visual
      const padding = maxDiff * 0.1; // 10% padding
      const paddedBounds = {
        north: maxLat + padding,
        south: minLat - padding,
        east: maxLng + padding,
        west: minLng - padding,
      };

      return {
        center: { lat: centerLat, lng: centerLng },
        bounds: paddedBounds,
        zoom: optimalZoom,
      };
    };

    const result = calcCenterAndBounds(coordArray);
    if (result) {
      setViewState((prev) => ({
        ...prev,
        longitude: result.center.lng,
        latitude: result.center.lat,
        zoom: zoom || result.zoom, // Use prop zoom if provided, otherwise calculated zoom
      }));
    }
  }, [coordArray, zoom]);

  const handleZoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, 15),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, 1),
    }));
  }, []);

  const handleMarkerClick = useCallback(
    (markerId) => {
      setClickedMarker(clickedMarker === markerId ? null : markerId);
    },
    [clickedMarker]
  );

  // Close tooltip when clicking outside
  const handleMapClick = useCallback(
    (evt) => {
      if (isClickable && onMapClick) {
        const { lng, lat } = evt.lngLat;
        onMapClick({ lng, lat });
      }
      // Close any open tooltip when clicking on the map
      setClickedMarker(null);
    },
    [isClickable, onMapClick]
  );

  const navigateToLocation = useCallback((coordinates) => {
    if (coordinates && coordinates.lat && coordinates.lng) {
      // Validate coordinates
      const lat = parseFloat(coordinates.lat);
      const lng = parseFloat(coordinates.lng);

      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        console.error("Invalid coordinates:", coordinates);
        return;
      }

      setViewState((prev) => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 14, // Zoom in close to the location
      }));
    }
  }, []);

  // Handle navigation to specific coordinates when prop changes
  useEffect(() => {
    if (
      navigateToCoordinates &&
      navigateToCoordinates.lat &&
      navigateToCoordinates.lng
    ) {
      const lat = parseFloat(navigateToCoordinates.lat);
      const lng = parseFloat(navigateToCoordinates.lng);

      if (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        setViewState((prev) => ({
          ...prev,
          longitude: lng,
          latitude: lat,
          zoom: 14,
        }));
      }
    }
  }, [navigateToCoordinates]);

  // Get primary or first photo for a point
  const getPrimaryPhoto = (point) => {
    if (point.thumbnailUrl || point.image) {
      return point.thumbnailUrl || point.image;
    }

    if (point.photos && point.photos.length > 0) {
      const primaryPhoto =
        point.photos.find((p) => p?.isPrimary) || point.photos[0];
      return primaryPhoto?.thumbnailUrl || primaryPhoto?.s3Url;
    }

    return null;
  };

  // Helper function to get current tooltip position
  const getTooltipPosition = useCallback((markerId) => {
    return "right"; // Always position to the right
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const refreshMap = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const mapContent = (
    <Map
      key={`map-${refreshKey}`}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      onClick={handleMapClick}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        minHeight: isExpanded ? "100vh" : "384px", // 384px = h-96
      }}
      projection="mercator"
      reuseMaps={true}
      transformRequest={(url) => ({ url })}
      cursor={isClickable ? "crosshair" : "grab"}
    >
      {coordArray.map((point, index) => {
        // Ensure coordinates are numbers and not null/undefined
        let lng = point.lng;
        let lat = point.lat;

        // Handle string coordinates
        if (typeof lng === "string") {
          lng = parseFloat(lng);
        }
        if (typeof lat === "string") {
          lat = parseFloat(lat);
        }

        // Skip rendering if coordinates are null, undefined, NaN, or out of valid ranges
        if (
          !lng ||
          !lat ||
          isNaN(lng) ||
          isNaN(lat) ||
          lat < -90 ||
          lat > 90 || // Valid latitude range
          lng < -180 ||
          lng > 180 // Valid longitude range
        ) {
          console.warn(`Invalid coordinates for point ${index}:`, point);
          return null;
        }

        const markerId = `marker-${lat}-${lng}-${index}`;
        const isTooltipVisible = clickedMarker === markerId;
        const isHovered = hoveredMarker === markerId;
        const primaryPhoto = getPrimaryPhoto(point);
        const locationName =
          point.name || point.locationName || "Unknown Location";

        return (
          <Marker key={markerId} longitude={lng} latitude={lat}>
            <div className="relative group" data-marker-id={markerId}>
              {/* Enhanced marker with better styling and animations */}
              <div
                className={`
                  relative w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 
                  rounded-full border-3 border-white shadow-lg 
                  transform -translate-x-1/2 -translate-y-1/2 
                  cursor-pointer transition-all duration-300 ease-out
                  hover:scale-125 hover:shadow-xl
                  ${isHovered ? "scale-110 shadow-lg" : ""}
                  ${
                    isTooltipVisible
                      ? "scale-110 shadow-xl ring-2 ring-blue-400"
                      : ""
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkerClick(markerId);
                }}
                onMouseEnter={() => {
                  setHoveredMarker(markerId);
                  setHoveredMarkerInfo(point);
                }}
                onMouseLeave={() => {
                  setHoveredMarker(null);
                  setHoveredMarkerInfo(null);
                }}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${locationName}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMarkerClick(markerId);
                  }
                }}
              >
                {/* Inner dot */}
                <div className="w-3 h-3 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-sm"></div>

                {/* Pulse animation for active marker */}
                {isTooltipVisible && (
                  <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
                )}

                {/* Hover glow effect */}
                <div
                  className={`
                    absolute inset-0 rounded-full bg-red-300 opacity-0 
                    transition-opacity duration-300
                    ${isHovered ? "opacity-50" : ""}
                  `}
                ></div>
              </div>
            </div>
          </Marker>
        );
      })}
    </Map>
  );

  return (
    <>
      {/* Regular Map View */}
      <div
        id="map"
        className={`overflow-hidden my-10 md:my-0 relative transition-all duration-300 ${
          isExpanded ? "hidden" : "h-96"
        }`}
      >
        {mapContent}

        {/* Enhanced Zoom Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom In"
            className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl backdrop-blur-sm border border-gray-200"
          >
            <Plus size={18} className="text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl backdrop-blur-sm border border-gray-200"
          >
            <Minus size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Expand Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleExpanded}
            aria-label="Expand map"
            className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl backdrop-blur-sm border border-gray-200"
          >
            <Maximize2 size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Map Info Panel */}
        {coordArray.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Map Info</div>
              <div>
                {coordArray.length} location{coordArray.length !== 1 ? "s" : ""}
              </div>
              <div>Zoom: {Math.round(viewState.zoom)}</div>
            </div>
          </div>
        )}

        {/* Refresh Map Button */}
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={refreshMap}
            aria-label="Refresh map"
            className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl backdrop-blur-sm border border-gray-200"
            title="Refresh map tiles"
          >
            <RefreshCw size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Marker Info Panel */}
        {hoveredMarkerInfo && (
          <div className="absolute bottom-4 left-4 z-10 max-w-sm">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 p-4">
              {/* Header with location name */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {hoveredMarkerInfo.name ||
                      hoveredMarkerInfo.locationName ||
                      "Unknown Location"}
                  </h3>
                </div>
                {hoveredMarkerInfo._id && (
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `/point_of_interest/${hoveredMarkerInfo._id}`,
                        "_blank"
                      );
                    }}
                    aria-label="Open location details"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Thumbnail Image */}
              {getPrimaryPhoto(hoveredMarkerInfo) && (
                <div className="mb-3">
                  <div className="relative h-24 overflow-hidden rounded-lg">
                    <img
                      src={getPrimaryPhoto(hoveredMarkerInfo)}
                      alt={
                        hoveredMarkerInfo.name || hoveredMarkerInfo.locationName
                      }
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {/* Photo count badge if multiple photos */}
                    {hoveredMarkerInfo.photos &&
                      hoveredMarkerInfo.photos.length > 1 && (
                        <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                          +{hoveredMarkerInfo.photos.length - 1} more
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Description */}
              {hoveredMarkerInfo.description && (
                <div className="mb-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {hoveredMarkerInfo.description.length > 80
                        ? `${hoveredMarkerInfo.description.substring(0, 80)}...`
                        : hoveredMarkerInfo.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Visit Date */}
              {hoveredMarkerInfo.date_visited && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">Visited:</span>
                    <span>
                      {new Date(
                        hoveredMarkerInfo.date_visited
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Coordinates */}
              <div className="bg-gray-50 rounded-lg p-2 mb-2">
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Lat:</span>
                    <code className="font-mono text-gray-800 bg-white px-1 rounded text-xs">
                      {parseFloat(hoveredMarkerInfo.lat).toFixed(4)}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Lng:</span>
                    <code className="font-mono text-gray-800 bg-white px-1 rounded text-xs">
                      {parseFloat(hoveredMarkerInfo.lng).toFixed(4)}
                    </code>
                  </div>
                </div>
                <button
                  className="mt-1 w-full text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(
                      `${parseFloat(hoveredMarkerInfo.lat).toFixed(
                        6
                      )}, ${parseFloat(hoveredMarkerInfo.lng).toFixed(6)}`
                    );
                  }}
                >
                  Copy coordinates
                </button>
              </div>

              {/* Tags if available */}
              {hoveredMarkerInfo.tags && hoveredMarkerInfo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {hoveredMarkerInfo.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {typeof tag === "object" ? tag.name : tag}
                    </span>
                  ))}
                  {hoveredMarkerInfo.tags.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{hoveredMarkerInfo.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Map View */}
      {isExpanded &&
        isClient &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm">
            <div className="relative w-screen h-screen bg-white overflow-hidden">
              {/* Expanded Map Header */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Interactive Map
                  </h2>
                  <p className="text-sm text-gray-600">
                    {coordArray.length} location
                    {coordArray.length !== 1 ? "s" : ""} • Zoom:{" "}
                    {Math.round(viewState.zoom)}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={toggleExpanded}
                  aria-label="Close expanded map"
                  className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl backdrop-blur-sm border border-gray-200"
                >
                  <X size={18} className="text-gray-700" />
                </button>
              </div>

              {/* Expanded Map Content */}
              <div
                className="w-full h-full relative"
                style={{ height: "calc(100vh - 80px)", marginTop: "80px" }}
              >
                <div
                  className="w-full h-full"
                  style={{ width: "100vw", height: "calc(100vh - 80px)" }}
                >
                  <Map
                    key={`map-${refreshKey}`}
                    {...viewState}
                    onMove={(evt) => setViewState(evt.viewState)}
                    onClick={handleMapClick}
                    mapStyle="https://tiles.openfreemap.org/styles/bright"
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      minHeight: "calc(100vh - 80px)",
                    }}
                    projection="mercator"
                    reuseMaps={true}
                    transformRequest={(url) => ({ url })}
                    cursor={isClickable ? "crosshair" : "grab"}
                  >
                    {coordArray.map((point, index) => {
                      // Ensure coordinates are numbers and not null/undefined
                      let lng = point.lng;
                      let lat = point.lat;

                      // Handle string coordinates
                      if (typeof lng === "string") {
                        lng = parseFloat(lng);
                      }
                      if (typeof lat === "string") {
                        lat = parseFloat(lat);
                      }

                      // Skip rendering if coordinates are null, undefined, NaN, or out of valid ranges
                      if (
                        !lng ||
                        !lat ||
                        isNaN(lng) ||
                        isNaN(lat) ||
                        lat < -90 ||
                        lat > 90 || // Valid latitude range
                        lng < -180 ||
                        lng > 180 // Valid longitude range
                      ) {
                        console.warn(
                          `Invalid coordinates for point ${index}:`,
                          point
                        );
                        return null;
                      }

                      const markerId = `marker-${lat}-${lng}-${index}`;
                      const isTooltipVisible = clickedMarker === markerId;
                      const isHovered = hoveredMarker === markerId;
                      const primaryPhoto = getPrimaryPhoto(point);
                      const locationName =
                        point.name || point.locationName || "Unknown Location";

                      return (
                        <Marker key={markerId} longitude={lng} latitude={lat}>
                          <div
                            className="relative group"
                            data-marker-id={markerId}
                          >
                            {/* Enhanced marker with better styling and animations */}
                            <div
                              className={`
                              relative w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 
                              rounded-full border-3 border-white shadow-lg 
                              transform -translate-x-1/2 -translate-y-1/2
                              cursor-pointer transition-all duration-300 ease-out
                              hover:scale-125 hover:shadow-xl
                              ${isHovered ? "scale-110 shadow-lg" : ""}
                              ${
                                isTooltipVisible
                                  ? "scale-110 shadow-xl ring-2 ring-blue-400"
                                  : ""
                              }
                            `}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkerClick(markerId);
                              }}
                              onMouseEnter={() => {
                                setHoveredMarker(markerId);
                                setHoveredMarkerInfo(point);
                              }}
                              onMouseLeave={() => {
                                setHoveredMarker(null);
                                setHoveredMarkerInfo(null);
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label={`View details for ${locationName}`}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleMarkerClick(markerId);
                                }
                              }}
                            >
                              {/* Inner dot */}
                              <div className="w-3 h-3 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-sm"></div>

                              {/* Pulse animation for active marker */}
                              {isTooltipVisible && (
                                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
                              )}

                              {/* Hover glow effect */}
                              <div
                                className={`
                                absolute inset-0 rounded-full bg-red-300 opacity-0 
                                transition-opacity duration-300
                                ${isHovered ? "opacity-50" : ""}
                              `}
                              ></div>
                            </div>
                          </div>
                        </Marker>
                      );
                    })}
                  </Map>
                </div>

                {/* Enhanced Zoom Controls for Expanded View */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <button
                    onClick={handleZoomIn}
                    aria-label="Zoom In"
                    className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl backdrop-blur-sm border border-gray-200"
                  >
                    <Plus size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    aria-label="Zoom Out"
                    className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl backdrop-blur-sm border border-gray-200"
                  >
                    <Minus size={18} className="text-gray-700" />
                  </button>
                </div>

                {/* Minimize Button */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={toggleExpanded}
                    aria-label="Minimize map"
                    className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl backdrop-blur-sm border border-gray-200"
                  >
                    <Minimize2 size={18} className="text-gray-700" />
                  </button>
                </div>

                {/* Refresh Map Button for Expanded View */}
                <div className="absolute bottom-4 right-4 z-10">
                  <button
                    onClick={refreshMap}
                    aria-label="Refresh map"
                    className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl backdrop-blur-sm border border-gray-200"
                    title="Refresh map tiles"
                  >
                    <RefreshCw size={18} className="text-gray-700" />
                  </button>
                </div>

                {/* Marker Info Panel for Expanded View */}
                {hoveredMarkerInfo && (
                  <div className="absolute bottom-4 left-4 z-10 max-w-sm">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 p-4">
                      {/* Header with location name */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                            {hoveredMarkerInfo.name ||
                              hoveredMarkerInfo.locationName ||
                              "Unknown Location"}
                          </h3>
                        </div>
                        {hoveredMarkerInfo._id && (
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `/point_of_interest/${hoveredMarkerInfo._id}`,
                                "_blank"
                              );
                            }}
                            aria-label="Open location details"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Thumbnail Image */}
                      {getPrimaryPhoto(hoveredMarkerInfo) && (
                        <div className="mb-3">
                          <div className="relative h-24 overflow-hidden rounded-lg">
                            <img
                              src={getPrimaryPhoto(hoveredMarkerInfo)}
                              alt={
                                hoveredMarkerInfo.name ||
                                hoveredMarkerInfo.locationName
                              }
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            {/* Photo count badge if multiple photos */}
                            {hoveredMarkerInfo.photos &&
                              hoveredMarkerInfo.photos.length > 1 && (
                                <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                  +{hoveredMarkerInfo.photos.length - 1} more
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {hoveredMarkerInfo.description && (
                        <div className="mb-2">
                          <div className="flex items-start gap-2">
                            <Info className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {hoveredMarkerInfo.description.length > 80
                                ? `${hoveredMarkerInfo.description.substring(
                                    0,
                                    80
                                  )}...`
                                : hoveredMarkerInfo.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Visit Date */}
                      {hoveredMarkerInfo.date_visited && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">Visited:</span>
                            <span>
                              {new Date(
                                hoveredMarkerInfo.date_visited
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Coordinates */}
                      <div className="bg-gray-50 rounded-lg p-2 mb-2">
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Lat:</span>
                            <code className="font-mono text-gray-800 bg-white px-1 rounded text-xs">
                              {parseFloat(hoveredMarkerInfo.lat).toFixed(4)}
                            </code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Lng:</span>
                            <code className="font-mono text-gray-800 bg-white px-1 rounded text-xs">
                              {parseFloat(hoveredMarkerInfo.lng).toFixed(4)}
                            </code>
                          </div>
                        </div>
                        <button
                          className="mt-1 w-full text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(
                              `${parseFloat(hoveredMarkerInfo.lat).toFixed(
                                6
                              )}, ${parseFloat(hoveredMarkerInfo.lng).toFixed(
                                6
                              )}`
                            );
                          }}
                        >
                          Copy coordinates
                        </button>
                      </div>

                      {/* Tags if available */}
                      {hoveredMarkerInfo.tags &&
                        hoveredMarkerInfo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {hoveredMarkerInfo.tags
                              .slice(0, 3)
                              .map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                  {typeof tag === "object" ? tag.name : tag}
                                </span>
                              ))}
                            {hoveredMarkerInfo.tags.length > 3 && (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                +{hoveredMarkerInfo.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Maps;
