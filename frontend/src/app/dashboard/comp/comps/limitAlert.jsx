"use client";
import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { toast } from "react-hot-toast";

// module-level id so we can dismiss previous toast instances
let limitToastId = null;

const LimitAlert = () => {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Read limits from environment (defaults fallback)
  const mapsPerUserFree =
    parseInt(process.env.NEXT_PUBLIC_MAPS_PER_USER_FREE) || 5;
  const poiPerMapFree =
    parseInt(process.env.NEXT_PUBLIC_POI_PER_MAP_FREE) || 25;
  const photosPerPOIFree =
    parseInt(process.env.NEXT_PUBLIC_PHOTOS_PER_POI_FREE) || 3;
  const photosPerPOIPremium =
    parseInt(process.env.NEXT_PUBLIC_PHOTOS_PER_POI_PREMIUM) || 10;
  const mapsPerUserPremium =
    parseInt(process.env.NEXT_PUBLIC_MAPS_PER_USER_PREMIUM) || 20;
  const poiPerMapPremium =
    parseInt(process.env.NEXT_PUBLIC_POI_PER_MAP_PREMIUM) || 100;

  const toastFunction = () => {
    // Dismiss any previous toast so only one instance is visible
    if (limitToastId) {
      try {
        toast.dismiss(limitToastId);
      } catch (e) {}
      limitToastId = null;
    }

    limitToastId = toast(
      (t) => (
        <div className="alert alert-info shadow-lg max-w-xl w-full min-w-60">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5" />
            <div className="flex flex-col">
              <span className="font-medium">Map limits: (Free)</span>
              <ul className="text-sm mt-1">
                <li>{mapsPerUserFree} maps</li>
                <li>{poiPerMapFree} POIs per map</li>
                <li>{photosPerPOIFree} photos per POI</li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            aria-label="Dismiss"
            className="absolute top-2 right-5 btn btn-ghost btn-circle btn-sm"
          >
            ✕
          </button>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: { background: "transparent", border: "none", boxShadow: "none", padding: 0 },
      }
    );
  };

  useEffect(() => {
    // trigger entrance animation on mount
    const t = setTimeout(() => setMounted(true), 10);
    toastFunction();
    return () => clearTimeout(t);
  }, []);
};

export default LimitAlert;
