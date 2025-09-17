import PointOfInterest from "../comp/pointOfInterest";

// Generate metadata for the POI page
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const poiName = decodeURIComponent(resolvedParams.id);

  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND
      }/pois/search?locationName=${encodeURIComponent(poiName)}&limit=1`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        const poi = data.data[0];
        return {
          title: `${poiName} - Travel Maps | My Trip Maps`,
          description: `Discover all travel maps featuring ${poiName}. Explore travel itineraries, locations, and experiences shared by the TripMaps community.`,
          keywords: [
            poiName,
            "travel maps",
            "travel destinations",
            "trip planning",
            "travel inspiration",
            "GPS coordinates",
            "travel community",
          ],
          openGraph: {
            title: `${poiName} - Travel Maps | My Trip Maps`,
            description: `Discover all travel maps featuring ${poiName}. Explore travel itineraries, locations, and experiences shared by the TripMaps community.`,
            type: "website",
            images: poi.heroImage ? [poi.heroImage] : ["/tripmap.webp"],
          },
          twitter: {
            card: "summary_large_image",
            title: `${poiName} - Travel Maps | My Trip Maps`,
            description: `Discover all travel maps featuring ${poiName}. Explore travel itineraries, locations, and experiences shared by the TripMaps community.`,
          },
          alternates: {
            canonical: `/point_of_interest/${encodeURIComponent(poiName)}`,
          },
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-video-preview": -1,
              "max-image-preview": "large",
              "max-snippet": -1,
            },
          },
        };
      }
    }
  } catch (error) {
    console.error("Error fetching POI data for SEO:", error);
  }

  // Fallback metadata if POI data can't be fetched
  return {
    title: `${poiName} - Travel Maps | My Trip Maps`,
    description: `Discover all travel maps featuring ${poiName}. Explore travel itineraries, locations, and experiences shared by the TripMaps community.`,
    alternates: {
      canonical: `/point_of_interest/${encodeURIComponent(poiName)}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function POIPage({ params }) {
  const resolvedParams = await params;
  return <PointOfInterest poiId={resolvedParams.id} />;
}
