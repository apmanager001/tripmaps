import { create } from "zustand";

export const usePOIStore = create((set) => ({
  // POI Data
  selectedPOI: null,
  editingPOI: null,
  poiToDelete: null,

  // Photo Data
  currentPhotoIndex: 0,
  flaggingPhoto: null,

  // Modal States
  showPhotoGallery: false,
  showEditModal: false,
  showDeleteConfirm: false,
  showPOIDeleteConfirm: false,
  showFlagModal: false,

  // Actions
  setSelectedPOI: (poi) => set({ selectedPOI: poi }),
  setEditingPOI: (poi) => set({ editingPOI: poi }),
  setPoiToDelete: (poi) => set({ poiToDelete: poi }),
  setCurrentPhotoIndex: (index) => set({ currentPhotoIndex: index }),
  setFlaggingPhoto: (photo) => set({ flaggingPhoto: photo }),

  // Modal Actions
  openPhotoGallery: (poi, photoIndex = 0) =>
    set({
      showPhotoGallery: true,
      selectedPOI: poi,
      currentPhotoIndex: photoIndex,
    }),
  closePhotoGallery: () =>
    set({
      showPhotoGallery: false,
      selectedPOI: null,
      currentPhotoIndex: 0,
    }),

  openEditModal: (poi) =>
    set({
      showEditModal: true,
      editingPOI: poi,
    }),
  closeEditModal: () =>
    set({
      showEditModal: false,
      editingPOI: null,
    }),

  openDeletePhotoConfirm: () => set({ showDeleteConfirm: true }),
  closeDeletePhotoConfirm: () => set({ showDeleteConfirm: false }),

  openPOIDeleteConfirm: (poi) =>
    set({
      showPOIDeleteConfirm: true,
      poiToDelete: poi,
    }),
  closePOIDeleteConfirm: () =>
    set({
      showPOIDeleteConfirm: false,
      poiToDelete: null,
    }),

  openFlagModal: (photo, locationName) =>
    set({
      showFlagModal: true,
      flaggingPhoto: {
        id: photo._id,
        url: photo.s3Url || photo.fullUrl,
        locationName: locationName,
      },
    }),
  closeFlagModal: () =>
    set({
      showFlagModal: false,
      flaggingPhoto: null,
    }),

  // Reset all modals
  resetAllModals: () =>
    set({
      showPhotoGallery: false,
      showEditModal: false,
      showDeleteConfirm: false,
      showPOIDeleteConfirm: false,
      showFlagModal: false,
      selectedPOI: null,
      editingPOI: null,
      poiToDelete: null,
      currentPhotoIndex: 0,
      flaggingPhoto: null,
    }),
}));
