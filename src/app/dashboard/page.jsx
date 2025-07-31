import React, { Suspense } from "react";
import Dashboard from "./comp/dashboard";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading dashboard...
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
};

export default Page;
