"use client";
import { User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../store/useAuthStore";
import { useVerifyUser } from "../utility/tanstack/verifyUser";

export default function UserStatus() {
  const { user } = useAuthStore();
  const { isLoading, isError } = useVerifyUser();

  if (isLoading) {
    return <span className="text-neutral-500">Checking status...</span>;
  }

  return (
    <div className="flex">
      {user ? (
        <Link href="/dashboard" className="flex gap-2">
          <UserIcon size={24} className="text-primary" />
          <span className="text-md">{user.username}</span>
        </Link>
      ) : (
        <Link href="/login" className="btn btn-accent rounded-xl">Login / Register</Link>
      )}
    </div>
  );
}
