"use client";
import { useState, useEffect, useRef } from "react";
import Maps from "../../dashboard/comp/maps/map";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SharedButtons from "../../dashboard/comp/maps/shareButtons";
import InstagramShare from "@/components/utility/InstagramShare";
import POICard from "@/components/POICard";
import AddPOIToMapModal from "@/components/AddPOIToMapModal";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import PhotoGalleryButton from "./photogalleryButton";
import Link from "next/link";
import {
  Heart,
  Calendar,
  MessageCircle,
  Eye,
  Send,
  MapPin,
  Share2,
  Pin,
  Bookmark,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { mapApi, socialApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { usePOIStore } from "@/store/usePOIStore";
import PoiModalButtons from "../../dashboard/comp/comps/poiModalButtons";

export default function IndividualMaps({ id }) {
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  // Use POI store for modal management
  const { openPhotoGallery, openFlagModal } = usePOIStore();

  const [mapName, setMapName] = useState("");
  const [coordArray, setCoordArray] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [pois, setPois] = useState([]);
  const [mapUser, setMapUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Removed photo gallery modal states - now managed by the store

  // Add POI modal state
  const [showAddPOIModal, setShowAddPOIModal] = useState(false);

  // Navigation state
  const [navigateToCoordinates, setNavigateToCoordinates] = useState(null);

  // Sort state
  const [sortBy, setSortBy] = useState("date_visited"); // 'date_visited' or 'locationName'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // Share dropdown state
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const shareDropdownRef = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["individualMap", id],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/map/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch map data");
      }
      return await res.json();
    },
    enabled: !!id,
  });
  // Map like mutation
  const likeMutation = useMutation({
    mutationFn: () => mapApi.likeMap(id),
    onSuccess: (data) => {
      if (data.success) {
        setIsLiked(data.data.liked);
        setLikeCount((prev) => (data.data.liked ? prev + 1 : prev - 1));
        toast.success(
          data.data.liked ? "Added to likes" : "Removed from likes"
        );
        queryClient.invalidateQueries(["individualMap", id]);
      }
    },
    onError: (error) => {
      toast.error("Failed to update like");
    },
  });

  // Comments query
  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ["mapComments", id],
    queryFn: () => socialApi.getMapComments(id),
    enabled: !!id && isCommentsOpen,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (commentText) => socialApi.addComment(id, commentText),
    onSuccess: (data) => {
      if (data.success) {
        setNewComment("");
        toast.success("Comment added successfully!");
        refetchComments();
      }
    },
    onError: (error) => {
      toast.error("Failed to add comment");
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: () =>
      isBookmarked ? socialApi.removeBookmark(id) : socialApi.bookmarkMap(id),
    onSuccess: (data) => {
      if (data.success) {
        setIsBookmarked(!isBookmarked);
        toast.success(
          isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
        );
        queryClient.invalidateQueries(["individualMap", id]);
      }
    },
    onError: (error) => {
      toast.error("Failed to update bookmark");
    },
  });

  useEffect(() => {
    if (data && data.success && data.data) {
      const { map, pois: mapPois } = data.data;
      setMapData(map);
      setPois(mapPois);
      setMapName(map.mapName);
      setMapUser(map.user_id);
      setLikeCount(map.likes || 0);
      setIsLiked(map.isLiked || false);
      setIsBookmarked(map.isBookmarked || false);

      // Reset pagination to first page when POIs change
      setCurrentPage(1);

      // Transform POIs to coordinate array for the map
      const transformed = mapPois.map((poi) => ({
        lat: poi.lat,
        lng: poi.lng,
        name: poi.locationName,
        locationName: poi.locationName,
        description: poi.description,
        date_visited: poi.date_visited,
        photos: poi.photos || [],
        _id: poi._id,
      }));
      setCoordArray(transformed);
    }
  }, [data]);

  // Handle comments data
  useEffect(() => {
    if (commentsData?.data?.comments) {
      setComments(commentsData.data.comments);
    }
  }, [commentsData]);

  useEffect(() => {
    if (mapName) {
      document.title = `${mapName} | My Trip Maps`;
    }
  }, [mapName]);

  // Handle click outside share dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareDropdownRef.current &&
        !shareDropdownRef.current.contains(event.target)
      ) {
        setIsShareDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to like maps");
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to bookmark maps");
      return;
    }

    // Check if user is trying to bookmark their own map
    if (mapUser && currentUser && mapUser._id === currentUser._id) {
      toast.error("You cannot bookmark your own map");
      return;
    }

    bookmarkMutation.mutate();
  };

  const handleAddComment = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add comments");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    addCommentMutation.mutate(newComment.trim());
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Photo gallery functions - now handled by the store
  const handleOpenPhotoGallery = (poi, photoIndex = 0) => {
    openPhotoGallery(poi, photoIndex);
  };

  const handleFlagPhoto = (photo, poiData) => {
    openFlagModal(photo, poiData);
  };

  const handleNavigateToMap = (coordinates) => {
    setNavigateToCoordinates(coordinates);

    // Reset coordinates after a short delay to allow for future navigation
    setTimeout(() => {
      setNavigateToCoordinates(null);
    }, 100);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getWeatherInfo = (lat, lng) => {
    return `https://www.google.com/search?q=weather+${lat},${lng}`;
  };

  const getDirections = (lat, lng, locationName) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  };

  const getStreetView = (lat, lng) => {
    return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
  };

  const getWikipediaInfo = (locationName) => {
    return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
      locationName
    )}`;
  };

  const getLocalTime = (lat, lng) => {
    // This would ideally use a timezone API, but for now we'll use a simple approach
    return `https://www.timeanddate.com/worldclock/@${lat},${lng}`;
  };

  // Sort POIs
  const sortedPois = [...pois].sort((a, b) => {
    if (sortBy === "date_visited") {
      const aDate =
        a.photos && a.photos.length > 0
          ? new Date(a.photos[0].date_visited)
          : null;
      const bDate =
        b.photos && b.photos.length > 0
          ? new Date(b.photos[0].date_visited)
          : null;

      // If both have dates, compare them
      if (aDate && bDate) {
        return sortOrder === "desc" ? aDate - bDate : bDate - aDate;
      }

      // If only one has a date, the one with date comes first (or last depending on order)
      if (aDate && !bDate) {
        return sortOrder === "desc" ? -1 : 1;
      }
      if (!aDate && bDate) {
        return sortOrder === "desc" ? 1 : -1;
      }

      // If neither has a date, sort by location name
      return a.locationName.localeCompare(b.locationName);
    } else {
      // Sort by location name
      return sortOrder === "desc"
        ? b.locationName.localeCompare(a.locationName)
        : a.locationName.localeCompare(b.locationName);
    }
  });

  // Pagination functions
  const totalPages = Math.ceil(sortedPois.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPois = sortedPois.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to the top of the POI section
    const poiSection = document.getElementById("poi-section");
    if (poiSection) {
      poiSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Scroll to the top of the POI section
      const poiSection = document.getElementById("poi-section");
      if (poiSection) {
        poiSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Scroll to the top of the POI section
      const poiSection = document.getElementById("poi-section");
      if (poiSection) {
        poiSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const getSortButtonText = () => {
    if (sortBy === "date_visited") {
      return sortOrder === "desc" ? "Date Visited ↓" : "Date Visited ↑";
    } else {
      return sortOrder === "desc" ? "Location Name ↓" : "Location Name ↑";
    }
  };

  // Scroll to POI section when page changes
  useEffect(() => {
    const poiSection = document.getElementById("poi-section");
    if (poiSection) {
      poiSection.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error fetching map data: {error.message}</span>
      </div>
    );
  }

  if (!mapData || !pois) {
    return (
      <div className="alert alert-warning">
        <span>Map not found or no data available.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Canonical URL for SEO */}
      <link
        rel="canonical"
        href={`${
          process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
        }/maps/${id}`}
      />

      {/* Structured Data for Map */}
      {mapData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: mapData.mapName,
              description: `Travel map created by ${
                mapUser?.username || "Unknown"
              }`,
              author: {
                "@type": "Person",
                name: mapUser?.username || "Unknown",
                url: mapUser?.username
                  ? `${
                      process.env.NEXT_PUBLIC_SITE_URL ||
                      "https://mytripmaps.com"
                    }/profile/${mapUser.username}`
                  : undefined,
              },
              dateCreated: mapData.createdAt,
              dateModified: mapData.updatedAt,
              url: `${
                process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
              }/maps/${mapData._id}`,
              image: "/tripmap.webp",
              publisher: {
                "@type": "Organization",
                name: "My Trip Maps",
                url:
                  process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com",
              },
              mainEntity: pois.map((poi) => ({
                "@type": "Place",
                name: poi.locationName,
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: poi.lat,
                  longitude: poi.lng,
                },
                description: poi.tags?.join(", ") || "Travel destination",
              })),
            }),
          }}
        />
      )}

      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        {/* Enhanced Map Container with Map Info */}
        <div className="bg-base-100 rounded-2xl overflow-hidden shadow-xl border border-base-300">
          <div className="p-6 border-b border-base-300 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Left side - Map title and user info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="text-2xl lg:text-3xl font-bold text-primary leading-tight flex items-center gap-3 flex-1">
                    <MapPin className="w-6 h-6 flex-shrink-0" />
                    {mapName ? mapName.toUpperCase() : "Unnamed Map"}
                  </h1>

                  {/* Share Button - Positioned with title on mobile */}
                  <div
                    className="relative flex-shrink-0"
                    ref={shareDropdownRef}
                  >
                    <button
                      onClick={() =>
                        setIsShareDropdownOpen(!isShareDropdownOpen)
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-primary text-neutral font-semibold rounded-lg hover:bg-primary/80 transition-colors text-sm cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </button>

                    {isShareDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 bg-base-100 rounded-lg shadow-lg border border-base-300 p-4 min-w-[300px] z-50">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-semibold text-neutral-content mb-2">
                              Share this map
                            </h3>
                            <SharedButtons id={id} name={mapName} />
                          </div>

                          <div className="border-t border-base-300 pt-4">
                            <h3 className="text-sm font-semibold text-neutral-content mb-2">
                              Share on Instagram
                            </h3>
                            <InstagramShare mapName={mapName} pois={pois} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {mapUser && (
                  <div className="flex flex-row  sm:items-center gap-3 ml-8">
                    <ProfilePictureUpload
                      userId={mapUser?._id}
                      size="sm"
                      showUserInfo={false}
                      compact={true}
                      className="flex-shrink-0"
                    />
                    <div className="flex flex-col gap-1">
                      <div>
                        <Link
                          href={`/profile/${mapUser.username}`}
                          className="badge badge-primary badge-md hover:badge-accent"
                        >
                          {/* <User className="w-4 h-4" /> */}
                          {mapUser.username}
                        </Link>
                      </div>
                      {mapData?.createdAt && (
                        <span className="text-xs text-neutral-content flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created {formatDate(mapData.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="h-96 " data-map-container="true">
            <Maps
              key="individualMap-map"
              mapKey="individualMap-map"
              coordArray={coordArray}
              navigateToCoordinates={navigateToCoordinates}
              onNavigateToPoi={(poiId) => {
                // Find the index of the poi across full, unsorted list as shown in UI's sorted/paginated view
                const indexInSorted = sortedPois.findIndex(
                  (p) => p._id === poiId
                );
                if (indexInSorted === -1) {
                  // If not found in current dataset, just try to scroll by id after a tick
                  setTimeout(() => {
                    const el = document.getElementById(`poi-${poiId}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 50);
                  return;
                }

                const targetPage = Math.floor(indexInSorted / itemsPerPage) + 1;
                if (currentPage !== targetPage) {
                  setCurrentPage(targetPage);
                  // Wait for pagination to render, then scroll
                  setTimeout(() => {
                    const el = document.getElementById(`poi-${poiId}`);
                    if (el) {
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    } else {
                      // Fallback second attempt after a slightly longer delay
                      setTimeout(() => {
                        document
                          .getElementById(`poi-${poiId}`)
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                      }, 200);
                    }
                  }, 150);
                } else {
                  // Already on the right page; just scroll
                  const el = document.getElementById(`poi-${poiId}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
            />
          </div>
        </div>

        {/* Combined Social Bar - Stats, Actions */}
        <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-2xl p-6 shadow-xl border border-base-300">
          <div className="flex items-center justify-between ">
            {/* Left side - Statistics */}
            <div className="flex flex-wrap items-center gap-2 md:gap-6">
              {/* Likes Stat */}
              <div className="flex items-center gap-2 group hover:scale-105 transition-transform duration-200">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm md:text-lg font-bold text-primary">
                  {likeCount}
                </span>
                {/* <span className="text-sm text-gray-600 font-medium">Likes</span> */}
              </div>

              {/* Views Stat */}
              {mapData?.views && (
                <div className="flex items-center gap-2 group hover:scale-105 transition-transform duration-200">
                  <Eye className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm md:text-lg font-bold text-primary">
                    {mapData.views}
                  </span>
                  {/* <span className="text-sm text-gray-600 font-medium">
                    Views
                  </span> */}
                </div>
              )}

              {/* Locations Stat */}
              <div className="flex items-center gap-2 group hover:scale-105 transition-transform duration-200">
                <Pin className="w-4 h-4 md:w-5 md:h-5 text-accent group-hover:scale-110 transition-transform" />
                <span className="text-sm md:text-lg font-bold text-primary">
                  {pois.length}
                </span>
                {/* <span className="text-sm text-gray-600 font-medium">
                  Locations
                </span> */}
              </div>

              {/* Comments Stat */}
              <div className="flex items-center gap-2 group hover:scale-105 transition-transform duration-200">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-info group-hover:scale-110 transition-transform" />
                <span className="text-sm md:text-lg font-bold text-primary">
                  {comments.length}
                </span>
                {/* <span className="text-sm text-gray-600 font-medium">
                  Comments
                </span> */}
              </div>
            </div>

            {/* Center - Social Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Bookmark Button */}
              {isAuthenticated &&
                currentUser &&
                mapUser._id !== currentUser._id && (
                  <button
                    onClick={handleBookmark}
                    disabled={bookmarkMutation.isPending || !isAuthenticated}
                    className={`tooltip tooltip-top btn btn-xs md:btn-sm btn-soft btn-accent rounded-full gap-2 ${
                      !isAuthenticated
                        ? "btn-disabled opacity-50"
                        : isBookmarked
                        ? "btn-accent shadow-md"
                        : "btn-outline btn-accent hover:btn-accent hover:shadow-md"
                    } transition-all duration-200`}
                    data-tip={
                      !isAuthenticated
                        ? "Please log in to bookmark maps"
                        : isBookmarked
                        ? "Remove from bookmarks"
                        : "Add to Travel Journal"
                    }
                    aria-label={
                      isBookmarked
                        ? "Remove from bookmarks"
                        : "Add to Travel Journal"
                    }
                    type="button"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                    {/* <span className="font-medium">
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </span> */}
                    {bookmarkMutation.isPending && (
                      <div className="loading loading-spinner loading-xs"></div>
                    )}
                  </button>
                )}
              {/* Photo Gallery Button */}
              {/* Pass all POI photos to the gallery button so users can view map-wide photos */}
              <PhotoGalleryButton
                id={id}
                photos={pois.flatMap((p) =>
                  (p.photos || []).map((ph) => ({ ...ph, poiId: p._id }))
                )}
                mapName={mapName}
              />
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending || !isAuthenticated}
                className={`btn btn-xs md:btn-sm btn-soft btn-error rounded-full gap-2 tooltip tooltip-top ${
                  !isAuthenticated
                    ? "btn-disabled opacity-50"
                    : isLiked
                    ? "btn-error shadow-md"
                    : "btn-outline btn-error hover:btn-error hover:shadow-md"
                } transition-all duration-200`}
                data-tip={
                  !isAuthenticated
                    ? "Please log in to like maps"
                    : "Like this Map"
                }
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {/* <span className="font-medium">
                  {isLiked ? "Liked" : "Like"}
                </span> */}
                {likeMutation.isPending && (
                  <div className="loading loading-spinner loading-xs"></div>
                )}
              </button>

              {/* Comments Button */}
              <button
                onClick={() => setIsCommentsOpen(true)}
                className="tooltip tooltip-left btn btn-xs md:btn-sm btn-soft btn-primary rounded-full gap-2 hover:shadow-md transition-all duration-200"
                data-tip="View and Add Comments"
                aria-label="View and Add Comments"
                type="button"
              >
                <MessageCircle className="w-4 h-4" />
                {/* <span className="font-medium">Comments</span> */}
              </button>
            </div>

            {/* Right side - Owner Actions and Share */}
          </div>
        </div>
        {/* Enhanced POI Section */}
        <div
          id="poi-section"
          className="bg-base-100 rounded-2xl shadow-xl border border-base-300"
        >
          <div className="p-6 border-b border-base-300 bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary mb-2 flex items-center gap-3">
                  <Pin className="w-6 h-6" />
                  Map Locations
                </h2>
                <div className="flex items-center gap-4 text-sm text-neutral-content">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {pois.length} locations total
                  </span>
                  {totalPages > 1 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      Page {currentPage} of {totalPages}
                    </span>
                  )}
                </div>
              </div>
              {isAuthenticated &&
                currentUser &&
                mapUser &&
                currentUser._id === mapUser._id && (
                  <button
                    onClick={() => setShowAddPOIModal(true)}
                    className="btn btn-primary gap-3 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
                  >
                    <Plus size={20} />
                    Add Location
                  </button>
                )}
              <div className="flex items-center gap-2">
                <div className="dropdown dropdown-end">
                  <button
                    className="btn btn-primary btn-soft btn-md gap-2 hover:btn-primary transition-all duration-200 rounded-2xl"
                    tabIndex={0}
                  >
                    <ArrowUpDown size={16} />
                    {getSortButtonText()}
                  </button>
                  <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                    <li>
                      <button
                        onClick={() => handleSortChange("date_visited", "desc")}
                        className={`flex items-center justify-between  ${
                          sortBy === "date_visited" && sortOrder === "desc"
                            ? "bg-primary text-primary-content"
                            : ""
                        }`}
                      >
                        <span>Date Visited ↓</span>
                        {sortBy === "date_visited" && sortOrder === "desc" && (
                          <span className="text-xs">✓</span>
                        )}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSortChange("date_visited", "asc")}
                        className={`flex items-center justify-between ${
                          sortBy === "date_visited" && sortOrder === "asc"
                            ? "bg-primary text-primary-content"
                            : ""
                        }`}
                      >
                        <span>Date Visited ↑</span>
                        {sortBy === "date_visited" && sortOrder === "asc" && (
                          <span className="text-xs">✓</span>
                        )}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSortChange("locationName", "asc")}
                        className={`flex items-center justify-between ${
                          sortBy === "locationName" && sortOrder === "asc"
                            ? "bg-primary text-primary-content"
                            : ""
                        }`}
                      >
                        <span>Location Name ↑</span>
                        {sortBy === "locationName" && sortOrder === "asc" && (
                          <span className="text-xs">✓</span>
                        )}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSortChange("locationName", "desc")}
                        className={`flex items-center justify-between ${
                          sortBy === "locationName" && sortOrder === "desc"
                            ? "bg-primary text-primary-content"
                            : ""
                        }`}
                      >
                        <span>Location Name ↓</span>
                        {sortBy === "locationName" && sortOrder === "desc" && (
                          <span className="text-xs">✓</span>
                        )}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col items-center justify-center">
            {pois.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No locations added to this map yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
                  {currentPois.map((poi) => (
                    <POICard
                      key={poi._id}
                      poi={poi}
                      showActions={true}
                      showLikeButton={true}
                      showFlagButton={true}
                      compact={true}
                      onViewPhotos={handleOpenPhotoGallery}
                      mapLocation={true}
                      onNavigateToMap={handleNavigateToMap}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <button
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                          }
                        }}
                        disabled={currentPage === 1}
                        className="btn btn-outline btn-sm gap-2 hover:btn-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>

                      <div className="flex items-center gap-1 bg-base-200 rounded-lg p-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`btn btn-sm min-w-[40px] h-8 ${
                              currentPage === page
                                ? "btn-primary shadow-md"
                                : "btn-ghost hover:bg-base-300"
                            } transition-all duration-200`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                          }
                        }}
                        disabled={currentPage === totalPages}
                        className="btn btn-outline btn-sm gap-2 hover:btn-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Page Info */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-base-200 rounded-full text-sm text-neutral-content">
                        <span className="font-medium">
                          Showing {startIndex + 1}-
                          {Math.min(endIndex, pois.length)}
                        </span>
                        <span className="text-neutral-600">of</span>
                        <span className="font-medium">{pois.length}</span>
                        <span className="text-neutral-content">locations</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Comments Drawer */}
        <div className="drawer drawer-end">
          <input
            id="comments-drawer"
            type="checkbox"
            className="drawer-toggle"
            checked={isCommentsOpen}
            onChange={(e) => setIsCommentsOpen(e.target.checked)}
          />

          <div className="drawer-content">{/* This is the main content */}</div>

          <div className="drawer-side z-50">
            <label
              htmlFor="comments-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>

            <div className="min-h-full w-80 bg-base-200 text-base-content p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Comments</h3>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="btn btn-sm btn-ghost"
                >
                  ✕
                </button>
              </div>

              {/* Add Comment Section */}
              {isAuthenticated && (
                <div className="mb-6 p-4 bg-base-100 rounded-lg">
                  <div className="flex gap-2">
                    <textarea
                      id="comment-input"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={handleCommentKeyDown}
                      placeholder="Add a comment..."
                      className="textarea textarea-bordered flex-1"
                      rows={3}
                      disabled={addCommentMutation.isPending}
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      disabled={
                        addCommentMutation.isPending || !newComment.trim()
                      }
                      className="btn btn-sm btn-primary gap-2"
                    >
                      {addCommentMutation.isPending ? (
                        <div className="loading loading-spinner loading-xs"></div>
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      Comment
                    </button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No comments yet</p>
                    {!isAuthenticated && (
                      <p className="text-sm mt-2">
                        Log in to add the first comment!
                      </p>
                    )}
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-base-100 p-4 rounded-lg shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <ProfilePictureUpload
                          userId={comment.user_id?._id}
                          size="sm"
                          showUserInfo={false}
                          compact={true}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/profile/${comment.user_id.username}`}
                              className="font-semibold text-sm"
                            >
                              {comment.user_id?.username || "Unknown User"}
                            </Link>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POI Photo Gallery */}
      <PoiModalButtons />

      {/* Add POI to Map Modal */}
      <AddPOIToMapModal
        isOpen={showAddPOIModal}
        onClose={() => setShowAddPOIModal(false)}
        mapId={id}
        mapName={mapName}
      />
    </div>
  );
}
