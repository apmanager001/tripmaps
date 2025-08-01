"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Map,
  ZoomIn,
  ZoomOut,
  Navigation,
  MousePointer,
  Smartphone,
  Monitor,
  CheckCircle,
  Info,
  Eye,
  Search,
  Filter,
  CircleX,
} from "lucide-react";

const MapInterfacePage = () => {
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
              <h1 className="text-3xl font-bold">Map Interface</h1>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Learn how to navigate and use the interactive map features.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Map Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Understanding the Map Interface
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-6">
              The TripMaps interface combines an interactive map with powerful
              tools to help you explore, organize, and share your locations.
              Understanding how to navigate this interface will enhance your
              experience significantly.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Map size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Interactive Map</h4>
                <p className="text-sm text-neutral-600">
                  Zoom, pan, and explore your locations
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MousePointer size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">POI Markers</h4>
                <p className="text-sm text-neutral-600">
                  Click to view location details and photos
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Search & Filter</h4>
                <p className="text-sm text-neutral-600">
                  Find specific locations quickly
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Basic Navigation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Basic Map Navigation
          </h2>
          <div className="space-y-6">
            {/* Zoom Controls */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ZoomIn size={20} className="text-primary" />
                Zoom Controls
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Zoom In/Out</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use the + and - buttons</li>
                    <li>• Scroll with mouse wheel</li>
                    <li>• Pinch to zoom on mobile</li>
                    <li>• Double-click to zoom in</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Zoom Levels</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Street level: See buildings</li>
                    <li>• Neighborhood level: See streets</li>
                    <li>• City level: See districts</li>
                    <li>• Country level: See regions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Panning */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Navigation size={20} className="text-primary" />
                Panning (Moving Around)
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Desktop</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Click and drag to move</li>
                    <li>• Use arrow keys</li>
                    <li>• Click and hold to pan</li>
                    <li>• Smooth movement</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Mobile</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Touch and drag to move</li>
                    <li>• Swipe gestures</li>
                    <li>• Smooth touch response</li>
                    <li>• Momentum scrolling</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info size={20} className="text-primary" />
                Map Controls
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Fullscreen</h4>
                  <p className="text-sm text-neutral-600">
                    Expand map to full screen for better viewing
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Reset View</h4>
                  <p className="text-sm text-neutral-600">
                    Return to default map position and zoom
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Map Layers</h4>
                  <p className="text-sm text-neutral-600">
                    Switch between different map styles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* POI Interaction */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Interacting with POIs
          </h2>
          <div className="space-y-6">
            {/* Clicking POIs */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MousePointer size={20} className="text-primary" />
                Clicking on POI Markers
              </h3>
              <p className="text-base-content/80 mb-4">
                POI markers represent your locations on the map. Here's how to
                interact with them:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Desktop Interaction</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Hover to see location name</li>
                    <li>• Click to open details panel</li>
                    <li>• Right-click for additional options</li>
                    <li>• Double-click to center on location</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Mobile Interaction</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Tap to open details panel</li>
                    <li>• Long press for additional options</li>
                    <li>• Tap and hold to see preview</li>
                    <li>• Swipe through multiple POIs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* POI Details Panel */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye size={20} className="text-primary" />
                POI Details Panel
              </h3>
              <p className="text-base-content/80 mb-4">
                When you click on a POI, a details panel opens showing:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Location name and description</li>
                    <li>• GPS coordinates</li>
                    <li>• Tags and categories</li>
                    <li>• Date added/visited</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Actions Available</h4>
                  <ul className="text-sm space-y-1">
                    <li>• View photo gallery</li>
                    <li>• Edit location details</li>
                    <li>• Share location</li>
                    <li>• Delete POI</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye size={20} className="text-primary" />
                Photo Gallery
              </h3>
              <p className="text-base-content/80 mb-4">
                View and interact with photos associated with each POI:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Viewing Photos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Click photo to enlarge</li>
                    <li>• Swipe through gallery</li>
                    <li>• View photo details</li>
                    <li>• Download photos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Photo Information</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Date and time taken</li>
                    <li>• GPS coordinates</li>
                    <li>• Camera settings</li>
                    <li>• File information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Sharing Photos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Share individual photos</li>
                    <li>• Copy photo links</li>
                    <li>• Download for offline use</li>
                    <li>• Social media sharing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Search and Filter Features
          </h2>
          <div className="space-y-6">
            {/* Search Functionality */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Search size={20} className="text-primary" />
                Searching Locations
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Search Options</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Search by location name</li>
                    <li>• Search by description text</li>
                    <li>• Search by tags</li>
                    <li>• Search by date range</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Search Results</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Results highlighted on map</li>
                    <li>• List view of matches</li>
                    <li>• Quick navigation to results</li>
                    <li>• Clear search option</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Filtering */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Filter size={20} className="text-primary" />
                Filtering POIs
              </h3>
              <p className="text-base-content/80 mb-4">
                Use filters to show only specific types of locations:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">By Tags</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Filter by specific tags</li>
                    <li>• Multiple tag selection</li>
                    <li>• Exclude certain tags</li>
                    <li>• Save filter presets</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">By Date</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Filter by visit date</li>
                    <li>• Date range selection</li>
                    <li>• Recent locations</li>
                    <li>• Historical locations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">By Photos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Locations with photos</li>
                    <li>• Locations without photos</li>
                    <li>• GPS-tagged photos only</li>
                    <li>• Manual entry only</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Views */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Different Map Views
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Map size={20} className="text-primary" />
                Map Styles
              </h3>
              <p className="text-base-content/80 mb-4">
                Choose from different map styles for various purposes:
              </p>
              <ul className="text-sm space-y-1">
                <li>
                  • <strong>Street:</strong> Detailed street-level view
                </li>
                <li>
                  • <strong>Satellite:</strong> Aerial imagery
                </li>
                <li>
                  • <strong>Terrain:</strong> Topographic features
                </li>
                <li>
                  • <strong>Dark:</strong> Low-light friendly
                </li>
              </ul>
            </div>
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye size={20} className="text-primary" />
                View Modes
              </h3>
              <p className="text-base-content/80 mb-4">
                Switch between different viewing modes:
              </p>
              <ul className="text-sm space-y-1">
                <li>
                  • <strong>Map Only:</strong> Full-screen map view
                </li>
                <li>
                  • <strong>Split View:</strong> Map and list side-by-side
                </li>
                <li>
                  • <strong>List View:</strong> Text-based location list
                </li>
                <li>
                  • <strong>Gallery View:</strong> Photo-focused layout
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Device Comparison */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Device Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Map Feature</th>
                  <th className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Monitor size={16} />
                      Desktop/Laptop
                    </div>
                  </th>
                  <th className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Smartphone size={16} />
                      Mobile
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Map Navigation</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>POI Interaction</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Photo Gallery</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Advanced Search</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Bulk Operations</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CircleX size={16} className="text-error mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Tips and Tricks */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Tips and Tricks
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-success/10 border border-success/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-success mb-3">
                Navigation Tips
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Use keyboard shortcuts for faster navigation</li>
                <li>• Double-click to quickly zoom to a location</li>
                <li>• Use the search to jump to specific areas</li>
                <li>• Save your favorite map positions</li>
                <li>• Use filters to focus on specific types of locations</li>
                <li>• Take advantage of fullscreen mode for better viewing</li>
              </ul>
            </div>
            <div className="bg-info/10 border border-info/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-info mb-3">
                Efficiency Tips
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Use tags to quickly filter locations</li>
                <li>• Create custom map views for different purposes</li>
                <li>• Use the list view for quick scanning</li>
                <li>• Bookmark frequently visited areas</li>
                <li>• Use the search function to find specific locations</li>
                <li>• Take advantage of keyboard shortcuts</li>
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
            <Link href="/guide/editingPois" className="btn btn-outline">
              Previous: Editing POIs
            </Link>
            <Link href="/guide/sharingMaps" className="btn btn-primary">
              Next: Sharing Maps
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapInterfacePage;
