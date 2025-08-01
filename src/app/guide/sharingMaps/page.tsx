"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Link as LinkIcon,
  Users,
  Eye,
  EyeOff,
  Settings,
  Mail,
  MessageCircle,
  Globe,
  Lock,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const SharingMapsPage = () => {
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
              <Share2 size={28} />
              <h1 className="text-3xl font-bold">Sharing Maps</h1>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Learn how to share your maps with friends and family.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Why Share Maps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Why Share Your Maps?
          </h2>
          <div className="bg-base-200 rounded-lg p-6">
            <p className="text-base-content/80 mb-6">
              Sharing your TripMaps allows you to connect with others through
                              your travel experiences. Whether you&apos;re planning a trip together,
              sharing memories, or inspiring others to explore, map sharing
              creates meaningful connections.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Connect with Friends</h4>
                <p className="text-sm text-neutral-600">
                  Share your adventures with friends and family
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Inspire Others</h4>
                <p className="text-sm text-neutral-600">
                  Help others discover amazing places to visit
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={24} className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Plan Together</h4>
                <p className="text-sm text-neutral-600">
                  Collaborate on travel plans with others
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Understanding Privacy Settings
          </h2>
          <div className="space-y-6">
            {/* Privacy Levels */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Privacy Levels
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-base-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={16} className="text-success" />
                    <h4 className="font-semibold text-success">Public</h4>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">
                    Anyone can view your map
                  </p>
                  <ul className="text-xs space-y-1 text-neutral-600">
                    <li>• Appears in public searches</li>
                    <li>• Can be shared by anyone</li>
                    <li>• Good for inspiration</li>
                  </ul>
                </div>
                <div className="bg-base-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-warning" />
                    <h4 className="font-semibold text-warning">Shared</h4>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">
                    Only people with the link can view
                  </p>
                  <ul className="text-xs space-y-1 text-neutral-600">
                    <li>• Not searchable publicly</li>
                    <li>• Link can be shared</li>
                    <li>• Good for friends/family</li>
                  </ul>
                </div>
                <div className="bg-base-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <EyeOff size={16} className="text-error" />
                    <h4 className="font-semibold text-error">Private</h4>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">
                    Only you can view your map
                  </p>
                  <ul className="text-xs space-y-1 text-neutral-600">
                    <li>• Completely private</li>
                    <li>• Cannot be shared</li>
                    <li>• Good for personal use</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Setting Privacy */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock size={20} className="text-primary" />
                Setting Privacy for Your Maps
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">When Creating a Map</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Choose privacy level during creation</li>
                    <li>• Can be changed later</li>
                    <li>• Default is usually &quot;Private&quot;</li>
                    <li>• Consider your audience</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Changing Privacy Later</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Go to map settings</li>
                    <li>• Click &quot;Privacy Settings&quot;</li>
                    <li>• Select new privacy level</li>
                    <li>• Save changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sharing Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            How to Share Your Maps
          </h2>
          <div className="space-y-6">
            {/* Direct Link Sharing */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <LinkIcon size={20} className="text-primary" />
                Direct Link Sharing
              </h3>
              <p className="text-base-content/80 mb-4">
                The easiest way to share your maps is through direct links:
              </p>
              <div className="space-y-4">
                <div className="bg-base-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Step 1: Get the Share Link
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Open your map</li>
                    <li>• Click the &quot;Share&quot; button</li>
                    <li>• Copy the generated link</li>
                    <li>• Link works for Public and Shared maps</li>
                  </ul>
                </div>
                <div className="bg-base-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Step 2: Share the Link</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Send via email or messaging</li>
                    <li>• Post on social media</li>
                    <li>• Include in blog posts</li>
                    <li>• Share in travel groups</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Social Media Sharing */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Share2 size={20} className="text-primary" />
                Social Media Sharing
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Built-in Sharing</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Facebook sharing button</li>
                    <li>• Twitter/X sharing</li>
                    <li>• Instagram stories</li>
                    <li>• WhatsApp sharing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Manual Sharing</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Copy link and paste</li>
                    <li>• Screenshot and share</li>
                    <li>• Create social media posts</li>
                    <li>• Share in travel communities</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Email Sharing */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail size={20} className="text-primary" />
                Email Sharing
              </h3>
              <p className="text-base-content/80 mb-4">
                Share your maps via email for more personal communication:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Direct Email</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Copy the map link</li>
                    <li>• Paste in email body</li>
                    <li>• Add personal message</li>
                    <li>• Send to friends/family</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Email Templates</h4>
                  <ul className="text-sm space-y-1">
                    <li>• &quot;Check out my trip to [destination]&quot;</li>
                    <li>• &quot;Here are my recommendations for [city]&quot;</li>
                    <li>• &quot;Planning our next adventure together&quot;</li>
                    <li>• &quot;Sharing my travel memories with you&quot;</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Viewers Can See */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            What Viewers Can See
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye size={20} className="text-primary" />
                Public Maps
              </h3>
              <p className="text-base-content/80 mb-4">
                When you share a public map, viewers can see:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Map name and description</li>
                <li>• All POI locations and names</li>
                <li>• Photos you&apos;ve uploaded</li>
                <li>• Tags and categories</li>
                <li>• Your username (if public)</li>
                <li>• Map creation date</li>
              </ul>
            </div>
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Shared Maps
              </h3>
              <p className="text-base-content/80 mb-4">
                When you share a private map via link, viewers can see:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Map name and description</li>
                <li>• All POI locations and names</li>
                <li>• Photos you&apos;ve uploaded</li>
                <li>• Tags and categories</li>
                <li>• Cannot see your profile</li>
                <li>• Cannot share the link further</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Privacy Considerations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Privacy Considerations
          </h2>
          <div className="space-y-6">
            {/* What to Consider */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-warning" />
                Before Sharing
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Review location names</li>
                    <li>• Check photo content</li>
                    <li>• Remove personal details</li>
                    <li>• Consider home location privacy</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Content Review</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Ensure photos are appropriate</li>
                    <li>• Check descriptions</li>
                    <li>• Review tags for sensitivity</li>
                    <li>• Consider your audience</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-success" />
                Best Practices
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <h4 className="font-semibold text-success mb-2">Do&apos;s</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use descriptive map names</li>
                    <li>• Add helpful descriptions</li>
                    <li>• Include high-quality photos</li>
                    <li>• Use relevant tags</li>
                    <li>• Consider your audience</li>
                    <li>• Test the link before sharing</li>
                  </ul>
                </div>
                <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                  <h4 className="font-semibold text-error mb-2">Don&apos;ts</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Don&apos;t share private home locations</li>
                    <li>• Don&apos;t include personal contact info</li>
                    <li>• Don&apos;t share inappropriate content</li>
                    <li>• Don&apos;t forget to review before sharing</li>
                    <li>• Don&apos;t share without permission</li>
                    <li>• Don&apos;t ignore privacy settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Managing Shared Maps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Managing Shared Maps
          </h2>
          <div className="space-y-6">
            {/* Tracking Shares */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info size={20} className="text-primary" />
                Tracking Your Shares
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">View Analytics</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Check view counts</li>
                    <li>• See engagement metrics</li>
                    <li>• Track link clicks</li>
                    <li>• Monitor sharing activity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Manage Access</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Change privacy settings</li>
                    <li>• Revoke access if needed</li>
                    <li>• Update shared content</li>
                    <li>• Delete shared maps</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Updating Shared Content */}
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Updating Shared Content
              </h3>
              <p className="text-base-content/80 mb-4">
                When you update a shared map, changes are reflected immediately:
              </p>
              <ul className="text-sm space-y-1">
                <li>
                  • <strong>Real-time updates:</strong> Changes appear instantly
                  to viewers
                </li>
                <li>
                  • <strong>No re-sharing needed:</strong> Links remain the same
                </li>
                <li>
                  • <strong>Version control:</strong> All changes are tracked
                </li>
                <li>
                  • <strong>Notification options:</strong> Alert viewers of
                  major changes
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Troubleshooting Sharing Issues
          </h2>
          <div className="space-y-6">
            <div className="bg-base-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-warning" />
                Common Issues
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Link Not Working</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Check if map is still public/shared</li>
                    <li>• Verify the link is copied correctly</li>
                    <li>• Ensure map hasn&apos;t been deleted</li>
                    <li>• Try generating a new link</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Content Not Visible</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Check privacy settings</li>
                    <li>• Ensure POIs are not private</li>
                    <li>• Verify photos are uploaded</li>
                    <li>• Check if content was removed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips for Better Sharing */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Tips for Better Sharing
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-success/10 border border-success/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-success mb-3">
                For Maximum Engagement
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Use compelling map names</li>
                <li>• Add detailed descriptions</li>
                <li>• Include high-quality photos</li>
                <li>• Use relevant tags</li>
                <li>• Share at optimal times</li>
                <li>• Engage with comments</li>
              </ul>
            </div>
            <div className="bg-info/10 border border-info/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-info mb-3">
                For Personal Sharing
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Add personal stories</li>
                <li>• Include recommendations</li>
                <li>• Share travel tips</li>
                <li>• Add context for viewers</li>
                <li>• Respond to questions</li>
                <li>• Keep content updated</li>
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
            <Link href="/guide/mapInterface" className="btn btn-outline">
              Previous: Map Interface
            </Link>
            <Link href="/guide/mobileLimitations" className="btn btn-primary">
              Next: Mobile Limitations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingMapsPage;
