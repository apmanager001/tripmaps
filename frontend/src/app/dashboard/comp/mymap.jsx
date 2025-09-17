"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { useVerifyUser } from "@/components/utility/tanstack/verifyUser";
import {
  MapPin,
  X,
  Mail,
  Pencil,
  Github,
  Linkedin,
  CircleUser,
  Trash2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  UserMinus,
} from "lucide-react";
import SharedButtons from "./maps/shareButtons";
import Link from "next/link";
import PrivateToggle from "./comps/privateToggle";
import { legacyApi, mapApi, poiApi, socialApi, userApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import Maps from "./maps/map";

export default function Dashsection3() {
  const user = useAuthStore((state) => state.user);
  const userId = user?._id;
  const queryClient = useQueryClient();

  // Force refresh auth data to get updated profile picture
  const { data: authUser, refetch: refetchAuth } = useVerifyUser();

  // Get user profile data with presigned URLs (same as profile page)
  const { data: profileData } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => userApi.getProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Force refresh auth data on component mount to get profile picture
  useEffect(() => {
    refetchAuth();
  }, [refetchAuth]);

  const [editingMap, setEditingMap] = useState({ id: null, name: "" });
  const [lifetimeMapOpen, setLifetimeMapOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    mapId: null,
    mapName: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardData", userId],
    queryFn: () => legacyApi.getDashboard(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const { user: userInfo, maps = [], friends = [] } = data || {};
  const mapCount = Array.isArray(maps) ? maps.length : 0;

  // Fetch all POIs for the user's maps
  const { data: allPOIsData, isLoading: poisLoading } = useQuery({
    queryKey: ["userAllPOIs", userId, mapCount],
    queryFn: async () => {
      if (!maps || maps.length === 0) return [];

      // Fetch POIs for each map using the POI API
      const poisPromises = maps.map(async (map) => {
        try {
          const response = await poiApi.getPOIsByMap(map._id);
          if (response.success) {
            return response.data || [];
          }
          return [];
        } catch (error) {
          // Silently handle access errors for private maps
          if (error.message === "Cannot access POIs of private map") {
            // Skipping private map - access denied
            return [];
          }
          console.error(`Error fetching POIs for map ${map._id}:`, error);
          return [];
        }
      });

      const allPOIs = await Promise.all(poisPromises);
      const flattenedPOIs = allPOIs.flat();
      return flattenedPOIs;
    },
    enabled: !!userId && !!maps && maps.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const refreshDashboardData = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboardData", userId] });
  };

  const startEditing = (mapId, currentName) => {
    setEditingMap({ id: mapId, name: currentName || "" });
  };

  const cancelEditing = () => {
    setEditingMap({ id: null, name: "" });
  };

  const saveMapName = async (mapId, newName) => {
    if (!newName.trim()) {
      toast.error("Map name cannot be empty");
      return;
    }

    try {
      await mapApi.updateMap(mapId, { mapName: newName.trim() });
      toast.success("Map name updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["dashboardData", userId] });
      setEditingMap({ id: null, name: "" });
    } catch (error) {
      toast.error(error.message || "Failed to update map name");
    }
  };

  const showDeleteModal = (mapId, mapName) => {
    setDeleteModal({ show: true, mapId, mapName });
  };

  const hideDeleteModal = () => {
    setDeleteModal({ show: false, mapId: null, mapName: "" });
  };

  const handleDeleteMap = async () => {
    if (!deleteModal.mapId) return;

    try {
      await mapApi.deleteMap(deleteModal.mapId);
      toast.success("Map deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["dashboardData", userId] });
      queryClient.invalidateQueries({ queryKey: ["userAllPOIs", userId] });
      hideDeleteModal();
    } catch (error) {
      toast.error(error.message || "Failed to delete map");
    }
  };

  // Use the fetched POIs data
  const allPOIs = allPOIsData || [];

  // Fetch bookmarked maps
  const { data: bookmarkedMapsData, isLoading: bookmarksLoading } = useQuery({
    queryKey: ["bookmarkedMaps", userId],
    queryFn: async () => {
      try {
        const response = await socialApi.getUserBookmarks(userId);
        if (response.success) {
          return response.data?.bookmarks || [];
        }
        return [];
      } catch (error) {
        console.error("Error fetching bookmarked maps:", error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const bookmarkedMaps = bookmarkedMapsData || [];

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (friendId) => {
      return await socialApi.unfollowUser(friendId);
    },
    onSuccess: (data, friendId) => {
      toast.success("Successfully unfollowed user");
      // Refresh dashboard data to update friends list
      queryClient.invalidateQueries(["dashboardData", userId]);
    },
    onError: (error) => {
      toast.error(`Failed to unfollow user: ${error.message}`);
    },
  });

  // Transform POIs to coordinate array for the map
  const lifetimeMapCoords = allPOIs.map((poi) => ({
    lat: poi.lat,
    lng: poi.lng,
    name: poi.locationName,
  }));
  let badgeLabel = "";

  if (mapCount <= 4) badgeLabel = "Novice Mapper";
  else if (mapCount <= 9) badgeLabel = "Trail Explorer";
  else if (mapCount <= 19) badgeLabel = "Route Sketcher";
  else if (mapCount <= 34) badgeLabel = "Path Pioneer";
  else if (mapCount <= 49) badgeLabel = "Terrain Tactician";
  else if (mapCount <= 74) badgeLabel = "Region Strategist";
  else if (mapCount <= 99) badgeLabel = "Cartography Artisan";
  else if (mapCount <= 149) badgeLabel = "Wilderness Visionary";
  else if (mapCount <= 199) badgeLabel = "Atlas Architect";
  else badgeLabel = "Expert Mapper";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading dashboard: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full md:p-4 space-y-4 overflow-hidden">
      {/* Lifetime Map Section */}
      <div className="bg-base-200 md:shadow-sm md:rounded-lg overflow-hidden">
        <button
          onClick={() => setLifetimeMapOpen(!lifetimeMapOpen)}
          className="w-full p-4 flex items-center justify-between hover:bg-base-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-primary">Lifetime Map</h2>
            <span className="badge badge-primary badge-sm">
              {lifetimeMapCoords.length} locations
            </span>
          </div>
          {lifetimeMapOpen ? (
            <ChevronUp className="text-primary" size={20} />
          ) : (
            <ChevronDown className="text-primary" size={20} />
          )}
        </button>

        {lifetimeMapOpen && (
          <div className="border-t border-base-300">
            <div className="h-96 relative">
              {poisLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
              ) : lifetimeMapCoords.length > 0 ? (
                <div className="h-full">
                  <Maps
                    key="mymap-map"
                    mapKey="mymap-map"
                    coordArray={lifetimeMapCoords}
                    zoom={1}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-2" size={48} />
                    <p>No locations added to any maps yet.</p>
                    <p className="text-sm">
                      Create a map and add locations to see them here!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top Section: Profile + Friends Side-by-Side */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Profile Info */}
        <div className="flex-1 bg-base-200 md:shadow-sm md:rounded-lg overflow-auto md:w-60 min-w-60">
          <div className="flex flex-col">
            <div className="flex items-center p-6 gap-4 border-b border-base-300 flex-wrap">
              {/* <CircleUser size={48} className="text-primary" /> */}
              <ProfilePictureUpload
                currentUser={profileData?.data?.user || authUser || user}
                onUpdate={() => {}}
                size="md"
                showUserInfo={false}
              />
              <div className="flex flex-col">
                <Link
                  href={`/profile/${user?.username}`}
                  className="text-xl font-bold text-primary"
                >
                  {user?.username}
                </Link>
                <p className="badge badge-accent badge-soft text-xs">
                  {badgeLabel}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Bio */}
              <div>
                <h2 className="font-semibold text-base-content mb-2">Bio</h2>
                <p className="text-sm text-base-content">
                  {userInfo?.bio || "No bio available"}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-accent" />
                  <span className="text-sm">
                    {userInfo?.email || "No email available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Friends Panel */}
        <div className="md:w-52 bg-base-200 md:shadow-md md:rounded-lg p-4 space-y-4 md:min-h-96">
          <h2 className="text-lg font-semibold text-primary border-b border-base-300 pb-2">
            Friends
          </h2>
          {friends.length === 0 ? (
            <div className="text-md text-gray-500 space-y-2">
              <p>You have no friends yet. 😢</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center gap-3 hover:bg-base-200 rounded p-2 transition group"
              >
                <Link
                  href={`/profile/${
                    friend.followed_user_id?.username || friend.username
                  }`}
                  className="flex items-center gap-3 flex-1 truncate"
                >
                  <CircleUser size={32} className="text-secondary" />
                  <div>
                    <p className="font-medium text-base-content">
                      {friend.followed_user_id?.username || friend.username}
                    </p>
                  </div>
                </Link>

                {/* Unfollow Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    unfollowMutation.mutate(
                      friend.followed_user_id?._id || friend.followed_user_id
                    );
                  }}
                  disabled={unfollowMutation.isPending}
                  className="btn btn-soft btn-error btn-xs text-error hover:text-white "
                  title="Unfollow"
                >
                  {unfollowMutation.isPending ? (
                    <div className="loading loading-spinner loading-xs"></div>
                  ) : (
                    <UserMinus size={16} />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bookmarked Maps Panel */}
        <div className="md:w-60 bg-base-200 md:shadow-md md:rounded-lg p-4 space-y-4 md:min-h-96 min-w-60">
          <h2 className="text-lg font-semibold text-primary border-b border-base-300 pb-2">
            Bookmarked Maps
          </h2>
          {bookmarksLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading loading-spinner loading-md text-primary"></div>
            </div>
          ) : bookmarkedMaps.length === 0 ? (
            <div className="text-md text-gray-500 space-y-2">
              <p>No bookmarked maps yet. 📚</p>
            </div>
          ) : (
            bookmarkedMaps.map((bookmark) => (
              <Link
                key={bookmark._id}
                href={`/maps/${bookmark.map_id?._id || bookmark.map_id}`}
                className="flex items-center gap-3 hover:bg-base-200 rounded p-2 transition"
              >
                <Bookmark size={24} className="text-accent" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-base-content truncate">
                    {bookmark.map_id?.mapName || "Unnamed Map"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    by {bookmark.map_id?.user_id?.username || "Unknown User"}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Bottom Section: Maps */}
      <main className="bg-base-200 md:shadow-sm md:rounded-lg p-6 flex-1 overflow-hidden">
        <h2 className="text-2xl font-bold text-primary mb-4">My Maps</h2>
        {isLoading ? (
          <p className="text-neutral-500">Loading maps...</p>
        ) : error ? (
          <p className="text-red-500">Error loading maps</p>
        ) : maps.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">No maps created yet.</p>
            <Link href="/dashboard?tab=Add%20Map" className="btn btn-primary">
              Create Your First Map
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="table table-zebra w-full text-center table-pin-rows max-w-[1200px]">
              <thead>
                <tr className="text-center">
                  <th>Map Name</th>
                  <th>Link to Map</th>
                  <th>Private</th>
                  <th>Share</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(maps) &&
                  maps.map((map) => (
                    <tr key={map._id} className="hover:bg-base-300 ">
                      <td className="h-16 px-4 font-extrabold">
                        {editingMap.id === map._id ? (
                          <div className="flex items-center justify-center gap-2 h-full">
                            <input
                              id={`edit-map-name-${map._id}`}
                              type="text"
                              value={editingMap.name}
                              onChange={(e) =>
                                setEditingMap({
                                  ...editingMap,
                                  name: e.target.value,
                                })
                              }
                              className="input input-bordered input-sm w-32 text-center font-bold"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  saveMapName(map._id, editingMap.name);
                                } else if (e.key === "Escape") {
                                  cancelEditing();
                                }
                              }}
                            />
                            <button
                              onClick={() =>
                                saveMapName(map._id, editingMap.name)
                              }
                              className="btn btn-success btn-xs p-1 hover:bg-success-focus rounded-full transition-colors"
                              title="Save changes"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="btn btn-error btn-xs p-1 hover:bg-error-focus rounded-full transition-colors"
                              title="Cancel editing"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 h-full">
                            {map.mapName?.toUpperCase() || "Unnamed Map"}
                            <button
                              onClick={() => startEditing(map._id, map.mapName)}
                              className="btn btn-ghost btn-xs p-1 hover:bg-base-300 rounded-full transition-colors"
                              title="Edit map name"
                            >
                              <Pencil className="w-4 h-4 hover:text-accent-focus" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="align-middle">
                        <Link
                          href={`/maps/${map._id}`}
                          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <MapPin />
                          View Map
                        </Link>
                      </td>
                      <td className="align-middle ">
                        <PrivateToggle
                          isPrivate={map.isPrivate}
                          id={map._id}
                          onToggle={refreshDashboardData}
                        />
                      </td>
                      <td className="align-middle">
                        <SharedButtons id={map._id} name={map.mapName} />
                      </td>
                      <td>
                        <button
                          onClick={() => showDeleteModal(map._id, map.mapName)}
                          className="btn btn-sm btn-error rounded-full text-black"
                          title="Delete map"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Map</h3>
            <p className="py-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                "{deleteModal.mapName || "Unnamed Map"}"
              </span>
              ?
            </p>
            <div className="text-sm text-gray-600 mb-4">
              <p>This action will permanently delete:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The map and all its data</li>
                <li>All POIs (Points of Interest) on the map</li>
                <li>All likes for the map and POIs</li>
                <li>All comments on the map</li>
                <li>All bookmarks of this map</li>
              </ul>
            </div>
            <p className="text-sm text-error font-semibold">
              This action cannot be undone!
            </p>
            <div className="modal-action">
              <button onClick={hideDeleteModal} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={handleDeleteMap} className="btn btn-error">
                Delete Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
