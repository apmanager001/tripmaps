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
  Menu,
  LocateFixed,
  X,
} from "lucide-react";
import MyMaps from "./mymap";
import AddMaps from "./addMap";
import AddPOI from "./addPOI";
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setMobileDrawerOpen(false); // Close mobile drawer when tab is clicked
  };

  const tabs = [
    { name: "My Profile", icon: <User size={20} /> },
    { name: "POIs", icon: <LocateFixed size={20} /> },
    { name: "Add Map", icon: <MapPinned size={20} /> },
    { name: "Search", icon: <Searched size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "My Profile":
        return <MyMaps />;
      case "POIs":
        return <AddPOI />;  
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
    <div className="flex w-full min-h-screen">
      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-base-200 z-50 transform transition-transform duration-300 ease-in-out md:hidden border-r border-base-300 ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300 flex-shrink-0">
            <h2 className="text-lg font-bold text-primary">Dashboard</h2>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="btn btn-sm btn-ghost"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Drawer Content */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Logout Button at Top */}
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className={`flex items-center w-full px-4 py-3 text-left hover:bg-error/10 hover:text-error transition cursor-pointer border-b border-base-300 ${
                logoutMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="mr-3">
                {logoutMutation.isPending ? (
                  <div className="loading loading-spinner loading-xs"></div>
                ) : (
                  <LogOut size={20} />
                )}
              </span>
              <span className="text-error">Logout</span>
            </button>

            {/* Navigation Tabs */}
            <div className="py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabClick(tab.name)}
                  className={`flex items-center w-full px-4 py-3 text-left hover:bg-base-300 transition cursor-pointer ${
                    activeTab === tab.name ? "bg-base-300 font-bold" : ""
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`bg-base-200 md:transition-all duration-300 ease-in-out md:overflow-hidden 
        ${collapsed ? "w-16" : "md:w-40"} 
        hidden md:flex md:flex-col md:items-center md:py-4 md:gap-2 md:shadow-md`}
      >
        {/* Collapse Toggle — only visible from md and up */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-6 hover:bg-base-300 rounded p-2 transition cursor-pointer"
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
            {/* Only show labels when not collapsed */}
            {!collapsed && showLabels && (
              <span className="inline">{tab.name}</span>
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
          {/* Only show labels when not collapsed */}
          {!collapsed && showLabels && (
            <span className="inline text-error">Logout</span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-base-200 border-b border-base-300 ">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="btn btn-sm btn-ghost"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold text-primary">Dashboard</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex justify-center md:px-6 md:py-8 p-4 ">
          <div className="w-full max-w-6xl">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
