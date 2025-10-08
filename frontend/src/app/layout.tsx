import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Header from "../components/homepage/header";
import Footer from "../components/homepage/footer";
import { QueryProvider } from "@/components/utility/tanstack/queryProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "My Trip Maps - Transform Photos into Interactive Travel Maps",
    template: "%s | My Trip Maps",
  },
  description:
    "Create interactive travel maps from your photos. Upload images, extract GPS coordinates, and build shareable travel stories. Join our community of travelers and map your adventures.",
  keywords: [
    "travel maps",
    "photo mapping",
    "GPS coordinates",
    "travel journal",
    "interactive maps",
    "travel community",
    "photo metadata",
    "travel storytelling",
    "trip planning",
    "travel memories",
  ],
  authors: [{ name: "My Trip Maps" }],
  creator: "My Trip Maps",
  publisher: "My Trip Maps",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "My Trip Maps - Transform Photos into Interactive Travel Maps",
    description:
      "Create interactive travel maps from your photos. Upload images, extract GPS coordinates, and build shareable travel stories.",
    siteName: "My Trip Maps",
    images: [
      {
        url: "/tripmap.webp",
        width: 1200,
        height: 630,
        alt: "My Trip Maps - Interactive Travel Mapping Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip Maps - Transform Photos into Interactive Travel Maps",
    description:
      "Create interactive travel maps from your photos. Upload images, extract GPS coordinates, and build shareable travel stories.",
    images: ["/tripmap.webp"],
    creator: "@mytripmaps",
    site: "@mytripmaps",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  other: {
    "theme-color": "#3B82F6",
    "color-scheme": "light dark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "My Trip Maps",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com",
              logo: `${
                process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
              }/tripmap.webp`,
              description: "Transform photos into interactive travel maps",
              sameAs: [
                "https://twitter.com/mytripmaps",
                "https://facebook.com/mytripmaps",
                "https://instagram.com/mytripmaps",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "contact@mytripmaps.com",
              },
            }),
          }}
        />

        {/* Structured Data for WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "My Trip Maps",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com",
              description: "Create interactive travel maps from your photos",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${
                    process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
                  }/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen w-full`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <Toaster
              position={"top-center"}
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#ffffff",
                  color: "#1f2937",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "1rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  maxWidth: "24rem",
                },
                success: {
                  style: {
                    background: "#d1fae5",
                    color: "#065f46",
                    border: "1px solid #10b981",
                  },
                  iconTheme: {
                    primary: "#065f46",
                    secondary: "#d1fae5",
                  },
                },
                error: {
                  style: {
                    background: "#fee2e2",
                    color: "#991b1b",
                    border: "1px solid #ef4444",
                  },
                  iconTheme: {
                    primary: "#991b1b",
                    secondary: "#fee2e2",
                  },
                },
                loading: {
                  style: {
                    background: "#dbeafe",
                    color: "#1e40af",
                    border: "1px solid #3b82f6",
                  },
                },
              }}
            />

            <Header />
            <main className="flex-grow">{children}</main>
            <div id="modal-root" />
            <Footer />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
