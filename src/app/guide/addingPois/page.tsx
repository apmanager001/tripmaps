"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Camera,
  MousePointer,
  Upload,
  CheckCircle,
  CircleX,
  Info,
  AlertTriangle,
  Smartphone,
  Monitor,
} from "lucide-react";

const AddingPoisPage = () => {
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
              <MapPin size={28} />
              <h1 className="text-3xl font-bold">Adding Points of Interest</h1>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Learn how to add locations using GPS photos or manual entry.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* What are POIs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            What are Points of Interest (POIs)?
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-6">
              Points of Interest (POIs) are the individual locations on your
              map. Each POI represents a place you've visited or want to visit,
              and can include photos, descriptions, and other details.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Location Data</h4>
                <p className="text-sm text-neutral-600">
                  GPS coordinates and address information
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Photos & Media</h4>
                <p className="text-sm text-neutral-600">
                  Images and visual content from your visit
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Info size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Details & Notes</h4>
                <p className="text-sm text-neutral-600">
                  Descriptions, tags, and personal notes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Two Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Two Ways to Add POIs
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Camera size={24} className="text-primary" />
                <h3 className="text-xl font-semibold">GPS Photo Upload</h3>
              </div>
              <p className="text-base-content/80 mb-4">
                Upload photos with GPS data to automatically create POIs with
                exact coordinates.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm">Automatic location detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm">Photos included automatically</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm">Best for desktop/laptop</span>
                </div>
              </div>
              <Link
                href="/guide/photoUpload"
                className="text-primary text-sm font-medium"
              >
                Learn more about photo upload →
              </Link>
            </div>
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <MousePointer size={24} className="text-primary" />
                <h3 className="text-xl font-semibold">Manual Entry</h3>
              </div>
              <p className="text-base-content/80 mb-4">
                Click on the map to manually place POIs and add details
                yourself.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm">Works on all devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm">Full control over placement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm">Add photos after creation</span>
                </div>
              </div>
              <Link
                href="#manual-entry"
                className="text-primary text-sm font-medium"
              >
                Learn more about manual entry →
              </Link>
            </div>
          </div>
        </section>

        {/* GPS Photo Upload Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            GPS Photo Upload Process
          </h2>
          <div className="space-y-6">
            {/* Step 1: Prepare Photos */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Prepare Your Photos</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Ensure your photos have GPS data and meet requirements:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Good Photos
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• GPS-enabled camera/phone</li>
                      <li>• Original photo files</li>
                      <li>• High-quality images</li>
                      <li>• Under 15MB each</li>
                    </ul>
                  </div>
                  <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                    <h4 className="font-semibold text-error mb-2 flex items-center gap-2">
                      <CircleX size={16} />
                      Avoid These
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Screenshots</li>
                      <li>• Compressed images</li>
                      <li>• Photos without GPS</li>
                      <li>• Files over 15MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Upload */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Upload Photos</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Use the photo upload interface in your dashboard:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Go to Dashboard → Add POI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Drag & drop photos or click to browse</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Select multiple photos at once</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Wait for processing to complete</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3: Review & Edit */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Review & Edit POIs</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  After upload, review and customize your POIs:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Photos with GPS</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Automatically creates POIs</li>
                      <li>• Exact coordinates set</li>
                      <li>• Photos attached</li>
                      <li>• Edit names and details</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Photos without GPS</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Creates POIs without location</li>
                      <li>• Manual positioning required</li>
                      <li>• Photos attached</li>
                      <li>• Add location manually</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Manual Entry Process */}
        <section id="manual-entry" className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Manual Entry Process
          </h2>
          <div className="space-y-6">
            {/* Step 1: Access Map */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Access Your Map</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Navigate to the map where you want to add POIs:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Go to Dashboard → My Maps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Click on the map you want to edit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Look for the "Add Location Manually" button</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2: Click on Map */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Click on the Map</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Place POIs by clicking on the map:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Click "Add Location Manually" button</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Click anywhere on the map</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>A new POI marker will appear</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Fill in the location details</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3: Add Details */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Add Location Details</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Complete the POI information:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Required Information</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Location name</li>
                      <li>• Description (optional)</li>
                      <li>• Tags (optional)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Optional Features</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Upload photos</li>
                      <li>• Add website links</li>
                      <li>• Set custom categories</li>
                      <li>• Add personal notes</li>
                    </ul>
                  </div>
                </div>
              </div>
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
                  <th>Method</th>
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
                  <td>GPS Photo Upload</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CircleX size={16} className="text-error mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Manual Entry</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Photo Addition</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Advanced Editing</td>
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
                For GPS Photos
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Enable GPS before taking photos</li>
                <li>• Use original photo files</li>
                <li>• Take photos outdoors for better GPS</li>
                <li>• Upload soon after taking photos</li>
                <li>• Use desktop/laptop for upload</li>
                <li>• Keep photos organized</li>
              </ul>
            </div>
            <div className="bg-info/10 border border-info/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-info mb-3">
                For Manual Entry
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Use descriptive location names</li>
                <li>• Add helpful descriptions</li>
                <li>• Use tags for organization</li>
                <li>• Upload relevant photos</li>
                <li>• Be consistent with naming</li>
                <li>• Add personal notes</li>
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
            <Link href="/guide/creatingMaps" className="btn btn-outline">
              Previous: Creating Maps
            </Link>
            <Link href="/guide/photoUpload" className="btn btn-primary">
              Next: Photo Upload & GPS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddingPoisPage;
