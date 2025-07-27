"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader, X } from "lucide-react";
import { mapApi, tagApi, poiApi } from "@/lib/api";

const POImap = async ({ queryKey }) => {
  const [_, coord] = queryKey;
  const lat = coord.lat.toFixed(4);
  const lng = coord.lng.toFixed(4);

  const res = await fetch(
    `https://trueway-places.p.rapidapi.com/FindPlacesNearby?location=${lat},${lng}&radius=60&language=en`,
    {
      headers: {
        "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPID_KEY,
        "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPID_HOST,
      },
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch POIs");
  return data.results;
};

export default function NewMap({ coordArray = [], setCoordArray = () => {} }) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [mapName, setMapName] = useState("");
  const [currentCoordIndex, setCurrentCoordIndex] = useState(null);
  const [selectedTags, setSelectedTags] = useState({}); // Store tags for each coordinate
  const [newTagInputs, setNewTagInputs] = useState({}); // Store new tag inputs for each coordinate
  const [showNewTagInputs, setShowNewTagInputs] = useState({}); // Store which rows show new tag input

  // Add validation for coordArray
  const safeCoordArray = Array.isArray(coordArray) ? coordArray : [];
  const currentCoord = safeCoordArray[currentCoordIndex] || null;

  const { data: pois = [], isLoading } = useQuery({
    queryKey: [
      "nearbyPOIs",
      currentCoord ? { lat: currentCoord.lat, lng: currentCoord.lng } : null,
    ],
    queryFn: POImap,
    enabled: !!currentCoord,
  });

  // Fetch available tags
  const { data: availableTags = [], refetch: refetchTags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await tagApi.getAllTags();
      return response.data || [];
    },
  });

  useEffect(() => {
    if (safeCoordArray.length > 0) {
      setCurrentCoordIndex(safeCoordArray.length - 1);
    } else {
      setCurrentCoordIndex(null);
    }
  }, [safeCoordArray]);

  // Add safe wrapper for setCoordArray calls
  const safeSetCoordArray = (updater) => {
    if (typeof setCoordArray === "function") {
      setCoordArray(updater);
    } else {
      console.error("setCoordArray is not a function");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setMapName("");
      setSelectedTags({});
      setNewTagInputs({});
      setShowNewTagInputs({});
      setCurrentCoordIndex(null);

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

    // Adjust currentCoordIndex after deletion
    if (currentCoordIndex === index) {
      if (safeCoordArray.length > 1) {
        setCurrentCoordIndex(index > 0 ? index - 1 : 0);
      } else {
        setCurrentCoordIndex(null);
      }
    } else if (currentCoordIndex > index) {
      setCurrentCoordIndex(currentCoordIndex - 1);
    }
  };

  const handleAddPOI = (poiName) => {
    if (currentCoordIndex === null) return;

    safeSetCoordArray((prev) => {
      const updatedArray = [...prev];
      updatedArray[currentCoordIndex] = {
        ...updatedArray[currentCoordIndex],
        locationName: poiName,
      };
      return updatedArray;
    });
  };

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
      {/* Suggested POIs */}
      {currentCoordIndex !== null && pois.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Nearby places</h2>
          <div className="grid grid-cols-2 gap-2">
            {pois.slice(0, 8).map((poi, index) => (
              <div
                key={`${poi.name}-${index}`}
                className="flex items-center justify-between bg-base-200 p-2 rounded hover:bg-base-300 transition-colors"
              >
                <div className="tooltip" data-tip={poi.name}>
                  {poi.website ? (
                    <a
                      href={poi.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate w-40 block text-sm text-blue-600 hover:underline"
                    >
                      {poi.name}
                    </a>
                  ) : (
                    <span className="truncate max-w-40 block text-sm text-gray-700">
                      {poi.name}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddPOI(poi.name)}
                  className="btn btn-xs btn-soft btn-info ml-3 shrink-0"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Table */}
      {safeCoordArray.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Map Builder</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Name</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeCoordArray.map((coord, index) => (
                  <tr
                    key={`coord-${coord.lat}-${coord.lng}-${index}`}
                    className={currentCoordIndex === index ? "bg-base-300" : ""}
                  >
                    <td>{coord.lat?.toFixed(4) || "N/A"}</td>
                    <td>{coord.lng?.toFixed(4) || "N/A"}</td>
                    <td>
                      <input
                        type="text"
                        placeholder="Location name"
                        value={coord.locationName || ""}
                        onChange={(e) =>
                          handleNameChange(index, e.target.value)
                        }
                        className="input input-sm input-bordered w-full"
                      />
                    </td>
                    <td>
                      <div className="space-y-2">
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
                      <button
                        onClick={() => handleDelete(index)}
                        className="btn btn-xs btn-error btn-soft"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save Map Form */}
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Map name"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              required
              className="input input-bordered flex-1"
            />
            <button type="submit" className="btn btn-primary">
              Save Map
            </button>
          </form>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-sm text-neutral-400 flex items-center gap-1 mt-4">
          <Loader className="animate-spin w-4 h-4" /> Looking up nearby
          places...
        </div>
      )}

      {/* Empty State */}
      {safeCoordArray.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No coordinates added yet
        </div>
      )}
    </>
  );
}
