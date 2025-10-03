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
import Maps from "@/app/dashboard/comp/maps/map";
import { toast } from "react-hot-toast";
import { poiApi, mapApi, tagApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Script from "next/script";
import AddTags from "@/app/dashboard/comp/comps/addTags";
import { useAuthStore } from "@/store/useAuthStore";

const AddMapPOIS = () => {
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // State management
  const [poiArray, setPoiArray] = useState([]);
  const [isMapClickable, setIsMapClickable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mapName, setMapName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  console.log(poiArray);
  // Fetch available tags
  const { data: availableTags = [], refetch: refetchTags } = useQuery({
    queryKey: ["availableTags"],
    queryFn: async () => {
      try {
        const response = await tagApi.getAllTags();
        return response.data || [];
      } catch (error) {
        console.error("Error fetching tags:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Map click handler
  const handleMapClick = (coords) => {
    const newPOI = {
      lat: coords.lat,
      lng: coords.lng,
      locationName: `Location ${poiArray.length + 1}`,
      date_visited: new Date().toISOString(),
      tags: [],
      photos: [],
      description: "",
      googleMapsLink: "",
      isPrivate: false,
    };

    setPoiArray((prev) => [...prev, newPOI]);
    toast.success(
      `Location added: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
    );
  };

  const toggleMapClickable = () => {
    setIsMapClickable(!isMapClickable);
  };

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

  const toDecimal = (arr, ref) => {
    const degrees = arr[0];
    const minutes = arr[1];
    const seconds = arr[2];
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (ref === "S" || ref === "W") decimal = -decimal;
    return decimal;
  };

  const formatExifDate = (dateString) => {
    // Convert EXIF date format (YYYY:MM:DD HH:mm:ss) to ISO string
    const [datePart, timePart] = dateString.split(" ");
    const [year, month, day] = datePart.split(":");
    const [hour, minute, second] = timePart.split(":");
    return new Date(year, month - 1, day, hour, minute, second).toISOString();
  };

  // Add more photos to existing POI
  const handleAddPhotosToPOI = (poiIndex, files) => {
    const updatedPOIs = [...poiArray];
    const poi = updatedPOIs[poiIndex];

    files.forEach((file) => {
      // Extract EXIF data for the additional photo
      const reader = new FileReader();
      reader.onload = function (e) {
        const image = new Image();
        image.src = e.target.result;
        image.onload = function () {
          let dateVisited = new Date().toISOString(); // Default to current date

          // Check if EXIF library is available and extract date
          if (typeof EXIF !== "undefined" && EXIF.getData) {
            EXIF.getData(image, function () {
              const exif = EXIF.getAllTags(this);

              // Extract date information
              if (exif.DateTimeOriginal) {
                dateVisited = formatExifDate(exif.DateTimeOriginal);
              } else if (exif.DateTime) {
                dateVisited = formatExifDate(exif.DateTime);
              } else if (exif.CreateDate) {
                dateVisited = formatExifDate(exif.CreateDate);
              }

              // Add photo with extracted date
              const photo = {
                file: file,
                url: URL.createObjectURL(file),
                date_visited: dateVisited,
                isPrimary: false,
              };
              poi.photos.push(photo);
              setPoiArray([...updatedPOIs]);
            });
          } else {
            // EXIF library not available, use current date
            const photo = {
              file: file,
              url: URL.createObjectURL(file),
              date_visited: dateVisited,
              isPrimary: false,
            };
            poi.photos.push(photo);
            setPoiArray([...updatedPOIs]);
          }
        };
      };
      reader.readAsDataURL(file);
    });

    toast.success(`Added ${files.length} photo(s) to ${poi.locationName}`);
  };

  // Remove photo from POI
  const handleRemovePhoto = (poiIndex, photoIndex) => {
    const updatedPOIs = [...poiArray];
    const poi = updatedPOIs[poiIndex];
    poi.photos.splice(photoIndex, 1);

    // If we removed the primary photo and there are other photos, make the first one primary
    if (poi.photos.length > 0 && !poi.photos.some((p) => p.isPrimary)) {
      poi.photos[0].isPrimary = true;
    }

    setPoiArray(updatedPOIs);
  };

  // Set primary photo
  const handleSetPrimaryPhoto = (poiIndex, photoIndex) => {
    const updatedPOIs = [...poiArray];
    const poi = updatedPOIs[poiIndex];

    // Remove primary from all photos
    poi.photos.forEach((photo) => (photo.isPrimary = false));
    // Set new primary
    poi.photos[photoIndex].isPrimary = true;

    setPoiArray(updatedPOIs);
  };

  // Remove POI from array
  const handleRemovePOI = (index) => {
    const updatedPOIs = poiArray.filter((_, i) => i !== index);
    setPoiArray(updatedPOIs);
  };

  // Save map with all POIs
  const handleSaveMap = async () => {
    if (!mapName.trim()) {
      toast.error("Please enter a map name");
      return;
    }

    if (poiArray.length === 0) {
      toast.error("No POIs to save");
      return;
    }

    setIsSaving(true);
    try {
      // Create map first
      const mapData = {
        mapName: mapName.trim(),
        coordArray: poiArray.map((poi) => ({
          lat: poi.lat,
          lng: poi.lng,
          locationName: poi.locationName,
          description: poi.description || "",
          date_visited: poi.date_visited,
          tags: poi.tags,
          googleMapsLink: poi.googleMapsLink || "",
          isPrivate: poi.isPrivate || false,
        })),
        isPrivate: false,
      };

      const mapResponse = await mapApi.createMap(mapData);
      const createdMap = mapResponse.data;

      // Save each POI and upload photos
      const results = [];

      for (const poi of poiArray) {
        try {
          // Create POI
          const poiData = {
            locationName: poi.locationName,
            description: poi.description || "",
            lat: poi.lat,
            lng: poi.lng,
            tags: poi.tags,
            googleMapsLink: poi.googleMapsLink || "",
            isPrivate: poi.isPrivate || false,
            date_visited: poi.date_visited,
            map_id: createdMap._id,
          };

          const poiResponse = await poiApi.createPOI(poiData);
          const createdPOI = poiResponse.data;
          results.push(createdPOI);

          // Upload photos
          for (const photo of poi.photos) {
            try {
              const uploadResponse = await poiApi.uploadPhoto(
                createdPOI._id,
                photo.file,
                null, // cropData
                photo.isPrimary,
                photo.date_visited
              );

              if (!uploadResponse.success) {
                console.warn(
                  `Failed to upload photo for POI ${createdPOI._id}:`,
                  uploadResponse.message
                );
              }
            } catch (photoError) {
              console.error(
                `Error uploading photo for POI ${createdPOI._id}:`,
                photoError
              );
              toast.error(
                `POI saved but photo upload failed for ${poi.locationName}`
              );
            }
          }
        } catch (poiError) {
          console.error(`Error saving POI ${poi.locationName}:`, poiError);
          toast.error(`Failed to save POI: ${poi.locationName}`);
        }
      }

      const successCount = results.length;
      if (successCount > 0) {
        toast.success(
          `Successfully created map "${mapName}" with ${successCount} POI(s)!`
        );
        // Reset state
        setPoiArray([]);
        setMapName("");
      }
    } catch (error) {
      console.error("Error saving map:", error);
      toast.error("Failed to save map. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/exif-js"
        strategy="beforeInteractive"
      />

      <div className="pb-6 space-y-6 w-full">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            Create Map from Photos
          </h2>
          <p className="text-neutral-600 text-lg">
            Upload photos to automatically create POIs and build your map
          </p>
        </div>

        {/* Map Section */}
        <div className="bg-base-200 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Map View</h3>
            <button
              onClick={toggleMapClickable}
              className={`btn btn-sm transition-all duration-200 ${
                isMapClickable ? "btn-accent shadow-lg" : "btn-outline"
              }`}
            >
              {isMapClickable ? (
                <>
                  <MapPinCheckInside size={16} />
                  Click Mode Active
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  Enable Click to Add
                </>
              )}
            </button>
          </div>
          <Maps
            key="addMapPOIS-map"
            mapKey="addMapPOIS-map"
            coordArray={poiArray}
            onMapClick={handleMapClick}
            isClickable={isMapClickable}
            zoom={10}
          />
        </div>

        {/* Photo Upload Section */}
        <div className="bg-base-200 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success/10 rounded-lg">
              <Upload size={20} className="text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Upload Photos
              </h3>
              <p className="text-sm text-neutral-600">
                Drag and drop photos or click to browse. GPS-tagged photos will
                automatically create POIs.
              </p>
            </div>
          </div>

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
                  {isDragOver
                    ? "Drop photos here"
                    : "Drag and drop photos here"}
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

        {/* POIs List */}
        {poiArray.length > 0 && (
          <div className="bg-base-200 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <MapPin size={20} className="text-info" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary">
                    POIs to Add ({poiArray.length})
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Edit details and add more photos to each POI
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter map name..."
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  className="input input-bordered input-sm"
                />
                <button
                  onClick={handleSaveMap}
                  className="btn btn-primary btn-sm"
                  disabled={isSaving || !mapName.trim()}
                >
                  {isSaving ? (
                    <>
                      <div className="loading loading-spinner loading-xs"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Map"
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {poiArray.map((poi, poiIndex) => (
                <div
                  key={poiIndex}
                  className="bg-base-100 p-6 rounded-lg border border-base-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={poi.locationName}
                        onChange={(e) => {
                          const updatedPOIs = [...poiArray];
                          updatedPOIs[poiIndex].locationName = e.target.value;
                          setPoiArray(updatedPOIs);
                        }}
                        className="input input-bordered input-sm w-full mb-3"
                        placeholder="Location name..."
                      />

                      <textarea
                        placeholder="Description..."
                        value={poi.description || ""}
                        onChange={(e) => {
                          const updatedPOIs = [...poiArray];
                          updatedPOIs[poiIndex].description = e.target.value;
                          setPoiArray(updatedPOIs);
                        }}
                        className="textarea textarea-bordered textarea-sm w-full mb-3"
                        rows={2}
                      />

                      <AddTags
                        existingTags={poi.tags}
                        onTagAdd={(newTag) => {
                          const updatedPOIs = [...poiArray];
                          if (!updatedPOIs[poiIndex].tags.includes(newTag)) {
                            updatedPOIs[poiIndex].tags.push(newTag);
                            setPoiArray(updatedPOIs);
                          }
                        }}
                        onTagRemove={(tagToRemove) => {
                          const updatedPOIs = [...poiArray];
                          updatedPOIs[poiIndex].tags = updatedPOIs[
                            poiIndex
                          ].tags.filter((tag) => tag !== tagToRemove);
                          setPoiArray(updatedPOIs);
                        }}
                        placeholder="Add tags..."
                        className="w-full"
                      />
                    </div>

                    <button
                      onClick={() => handleRemovePOI(poiIndex)}
                      className="btn btn-sm btn-error btn-ghost ml-4"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Coordinates Display */}
                  <div className="mb-4">
                    {poi.lat && poi.lng ? (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <MapPinCheckInside size={14} />
                        <span>
                          {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-warning">
                        <MapPin size={14} />
                        <span>
                          No coordinates - click on map to set location
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Photos Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-primary">
                        Photos ({poi.photos.length})
                      </h4>
                      <input
                        id="add-photos-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          handleAddPhotosToPOI(poiIndex, files);
                          e.target.value = "";
                        }}
                        className="file-input file-input-bordered file-input-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {poi.photos.map((photo, photoIndex) => (
                        <div key={photoIndex} className="relative group">
                          <img
                            src={photo.url}
                            alt={`Photo ${photoIndex + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />

                          {/* Photo overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="flex gap-1">
                              {!photo.isPrimary && (
                                <button
                                  onClick={() =>
                                    handleSetPrimaryPhoto(poiIndex, photoIndex)
                                  }
                                  className="btn btn-xs btn-primary"
                                  title="Set as primary"
                                >
                                  <Plus size={12} />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleRemovePhoto(poiIndex, photoIndex)
                                }
                                className="btn btn-xs btn-error"
                                title="Remove photo"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Primary badge */}
                          {photo.isPrimary && (
                            <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">
                              Primary
                            </div>
                          )}

                          {/* Date badge */}
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(photo.date_visited).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddMapPOIS;
