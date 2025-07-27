import { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = "/tripmap.webp",
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
  } = config;

  const fullTitle = `${title} | My Trip Maps`;
  const fullDescription =
    description.length > 160
      ? description.substring(0, 157) + "..."
      : description;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com";

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      "travel maps",
      "photo mapping",
      "trip planning",
      "travel journal",
      "GPS coordinates",
      "travel memories",
      "interactive maps",
      "travel community",
      "photo metadata",
      "travel storytelling",
      ...keywords,
    ],
    authors: author ? [{ name: author }] : undefined,
    creator: "My Trip Maps",
    publisher: "My Trip Maps",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url ? `${baseUrl}${url}` : undefined,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: url ? `${baseUrl}${url}` : baseUrl,
      siteName: "My Trip Maps",
      images: [
        {
          url: image.startsWith("http") ? image : `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type,
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [image.startsWith("http") ? image : `${baseUrl}${image}`],
      creator: "@mytripmaps",
      site: "@mytripmaps",
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
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
    other: {
      "theme-color": "#3B82F6",
      "color-scheme": "light dark",
    },
  };
}

// Predefined SEO configurations for common pages
export const seoConfigs = {
  home: {
    title: "My Trip Maps - Transform Photos into Interactive Travel Maps",
    description:
      "Create interactive travel maps from your photos. Upload images, extract GPS coordinates, and build shareable travel stories. Join our community of travelers and map your adventures.",
    keywords: [
      "travel maps",
      "photo mapping",
      "GPS coordinates",
      "travel journal",
    ],
    url: "/",
  },
  login: {
    title: "Login - My Trip Maps",
    description:
      "Sign in to your My Trip Maps account to access your travel maps, create new adventures, and share your journeys with the community.",
    url: "/login",
  },
  register: {
    title: "Join My Trip Maps - Create Your Travel Story",
    description:
      "Create your free My Trip Maps account and start transforming your travel photos into interactive maps. Join thousands of travelers sharing their adventures.",
    url: "/register",
  },
  maps: {
    title: "Explore Travel Maps - My Trip Maps",
    description:
      "Discover amazing travel maps created by our community. Explore destinations, get inspired by other travelers, and find your next adventure.",
    url: "/maps",
  },
  about: {
    title: "About My Trip Maps - Your Travel Story Platform",
    description:
      "Learn about My Trip Maps, the platform that transforms your travel photos into interactive maps. Discover how we help travelers share their adventures.",
    url: "/about",
  },
  contact: {
    title: "Contact Us - My Trip Maps",
    description:
      "Get in touch with the My Trip Maps team. We're here to help you create amazing travel maps and share your adventures.",
    url: "/contact",
  },
  privacy: {
    title: "Privacy Policy - My Trip Maps",
    description:
      "Learn how My Trip Maps protects your privacy and handles your personal data. Read our comprehensive privacy policy.",
    url: "/privacy",
  },
  terms: {
    title: "Terms of Service - My Trip Maps",
    description:
      "Read the terms and conditions for using My Trip Maps. Understand your rights and responsibilities as a user of our platform.",
    url: "/terms",
  },
};

// Dynamic SEO for profile pages
export function generateProfileMetadata(
  username: string,
  userData?: { bio?: string; profileImage?: string }
): Metadata {
  const title = userData?.bio
    ? `${username}'s Travel Maps - ${userData.bio.substring(0, 50)}...`
    : `${username}'s Travel Maps - My Trip Maps Community`;

  const description = userData?.bio
    ? `Explore ${username}'s travel adventures on My Trip Maps. ${userData.bio} View their interactive travel maps and get inspired for your next journey.`
    : `Discover ${username}'s travel maps and adventures on My Trip Maps. Explore their destinations, get travel inspiration, and see how they document their journeys.`;

  return generateMetadata({
    title,
    description,
    keywords: [
      "travel maps",
      username,
      "travel community",
      "travel inspiration",
    ],
    url: `/profile/${username}`,
    type: "profile",
    author: username,
    image: userData?.profileImage || "/tripmap.webp",
  });
}

// Dynamic SEO for individual map pages
export function generateMapMetadata(mapData: {
  mapName: string;
  user_id?: { username: string };
  pois?: Array<{ tags?: string[] }>;
  _id: string;
  createdAt: string;
  updatedAt: string;
}): Metadata {
  const title = `${mapData.mapName} - Travel Map by ${
    mapData.user_id?.username || "Unknown"
  }`;
  const description = `Explore ${mapData.mapName}, a travel map created by ${
    mapData.user_id?.username || "Unknown"
  }. Discover ${
    mapData.pois?.length || 0
  } locations and get inspired for your own adventures.`;

  return generateMetadata({
    title,
    description,
    keywords: [
      mapData.mapName,
      "travel map",
      mapData.user_id?.username,
      "travel destinations",
      "GPS coordinates",
    ],
    url: `/maps/${mapData._id}`,
    type: "article",
    author: mapData.user_id?.username,
    publishedTime: mapData.createdAt,
    modifiedTime: mapData.updatedAt,
    tags:
      mapData.pois
        ?.map((poi) => poi.tags)
        .flat()
        .filter(Boolean) || [],
  });
}
