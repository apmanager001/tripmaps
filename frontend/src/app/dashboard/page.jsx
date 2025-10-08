import React, { Suspense } from "react";
import Dashboard from "./comp/dashboard";

export const metadata = {
  title: "Dashboard - My Trip Maps",
  description:
    "Manage your travel maps, create new adventures, and organize your travel memories on My Trip Maps.",
  robots: {
    index: false, // Dashboard should not be indexed
    follow: false,
  },
  alternates: {
    canonical: "/dashboard",
  },
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading dashboard...
        </div>
      }
    >
      <div className='relative'>
        <Dashboard />
      </div>
    </Suspense>
  );
};

export default Page;
