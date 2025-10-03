"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./styles.css";
import { Plus, Minus, Maximize2, Minimize2, X, RefreshCw } from "lucide-react";
import { Map, Marker } from "@vis.gl/react-maplibre";
import { createPortal } from "react-dom";

const Maps = ({ coordArray = [], onExpandChange }) => {
  const [viewState, setViewState] = useState({
    longitude: coordArray[0]?.lng || -84.5,
    latitude: coordArray[0]?.lat || 44.5,
    zoom: 15,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // For forcing map refresh

  useEffect(() => {
    const lat =
      typeof coordArray[0]?.lat === "string"
        ? parseFloat(coordArray[0]?.lat)
        : coordArray[0]?.lat;
    const lng =
      typeof coordArray[0]?.lng === "string"
        ? parseFloat(coordArray[0]?.lng)
        : coordArray[0]?.lng;
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    setViewState((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      zoom: 15,
    }));
  }, [coordArray, refreshKey]);

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

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const newExpanded = !prev;
      if (onExpandChange) onExpandChange(newExpanded);
      return newExpanded;
    });
  }, [onExpandChange]);

  const refreshMap = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const mapContent = (
    <Map
      key={`map-${refreshKey}`}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        minHeight: isExpanded ? "100vh" : "384px", // 384px = h-96
      }}
      projection="mercator"
      reuseMaps={true}
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
        const locationName =
          point.name || point.locationName || "Unknown Location";

        return (
          <Marker key={index} longitude={lng} latitude={lat}>
            <div className="relative group" data-marker-id={markerId}>
              {/* Enhanced marker with better styling and animations */}
              <div
                className={`
                  relative w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 
                  rounded-full border-3 border-white
                  transform -translate-x-1/2 -translate-y-1/2 
                  cursor-pointer transition-all duration-300 ease-out
                  hover:scale-125
                `}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${locationName}`}
              >
                {/* Inner dot */}
                <div className="w-3 h-3 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-sm"></div>

                {/* Pulse animation for active marker */}
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>

                {/* Hover glow effect */}
                <div
                  className={`
                    absolute inset-0 rounded-full bg-red-300 opacity-0 
                    transition-opacity duration-300
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
        className={`overflow-hidden relative transition-all duration-300 ${
          isExpanded ? "h-full w-full" : "h-96 w-96"
        }`}
      >
        {mapContent}

        {/* Enhanced Zoom Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom In"
            className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-110 backdrop-blur-sm border border-neutral-300"
          >
            <Plus size={18} className="text-neutral" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-110 backdrop-blur-sm border border-neutral-300"
          >
            <Minus size={18} className="text-neutral" />
          </button>
        </div>

        {/* Expand/Collapse Button */}
        <div className="absolute top-4 right-4 z-10">
          {isExpanded ? (
            <button
              onClick={toggleExpanded}
              aria-label="Collapse map"
              className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-110 backdrop-blur-sm border border-neutral-300"
            >
              <Minimize2 size={18} className="text-neutral" />
            </button>
          ) : (
            <button
              onClick={toggleExpanded}
              aria-label="Expand map"
              className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-110 backdrop-blur-sm border border-neutral-300"
            >
              <Maximize2 size={18} className="text-neutral" />
            </button>
          )}
        </div>

        {/* Refresh Map Button */}
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={refreshMap}
            aria-label="Refresh map"
            className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-110 backdrop-blur-sm border border-neutral-300"
            title="Refresh map tiles"
          >
            <RefreshCw size={18} className="text-neutral" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Maps;
