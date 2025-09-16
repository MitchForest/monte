"use client";

import { createAuthClient } from "better-auth/react";

// Use the full URL during build/SSR, relative URL on client
const getBaseURL = () => {
  if (typeof window === "undefined") {
    // Server-side / build time
    return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
  // Client-side - use relative URL
  return "";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL() + "/api/auth",
});
