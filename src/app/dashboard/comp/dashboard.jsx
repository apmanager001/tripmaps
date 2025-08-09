"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  User,
  MapPinned,
  Settings,
  Search as Searched,
  ArrowLeftToLine,
  ArrowRightToLine,
  LogOut,
  LocateFixed,
  Shield,
} from "lucide-react";
import MyMaps from "./mymap";
import AddMaps from "./addMap";
import AddPOI from "./addPOI";
import Search from "./search";
import SettingsPage from "./settings";
import Admin from "./admin";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import AddMapPOIS from "./addMapPOIS";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("My Profile");
  const [collapsed, setCollapsed] = useState(false);
  const [showLabels, setShowLabels] = useState();
  const { user, setUser, clearUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Verify user authentication on mount
  const { isLoading: isVerifying } = useQuery({
    queryKey: ["verifyUser"],
    queryFn: async () => {
      try {
        const response = await authApi.verifyUser();
        if (response.success) {
          setUser(response.user);
          return response.user;
        }
        throw new Error("Verification failed");
      } catch (error) {
        clearUser();
        throw error;
      }
    },
    enabled: !!user, // Only verify if user exists
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Read activeTab from URL parameters
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabs.some((tab) => tab.name === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
        return true;
      } catch (error) {
        console.error("Logout error:", error);
        return false;
      }
    },
    onSuccess: () => {
      // Clear all cached queries to prevent stale data
      queryClient.clear();
      clearUser();
      toast.success("Logged out successfully");
      // Add small delay to allow state cleanup before redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
    onError: (error) => {
      console.error("Logout mutation error:", error);
      queryClient.clear();
      clearUser();
      toast.success("Logged out successfully");
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
  });

  // Check authentication on component mount and when user changes
  useEffect(() => {
    if (!user && !isVerifying) {
      toast.error("Please log in to access the dashboard");
      router.push("/login");
    }
  }, [user, isVerifying, router]);

  // Handle sidebar labels visibility
  useEffect(() => {
    if (!collapsed) {
      const timeout = setTimeout(() => setShowLabels(true), 300); // match transition duration
      return () => clearTimeout(timeout);
    } else {
      setShowLabels(false);
    }
  }, [collapsed]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set("tab", tabName);
    window.history.pushState({}, "", url);
  };

  const tabs = [
    { name: "My Profile", icon: <User size={20} /> },
    { name: "Create Map and POIs", icon: <LocateFixed size={20} /> },
    { name: "POIs", icon: <LocateFixed size={20} /> },
    { name: "Add Map", icon: <MapPinned size={20} /> },
    { name: "Search", icon: <Searched size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
    // Admin tab - only show if user has admin role
    ...(user?.role === "admin"
      ? [{ name: "Admin", icon: <Shield size={20} /> }]
      : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "My Profile":
        return <MyMaps />;
      case "Create Map and POIs":
        return <AddMapPOIS />;
      case "POIs":
        return <AddPOI />;
      case "Add Map":
        return <AddMaps />;
      case "Search":
        return <Search />;
      case "Settings":
        return <SettingsPage />;
      case "Admin":
        return <Admin />;
      default:
        return null;
    }
  };

  // Show loading while checking authentication or verifying user
  if (!user || isVerifying) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Enhanced Desktop Sidebar */}
      <div
        className={`bg-base-100/80 backdrop-blur-sm border-r border-base-300 md:transition-all duration-300 ease-in-out md:overflow-hidden 
        ${collapsed ? "w-20" : "md:w-48"} 
        hidden md:flex md:flex-col md:items-center md:py-6 md:gap-3 md:shadow-xl`}
      >
        {/* Enhanced Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-8 hover:bg-primary/10 hover:text-primary rounded-xl p-3 transition-all duration-200 cursor-pointer group"
          title="Toggle Sidebar"
        >
          <div className="group-hover:scale-110 transition-transform duration-200">
            {collapsed ? (
              <ArrowRightToLine size={20} />
            ) : (
              <ArrowLeftToLine size={20} />
            )}
          </div>
        </button>

        {/* Navigation Tabs */}
        <div className="flex flex-col gap-2 w-full px-3">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.name)}
              className={`flex items-center w-full px-4 py-3 text-left rounded-xl transition-all duration-200 cursor-pointer group ${
                activeTab === tab.name
                  ? "bg-primary text-primary-content shadow-lg shadow-primary/25 font-semibold"
                  : "hover:bg-base-200 hover:text-primary hover:shadow-md"
              }`}
            >
              {/* Icon with enhanced styling */}
              <span
                className={`mr-3 transition-all duration-200 ${
                  activeTab === tab.name
                    ? "text-primary-content"
                    : "text-base-content group-hover:text-primary"
                }`}
              >
                {tab.icon}
              </span>
              {/* Labels with smooth fade */}
              {!collapsed && showLabels && (
                <span
                  className={`inline font-medium transition-all duration-200 ${
                    activeTab === tab.name
                      ? "text-primary-content"
                      : "text-base-content"
                  }`}
                >
                  {tab.name}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-base-300 to-transparent my-4"></div>

        {/* Enhanced Logout Button */}
        <div className="w-full px-3">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={`flex items-center w-full px-4 py-3 text-left rounded-xl transition-all duration-200 cursor-pointer group ${
              logoutMutation.isPending
                ? "opacity-50 cursor-not-allowed bg-base-200"
                : "hover:bg-error/10 hover:text-error hover:shadow-md"
            }`}
            title="Logout"
          >
            <span className="mr-3">
              {logoutMutation.isPending ? (
                <div className="loading loading-spinner loading-xs"></div>
              ) : (
                <LogOut
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
              )}
            </span>
            {/* Only show labels when not collapsed */}
            {!collapsed && showLabels && (
              <span className="inline font-medium text-error">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Content Area with improved styling */}
        <div className="flex-1 flex justify-center md:px-8 md:py-10">
          <div className="w-full max-w-7xl">
            {/* Content Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">
                {activeTab}
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
            </div>

            {/* Content Container */}
            <div className="bg-base-100/50 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300 p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
