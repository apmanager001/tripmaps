"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { poiApi } from "@/lib/api";
import {
  MapPin,
  User,
  Calendar,
  Heart,
  MessageCircle,
  Bookmark,
  Search,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import MapCard from "@/components/MapCard";

// Component to fetch full POI data for a map
const MapWithFullPOIs = ({ mapData }) => {
  const map = mapData.map;
  const pois = mapData.pois;

  // Fetch full POI data for each POI in the map
  const { data: fullPOIsData, isLoading: poisLoading } = useQuery({
    queryKey: ["fullPOIs", pois.map((p) => p._id)],
    queryFn: async () => {
      const fullPOIs = await Promise.all(
        pois.map(async (poi) => {
          try {
            const response = await poiApi.getPOI(poi._id);
            return response.data?.poi || response.poi || response;
          } catch (error) {
            console.error(`Error fetching POI ${poi._id}:`, error);
            return poi; // Return original POI if fetch fails
          }
        })
      );
      return fullPOIs;
    },
    enabled: pois && pois.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (poisLoading) {
    return (
      <div className="card bg-base-200 shadow-lg h-full">
        <div className="card-body">
          <div className="loading loading-spinner loading-md"></div>
        </div>
      </div>
    );
  }

  // Use full POI data if available, otherwise fall back to original POIs
  const enhancedPOIs = fullPOIsData || pois;

  // Transform the map data to include full POIs for MapCard
  const mapWithPOIs = {
    ...map,
    pois: enhancedPOIs,
    poi_ids: enhancedPOIs,
  };

  return (
    <MapCard
      key={map._id}
      map={mapWithPOIs}
      showActions={true}
      className="h-full"
    />
  );
};

const PointOfInterest = ({ poiId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Fetch POI details
  const {
    data: poiData,
    isLoading: poiLoading,
    error: poiError,
  } = useQuery({
    queryKey: ["poi", poiId],
    queryFn: () => poiApi.getPOI(poiId),
    enabled: !!poiId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch maps containing this POI
  const { data, isLoading, error } = useQuery({
    queryKey: ["poiMaps", poiId, currentPage],
    queryFn: () => {
      const poi = poiData?.data?.poi || poiData?.poi || poiData;
      const poiName = poi?.locationName;
      if (!poiName) {
        throw new Error("POI name not available");
      }
      return poiApi.searchMapsByPOIName(poiName, currentPage, limit);
    },
    enabled: !!poiId && !!poiData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (poiLoading || isLoading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (poiError) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
            <span>Error loading POI: {poiError.message}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
            <span>Error loading maps: {error.message}</span>
          </div>
        </div>
      </div>
    );
  }

  const { maps = [], pagination = {} } = data?.data || {};
  const poi = poiData?.data?.poi || poiData?.poi || poiData;
  const poiName = poi?.locationName || "Unknown Location";

  return (
    <div className="min-h-screen bg-base-100">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Maps with ${poiName}`,
            description: `Discover all maps featuring ${poiName}. Explore travel itineraries, locations, and experiences shared by the TripMaps community.`,
            url: `${window.location.origin}/point_of_interest/${poiId}`,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: pagination.total || 0,
              itemListElement: maps.slice(0, 10).map((mapData, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "CreativeWork",
                  name: mapData.map.mapName || "Unnamed Map",
                  author: {
                    "@type": "Person",
                    name: mapData.map.user_id?.username || "Unknown User",
                  },
                  url: `${window.location.origin}/maps/${mapData.map._id}`,
                },
              })),
            },
          }),
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="text-primary" size={32} />
            <h1 className="text-4xl font-bold text-primary">
              Maps with "{poiName}"
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover travel itineraries and experiences featuring {poiName}{" "}
            shared by the TripMaps community.
          </p>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found{" "}
            <span className="font-semibold text-primary">
              {pagination.total || 0}
            </span>{" "}
            maps
            {pagination.total > 1 ? "s" : ""} featuring {poiName}
          </p>
        </div>

        {/* Maps Grid */}
        {maps.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto mb-4 text-gray-400" size={64} />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              No maps found
            </h2>
            <p className="text-gray-500 mb-6">
              No maps have been created featuring {poiName} yet.
            </p>
            <Link href="/dashboard" className="btn btn-primary">
              Create the First Map
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {maps.map((mapData) => (
              <MapWithFullPOIs key={mapData.map._id} mapData={mapData} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center">
            <div className="join">
              <button
                className="join-item btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                «
              </button>

              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    className={`join-item btn ${
                      currentPage === page ? "btn-active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                className="join-item btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointOfInterest;
