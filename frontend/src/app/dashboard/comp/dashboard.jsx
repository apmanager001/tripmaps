"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Bell,
} from "lucide-react";
import UploadWizard from "@/app/newPOIUPLOAD/comp/uploadWizard";
import MyMaps from "./mymap";
import AddMaps from "./addMap";
import AddPOI from "./addPOI";
import Alert from "./alerts";
import Search from "./search";
import SettingsPage from "./settings";
import Admin from "./admin";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import AddMapPOIS from "./addMapPOIS";
import LimitAlert from "./comps/limitAlert";
import { performLogout } from "@/lib/performLogout";

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
    enabled: true, // Always verify on mount
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

  const [loggingOut, setLoggingOut] = useState(false);
  // short-lived guard to prevent the "please log in" toast immediately after a logout
  const justLoggedOutRef = useRef(false);

  // Check authentication on component mount and when user changes
  // Only show the "please log in" toast after the verifyUser query has settled
  useEffect(() => {
    // If we're in the middle of logging out, or we just logged out, don't show the "please log in" toast
    if (loggingOut || justLoggedOutRef.current) return;

    // Do not show the toast while the verification request is still running
    // isVerifying corresponds to the query's isLoading; we also avoid firing
    // while the query is fetching or not yet fetched to prevent races.
    if (!user && !isVerifying) {
      // verifyUser finished and there's no user -> prompt login
      toast.error("Please log in to access the dashboard");
      router.push("/login");
    }
  }, [user, isVerifying, router, loggingOut]);

  // Handle sidebar labels visibility
  useEffect(() => {
    if (!collapsed) {
      const timeout = setTimeout(() => setShowLabels(true), 300); // match transition duration
      return () => clearTimeout(timeout);
    } else {
      setShowLabels(false);
    }
  }, [collapsed]);

  // Auto-collapse on small screens (Tailwind 'lg' breakpoint is 1024px)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = (e) => {
      // when viewport is less than lg, force collapsed true
      if (e.matches) {
        setCollapsed(true);
      } else {
        // when viewport becomes large again, keep collapsed false to show labels
        setCollapsed(false);
      }
    };

    // apply initially
    apply(mq);

    // modern browsers support addEventListener
    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
    } else if (mq.addListener) {
      mq.addListener(apply);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", apply);
      } else if (mq.removeListener) {
        mq.removeListener(apply);
      }
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    // mark that we just logged out so other effects don't react to the cleared user
    justLoggedOutRef.current = true;
    await performLogout({
      clearUser,
      queryClient,
      router,
      setIsLoggingOut: setLoggingOut,
    });
    // reset the guard after a short delay so normal behaviour resumes
    setTimeout(() => {
      justLoggedOutRef.current = false;
    }, 1500);
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
    { name: "Create Map", icon: <LocateFixed size={20} /> },
    // { name: "POIs", icon: <LocateFixed size={20} /> },
    // { name: "Add Map", icon: <MapPinned size={20} /> },
    { name: "Search", icon: <Searched size={20} /> },
    { name: "Alerts", icon: <Bell size={20} /> },
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
      case "Create Map":
        return <UploadWizard />;
      case "Alerts":
        return <Alert />;
      // case "POIs":
      //   return <AddPOI />;
      // case "Add Map":
      //   return <AddMaps />;
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
    <div className="flex w-full min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 mb-16 md:mb-0">
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
            disabled={loggingOut}
            className={`flex items-center w-full px-4 py-3 text-left rounded-xl transition-all duration-200 cursor-pointer group ${
              loggingOut
                ? "opacity-50 cursor-not-allowed bg-base-200"
                : "hover:bg-error/10 hover:text-error hover:shadow-md"
            }`}
            title="Logout"
          >
            <span className="mr-3">
              {loggingOut ? (
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
          <LimitAlert />
          <div className="w-full max-w-7xl">
            {/* Content Header */}
            <div className="m-8 md:m-0 md:mb-8 block">
              <h1 className="text-3xl font-bold text-primary mb-2">
                {activeTab}
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
            </div>

            {/* Content Container */}
            <div className="md:card bg-base-100 shadow-lg pb-2 md:pb-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
