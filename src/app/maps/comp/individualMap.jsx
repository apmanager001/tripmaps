"use client";
import { useState, useEffect } from "react";
import Maps from "../../dashboard/comp/maps/map";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SharedButtons from "../../dashboard/comp/maps/shareButtons";
import InstagramShare from "@/components/utility/InstagramShare";
import Link from "next/link";
import {
  Heart,
  Calendar,
  ThumbsUp,
  Eye,
  MessageCircle,
  Send,
  User,
  Info,
  MapPin,
  Clock,
  Star,
  Share2,
  Copy,
  Pin,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { mapApi, poiApi, socialApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

export default function IndividualMaps({ id }) {
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [mapName, setMapName] = useState("");
  const [coordArray, setCoordArray] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [pois, setPois] = useState([]);
  const [mapUser, setMapUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [poiLikes, setPoiLikes] = useState({});
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  // POI like mutation
  const poiLikeMutation = useMutation({
    mutationFn: ({ poiId }) => poiApi.likePOI(poiId),
    onSuccess: (data, variables) => {
      if (data.success) {
        const { poiId } = variables;
        // Update the POI likes state based on the response
        setPoiLikes((prev) => ({
          ...prev,
          [poiId]: !prev[poiId],
        }));
        toast.success("POI like updated");
        queryClient.invalidateQueries(["individualMap", id]);
      }
    },
    onError: (error) => {
      toast.error("Failed to update POI like");
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

      // Initialize POI likes state
      const poiLikesState = {};
      mapPois.forEach((poi) => {
        poiLikesState[poi._id] = poi.isLiked || false;
      });
      setPoiLikes(poiLikesState);

      // Transform POIs to coordinate array for the map
      const transformed = mapPois.map((poi) => ({
        lat: poi.lat,
        lng: poi.lng,
        name: poi.locationName,
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

  const handlePoiLike = (poiId) => {
    if (!isAuthenticated) {
      toast.error("Please log in to like locations");
      return;
    }
    poiLikeMutation.mutate({ poiId });
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
    <div className="p-4 flex flex-col gap-6 bg-base-200 rounded-box shadow-lg">
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

      {/* Mobile-friendly layout */}
      <div className="space-y-4">
        {/* Map title and user info - full width on mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-lg font-bold text-primary flex flex-col items-start sm:items-end overflow-x-hidden">
            <span className="break-words">
              {mapName ? mapName.toUpperCase() : "Unnamed Map"}
            </span>
            {mapUser && (
              <Link
                href={`/profile/${mapUser.username}`}
                className="badge badge-soft badge-sm text-sm hover:badge-primary transition-colors mt-1"
              >
                {mapUser.username}
              </Link>
            )}
          </div>

          {/* Share buttons - always visible */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SharedButtons id={id} name={mapName} />
            <InstagramShare mapName={mapName} pois={pois} />
          </div>
        </div>

        {/* Action buttons - responsive grid on mobile */}
        <div className="grid grid-cols-3 sm:flex sm:items-center sm:gap-4 gap-2">
          {/* Bookmark Button */}
          {mapUser && currentUser && mapUser._id !== currentUser._id && (
            <button
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending || !isAuthenticated}
              className={`btn btn-sm gap-1 sm:gap-2 ${
                !isAuthenticated
                  ? "btn-disabled opacity-50"
                  : isBookmarked
                  ? "btn-accent"
                  : "btn-ghost hover:btn-accent"
              } transition-all duration-200`}
              title={
                !isAuthenticated
                  ? "Please log in to bookmark maps"
                  : isBookmarked
                  ? "Remove from bookmarks"
                  : "Add to bookmarks"
              }
            >
              <Bookmark
                className={`w-4 h-4 ${
                  isBookmarked ? "fill-current text-accent" : "text-accent"
                }`}
              />
              <span className="hidden sm:inline">Bookmark</span>
              {bookmarkMutation.isPending && (
                <div className="loading loading-spinner loading-xs"></div>
              )}
            </button>
          )}

          {/* Comments Button */}
          <button
            onClick={() => setIsCommentsOpen(true)}
            className="btn btn-sm btn-ghost gap-1 sm:gap-2"
            title="View comments"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Comments</span>
            <span className="sm:hidden">{comments.length}</span>
          </button>

          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending || !isAuthenticated}
            className={`btn btn-sm gap-1 sm:gap-2 ${
              !isAuthenticated
                ? "btn-disabled opacity-50"
                : isLiked
                ? "btn-error"
                : "btn-ghost hover:btn-error"
            } transition-all duration-200`}
            title={!isAuthenticated ? "Please log in to like maps" : ""}
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? "fill-current text-red-500" : "text-red-500"
              }`}
            />
            <span className="hidden sm:inline">Like</span>
            <span className="sm:hidden">{likeCount}</span>
            {likeMutation.isPending && (
              <div className="loading loading-spinner loading-xs"></div>
            )}
          </button>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="bg-base-100 rounded-lg p-4 shadow-inner border border-base-300">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">{likeCount} likes</span>
            </div>
            {mapData?.views && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {mapData.views} views
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">
                {pois.length} locations
              </span>
            </div>
          </div>

          {mapData?.createdAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Created: {formatDate(mapData.createdAt)}</span>
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded overflow-hidden border border-base-300"
        data-map-container="true"
      >
                                             <Maps key="individualMap-map" mapKey="individualMap-map" coordArray={coordArray} />
      </div>
      <div className="bg-base-100 rounded-lg p-4 shadow-inner border border-base-300">
        <h2 className="text-lg font-semibold text-primary mb-4">
          Map Locations
        </h2>
        {pois.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No locations added to this map yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pois.map((poi) => (
              <div
                key={poi._id}
                className="bg-base-200 rounded-lg hover:shadow-lg transition-all duration-200 border border-base-300 overflow-hidden"
              >
                {/* Header with title and like button */}
                <div className="p-4 border-b border-base-300">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base-content text-sm leading-tight flex-1 pr-2">
                      {poi.locationName}
                    </h3>
                    <button
                      onClick={() => handlePoiLike(poi._id)}
                      disabled={poiLikeMutation.isPending || !isAuthenticated}
                      className={`btn btn-xs gap-1 flex-shrink-0 ${
                        !isAuthenticated
                          ? "btn-disabled opacity-50"
                          : poiLikes[poi._id]
                          ? "btn-error"
                          : "btn-ghost hover:btn-error"
                      } transition-all duration-200`}
                      title={
                        !isAuthenticated
                          ? "Please log in to like locations"
                          : ""
                      }
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          poiLikes[poi._id]
                            ? "fill-current text-red-500"
                            : "text-red-500"
                        }`}
                      />
                      <span className="text-xs">{poi.likes || 0}</span>
                    </button>
                  </div>

                  {/* Location Info */}
                  <div className="text-xs text-gray-600 mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {/* Date Visited */}
                  {poi.date_visited && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(poi.date_visited)}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {poi.tags && poi.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {poi.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="badge badge-xs badge-primary"
                        >
                          {tag}
                        </span>
                      ))}
                      {poi.tags.length > 3 && (
                        <span className="badge badge-xs badge-neutral">
                          +{poi.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 space-y-3">
                  {/* Primary Actions */}
                  <div className="flex flex-wrap gap-1">
                    <a
                      href={`https://www.google.com/maps?q=${poi.lat},${poi.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-soft btn-primary gap-1"
                      title="View on Google Maps"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Maps
                    </a>
                    <a
                      href={getDirections(poi.lat, poi.lng, poi.locationName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-soft btn-secondary gap-1"
                      title="Get directions"
                    >
                      <MapPin className="w-3 h-3" />
                      Route
                    </a>
                    <a
                      href={getStreetView(poi.lat, poi.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-soft btn-accent gap-1"
                      title="Street View"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </a>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex flex-wrap gap-1">
                    <a
                      href={getWeatherInfo(poi.lat, poi.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-soft btn-info gap-1"
                      title="Check weather"
                    >
                      <Info className="w-3 h-3" />
                      Weather
                    </a>
                    <a
                      href={getLocalTime(poi.lat, poi.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-soft btn-warning gap-1"
                      title="Local time"
                    >
                      <Clock className="w-3 h-3" />
                      Time
                    </a>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${poi.locationName} - ${poi.lat}, ${poi.lng}`
                        )
                      }
                      className="btn btn-xs btn-soft btn-neutral gap-1"
                      title="Copy coordinates"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>

                  {/* Additional Services */}
                  <div className="flex flex-wrap gap-1">
                    <a
                      href={getWikipediaInfo(poi.locationName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-soft btn-success gap-1"
                      title="Wikipedia info"
                    >
                      <Star className="w-3 h-3" />
                      Wiki
                    </a>
                    <a
                      href={`https://www.tripadvisor.com/Search?q=${poi.locationName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-soft btn-info gap-1"
                      title="TripAdvisor reviews"
                    >
                      <Star className="w-3 h-3" />
                      TA
                    </a>
                    <a
                      href={`https://www.yelp.com/search?find_desc=${encodeURIComponent(
                        poi.locationName
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-soft btn-warning gap-1"
                      title="Yelp reviews"
                    >
                      <Star className="w-3 h-3" />
                      Yelp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-8">
                          <User className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.user_id?.username || "Unknown User"}
                          </span>
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
  );
}
