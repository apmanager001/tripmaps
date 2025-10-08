"use client";
import React, { useState, useCallback } from "react";
import { Plus, Minus, Maximize2, Minimize2 } from "lucide-react";
import { Map, Marker } from "@vis.gl/react-maplibre";

const DEFAULT_COORDS = { lat: 37.7749, lng: -122.4194 };

const ManualMap = ({ onSetCoords, onExpandChange }) => {
  const [markerCoords, setMarkerCoords] = useState(DEFAULT_COORDS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: DEFAULT_COORDS.lat,
    longitude: DEFAULT_COORDS.lng,
    zoom: 4,
  });

  // Handle map click to move marker
  const handleMapClick = useCallback((e) => {
    const { lngLat } = e;
    setMarkerCoords({ lat: lngLat.lat, lng: lngLat.lng });
    setViewState((prev) => ({
      ...prev,
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    }));
  }, []);

  // Handle drag end for marker
  const handleMarkerDragEnd = useCallback((e) => {
    const { lngLat } = e;
    setMarkerCoords({ lat: lngLat.lat, lng: lngLat.lng });
    setViewState((prev) => ({
      ...prev,
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    }));
  }, []);

  // Pass coords to parent
  const handleSetCoords = (e) => {
    if (e) e.preventDefault();
    if (onSetCoords) {
      onSetCoords(markerCoords.lat, markerCoords.lng);
    }
    // Try to close the modal dialog if present
    const modal = document.getElementById("manualMap");
    if (modal && typeof modal.close === "function") {
      modal.close();
    }
  };
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

  return (
    <div
      className={`relative transition-all duration-300 ${
        isExpanded ? "h-full w-full" : "h-96"
      }`}
    >
      <Map
        {...viewState}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          minHeight: isExpanded ? "100vh" : "384px", // 384px = h-96
        }}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        projection="mercator"
        onClick={handleMapClick}
      >
        <Marker
          longitude={markerCoords.lng}
          latitude={markerCoords.lat}
          draggable
          onDragEnd={handleMarkerDragEnd}
        >
          <div className="relative group">
            <div
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-3 border-white transform -translate-x-1/2 -translate-y-1/2 cursor-move shadow-lg"
              title="Drag to set location"
            >
              <div className="w-3 h-3 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-sm"></div>
            </div>
          </div>
        </Marker>
      </Map>
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
      {/* Expand Button */}
      <div className="absolute top-4 right-4 z-10">
        {isExpanded ? (
          <button
            onClick={toggleExpanded}
            aria-label="Expand map"
            className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-110 backdrop-blur-sm border border-neutral-300"
          >
            <Minimize2 size={18} className="text-neutral" />
          </button>
        ) : (
          <button
            onClick={toggleExpanded}
            aria-label="Collapse map"
            className="p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-110 backdrop-blur-sm border border-neutral-300"
          >
            <Maximize2 size={18} className="text-neutral" />
          </button>
        )}
      </div>
      <div className="absolute flex justify-center top-10 w-full items-center">
        <div className="absolute flex flex-col justify-center w-96 items-center z-10 bg-white/40 py-2">
          <span className="text-xs font-mono mb-2 text-neutral">
            Lat: {markerCoords.lat.toFixed(3)}, Lng:{" "}
            {markerCoords.lng.toFixed(3)}
          </span>
          <form method="dialog">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSetCoords}
              aria-label="Use this location and close modal"
            >
              Use This Location
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualMap;
