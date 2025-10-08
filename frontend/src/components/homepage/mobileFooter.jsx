"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  House,
  Bell,
  Menu,
  X,
  User,
  MapPinned,
  LocateFixed,
  Search,
  Settings,
  Shield,
  Info,
  BookOpen,
  FileText,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useVerifyUser } from "../utility/tanstack/verifyUser";

const MobileFooter = () => {
  const [active, setActive] = useState("home"); // 'home' | 'alerts' | 'menu'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isLoading: isAuthLoading } = useVerifyUser();
  const { user } = useAuthStore();
  const router = useRouter();

  // Configurable menu arrays (mirror headerMenu)
  const dashboardTabs = [
    { name: "My Dashboard", value: "", icon: <User size={16} /> },
    {
      name: "Add Map",
      value: "Create Map and POIs",
      icon: <MapPinned size={16} />,
    },
    { name: "Search", value: "Search", icon: <Search size={16} /> },
    { name: "Settings", value: "Settings", icon: <Settings size={16} /> },
    ...(user?.role === "admin"
      ? [{ name: "Admin", value: "Admin", icon: <Shield size={16} /> }]
      : []),
  ];
  const footerLinks = [
    { name: "Home", href: "/", icon: <House size={16} /> },
    { name: "Explore Maps", href: "/maps", icon: <MapPinned size={16} /> },
    { name: "About", href: "/about", icon: <Info size={16} /> },
    { name: "User Guide", href: "/guide", icon: <BookOpen size={16} /> },
    { name: "Privacy Policy", href: "/privacy", icon: <Shield size={16} /> },
    { name: "Terms of Service", href: "/terms", icon: <FileText size={16} /> },
    { name: "Contact Us", href: "/contact", icon: <Mail size={16} /> },
  ];
  const otherLinks = [
    {
      name: "View Profile",
      href: user ? `/profile/${user.username}` : "/login",
      icon: <User size={16} />,
    },
    // { name: "Home", href: "/", icon: <House size={16} /> },
  ];

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    setActive("menu");
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <div className="z-50 md:hidden">
      {/* DaisyUI drawer (right side) */}
      <div className="drawer drawer-end">
        <input
          id="mobile-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={(e) => setDrawerOpen(e.target.checked)}
        />
        <div className="drawer-content">
          <div className="dock">
            <Image 
              src='/tripmap.webp'
              alt='Trip Map'
              className="w-8 h-14"
              width={25}
              height={50}
            />
            <Link
                href="/"
                onClick={() => setActive("home")}
                className={active === "home" ? "dock-active" : ""}
                aria-label="Home"
            >
              <House />
              <span className="dock-label">Home</span>
            </Link>
            {user ? (
              <button
                onClick={() => setActive("alerts")}
                className={active === "alerts" ? "dock-active" : ""}
                aria-label="Alerts"
              >
                <Bell />
                <span className="dock-label">Alerts</span>
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setActive("login")}
                  className={active === "login" ? "dock-active" : ""}
                  aria-label="Login"
                >
                  <User />
                  <span className="dock-label">Login</span>
                </Link>
                <Link
                  href="/maps"
                  onClick={() => setActive("maps")}
                  className={active === "maps" ? "dock-active" : ""}
                  aria-label="Explore Maps"
                >
                  <MapPinned />
                  <span className="dock-label">Explore Maps</span>
                </Link>
              </>
            )}
            <button
              onClick={handleOpenDrawer}
              className={active === "menu" ? "dock-active" : ""}
              aria-label="Menu"
            >
              <Menu />
              <span className="dock-label">Menu</span>
            </button>
          </div>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="mobile-drawer"
            className="drawer-overlay"
            onClick={handleCloseDrawer}
          ></label>
          <div className="w-64 bg-base-100 p-4 h-full">
            {isAuthLoading ? (
              <div className="text-sm text-neutral">Loading user...</div>
            ) : !user ? (
              <div className="relative h-full">
                <div className="flex items-center justify-between mb-4">
                  <div />
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleCloseDrawer}
                    aria-label="Close menu"
                  >
                    <X />
                  </button>
                </div>
                <div className="absolute bottom-4 flex flex-col gap-2 w-full">
                  <Link
                    href="/login"
                    className="btn btn-ghost w-full"
                    onClick={handleCloseDrawer}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn btn-primary w-full"
                    onClick={handleCloseDrawer}
                  >
                    Register
                  </Link>
                </div>
                <div className="my-4">
                  {footerLinks.map((tab) => (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className="flex items-center gap-2 btn btn-ghost justify-start"
                      onClick={() => {
                        // close the drawer and let Next handle navigation
                        handleCloseDrawer();
                      }}
                    >
                      <span className="text-primary">{tab.icon}</span>
                      <span>{tab.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Menu</h4>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleCloseDrawer}
                    aria-label="Close menu"
                  >
                    <X />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {dashboardTabs.map((tab) => (
                    <button
                      key={tab.value || tab.name}
                      className={`flex items-center gap-2 btn btn-ghost justify-start ${
                        active === tab.value ? "btn-primary" : ""
                      }`}
                      onClick={() => {
                        setActive(tab.value);
                        handleCloseDrawer();
                        // navigate to dashboard tab
                        router.push(
                          `/dashboard?tab=${encodeURIComponent(tab.value)}`
                        );
                      }}
                    >
                      <span className="text-primary">{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                  {otherLinks.map((link) => (
                    <button
                      key={link.name}
                      className="flex items-center gap-2 btn btn-ghost justify-start"
                      onClick={() => {
                        handleCloseDrawer();
                        router.push(link.href);
                      }}
                    >
                      <span className="text-primary">{link.icon}</span>
                      <span>{link.name}</span>
                    </button>
                  ))}

                  {/* Other Links */}

                  <div className="border-t border-base-300 my-2"></div>
                  <div className="my-4">
                    {footerLinks.map((tab) => (
                      <Link
                        key={tab.name}
                        href={tab.href}
                        className="flex items-center gap-2 btn btn-ghost justify-start"
                        onClick={() => {
                          // close the drawer and let Next handle navigation
                          handleCloseDrawer();
                        }}
                      >
                        <span className="text-primary">{tab.icon}</span>
                        <span>{tab.name}</span>
                      </Link>
                    ))}
                  </div>
                </nav>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFooter;
