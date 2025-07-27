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
} from "lucide-react";
import MyMaps from "./mymap";
import AddMaps from "./addMap";
import Search from "./search";
import SettingsPage from "./settings";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("My Profile");
  const [collapsed, setCollapsed] = useState(false);
  const [showLabels, setShowLabels] = useState();
  const { user, setUser, clearUser } = useAuthStore();
  const router = useRouter();

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
    enabled: true, // Always verify on component mount
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    onSuccess: (success) => {
      clearUser();
      if (success) {
        toast.success("Logged out successfully");
      } else {
        toast.success("Logged out (local session cleared)");
      }
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Logout mutation error:", error);
      clearUser();
      toast.success("Logged out (local session cleared)");
      window.location.href = "/";
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

  const tabs = [
    { name: "My Profile", icon: <User size={20} /> },
    { name: "Add Map", icon: <MapPinned size={20} /> },
    { name: "Search", icon: <Searched size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "My Profile":
        return <MyMaps />;
      case "Add Map":
        return <AddMaps />;
      case "Search":
        return <Search />;
      case "Settings":
        return <SettingsPage />;
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
    <div className="flex w-full min-h-screen ">
      {/* Sidebar */}
      <div
        className={`bg-base-200 md:transition-all duration-300 ease-in-out md:overflow-hidden 
      ${collapsed ? "w-16" : "md:w-40"} 
      w-16 flex flex-col items-center py-4 gap-2 shadow-md`}
      >
        {/* Collapse Toggle — only visible from md and up */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-6 hover:bg-base-300 rounded p-2 transition cursor-pointer hidden md:block"
          title="Toggle Sidebar"
        >
          {collapsed ? <ArrowRightToLine /> : <ArrowLeftToLine />}
        </button>

        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center w-full px-4 py-2 text-left hover:bg-base-300 transition cursor-pointer ${
              activeTab === tab.name ? "bg-base-300 font-bold" : ""
            }`}
          >
            {/* Always show icons */}
            <span className="mr-2">{tab.icon}</span>
            {/* Only show labels on md+ and when not collapsed */}
            {!collapsed && showLabels && (
              <span className="hidden md:inline">{tab.name}</span>
            )}
          </button>
        ))}

        {/* Divider */}
        <div className="w-full h-px bg-base-300 my-2"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className={`flex items-center w-full px-4 py-2 text-left hover:bg-error/10 hover:text-error transition cursor-pointer ${
            logoutMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Logout"
        >
          <span className="mr-2">
            {logoutMutation.isPending ? (
              <div className="loading loading-spinner loading-xs"></div>
            ) : (
              <LogOut size={20} />
            )}
          </span>
          {/* Only show labels on md+ and when not collapsed */}
          {!collapsed && showLabels && (
            <span className="hidden md:inline text-error">Logout</span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center md:px-6 md:py-8 w-[calc(100%-16px)]">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
