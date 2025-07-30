"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader, X, MapPin } from "lucide-react";
import { mapApi, tagApi, poiApi } from "@/lib/api";

// Removed nearby places search functionality

export default function NewMap({
  coordArray = [],
  setCoordArray = () => {},
  mapName = "",
}) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState({}); // Store tags for each coordinate
  const [newTagInputs, setNewTagInputs] = useState({}); // Store new tag inputs for each coordinate
  const [showNewTagInputs, setShowNewTagInputs] = useState({}); // Store which rows show new tag input

  // Add validation for coordArray
  const safeCoordArray = Array.isArray(coordArray) ? coordArray : [];

  // Fetch available tags
  const { data: availableTags = [], refetch: refetchTags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await tagApi.getAllTags();
      return response.data || [];
    },
  });

  // Removed useEffect for currentCoordIndex

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
      // Prepare coordArray with tags included
      const coordArrayWithTags = safeCoordArray.map((coord, index) => ({
        ...coord,
        tags: selectedTags[index] || [],
      }));

      // First, create the map
      const mapResponse = await mapApi.createMap({
        mapName: mapName.trim(),
        coordArray: coordArrayWithTags,
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
      setSelectedTags({});
      setNewTagInputs({});
      setShowNewTagInputs({});

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

    // Remove tags and inputs for this coordinate
    const newSelectedTags = { ...selectedTags };
    const newNewTagInputs = { ...newTagInputs };
    const newShowNewTagInputs = { ...showNewTagInputs };
    delete newSelectedTags[index];
    delete newNewTagInputs[index];
    delete newShowNewTagInputs[index];
    setSelectedTags(newSelectedTags);
    setNewTagInputs(newNewTagInputs);
    setShowNewTagInputs(newShowNewTagInputs);
  };

  // Removed handleAddPOI function - no longer needed

  const handleTagChange = (coordIndex, selectedOptions) => {
    setSelectedTags((prev) => ({
      ...prev,
      [coordIndex]: selectedOptions,
    }));
  };

  const handleCreateTag = async (coordIndex) => {
    const tagName = newTagInputs[coordIndex];
    if (!tagName || !tagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      await tagApi.createTag(tagName.trim());
      toast.success(`Tag "${tagName}" created successfully!`);

      // Add the new tag to the current coordinate
      const currentTags = selectedTags[coordIndex] || [];
      const newTags = [...currentTags, tagName.trim()];
      handleTagChange(coordIndex, newTags);

      // Clear the input for this specific coordinate
      setNewTagInputs((prev) => ({
        ...prev,
        [coordIndex]: "",
      }));
      setShowNewTagInputs((prev) => ({
        ...prev,
        [coordIndex]: false,
      }));
      refetchTags(); // Refresh the tags list
    } catch (error) {
      toast.error(error.message || "Failed to create tag");
    }
  };

  return (
    <>
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
                {safeCoordArray.map((coord, index) => (
                  <tr
                    key={`coord-${coord.lat}-${coord.lng}-${index}`}
                    className="hover:bg-base-200"
                  >
                    <td>
                      <div className="flex items-center justify-center">
                        {coord.image ? (
                          <img
                            src={coord.image}
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
                          type="text"
                          value={coord.locationName || ""}
                          onChange={(e) =>
                            handleNameChange(index, e.target.value)
                          }
                          placeholder="Enter location name..."
                          className="input input-bordered input-sm w-full"
                        />
                        {coord.isExistingPOI && (
                          <span className="badge badge-success badge-xs">
                            Existing POI
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="max-w-xs">
                        <textarea
                          id={`mapDescriptionInput-${index}`}
                          value={coord.description || ""}
                          onChange={(e) => {
                            safeSetCoordArray((prev) =>
                              prev.map((coord, i) =>
                                i === index
                                  ? { ...coord, description: e.target.value }
                                  : coord
                              )
                            );
                          }}
                          placeholder="Enter description..."
                          className="textarea textarea-bordered textarea-sm w-full h-20 resize-none"
                          aria-label={`Description for ${
                            coord.locationName || "location"
                          }`}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {coord.date_visited ? (
                          new Date(coord.date_visited).toLocaleDateString()
                        ) : (
                          <span className="text-xs text-neutral-500">
                            Not set
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-neutral-600">
                        {coord.lat && coord.lng ? (
                          <div className="space-y-2 py-1">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-green-100 rounded">
                                <MapPin size={10} className="text-green-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-neutral-500 font-medium">
                                  Latitude
                                </span>
                                <span className="font-mono text-xs text-neutral-700">
                                  {coord.lat.toFixed(6)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-green-100 rounded">
                                <MapPin size={10} className="text-green-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-neutral-500 font-medium">
                                  Longitude
                                </span>
                                <span className="font-mono text-xs text-neutral-700">
                                  {coord.lng.toFixed(6)}
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
                        {coord.tags && coord.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {coord.tags.map((tag, tagIndex) => (
                              <span
                                key={`existing-${index}-${tagIndex}`}
                                className="badge badge-outline badge-xs"
                              >
                                {typeof tag === "object" ? tag.name : tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Selected Tags as Badges */}
                        <div className="flex flex-wrap gap-1">
                          {(selectedTags[index] || []).map((tagName) => (
                            <span
                              key={`${index}-${tagName}`}
                              className="badge badge-primary badge-sm gap-1"
                            >
                              {tagName}
                              <button
                                onClick={() => {
                                  const currentTags = selectedTags[index] || [];
                                  const newTags = currentTags.filter(
                                    (t) => t !== tagName
                                  );
                                  handleTagChange(index, newTags);
                                }}
                                className="btn btn-ghost btn-xs p-0 h-auto min-h-0"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Tag Selection Dropdown */}
                        <div className="flex items-center gap-2">
                          <select
                            className="select select-xs select-bordered"
                            onChange={(e) => {
                              const selectedTag = e.target.value;
                              if (
                                selectedTag &&
                                selectedTag !== "Select tag..."
                              ) {
                                const currentTags = selectedTags[index] || [];
                                if (!currentTags.includes(selectedTag)) {
                                  const newTags = [...currentTags, selectedTag];
                                  handleTagChange(index, newTags);
                                }
                                e.target.value = "Select tag..."; // Reset dropdown
                              }
                            }}
                            defaultValue="Select tag..."
                          >
                            <option disabled>Select tag...</option>
                            {availableTags
                              .filter(
                                (tag) =>
                                  !(selectedTags[index] || []).includes(
                                    tag.name
                                  )
                              )
                              .map((tag) => (
                                <option key={tag._id} value={tag.name}>
                                  {tag.name}
                                </option>
                              ))}
                          </select>

                          {/* Create New Tag */}
                          {showNewTagInputs[index] ? (
                            <>
                              <input
                                type="text"
                                placeholder="New tag name"
                                value={newTagInputs[index] || ""}
                                onChange={(e) =>
                                  setNewTagInputs((prev) => ({
                                    ...prev,
                                    [index]: e.target.value,
                                  }))
                                }
                                className="input input-xs input-bordered"
                                onKeyPress={(e) =>
                                  e.key === "Enter" && handleCreateTag(index)
                                }
                              />
                              <button
                                onClick={() => handleCreateTag(index)}
                                className="btn btn-xs btn-primary"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  setShowNewTagInputs((prev) => ({
                                    ...prev,
                                    [index]: false,
                                  }));
                                  setNewTagInputs((prev) => ({
                                    ...prev,
                                    [index]: "",
                                  }));
                                }}
                                className="btn btn-xs btn-ghost"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                setShowNewTagInputs((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }))
                              }
                              className="btn btn-xs btn-outline"
                            >
                              + New Tag
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {coord.googleMapsLink && (
                          <a
                            href={coord.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-outline"
                            title="View on Google Maps"
                          >
                            🗺️
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(index)}
                          className="btn btn-xs btn-error btn-soft"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
