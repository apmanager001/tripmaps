"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Filter,
  Grid3x3,
  List,
  Loader2,
  TrendingUp,
  Globe,
  Calendar,
  Users,
} from "lucide-react";
import { mapApi } from "@/lib/api";
import MapCard from "@/components/MapCard";
import { toast } from "react-hot-toast";

export default function ExploreMapsBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular"); // "popular", "recent", "views"
  const [viewMode, setViewMode] = useState("grid"); // "grid", "list"
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch maps based on search and sort criteria
  const {
    data: mapsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["exploreMaps", debouncedQuery, sortBy, page],
    queryFn: async () => {
      if (debouncedQuery.trim()) {
        // Search for maps
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND
          }/maps/search?q=${encodeURIComponent(
            debouncedQuery
          )}&page=${page}&limit=12&sort=${sortBy}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to search maps");
        }

        return await response.json();
      } else {
        // Get popular/recent maps
        const endpoint =
          sortBy === "popular" ? "/maps/popular" : "/maps/search";
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          sort: sortBy,
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}${endpoint}?${queryParams}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch maps");
        }

        return await response.json();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const maps = mapsData?.data?.maps || mapsData?.data || [];
  const totalPages = mapsData?.data?.pagination?.totalPages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect will handle the debounced search
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top of results
    document.getElementById("maps-results")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  if (error) {
    toast.error("Failed to load maps. Please try again.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Canonical URL for SEO */}
      <link
        rel="canonical"
        href={`${
          process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
        }/maps`}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
            <Globe className="w-8 h-8" />
            Explore Travel Maps
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing travel maps created by our community. Get inspired
            by other travelers and find your next adventure.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search maps by name, location, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-10 pr-4"
                />
              </div>
            </form>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <div className="join">
                <button
                  onClick={() => handleSortChange("popular")}
                  className={`join-item btn btn-sm ${
                    sortBy === "popular" ? "btn-primary" : "btn-outline"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Popular
                </button>
                <button
                  onClick={() => handleSortChange("recent")}
                  className={`join-item btn btn-sm ${
                    sortBy === "recent" ? "btn-primary" : "btn-outline"
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Recent
                </button>
                <button
                  onClick={() => handleSortChange("views")}
                  className={`join-item btn btn-sm ${
                    sortBy === "views" ? "btn-primary" : "btn-outline"
                  }`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Most Viewed
                </button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="join">
              <button
                onClick={() => setViewMode("grid")}
                className={`join-item btn btn-sm ${
                  viewMode === "grid" ? "btn-primary" : "btn-outline"
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`join-item btn btn-sm ${
                  viewMode === "list" ? "btn-primary" : "btn-outline"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div id="maps-results">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {isLoading ? (
                  "Loading maps..."
                ) : (
                  <>
                    {maps.length} map{maps.length !== 1 ? "s" : ""} found
                    {debouncedQuery && (
                      <span className="text-gray-500">
                        {" "}
                        for "{debouncedQuery}"
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading amazing maps...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && maps.length === 0 && (
            <div className="text-center py-12 bg-base-100 rounded-2xl shadow-lg">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {debouncedQuery ? "No maps found" : "No maps available"}
              </h3>
              <p className="text-gray-500 mb-6">
                {debouncedQuery
                  ? "Try different search terms or explore popular maps."
                  : "Be the first to create and share a travel map!"}
              </p>
              {debouncedQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                  }}
                  className="btn btn-primary"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Maps Grid/List */}
          {!isLoading && maps.length > 0 && (
            <>
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {maps.map((map) => (
                  <MapCard
                    key={map._id}
                    map={map}
                    showActions={true}
                    className={viewMode === "list" ? "flex-row" : ""}
                    compact={viewMode === "list"}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="join">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="join-item btn btn-outline"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, page - 2) + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`join-item btn ${
                            pageNum === page ? "btn-primary" : "btn-outline"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      className="join-item btn btn-outline"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Call to Action */}
        {!isLoading && (
          <div className="text-center mt-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-primary mb-4">
              Share Your Travel Story
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Have amazing travel photos? Create your own interactive map and
              share your adventures with the community!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="btn btn-primary btn-lg">
                Join My Trip Maps
              </a>
              <a href="/guide" className="btn btn-outline btn-lg">
                Learn How It Works
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
