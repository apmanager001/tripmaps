import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const poiName = decodeURIComponent(id);

  return {
    title: `Maps with ${poiName} - TripMaps`,
    description: `Discover all maps featuring ${poiName}. Explore travel itineraries, locations, and experiences shared by the TripMaps community.`,
    keywords: `${poiName}, travel maps, trip planning, travel itineraries, points of interest, TripMaps`,
    openGraph: {
      title: `Maps with ${poiName} - TripMaps`,
      description: `Discover all maps featuring ${poiName}. Explore travel itineraries, locations, and experiences shared by the TripMaps community.`,
      type: "website",
      url: `https://tripmaps.com/point_of_interest/${encodeURIComponent(
        poiName
      )}`,
      images: [
        {
          url: "/tripmap.webp",
          width: 1200,
          height: 630,
          alt: `TripMaps - ${poiName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Maps with ${poiName} - TripMaps`,
      description: `Discover all maps featuring ${poiName}. Explore travel itineraries, locations, and experiences shared by the TripMaps community.`,
      images: ["/tripmap.webp"],
    },
    alternates: {
      canonical: `https://tripmaps.com/point_of_interest/${encodeURIComponent(
        poiName
      )}`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
