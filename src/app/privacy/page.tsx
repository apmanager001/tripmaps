"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Users, Upload, Eye, Lock } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-primary text-primary-content py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="btn btn-ghost btn-sm text-primary-content hover:bg-primary-focus"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Shield size={48} className="text-primary-content" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-lg opacity-90">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Users size={24} />
              Introduction
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Welcome to TripMaps. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our
              trip mapping and location sharing service. By using our service,
              you consent to the data practices described in this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Upload size={24} />
              Information We Collect
            </h2>

            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                Account information (username, email address, profile picture)
              </li>
              <li>Location data and coordinates you upload</li>
              <li>Photos and images you share</li>
              <li>Descriptions and notes about locations</li>
              <li>Usage data and interaction with our service</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">
              Automatically Collected Information
            </h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Device information and IP addresses</li>
              <li>Browser type and version</li>
              <li>Usage patterns and preferences</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          {/* Content Usage Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Eye size={24} />
              Content Usage Rights
            </h2>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-warning mb-3">
                ⚠️ Important: Free Use License
              </h3>
              <p className="text-base-content/80 leading-relaxed mb-4">
                By uploading content to TripMaps, you grant us and our users a{" "}
                <strong>
                  perpetual, worldwide, non-exclusive, royalty-free license
                </strong>{" "}
                to use, reproduce, modify, distribute, and display your uploaded
                content for any purpose, including commercial use.
              </p>
              <p className="text-base-content/80 leading-relaxed">
                This includes but is not limited to:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>
                  Displaying your photos and location data on our platform
                </li>
                <li>Sharing your content with other users</li>
                <li>
                  Using your content for promotional and marketing purposes
                </li>
                <li>Incorporating your content into our service features</li>
                <li>
                  Allowing other users to download, share, or use your content
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mb-3">What This Means</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                Your uploaded photos, locations, and descriptions become
                publicly available
              </li>
              <li>Other users can view, download, and use your content</li>
              <li>
                We may use your content in marketing materials and promotional
                campaigns
              </li>
              <li>You retain ownership but grant broad usage rights</li>
              <li>You cannot revoke this license once content is uploaded</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              How We Use Your Information
            </h2>

            <h3 className="text-xl font-semibold mb-3">Service Provision</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Creating and managing your account</li>
              <li>Displaying your trip maps and locations</li>
              <li>Enabling social features and sharing</li>
              <li>Providing customer support</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Content Distribution</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Sharing your content with other users</li>
              <li>Featuring your content in public galleries</li>
              <li>Using your content for promotional purposes</li>
              <li>
                Allowing content to be discovered and used by the community
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">
              Improvement and Analytics
            </h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Analyzing usage patterns to improve our service</li>
              <li>Developing new features and functionality</li>
              <li>Personalizing your experience</li>
              <li>Conducting research and analytics</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Information Sharing and Disclosure
            </h2>

            <h3 className="text-xl font-semibold mb-3">Public Content</h3>
            <p className="text-base-content/80 leading-relaxed mb-4">
              All content you upload (photos, locations, descriptions) is
              considered public and may be:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Viewed by all users of the platform</li>
              <li>Shared on social media and other platforms</li>
              <li>Downloaded and used by other users</li>
              <li>Indexed by search engines</li>
              <li>Used in promotional materials</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Third-Party Services</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Cloud storage providers for data hosting</li>
              <li>Analytics and monitoring services</li>
              <li>Payment processors (if applicable)</li>
              <li>Social media platforms for sharing features</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Legal Requirements</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Compliance with legal obligations</li>
              <li>Protection of rights and safety</li>
              <li>Response to law enforcement requests</li>
              <li>Prevention of fraud or abuse</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Lock size={24} />
              Data Security
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              We implement appropriate security measures to protect your
              information:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure cloud storage infrastructure</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Monitoring for suspicious activity</li>
            </ul>
            <p className="text-base-content/80 leading-relaxed">
              However, no method of transmission over the internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Your Rights and Choices
            </h2>

            <h3 className="text-xl font-semibold mb-3">Account Management</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Update or correct your account information</li>
              <li>Delete your account (note: content may remain public)</li>
              <li>Control your privacy settings</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Content Control</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Delete individual photos or locations</li>
              <li>Edit descriptions and metadata</li>
              <li>Set content visibility preferences</li>
              <li>Report inappropriate content</li>
            </ul>

            <div className="bg-error/10 border border-error/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-error mb-3">
                ⚠️ Important Limitation
              </h3>
              <p className="text-base-content/80 leading-relaxed">
                Due to the free use license granted upon upload, deleting your
                content from our platform does not guarantee removal from other
                users' devices or third-party platforms where it may have been
                shared or downloaded.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Children's Privacy
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              Our service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us
              immediately.
            </p>
          </section>

          {/* International Users */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              International Users
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              Your information may be transferred to and processed in countries
              other than your own. By using our service, you consent to such
              transfers and processing in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date. Your continued use
              of the service after such changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us:
            </p>
            <div className="bg-base-200 rounded-lg p-6">
              <ul className="space-y-2">
                <li>
                  <strong>Email:</strong> privacy@tripmaps.com
                </li>
                <li>
                  <strong>Address:</strong> [Your Business Address]
                </li>
                <li>
                  <strong>Website:</strong>{" "}
                  <Link href="/" className="link link-primary">
                    tripmaps.com
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          {/* Summary */}
          <section className="bg-primary/5 border border-primary/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Summary</h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              By using TripMaps, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All uploaded content becomes publicly available</li>
              <li>You grant broad usage rights to your content</li>
              <li>Other users can view, download, and use your content</li>
              <li>We may use your content for promotional purposes</li>
              <li>
                Deleting content doesn't guarantee removal from all platforms
              </li>
              <li>You are responsible for the content you upload</li>
            </ul>
            <p className="text-base-content/80 leading-relaxed mt-4">
              This policy ensures transparency about how your content will be
              used and shared within our community.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
