"use client";
import React from "react";
import POIPhotoGallery from "@/components/POIPhotoGallery";
import EditPOIModal from "@/components/EditPOIModal";
import DeleteConfirmationModal from "../../../../components/DeleteConfirmationModal";
import FlagModal from "../../../../components/FlagModal";
import { usePOIStore } from "@/store/usePOIStore";

const PoiModalButtons = ({ availableTags }) => {
  const {
    // Modal states
    showPhotoGallery,
    showEditModal,
    showDeleteConfirm,
    showPOIDeleteConfirm,
    showFlagModal,

    // POI data
    selectedPOI,
    editingPOI,
    poiToDelete,
    currentPhotoIndex,
    flaggingPhoto,

    // Actions
    closePhotoGallery,
    closeEditModal,
    closeFlagModal,
    closeDeletePhotoConfirm,
    closePOIDeleteConfirm,
  } = usePOIStore();

  return (
    <>
      {/* POI Photo Gallery */}
      <POIPhotoGallery
        isOpen={showPhotoGallery}
        onClose={closePhotoGallery}
        poi={selectedPOI}
        initialPhotoIndex={currentPhotoIndex}
        showFlagButton={true}
        onFlagPhoto={(photo) => {
          // This will be handled by the store when the photo is flagged
        }}
      />

      {/* Delete Photo Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onConfirm={() => {
            // This will be handled by the parent component
            closeDeletePhotoConfirm();
          }}
          onCancel={closeDeletePhotoConfirm}
          title="Delete Photo"
          message="Are you sure you want to delete this photo? This will permanently remove it from your account and cannot be recovered."
        />
      )}

      {/* Edit POI Modal */}
      <EditPOIModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        poi={editingPOI}
        availableTags={availableTags}
      />

      {/* Delete POI Confirmation Modal */}
      {showPOIDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showPOIDeleteConfirm}
          onConfirm={() => {
            // This will be handled by the parent component
            closePOIDeleteConfirm();
          }}
          onCancel={closePOIDeleteConfirm}
          title="Delete POI"
          message={`Are you sure you want to delete "${poiToDelete?.poiName}"? This will permanently remove the POI and all its associated photos from your account and cannot be recovered.`}
        />
      )}

      {/* Flag Modal */}
      {showFlagModal && flaggingPhoto && (
        <FlagModal
          isOpen={showFlagModal}
          onClose={closeFlagModal}
          photoId={flaggingPhoto.id}
          photoUrl={flaggingPhoto.url}
          locationName={flaggingPhoto.locationName}
        />
      )}
    </>
  );
};

export default PoiModalButtons;
