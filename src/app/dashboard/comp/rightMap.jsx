"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { MapPin } from "lucide-react";
import { mapApi } from "@/lib/api";

// Removed nearby places search functionality

export default function NewMap({
  coordArray = [],
  setCoordArray = () => {},
  mapName = "",
  setMapName = () => {},
}) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // Add validation for coordArray
  const safeCoordArray = Array.isArray(coordArray) ? coordArray : [];

  // Add safe wrapper for setCoordArray calls
  const safeSetCoordArray = (updater) => {
    if (typeof setCoordArray === "function") {
      setCoordArray(updater);
    } else {
      console.error("setCoordArray is not a function");
    }
  };

  const handleSubmit = async () => {
    if (!user?._id) {
      toast.error("User not authenticated");
      return;
    }

    if (!mapName.trim()) {
      toast.error("Map name is required");
      return;
    }

    if (safeCoordArray.length === 0) {
      toast.error("At least one coordinate is required");
      return;
    }

    try {
      // Create the map with existing POI tags
      const mapResponse = await mapApi.createMap({
        mapName: mapName.trim(),
        coordArray: safeCoordArray,
        isPrivate: false,
      });

      if (!mapResponse.success) {
        throw new Error(mapResponse.message || "Failed to create map");
      }

      const mapId = mapResponse.data._id;

      // POIs are already created by the backend createMap function
      // No need to create them again here

      toast.success("Map and POIs saved successfully!");
      safeSetCoordArray([]);

      // Refresh dashboard data to show the new map
      queryClient.invalidateQueries(["dashboardData", user._id]);
    } catch (err) {
      console.error("Failed to submit map:", err);
      toast.error(err.message || "Failed to save map");
    }
  };

  const handleNameChange = (index, newName) => {
    safeSetCoordArray((prev) =>
      prev.map((coord, i) =>
        i === index ? { ...coord, locationName: newName, name: newName } : coord
      )
    );
  };

  const handleDelete = (index) => {
    safeSetCoordArray((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper function to get display data for a coordinate
  const getDisplayData = (coord) => {
    // For existing POIs, the data is already included in the coord object
    if (coord.isExistingPOI && coord.poi_id) {
      return {
        lat: coord.lat,
        lng: coord.lng,
        locationName: coord.locationName,
        description: coord.description,
        date_visited: coord.date_visited,
        tags: coord.tags,
        isPrivate: coord.isPrivate,
        photos: coord.photos,
        isExistingPOI: true,
        poi_id: coord.poi_id,
      };
    }
    // Return original coordinate data for new POIs
    return coord;
  };

  return (
    <>
      {/* Map Name Input */}
      {safeCoordArray.length > 0 && (
        <div className="bg-base-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                />
              </svg>
            </div>
            <div className="flex-1">
              <label htmlFor="mapNameInput" className="label">
                <span className="label-text font-semibold text-primary">
                  Map Name *
                </span>
              </label>
              <input
                id="mapNameInput"
                type="text"
                placeholder="Enter a name for your map..."
                className="input input-bordered w-full"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                aria-label="Enter map name"
              />
              {!mapName.trim() && (
                <p className="text-xs text-warning mt-1">
                  ⚠️ Map name is required to save your map
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Table */}
      {safeCoordArray.length > 0 && (
        <div className="space-y-4 bg-base-200 p-6 rounded-lg">
          <h2 className="text-xl font-bold">Map Builder</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Date Visited</th>
                  <th>Coordinates</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeCoordArray.map((coord, index) => {
                  const displayData = getDisplayData(coord);
                  return (
                    <tr
                      key={`coord-${coord.poi_id || coord.lat}-${
                        coord.lng
                      }-${index}`}
                      className="hover:bg-base-200"
                    >
                      <td>
                        <div className="flex items-center justify-center">
                          {displayData.photos &&
                          displayData.photos.length > 0 ? (
                            <img
                              src={
                                displayData.photos[0]?.s3Url ||
                                displayData.photos[0]?.fullUrl ||
                                "/placeholder-image.jpg"
                              }
                              alt={`Location ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-lg border border-base-300"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-base-300 rounded-lg flex items-center justify-center">
                              <MapPin size={16} className="text-neutral-500" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <input
                            id={`locationNameInput-${index}`}
                            type="text"
                            value={displayData.locationName || ""}
                            onChange={(e) =>
                              handleNameChange(index, e.target.value)
                            }
                            placeholder="Enter location name..."
                            className="input input-bordered input-sm w-full"
                          />
                          {displayData.isExistingPOI && (
                            <span className="badge badge-success badge-xs">
                              Existing POI
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="max-w-xs">
                          {displayData.description ? (
                            <div className="text-sm text-neutral-700 bg-base-100 border border-base-300 rounded-lg p-3 h-20 overflow-hidden">
                              <p className="line-clamp-3 text-xs leading-relaxed">
                                {displayData.description}
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-500 bg-base-100 border border-base-300 rounded-lg p-3 h-20 flex items-center justify-center">
                              <span className="text-xs">No description</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {displayData.date_visited ? (
                            new Date(
                              displayData.date_visited
                            ).toLocaleDateString()
                          ) : (
                            <span className="text-xs text-neutral-500">
                              Not set
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-neutral-600">
                          {displayData.lat && displayData.lng ? (
                            <div className="space-y-2 py-1">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-green-100 rounded">
                                  <MapPin
                                    size={10}
                                    className="text-green-600"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs text-neutral-500 font-medium">
                                    Latitude
                                  </span>
                                  <span className="font-mono text-xs text-neutral-700">
                                    {displayData.lat.toFixed(6)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-green-100 rounded">
                                  <MapPin
                                    size={10}
                                    className="text-green-600"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs text-neutral-500 font-medium">
                                    Longitude
                                  </span>
                                  <span className="font-mono text-xs text-neutral-700">
                                    {displayData.lng.toFixed(6)}
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
                        <div className="space-y-2">
                          {/* Show existing POI tags if available */}
                          {displayData.tags && displayData.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {displayData.tags.map((tag, tagIndex) => (
                                <span
                                  key={`existing-${index}-${tagIndex}`}
                                  className="badge badge-outline badge-xs"
                                >
                                  {typeof tag === "object" ? tag.name : tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-500">
                              No tags
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(index)}
                            className="btn btn-xs btn-error btn-soft"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save Map Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={!mapName || !mapName.trim()}
            >
              Save Map
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {safeCoordArray.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No POIs added to map yet. Search and add POIs from the section above.
        </div>
      )}
    </>
  );
}
