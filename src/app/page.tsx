import type { Metadata } from "next";
import Hero from "@/components/homepage/hero";
import About from "@/components/homepage/about";
import PopularMaps from "@/components/homepage/popularMaps";
import PopularLocations from "@/components/homepage/popularLocations";
import TopUsers from "@/components/homepage/topUsers";
import { generateMetadata, seoConfigs } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfigs.home);

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <PopularMaps />
      <PopularLocations />
      <TopUsers />
    </>
  );
}
