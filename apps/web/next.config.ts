import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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

    const apiUrl = process.env.RAILWAY_API_URL;
    if (!apiUrl) {
      throw new Error("RAILWAY_API_URL must be configured in production");
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
