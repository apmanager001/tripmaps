"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Camera,
  Tag,
  MapPin,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Smartphone,
  Monitor,
  CircleX,
} from "lucide-react";

const EditingPoisPage = () => {
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
              <Edit size={28} />
              <h1 className="text-3xl font-bold">Editing POIs</h1>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Learn how to edit location names, descriptions, tags, and photos.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* What Can You Edit */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            What Can You Edit?
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-6">
              POIs (Points of Interest) are fully customizable. You can edit
              almost every aspect of a location to make it perfect for your
              needs.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Edit size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Basic Info</h4>
                <p className="text-sm text-neutral-600">
                  Name, description, and details
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Location</h4>
                <p className="text-sm text-neutral-600">
                  GPS coordinates and position
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Photos</h4>
                <p className="text-sm text-neutral-600">
                  Add, remove, or reorder images
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Tag size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <p className="text-sm text-neutral-600">
                  Categories and organization
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Accessing Edit Mode */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Accessing Edit Mode
          </h2>
          <div className="space-y-6">
            {/* Step 1: Navigate to POI */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Navigate to Your POI</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Find the POI you want to edit:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Go to your map in the dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Click on the POI marker on the map</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Or find the POI in the list view</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2: Open Edit Mode */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Open Edit Mode</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Access the editing interface:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Click the "Edit" button on the POI card</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Or click the edit icon in the POI details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>The edit form will open</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Editing Different Elements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Editing Different Elements
          </h2>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Edit size={20} className="text-primary" />
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Location Name</h4>
                  <p className="text-sm text-neutral-600 mb-3">
                    Change the name of your location:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Make it descriptive and memorable</li>
                    <li>
                      • Include key details (e.g., "Eiffel Tower - Paris")
                    </li>
                    <li>• Use consistent naming conventions</li>
                    <li>• Keep it concise but informative</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-neutral-600 mb-3">
                    Add or edit the location description:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Include personal experiences</li>
                    <li>• Add historical context</li>
                    <li>• Mention practical details</li>
                    <li>• Share tips for future visitors</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Location Position */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Location Position
              </h3>
              <p className="text-base-content/80 mb-4">
                Adjust the exact position of your POI on the map:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">GPS Coordinates</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Automatically set from GPS photos</li>
                    <li>• Manually adjust if needed</li>
                    <li>• Use for precise positioning</li>
                    <li>• Helpful for navigation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Manual Adjustment</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Drag the marker on the map</li>
                    <li>• Click to set new position</li>
                    <li>• Useful for photos without GPS</li>
                    <li>• Fine-tune exact location</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Camera size={20} className="text-primary" />
                Photos
              </h3>
              <p className="text-base-content/80 mb-4">
                Manage the photos associated with your POI:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Add Photos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Upload new images</li>
                    <li>• Drag and drop files</li>
                    <li>• Select multiple photos</li>
                    <li>• Supported formats: JPG, PNG</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Remove Photos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Delete unwanted images</li>
                    <li>• Remove duplicates</li>
                    <li>• Clean up photo gallery</li>
                    <li>• Action cannot be undone</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Reorder Photos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Drag to reorder</li>
                    <li>• Set featured image</li>
                    <li>• Organize by importance</li>
                    <li>• Create visual flow</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tags and Categories */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tag size={20} className="text-primary" />
                Tags and Categories
              </h3>
              <p className="text-base-content/80 mb-4">
                Organize your POIs with tags and categories:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Adding Tags</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Type to add new tags</li>
                    <li>• Select from existing tags</li>
                    <li>• Use descriptive keywords</li>
                    <li>• Separate multiple tags with commas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tag Examples</h4>
                  <ul className="text-sm space-y-1">
                    <li>• "restaurant", "coffee", "museum"</li>
                    <li>• "historical", "scenic", "family-friendly"</li>
                    <li>• "photography", "architecture", "nature"</li>
                    <li>• "budget", "luxury", "local-favorite"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Saving Changes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Saving Your Changes
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-6">
              Always save your changes to preserve your edits:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                  <Save size={16} />
                  Save Changes
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Click "Save" button</li>
                  <li>• Changes are applied immediately</li>
                  <li>• POI is updated across all maps</li>
                  <li>• No confirmation dialog needed</li>
                </ul>
              </div>
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <h4 className="font-semibold text-error mb-2 flex items-center gap-2">
                  <X size={16} />
                  Cancel Changes
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Click "Cancel" button</li>
                  <li>• All changes are discarded</li>
                  <li>• Returns to original state</li>
                  <li>• No changes are saved</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Editing Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Advanced Editing Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info size={20} className="text-primary" />
                Bulk Editing
              </h3>
              <p className="text-base-content/80 mb-4">
                Edit multiple POIs at once:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Select multiple POIs</li>
                <li>• Apply tags to all selected</li>
                <li>• Change privacy settings</li>
                <li>• Move to different maps</li>
              </ul>
            </div>
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trash2 size={20} className="text-error" />
                Deleting POIs
              </h3>
              <p className="text-base-content/80 mb-4">
                Remove POIs from your maps:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Click delete button on POI</li>
                <li>• Confirm deletion</li>
                <li>• Removes from current map</li>
                <li>• Photos are also deleted</li>
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
                  <th>Editing Feature</th>
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
                  <td>Basic Info Editing</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Photo Management</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Location Adjustment</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Advanced Features</td>
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
                <li>• Add descriptive tags</li>
                <li>• Include helpful descriptions</li>
                <li>• Organize photos logically</li>
                <li>• Keep information up to date</li>
                <li>• Use tags for easy searching</li>
              </ul>
            </div>
            <div className="bg-info/10 border border-info/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-info mb-3">
                For Sharing
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Write clear descriptions</li>
                <li>• Include practical details</li>
                <li>• Add personal recommendations</li>
                <li>• Use high-quality photos</li>
                <li>• Consider your audience</li>
                <li>• Keep sensitive info private</li>
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
            <Link href="/guide/photoUpload" className="btn btn-outline">
              Previous: Photo Upload & GPS
            </Link>
            <Link href="/guide/mapInterface" className="btn btn-primary">
              Next: Map Interface
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditingPoisPage;
