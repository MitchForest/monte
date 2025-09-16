import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BETTER_AUTH_URL:
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
  },
  // Skip type checking during build (we do it separately)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Skip ESLint during build (we use Biome)
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8787/:path*",
        },
      ];
    }

    // In production, use the API URL from env or fall back to relative paths
    const apiUrl = process.env.RAILWAY_API_URL || process.env.API_URL;
    if (apiUrl) {
      return [
        {
          source: "/api/:path*",
          destination: `${apiUrl}/:path*`,
        },
      ];
    }

    // If no API URL is configured, don't rewrite (use same origin)
    return [];
  },
};

export default nextConfig;
