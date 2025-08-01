"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  CheckCircle,
  Globe,
  Camera,
  MapPin,
} from "lucide-react";

const GettingStartedPage = () => {
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
              <Globe size={28} />
              <h1 className="text-3xl font-bold">Getting Started</h1>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Welcome to TripMaps! Let&apos;s get you set up to create your first
            travel map.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* What is TripMaps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            What is TripMaps?
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-4">
              TripMaps is a platform designed for travelers and photographers to
              create beautiful, interactive maps of their adventures. You can:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Camera size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Upload GPS Photos</h4>
                  <p className="text-sm text-neutral-600">
                    Automatically extract location data from your photos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Create Maps</h4>
                  <p className="text-sm text-neutral-600">
                    Organize locations into beautiful travel maps
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Share Adventures</h4>
                  <p className="text-sm text-neutral-600">
                    Share your maps with friends and family
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Setup */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Setting Up Your Account
          </h2>

          <div className="space-y-6">
            {/* Step 1: Registration */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Create Your Account</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Start by creating your TripMaps account. You&apos;ll need:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    <span>A valid email address</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    <span>A username (optional)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock size={16} className="text-primary" />
                    <span>A secure password</span>
                  </li>
                </ul>
                <Link href="/register" className="btn btn-primary">
                  Create Account
                </Link>
              </div>
            </div>

            {/* Step 2: Profile Setup */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Complete Your Profile</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  After registration, take a moment to complete your profile:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Add a profile picture</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Write a short bio about your travels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Set your privacy preferences</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3: First Map */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Create Your First Map</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Ready to start mapping your adventures? Create your first map:
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
                <Link href="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tips for Success */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Tips for Success
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-success/10 border border-success/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-success mb-3">
                For Photographers
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Enable GPS on your camera/phone when taking photos</li>
                <li>• Use high-quality images for better results</li>
                                  <li>• Keep original photo files (don&apos;t compress them)</li>
                <li>
                  • Use desktop/laptop for photo upload (mobile has limitations)
                </li>
              </ul>
            </div>
            <div className="bg-info/10 border border-info/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-info mb-3">
                For Travelers
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Create separate maps for different trips</li>
                <li>• Add descriptions to help remember details</li>
                <li>• Use tags to organize locations by type</li>
                <li>• Set privacy settings for your maps</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="mb-12">
                      <h2 className="text-2xl font-bold text-primary mb-6">What&apos;s Next?</h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-6">
                              Now that you&apos;re set up, explore these guides to master TripMaps:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/guide/creatingMaps"
                className="block p-4 bg-base-100 rounded-lg hover:bg-base-300 transition-colors"
              >
                <h4 className="font-semibold text-primary mb-2">
                  Creating Maps
                </h4>
                <p className="text-sm text-neutral-600">
                  Learn how to create and organize your travel maps
                </p>
              </Link>
              <Link
                href="/guide/photoUpload"
                className="block p-4 bg-base-100 rounded-lg hover:bg-base-300 transition-colors"
              >
                <h4 className="font-semibold text-primary mb-2">
                  Photo Upload & GPS
                </h4>
                <p className="text-sm text-neutral-600">
                  Master uploading GPS-tagged photos
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link href="/guide" className="btn btn-outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Guide Index
          </Link>
          <Link href="/guide/creatingMaps" className="btn btn-primary">
            Next: Creating Maps
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedPage;
