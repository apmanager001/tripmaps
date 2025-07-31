"use client";
import Link from "next/link";
import { Home, Map, ArrowLeft, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function NotFound() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Map size={48} className="text-white" />
          </div>
          <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Oops! It looks like you&apos;ve wandered off the map. The page
            you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800">
            Here are some places you can explore:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <Home size={20} className="text-blue-600" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              href="/maps"
              className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <Map size={20} className="text-green-600" />
              <span className="font-medium">Explore Maps</span>
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <User size={20} className="text-purple-600" />
                  <span className="font-medium">Dashboard</span>
                </Link>

                <Link
                  href={`/profile/${user._id}`}
                  className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <User size={20} className="text-orange-600" />
                  <span className="font-medium">My Profile</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            <Home size={20} />
            <span>Go Home</span>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-4 bg-white/50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
          <p className="text-sm text-gray-600 mb-3">
            If you believe this is an error, please contact our support team.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a
              href="mailto:support@mytripmaps.com"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Contact Support
            </a>
            <span className="text-gray-400">•</span>
            <Link
              href="/about"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
