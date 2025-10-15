import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { poiApi } from "@/lib/api";
import ModalPortal from "@/components/modalPortal";

const SubmitComponentPoiToMap = ({ poiArray, mapId, onBack, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);
  const [showUploadingPopup, setShowUploadingPopup] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    try {
      setShowUploadingPopup(true);
      setSubmitting(true);
      if (!mapId) throw new Error("Missing map ID");
      if (!poiArray || poiArray.length === 0)
        throw new Error("No POIs to submit");

      const results = [];
      for (let i = 0; i < poiArray.length; i++) {
        const poi = poiArray[i];
        try {
          // Create POI with map_id
          const poiData = {
            map_id: mapId,
            locationName: poi.name,
            description: poi.description || "",
            lat: poi.coordinates?.lat,
            lng: poi.coordinates?.lng,
            date_visited: poi.dateVisited,
            tags: poi.tags || [],
            googleMapsLink: poi.googleMapsLink || "",
            isPrivate: false,
          };
          const poiResponse = await poiApi.createPOI(poiData);
          const createdPOI = poiResponse.data;
          results.push(createdPOI);

          // Upload photos for this POI
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
                console.warn(
                  "Photo missing File object, skipping upload",
                  photo
                );
              }
            } catch (photoError) {
              console.error(
                "Error uploading photo for POI",
                createdPOI._id,
                photoError
              );
            }
          }
        } catch (poiError) {
          console.error("Error creating POI:", poi, poiError);
        }
      }

      toast.success(`Successfully added ${results.length} POI(s) to map!`);
      queryClient.invalidateQueries(["userMaps"]);
      queryClient.invalidateQueries(["userPOIs"]);
      queryClient.invalidateQueries(["maps"]);
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Submit POIs error:", error);
      toast.error(error?.message || "Failed to submit POIs. Please try again.");
    } finally {
      setSubmitting(false);
      setShowUploadingPopup(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 ">
      <h3 className="font-semibold mb-4">Review & Submit POIs to Map</h3>
      <div className="mb-6">
        <h4 className="font-semibold mb-2">POIs ({poiArray.length})</h4>
        <ul className="space-y-2">
          {poiArray.map((poi, idx) => (
            <li
              key={idx}
              className="flex border border-neutral p-2 rounded-lg bg-base-300"
            >
              <img
                src={
                  poi.primaryPhoto?.previewUrl ||
                  poi.photos?.[0]?.previewUrl ||
                  "/placeholder-image.png"
                }
                alt={`Photo ${idx + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1 ml-2">
                <div className="font-medium">{poi.name}</div>
                <div className="text-xs text-neutral-500">
                  {poi.photos?.length || 0} photo(s), Tags:{" "}
                  {poi.tags?.join(", ")}
                </div>
                <div className="text-sm text-neutral-600">
                  {poi.description}
                </div>
              </div>
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
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit POIs"}
        </button>
      </div>
      {/* Uploading popup/modal */}
      {showUploadingPopup && (
        <ModalPortal>
          <div className="absolute modal modal-open z-50 flex items-center justify-center bg-black/50 w-screen h-screen">
            <div className="flex flex-col justify-center items-center modal-box w-96 h-96 max-w-2xl text-center border border-neutral-400">
              <h4 className="font-semibold mb-4">Uploading POIs & Photos</h4>
              <p className="text-sm text-neutral-400 mb-4">
                Uploading may take a few moments depending on your connection
                and the number of photos.
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
};

export default SubmitComponentPoiToMap;
