"use client";
import Link from "next/link";
import { MapPin, Users, Heart, Globe } from "lucide-react";

export default function About() {
  return (
    <section className="my-16 px-6 bg-gradient-to-br from-base-200/50 to-base-100/50 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Discover the World Together
          </h2>
          <p className="text-lg text-base-content/80 max-w-3xl mx-auto">
            TripMaps is your personal travel companion that helps you create,
            share, and discover amazing journeys around the world. Connect with
            fellow travelers and explore hidden gems through community-curated
            maps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-6 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Create Maps</h3>
            <p className="text-sm text-base-content/70">
              Mark your favorite spots and create personalized travel maps with
              detailed locations
            </p>
          </div>

          <div className="text-center p-6 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Share Experiences</h3>
            <p className="text-sm text-base-content/70">
              Share your travel adventures with the community and discover new
              destinations
            </p>
          </div>

          <div className="text-center p-6 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Connect & Like</h3>
            <p className="text-sm text-base-content/70">
              Follow other travelers, like their maps, and build connections
              with the community
            </p>
          </div>

          <div className="text-center p-6 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 bg-info/10 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-info" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Explore Globally</h3>
            <p className="text-sm text-base-content/70">
              Discover popular destinations and hidden gems from travelers
              worldwide
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/about"
            className="btn btn-primary btn-lg hover:btn-secondary transition-colors"
          >
            Learn More About TripMaps
          </Link>
        </div>
      </div>
    </section>
  );
}
