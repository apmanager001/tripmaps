"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Users, Globe, Map, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import toast from "react-hot-toast";

export default function HeroSection() {
  const { user } = useAuthStore();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  const backendURL = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:5000";

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${backendURL}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (res.ok) {
        toast.success("Thank you for subscribing!");
        setNewsletterEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Subscription failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-base-200 overflow-hidden">
      {/* Canonical URL for SEO */}
      <link
        rel="canonical"
        href={`${
          process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
        }/`}
      />

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-2xl"></div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-base-content mb-6 leading-tight">
                Share Amazing Places with{" "}
                <span className="text-primary">MyTripMaps</span>
              </h1>
              <p className="text-lg lg:text-xl text-base-content/80 mb-8 max-w-2xl mx-auto lg:mx-0">
                Create, share, and explore beautiful trip maps. Connect with
                fellow travelers and discover hidden gems around the world.
              </p>
            </div>

            {/* Newsletter Signup */}
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-2 mb-8 max-w-md mx-auto lg:mx-0"
            >
              <input
                id="newsletter-email"
                type="email"
                className="input input-bordered w-full"
                placeholder="Enter your email to join our newsletter"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Joining..." : "Join Newsletter"}
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg group">
                Start Mapping
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/maps" className="btn btn-outline btn-lg">
                Explore Maps
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <button
                  onClick={() => scrollToSection("popular-locations")}
                  className="btn btn-soft btn-sm btn-accent rounded-3xl"
                >
                  Popular Locations
                </button>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Map className="w-6 h-6 text-primary" />
                </div>
                <button
                  onClick={() => scrollToSection("popular-maps")}
                  className="btn btn-soft btn-sm btn-accent rounded-3xl"
                >
                  Popular Maps
                </button>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <button
                  onClick={() => scrollToSection("top-users")}
                  className="btn btn-soft btn-sm btn-accent rounded-3xl"
                >
                  Top Users
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Penguin image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Floating elements around the penguin */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full animate-bounce"></div>
              <div
                className="absolute -top-8 -right-8 w-6 h-6 bg-accent/20 rounded-full animate-bounce"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute -bottom-6 -left-8 w-4 h-4 bg-primary/30 rounded-full animate-bounce"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute -bottom-4 -right-4 w-6 h-6 bg-accent/30 rounded-full animate-bounce"
                style={{ animationDelay: "1.5s" }}
              ></div>

              {/* Main penguin image */}
              <div className="relative">
                <Image
                  src="/penguin.webp"
                  alt="Penguin reading a map"
                  width={500}
                  height={500}
                  className="w-full max-w-md lg:max-w-lg h-auto drop-shadow-2xl"
                  priority
                />

                {/* Glow effect behind the penguin */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl -z-10 scale-110"></div>
              </div>

              {/* Decorative map elements */}
              <div className="absolute top-1/4 -right-8 w-16 h-16 bg-accent/10 rounded-lg rotate-12 animate-pulse"></div>
              <div
                className="absolute bottom-1/4 -left-6 w-12 h-12 bg-primary/10 rounded-lg -rotate-12 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-16 lg:h-20"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              className="fill-primary"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              className="fill-accent"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-base-200"
            ></path>
          </svg>
        </div>
      </div>
    </section>
  );
}
