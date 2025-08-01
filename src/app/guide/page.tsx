"use client";
import React from "react";
import Link from "next/link";
import {
  Map,
  Camera,
  MapPin,
  Edit,
  Share2,
  Smartphone,
  Globe,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const UserGuidePage = () => {
  const guideSections = [
    {
      id: "gettingStarted",
      title: "Getting Started",
      description:
        "Learn the basics of creating your first map and account setup",
      icon: <Globe size={24} />,
      color: "bg-blue-500",
      href: "/guide/gettingStarted",
    },
    {
      id: "creatingMaps",
      title: "Creating Maps",
      description:
        "Step-by-step guide to creating and organizing your travel maps",
      icon: <Map size={24} />,
      color: "bg-green-500",
      href: "/guide/creatingMaps",
    },
    {
      id: "addingPois",
      title: "Adding Points of Interest",
      description:
        "How to add locations using photos with GPS data or manual entry",
      icon: <MapPin size={24} />,
      color: "bg-purple-500",
      href: "/guide/addingPois",
    },
    {
      id: "photoUpload",
      title: "Photo Upload & GPS",
      description: "Using GPS-tagged photos to automatically add locations",
      icon: <Camera size={24} />,
      color: "bg-orange-500",
      href: "/guide/photoUpload",
    },
    {
      id: "editingPois",
      title: "Editing POIs",
      description: "How to edit location names, descriptions, tags, and photos",
      icon: <Edit size={24} />,
      color: "bg-teal-500",
      href: "/guide/editingPois",
    },
    {
      id: "mapInterface",
      title: "Map Interface",
      description: "Navigating and using the interactive map features",
      icon: <Map size={24} />,
      color: "bg-indigo-500",
      href: "/guide/mapInterface",
    },
    {
      id: "sharingMaps",
      title: "Sharing Maps",
      description: "How to share your maps with friends and family",
      icon: <Share2 size={24} />,
      color: "bg-pink-500",
      href: "/guide/sharingMaps",
    },
    {
      id: "mobileLimitations",
      title: "Mobile Limitations",
      description: "Important information about mobile device limitations",
      icon: <Smartphone size={24} />,
      color: "bg-red-500",
      href: "/guide/mobileLimitations",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-primary text-primary-content py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={32} />
            <h1 className="text-4xl font-bold">User Guide</h1>
          </div>
          <p className="text-xl opacity-90 max-w-3xl">
            Learn how to create beautiful travel maps, add locations from your
            photos, and share your adventures with friends and family.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Quick Start */}
        <div className="bg-base-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span>Upload GPS-tagged photos or add locations manually</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span>Organize your locations into maps</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span>Share your maps with friends and family</span>
            </div>
          </div>
        </div>

        {/* Guide Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guideSections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="group block bg-base-200 rounded-lg p-6 hover:bg-base-300 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`${section.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-primary-focus transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    {section.description}
                  </p>
                  <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform duration-200">
                    Read Guide
                    <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-warning/10 border border-warning/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-warning mb-4 flex items-center gap-2">
            <Smartphone size={20} />
            Important Mobile Note
          </h2>
          <p className="text-base-content/80 mb-4">
            <strong>Mobile devices cannot extract GPS data from photos</strong>{" "}
            due to browser security restrictions. For the best experience with
            GPS-tagged photos, use a desktop or laptop computer.
          </p>
          <Link
            href="/guide/mobileLimitations"
            className="text-warning hover:text-warning-focus font-medium"
          >
            Learn more about mobile limitations →
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="btn btn-outline btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserGuidePage;
