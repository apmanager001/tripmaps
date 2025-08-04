"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  LaptopMinimal,
  Menu,
  User,
  MapPinned,
  LocateFixed,
  Search,
  Settings,
  LogOut,
  House,
  Shield,
} from "lucide-react";
import UserStatus from "./userHeader";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const handleDashboardNavigation = (tab) => {
    router.push(`/dashboard?tab=${tab}`);
    setIsOpen(false);
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
    <ul className="menu menu-horizontal md:gap-1 lg:gap-6 md:text-sm lg:text-lg font-bold">
      <li>
        <UserStatus />
      </li>
    </ul>
  );

  return (
    <>
      {/* Toggle Button */}
      <div className="md:hidden flex justify-center items-center gap-4">
        <div className="flex items-center ">{/* <ThemeDropdown /> */}</div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-square btn-ghost"
        >
          <Menu />
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex">{fullMenu}</div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 bg-base-100 shadow-md z-20 md:hidden w-64 rounded-lg border border-base-300">
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
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={16} className="mr-2 text-primary" />
                    <span>View Profile</span>
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center w-full px-2 py-2 text-left hover:bg-base-200 rounded transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationMenu;
