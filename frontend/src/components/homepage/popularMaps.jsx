"use client";
import { useQuery } from "@tanstack/react-query";
import { homepageApi } from "@/lib/api";
import MapCard from "@/components/MapCard";

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
      <h2 className="text-2xl font-semibold mb-4 text-center">Popular Maps</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {data.map((map) => (
          <MapCard
            key={map._id}
            map={map}
            showActions={true}
            className="w-full"
          />
        ))}
      </div>
    </section>
  );
}
