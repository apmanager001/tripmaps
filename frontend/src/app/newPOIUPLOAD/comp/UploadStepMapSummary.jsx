// UploadStepMapSummary.jsx
"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function UploadStepMapSummary({
  poiArray,
  mapName,
  setMapName,
  onBack,
  onSubmit,
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!mapName.trim()) {
      toast.error("Please enter a map name");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };
console.log(poiArray);
  return (
    <div className="w-full max-w-xl mx-auto">
      <h3 className="font-semibold mb-4">Review & Name Your Map</h3>
      <input
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
            <li key={idx} className="border border-neutral p-2 rounded-lg bg-base-300">
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
    </div>
  );
}
