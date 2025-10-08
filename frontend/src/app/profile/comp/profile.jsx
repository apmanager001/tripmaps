"use client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useVisitedCountries } from "@/components/visitedCountrys";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Users,
  Calendar,
  Eye,
  Heart,
  Award,
  Map,
  User,
  Globe,
  Clock,
  UserPlus,
  UserMinus,
  ExternalLink,
  Plane,
} from "lucide-react";
import ProfileVisitedCountries from "./profileVisitedCountries";
import { SocialIcon } from "react-social-icons";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import MapCard from "@/components/MapCard";
import { userApi, mapApi, socialApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";

async function fetchProfileData(id) {
  try {
    const [userData, mapsData] = await Promise.all([
      userApi.getProfile(id),
      mapApi.getUserMaps(id, 1, 50), // Fetch up to 50 maps
    ]);

    return {
      ...userData,
      data: {
        ...userData.data,
        maps: mapsData.data.maps || [],
      },
    };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
}
export default function Profile({ id }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["profileData", id],
    queryFn: () => fetchProfileData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Compute userId (may be undefined on first render) and call visited countries hook
  // unconditionally so hook order stays stable between renders.
  const userId = data?.data?.user?._id ?? null;
  // Check visited countries for this profile user (hook must be called every render)
  const { data: visitedCountries } = useVisitedCountries(userId);

  // Check if current user is following the profile user
  const { data: followingData } = useQuery({
    queryKey: ["followingStatus", currentUser?._id, data?.data?.user?._id],
    queryFn: async () => {
      if (
        !currentUser?._id ||
        !data?.data?.user?._id ||
        currentUser._id === data.data.user._id
      )
        return { isFollowing: false };

      try {
        // Get the current user's following list and check if profile user is in it
        const response = await socialApi.getFollowing(currentUser._id, 1, 100);
        const isFollowing = response.data.following.some(
          (follow) => follow.followed_user_id._id === data.data.user._id
        );
        return { isFollowing };
      } catch (error) {
        console.error("Error checking following status:", error);
        return { isFollowing: false };
      }
    },
    enabled:
      !!currentUser?._id &&
      !!data?.data?.user?._id &&
      currentUser._id !== data.data.user._id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (followingData?.isFollowing) {
        return await socialApi.unfollowUser(data.data.user._id);
      } else {
        return await socialApi.followUser(data.data.user._id);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch following status
      queryClient.invalidateQueries([
        "followingStatus",
        currentUser?._id,
        data?.data?.user?._id,
      ]);
      queryClient.invalidateQueries(["profileData", id]);

      const action = followingData?.isFollowing ? "unfollowed" : "followed";
      toast.success(
        `Successfully ${action} ${data?.data?.user?.username || "user"}`
      );
    },
    onError: (error) => {
      const action = followingData?.isFollowing ? "unfollow" : "follow";
      toast.error(`Failed to ${action} user: ${error.message}`);
    },
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  if (error) {
    // Redirect to not-found page instead of showing error
    router.push("/not-found");
    return null;
  }

  const { user, maps, stats } = data.data;

  // visitedCountries hook was already called above with a possibly-null userId.
  const shouldShowVisited = visitedCountries && visitedCountries.length > 0;

  const mapCount = maps.length;

  function getBadge(count) {
    if (count <= 4) return "Novice Mapper";
    if (count <= 9) return "Trail Explorer";
    if (count <= 19) return "Route Sketcher";
    if (count <= 34) return "Path Pioneer";
    if (count <= 49) return "Terrain Tactician";
    if (count <= 74) return "Region Strategist";
    if (count <= 99) return "Cartography Artisan";
    if (count <= 149) return "Wilderness Visionary";
    if (count <= 199) return "Atlas Architect";
    return "Expert Mapper";
  }

  const handleProfileUpdate = (updatedUser) => {
    queryClient.setQueryData(["profileData", id], (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          user: updatedUser,
        },
      };
    });
  };

  // Helper function to get social media network and styling
  const getSocialMediaInfo = (platform) => {
    const socialInfo = {
      facebook: {
        network: "facebook",
        bgColor: "bg-blue-50",
        iconBg: "#1877f2",
      },
      instagram: {
        network: "instagram",
        bgColor: "bg-pink-50",
        iconBg: "#e4405f",
      },
      tiktok: { network: "tiktok", bgColor: "bg-black", iconBg: "#000000" },
      youtube: { network: "youtube", bgColor: "bg-red-50", iconBg: "#ff0000" },
      twitter: { network: "twitter", bgColor: "bg-blue-50", iconBg: "#1da1f2" },
      linkedin: {
        network: "linkedin",
        bgColor: "bg-blue-50",
        iconBg: "#0077b5",
      },
      website: {
        network: "linktree",
        bgColor: "bg-green-50",
        iconBg: "#10b981",
        customIcon: true,
      },
      twitch: { network: "twitch", bgColor: "bg-purple-50", iconBg: "#9146ff" },
      discord: {
        network: "discord",
        bgColor: "bg-indigo-50",
        iconBg: "#5865f2",
      },
      linktree: {
        network: "linktree",
        bgColor: "bg-green-50",
        iconBg: "#39e09b",
      },
    };
    return (
      socialInfo[platform] || {
        network: "website",
        bgColor: "bg-gray-50",
        iconBg: "#6b7280",
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 mb-16 md:mb-0">
      {/* Canonical URL for SEO */}
      <link
        rel="canonical"
        href={`${
          process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
        }/profile/${id}`}
      />

      {/* Header Section */}
      <div className="md:bg-gradient-to-r from-base-100 via-base-200 to-primary text-primary shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <ProfilePictureUpload
                currentUser={user}
                onUpdate={handleProfileUpdate}
                size="lg"
                showUserInfo={false}
                className=""
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-6">
                <h1 className="text-4xl lg:text-5xl font-bold">
                  {user.username}
                </h1>
                <div className="badge badge-warning badge-lg border-0 whitespace-nowrap text-xs sm:text-sm">
                  <Award size={16} className="mr-1" />
                  {getBadge(mapCount)}
                </div>

                {/* Follow Button - Only show if user is logged in and not viewing their own profile */}
                {isAuthenticated &&
                  currentUser?._id !== data?.data?.user?._id && (
                    <button
                      onClick={() => followMutation.mutate()}
                      disabled={followMutation.isPending}
                      className={`btn btn-lg ${
                        followingData?.isFollowing
                          ? "btn-outline btn-error"
                          : "btn-primary"
                      } gap-2`}
                    >
                      {followMutation.isPending ? (
                        <div className="loading loading-spinner loading-sm"></div>
                      ) : followingData?.isFollowing ? (
                        <>
                          <UserMinus size={20} />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus size={20} />
                          Follow
                        </>
                      )}
                    </button>
                  )}
              </div>

              {/* Stats Row */}
              <div className="flex justify-center lg:justify-start gap-8 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MapPin size={20} className="text-primary" />
                    <div className="text-3xl font-bold">{stats.totalMaps}</div>
                  </div>
                  <div className="text-primary text-sm">Maps</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users size={20} className="text-primary" />
                    <div className="text-3xl font-bold">{stats.followers}</div>
                  </div>
                  <div className="text-primary text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <User size={20} className="text-primary" />
                    <div className="text-3xl font-bold">{stats.following}</div>
                  </div>
                  <div className="text-primary text-sm">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - About & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Section */}
            <div className="bg-base-300 rounded-2xl shadow-lg p-6 border border-base-neutral">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User size={20} className="text-primary" />
                About {user.username}
              </h3>

              {user.bio ? (
                <p className="text-neutral-500 leading-relaxed">{user.bio}</p>
              ) : (
                <p className="text-neutral-500 italic">No bio available</p>
              )}
            </div>

            {/* User Stats */}
            <div className="bg-base-300 rounded-2xl shadow-lg p-6 border border-base-content">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe size={20} className="text-primary" />
                Profile Stats
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Member Since</span>
                  <span className="font-semibold text-neutral-400">
                    {new Date(user.createdDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Mapping Level</span>
                  <div className="text-right">
                    <div className="badge badge-success badge-sm whitespace-nowrap text-xs">
                      {getBadge(mapCount)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Public Maps</span>
                  <span className="font-semibold text-accent ">
                    {maps.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Visited Countries */}
            {shouldShowVisited && (
              <div className="bg-base-300 rounded-2xl shadow-lg p-6 border border-base-content">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Plane size={20} className="text-primary" />
                  Visited Countries
                  <span className="badge badge-accent text-sm">
                    {visitedCountries.length} 
                  </span>
                </h3>

                <div className="space-y-4">
                  <ProfileVisitedCountries data={visitedCountries} />
                </div>
              </div>
            )}

            {/* Social Media Links */}
            {user.socialMedia &&
              Object.values(user.socialMedia).some((link) => link) && (
                <div className="bg-base-300 rounded-2xl shadow-lg p-6 border border-base-neutral">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-primary" />
                    Social Media
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(user.socialMedia).map(
                      ([platform, link]) => {
                        if (!link) return null;

                        const { network, bgColor, iconBg, customIcon } =
                          getSocialMediaInfo(platform);
                        const platformName =
                          platform.charAt(0).toUpperCase() + platform.slice(1);

                        return (
                          <a
                            key={platform}
                            href={
                              platform === "discord"
                                ? `https://discord.com/users/${link}`
                                : link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 ${bgColor} hover:scale-105`}
                          >
                            <div className="flex-shrink-0">
                              {customIcon ? (
                                <div
                                  className="w-5 h-5 rounded flex items-center justify-center"
                                  // style={{ backgroundColor: iconBg }}
                                >
                                  <Globe
                                    size={16}
                                    className="w-5 h-5 text-green-600"
                                  />
                                </div>
                              ) : (
                                <SocialIcon
                                  network={network}
                                  fgColor="white"
                                  bgColor={iconBg}
                                  style={{ width: 20, height: 20 }}
                                  as="div"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-800 truncate">
                                {platformName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {platform === "discord"
                                  ? link
                                  : new URL(link).hostname}
                              </p>
                            </div>
                            <ExternalLink
                              size={16}
                              className="text-gray-400 flex-shrink-0"
                            />
                          </a>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Right Column - Maps */}
          <div className="lg:col-span-2">
            <div className="bg-base-300 rounded-2xl shadow-lg p-6 border border-base-neutral">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold  flex items-center gap-3">
                    <Map className="text-primary" size={28} />
                    Public Maps
                  </h2>
                  <p className="text-neutral-500 mt-1">
                    Discover the amazing places {user.username} has mapped
                  </p>
                </div>
                <div className="badge badge-primary badge-lg whitespace-nowrap text-xs sm:text-sm">
                  {maps.length} {maps.length === 1 ? "map" : "maps"}
                </div>
              </div>

              {maps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    No Public Maps Yet
                  </h3>
                  <p className="text-base-content/80 max-w-md mx-auto">
                    {user.username} hasn't shared any public maps yet. Check
                    back later to see their amazing discoveries!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {maps.map((map) => (
                    <MapCard key={map._id} map={map} showActions={true} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
