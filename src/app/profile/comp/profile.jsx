"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CircleUser, MapPin, Users, Calendar, Eye, Heart } from "lucide-react";

async function fetchProfileData(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/profile/${id}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
}

export default function Profile({ id }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["profileData", id],
    queryFn: () => fetchProfileData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading)
    return <div className="p-6 text-neutral-500">Loading profile...</div>;
  if (error)
    return (
      <div className="p-6 text-red-500">
        Error loading profile: {error.message}
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

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <section className="flex items-center gap-6 bg-base-200 p-6 rounded-lg shadow">
        <CircleUser size={64} className="text-primary" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary">{user.username}</h1>
          {!user.emailPrivate && (
            <p className="text-sm text-base-content mb-2">{user.email}</p>
          )}
          <span className="badge badge-accent badge-soft">
            {getBadge(mapCount)}
          </span>
        </div>
      </section>

      {/* User Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-base-100 p-4 rounded-lg shadow text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="text-primary" size={20} />
            <span className="text-lg font-semibold">{stats.totalMaps}</span>
          </div>
          <p className="text-sm text-gray-600">Public Maps</p>
        </div>

        <div className="bg-base-100 p-4 rounded-lg shadow text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="text-primary" size={20} />
            <span className="text-lg font-semibold">{stats.followers}</span>
          </div>
          <p className="text-sm text-gray-600">Followers</p>
        </div>

        <div className="bg-base-100 p-4 rounded-lg shadow text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="text-primary" size={20} />
            <span className="text-lg font-semibold">{stats.following}</span>
          </div>
          <p className="text-sm text-gray-600">Following</p>
        </div>
      </section>

      {/* User Bio */}
      {user.bio && (
        <section className="bg-base-100 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-primary mb-3">About</h2>
          <p className="text-base-content">{user.bio}</p>
        </section>
      )}

      {/* Public Maps */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary">Public Maps</h2>
          <span className="badge badge-neutral badge-lg">
            {maps.length} maps
          </span>
        </div>
        {maps.length === 0 ? (
          <div className="bg-base-100 p-6 rounded-lg shadow text-center">
            <MapPin className="mx-auto mb-3 text-gray-400" size={48} />
            <p className="text-lg text-gray-600 mb-2">No public maps yet</p>
            <p className="text-sm text-gray-500">
              This mapper hasn't shared any public maps yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {maps.map((map) => (
              <div
                key={map._id}
                className="bg-base-100 p-6 rounded-lg shadow hover:bg-base-200 transition-colors border border-base-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary mb-3">
                      {map.mapName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {/* Created Date */}
                      <div
                        className="flex items-center gap-1"
                        title="Created on"
                      >
                        <Calendar size={14} />
                        <span>
                          {new Date(map.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Views */}
                      <div
                        className="flex items-center gap-1 tooltip"
                        data-tip="Views"
                        title={`${map.views || 0} views`}
                      >
                        <Eye
                          size={14}
                          className="bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-black"
                        />

                        <span>{map.views || 0}</span>
                      </div>

                      {/* Likes */}
                      <div
                        className="flex items-center gap-1 tooltip"
                        data-tip="Likes"
                        title={`${map.likes || 0} likes`}
                      >
                        <Heart size={14} className="text-red-500" />
                        <span>{map.likes || 0}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/maps/${map._id}`}
                    className="btn btn-primary btn-sm hover:btn-secondary transition-colors"
                    title="View this map"
                  >
                    <MapPin size={16} />
                    View Map
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
