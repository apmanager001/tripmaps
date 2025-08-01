"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Map,
  Plus,
  Settings,
  Users,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Globe,
  CheckCircle,
  Info,
} from "lucide-react";

const CreatingMapsPage = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-primary text-primary-content py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/guide"
              className="btn btn-ghost btn-sm text-primary-content"
            >
              <ArrowLeft size={16} />
              Back to Guide
            </Link>
            <div className="flex items-center gap-3">
              <Map size={28} />
              <h1 className="text-3xl font-bold">Creating Maps</h1>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Learn how to create and organize your travel maps effectively.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* What are Maps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            What are TripMaps?
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-6">
              TripMaps are collections of locations (Points of Interest) that
              you organize together. Think of them as digital scrapbooks for
              your travels, where each location represents a place you've
              visited or want to visit.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Map size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Organize Locations</h4>
                <p className="text-sm text-neutral-600">
                  Group related places into themed maps
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Visual Stories</h4>
                <p className="text-sm text-neutral-600">
                  Create visual narratives of your adventures
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Share Experiences</h4>
                <p className="text-sm text-neutral-600">
                  Share your maps with friends and family
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Creating Your First Map */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Creating Your First Map
          </h2>
          <div className="space-y-6">
            {/* Step 1: Access Dashboard */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Access Your Dashboard</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Start by navigating to your TripMaps dashboard:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Log into your TripMaps account</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Click on "Dashboard" in the navigation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Look for the "My Maps" section</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2: Create New Map */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Create a New Map</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Click the "Create New Map" button and fill in the details:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Required Fields
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Map Name (e.g., "Paris 2024")</li>
                      <li>• Description (optional)</li>
                      <li>• Privacy Setting</li>
                    </ul>
                  </div>
                  <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                    <h4 className="font-semibold text-info mb-2 flex items-center gap-2">
                      <Info size={16} />
                      Tips
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Use descriptive names</li>
                      <li>• Include dates in names</li>
                      <li>• Add helpful descriptions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Add Locations */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">
                  Add Your First Location
                </h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Now you can start adding locations to your map:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-base-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">
                      Option 1: Photo Upload
                    </h4>
                    <p className="text-sm text-neutral-600 mb-3">
                      Upload GPS-tagged photos to automatically create locations
                    </p>
                    <Link
                      href="/guide/photoUpload"
                      className="text-primary text-sm font-medium"
                    >
                      Learn about photo upload →
                    </Link>
                  </div>
                  <div className="bg-base-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">
                      Option 2: Manual Entry
                    </h4>
                    <p className="text-sm text-neutral-600 mb-3">
                      Add locations manually by clicking on the map
                    </p>
                    <Link
                      href="/guide/addingPois"
                      className="text-primary text-sm font-medium"
                    >
                      Learn about manual entry →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Organization Strategies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Map Organization Strategies
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                By Trip/Date
              </h3>
              <p className="text-base-content/80 mb-4">
                Organize maps by specific trips or time periods:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• "Europe Summer 2024"</li>
                <li>• "Japan Spring 2023"</li>
                <li>• "Weekend in NYC"</li>
                <li>• "Honeymoon 2024"</li>
              </ul>
            </div>
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tag size={20} className="text-primary" />
                By Theme/Interest
              </h3>
              <p className="text-base-content/80 mb-4">
                Group locations by type or interest:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• "Best Coffee Shops"</li>
                <li>• "Historical Sites"</li>
                <li>• "Photography Spots"</li>
                <li>• "Restaurants to Try"</li>
              </ul>
            </div>
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe size={20} className="text-primary" />
                By Location
              </h3>
              <p className="text-base-content/80 mb-4">
                Create maps for specific cities or regions:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• "Paris, France"</li>
                <li>• "Tokyo, Japan"</li>
                <li>• "New York City"</li>
                <li>• "California Coast"</li>
              </ul>
            </div>
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={20} className="text-primary" />
                By Purpose
              </h3>
              <p className="text-base-content/80 mb-4">
                Organize by travel purpose or audience:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• "Family Vacation Spots"</li>
                <li>• "Business Travel"</li>
                <li>• "Adventure Destinations"</li>
                <li>• "Relaxation Retreats"</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Map Management */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Managing Your Maps
          </h2>
          <div className="space-y-6">
            {/* Privacy Settings */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Privacy Settings
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-base-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={16} className="text-success" />
                    <h4 className="font-semibold text-success">Public</h4>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Anyone can view your map
                  </p>
                </div>
                <div className="bg-base-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-warning" />
                    <h4 className="font-semibold text-warning">Shared</h4>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Only people with the link can view
                  </p>
                </div>
                <div className="bg-base-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <EyeOff size={16} className="text-error" />
                    <h4 className="font-semibold text-error">Private</h4>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Only you can view your map
                  </p>
                </div>
              </div>
            </div>

            {/* Editing Maps */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Edit size={20} className="text-primary" />
                Editing Maps
              </h3>
              <p className="text-base-content/80 mb-4">
                You can edit your maps at any time:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Map Details</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Change map name and description</li>
                    <li>• Update privacy settings</li>
                    <li>• Reorder locations</li>
                    <li>• Add or remove locations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Location Management</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Edit location names and descriptions</li>
                    <li>• Add or remove photos</li>
                    <li>• Update tags and categories</li>
                    <li>• Adjust map positions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Deleting Maps */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trash2 size={20} className="text-error" />
                Deleting Maps
              </h3>
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <p className="text-sm text-neutral-600 mb-2">
                  <strong>Warning:</strong> Deleting a map will permanently
                  remove all locations and photos associated with it. This
                  action cannot be undone.
                </p>
                <p className="text-sm text-neutral-600">
                  Consider making a map private instead of deleting it if you
                  want to preserve your memories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Best Practices
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-success/10 border border-success/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-success mb-3">
                For Organization
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Use consistent naming conventions</li>
                <li>• Include dates in map names</li>
                <li>• Add descriptive details</li>
                <li>• Use tags to categorize locations</li>
                <li>• Keep maps focused on specific themes</li>
                <li>• Regularly update and maintain maps</li>
              </ul>
            </div>
            <div className="bg-info/10 border border-info/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-info mb-3">
                For Sharing
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Set appropriate privacy levels</li>
                <li>• Add helpful descriptions for viewers</li>
                <li>• Use clear, descriptive location names</li>
                <li>• Include relevant photos and details</li>
                <li>• Consider your audience when sharing</li>
                <li>• Keep sensitive information private</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link href="/guide" className="btn btn-outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Guide Index
          </Link>
          <div className="flex gap-2">
            <Link href="/guide/gettingStarted" className="btn btn-outline">
              Previous: Getting Started
            </Link>
            <Link href="/guide/addingPois" className="btn btn-primary">
              Next: Adding POIs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatingMapsPage;
