"use client";
import React, { useState, useRef, useEffect } from "react";
import Script from "next/script";
import { toast } from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  MapPin,
  X,
  MapPinCheckInside,
  Trash2,
  Heart,
  Eye,
  Edit,
  Lock,
  Globe,
} from "lucide-react";

import POICreationInterface from "@/components/utility/poi/POICreationInterface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mapApi, poiApi, tagApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
// Removed ImageCropper import - no longer using cropping
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";

const AddPOI = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Removed cropping states - no longer using cropping
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagModalPOIIndex, setTagModalPOIIndex] = useState(null);
  const [newTagName, setNewTagName] = useState("");
  const [poiSearchQuery, setPoiSearchQuery] = useState("");

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPOI, setEditingPOI] = useState(null);
  const [editFormData, setEditFormData] = useState({
    locationName: "",
    description: "",
    googleMapsLink: "",
    isPrivate: false,
    tags: [],
    lat: null,
    lng: null,
    date_visited: null,
  });

  // Edit modal photo upload states
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [editPhotoDate, setEditPhotoDate] = useState("");
  const [editPhotoIsPrimary, setEditPhotoIsPrimary] = useState(false);
  const [editPhotoUploading, setEditPhotoUploading] = useState(false);
  const editPhotoFileInputRef = useRef(null);

  // Photo gallery modal states
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Delete confirmation modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  // POI deletion confirmation modal states
  const [showPOIDeleteConfirm, setShowPOIDeleteConfirm] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState(null);

  // Fetch user's POIs
  const { data: userPOIsData, refetch: refetchPOIs } = useQuery({
    queryKey: ["userPOIs", user?._id],
    queryFn: async () => {
      if (!user?._id) return { pois: [] };
      const response = await poiApi.getUserPOIs(1, 100); // Increased limit to 100
      console.log("API Response:", response); // Debug log
      // The backend returns data directly, not wrapped in a 'pois' property
      return { pois: response.data || [] };
    },
    enabled: !!user?._id,
  });

  const userPOIs = userPOIsData?.pois || [];

  // Filter POIs based on search query
  const filteredPOIs = userPOIs.filter((poi) => {
    if (!poiSearchQuery.trim()) return true;

    const query = poiSearchQuery.toLowerCase();
    return (
      poi.locationName?.toLowerCase().includes(query) ||
      poi.description?.toLowerCase().includes(query) ||
      poi.tags?.some((tag) =>
        (typeof tag === "object" ? tag.name : tag).toLowerCase().includes(query)
      ) ||
      poi.googleMapsLink?.toLowerCase().includes(query)
    );
  });

  // Fetch available tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await tagApi.getAllTags();
      return response.data || [];
    },
  });

  // Removed cropping functions - no longer using cropping

  const handleTogglePOIPrivacy = async (poiId, currentPrivacy) => {
    try {
      console.log("Toggling POI privacy:", {
        poiId,
        currentPrivacy,
        newPrivacy: !currentPrivacy,
      });

      const response = await poiApi.updatePOI(poiId, {
        isPrivate: !currentPrivacy,
      });

      if (response.success) {
        // Refresh the POIs list
        refetchPOIs();
        toast.success(
          `POI ${!currentPrivacy ? "made private" : "made public"}!`
        );
      } else {
        toast.error("Failed to update POI privacy");
      }
    } catch (error) {
      console.error("Error updating POI privacy:", error);
      toast.error("Failed to update POI privacy");
    }
  };

  // Edit modal functions
  const handleEditPOI = (poi) => {
    setEditingPOI(poi);
    setEditFormData({
      locationName: poi.locationName || "",
      description: poi.description || "",
      googleMapsLink: poi.googleMapsLink || "",
      isPrivate: poi.isPrivate || false,
      tags:
        poi.tags?.map((tag) => (typeof tag === "object" ? tag.name : tag)) ||
        [],
      lat: poi.lat || null,
      lng: poi.lng || null,
      date_visited: poi.date_visited
        ? new Date(poi.date_visited).toISOString().split("T")[0]
        : null,
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditFormSubmit = async () => {
    try {
      if (!editingPOI?._id) {
        toast.error("No POI selected for editing");
        return;
      }

      // Validate Google Maps link
      let validGoogleMapsLink = editFormData.googleMapsLink;
      if (
        editFormData.googleMapsLink &&
        !editFormData.googleMapsLink.match(
          /^https:\/\/(maps\.google\.com|goo\.gl\/maps)\/.*$/
        )
      ) {
        console.warn(
          "Invalid Google Maps link filtered out:",
          editFormData.googleMapsLink
        );
        validGoogleMapsLink = "";
      }

      const updateData = {
        locationName: editFormData.locationName,
        description: editFormData.description,
        googleMapsLink: validGoogleMapsLink,
        isPrivate: editFormData.isPrivate,
        tags: editFormData.tags,
        lat: editFormData.lat,
        lng: editFormData.lng,
        date_visited: editFormData.date_visited
          ? new Date(editFormData.date_visited)
          : null,
      };

      const response = await poiApi.updatePOI(editingPOI._id, updateData);

      if (response.success) {
        toast.success("POI updated successfully!");
        setShowEditModal(false);
        setEditingPOI(null);
        refetchPOIs();
      } else {
        toast.error("Failed to update POI");
      }
    } catch (error) {
      console.error("Error updating POI:", error);
      toast.error("Failed to update POI");
    }
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingPOI(null);
    setEditFormData({
      locationName: "",
      description: "",
      googleMapsLink: "",
      isPrivate: false,
      tags: [],
      lat: null,
      lng: null,
      date_visited: null,
    });
    // Reset photo upload state
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
    setEditPhotoDate("");
    setEditPhotoIsPrimary(false);
    if (editPhotoFileInputRef.current) {
      editPhotoFileInputRef.current.value = "";
    }
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

  const handleDeletePOI = async (poiId, poiName) => {
    // Show confirmation modal instead of deleting immediately
    setPoiToDelete({ poiId, poiName });
    setShowPOIDeleteConfirm(true);
  };

  // Photo gallery functions
  const handleOpenPhotoGallery = (poi, photoIndex = 0) => {
    setSelectedPOI(poi);
    setCurrentPhotoIndex(photoIndex);
    setShowPhotoGallery(true);
  };

  const handleClosePhotoGallery = () => {
    setShowPhotoGallery(false);
    setSelectedPOI(null);
    setCurrentPhotoIndex(0);
  };

  const handleNextPhoto = () => {
    if (selectedPOI && selectedPOI.photos) {
      setCurrentPhotoIndex((prev) =>
        prev === selectedPOI.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPOI && selectedPOI.photos) {
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? selectedPOI.photos.length - 1 : prev - 1
      );
    }
  };

  // Edit modal photo upload handlers
  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhotoUpload = async () => {
    if (!editPhotoFile || !editingPOI?._id) {
      toast.error("Please select a photo to upload");
      return;
    }

    try {
      setEditPhotoUploading(true);
      const loadingToast = toast.loading("Uploading photo...");

      // Compress the image before uploading
      const response = await fetch(editPhotoPreview);
      const blob = await response.blob();
      const compressedFile = await compressImage(blob, 0.7);

      // Upload photo to the POI
      const photoResponse = await poiApi.uploadPhoto(
        editingPOI._id,
        compressedFile,
        null, // No crop data - preserving original aspect ratio
        editPhotoIsPrimary,
        editPhotoDate || null
      );

      if (photoResponse.success) {
        toast.success("Photo uploaded successfully!", { id: loadingToast });

        // Reset photo upload form
        setEditPhotoFile(null);
        setEditPhotoPreview(null);
        setEditPhotoDate("");
        setEditPhotoIsPrimary(false);
        if (editPhotoFileInputRef.current) {
          editPhotoFileInputRef.current.value = "";
        }

        // Refresh the POIs list to show the new photo
        refetchPOIs();
      } else {
        toast.error(`Failed to upload photo: ${photoResponse.message}`, {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setEditPhotoUploading(false);
    }
  };

  const handleEditPhotoCancel = () => {
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
    setEditPhotoDate("");
    setEditPhotoIsPrimary(false);
    if (editPhotoFileInputRef.current) {
      editPhotoFileInputRef.current.value = "";
    }
  };

  // Delete photo handler
  const handleDeletePhoto = async (photoId, photoIndex) => {
    // Set the photo to delete and show confirmation modal
    setPhotoToDelete({ photoId, photoIndex });
    setShowDeleteConfirm(true);
  };

  // Confirm photo deletion
  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    const { photoId, photoIndex } = photoToDelete;

    try {
      const loadingToast = toast.loading("Deleting photo...");

      const deleteResponse = await poiApi.deletePhoto(photoId);

      if (deleteResponse.success) {
        toast.success("Photo deleted successfully!", { id: loadingToast });

        // Refresh the POIs list to update the display
        refetchPOIs();

        // Update the editingPOI state to reflect the deletion
        if (editingPOI) {
          setEditingPOI((prev) => ({
            ...prev,
            photos: prev.photos.filter((_, index) => index !== photoIndex),
          }));
        }
      } else {
        toast.error(`Failed to delete photo: ${deleteResponse.message}`, {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo. Please try again.");
    } finally {
      // Close the confirmation modal
      setShowDeleteConfirm(false);
      setPhotoToDelete(null);
    }
  };

  // Cancel photo deletion
  const cancelDeletePhoto = () => {
    setShowDeleteConfirm(false);
    setPhotoToDelete(null);
  };

  // Confirm POI deletion
  const confirmDeletePOI = async () => {
    if (!poiToDelete) return;

    const { poiId, poiName } = poiToDelete;

    try {
      // Show loading toast
      const loadingToast = toast.loading("Checking if POI can be deleted...");

      // First, check if the POI is used in any maps
      const mapsResponse = await mapApi.getUserMaps(user._id);
      const userMaps = mapsResponse.data?.maps || [];

      // Check if this POI is used in any of the user's maps
      const isUsedInUserMaps = userMaps.some(
        (map) => map.pois && map.pois.some((poi) => poi.poi_id === poiId)
      );

      if (isUsedInUserMaps) {
        toast.error(
          "Cannot delete POI: It's currently used in one or more of your maps. Remove it from all maps first.",
          { id: loadingToast }
        );
        return;
      }

      // Attempt to delete the POI
      const deleteResponse = await poiApi.deletePOI(poiId);

      if (deleteResponse.success) {
        toast.success(
          `POI "${poiName}" and all associated photos deleted successfully!`,
          {
            id: loadingToast,
          }
        );
        // Refresh the POIs list
        refetchPOIs();
      } else {
        // Handle specific error messages from backend
        const errorMessage = deleteResponse.message || "Failed to delete POI";
        if (
          errorMessage.includes("used in") ||
          errorMessage.includes("referenced")
        ) {
          toast.error(
            `Cannot delete POI: ${errorMessage}. Remove it from all maps first.`,
            { id: loadingToast }
          );
        } else {
          toast.error(`Failed to delete POI: ${errorMessage}`, {
            id: loadingToast,
          });
        }
      }
    } catch (error) {
      console.error("Error deleting POI:", error);
      toast.error("Failed to delete POI. Please try again.");
    } finally {
      // Close the confirmation modal
      setShowPOIDeleteConfirm(false);
      setPoiToDelete(null);
    }
  };

  // Cancel POI deletion
  const cancelDeletePOI = () => {
    setShowPOIDeleteConfirm(false);
    setPoiToDelete(null);
  };

  // Image compression function
  const compressImage = (file, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(resolve, "image/jpeg", quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <>
      <div className="pb-6 space-y-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Script
          src="https://cdn.jsdelivr.net/npm/exif-js"
          strategy="afterInteractive"
        />

        <div className="text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            Manage Points of Interest
          </h2>
          <p className="text-neutral-600 text-lg">
            Create, organize, and manage your travel locations
          </p>
        </div>

        {/* POI Creation Interface */}
        <POICreationInterface availableTags={availableTags} />

        {/* User's POIs Section */}
        <div className="bg-base-200 p-8 rounded-xl shadow-lg border border-base-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MapPin size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">Your POIs</h3>
                <p className="text-neutral-600">
                  {filteredPOIs.length} of {userPOIs.length} locations
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                id="poiSearchInput"
                type="text"
                placeholder="Search your POIs..."
                value={poiSearchQuery}
                onChange={(e) => setPoiSearchQuery(e.target.value)}
                className="input input-bordered w-full pl-12 pr-10 h-12 text-base"
                aria-label="Search POIs by name, description, tags, or Google Maps link"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {poiSearchQuery && (
                <button
                  id="clearSearchButton"
                  onClick={() => setPoiSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center group"
                  aria-label="Clear search query"
                >
                  <div className="p-1.5 rounded-full bg-neutral-200 hover:bg-neutral-300 transition-colors duration-200 group-hover:scale-110">
                    <X
                      size={14}
                      className="text-neutral-600 hover:text-neutral-800 transition-colors"
                    />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* POIs Grid */}
          {userPOIs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <div className="p-4 bg-base-300 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <MapPin className="w-10 h-10 opacity-50" />
              </div>
              <h4 className="text-xl font-semibold mb-2">No POIs Yet</h4>
              <p className="text-neutral-600 mb-4">
                Start adding some locations above to see them here!
              </p>
              <p className="text-sm text-neutral-500">
                Use the "Create New POI" dropdown above to add your first
                location!
              </p>
            </div>
          ) : filteredPOIs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <div className="p-4 bg-base-300 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-10 h-10 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">No Results Found</h4>
              <p className="text-neutral-600 mb-4">
                No POIs found matching "{poiSearchQuery}"
              </p>
              <button
                id="clearSearchResultsButton"
                onClick={() => setPoiSearchQuery("")}
                className="btn btn-outline btn-primary hover:btn-primary transition-all duration-200"
                aria-label="Clear search results"
              >
                <X size={16} className="mr-2" />
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPOIs.map((poi, index) => (
                <div
                  key={poi._id || index}
                  className="bg-base-100 rounded-xl shadow-lg border border-base-300 h-full flex flex-col hover:shadow-xl transition-all duration-200 group"
                >
                  {/* Photo Section */}
                  {poi.photos && poi.photos.length > 0 ? (
                    <div
                      className="relative h-48 overflow-hidden rounded-t-xl cursor-pointer group"
                      onClick={() => handleOpenPhotoGallery(poi, 0)}
                    >
                      <img
                        src={poi.photos[0].s3Url || poi.photos[0].fullUrl}
                        alt={poi.locationName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Photo count badge */}
                      {poi.photos.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                          +{poi.photos.length - 1} more
                        </div>
                      )}
                      {/* Primary photo indicator */}
                      {poi.photos[0].isPrimary && (
                        <div className="absolute top-3 left-3 bg-primary/80 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Primary
                        </div>
                      )}
                      {/* Photo date badge */}
                      {poi.photos[0].date_visited && (
                        <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                          📅{" "}
                          {new Date(
                            poi.photos[0].date_visited
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-base-300 rounded-t-xl flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-neutral-400" />
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-primary line-clamp-2">
                        {poi.locationName}
                      </h4>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleEditPOI(poi)}
                          className="btn btn-ghost btn-sm p-1 hover:bg-base-300"
                          title="Edit POI"
                        >
                          <Edit size={16} className="text-neutral-600" />
                        </button>
                        <button
                          onClick={() => handleOpenPhotoGallery(poi, 0)}
                          className="btn btn-ghost btn-sm p-1 hover:bg-base-300"
                          title="View photos"
                        >
                          <Eye size={16} className="text-neutral-600" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePOI(poi._id, poi.locationName)
                          }
                          className="btn btn-ghost btn-sm p-1 hover:bg-error text-neutral-600 hover:text-white"
                          title="Delete POI"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {poi.description && (
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                        {poi.description}
                      </p>
                    )}

                    {/* Tags */}
                    {poi.tags && poi.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {poi.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="badge badge-primary badge-soft badge-xs"
                          >
                            {typeof tag === "object" ? tag.name : tag}
                          </span>
                        ))}
                        {poi.tags.length > 3 && (
                          <span className="badge badge-neutral badge-soft badge-xs">
                            +{poi.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Coordinates */}
                    {poi.lat && poi.lng && (
                      <div className="text-xs text-neutral-500 mb-3">
                        📍 {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
                      </div>
                    )}

                    {/* Privacy Status */}
                    <div className="flex items-center gap-2 mt-auto">
                      {poi.isPrivate ? (
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <Lock size={12} />
                          Private
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <Globe size={12} />
                          Public
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showPhotoGallery && selectedPOI && selectedPOI.photos && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl h-5/6 max-h-screen">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-primary">
                {selectedPOI.locationName} - Photos
              </h3>
              <button
                onClick={handleClosePhotoGallery}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative">
              {/* Main Photo Display */}
              <div className="relative h-96 bg-base-300 rounded-lg overflow-hidden">
                <img
                  src={
                    selectedPOI.photos[currentPhotoIndex].s3Url ||
                    selectedPOI.photos[currentPhotoIndex].fullUrl
                  }
                  alt={`Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />

                {/* Navigation Buttons */}
                {selectedPOI.photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Photo Info and Navigation */}
              <div className="mt-4 text-white text-center">
                <p className="text-sm mb-2">
                  Photo {currentPhotoIndex + 1} of {selectedPOI.photos.length}
                </p>

                {/* Photo Thumbnails */}
                {selectedPOI.photos.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {selectedPOI.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentPhotoIndex
                            ? "border-primary"
                            : "border-transparent hover:border-white/50"
                        }`}
                      >
                        <img
                          src={
                            photo.thumbnailUrl || photo.s3Url || photo.fullUrl
                          }
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Photo Details */}
                <div className="mt-4 text-sm text-neutral-300">
                  {selectedPOI.photos[currentPhotoIndex].isPrimary && (
                    <span className="badge badge-primary badge-sm mr-2">
                      Primary
                    </span>
                  )}
                  <span>
                    📅{" "}
                    {new Date(
                      selectedPOI.photos[currentPhotoIndex].date_visited
                    ).toLocaleDateString()}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    Uploaded{" "}
                    {new Date(
                      selectedPOI.photos[currentPhotoIndex].created_at
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Photo Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onConfirm={confirmDeletePhoto}
          onCancel={cancelDeletePhoto}
          title="Delete Photo"
          message="Are you sure you want to delete this photo? This will permanently remove it from your account and cannot be recovered."
        />
      )}

      {/* Edit POI Modal */}
      {showEditModal && editingPOI && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl text-primary">
                Edit POI: {editingPOI.locationName}
              </h3>
              <button
                onClick={handleEditModalClose}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Location Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.locationName}
                    onChange={(e) =>
                      handleEditFormChange("locationName", e.target.value)
                    }
                    className="input input-bordered w-full"
                    placeholder="Enter location name"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Google Maps Link
                    </span>
                  </label>
                  <input
                    type="url"
                    value={editFormData.googleMapsLink}
                    onChange={(e) =>
                      handleEditFormChange("googleMapsLink", e.target.value)
                    }
                    className="input input-bordered w-full"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    handleEditFormChange("description", e.target.value)
                  }
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Describe this location..."
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Latitude</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editFormData.lat || ""}
                    onChange={(e) =>
                      handleEditFormChange(
                        "lat",
                        parseFloat(e.target.value) || null
                      )
                    }
                    className="input input-bordered w-full"
                    placeholder="e.g., 40.7128"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Longitude</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editFormData.lng || ""}
                    onChange={(e) =>
                      handleEditFormChange(
                        "lng",
                        parseFloat(e.target.value) || null
                      )
                    }
                    className="input input-bordered w-full"
                    placeholder="e.g., -74.0060"
                  />
                </div>
              </div>

              {/* Date Visited */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Date Visited</span>
                </label>
                <input
                  type="date"
                  value={editFormData.date_visited || ""}
                  onChange={(e) =>
                    handleEditFormChange("date_visited", e.target.value)
                  }
                  className="input input-bordered w-full"
                />
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center gap-3">
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
                  className="label-text font-semibold"
                >
                  Make this POI private
                </label>
              </div>

              {/* Tags */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Tags</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editFormData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-primary badge-outline gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTagFromEdit(tag)}
                        className="btn btn-ghost btn-xs p-0"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTagToEdit(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="select select-bordered flex-1"
                  >
                    <option value="">Add existing tag...</option>
                    {availableTags
                      .filter((tag) => !editFormData.tags.includes(tag.name))
                      .map((tag) => (
                        <option key={tag._id} value={tag.name}>
                          {tag.name}
                        </option>
                      ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Add new tag..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        handleAddTagToEdit(e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                    className="input input-bordered flex-1"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-lg mb-4">Add Photo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Photo</span>
                    </label>
                    <input
                      ref={editPhotoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditPhotoChange}
                      className="file-input file-input-bordered w-full"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Photo Date
                      </span>
                    </label>
                    <input
                      type="date"
                      value={editPhotoDate}
                      onChange={(e) => setEditPhotoDate(e.target.value)}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <input
                    type="checkbox"
                    id="editPhotoPrimary"
                    checked={editPhotoIsPrimary}
                    onChange={(e) => setEditPhotoIsPrimary(e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                  <label htmlFor="editPhotoPrimary" className="label-text">
                    Set as primary photo
                  </label>
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
                        disabled={editPhotoUploading}
                        className="btn btn-primary btn-sm"
                      >
                        {editPhotoUploading ? "Uploading..." : "Upload Photo"}
                      </button>
                      <button
                        onClick={handleEditPhotoCancel}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Photos */}
              {editingPOI.photos && editingPOI.photos.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-4">
                    Existing Photos
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {editingPOI.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.s3Url || photo.fullUrl}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDeletePhoto(photo._id, index)}
                            className="btn btn-error btn-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {photo.isPrimary && (
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
                  onClick={handleEditModalClose}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditFormSubmit}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete POI Confirmation Modal */}
      {showPOIDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showPOIDeleteConfirm}
          onConfirm={confirmDeletePOI}
          onCancel={cancelDeletePOI}
          title="Delete POI"
          message={`Are you sure you want to delete "${poiToDelete?.poiName}"? This will permanently remove the POI and all its associated photos from your account and cannot be recovered.`}
        />
      )}
    </>
  );
};

export default AddPOI;
