"use client";
import { useRef, useState, useEffect } from "react";
import {
  MapPin,
  MapPinCheckInside,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import Maps from "@/app/dashboard/comp/maps/map";
import { toast } from "react-hot-toast";
import { poiApi, tagApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Script from "next/script";

const POICreationInterface = ({
  availableTags = [],
  showTable = true,
  children,
}) => {
  // Internal state management
  const [poiArray, setPoiArray] = useState([]);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMapClickable, setIsMapClickable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Modal state for creating new tags
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [pendingTagIndex, setPendingTagIndex] = useState(null);

  // Fetch available tags if not provided
  const { data: fetchedTags = [], refetch: refetchTags } = useQuery({
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
    enabled: availableTags.length === 0,
  });

  const tagsToUse = availableTags.length > 0 ? availableTags : fetchedTags;

  // Create new tag function
  const createNewTag = async (tagName) => {
    try {
      const response = await tagApi.createTag(tagName);
      if (response.success) {
        toast.success(`Tag "${tagName}" created successfully!`);
        // Refetch tags to include the new one
        refetchTags();
        return response.data;
      } else {
        toast.error(response.message || "Failed to create tag");
        return null;
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error(`Failed to create tag: ${error.message}`);
      return null;
    }
  };

  // Modal handlers for creating new tags
  const openTagModal = (index) => {
    setPendingTagIndex(index);
    setNewTagName("");
    setShowTagModal(true);
  };

  const closeTagModal = () => {
    setShowTagModal(false);
    setNewTagName("");
    setPendingTagIndex(null);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    const newTag = await createNewTag(newTagName.trim());
    if (newTag && pendingTagIndex !== null) {
      const updatedPOIs = [...poiArray];
      if (!updatedPOIs[pendingTagIndex].tags.includes(newTag.name)) {
        updatedPOIs[pendingTagIndex].tags.push(newTag.name);
        setPoiArray(updatedPOIs);
      }
    }
    closeTagModal();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCreateTag();
    } else if (e.key === "Escape") {
      closeTagModal();
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Internal handlers
  const handleMapClick = (coords) => {
    // Convert from { lng, lat } to { lat, lng } format
    const newPOI = {
      lat: coords.lat,
      lng: coords.lng,
      locationName: `Location ${poiArray.length + 1}`,
      date_visited: new Date().toISOString(),
      tags: [],
      image: null,
      description: "",
      googleMapsLink: "",
      isPrivate: false,
    };

    setPoiArray((prev) => [...prev, newPOI]);
    toast.success(
      `Location added: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
    );
  };

  const handleMapClickWrapper = (coords) => {
    handleMapClick({ lat: coords.lat, lng: coords.lng });
  };

  const toggleMapClickable = () => {
    setIsMapClickable(!isMapClickable);
  };

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
    }, 1000);
  };

  const extractExifData = (file, imageIndex = 0) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const image = new Image();
      image.src = e.target.result;
      image.onload = function () {
        // Check if EXIF library is available
        if (typeof EXIF !== "undefined" && EXIF.getData) {
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
                image: URL.createObjectURL(file),
                description: "",
                googleMapsLink: "",
                isPrivate: false,
              };

              setPoiArray((prev) => [...prev, newPOI]);
              toast.success(
                `Photo location added: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
              );
            } else {
              toast.error("No GPS data found in this photo");
            }
          });
        } else {
          // EXIF library not available, create POI without GPS data
          const newPOI = {
            lat: null,
            lng: null,
            locationName: `Photo Location ${poiArray.length + 1}`,
            date_visited: new Date().toISOString(),
            tags: [],
            image: URL.createObjectURL(file),
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

  // Handle removing a POI from the array
  const handleRemovePOI = (index) => {
    const updatedPOIs = poiArray.filter((_, i) => i !== index);
    setPoiArray(updatedPOIs);
  };

  // Save POIs to database
  const handleSavePOIs = async () => {
    if (poiArray.length === 0) {
      toast.error("No POIs to save");
      return;
    }

    setIsSaving(true);
    try {
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
          };

          const poiResponse = await poiApi.createPOI(poiData);
          const createdPOI = poiResponse.data;
          results.push(createdPOI);

          // Upload photo if exists
          if (poi.image && poi.image.startsWith("blob:")) {
            try {
              // Convert blob URL to file
              const response = await fetch(poi.image);
              if (!response.ok) {
                throw new Error(
                  `Failed to fetch image: ${response.statusText}`
                );
              }

              const blob = await response.blob();
              const file = new File([blob], "photo.jpg", {
                type: "image/jpeg",
              });

              const uploadResponse = await poiApi.uploadPhoto(
                createdPOI._id,
                file,
                null, // cropData
                true, // isPrimary
                poi.date_visited // dateVisited
              );
              if (!uploadResponse.success) {
                console.warn(
                  `Failed to upload photo for POI ${createdPOI._id}:`,
                  uploadResponse.message
                );
              } else {
                console.log(
                  `Photo uploaded successfully for POI ${createdPOI._id}`
                );
              }
            } catch (photoError) {
              console.error(
                `Error uploading photo for POI ${createdPOI._id}:`,
                photoError
              );
              // Don't fail the entire operation if photo upload fails
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
        toast.success(`Successfully saved ${successCount} POI(s)!`);
      }

      // Reset state and close dropdown
      setPoiArray([]);
      setImages([]);
      setCurrentIndex(0);
      closeDropdown();
    } catch (error) {
      console.error("Error saving POIs:", error);
      toast.error("Failed to save POIs. Please try again.");
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

      {/* Dropdown Container */}
      <div className="bg-base-200 rounded-xl shadow-lg border border-base-300 overflow-hidden">
        {/* Trigger Button */}
        <div className="p-6">
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-between w-full p-6 bg-base-200 rounded-xl hover:bg-base-300 transition-all duration-200 "
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus size={24} className="text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-primary">
                  Create New POI
                </h3>
                <p className="text-sm text-neutral-600">
                  Upload photos or add locations manually
                </p>
              </div>
            </div>
            {isDropdownOpen ? (
              <ChevronUp size={24} className="text-primary" />
            ) : (
              <ChevronDown size={24} className="text-primary" />
            )}
          </button>
        </div>

        {/* Dropdown Content */}
        {isDropdownOpen && (
          <div className="border-t border-base-100 bg-base-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl text-primary">
                  Create New POI
                </h3>
                {/* <button
                  onClick={closeDropdown}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  <X size={20} />
                </button> */}
              </div>

              <div className="space-y-8">
                {/* POI Creation: Map and Upload */}
                <div className="flex flex-col xl:flex-row gap-8">
                  {/* Left Column: Map */}
                  <div className="xl:flex-[2] bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-info/10 rounded-lg">
                          <MapPin size={20} className="text-info" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-primary">
                            Map View
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Click to add coordinates or view your POIs
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleMapClickable}
                        className={`btn btn-sm transition-all duration-200 ${
                          isMapClickable
                            ? "btn-accent shadow-lg"
                            : "btn-outline"
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
                      key="poi-creation-map"
                      mapKey="poi-creation-map"
                      coordArray={poiArray}
                      onMapClick={handleMapClickWrapper}
                      isClickable={isMapClickable}
                      zoom={10}
                    />
                  </div>

                  {/* Right Column: Upload Photo */}
                  <div className="xl:flex-[1] p-6 space-y-6 bg-base-100 rounded-xl shadow-lg border border-base-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-success/10 rounded-lg flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-success"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-primary mb-1">
                          Upload Photos
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Upload GPS-tagged images or drop a pin on the map to
                          add coordinates.
                        </p>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-base-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          id="poiImageUpload"
                          type="file"
                          accept="image/*"
                          className="file-input file-input-bordered file-input-primary w-full"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                          multiple
                        />
                        <div className="mt-3">
                          <p className="text-sm text-neutral-600">
                            Drag and drop images here, or click to browse
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Supports GPS-tagged photos for automatic location
                            detection
                          </p>
                        </div>
                      </div>

                      {images.length > 0 && (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <svg
                              className="w-5 h-5 text-success"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <p className="text-sm font-medium text-success">
                              {images.length} image
                              {images.length > 1 ? "s" : ""} uploaded
                              successfully!
                            </p>
                          </div>
                          <p className="text-xs text-neutral-600">
                            Check the table below to edit location names, add
                            tags, and crop images
                          </p>
                        </div>
                      )}
                    </div>

                    {/* OR Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-base-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-base-100 px-2 text-neutral-500">
                          Or
                        </span>
                      </div>
                    </div>

                    {/* Manual Add Button */}
                    <div className="text-center">
                      <button
                        onClick={() => {
                          // This will be handled by the parent component
                          if (typeof onMapClick === "function") {
                            // Trigger map click mode or show instructions
                          }
                        }}
                        className="btn btn-outline btn-primary w-full"
                      >
                        <MapPin size={16} />
                        Add Location Manually
                      </button>
                      <p className="text-xs text-neutral-500 mt-2">
                        Click on the map to add coordinates manually
                      </p>
                    </div>
                  </div>
                </div>

                {/* POI Table */}
                {showTable && poiArray.length > 0 && (
                  <div className="bg-base-100 p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-primary">
                        POIs to Add ({poiArray.length})
                      </h4>
                      {poiArray.length > 0 && (
                        <button
                          onClick={handleSavePOIs}
                          className="btn btn-primary btn-sm"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            "Save All POIs"
                          )}
                        </button>
                      )}
                    </div>

                    {poiArray.length === 0 ? (
                      <div className="text-center py-6 text-neutral-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          No POIs added yet. Add some locations above!
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                          <thead>
                            <tr className="text-center">
                              <th>Image</th>
                              <th>Location Name</th>
                              <th>Coordinates</th>
                              <th>Description</th>
                              <th>Tags</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {poiArray.map((poi, index) => (
                              <tr key={index}>
                                <td>
                                  {poi.image ? (
                                    <img
                                      src={poi.image}
                                      alt={poi.locationName}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-base-300 rounded flex items-center justify-center">
                                      <MapPin
                                        size={16}
                                        className="text-neutral-500"
                                      />
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <input
                                    id={`poi-location-name-${index}`}
                                    type="text"
                                    value={poi.locationName}
                                    onChange={(e) => {
                                      const updatedPOIs = [...poiArray];
                                      updatedPOIs[index].locationName =
                                        e.target.value;
                                      setPoiArray(updatedPOIs);
                                    }}
                                    className="input input-bordered input-sm w-full"
                                  />
                                </td>
                                <td>
                                  <div className="text-sm text-neutral-600">
                                    {poi.lat && poi.lng ? (
                                      <div className="space-y-2 py-1">
                                        <div className="flex items-center gap-2">
                                          <div className="p-1 bg-green-100 rounded">
                                            <MapPinCheckInside
                                              size={10}
                                              className="text-green-600"
                                            />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-xs text-neutral-500 font-medium">
                                              Latitude
                                            </span>
                                            <span className="font-mono text-xs text-neutral-700">
                                              {poi.lat.toFixed(6)}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="p-1 bg-green-100 rounded">
                                            <MapPinCheckInside
                                              size={10}
                                              className="text-green-600"
                                            />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-xs text-neutral-500 font-medium">
                                              Longitude
                                            </span>
                                            <span className="font-mono text-xs text-neutral-700">
                                              {poi.lng.toFixed(6)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-center">
                                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-2 w-full">
                                          <span className="text-xs text-red-600 font-medium">
                                            ⚠️ No coordinates
                                          </span>
                                          <span className="text-xs text-red-500 block mt-1">
                                            Will not be shown on map
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <textarea
                                    id={`poi-description-${index}`}
                                    placeholder="Enter description..."
                                    value={poi.description || ""}
                                    onChange={(e) => {
                                      const updatedPOIs = [...poiArray];
                                      updatedPOIs[index].description =
                                        e.target.value;
                                      setPoiArray(updatedPOIs);
                                    }}
                                    className="textarea textarea-bordered textarea-sm w-full h-20 resize-none"
                                  />
                                </td>
                                <td>
                                  <div className="space-y-2">
                                    {/* Existing Tags */}
                                    <div className="flex flex-wrap gap-1 max-w-32">
                                      {poi.tags.map((tag, tagIndex) => (
                                        <span
                                          key={tagIndex}
                                          className="badge badge-primary badge-soft badge-xs flex items-center gap-1"
                                        >
                                          {tag}
                                          <button
                                            onClick={() => {
                                              const updatedPOIs = [...poiArray];
                                              updatedPOIs[index].tags =
                                                updatedPOIs[index].tags.filter(
                                                  (_, i) => i !== tagIndex
                                                );
                                              setPoiArray(updatedPOIs);
                                            }}
                                            className="text-xs hover:text-error"
                                          >
                                            ×
                                          </button>
                                        </span>
                                      ))}
                                    </div>

                                    {/* Add Tag Section */}
                                    <div className="flex gap-1">
                                      <select
                                        id={`poi-tag-select-${index}`}
                                        className="select select-bordered select-xs w-40"
                                        onChange={async (e) => {
                                          if (e.target.value) {
                                            if (
                                              e.target.value === "create-new"
                                            ) {
                                              // Show input for new tag
                                              openTagModal(index);
                                            } else {
                                              // Add existing tag
                                              const updatedPOIs = [...poiArray];
                                              if (
                                                !updatedPOIs[
                                                  index
                                                ].tags.includes(e.target.value)
                                              ) {
                                                updatedPOIs[index].tags.push(
                                                  e.target.value
                                                );
                                                setPoiArray(updatedPOIs);
                                              }
                                            }
                                            e.target.value = "";
                                          }
                                        }}
                                      >
                                        <option value="">Add tag...</option>
                                        {tagsToUse.map((tag) => (
                                          <option
                                            key={tag._id}
                                            value={tag.name}
                                          >
                                            {tag.name}
                                          </option>
                                        ))}
                                        <option
                                          value="create-new"
                                          className="font-semibold text-primary bg-primary/10"
                                        >
                                          ➕ Create new tag...
                                        </option>
                                      </select>
                                      <button
                                        id={`create-new-tag-button-${index}`}
                                        onClick={() => openTagModal(index)}
                                        className="btn btn-xs btn-primary btn-outline"
                                        title="Create new tag"
                                      >
                                        <Plus size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    onClick={() => handleRemovePOI(index)}
                                    className="btn btn-sm btn-error btn-soft text-error hover:text-white"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional content passed as children */}
                {children}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tag Creation Modal */}
      {showTagModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeTagModal}
        >
          <div
            className="bg-base-100 rounded-lg p-6 shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-primary mb-4">
              Create New Tag
            </h3>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input input-bordered input-sm w-full mb-4"
              placeholder="Enter tag name"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeTagModal}
                className="btn btn-sm btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTag}
                className="btn btn-sm btn-primary"
              >
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default POICreationInterface;
