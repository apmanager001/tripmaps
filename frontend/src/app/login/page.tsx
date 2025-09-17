import type { Metadata } from "next";
import Login from "./comp/login";
import { generateMetadata, seoConfigs } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfigs.login);

export default function LoginPage() {
  return <Login />;
}
