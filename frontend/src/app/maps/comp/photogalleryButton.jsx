"use client";
import React, { useState } from "react";
import { Images } from "lucide-react";
import POIPhotoGallery from "@/components/POIPhotoGallery";
import { usePOIStore } from "@/store/usePOIStore";

const PhotoGalleryButton = ({
  id,
  photos = null,
  mapName = null,
  initialPhotoIndex = 0,
}) => {
  const [openModal, setOpenModal] = useState(false);

  const {
    showPhotoGallery,
    showFlagModal,
    flaggingPhoto,
    openPhotoGallery,
    openEditModal,
    openPOIDeleteConfirm,
    openFlagModal: openFlagModalStore,
  } = usePOIStore();

  const handleClose = () => {
    setOpenModal(false);
    const { closePhotoGallery } = usePOIStore.getState();
    if (closePhotoGallery) closePhotoGallery();
  };

  // If photos are provided, create a synthetic POI object for the gallery
  const syntheticPOI = photos
    ? {
        _id: id || "map-photos",
        locationName: mapName || "Map Photos",
        photos: photos,
      }
    : null;

  return (
    <>
      <button
        className="btn btn-xs md:btn-sm btn-soft btn-warning rounded-full tooltip tooltip-top"
        data-tip="Photo Gallery"
        aria-label="Open Photo Gallery"
        type="button"
        onClick={() => {
          setOpenModal(true);
          // If using store-driven gallery elsewhere, open via store.
          const { openPhotoGallery } = usePOIStore.getState();
          if (!photos && openPhotoGallery) {
            openPhotoGallery();
          }
        }}
      >
        <Images className="w-4 h-4" />
      </button>

      {openModal && (
        <POIPhotoGallery
          isOpen={true}
          removePrimaryButton={true}
          onClose={handleClose}
          poi={syntheticPOI}
          initialPhotoIndex={initialPhotoIndex}
          showFlagButton={true}
          onFlagPhoto={(e, photo, poi) => {
            // Open flag modal via store
            const { openFlagModal } = usePOIStore.getState();
            if (openFlagModal)
              openFlagModal(photo, poi.locationName || poi.locationName);
          }}
        />
      )}
    </>
  );
};

export default PhotoGalleryButton;
