"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { homepageApi } from "@/lib/api";
import POICard from "@/components/POICard";

const fetchPopularPOIs = async () => {
  const response = await homepageApi.getPopularPOIs();
  return response.data || [];
};

export default function PopularLocations() {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["popularPOIs"],
    queryFn: fetchPopularPOIs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading)
    return (
      <section className="my-12 px-6 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-6">Trending POIs</h2>
        <div className="text-center">Loading popular POIs...</div>
      </section>
    );

  if (error)
    return (
      <section className="my-12 px-6 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-6">Trending POIs</h2>
        <div className="text-center text-error">Failed to load POIs</div>
      </section>
    );

  if (!data || data.length === 0) {
    return (
      <section className="my-12 px-6 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-6">Trending POIs</h2>
        <div className="text-center text-neutral-500">
          No POIs available yet.
        </div>
      </section>
    );
  }

  return (
    <section
      className="my-12 px-6 flex flex-col justify-center items-center"
      id="popular-locations"
    >
      <h2 className="text-2xl font-semibold mb-6">Trending POIs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl w-full">
        {data.map((poi) => (
          <POICard
            key={poi._id}
            poi={poi}
            showActions={false}
            showLikeButton={true}
            showFlagButton={false}
            compact={true}
            className="cursor-pointer"
            onClick={() => router.push(`/point_of_interest/${poi._id}`)}
          />
        ))}
      </div>
    </section>
  );
}
