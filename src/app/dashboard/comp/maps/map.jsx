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
}) => {
  const [viewState, setViewState] = useState({
    longitude: -84.5,
    latitude: 44.5,
    zoom: zoom || 1,
  });

  // Reset view state when mapKey changes (component switch)
  useEffect(() => {
    setViewState({
      longitude: -84.5,
      latitude: 44.5,
      zoom: zoom || 1,
    });
  }, [mapKey, zoom]);

  // Calculate center when coordArray changes
  useEffect(() => {
    if (coordArray.length === 0) return;

    const calcCenter = (coords) => {
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

      const avgLat =
        validCoords.reduce((sum, p) => sum + p.lat, 0) / validCoords.length;
      const avgLon =
        validCoords.reduce((sum, p) => sum + p.lng, 0) / validCoords.length;
      return { lat: avgLat, lon: avgLon };
    };

    const center = calcCenter(coordArray);
    if (center) {
      setViewState((prev) => ({
        ...prev,
        longitude: center.lon,
        latitude: center.lat,
        zoom: zoom || (coordArray.length === 1 ? 10 : 5), // Use prop zoom or default logic
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

  return (
    <div className="h-96 overflow-hidden my-10 md:my-0 relative">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={
          isClickable
            ? (evt) => {
                const { lng, lat } = evt.lngLat;
                onMapClick && onMapClick({ lng, lat });
              }
            : undefined
        }
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        style={{ width: "100%", height: "100%", position: "relative" }}
        projection="mercator"
        reuseMaps={true}
        transformRequest={(url) => ({ url })}
        cursor={isClickable ? "crosshair" : "grab"}
      >
        {coordArray.map((point, index) => {
          // Ensure coordinates are numbers and not null/undefined
          const lng =
            typeof point.lng === "string" ? parseFloat(point.lng) : point.lng;
          const lat =
            typeof point.lat === "string" ? parseFloat(point.lat) : point.lat;

          // Skip rendering if coordinates are null, undefined, or NaN
          if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
            return null;
          }

          return (
            <Marker
              key={`marker-${lat}-${lng}-${index}`}
              longitude={lng}
              latitude={lat}
            >
              <div className="relative group">
                {/* Custom styled pin marker */}
                <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-full cursor-pointer hover:scale-110 transition-transform duration-200">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div className="absolute bottom-8 z-10 left-1/2 -translate-x-1/2 bg-white text-xs text-black rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100 border border-gray-200 min-w-48">
                  <div className="p-3">
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
