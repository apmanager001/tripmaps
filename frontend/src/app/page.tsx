import type { Metadata } from "next";
import HeroSection from "@/components/homepage/heroSection";
import About from "@/components/homepage/about";
import Statistics from "@/components/homepage/statistics";
import PopularMaps from "@/components/homepage/popularMaps";
import PopularLocations from "@/components/homepage/popularLocations";
import TopUsers from "@/components/homepage/topUsers";
import { generateMetadata, seoConfigs } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfigs.home);

export default function Home() {
  return (
    <>
      <HeroSection />
      <About />
      <PopularMaps />
      <PopularLocations />
      <TopUsers />
      {/* <Statistics /> */}
    </>
  );
}
