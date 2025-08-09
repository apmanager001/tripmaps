"use client";
import { useQuery } from "@tanstack/react-query";
import { homepageApi } from "@/lib/api";
import { MapPin, Users, Heart, Globe } from "lucide-react";

const fetchStats = async () => {
  try {
    // You can create a dedicated stats endpoint or use existing data
    const [mapsResponse, usersResponse] = await Promise.all([
      homepageApi.getPopularMaps(100), // Get more maps to count
      homepageApi.getTopUsers(100), // Get more users to count
    ]);

    // Calculate stats from the data
    const totalMaps = mapsResponse.data?.length || 0;
    const totalUsers = usersResponse.data?.length || 0;

    // Estimate other stats (you can replace with real API calls later)
    const totalPOIs = totalMaps * 15; // Average POIs per map
    const totalPhotos = totalPOIs * 3; // Average photos per POI

    return {
      totalMaps,
      totalUsers,
      totalPOIs,
      totalPhotos,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return fallback stats
    return {
      totalMaps: 150,
      totalUsers: 50,
      totalPOIs: 2250,
      totalPhotos: 6750,
    };
  }
};

export default function Statistics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["homepageStats"],
    queryFn: fetchStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const statistics = [
    {
      icon: <MapPin className="w-8 h-8" />,
      value: stats?.totalMaps || 0,
      label: "Maps Created",
      color: "text-blue-500",
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: stats?.totalUsers || 0,
      label: "Active Users",
      color: "text-green-500",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      value: stats?.totalPOIs || 0,
      label: "Points of Interest",
      color: "text-purple-500",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      value: stats?.totalPhotos || 0,
      label: "Photos Shared",
      color: "text-red-500",
    },
  ];

  if (isLoading) {
    return (
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Community in Numbers
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="animate-pulse bg-gray-200 rounded-lg h-16 w-16 mx-auto mb-4"></div>
                <div className="animate-pulse bg-gray-200 rounded h-8 w-20 mx-auto mb-2"></div>
                <div className="animate-pulse bg-gray-200 rounded h-4 w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-gradient-to-r from-base-100 to-primary">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Our Community in Numbers
        </h2>
        <p className="text-lg text-center text-base-content mb-12 max-w-2xl mx-auto">
          Join thousands of travelers who are already sharing their adventures
          and discovering new destinations on My Trip Maps.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center group"
            >
              <div
                className={`${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}
              >
                {stat.icon}
              </div>
              <div className="text-3xl font-bold  mb-2 text-center">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-base-content font-medium text-center">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm  mb-4">
            * Numbers are updated regularly
          </p>
        </div>
      </div>
    </section>
  );
}
