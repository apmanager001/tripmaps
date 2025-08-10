"use client";
import React from "react";
import Link from "next/link";
import {
  Menu,
  User,
  MapPinned,
  LocateFixed,
  Search,
  Settings,
  House,
  Shield,
  Bell,
} from "lucide-react";
import UserStatus from "./userHeader";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertApi } from "@/lib/api";

const NavigationMenu = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDashboardNavigation = (tab) => {
    router.push(`/dashboard?tab=${tab}`);
  };

  // Fetch alert count
  const { data: alertCountData } = useQuery({
    queryKey: ["alertCount", user?._id],
    queryFn: () => alertApi.getAlertCount(user._id),
    enabled: !!user?._id && !!user?.role, // Only run if user has both _id and role
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry on failure to prevent console errors
  });

  // Fetch alerts for dropdown
  const { data: alertsData, isLoading: isAlertsLoading } = useQuery({
    queryKey: ["alerts", user?._id],
    queryFn: () => alertApi.getUserAlerts(user._id, 1, 10),
    enabled: !!user?._id && !!user?.role, // Only run if user has both _id and role
    retry: false, // Don't retry on failure to prevent console errors
  });

  // Mark alert as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (alertId) => alertApi.markAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries(["alertCount", user._id]);
      queryClient.invalidateQueries(["alerts", user._id]);
    },
    onError: (error) => {
      console.error("Error marking alert as read:", error);
    },
  });

  // Mark all alerts as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!user?._id) throw new Error("User ID not available");
      return alertApi.markAllAlertsAsRead(user._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["alertCount", user._id]);
      queryClient.invalidateQueries(["alerts", user._id]);
    },
    onError: (error) => {
      console.error("Error marking all alerts as read:", error);
    },
  });

  const handleMarkAsRead = (alertId) => {
    markAsReadMutation.mutate(alertId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const formatAlertTime = (createdAt) => {
    if (!createdAt) return "Unknown";

    try {
      const date = new Date(createdAt);
      const now = new Date();

      // Check if date is valid
      if (isNaN(date.getTime())) return "Unknown";

      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        return `${Math.floor(diffInHours / 24)}d ago`;
      }
    } catch (error) {
      console.error("Error formatting alert time:", error);
      return "Unknown";
    }
  };

  const dashboardTabs = [
    { name: "My Dashboard", value: "My Profile", icon: <User size={16} /> },
    { name: "POIs", value: "POIs", icon: <LocateFixed size={16} /> },
    { name: "Add Map", value: "Add Map", icon: <MapPinned size={16} /> },
    { name: "Search", value: "Search", icon: <Search size={16} /> },
    { name: "Settings", value: "Settings", icon: <Settings size={16} /> },
    ...(user?.role === "admin"
      ? [{ name: "Admin", value: "Admin", icon: <Shield size={16} /> }]
      : []),
  ];

  const fullMenu = (
    <div className="flex items-center gap-4">
      {user && (
        <>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle relative"
            >
              <Bell size={20} />
              {alertCountData?.data?.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {alertCountData?.data?.unreadCount > 9
                    ? "9+"
                    : alertCountData?.data?.unreadCount}
                </span>
              )}
            </div>
            <div
              tabIndex={0}
              className="dropdown-content z-[9999] menu p-2 shadow bg-base-100 rounded-box w-80"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {(alertCountData?.data?.unreadCount || 0) > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsReadMutation.isPending}
                        className="btn btn-sm btn-ghost text-xs"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                {isAlertsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="loading loading-spinner loading-sm"></div>
                  </div>
                ) : (alertsData?.data?.alerts || []).length > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-2 text-neutral">
                    {(alertsData?.data?.alerts || []).map((alert) => (
                      <div
                        key={alert._id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          alert.isRead
                            ? "bg-base-100 border-base-300"
                            : "bg-blue-50 border-blue-200"
                        }`}
                        onClick={() =>
                          !alert.isRead && handleMarkAsRead(alert._id)
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatAlertTime(alert.createdAt)}
                            </p>
                          </div>
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                )}

                {(alertsData?.data?.alerts || []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <button
                      onClick={() => {
                        router.push("/dashboard?tab=Notifications");
                      }}
                      className="btn btn-sm btn-primary w-full"
                    >
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <UserStatus />
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Toggle Button */}
      <div className="md:hidden flex justify-center items-center gap-4">
        <div className="flex items-center ">{/* <ThemeDropdown /> */}</div>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-square btn-ghost">
            <Menu />
          </div>
          <div
            tabIndex={0}
            className="dropdown-content z-[9999] menu p-2 shadow bg-base-100 rounded-box w-64"
          >
            <div className="p-2">
              {user ? (
                <div className="space-y-1">
                  {/* User Info */}
                  <div className="flex items-center gap-2 p-2 border-b border-base-300">
                    <User size={20} className="text-primary" />
                    <span className="font-semibold">{user.username}</span>
                  </div>

                  {/* Dashboard Navigation */}
                  <div className="py-2">
                    <div className="text-xs font-semibold text-base-content/70 px-2 mb-1">
                      Dashboard
                    </div>
                    {dashboardTabs.map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => handleDashboardNavigation(tab.value)}
                        className="flex items-center w-full px-2 py-2 text-left hover:bg-base-200 rounded transition-colors text-sm"
                      >
                        <span className="mr-2 text-primary">{tab.icon}</span>
                        <span>{tab.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Other Links */}
                  <div className="border-t border-base-300 pt-2">
                    <Link
                      href={`/profile/${user.username}`}
                      className="flex items-center w-full px-2 py-2 text-left hover:bg-base-200 rounded transition-colors text-sm"
                    >
                      <User size={16} className="mr-2 text-primary" />
                      <span>View Profile</span>
                    </Link>
                    <Link
                      href="/"
                      className="flex items-center w-full px-2 py-2 text-left hover:bg-base-200 rounded transition-colors text-sm"
                    >
                      <House size={16} className="mr-2 text-primary" />
                      <span>Home</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  <Link
                    href="/login"
                    className="block w-full px-2 py-2 text-left hover:bg-base-200 rounded transition-colors"
                  >
                    Login / Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex">{fullMenu}</div>
    </>
  );
};

export default NavigationMenu;
