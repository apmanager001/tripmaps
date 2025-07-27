import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Trip Maps",
    short_name: "TripMaps",
    description: "Transform photos into interactive travel maps",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3B82F6",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/tripmap.webp",
        sizes: "192x192",
        type: "image/webp",
      },
      {
        src: "/tripmap.webp",
        sizes: "512x512",
        type: "image/webp",
      },
    ],
    categories: ["travel", "lifestyle", "productivity"],
    lang: "en",
    scope: "/",
  };
}
