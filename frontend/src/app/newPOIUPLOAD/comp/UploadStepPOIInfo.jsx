// UploadStepPOIInfo.jsx
"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function UploadStepPOIInfo({
  poiArray,
  setPoiArray,
  onBack,
  onNext,
}) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [edit, setEdit] = useState({ name: "", description: "", tags: "" });

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setEdit({
      name: poiArray[idx].name,
      description: poiArray[idx].description,
      tags: poiArray[idx].tags.join(", "),
    });
  };

  const handleSave = (idx) => {
    const tagsArr = edit.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setPoiArray((prev) =>
      prev.map((poi, i) =>
        i === idx
          ? {
              ...poi,
              name: edit.name,
              description: edit.description,
              tags: tagsArr,
            }
          : poi
      )
    );
    setEditingIdx(null);
    toast.success("POI updated");
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <h3 className="font-semibold mb-4">Edit POI Info</h3>
      <div className="space-y-4 mb-6">
        {poiArray.map((poi, idx) => (
          <div key={idx} className="border p-3 rounded-lg">
            {editingIdx === idx ? (
              <>
                <input
                  type="text"
                  className="input input-bordered w-full mb-2"
                  value={edit.name}
                  onChange={(e) =>
                    setEdit((edit) => ({ ...edit, name: e.target.value }))
                  }
                  placeholder="POI Name"
                />
                <textarea
                  className="textarea textarea-bordered w-full mb-2"
                  value={edit.description}
                  onChange={(e) =>
                    setEdit((edit) => ({
                      ...edit,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description"
                  rows={2}
                />
                <input
                  type="text"
                  className="input input-bordered w-full mb-2"
                  value={edit.tags}
                  onChange={(e) =>
                    setEdit((edit) => ({ ...edit, tags: e.target.value }))
                  }
                  placeholder="Tags (comma separated)"
                />
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSave(idx)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setEditingIdx(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="font-medium mb-1">{poi.name}</div>
                <div className="text-sm text-neutral-600 mb-1">
                  {poi.description}
                </div>
                <div className="text-xs text-neutral-500 mb-1">
                  Tags: {poi.tags.join(", ")}
                </div>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => handleEdit(idx)}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button className="btn btn-outline" onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Next: Name Map
        </button>
      </div>
    </div>
  );
}
