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
      priority: 1.0,
    },
    {
      url: `${baseUrl}/maps`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/gettingStarted`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/creatingMaps`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/addingPois`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/editingPois`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/photoUpload`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/mapInterface`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/sharingMaps`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/mobileLimitations`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    // Note: Login and register pages are intentionally excluded from sitemap
    // as they are user-specific and shouldn't be indexed for SEO
  ];

  // Dynamic pages - fetch from API
  const dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // Fetch public maps for sitemap (increased limit for better SEO coverage)
    const mapsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/maps/popular?limit=500`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
        headers: {
          Accept: "application/json",
          "User-Agent": "MyTripMaps-Sitemap-Generator",
        },
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
              priority: 0.8,
            };
          }

          return {
            url: `${baseUrl}/maps/${map._id}`,
            lastModified,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          };
        });
        dynamicPages.push(...mapPages);
        console.log(`Added ${mapPages.length} map pages to sitemap`);
      }
    } else {
      console.warn(`Failed to fetch maps for sitemap: ${mapsRes.status}`);
    }

    // Fetch public profiles for sitemap (increased limit for better coverage)
    const usersRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/users/top?limit=200`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          Accept: "application/json",
          "User-Agent": "MyTripMaps-Sitemap-Generator",
        },
      }
    );

    if (usersRes.ok) {
      const usersData = await usersRes.json();
      if (usersData.success && usersData.data) {
        const profilePages = usersData.data.map((user: UserData) => {
          const dateString = user.updated_at || user.createdDate;
          const lastModified = dateString ? new Date(dateString) : new Date();

          // Validate date and username
          if (isNaN(lastModified.getTime()) || !user.username) {
            return {
              url: `${baseUrl}/profile/${encodeURIComponent(
                user.username || "unknown"
              )}`,
              lastModified: new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.6,
            };
          }

          return {
            url: `${baseUrl}/profile/${encodeURIComponent(user.username)}`,
            lastModified,
            changeFrequency: "weekly" as const,
            priority: 0.6,
          };
        });
        dynamicPages.push(...profilePages);
        console.log(`Added ${profilePages.length} profile pages to sitemap`);
      }
    } else {
      console.warn(`Failed to fetch users for sitemap: ${usersRes.status}`);
    }

    // Fetch popular POIs for sitemap (increased limit for better coverage)
    const poisRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/pois/popular-locations?limit=300`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          Accept: "application/json",
          "User-Agent": "MyTripMaps-Sitemap-Generator",
        },
      }
    );

    if (poisRes.ok) {
      const poisData = await poisRes.json();
      if (poisData.success && poisData.data) {
        const poiPages = poisData.data
          .filter((poi: POIData) => poi.locationName) // Only include POIs with valid names
          .map((poi: POIData) => {
            const dateString = poi.date_visited || poi.createdAt;
            const lastModified = dateString ? new Date(dateString) : new Date();

            // Validate date
            if (isNaN(lastModified.getTime())) {
              return {
                url: `${baseUrl}/point_of_interest/${encodeURIComponent(
                  poi.locationName
                )}`,
                lastModified: new Date(),
                changeFrequency: "monthly" as const,
                priority: 0.6,
              };
            }

            return {
              url: `${baseUrl}/point_of_interest/${encodeURIComponent(
                poi.locationName
              )}`,
              lastModified,
              changeFrequency: "monthly" as const,
              priority: 0.6,
            };
          });
        dynamicPages.push(...poiPages);
        console.log(`Added ${poiPages.length} POI pages to sitemap`);
      }
    } else {
      console.warn(`Failed to fetch POIs for sitemap: ${poisRes.status}`);
    }

    // Try to fetch recent maps for better coverage
    const recentMapsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/maps/search?sort=recent&limit=100`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
        headers: {
          Accept: "application/json",
          "User-Agent": "MyTripMaps-Sitemap-Generator",
        },
      }
    );

    if (recentMapsRes.ok) {
      const recentMapsData = await recentMapsRes.json();
      if (recentMapsData.success && recentMapsData.data?.maps) {
        const recentMapPages = recentMapsData.data.maps
          .filter((map: MapData) => map._id) // Ensure we have valid map IDs
          .map((map: MapData) => {
            const dateString = map.updatedAt || map.createdAt;
            const lastModified = dateString ? new Date(dateString) : new Date();

            return {
              url: `${baseUrl}/maps/${map._id}`,
              lastModified: isNaN(lastModified.getTime())
                ? new Date()
                : lastModified,
              changeFrequency: "weekly" as const,
              priority: 0.7,
            };
          });

        // Add only unique maps that aren't already in the popular maps
        const existingMapIds = new Set(
          dynamicPages
            .filter((page: MetadataRoute.Sitemap[0]) =>
              page.url.includes("/maps/")
            )
            .map(
              (page: MetadataRoute.Sitemap[0]) => page.url.split("/maps/")[1]
            )
        );

        const uniqueRecentMaps = recentMapPages.filter(
          (page: MetadataRoute.Sitemap[0]) =>
            !existingMapIds.has(page.url.split("/maps/")[1])
        );

        if (uniqueRecentMaps.length > 0) {
          dynamicPages.push(...uniqueRecentMaps);
          console.log(
            `Added ${uniqueRecentMaps.length} additional recent map pages to sitemap`
          );
        }
      }
    } else {
      console.warn(
        `Failed to fetch recent maps for sitemap: ${recentMapsRes.status}`
      );
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap entries:", error);
    console.error("Falling back to static pages only");
  }

  const allPages = [...staticPages, ...dynamicPages];
  console.log(
    `Sitemap generated with ${allPages.length} total pages (${staticPages.length} static, ${dynamicPages.length} dynamic)`
  );

  return allPages;
}
