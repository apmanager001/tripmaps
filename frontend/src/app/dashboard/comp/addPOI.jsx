"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";
import { MapPin, X } from "lucide-react";
import POICreationInterface from "@/components/utility/poi/POICreationInterface";
import POICard from "@/components/POICard";
import { useQuery } from "@tanstack/react-query";
import { poiApi, tagApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePOIStore } from "@/store/usePOIStore";
import PoiModalButtons from "./comps/poiModalButtons";

const AddPOI = () => {
  const { user } = useAuthStore();

  // Use POI store for modal management
  const {
    openPhotoGallery,
    openEditModal,
    openPOIDeleteConfirm,
    openFlagModal,
  } = usePOIStore();

  const [poiSearchQuery, setPoiSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [poisPerPage] = useState(20);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

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


  // Edit modal functions
  const handleEditPOI = (poi) => {
    openEditModal(poi);
  };

  const handleDeletePOI = async (poiId, poiName) => {
    openPOIDeleteConfirm(poiId, poiName);
  };

  // Photo gallery functions
  const handleOpenPhotoGallery = (poi, photoIndex = 0) => {
    openPhotoGallery(poi, photoIndex);
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
          <p className="text-neutral-600">
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

      <PoiModalButtons availableTags={availableTags} />
    </>
  );
};

export default AddPOI;