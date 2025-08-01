"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  AlertTriangle,
  Shield,
  Lock,
  CheckCircle,
  CircleX,
  Info,
} from "lucide-react";

const MobileLimitationsPage = () => {
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
              <Smartphone size={28} />
              <h1 className="text-3xl font-bold">Mobile Limitations</h1>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Understanding why GPS photo extraction doesn&apos;t work on mobile
            devices.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Important Warning */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={24}
              className="text-warning mt-1 flex-shrink-0"
            />
            <div>
              <h2 className="text-xl font-semibold text-warning mb-2">
                Key Limitation
              </h2>
              <p className="text-base-content/80">
                <strong>
                  Mobile browsers cannot extract GPS data from photos
                </strong>{" "}
                due to security restrictions. This is a technical limitation,
                not a problem with TripMaps.
              </p>
            </div>
          </div>
        </div>

        {/* What Works vs What Doesn't */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            What Works vs What Doesn&apos;t
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-success/10 border border-success/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Desktop/Laptop (Works)
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Upload GPS-tagged photos</li>
                <li>• Extract GPS coordinates automatically</li>
                <li>• Create POIs with exact locations</li>
                <li>• Full photo processing capabilities</li>
                <li>• All features available</li>
              </ul>
            </div>
            <div className="bg-error/10 border border-error/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-error mb-4 flex items-center gap-2">
                <CircleX size={20} />
                Mobile Devices (Limited)
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Cannot extract GPS data from photos</li>
                <li>• Photos upload but without location data</li>
                <li>• Must manually position POIs on map</li>
                <li>• Limited photo processing</li>
                <li>• Some features unavailable</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why This Happens */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Why Mobile Browsers Can&apos;t Extract GPS Data
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-6">
              This limitation exists due to browser security policies designed
              to protect user privacy:
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Browser Security Policies
                  </h4>
                  <p className="text-sm text-neutral-600">
                    Mobile browsers restrict access to file metadata (including
                    GPS data) to prevent websites from accessing sensitive
                    information without explicit user permission.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Privacy Protection</h4>
                  <p className="text-sm text-neutral-600">
                    GPS coordinates can reveal your exact location, so browsers
                    require special permissions that web applications cannot
                    request automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Technical Limitations</h4>
                  <p className="text-sm text-neutral-600">
                    The File API in mobile browsers provides limited access to
                    file metadata, making it impossible to read EXIF data (which
                    contains GPS coordinates).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Workarounds */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Mobile Workarounds
          </h2>
          <div className="space-y-6">
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                Option 1: Manual Location Entry
              </h3>
              <p className="text-base-content/80 mb-4">
                You can still use TripMaps on mobile by adding locations
                manually:
              </p>
              <ol className="space-y-2 text-sm ml-4">
                                  <li>1. Upload your photos (they&apos;ll appear without GPS data)</li>
                <li>2. Click &quot;Add Location Manually&quot; button</li>
                <li>3. Click on the map where you took the photo</li>
                <li>4. Add the photo and details to that location</li>
              </ol>
            </div>

            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                Option 2: Use Desktop for Upload
              </h3>
              <p className="text-base-content/80 mb-4">
                For the best experience with GPS photos:
              </p>
              <ul className="space-y-2 text-sm ml-4">
                <li>• Take photos with GPS enabled on your phone</li>
                <li>• Transfer photos to your computer</li>
                <li>• Upload photos using a desktop/laptop browser</li>
                <li>• GPS data will be automatically extracted</li>
              </ul>
            </div>

            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                Option 3: Hybrid Approach
              </h3>
              <p className="text-base-content/80 mb-4">
                Combine both methods for optimal results:
              </p>
              <ul className="space-y-2 text-sm ml-4">
                <li>• Use desktop for initial photo upload with GPS</li>
                <li>• Use mobile for viewing and sharing maps</li>
                <li>• Use mobile for adding quick manual locations</li>
                <li>• Use desktop for detailed editing and organization</li>
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
                  <th>Feature</th>
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
                  <td>Manual Location Entry</td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                  <td className="text-center">
                    <CheckCircle size={16} className="text-success mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td>Map Viewing</td>
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
                  <td>Map Sharing</td>
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

        {/* Best Practices for Mobile */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Best Practices for Mobile Users
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-info/10 border border-info/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-info mb-3">
                For Photo Enthusiasts
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Take photos with GPS enabled</li>
                <li>• Transfer to computer for upload</li>
                <li>• Use mobile for viewing and sharing</li>
                <li>• Keep original photo files</li>
                <li>• Organize photos by trip/date</li>
              </ul>
            </div>
            <div className="bg-success/10 border border-success/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-success mb-3">
                For Casual Users
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Use manual location entry</li>
                <li>• Add locations as you visit them</li>
                <li>• Use mobile for quick additions</li>
                <li>• Use desktop for organization</li>
                <li>• Focus on the experience, not GPS</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Future Possibilities */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Future Possibilities
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-4">
              While mobile browsers currently have these limitations, there are
              potential solutions on the horizon:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-primary mt-1 flex-shrink-0"
                />
                <span>Native mobile apps could access GPS data directly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-primary mt-1 flex-shrink-0"
                />
                <span>
                  Browser APIs may evolve to allow GPS extraction with user
                  consent
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-primary mt-1 flex-shrink-0"
                />
                <span>
                  Cloud-based processing could handle GPS extraction server-side
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-primary mt-1 flex-shrink-0"
                />
                <span>
                  Progressive Web Apps (PWAs) may gain additional capabilities
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link href="/guide" className="btn btn-outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Guide Index
          </Link>
          <Link href="/guide/photoUpload" className="btn btn-primary">
            Learn About Photo Upload
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileLimitationsPage;
