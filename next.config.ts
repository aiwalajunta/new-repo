import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Tell Next.js these env vars are optional — app runs in mock mode without them
  env: {
    NEXT_PUBLIC_SHEETS_MODE: process.env.GOOGLE_SPREADSHEET_ID ? "live" : "mock",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  // Suppress build errors for missing optional env vars
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withSerwist(nextConfig);
