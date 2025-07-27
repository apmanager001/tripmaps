import { MetadataRoute } from "next";

interface MapData {
  _id: string;
  updatedAt?: string;
  createdAt: string;
}

interface UserData {
  username: string;
  updated_at?: string;
  createdDate: string;
}

interface POIData {
  locationName: string;
  date_visited?: string;
  createdAt: string;
}

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
  const dynamicPages: MetadataRoute.Sitemap = [];

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
        const mapPages = mapsData.data.map((map: MapData) => {
          const dateString = map.updatedAt || map.createdAt;
          const lastModified = dateString ? new Date(dateString) : new Date();

          // Validate date
          if (isNaN(lastModified.getTime())) {
            return {
              url: `${baseUrl}/maps/${map._id}`,
              lastModified: new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.7,
            };
          }

          return {
            url: `${baseUrl}/maps/${map._id}`,
            lastModified,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          };
        });
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
        const profilePages = usersData.data.map((user: UserData) => {
          const dateString = user.updated_at || user.createdDate;
          const lastModified = dateString ? new Date(dateString) : new Date();

          // Validate date
          if (isNaN(lastModified.getTime())) {
            return {
              url: `${baseUrl}/profile/${user.username}`,
              lastModified: new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.6,
            };
          }

          return {
            url: `${baseUrl}/profile/${user.username}`,
            lastModified,
            changeFrequency: "weekly" as const,
            priority: 0.6,
          };
        });
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
        const poiPages = poisData.data.map((poi: POIData) => {
          const dateString = poi.date_visited || poi.createdAt;
          const lastModified = dateString ? new Date(dateString) : new Date();

          // Validate date
          if (isNaN(lastModified.getTime())) {
            return {
              url: `${baseUrl}/point_of_interest/${encodeURIComponent(
                poi.locationName
              )}`,
              lastModified: new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.5,
            };
          }

          return {
            url: `${baseUrl}/point_of_interest/${encodeURIComponent(
              poi.locationName
            )}`,
            lastModified,
            changeFrequency: "weekly" as const,
            priority: 0.5,
          };
        });
        dynamicPages.push(...poiPages);
      }
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap entries:", error);
  }

  return [...staticPages, ...dynamicPages];
}
