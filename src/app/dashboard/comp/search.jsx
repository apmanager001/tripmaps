"use client";
import React, { useState } from "react";
import { Search, MapPin, User, MapPinned } from "lucide-react";
import Link from "next/link";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("maps"); // "maps" or "profiles"
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Replace with actual API call based on searchType
      const endpoint = searchType === "maps" ? "/maps/search" : "/users/search";
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}${endpoint}?q=${encodeURIComponent(
          query
        )}`
      ).then((res) => res.json());
      setResults(data.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <main className="bg-base-200 h-full w-full p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary text-center">
          Search Maps & Profiles
        </h1>

        {/* Search Type Selector */}
        <div className="flex justify-center mb-6">
          <div className="join">
            <button
              className={`join-item btn ${
                searchType === "maps" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setSearchType("maps")}
            >
              <MapPinned className="w-4 h-4 mr-2" />
              Maps
            </button>
            <button
              className={`join-item btn ${
                searchType === "profiles" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setSearchType("profiles")}
            >
              <User className="w-4 h-4 mr-2" />
              Profiles
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="max-w-xl mx-auto mb-8 flex gap-4">
          <input
            type="text"
            placeholder={`Search ${searchType}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input input-bordered w-full"
          />
          <button
            onClick={handleSearch}
            className="btn btn-primary"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-600 mb-4">
              {searchType === "maps" ? "Maps" : "Profiles"} ({results.length})
            </h2>

            {searchType === "maps" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((map) => (
                  <Link
                    key={map._id}
                    href={`/maps/${map._id}`}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <div className="card-body">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="card-title text-lg">{map.mapName}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>👤 {map.user_id?.username || "Unknown"}</span>
                        <span>❤️ {map.likes || 0}</span>
                        <span>👁️ {map.views || 0}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Created: {new Date(map.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((profile) => (
                  <Link
                    key={profile._id}
                    href={`/profile/${profile.username}`}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <div className="card-body">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-primary" />
                        <h3 className="card-title text-lg">
                          {profile.username}
                        </h3>
                      </div>
                      {profile.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {profile.bio}
                        </p>
                      )}
                      <div className="text-xs text-gray-400">
                        Member since:{" "}
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* No Results */}
        {query && !isLoading && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No {searchType} found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or search for something else.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!query && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Start exploring
            </h3>
            <p className="text-gray-500">
              Search for maps or profiles to discover amazing travel
              destinations and fellow travelers.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchPage;
