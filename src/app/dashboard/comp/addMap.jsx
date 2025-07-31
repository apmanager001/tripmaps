"use client";
import React, { useState, useRef } from "react";
import Script from "next/script";
import { toast } from "react-hot-toast";
import POImap from "./rightMap";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  Plus,
  MapPin,
} from "lucide-react";
import Maps from "./maps/map";
import { useQuery } from "@tanstack/react-query";
import { poiApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import POICreationInterface from "@/components/utility/poi/POICreationInterface";
import POICard from "@/components/POICard";

const AddMaps = () => {
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [coordArray, setCoordArray] = useState([]);
  const [isMapClickable, setIsMapClickable] = useState(false);
  const [mapName, setMapName] = useState("");

  // POI search states
  const [poiSearchQuery, setPoiSearchQuery] = useState("");
  const [showPoiSearch, setShowPoiSearch] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // POI search query - comprehensive search (name, tags, description) - public POIs only
  const { data: poiSearchResults, refetch: refetchPoiSearch } = useQuery({
    queryKey: ["poiSearch", poiSearchQuery],
    queryFn: async () => {
      if (!poiSearchQuery || poiSearchQuery.length < 2) return { pois: [] };
      const response = await poiApi.searchPOIsComprehensive(poiSearchQuery);
      return response.data || { pois: [] };
    },
    enabled: poiSearchQuery.length >= 2,
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file sizes
    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = files.filter((file) => file.size > maxSize);

    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map((file) => file.name).join(", ");
      toast.error(`Files too large (max 10MB): ${fileNames}`);
      e.target.value = "";
      return;
    }

    // Validate file types
    const invalidTypes = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidTypes.length > 0) {
      const fileNames = invalidTypes.map((file) => file.name).join(", ");
      toast.error(`Invalid file types (images only): ${fileNames}`);
      e.target.value = "";
      return;
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setImages(previews);
    setCurrentIndex(0);

    // Process each uploaded file
    files.forEach((file, index) => {
      extractExifData(file, index);
    });

    // Clear the file input after processing
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setImages([]);
      setCurrentIndex(0);
    }, 1000); // Small delay to show the success message
  };

  const extractExifData = (file, imageIndex = 0) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const image = new Image();
      image.src = e.target.result;
      image.onload = function () {
        EXIF.getData(image, function () {
          const exif = EXIF.getAllTags(this);
          console.log(exif);

          let lat = null;
          let lng = null;
          let dateVisited = null;

          // Extract GPS coordinates
          if (exif.GPSLatitude && exif.GPSLongitude) {
            lat = toDecimal(exif.GPSLatitude, exif.GPSLatitudeRef);
            lng = toDecimal(exif.GPSLongitude, exif.GPSLongitudeRef);
          }

          // Extract date information (try multiple EXIF date fields)
          if (exif.DateTimeOriginal) {
            dateVisited = formatExifDate(exif.DateTimeOriginal);
          } else if (exif.DateTime) {
            dateVisited = formatExifDate(exif.DateTime);
          } else if (exif.DateTimeDigitized) {
            dateVisited = formatExifDate(exif.DateTimeDigitized);
          }

          // Automatically add POI to the map builder if coordinates are found
          if (lat && lng) {
            const newPOI = {
              lat: lat,
              lng: lng,
              locationName: `Location ${coordArray.length + 1}`,
              description: "",
              date_visited: dateVisited || new Date().toISOString(),
              tags: [],
              image: e.target.result, // Use the data URL
              googleMapsLink: "",
              isPrivate: false,
              isExistingPOI: false,
            };

            // Use setTimeout to ensure state updates happen after render cycle
            setTimeout(() => {
              setCoordArray((prev) => {
                const updatedArray = [...prev, newPOI];
                // Show success message for the first POI added from this batch
                if (prev.length === 0) {
                  setTimeout(() => {
                    toast.success(
                      "POI added to map builder! Edit the details below."
                    );
                  }, 0);
                }
                return updatedArray;
              });
            }, 0);
          }

          setCoordinates({ lat, lng, date_visited: dateVisited });
        });
      };
    };
    reader.readAsDataURL(file);
  };

  const toDecimal = (arr, ref) => {
    if (!arr || !ref) return null;
    let deg = arr[0] + arr[1] / 60 + arr[2] / 3600;
    return ref === "S" || ref === "W" ? -deg : deg;
  };

  const formatExifDate = (dateString) => {
    if (!dateString) return null;

    // EXIF date format is typically "YYYY:MM:DD HH:MM:SS"
    // Convert to ISO format for better compatibility
    try {
      const [datePart, timePart] = dateString.split(" ");
      const [year, month, day] = datePart.split(":");
      const [hour, minute, second] = timePart.split(":");

      // Create a proper Date object
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );

      return date.toISOString();
    } catch (error) {
      console.error("Error parsing EXIF date:", error);
      return null;
    }
  };

  const handleClick = () => {
    setCoordArray((prev) => [...prev, coordinates]);
  };

  const handleMapClick = (coords) => {
    setCoordinates({ lat: coords.lat, lng: coords.lng });

    // Automatically add the clicked location to the map builder
    const newPOI = {
      lat: coords.lat,
      lng: coords.lng,
      locationName: `Location ${coordArray.length + 1}`,
      description: "",
      date_visited: new Date().toISOString().split("T")[0],
      tags: [],
      image: null,
      googleMapsLink: "",
      isPrivate: false,
      isExistingPOI: false,
    };

    setCoordArray((prev) => [...prev, newPOI]);
    toast.success(
      `Location added: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
    );
  };

  const toggleMapClickable = () => {
    setIsMapClickable(!isMapClickable);
    if (!isMapClickable) {
      toast.success("Click anywhere on the map to add a location!");
    }
  };

  const handleNextImage = () => {
    const next = (currentIndex + 1) % images.length;
    setCurrentIndex(next);
    extractExifData(fileInputRef.current.files[next]);
  };

  const handlePrevImage = () => {
    const prev = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prev);
    extractExifData(fileInputRef.current.files[prev]);
  };

  // POI search handlers
  const handlePoiSearch = () => {
    if (poiSearchQuery.trim().length >= 2) {
      refetchPoiSearch();
      setShowPoiSearch(true);
    }
  };

  const handleAddPoiToMap = (poi) => {
    // Validate coordinates before adding
    if (!poi.lat || !poi.lng || isNaN(poi.lat) || isNaN(poi.lng)) {
      toast.error("Invalid coordinates for this POI");
      return;
    }

    // Add the full POI data to the map builder
    const poiWithInfo = {
      poi_id: poi._id,
      isExistingPOI: true,
      // Include all the display data we need
      lat: poi.lat,
      lng: poi.lng,
      locationName: poi.locationName,
      description: poi.description || "",
      date_visited: poi.date_visited,
      tags: poi.tags || [],
      googleMapsLink: poi.googleMapsLink || "",
      isPrivate: poi.isPrivate || false,
      photos: poi.photos || [],
    };
    setCoordArray((prev) => [...prev, poiWithInfo]);
    toast.success(`Added ${poi.locationName} to map!`);
    setShowPoiSearch(false);
    setPoiSearchQuery("");
  };

  return (
    <div className="pb-6 space-y-6 w-full">
      <Script
        src="https://cdn.jsdelivr.net/npm/exif-js"
        strategy="afterInteractive"
      />

      <div className="text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
          Create A Map
        </h2>
        {mapName && (
          <p className="text-neutral-600 text-lg">
            Creating:{" "}
            <span className="font-semibold text-primary">{mapName}</span>
          </p>
        )}
      </div>

      {/* Map Name Input */}
      <div className="bg-base-200 p-4 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
              />
            </svg>
          </div>
          <div className="flex-1">
            <label htmlFor="mapNameInput" className="label">
              <span className="label-text font-semibold text-primary">
                Map Name *
              </span>
            </label>
            <input
              id="mapNameInput"
              type="text"
              placeholder="Enter a name for your map..."
              className="input input-bordered w-full"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              aria-label="Enter map name"
            />
            {!mapName.trim() && (
              <p className="text-xs text-warning mt-1">
                ⚠️ Map name is required to save your map
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-base-200 p-4 rounded-lg shadow ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Map View</h3>
          <button
            id="mapToggleClickButton"
            onClick={toggleMapClickable}
            className={`btn btn-sm ${
              isMapClickable ? "btn-accent" : "btn-ghost"
            }`}
          >
            {isMapClickable ? "🖱️ Click Mode Active" : "📍 Enable Click to Add"}
          </button>
        </div>
        <Maps
          key="addMap-map"
          mapKey="addMap-map"
          coordArray={coordArray}
          onMapClick={handleMapClick}
          isClickable={isMapClickable}
        />
      </div>

      {/* POI Creation Interface */}
      <POICreationInterface />

      {/* POI Search Section */}
      <div className="bg-base-200 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Search size={20} className="text-info" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Search For POIs
              </h3>
              <p className="text-sm text-neutral-600">
                Search public POIs or your private ones
              </p>
            </div>
          </div>
        </div>

        {/* POI Search */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              id="poiSearchInput"
              type="text"
              placeholder="Search for existing POIs..."
              className="input input-bordered flex-1"
              value={poiSearchQuery}
              onChange={(e) => setPoiSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handlePoiSearch()}
              autoComplete="off"
            />
            <button
              id="poiSearchButton"
              onClick={handlePoiSearch}
              className="btn btn-primary"
              disabled={poiSearchQuery.length < 2}
            >
              <Search size={16} />
            </button>
          </div>

          {/* Search Results */}
          {showPoiSearch && poiSearchResults?.pois && (
            <div className="bg-base-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Search Results</h4>
              {poiSearchResults.pois.length === 0 ? (
                <div className="text-center py-6 text-neutral-500">
                  <div className="p-3 bg-base-300 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search size={24} className="opacity-50" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">No POIs Found</h4>
                  <p className="text-neutral-600 mb-4">
                    No public POIs or your private POIs match "{poiSearchQuery}"
                  </p>
                  <p className="text-sm text-neutral-500">
                    Try a different search term or upload photos to add new
                    locations
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {poiSearchResults.pois.map((poi) => (
                    <div key={poi._id} className="relative">
                      <POICard
                        poi={poi}
                        showActions={false}
                        showLikeButton={true}
                        showFlagButton={false}
                        compact={true}
                        className="h-full"
                      />

                      {/* Description Preview Overlay */}
                      {poi.description && (
                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg p-2">
                          <p className="text-xs text-white line-clamp-1 opacity-90">
                            {poi.description}
                          </p>
                        </div>
                      )}

                      <button
                        id={`poiAddToMapButton-${poi._id}`}
                        onClick={() => handleAddPoiToMap(poi)}
                        className="btn btn-sm btn-primary absolute top-2 right-2 z-10"
                      >
                        Add to Map
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="bg-base-200 p-6 space-y-6 rounded-lg shadow-md">
        <POImap
          coordArray={coordArray}
          setCoordArray={setCoordArray}
          mapName={mapName}
        />
      </div>
    </div>
  );
};

export default AddMaps;
