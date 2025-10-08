"use client";
import React, { useState, useEffect } from "react";
import { Info, X } from "lucide-react";

const LimitAlert = () => {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // trigger entrance animation on mount
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

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
  return (
    <>
      {visible && (
        <div
          role="alert"
          className={`alert alert-info absolute top-12 md:top-2 left-1/2 transform -translate-x-1/2 w-72 md:w-full max-w-md shadow-lg mb-4 flex items-center justify-between px-4 py-2 transition-all duration-300 ${
            mounted ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
          }`}
        >
          <div className="flex items-center gap-2">
            <Info />
            <div className="flex flex-col">
              <span className="font-medium">Map limits: (Free)</span>
              <ul>
                <li>{mapsPerUserFree} maps</li>
                <li>{poiPerMapFree} POIs per map </li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => {
              // trigger exit animation, then hide
              setMounted(false);
              setTimeout(() => setVisible(false), 300);
            }}
            className="btn btn-circle btn-ghost cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
};

export default LimitAlert;
