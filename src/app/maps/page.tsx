import type { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import ExploreMapsBrowser from "./comp/exploreMapsBrowser";

// Generate metadata for the maps page
export const metadata: Metadata = generateSEOMetadata({
  title: "Explore Travel Maps - My Trip Maps",
  description:
    "Discover amazing travel maps created by our community. Explore destinations, get inspired by other travelers, and find your next adventure.",
  keywords: [
    "travel maps",
    "explore maps",
    "travel inspiration",
    "destinations",
    "travel community",
    "interactive maps",
    "travel stories",
    "adventure planning",
  ],
  url: "/maps",
});

export default function MapsPage() {
  return <ExploreMapsBrowser />;
}
