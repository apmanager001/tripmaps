"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { homepageApi, tagApi, poiApi, mapApi } from "@/lib/api";
import POICard from "@/components/POICard";
import EditPOIModal from "@/components/EditPOIModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";

const fetchPopularPOIs = async () => {
  const response = await homepageApi.getPopularPOIs();
  return response.data || [];
};

export default function PopularLocations() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPOI, setEditingPOI] = useState(null);

  // POI deletion confirmation modal states
  const [showPOIDeleteConfirm, setShowPOIDeleteConfirm] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState(null);

  // Delete confirmation modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["popularPOIs"],
    queryFn: fetchPopularPOIs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch available tags for the edit modal
  const { data: availableTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await tagApi.getAllTags();
      return response.data || [];
    },
  });

  if (isLoading)
    return (
      <section className="my-12 px-6 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-6">Trending POIs</h2>
        <div className="text-center">Loading popular POIs...</div>
      </section>
    );

  if (error)
    return (
      <section className="my-12 px-6 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-6">Trending POIs</h2>
        <div className="text-center text-error">Failed to load POIs</div>
      </section>
    );

  // Edit modal handlers
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
        // Refresh the popular POIs list
        queryClient.invalidateQueries(["popularPOIs"]);
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

  // Photo deletion handlers (placeholder functions for compatibility)
  const confirmDeletePhoto = () => {
    // This would be implemented if photo deletion is needed in popular locations
    setShowDeleteConfirm(false);
    setPhotoToDelete(null);
  };

  const cancelDeletePhoto = () => {
    setShowDeleteConfirm(false);
    setPhotoToDelete(null);
  };

  if (!data || data.length === 0) {
    return (
      <section className="my-12 px-6 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-6">Trending POIs</h2>
        <div className="text-center text-neutral-500">
          No POIs available yet.
        </div>
      </section>
    );
  }

  return (
    <section
      className="my-12 px-6 flex flex-col justify-center items-center"
      id="popular-locations"
    >
      <h2 className="text-2xl font-semibold mb-6">Trending POIs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl w-full">
        {data.map((poi) => (
          <POICard
            key={poi._id}
            poi={poi}
            onEdit={handleEditPOI}
            onDelete={handleDeletePOI}
            showActions={true}
            showLikeButton={true}
            showFlagButton={true}
            mapLocation={false}
            compact={true}
            className="cursor-pointer"
            onClick={() => router.push(`/point_of_interest/${poi._id}`)}
          />
        ))}
      </div>

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

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onConfirm={confirmDeletePhoto}
          onCancel={cancelDeletePhoto}
          title="Delete Photo"
          message="Are you sure you want to delete this photo? This will permanently remove it from your account and cannot be recovered."
        />
      )}
    </section>
  );
}
