import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  // Dynamic pages - fetch from API
  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // Fetch public maps for sitemap
    const mapsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/maps/popular?limit=100`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (mapsRes.ok) {
      const mapsData = await mapsRes.json();
      if (mapsData.success && mapsData.data) {
        const mapPages = mapsData.data.map((map: any) => ({
          url: `${baseUrl}/maps/${map._id}`,
          lastModified: new Date(map.updatedAt || map.createdAt),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
        dynamicPages.push(...mapPages);
      }
    }

    // Fetch public profiles for sitemap
    const usersRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/users/top?limit=50`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (usersRes.ok) {
      const usersData = await usersRes.json();
      if (usersData.success && usersData.data) {
        const profilePages = usersData.data.map((user: any) => ({
          url: `${baseUrl}/profile/${user.username}`,
          lastModified: new Date(user.updated_at || user.createdDate),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
        dynamicPages.push(...profilePages);
      }
    }

    // Fetch popular POIs for sitemap
    const poisRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/pois/popular-locations`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (poisRes.ok) {
      const poisData = await poisRes.json();
      if (poisData.success && poisData.data) {
        const poiPages = poisData.data.map((poi: any) => ({
          url: `${baseUrl}/point_of_interest/${encodeURIComponent(
            poi.locationName
          )}`,
          lastModified: new Date(poi.date_visited || poi.createdAt),
          changeFrequency: "weekly" as const,
          priority: 0.5,
        }));
        dynamicPages.push(...poiPages);
      }
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap entries:", error);
  }

  return [...staticPages, ...dynamicPages];
}
