"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { homepageApi } from "@/lib/api";

const fetchPopularMaps = async () => {
  const response = await homepageApi.getPopularMaps(10);
  return response.data || [];
};

export default function PopularMaps() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["popularMaps"],
    queryFn: fetchPopularMaps,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading)
    return (
      <section className="my-12 px-6">
        <h2 className="text-2xl font-semibold mb-4">Popular Maps</h2>
        <div className="text-center">Loading maps...</div>
      </section>
    );

  if (error)
    return (
      <section className="my-12 px-6">
        <h2 className="text-2xl font-semibold mb-4">Popular Maps</h2>
        <div className="text-center text-error">Failed to load maps</div>
      </section>
    );

  if (!data || data.length === 0) {
    return (
      <section className="my-12 px-6">
        <h2 className="text-2xl font-semibold mb-4">Popular Maps</h2>
        <div className="text-center text-neutral-500">
          No maps available yet. Be the first to create one!
        </div>
      </section>
    );
  }

  return (
    <section className="my-12 px-6" id="popular-maps">
      <h2 className="text-2xl font-semibold mb-4">Popular Maps</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((map) => (
          <div
            key={map._id}
            className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="card-body">
              <h3 className="card-title">{map.mapName}</h3>
              <p className="text-sm text-neutral-600">
                by{" "}
                <Link
                  href={`/profile/${map.user_id?.username || "unknown"}`}
                  className="text-primary hover:text-primary-focus transition-colors"
                >
                  {map.user_id?.username || "Unknown User"}
                </Link>
              </p>
              <div className="flex gap-2 mt-2">
                <div className="badge badge-info">{map.views || 0} views</div>
                <div className="badge badge-secondary">
                  {map.likes || 0} likes
                </div>
              </div>
              <div className="card-actions justify-end mt-4">
                <Link
                  href={`/maps/${map._id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Map
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
