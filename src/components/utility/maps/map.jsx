"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Navigation } from "lucide-react";

const Map = ({
  coordArray,
  setCoordArray,
  onMapClick,
  onMarkerClick,
  height = "500px",
  showSearch = true,
  showNavigation = true,
  className = "",
}) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google || !mapRef.current) {
      console.warn("Google Maps API not loaded. Please check your API key configuration.");
      return;
    }

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
      zoom: 10,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    setMap(newMap);
    setIsMapLoading(false);

    // Add click listener to map
    newMap.addListener("click", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      if (onMapClick) {
        onMapClick(lat, lng);
      } else {
        // Default behavior: add to coordArray
        const newCoord = { lat, lng };
        if (setCoordArray) {
          setCoordArray((prev) => [...prev, newCoord]);
        }
      }
    });

    return () => {
      if (newMap) {
        window.google.maps.event.clearInstanceListeners(newMap);
      }
    };
  }, [onMapClick, setCoordArray]);

  // Update markers when coordArray changes
  useEffect(() => {
    if (!map || !coordArray) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    const newMarkers = coordArray.map((coord, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: coord.lat, lng: coord.lng },
        map: map,
        title: coord.name || `Point ${index + 1}`,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontWeight: "bold",
        },
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3B82F6"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12),
        },
      });

      // Add click listener to marker
      marker.addListener("click", () => {
        if (onMarkerClick) {
          onMarkerClick(coord, index);
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds if there are coordinates
    if (coordArray.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      coordArray.forEach((coord) => {
        bounds.extend({ lat: coord.lat, lng: coord.lng });
      });
      map.fitBounds(bounds);
    }

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, coordArray, onMarkerClick]);

  // Search functionality
  const handleSearch = async (query) => {
    if (!query.trim() || !window.google) return;

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        query: query,
        fields: ["name", "geometry", "formatted_address"],
      };

      service.textSearch(request, (results, status) => {
        setIsSearching(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSearchResults(results.slice(0, 5));
        } else {
          setSearchResults([]);
        }
      });
    } catch (error) {
      console.error("Search error:", error);
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      } else {
        setSearchResults([]);
      }
    }, 500);
  };

  const handleSearchResultClick = (result) => {
    const lat = result.geometry.location.lat();
    const lng = result.geometry.location.lng();

    if (onMapClick) {
      onMapClick(lat, lng, result);
    } else if (setCoordArray) {
      const newCoord = {
        lat,
        lng,
        name: result.name,
        locationName: result.formatted_address,
      };
      setCoordArray((prev) => [...prev, newCoord]);
    }

    // Center map on selected location
    if (map) {
      map.setCenter({ lat, lng });
      map.setZoom(15);
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);
        }

        if (onMapClick) {
          onMapClick(lat, lng);
        } else if (setCoordArray) {
          const newCoord = { lat, lng, name: "Current Location" };
          setCoordArray((prev) => [...prev, newCoord]);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your current location.");
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="w-full px-4 py-3 pl-12 pr-4 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-20">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                  >
                    <MapPin
                      size={16}
                      className="text-blue-500 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {result.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.formatted_address}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Button */}
      {showNavigation && (
        <button
          onClick={getCurrentLocation}
          className="absolute top-4 right-4 z-10 p-3 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          title="Use my current location"
        >
          <Navigation size={20} className="text-blue-500" />
        </button>
      )}

      {/* Map Container */}
      {!window.google ? (
        <div
          style={{ height }}
          className="w-full rounded-xl border border-gray-200 bg-gray-100"
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Google Maps Not Available
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Please configure your Google Maps API key to use the map functionality.
              </p>
              <div className="text-xs text-gray-400">
                Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative" style={{ height }}>
          <div
            ref={mapRef}
            style={{ height }}
            className="w-full rounded-xl border border-gray-200"
          />
          {isMapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 rounded-xl">
              <div className="text-center p-6">
                <div className="loading loading-spinner loading-lg text-primary mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isSearching && (
        <div className="absolute top-20 left-4 z-10 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="loading loading-spinner loading-sm"></div>
            <span className="text-sm text-gray-600">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
