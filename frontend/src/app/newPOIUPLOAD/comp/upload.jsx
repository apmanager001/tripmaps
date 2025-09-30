"use client";
import { useRef, useState, useEffect } from "react";
import {
  MapPin,
  MapPinCheckInside,
  Trash2,
  Plus,
  X,
  Upload,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const UploadComponent = () => {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // State management
  const [poiArray, setPoiArray] = useState([]);
  const [isMapClickable, setIsMapClickable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mapName, setMapName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // File input handler
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Process uploaded files
  const handleFiles = (files) => {
    // Validate file sizes
    const maxSize = 15 * 1024 * 1024; // 15MB
    const invalidFiles = files.filter((file) => file.size > maxSize);

    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map((file) => file.name).join(", ");
      toast.error(`Files too large (max 15MB): ${fileNames}`);
      return;
    }

    // Validate file types
    const invalidTypes = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidTypes.length > 0) {
      const fileNames = invalidTypes.map((file) => file.name).join(", ");
      toast.error(`Invalid file types (images only): ${fileNames}`);
      return;
    }

    // Process each file
    files.forEach((file) => {
      extractExifData(file);
    });
  };

  // Extract EXIF data from photos
  const extractExifData = (file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const image = new Image();
      image.src = e.target.result;
      image.onload = function () {
        // Check if EXIF library is available
        if (typeof EXIF !== "undefined" && EXIF.getData) {
          EXIF.getData(image, function () {
            const exif = EXIF.getAllTags(this);

            let lat = null;
            let lng = null;
            let dateVisited = null;

            // Extract GPS coordinates
            if (exif.GPSLatitude && exif.GPSLongitude) {
              lat = toDecimal(exif.GPSLatitude, exif.GPSLatitudeRef);
              lng = toDecimal(exif.GPSLongitude, exif.GPSLongitudeRef);
            }

            // Extract date information
            if (exif.DateTimeOriginal) {
              dateVisited = formatExifDate(exif.DateTimeOriginal);
            } else if (exif.DateTime) {
              dateVisited = formatExifDate(exif.DateTime);
            } else if (exif.CreateDate) {
              dateVisited = formatExifDate(exif.CreateDate);
            }

            // Create POI from EXIF data
            if (lat && lng) {
              const newPOI = {
                lat,
                lng,
                locationName: `Photo Location ${poiArray.length + 1}`,
                date_visited: dateVisited || new Date().toISOString(),
                tags: [],
                photos: [
                  {
                    file: file,
                    url: URL.createObjectURL(file),
                    date_visited: dateVisited || new Date().toISOString(),
                    isPrimary: true,
                  },
                ],
                description: "",
                googleMapsLink: "",
                isPrivate: false,
              };

              setPoiArray((prev) => [...prev, newPOI]);
              toast.success(
                `Photo location added: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
              );
            } else {
              // No GPS data, create POI without coordinates
              const newPOI = {
                lat: null,
                lng: null,
                locationName: `Photo Location ${poiArray.length + 1}`,
                date_visited: new Date().toISOString(),
                tags: [],
                photos: [
                  {
                    file: file,
                    url: URL.createObjectURL(file),
                    date_visited: new Date().toISOString(),
                    isPrimary: true,
                  },
                ],
                description: "",
                googleMapsLink: "",
                isPrivate: false,
              };

              setPoiArray((prev) => [...prev, newPOI]);
              toast.success(
                "Photo added! Please set coordinates manually on the map."
              );
            }
          });
        } else {
          // EXIF library not available
          const newPOI = {
            lat: null,
            lng: null,
            locationName: `Photo Location ${poiArray.length + 1}`,
            date_visited: new Date().toISOString(),
            tags: [],
            photos: [
              {
                file: file,
                url: URL.createObjectURL(file),
                date_visited: new Date().toISOString(),
                isPrimary: true,
              },
            ],
            description: "",
            googleMapsLink: "",
            isPrivate: false,
          };

          setPoiArray((prev) => [...prev, newPOI]);
          toast.success(
            "Photo added! Please set coordinates manually on the map."
          );
        }
      };
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      {/* Drag and Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-base-300 hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="p-4 bg-base-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <ImageIcon size={24} className="text-primary" />
          </div>

          <div>
            <p className="text-lg font-medium text-primary mb-2">
              {isDragOver ? "Drop photos here" : "Drag and drop photos here"}
            </p>
            <p className="text-sm text-neutral-600 mb-4">
              or click to browse files
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
            >
              <Upload size={16} />
              Choose Photos
            </button>
          </div>

          <p className="text-xs text-neutral-500">
            Supports GPS-tagged photos for automatic location detection
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadComponent;
