"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./styles.css";
import { Plus, Minus, Pin } from "lucide-react";
import { Map, Marker } from "@vis.gl/react-maplibre";

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

  // Reset view state when mapKey changes (component switch)
  useEffect(() => {
    setViewState({
      longitude: -84.5,
      latitude: 44.5,
      zoom: zoom || 1,
    });
  }, [mapKey, zoom]);

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

  return (
    <div id="map" className="h-96 overflow-hidden my-10 md:my-0 relative">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        style={{ width: "100%", height: "100%", position: "relative" }}
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

          return (
            <Marker key={markerId} longitude={lng} latitude={lat}>
              <div className="relative group">
                {/* Custom styled pin marker */}
                <div
                  className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-full cursor-pointer hover:scale-110 transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkerClick(markerId);
                  }}
                >
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div
                  className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-xs text-black rounded-lg shadow-lg transition-all duration-200 transform border border-gray-200 min-w-64 ${
                    isTooltipVisible
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                  }`}
                  style={{ zIndex: 9999 }}
                >
                  <div className="p-3">
                    {/* Thumbnail Image */}
                    {(point.thumbnailUrl ||
                      point.image ||
                      point.photos?.[0]?.thumbnailUrl ||
                      point.photos?.[0]?.s3Url) && (
                      <div className="mb-3">
                        <img
                          src={
                            point.thumbnailUrl ||
                            point.image ||
                            point.photos?.[0]?.thumbnailUrl ||
                            point.photos?.[0]?.s3Url
                          }
                          alt={point.name || point.locationName || "Location"}
                          className="w-full h-24 object-cover rounded-md shadow-sm"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Location Name */}
                    <div className="font-semibold text-sm text-gray-800 mb-2 border-b border-gray-100 pb-1">
                      {point.name || point.locationName || "Unknown Location"}
                    </div>

                    {/* Coordinates */}
                    <div className="text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium">Latitude:</span>
                        <span className="font-mono">{lat.toFixed(6)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Longitude:</span>
                        <span className="font-mono">{lng.toFixed(6)}</span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {point.description && (
                      <div className="text-xs text-gray-700 mb-2">
                        <span className="font-medium">Notes:</span>{" "}
                        {point.description}
                      </div>
                    )}

                    {/* Visit Date if available */}
                    {point.date_visited && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Visited:</span>{" "}
                        {new Date(point.date_visited).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Arrow pointing to marker */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Zoom Controls */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 ">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom In"
          className="p-4 bg-white hover:bg-gray-100 rounded shadow-md cursor-pointer"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom Out"
          className="p-4 bg-white hover:bg-gray-100 rounded shadow-md cursor-pointer"
        >
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
};

export default Maps;
