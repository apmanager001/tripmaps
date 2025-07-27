import React from "react";
import {
  MapPin,
  Heart,
  Users,
  Globe,
  Mail,
  Github,
  Twitter,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-base-300 text-base-content">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/tripmap.webp"
                alt="Logo"
                width="40"
                height="40"
                className="rounded-lg"
              />
              <div>
                <h3 className="text-xl font-bold text-primary">My Trip Maps</h3>
                <p className="text-sm text-gray-600">
                  Track & Share Your Adventures
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Create beautiful travel maps, discover new places, and share your
              journey with the world.
            </p>
            <div className="flex gap-3">
              <a href="#" className="btn btn-circle btn-sm btn-ghost">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="btn btn-circle btn-sm btn-ghost">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="btn btn-circle btn-sm btn-ghost">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Interactive Maps</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                <span>Social Sharing</span>
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                <span>Community</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                <span>Global Discovery</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/maps"
                  className="hover:text-primary transition-colors"
                >
                  Explore Maps
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-primary transition-colors"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-base-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} My Trip Maps. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Made with ❤️ for travelers</span>
              <span>•</span>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
