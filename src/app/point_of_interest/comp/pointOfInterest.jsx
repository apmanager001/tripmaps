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

const PointOfInterest = ({ poiName }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ["poiMaps", poiName, currentPage],
    queryFn: () => poiApi.searchMapsByPOIName(poiName, currentPage, limit),
    enabled: !!poiName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
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
  const decodedPoiName = decodeURIComponent(poiName);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Maps with ${decodedPoiName}`,
            description: `Discover all maps featuring ${decodedPoiName}. Explore travel itineraries, locations, and experiences shared by the TripMaps community.`,
            url: `${
              window.location.origin
            }/point_of_interest/${encodeURIComponent(poiName)}`,
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
              Maps with "{decodedPoiName}"
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover travel itineraries and experiences featuring{" "}
            {decodedPoiName} shared by the TripMaps community.
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
            {pagination.total > 1 ? "s" : ""} featuring {decodedPoiName}
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
              No maps have been created featuring {decodedPoiName} yet.
            </p>
            <Link href="/dashboard" className="btn btn-primary">
              Create the First Map
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {maps.map((mapData) => {
              const map = mapData.map;
              const pois = mapData.pois;

              return (
                <div
                  key={map._id}
                  className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="card-body">
                    {/* Map Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="card-title text-lg font-bold text-primary mb-1">
                          {map.mapName || "Unnamed Map"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={16} />
                          <Link
                            href={`/profile/${map.user_id?.username}`}
                            className="hover:text-primary hover:underline"
                          >
                            {map.user_id?.username || "Unknown User"}
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {map.isPrivate && (
                          <span className="badge badge-warning badge-sm">
                            Private
                          </span>
                        )}
                      </div>
                    </div>

                    {/* POI Count */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span>
                          {mapData.totalPOIs} location
                          {mapData.totalPOIs > 1 ? "s" : ""} on this map
                        </span>
                      </div>
                    </div>

                    {/* Featured POIs */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">
                        Featured Locations:
                      </h4>
                      <div className="space-y-1">
                        {pois.slice(0, 3).map((poi, index) => (
                          <div
                            key={poi._id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="truncate">
                              {poi.locationName || "Unnamed Location"}
                            </span>
                          </div>
                        ))}
                        {pois.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{pois.length - 3} more locations
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Map Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(map.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="card-actions justify-end">
                      <Link
                        href={`/maps/${map._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Map
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
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
