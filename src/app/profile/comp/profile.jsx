"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
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
} from "lucide-react";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import MapCard from "@/components/MapCard";
import { userApi, mapApi } from "@/lib/api";

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

  const { data, isLoading, error } = useQuery({
    queryKey: ["profileData", id],
    queryFn: () => fetchProfileData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );

  const { user, maps, stats } = data.data;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-base-100 via-base-200 to-primary text-primary shadow-xl">
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
                <div className="badge badge-warning badge-lg text-white border-0">
                  <Award size={16} className="mr-1" />
                  {getBadge(mapCount)}
                </div>
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                About {user.username}
              </h3>

              {user.bio ? (
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              ) : (
                <p className="text-gray-500 italic">No bio available</p>
              )}
            </div>

            {/* User Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe size={20} className="text-green-600" />
                Profile Stats
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(user.createdDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mapping Level</span>
                  <div className="text-right">
                    <div className="badge badge-success badge-sm">
                      {getBadge(mapCount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {mapCount} {mapCount === 1 ? "map" : "maps"} created
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Public Maps</span>
                  <span className="font-semibold text-blue-600">
                    {maps.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Maps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Map className="text-blue-600" size={28} />
                    Public Maps
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Discover the amazing places {user.username} has mapped
                  </p>
                </div>
                <div className="badge badge-primary badge-lg">
                  {maps.length} {maps.length === 1 ? "map" : "maps"}
                </div>
              </div>

              {maps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No Public Maps Yet
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
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
