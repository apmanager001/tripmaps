"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2 } from "lucide-react";
import { mapApi } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function EditMapName({
  isOpen,
  onClose,
  mapId,
  currentName,
  onSuccess,
}) {
  const [mapName, setMapName] = useState(currentName || "");
  const queryClient = useQueryClient();

  const updateMapMutation = useMutation({
    mutationFn: (data) => mapApi.updateMap(mapId, data),
    onSuccess: () => {
      toast.success("Map name updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update map name");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mapName.trim()) {
      toast.error("Map name cannot be empty");
      return;
    }
    updateMapMutation.mutate({ mapName: mapName.trim() });
  };

  const handleClose = () => {
    setMapName(currentName || "");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h3 className="text-lg font-semibold text-base-content">
            Edit Map Name
          </h3>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="mapName"
              className="block text-sm font-medium text-base-content mb-2"
            >
              Map Name
            </label>
            <input
              type="text"
              id="mapName"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="input input-bordered w-full focus:input-primary"
              placeholder="Enter map name..."
              autoFocus
              disabled={updateMapMutation.isPending}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline btn-sm"
              disabled={updateMapMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={updateMapMutation.isPending || !mapName.trim()}
            >
              {updateMapMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
