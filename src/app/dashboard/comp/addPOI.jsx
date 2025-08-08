"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";
import { toast } from "react-hot-toast";
import {
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
  Flag,
} from "lucide-react";

import POICreationInterface from "@/components/utility/poi/POICreationInterface";
import POICard from "@/components/POICard";
import POIPhotoGallery from "@/components/POIPhotoGallery";
import EditPOIModal from "@/components/EditPOIModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mapApi, poiApi, tagApi, flagApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import FlagModal from "../../../components/FlagModal";

const AddPOI = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Removed cropping states - no longer using cropping
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagModalPOIIndex, setTagModalPOIIndex] = useState(null);
  const [newTagName, setNewTagName] = useState("");
  const [poiSearchQuery, setPoiSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [poisPerPage] = useState(20);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPOI, setEditingPOI] = useState(null);

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

  // Flag modal states
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flaggingPhoto, setFlaggingPhoto] = useState(null);

  // Fetch user's POIs
  const { data: userPOIsData, refetch: refetchPOIs } = useQuery({
    queryKey: ["userPOIs", user?._id, currentPage, debouncedSearchQuery],
    queryFn: async () => {
      if (!user?._id) return { pois: [], total: 0, pages: 1 };

      // If there's a search query, use the search endpoint
      if (debouncedSearchQuery.trim()) {
        const response = await poiApi.searchUserPOIs(
          debouncedSearchQuery.trim(),
          currentPage,
          poisPerPage
        );
        return {
          pois: response.data || [],
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1,
        };
      } else {
        // Otherwise, use the regular getUserPOIs endpoint
        const response = await poiApi.getUserPOIs(currentPage, poisPerPage);
        return {
          pois: response.data || [],
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1,
        };
      }
    },
    enabled: !!user?._id,
  });

  const userPOIs = userPOIsData?.pois || [];
  const totalPOIs = userPOIsData?.total || 0;
  const totalPages = userPOIsData?.pages || 1;

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
      // Toggling POI privacy

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
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingPOI(null);
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

  // Helper function to format EXIF date
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

  // Pagination functions
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to the top of the POIs section
    const poisSection = document.getElementById("pois-section");
    if (poisSection) {
      poisSection.scrollIntoView({ behavior: "smooth" });
    }
    // Don't reset search when changing pages during search
  };

  const handleSearch = (query) => {
    setPoiSearchQuery(query);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(poiSearchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [poiSearchQuery]);

  // Flag handling functions
  const handleFlagPhoto = (photo, poi) => {
    setFlaggingPhoto({
      id: photo._id,
      url: photo.s3Url || photo.fullUrl,
      locationName: poi.locationName,
    });
    setShowFlagModal(true);
  };

  const handleCloseFlagModal = () => {
    setShowFlagModal(false);
    setFlaggingPhoto(null);
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
      <div className="pb-6 space-y-8 w-full max-w-7xl mx-auto md:px-4 sm:px-6 lg:px-8">
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
        <div
          className="bg-base-200 p-2 md:p-8 md:rounded-xl md:shadow-lg border border-base-300"
          id="pois-section"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MapPin size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">Your POIs</h3>
                <p className="text-neutral-600">
                  {debouncedSearchQuery.trim()
                    ? `${userPOIs.length} of ${totalPOIs} locations`
                    : `Page ${currentPage} of ${totalPages} • ${totalPOIs} total locations`}
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
                onChange={(e) => handleSearch(e.target.value)}
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
                  onClick={() => handleSearch("")}
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
          {totalPOIs === 0 ? (
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
          ) : userPOIs.length === 0 ? (
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
                No POIs found matching "{debouncedSearchQuery}"
              </p>
              <button
                id="clearSearchResultsButton"
                onClick={() => handleSearch("")}
                className="btn btn-outline btn-primary hover:btn-primary transition-all duration-200"
                aria-label="Clear search results"
              >
                <X size={16} className="mr-2" />
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {userPOIs.map((poi, index) => (
                <POICard
                  key={poi._id || index}
                  poi={poi}
                  onEdit={handleEditPOI}
                  onDelete={handleDeletePOI}
                  onViewPhotos={handleOpenPhotoGallery}
                  showActions={true}
                  mapLocation={false}
                  showLikeButton={true}
                  showFlagButton={true}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="join-item btn btn-outline"
                >
                  «
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`join-item btn ${
                        currentPage === pageNum ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="join-item btn btn-outline"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POI Photo Gallery */}
      <POIPhotoGallery
        isOpen={showPhotoGallery}
        onClose={handleClosePhotoGallery}
        poi={selectedPOI}
        initialPhotoIndex={currentPhotoIndex}
        showFlagButton={true}
        onFlagPhoto={handleFlagPhoto}
      />

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
      <EditPOIModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        poi={editingPOI}
        availableTags={availableTags}
      />

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

      {/* Flag Modal */}
      {showFlagModal && flaggingPhoto && (
        <FlagModal
          isOpen={showFlagModal}
          onClose={handleCloseFlagModal}
          photoId={flaggingPhoto.id}
          photoUrl={flaggingPhoto.url}
          locationName={flaggingPhoto.locationName}
        />
      )}
    </>
  );
};

export default AddPOI;
