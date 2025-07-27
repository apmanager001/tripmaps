import type { Metadata } from "next";
import IndividualMap from "../comp/individualMap";
import { generateMapMetadata } from "@/lib/seo";

interface MapPageProps {
  params: { id: string };
}

// Generate metadata for the map page
export async function generateMetadata({
  params,
}: MapPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/map/${resolvedParams.id}`,
      { next: { revalidate: 1800 } } // Cache for 30 minutes
    );

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.map) {
        return generateMapMetadata(data.data.map);
      }
    }
  } catch (error) {
    console.error("Error fetching map data for SEO:", error);
  }

  // Fallback metadata if map data can't be fetched
  return {
    title: "Travel Map | My Trip Maps",
    description:
      "Explore this interactive travel map on My Trip Maps. Discover locations, get travel inspiration, and see how travelers document their journeys.",
  };
}

export default async function MapPage({ params }: MapPageProps) {
  const resolvedParams = await params;
  return <IndividualMap id={resolvedParams.id} />;
}
