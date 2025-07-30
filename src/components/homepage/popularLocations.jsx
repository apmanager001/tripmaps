"use client";
import { useQuery } from "@tanstack/react-query";
import { homepageApi } from "@/lib/api";
import Link from "next/link";

const fetchPopularLocations = async () => {
  const response = await homepageApi.getPopularLocations();
  return response.data || [];
};

export default function PopularLocations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["popularLocations"],
    queryFn: fetchPopularLocations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading)
    return (
      <section className="my-12 px-6 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-4">Trending Locations</h2>
        <div className="text-center">Loading locations...</div>
      </section>
    );

  if (error)
    return (
      <section className="my-12 px-6 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-4">Trending Locations</h2>
        <div className="text-center text-error">Failed to load locations</div>
      </section>
    );

  if (!data || data.length === 0) {
    return (
      <section className="my-12 px-6 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-4">Trending Locations</h2>
        <div className="text-center text-neutral-500">
          No locations available yet.
        </div>
      </section>
    );
  }

  return (
    <section
      className="my-12 px-6 flex flex-col justify-center items-center"
      id="popular-locations"
    >
      <h2 className="text-2xl font-semibold mb-4">Trending Locations</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {data.map((loc) => (
          <Link
            key={loc.locationName}
            href={`/point_of_interest/${encodeURIComponent(loc.locationName)}`}
            className="truncate badge badge-primary badge-lg hover:badge-primary-focus transition-colors cursor-pointer"
          >
            {loc.locationName}
            <span className="ml-2 badge badge-secondary badge-sm">
              {loc.likes}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
