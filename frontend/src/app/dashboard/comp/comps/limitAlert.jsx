'use client'
import React, { useState } from "react";
import { Info, X } from "lucide-react";


const LimitAlert = () => {
  const [visible, setVisible] = useState(true);

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
            className="alert alert-info absolute top-12 md:top-2 left-1/2 transform -translate-x-1/2  w-full max-w-md shadow-lg mb-4 flex items-center justify-between px-4 py-2 "
        >
            <div className="flex items-center gap-2">
                <Info />
                <span>
                    Map limits: {mapsPerUserFree} maps, {poiPerMapFree} POIs per map
                    (Free)
                </span>
            </div>
            <button
            onClick={() => setVisible(false)}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
                <X size={18} />
            </button>
        </div>
        )}
    </>
  );
};

export default LimitAlert;
