"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  LaptopMinimal,
  Menu,
} from "lucide-react";
import UserStatus from './userHeader'

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);


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
        <div className="flex items-center ">
          {/* <ThemeDropdown /> */}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-square btn-ghost"
        >
          <Menu />
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex">
        {fullMenu}
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        // <div className="relative md:hidden mt-2">
        <div className="absolute top-full right-0 bg-base-100 shadow-md z-20 md:hidden w-36">
          <div className="flex justify-end ">
            {fullMenu}
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationMenu;
