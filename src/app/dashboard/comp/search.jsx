"use client";
import React, { useState } from "react";
import { Search, MapPin, User, MapPinned, Navigation } from "lucide-react";
import Link from "next/link";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("maps"); // "maps", "profiles", or "pois"
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      let endpoint;
      switch (searchType) {
        case "maps":
          endpoint = "/maps/search";
          break;
        case "profiles":
          endpoint = "/users/search";
          break;
        case "pois":
          endpoint = "/pois/search/name";
          break;
        default:
          endpoint = "/maps/search";
      }

      const data = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}${endpoint}?q=${encodeURIComponent(
          query
        )}`
      ).then((res) => res.json());

      // Handle different response structures
      if (searchType === "pois") {
        setResults(data.data?.pois || []);
      } else {
        setResults(data.data || []);
      }
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

  const getSearchTypeIcon = () => {
    switch (searchType) {
      case "maps":
        return <MapPinned className="w-4 h-4 mr-2" />;
      case "profiles":
        return <User className="w-4 h-4 mr-2" />;
      case "pois":
        return <Navigation className="w-4 h-4 mr-2" />;
      default:
        return <Search className="w-4 h-4 mr-2" />;
    }
  };

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case "maps":
        return "Maps";
      case "profiles":
        return "Profiles";
      case "pois":
        return "POIs";
      default:
        return "All";
    }
  };

  return (
    <main className="bg-base-200 h-full w-full p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary text-center">
          Search Maps, Profiles & POIs
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
            <button
              className={`join-item btn ${
                searchType === "pois" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setSearchType("pois")}
            >
              <Navigation className="w-4 h-4 mr-2" />
              POIs
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="max-w-xl mx-auto mb-8 flex gap-4">
          <input
            type="text"
            placeholder={`Search ${getSearchTypeLabel()}...`}
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
              {getSearchTypeLabel()} ({results.length})
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
            ) : searchType === "profiles" ? (
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
            ) : (
              // POI Results
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((poi) => (
                  <Link
                    key={poi._id}
                    href={`/point_of_interest/${poi._id}`}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <div className="card-body">
                      <div className="flex items-center gap-2 mb-2">
                        <Navigation className="w-5 h-5 text-primary" />
                        <h3 className="card-title text-lg">
                          {poi.locationName}
                        </h3>
                      </div>
                      {poi.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {poi.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>👤 {poi.user_id?.username || "Unknown"}</span>
                        <span>❤️ {poi.likes || 0}</span>
                      </div>
                      {poi.tags && poi.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {poi.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="badge badge-outline badge-sm"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {poi.tags.length > 3 && (
                            <span className="badge badge-outline badge-sm">
                              +{poi.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {poi.date_visited && (
                          <span>
                            Visited:{" "}
                            {new Date(poi.date_visited).toLocaleDateString()}
                          </span>
                        )}
                        {poi.map_id && (
                          <span className="ml-2">
                            • Map: {poi.map_id.mapName}
                          </span>
                        )}
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
              No {getSearchTypeLabel()} found
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
              Search for maps, profiles, or POIs to discover amazing travel
              destinations and fellow travelers.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchPage;
