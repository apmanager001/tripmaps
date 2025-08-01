"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  CircleX,
  Upload,
  FileImage,
  LocateFixed,
} from "lucide-react";

const PhotoUploadPage = () => {
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
              <Camera size={28} />
              <h1 className="text-3xl font-bold">Photo Upload & GPS</h1>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Learn how to upload GPS-tagged photos and automatically create map
            locations.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Important Mobile Warning */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={24}
              className="text-warning mt-1 flex-shrink-0"
            />
            <div>
              <h2 className="text-xl font-semibold text-warning mb-2">
                Mobile Device Limitation
              </h2>
              <p className="text-base-content/80 mb-3">
                <strong>
                  Mobile devices cannot extract GPS data from photos
                </strong>{" "}
                due to browser security restrictions. For the best experience
                with GPS-tagged photos, use a desktop or laptop computer.
              </p>
              <Link
                href="/guide/mobileLimitations"
                className="text-warning hover:text-warning-focus font-medium"
              >
                Learn more about mobile limitations →
              </Link>
            </div>
          </div>
        </div>

        {/* How GPS Photos Work */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            How GPS Photos Work
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-6">
              When you take a photo with GPS enabled, your camera or phone
              embeds location data (latitude and longitude) directly into the
              image file. TripMaps can read this data and automatically create
              map locations.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">1. Take Photo</h4>
                <p className="text-sm text-neutral-600">
                  Enable GPS on your camera/phone and take photos
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">2. Upload to TripMaps</h4>
                <p className="text-sm text-neutral-600">
                  Upload your photos using desktop/laptop
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">3. Auto-Create Locations</h4>
                <p className="text-sm text-neutral-600">
                  GPS data automatically creates map locations
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enabling GPS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Enabling GPS on Your Device
          </h2>

          <div className="space-y-6">
            {/* Smartphone */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone size={24} className="text-primary" />
                <h3 className="text-xl font-semibold">Smartphone Camera</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-success">iPhone</h4>
                  <ol className="text-sm space-y-1">
                    <li>1. Open Settings → Privacy & Security</li>
                    <li>2. Tap Location Services</li>
                    <li>3. Enable Location Services</li>
                    <li>4. Find Camera app and set to "While Using"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-success">Android</h4>
                  <ol className="text-sm space-y-1">
                    <li>1. Open Camera app</li>
                    <li>2. Tap Settings (gear icon)</li>
                    <li>3. Enable "Save location" or "GPS"</li>
                    <li>4. Grant location permission if prompted</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Digital Camera */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Camera size={24} className="text-primary" />
                <h3 className="text-xl font-semibold">Digital Camera</h3>
              </div>
              <div className="space-y-3">
                <p className="text-base-content/80">
                  Many modern digital cameras have built-in GPS or support GPS
                  accessories:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle
                      size={16}
                      className="text-success mt-1 flex-shrink-0"
                    />
                    <span>Check your camera's menu for GPS settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle
                      size={16}
                      className="text-success mt-1 flex-shrink-0"
                    />
                    <span>Enable "GPS" or "Location" in camera settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle
                      size={16}
                      className="text-success mt-1 flex-shrink-0"
                    />
                    <span>Some cameras require external GPS accessories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle
                      size={16}
                      className="text-success mt-1 flex-shrink-0"
                    />
                    <span>
                      Allow time for GPS signal acquisition before shooting
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Uploading Photos to TripMaps
          </h2>

          <div className="space-y-6">
            {/* Step 1: Access Upload */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">
                  Access the Upload Area
                </h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Navigate to your dashboard and find the photo upload section:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Go to Dashboard → Add POI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>Look for the "Drag and drop images here" area</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span>You can drag & drop or click to browse files</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2: Select Photos */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Select Your Photos</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  Choose photos with GPS data:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Good Photos
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• GPS-tagged photos</li>
                      <li>• High-quality images</li>
                      <li>• Original file format</li>
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
                      <li>• Heavily compressed images</li>
                      <li>• Photos without GPS data</li>
                      <li>• Files over 15MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Processing */}
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Processing & Results</h3>
              </div>
              <div className="ml-11">
                <p className="text-base-content/80 mb-4">
                  TripMaps will process your photos and extract GPS data:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <LocateFixed size={20} className="text-success mt-1" />
                    <div>
                      <h4 className="font-semibold text-success">
                        Photos with GPS Data
                      </h4>
                      <p className="text-sm text-neutral-600">
                        Automatically creates POIs with exact coordinates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileImage size={20} className="text-warning mt-1" />
                    <div>
                      <h4 className="font-semibold text-warning">
                        Photos without GPS Data
                      </h4>
                      <p className="text-sm text-neutral-600">
                        Creates POIs that you can manually position on the map
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Troubleshooting
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-error mb-2">
                  "No GPS data found" Error
                </h4>
                <p className="text-sm text-neutral-600 mb-2">
                  This means your photo doesn't contain GPS coordinates.
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Check if GPS was enabled when taking the photo</li>
                  <li>
                    • Verify the photo was taken outdoors with good GPS signal
                  </li>
                  <li>
                    • Ensure you're using the original photo file (not a copy)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-error mb-2">Upload Fails</h4>
                <p className="text-sm text-neutral-600 mb-2">
                  If photos won't upload, check these common issues:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• File size must be under 15MB</li>
                  <li>• Only image files are supported (JPG, PNG, etc.)</li>
                  <li>• Try refreshing the page and uploading again</li>
                  <li>• Use a desktop/laptop for best results</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-error mb-2">
                  Wrong Location
                </h4>
                <p className="text-sm text-neutral-600 mb-2">
                  If the location is incorrect:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• GPS accuracy can vary based on conditions</li>
                  <li>• You can manually adjust the location after upload</li>
                  <li>
                    • Check if the photo was taken at the correct location
                  </li>
                </ul>
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
                For Best Results
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Take photos outdoors with clear sky view</li>
                <li>• Wait for GPS signal before taking important photos</li>
                <li>• Use original photo files, not compressed versions</li>
                <li>• Upload photos soon after taking them</li>
                <li>• Use desktop/laptop for uploading</li>
                <li>• Keep photos organized by trip/date</li>
              </ul>
            </div>
            <div className="bg-info/10 border border-info/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-info mb-3">
                Photo Organization
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Create separate maps for different trips</li>
                <li>• Add descriptive names to locations</li>
                <li>• Use tags to categorize locations</li>
                <li>• Add descriptions to remember details</li>
                <li>• Set appropriate privacy settings</li>
                <li>• Back up your original photos</li>
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
            <Link href="/guide/addingPois" className="btn btn-outline">
              Previous: Adding POIs
            </Link>
            <Link href="/guide/editingPois" className="btn btn-primary">
              Next: Editing POIs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadPage;
