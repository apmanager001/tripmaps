"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CircleUser } from "lucide-react";
import { userApi } from "@/lib/api";

const fetchTopUsers = async () => {
  const response = await userApi.getTopUsers(10);
  return response.data || [];
};

export default function TopUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["topUsers"],
    queryFn: fetchTopUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading)
    return (
      <section className="my-12 px-6">
        <h2 className="text-2xl font-semibold mb-4">Top Contributors</h2>
        <div className="text-center">Loading top users...</div>
      </section>
    );

  if (error)
    return (
      <section className="my-12 px-6">
        <h2 className="text-2xl font-semibold mb-4">Top Contributors</h2>
        <div className="text-center text-error">Failed to load top users</div>
      </section>
    );

  if (!data || data.length === 0) {
    return (
      <section className="my-12 px-6">
        <h2 className="text-2xl font-semibold mb-4">Top Contributors</h2>
        <div className="text-center text-neutral-500">
          No users available yet.
        </div>
      </section>
    );
  }

  return (
    <section className="my-12 px-6" id="top-users">
      <h2 className="text-2xl font-semibold mb-6">Top Contributors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center items-center">
        {data.slice(0, 12).map((user) => (
          <Link
            key={user._id}
            href={`/profile/${user.username}`}
            className="bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105 p-4 text-center cursor-pointer w-32 "
          >
            <div className="flex flex-col items-center gap-3">
              <div className="avatar">
                <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center bg-primary text-primary-content">
                  <CircleUser className="w-16 h-16" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="font-semibold text-lg">{user.username}</p>
                <div className="flex flex-col gap-1 text-sm text-neutral-600">
                  <span>
                    {user.mapCount || user.mapsCount || 0} maps shared
                  </span>
                  <span>{user.totalViews || 0} total views</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
