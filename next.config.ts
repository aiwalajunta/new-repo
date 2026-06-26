import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withSerwist(nextConfig);
