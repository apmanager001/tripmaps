import type { Metadata } from "next";
import Register from "./comp/register";
import { generateMetadata, seoConfigs } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfigs.register);

export default function RegisterPage() {
  return <Register />;
}
