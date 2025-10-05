import React from "react";
import NavigationMenu from "./headerMenu";
import Link from "next/link";

const Header = async () => {
  return (
    <div className="hidden md:relative z-10">
      <div className="navbar bg-base-200 px-4 py-2">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            <img src="/tripmap.webp" alt="Logo" width="100" height="100" />
            <Link href="/" className="btn btn-ghost text-xl rounded-lg">
              My Trip Maps
            </Link>
          </div>
          <NavigationMenu />
        </div>
      </div>
    </div>
  );
};

export default Header;
