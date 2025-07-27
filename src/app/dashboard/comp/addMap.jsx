"use client";
import React, { useState, useRef } from "react";
import Script from "next/script";
import { toast } from "react-hot-toast";
import POImap from "./rightMap";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import Maps from "./maps/map";

const AddMaps = () => {
  const fileInputRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [coordArray, setCoordArray] = useState([]);
  const [isMapClickable, setIsMapClickable] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages(previews);
    setCurrentIndex(0);
    if (files.length > 0) extractExifData(files[0]);
  };

  const extractExifData = (file) => {
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
    toast.success(
      `Location selected: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
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

  return (
    <div className="pb-6 space-y-6 w-full">
      <Script
        src="https://cdn.jsdelivr.net/npm/exif-js"
        strategy="afterInteractive"
      />
      <h2 className="text-2xl font-bold text-primary">Upload Your Photos</h2>
      <div className="bg-base-200 p-4 rounded-lg shadow ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Map View</h3>
          <button
            id="toggleMapClickButton"
            onClick={toggleMapClickable}
            className={`btn btn-sm ${
              isMapClickable ? "btn-accent" : "btn-ghost"
            }`}
          >
            {isMapClickable ? "🖱️ Click Mode Active" : "📍 Enable Click to Add"}
          </button>
        </div>
        <Maps
          coordArray={coordArray}
          onMapClick={handleMapClick}
          isClickable={isMapClickable}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-2 items-stretch min-h-96">
        <div className="w-full md:flex-[1] md:px-10 p-6 space-y-6 bg-base-100 rounded-lg shadow-md flex flex-col justify-start ">
          <div className="flex items-center gap-2">
            <Info className="text-info w-5 h-5" />
            <p className="text-sm text-neutral-600">
              Upload GPS-tagged images to extract location data.
            </p>
          </div>

          <input
            type="file"
            id="fileInput"
            name="otherFiles"
            accept="image/*"
            className="file-input file-input-bordered file-input-primary w-full max-w-md z-10 font-extrabold"
            onChange={handleImageChange}
            ref={fileInputRef}
            multiple
          />
          {images.length > 0 && (
            <div className="flex items-center justify-center gap-4">
              <button
                id="prevImageButton"
                onClick={handlePrevImage}
                className="btn btn-soft btn-md btn-primary rounded-2xl"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <img
                id="imagePreview"
                src={images[currentIndex]}
                alt={`Preview ${currentIndex + 1}`}
                className="w-64 h-64 object-cover rounded shadow"
              />

              <button
                id="nextImageButton"
                onClick={handleNextImage}
                className="btn btn-soft btn-md btn-primary rounded-2xl"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Manual Coordinate Input */}
          <div className="space-y-4">
            <div className="divider">OR</div>
            <div className="text-center">
              <h4 className="font-semibold mb-3">Add Location Manually</h4>
              <div className="flex gap-2 justify-center">
                <input
                  type="number"
                  id="latitudeInput"
                  name="latitude"
                  step="any"
                  placeholder="Latitude"
                  className="input input-bordered input-sm w-32"
                  value={coordinates.lat || ""}
                  onChange={(e) =>
                    setCoordinates((prev) => ({
                      ...prev,
                      lat: parseFloat(e.target.value) || null,
                    }))
                  }
                />
                <input
                  type="number"
                  id="longitudeInput"
                  name="longitude"
                  step="any"
                  placeholder="Longitude"
                  className="input input-bordered input-sm w-32"
                  value={coordinates.lng || ""}
                  onChange={(e) =>
                    setCoordinates((prev) => ({
                      ...prev,
                      lng: parseFloat(e.target.value) || null,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Location Feedback */}
          {coordinates.lat && coordinates.lng ? (
            <div className="space-y-2 flex flex-col items-center justify-center">
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                📍 Location: {coordinates.lat.toFixed(6)},{" "}
                {coordinates.lng.toFixed(6)}
              </div>
              <button
                id="addToMapButton"
                onClick={handleClick}
                className="btn btn-primary"
              >
                Add to Map
              </button>
              {coordinates.date_visited && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  📅 Date Taken:{" "}
                  {new Date(coordinates.date_visited).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : images[0] && !coordinates.lat ? (
            <p className="text-red-500 font-semibold">
              This image doesn't have location info.
            </p>
          ) : null}
        </div>
        <div className="w-full md:flex-[2] p-6 space-y-6 bg-base-100 rounded-lg shadow-md">
          <POImap coordArray={coordArray} setCoordArray={setCoordArray} />
        </div>
      </div>
    </div>
  );
};

export default AddMaps;
