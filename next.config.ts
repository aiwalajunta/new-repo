import type { NextConfig } from "next";

// Removed Serwist/PWA for now — service worker was intercepting /api/auth/* calls
// and causing login to fail with net::ERR_FAILED
// Re-enable after auth is stable

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "googleapis",
    "google-auth-library",
    "gcp-metadata",
    "google-logging-utils",
    "bcryptjs",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
