"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { mapApi } from "@/lib/api";

export default function PrivateToggle({ isPrivate, id, onToggle }) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);

    try {
      const result = await mapApi.togglePrivacy(id);

      if (result.success) {
        toast.success(isPrivate ? "Map is now public" : "Map is now private");
        // Call the onToggle callback if provided to update the UI
        if (onToggle) {
          onToggle();
        }
      } else {
        toast.error(result.message || "Failed to update map privacy");
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Failed to update map privacy");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isPrivate}
        onChange={handleToggle}
        disabled={isToggling}
        className="toggle toggle-primary"
      />
      {isToggling && <div className="loading loading-spinner loading-xs"></div>}
      <span className="text-xs text-gray-600">
        {isPrivate ? "Private" : "Public"}
      </span>
    </div>
  );
}
