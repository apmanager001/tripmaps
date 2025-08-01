"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Shield,
  Users,
  Upload,
  AlertTriangle,
  CheckCircle,
  CircleX,
} from "lucide-react";

const TermsOfService = () => {
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
            <FileText size={48} className="text-primary-content" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
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
              Welcome to TripMaps. These Terms of Service ("Terms") govern your
              use of our trip mapping and location sharing service. By accessing
              or using TripMaps, you agree to be bound by these Terms. If you
              disagree with any part of these terms, you may not access our
              service.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              By using TripMaps, you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service. These Terms
              constitute a legally binding agreement between you and TripMaps.
            </p>
            <div className="bg-info/10 border border-info/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-info mb-3">
                <CheckCircle size={20} className="inline mr-2" />
                Important Notice
              </h3>
              <p className="text-base-content/80 leading-relaxed">
                Your continued use of the service after any changes to these
                Terms constitutes acceptance of the updated terms. We recommend
                reviewing these Terms periodically.
              </p>
            </div>
          </section>

          {/* Service Description */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Service Description
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              TripMaps is a platform that allows users to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Create and share interactive travel maps</li>
              <li>Upload and organize location-based photos</li>
              <li>Discover and explore travel destinations</li>
              <li>Connect with other travelers and share experiences</li>
              <li>Access community-generated travel content</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              User Accounts
            </h2>

            <h3 className="text-xl font-semibold mb-3">Account Creation</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You must be at least 13 years old to create an account</li>
              <li>
                You are responsible for maintaining the confidentiality of your
                account
              </li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">
              Account Responsibilities
            </h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Notify us immediately of any unauthorized use</li>
              <li>Keep your login credentials secure</li>
              <li>Not share your account with others</li>
              <li>Not use another user's account</li>
            </ul>
          </section>

          {/* Content License and Usage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Upload size={24} />
              Content License and Usage
            </h2>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-warning mb-3">
                <AlertTriangle size={20} className="inline mr-2" />
                Content License Grant
              </h3>
              <p className="text-base-content/80 leading-relaxed mb-4">
                By uploading content to TripMaps, you grant us a{" "}
                <strong>
                  perpetual, worldwide, non-exclusive, royalty-free,
                  transferable, and sublicensable license
                </strong>{" "}
                to use, reproduce, modify, adapt, publish, translate, create
                derivative works from, distribute, and display such content
                throughout the world in any media.
              </p>
              <p className="text-base-content/80 leading-relaxed">
                This license includes the right to:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>Use your content for commercial purposes</li>
                <li>Share your content with other users and third parties</li>
                <li>Incorporate your content into promotional materials</li>
                <li>Allow other users to download and use your content</li>
                <li>Modify and adapt your content for platform features</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mb-3">Content Ownership</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You retain ownership of your original content</li>
              <li>
                You represent that you have the right to grant this license
              </li>
              <li>You are responsible for the content you upload</li>
              <li>
                You must not upload content that infringes on others' rights
              </li>
            </ul>
          </section>

          {/* Acceptable Use Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Acceptable Use Policy
            </h2>

            <h3 className="text-xl font-semibold mb-3 text-success">
              ✅ What You May Do
            </h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Upload your own travel photos and experiences</li>
              <li>Share legitimate location information</li>
              <li>Create and share travel maps</li>
              <li>Interact respectfully with other users</li>
              <li>Use the service for personal and non-commercial purposes</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-error">
              ❌ What You May Not Do
            </h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                Upload content that violates copyright or intellectual property
                rights
              </li>
              <li>Share inappropriate, offensive, or illegal content</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for spam, harassment, or abuse</li>
              <li>Upload content that contains malware or harmful code</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <div className="bg-error/10 border border-error/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-error mb-3">
                <CircleX size={20} className="inline mr-2" />
                Prohibited Content
              </h3>
              <p className="text-base-content/80 leading-relaxed">
                We reserve the right to remove any content that violates these
                terms, and may suspend or terminate accounts of users who
                repeatedly violate our policies.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Intellectual Property Rights
            </h2>

            <h3 className="text-xl font-semibold mb-3">Our Rights</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                TripMaps and its original content, features, and functionality
                are owned by us
              </li>
              <li>Our trademarks, service marks, and logos are our property</li>
              <li>
                You may not use our intellectual property without permission
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Your Rights</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You retain ownership of your original content</li>
              <li>
                You grant us license to use your content as described above
              </li>
              <li>
                You are responsible for ensuring you have rights to upload
                content
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">
              Copyright Infringement
            </h3>
            <p className="text-base-content/80 leading-relaxed mb-4">
              If you believe your copyright has been infringed, please contact
              us with:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Description of the copyrighted work</li>
              <li>Location of the infringing material on our service</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief</li>
            </ul>
          </section>

          {/* Privacy and Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Shield size={24} />
              Privacy and Data
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              Your privacy is important to us. Our collection and use of
              personal information is governed by our Privacy Policy, which is
              incorporated into these Terms by reference.
            </p>
            <div className="bg-base-200 rounded-lg p-6">
              <p className="text-base-content/80 leading-relaxed mb-4">
                <strong>Important:</strong> By using our service, you
                acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All uploaded content becomes publicly available</li>
                <li>Your content may be used for promotional purposes</li>
                <li>Other users can view, download, and share your content</li>
                <li>We may use your content in marketing materials</li>
              </ul>
            </div>
          </section>

          {/* Service Availability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Service Availability
            </h2>

            <h3 className="text-xl font-semibold mb-3">
              Service Modifications
            </h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                We may modify, suspend, or discontinue the service at any time
              </li>
              <li>We are not liable for any interruptions or modifications</li>
              <li>We will provide reasonable notice for significant changes</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">
              Uptime and Reliability
            </h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>We strive to maintain high service availability</li>
              <li>We are not responsible for temporary outages</li>
              <li>
                We may perform maintenance that affects service availability
              </li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Limitation of Liability
            </h2>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-warning mb-3">
                <AlertTriangle size={20} className="inline mr-2" />
                Important Legal Notice
              </h3>
              <p className="text-base-content/80 leading-relaxed">
                To the maximum extent permitted by law, TripMaps shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including but not limited to loss of profits,
                data, or use, arising out of or relating to your use of the
                service.
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-3">Our Liability</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>We provide the service "as is" without warranties</li>
              <li>We are not responsible for user-generated content</li>
              <li>We do not guarantee the accuracy of location data</li>
              <li>We are not liable for third-party actions or content</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Termination
            </h2>

            <h3 className="text-xl font-semibold mb-3">Account Termination</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You may terminate your account at any time</li>
              <li>We may terminate accounts that violate these Terms</li>
              <li>
                Termination does not affect the license granted for uploaded
                content
              </li>
              <li>
                Some content may remain publicly available after termination
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">
              Effect of Termination
            </h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Your right to use the service ceases immediately</li>
              <li>We may delete your account and personal data</li>
              <li>Uploaded content may remain on the platform</li>
              <li>Provisions that survive termination remain in effect</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Governing Law
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with
              the laws of [Your Jurisdiction], without regard to its conflict of
              law provisions. Any disputes arising from these Terms or your use
              of the service shall be resolved in the courts of [Your
              Jurisdiction].
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Changes to Terms
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will
              notify users of significant changes by posting the updated Terms
              on this page and updating the "Last updated" date. Your continued
              use of the service after such changes constitutes acceptance of
              the updated Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Contact Information
            </h2>
            <p className="text-base-content/80 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please
              contact us:
            </p>
            <div className="bg-base-200 rounded-lg p-6">
              <ul className="space-y-2">
                <li>
                  <strong>Email:</strong> legal@tripmaps.com
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
            <h2 className="text-2xl font-bold text-primary mb-4">
              Summary of Key Terms
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-success">
                  ✅ You Agree To:
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Provide accurate account information</li>
                  <li>Upload only content you have rights to</li>
                  <li>Grant broad license for content usage</li>
                  <li>Use the service responsibly</li>
                  <li>Accept our privacy practices</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-error">
                  ❌ You Must Not:
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Upload copyrighted content without permission</li>
                  <li>Share inappropriate or illegal content</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Attempt to hack or disrupt the service</li>
                  <li>Use the service for harassment or abuse</li>
                </ul>
              </div>
            </div>
            <p className="text-base-content/80 leading-relaxed mt-6">
              By using TripMaps, you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
