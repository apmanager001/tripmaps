"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { poiApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { X, Search, Plus, MapPin } from "lucide-react";
import POICard from "./POICard";

const AddPOIToMapModal = ({ isOpen, onClose, mapId, mapName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedPOIs, setAddedPOIs] = useState(new Set());
  const queryClient = useQueryClient();

  // Add POI to map mutation
  const addPOIToMapMutation = useMutation({
    mutationFn: ({ mapId, poiId }) => poiApi.addPOIToMap(mapId, poiId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("POI added to map successfully!");
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries(["individualMap", mapId]);
        queryClient.invalidateQueries(["userMaps"]);
      } else {
        toast.error(data.message || "Failed to add POI to map");
      }
    },
    onError: (error) => {
      console.error("Add POI to map error:", error);
      toast.error(`Failed to add POI to map: ${error.message}`);
    },
  });

  // Search POIs function
  const searchPOIs = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Get all POIs with a much higher limit to ensure we get all POIs
      const response = await poiApi.getUserPOIs(1, 200);

      if (response.success && (response.pois || response.data)) {
        const allPOIs = response.pois || response.data || [];

        // Filter for public POIs and search query
        const publicPOIs = allPOIs.filter((poi) => !poi.isPrivate);

        // Filter out POIs that are already in the current map
        const poisNotInMap = publicPOIs.filter((poi) => {
          // Handle different possible map_id formats
          const poiMapId = poi.map_id?._id || poi.map_id;
          return poiMapId !== mapId;
        });

        // Filter by search query (case insensitive)
        const searchTerm = query.toLowerCase();
        const filteredPOIs = poisNotInMap.filter((poi) => {
          const locationName = (poi.locationName || "").toLowerCase();
          const description = (poi.description || "").toLowerCase();
          const tags = (poi.tags || [])
            .map((tag) => tag.name || tag)
            .join(" ")
            .toLowerCase();

          return (
            locationName.includes(searchTerm) ||
            description.includes(searchTerm) ||
            tags.includes(searchTerm)
          );
        });

        setSearchResults(filteredPOIs);
      } else {
        setSearchResults([]);
        toast.error("Failed to search POIs");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      toast.error("Failed to search POIs");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPOIs(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle adding POI to map
  const handleAddPOIToMap = async (poi) => {
    if (addedPOIs.has(poi._id)) {
      toast.info("POI is already in this map");
      return;
    }

    addPOIToMapMutation.mutate(
      { mapId, poiId: poi._id },
      {
        onSuccess: () => {
          setAddedPOIs((prev) => new Set(prev).add(poi._id));
        },
      }
    );
  };

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setAddedPOIs(new Set());
    } else {
      // Invalidate POI queries when modal opens to ensure fresh data
      queryClient.invalidateQueries(["userPOIs"]);
    }
  }, [isOpen, queryClient]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg text-primary">Add POI to Map</h3>
            <p className="text-sm text-neutral-600">
              Search and add public POIs to "{mapName}"
            </p>
          </div>
          <button
            id="close-modal-button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                size={20}
              />
              <input
                id="poi-search-input"
                type="text"
                placeholder="Search for public POIs..."
                className="input input-bordered w-full md:pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              id="search-all-pois-button"
              onClick={async () => {
                setIsSearching(true);
                try {
                  const response = await poiApi.getUserPOIs(1, 200);

                  if (response.success && (response.pois || response.data)) {
                    const pois = response.pois || response.data || [];
                    const publicPOIs = pois.filter((poi) => !poi.isPrivate);
                    // Filter out POIs that are already in the current map
                    const poisNotInMap = publicPOIs.filter((poi) => {
                      // Handle different possible map_id formats
                      const poiMapId = poi.map_id?._id || poi.map_id;
                      return poiMapId !== mapId;
                    });
                    setSearchResults(poisNotInMap);
                    setSearchQuery(""); // Clear search query
                  } else {
                    toast.error("Failed to load POIs");
                  }
                } catch (error) {
                  console.error("Error loading all POIs:", error);
                  toast.error("Failed to load POIs");
                } finally {
                  setIsSearching(false);
                }
              }}
              className="btn btn-primary btn-soft"
              disabled={isSearching}
            >
              Show All POIs
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading loading-spinner loading-md"></div>
              <span className="ml-2 text-neutral-600">Searching...</span>
            </div>
          ) : searchQuery.trim() && searchResults.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto text-neutral-400 mb-2" size={48} />
              <p className="text-neutral-600">
                No public POIs found matching "{searchQuery}"
              </p>
            </div>
          ) : searchQuery.trim() && searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((poi) => (
                <div key={poi._id} className="relative">
                  <POICard
                    poi={poi}
                    showActions={false}
                    showLikeButton={true}
                    showFlagButton={false}
                    compact={true}
                    className="h-full"
                    overlayButton={
                      <button
                        onClick={() => handleAddPOIToMap(poi)}
                        disabled={
                          addPOIToMapMutation.isPending ||
                          addedPOIs.has(poi._id)
                        }
                        className={`btn btn-sm ${
                          addedPOIs.has(poi._id) ? "btn-success" : "btn-primary"
                        } shadow-lg`}
                        id={`add-poi-button-${poi._id}`}
                      >
                        {addedPOIs.has(poi._id) ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Added
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            Add to Map
                          </>
                        )}
                      </button>
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="mx-auto text-neutral-400 mb-2" size={48} />
              <p className="text-neutral-600">
                Search for public POIs to add to your map
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action flex-shrink-0">
          <button id="modal-close-button" onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPOIToMapModal;
