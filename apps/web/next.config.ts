import type { NextConfig } from "next";

import { loadServerEnv } from "@monte/shared/env";

const nextConfig: NextConfig = {
  // Skip type checking during build (we do it separately)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Skip ESLint during build (we use Biome)
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const currentEnv = loadServerEnv();
    const isDev = currentEnv.NODE_ENV !== "production";
    if (isDev) {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8787/:path*",
        },
      ];
    }

    // In production, use the API URL from env or fall back to relative paths
    const apiUrl = currentEnv.RAILWAY_API_URL || currentEnv.API_URL;
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
