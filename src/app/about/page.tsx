import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Users,
  Heart,
  Globe,
  Shield,
  Compass,
  MessageCircle,
  Bookmark,
  TrendingUp,
  Award,
} from "lucide-react";
import Statistics from "@/components/homepage/statistics";
import { generateMetadata } from "@/lib/seo";

export const metadata: Metadata = generateMetadata({
  title: "About TripMaps - Your Travel Companion",
  description:
    "Learn more about TripMaps - the platform that connects travelers worldwide through shared experiences and community-curated maps.",
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200/30 to-base-100/30">
      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            About TripMaps
          </h1>
          <p className="text-xl text-base-content/80 leading-relaxed">
            We&apos;re building the world&apos;s most connected travel
            community, where every journey becomes a story worth sharing and
            every destination becomes an adventure waiting to happen.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-base-content/80 mb-6 leading-relaxed">
                TripMaps was born from a simple idea: travel is better when
                shared. We believe that every traveler has unique experiences
                and insights that can inspire others to explore the world in new
                and exciting ways.
              </p>
              <p className="text-lg text-base-content/80 mb-6 leading-relaxed">
                Our platform connects passionate travelers from around the
                globe, creating a vibrant community where you can discover
                hidden gems, share your adventures, and find inspiration for
                your next journey.
              </p>
              <div className="flex gap-4">
                <Link href="/register" className="btn btn-primary">
                  Join Our Community
                </Link>
                <Link href="/maps" className="btn btn-outline">
                  Explore Maps
                </Link>
              </div>
            </div>
            <div className="bg-base-100 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 text-center">
                What We Offer
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Interactive Maps</h4>
                    <p className="text-sm text-base-content/70">
                      Create and share detailed travel maps with custom markers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Community Features</h4>
                    <p className="text-sm text-base-content/70">
                      Connect with fellow travelers and share experiences
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Social Interaction</h4>
                    <p className="text-sm text-base-content/70">
                      Like, comment, and bookmark your favorite maps
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Global Discovery</h4>
                    <p className="text-sm text-base-content/70">
                      Explore destinations from travelers worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Compass className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Navigation</h3>
              <p className="text-base-content/70">
                Intuitive map creation with drag-and-drop functionality and
                precise location marking
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Community Comments</h3>
              <p className="text-base-content/70">
                Share insights, ask questions, and get recommendations from the
                travel community
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Save & Organize</h3>
              <p className="text-base-content/70">
                Bookmark your favorite maps and organize them for future
                reference
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-info/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-info" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Popular Content</h3>
              <p className="text-base-content/70">
                Discover trending destinations and most-liked travel experiences
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-warning" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Privacy Control</h3>
              <p className="text-base-content/70">
                Choose to keep your maps private or share them with the
                community
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quality Content</h3>
              <p className="text-base-content/70">
                Curated content from verified travelers and community
                recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <Statistics />

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-base-content/80 mb-8">
            Join thousands of travelers who are already sharing their adventures
            and discovering new destinations on TripMaps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn btn-primary btn-lg">
              Create Your First Map
            </Link>
            <Link href="/maps" className="btn btn-outline btn-lg">
              Explore Community Maps
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
