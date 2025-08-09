"use client";
import { useState, useEffect, useRef } from "react";
import { X, Upload, Star } from "lucide-react";
import { poiApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import AddTags from "@/app/dashboard/comp/comps/addTags";
import { createPortal } from "react-dom";
import EXIF from "exif-js";

const EditPOIModal = ({ isOpen, onClose, poi, availableTags = [] }) => {
  const queryClient = useQueryClient();
  const editPhotoFileInputRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Helper function to format EXIF date
  const formatExifDate = (exifDateString) => {
    if (!exifDateString) return null;
    // EXIF date format: "YYYY:MM:DD HH:MM:SS"
    const date = new Date(
      exifDateString.replace(/(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")
    );
    return date.toISOString().split("T")[0];
  };

  // Ensure we're on the client side for portal rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Form state
  const [editFormData, setEditFormData] = useState({
    locationName: "",
    description: "",
    lat: null,
    lng: null,
    isPrivate: false,
    tags: [],
  });

  // Photo upload state
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [editPhotoDate, setEditPhotoDate] = useState("");
  const [editPhotoUploading, setEditPhotoUploading] = useState(false);
  const [photoDateDisable, setPhotoDateDisable] = useState(true);

  // Initialize form data when POI changes
  useEffect(() => {
    if (poi) {
      setEditFormData({
        locationName: poi.locationName || "",
        description: poi.description || "",
        lat: poi.lat || null,
        lng: poi.lng || null,
        isPrivate: poi.isPrivate || false,
        tags:
          poi.tags?.map((tag) => (typeof tag === "object" ? tag.name : tag)) ||
          [],
      });
    }
  }, [poi]);

  // Reset photo state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEditPhotoFile(null);
      setEditPhotoPreview(null);
      setEditPhotoDate("");
      setEditPhotoUploading(false);
      if (editPhotoFileInputRef.current) {
        editPhotoFileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Update POI mutation
  const updatePOIMutation = useMutation({
    mutationFn: (data) => poiApi.updatePOI(poi._id, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("POI updated successfully!");
        queryClient.invalidateQueries(["individualMap"]);
        queryClient.invalidateQueries(["userPOIs"]);
        queryClient.invalidateQueries(["search"]);
        queryClient.invalidateQueries(["popularPOIs"]);
        onClose();
      } else {
        toast.error(data.message || "Failed to update POI");
      }
    },
    onError: (error) => {
      console.error("Update POI error:", error);
      toast.error(`Failed to update POI: ${error.message}`);
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: (photoId) => poiApi.deletePhoto(photoId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Photo deleted successfully!");
        queryClient.invalidateQueries(["individualMap"]);
        queryClient.invalidateQueries(["userPOIs"]);
        queryClient.invalidateQueries(["search"]);
        queryClient.invalidateQueries(["popularPOIs"]);
      } else {
        toast.error(data.message || "Failed to delete photo");
      }
    },
    onError: (error) => {
      console.error("Delete photo error:", error);
      toast.error(`Failed to delete photo: ${error.message}`);
    },
  });

  // Set primary photo mutation
  const setPrimaryPhotoMutation = useMutation({
    mutationFn: (photoId) => poiApi.setPrimaryPhoto(photoId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Primary photo updated!");
        queryClient.invalidateQueries(["individualMap"]);
        queryClient.invalidateQueries(["userPOIs"]);
        queryClient.invalidateQueries(["search"]);
        queryClient.invalidateQueries(["popularPOIs"]);
      } else {
        toast.error(data.message || "Failed to set primary photo");
      }
    },
    onError: (error) => {
      console.error("Set primary photo error:", error);
      toast.error(`Failed to set primary photo: ${error.message}`);
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: ({ poiId, photoFile, dateVisited }) =>
      poiApi.uploadPhoto(poiId, photoFile, null, false, dateVisited),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Photo uploaded successfully!");
        setEditPhotoFile(null);
        setEditPhotoPreview(null);
        setPhotoDateDisable(true);
        setEditPhotoDate("");
        setEditPhotoUploading(false);
        if (editPhotoFileInputRef.current) {
          editPhotoFileInputRef.current.value = "";
        }
        queryClient.invalidateQueries(["individualMap"]);
        queryClient.invalidateQueries(["userPOIs"]);
        queryClient.invalidateQueries(["search"]);
        queryClient.invalidateQueries(["popularPOIs"]);
      } else {
        toast.error(data.message || "Failed to upload photo");
        setEditPhotoUploading(false);
      }
    },
    onError: (error) => {
      console.error("Upload photo error:", error);
      toast.error(`Failed to upload photo: ${error.message}`);
      setEditPhotoUploading(false);
    },
  });

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTagToEdit = (tagName) => {
    if (tagName && !editFormData.tags.includes(tagName)) {
      setEditFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagName],
      }));
    }
  };

  const handleRemoveTagFromEdit = (tagToRemove) => {
    setEditFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPhotoFile(file);
      const reader = new FileReader();

      reader.onload = (e) => {
        setEditPhotoPreview(e.target.result);

        // Extract EXIF data to get photo taken date
        const image = new Image();
        image.src = e.target.result;
        image.onload = function () {
          if (typeof EXIF !== "undefined" && EXIF.getData) {
            EXIF.getData(image, function () {
              const exif = EXIF.getAllTags(this);

              // Extract date information
              let dateVisited = null;
              if (exif.DateTimeOriginal) {
                dateVisited = formatExifDate(exif.DateTimeOriginal);
              } else if (exif.DateTime) {
                dateVisited = formatExifDate(exif.DateTime);
              } else if (exif.CreateDate) {
                dateVisited = formatExifDate(exif.CreateDate);
              }

              if (dateVisited) {
                // Photo has taken date, keep input disabled and auto-fill
                setPhotoDateDisable(true);
                setEditPhotoDate(dateVisited);
              } else {
                // No taken date found, enable manual input
                setPhotoDateDisable(false);
                setEditPhotoDate("");
              }
            });
          } else {
            // EXIF library not available, enable manual input
            setPhotoDateDisable(false);
            setEditPhotoDate("");
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhotoUpload = async () => {
    if (!editPhotoFile) {
      toast.error("Please select a photo first");
      return;
    }
    setEditPhotoUploading(true);
    uploadPhotoMutation.mutate({
      poiId: poi._id,
      photoFile: editPhotoFile,
      dateVisited: editPhotoDate || undefined,
    });
  };

  const handleEditPhotoCancel = () => {
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
    setPhotoDateDisable(true);
    setEditPhotoDate("");
    if (editPhotoFileInputRef.current) {
      editPhotoFileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = (photoId, index) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      deletePhotoMutation.mutate(photoId);
    }
  };

  const handleEditFormSubmit = () => {
    if (!editFormData.locationName.trim()) {
      toast.error("Location name is required");
      return;
    }

    const updateData = {
      locationName: editFormData.locationName.trim(),
      description: editFormData.description.trim(),
      lat: editFormData.lat,
      lng: editFormData.lng,
      isPrivate: editFormData.isPrivate,
      tags: editFormData.tags,
    };

    updatePOIMutation.mutate(updateData);
  };

  if (!isOpen || !poi || !isClient) return null;

  const modalContent = (
    <div className="modal modal-open " onClick={onClose}>
      <div
        className="modal-box w-11/12 max-w-4xl max-h-screen overflow-y-auto relative z-[10000] bg-base-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl text-primary">
            Edit POI: {poi.locationName}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={updatePOIMutation.isPending}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Privacy Toggle - Moved to top */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <input
              type="checkbox"
              id="editPrivacyToggle"
              checked={editFormData.isPrivate}
              onChange={(e) =>
                handleEditFormChange("isPrivate", e.target.checked)
              }
              className="toggle toggle-primary"
            />
            <label
              htmlFor="editPrivacyToggle"
              className="label-text text-sm cursor-pointer"
            >
              Make this POI private
            </label>
          </div>

          {/* Basic Information - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Location Name + Coordinates */}
            <div className="space-y-4">
              <div>
                <label htmlFor="editLocationName" className="label">
                  <span className="label-text font-semibold">
                    Location Name
                  </span>
                </label>
                <input
                  id="editLocationName"
                  type="text"
                  value={editFormData.locationName}
                  onChange={(e) =>
                    handleEditFormChange("locationName", e.target.value)
                  }
                  className="input input-bordered w-full"
                  placeholder="Enter location name"
                  disabled={updatePOIMutation.isPending}
                />
              </div>

              {/* Coordinates - Smaller inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="editLatitude" className="label">
                    <span className="label-text text-xs">Latitude</span>
                  </label>
                  <input
                    id="editLatitude"
                    type="number"
                    step="any"
                    value={editFormData.lat || ""}
                    onChange={(e) =>
                      handleEditFormChange(
                        "lat",
                        parseFloat(e.target.value) || null
                      )
                    }
                    className="input input-bordered input-sm w-full"
                    placeholder="40.7128"
                    disabled={updatePOIMutation.isPending}
                  />
                </div>

                <div>
                  <label htmlFor="editLongitude" className="label">
                    <span className="label-text text-xs">Longitude</span>
                  </label>
                  <input
                    id="editLongitude"
                    type="number"
                    step="any"
                    value={editFormData.lng || ""}
                    onChange={(e) =>
                      handleEditFormChange(
                        "lng",
                        parseFloat(e.target.value) || null
                      )
                    }
                    className="input input-bordered input-sm w-full"
                    placeholder="-74.0060"
                    disabled={updatePOIMutation.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Description */}
            <div>
              <label htmlFor="editDescription" className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                id="editDescription"
                value={editFormData.description}
                onChange={(e) =>
                  handleEditFormChange("description", e.target.value)
                }
                className="textarea textarea-bordered w-full h-32"
                placeholder="Describe this location..."
                disabled={updatePOIMutation.isPending}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Tags</span>
            </label>
            <AddTags
              existingTags={editFormData.tags}
              onTagAdd={(tagName) => handleAddTagToEdit(tagName)}
              onTagRemove={(tagToRemove) =>
                handleRemoveTagFromEdit(tagToRemove)
              }
              placeholder="Search or create tags..."
              className="w-full"
              disabled={updatePOIMutation.isPending}
            />
          </div>

          {/* Photo Upload Section */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-lg mb-4">Add Photo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="editPhotoFile" className="label">
                  <span className="label-text font-semibold">Photo</span>
                </label>
                <input
                  id="editPhotoFile"
                  ref={editPhotoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditPhotoChange}
                  className="file-input file-input-bordered w-full"
                  disabled={updatePOIMutation.isPending}
                />
              </div>

              <div>
                <label htmlFor="editPhotoDate" className="label">
                  <span className="label-text font-semibold">Photo Date</span>
                  {photoDateDisable && editPhotoDate && (
                    <span className="label-text-alt text-green-600">
                      (Auto-filled from photo)
                    </span>
                  )}
                  {!photoDateDisable && (
                    <span className="label-text-alt text-blue-600">
                      (Manual entry)
                    </span>
                  )}
                </label>
                <input
                  id="editPhotoDate"
                  type="date"
                  value={editPhotoDate}
                  onChange={(e) => setEditPhotoDate(e.target.value)}
                  className="input input-bordered w-full"
                  disabled={updatePOIMutation.isPending || photoDateDisable}
                />
              </div>
            </div>

            {editPhotoPreview && (
              <div className="mt-4">
                <img
                  src={editPhotoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleEditPhotoUpload}
                    disabled={editPhotoUploading || updatePOIMutation.isPending}
                    className="btn btn-primary btn-sm"
                  >
                    {editPhotoUploading ? "Uploading..." : "Upload Photo"}
                  </button>
                  <button
                    onClick={handleEditPhotoCancel}
                    className="btn btn-ghost btn-sm"
                    disabled={updatePOIMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Photos */}
          {poi.photos && poi.photos.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-lg mb-4">Existing Photos</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {poi.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={
                        photo?.s3Url ||
                        photo?.fullUrl ||
                        "/placeholder-image.webp"
                      }
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo?.isPrimary && (
                        <button
                          onClick={() =>
                            setPrimaryPhotoMutation.mutate(photo._id)
                          }
                          className="btn btn-sm"
                          disabled={setPrimaryPhotoMutation.isPending}
                          title="Set as primary"
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(photo._id, index)}
                        className="btn btn-error btn-sm"
                        disabled={deletePhotoMutation.isPending}
                        title="Delete photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {photo?.isPrimary && (
                      <div className="absolute top-1 left-1 bg-primary text-white px-1 py-0.5 rounded text-xs">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="btn btn-ghost"
              disabled={updatePOIMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleEditFormSubmit}
              className="btn btn-primary"
              disabled={updatePOIMutation.isPending}
            >
              {updatePOIMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditPOIModal;
