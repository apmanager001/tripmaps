// UploadStepMapSummary.jsx
"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapApi, poiApi } from "@/lib/api";
import ModalPortal from "@/components/modalPortal";

export default function UploadStepMapSummary({
  poiArray,
  mapName,
  setMapName,
  onBack,
  onSubmit,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [showUploadingPopup, setShowUploadingPopup] = useState(false);

  const queryClient = useQueryClient();

  const createMapMutation = useMutation({
    mutationFn: async () => {
      if (!mapName.trim()) {
        throw new Error("Please enter a map name");
      }
      if (!poiArray || poiArray.length === 0) {
        throw new Error("No POIs to save");
      }

      // Create map first
      const mapData = {
        mapName: mapName.trim(),
        coordArray: poiArray.map((poi) => ({
          lat: poi.coordinates?.lat,
          lng: poi.coordinates?.lng,
          locationName: poi.name,
          description: poi.description || "",
          date_visited: poi.dateVisited,
          tags: poi.tags || [],
          googleMapsLink: "",
          isPrivate: false,
        })),
        isPrivate: false,
      };

      const mapResponse = await mapApi.createMap(mapData);
      const createdMap = mapResponse.data;

      const results = [];

      // The backend createMap already creates POIs from coordArray to avoid duplication
      // fetch POIs for this map and upload photos to the created POIs
      const poisResponse = await poiApi.getPOIsByMap(createdMap._id);
      const createdPOIs = poisResponse.data || [];

      // Helper: fuzzy compare coordinates
      const coordsMatch = (a, b, tol = 1e-5) => {
        if (!a || !b) return false;
        return (
          Math.abs((a.lat || 0) - (b.lat || 0)) <= tol &&
          Math.abs((a.lng || 0) - (b.lng || 0)) <= tol
        );
      };

      for (let i = 0; i < poiArray.length; i++) {
        const poi = poiArray[i];

        // Attempt to find matching created POI by index first
        let createdPOI = createdPOIs[i];

        // Fallback: try to match by coordinates
        if (!createdPOI) {
          createdPOI = createdPOIs.find((p) =>
            coordsMatch(p, {
              lat: poi.coordinates?.lat,
              lng: poi.coordinates?.lng,
            })
          );
        }

        if (!createdPOI) {
          console.warn(
            "No matching created POI found for upload, skipping photos for:",
            poi
          );
          continue;
        }

        results.push(createdPOI);

        // Upload photos for this created POI
        for (const photo of poi.photos || []) {
          try {
            const isPrimary =
              poi.primaryPhoto &&
              photo.previewUrl === poi.primaryPhoto.previewUrl;

            if (photo.file) {
              await poiApi.uploadPhoto(
                createdPOI._id,
                photo.file,
                null,
                !!isPrimary,
                photo.dateVisited
              );
            } else {
              console.warn("Photo missing File object, skipping upload", photo);
            }
          } catch (photoError) {
            console.error(
              "Error uploading photo for POI",
              createdPOI._id,
              photoError
            );
          }
        }
      }

      return { createdMap, results };
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully created map "${mapName}" with ${data.results.length} POI(s)!`
      );
      // Invalidate relevant queries
      queryClient.invalidateQueries(["userMaps"]);
      queryClient.invalidateQueries(["userPOIs"]);
      queryClient.invalidateQueries(["maps"]);
      // Call parent's onSubmit to reset wizard if provided
      if (onSubmit) onSubmit();
    },
    onError: (error) => {
      console.error("Create map error:", error);
      toast.error(error?.message || "Failed to save map. Please try again.");
    },
  });

  const handleSubmit = async () => {
    try {
      // Show a popup since multiple photos can take time to upload
      setShowUploadingPopup(true);
      setSubmitting(true);

      await createMapMutation.mutateAsync();
    } catch (e) {
      // error handled in onError
    } finally {
      setSubmitting(false);
      setShowUploadingPopup(false);
    }
  };
  console.log(poiArray);
  return (
    <div className="w-full max-w-xl mx-auto px-4 ">
      <h3 className="font-semibold mb-4">Review & Name Your Map</h3>
      <input
        id='map-name-input'
        type="text"
        className="input input-bordered w-full mb-4"
        placeholder="Map Name"
        value={mapName}
        onChange={(e) => setMapName(e.target.value)}
      />
      <div className="mb-6">
        <h4 className="font-semibold mb-2">POIs ({poiArray.length})</h4>
        <ul className="space-y-2">
          {poiArray.map((poi, idx) => (
            <li
              key={idx}
              className="border border-neutral p-2 rounded-lg bg-base-300"
            >
              <div className="font-medium">{poi.name}</div>
              <div className="text-xs text-neutral-500">
                {poi.photos.length} photo(s), Tags: {poi.tags.join(", ")}
              </div>
              <div className="text-sm text-neutral-600">{poi.description}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between">
        <button className="btn btn-outline" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting || !mapName.trim()}
        >
          {submitting ? "Saving..." : "Save Map"}
        </button>
      </div>
      {/* Uploading popup/modal */}
      {showUploadingPopup && (
        <ModalPortal>
          <div className="absolute modal modal-open z-50 flex items-center justify-center bg-black/50 w-screen h-screen">
            <div className="flex flex-col justify-center items-center modal-box w-96 h-96 max-w-2xl text-center border border-neutral-400">
              <h4 className="font-semibold mb-4">Uploading photos</h4>
              <p className="text-sm text-neutral-400 mb-4">
                Uploading may take a few moments depending on your connection and
                the number of photos.
              </p>
              <div className="flex items-center justify-center">
                <progress className="progress w-56"></progress>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
