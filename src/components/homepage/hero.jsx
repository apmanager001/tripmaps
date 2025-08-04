"use client";
import React from "react";
import Link from "next/link";

const Hero = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative py-24 px-6 text-center text-white overflow-hidden"
      style={{ minHeight: "60vh" }}
    >
      {/* Background Image */}
      <img
        src="/hero.webp"
        alt="Homepage Hero Image"
        className="absolute inset-0 w-full h-full object-cover "
        style={{ zIndex: 0 }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" style={{ zIndex: 1 }}></div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto" style={{ zIndex: 2 }}>
        <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
          Capture, Map & Share Memories
        </h1>
        <p className="text-lg mb-6 drop-shadow-lg">
          Extract photo metadata, geotag it, and build shareable memory maps
          with ease.
        </p>
        <div className="flex flex-col gap-4 justify-center mb-6">
          <Link href="/register" className="btn btn-primary btn-lg rounded-3xl">
            Get Started
          </Link>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => scrollToSection("popular-maps")}
              className="btn btn-soft btn-sm border-white hover:bg-white hover:text-black transition-colors rounded-3xl"
            >
              Popular Maps
            </button>
            <button
              onClick={() => scrollToSection("popular-locations")}
              className="btn btn-soft btn-sm  border-white hover:bg-white hover:text-black transition-colors rounded-3xl"
            >
              Popular Locations
            </button>
            <button
              onClick={() => scrollToSection("top-users")}
              className="btn btn-soft btn-sm border-white hover:bg-white hover:text-black transition-colors rounded-3xl"
            >
              Top Users
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
