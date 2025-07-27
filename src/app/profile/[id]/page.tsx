import type { Metadata } from "next";
import Profile from "../comp/profile";
import { generateProfileMetadata } from "@/lib/seo";

interface ProfilePageProps {
  params: { id: string };
}

// Generate metadata for the profile page
export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/profile/${resolvedParams.id}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.user) {
        return generateProfileMetadata(resolvedParams.id, data.data.user);
      }
    }
  } catch (error) {
    console.error("Error fetching profile data for SEO:", error);
  }

  // Fallback metadata if user data can't be fetched
  return generateProfileMetadata(resolvedParams.id);
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  return <Profile id={resolvedParams.id} />;
}
