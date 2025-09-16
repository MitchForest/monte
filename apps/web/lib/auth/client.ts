"use client";

import { createAuthClient } from "better-auth/react";

// Use the full URL in every environment so better-auth has an absolute base
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
};

export const authClient = createAuthClient({
  baseURL: `${getBaseURL()}/api/auth`,
  fetchOptions: {
    throw: true,
  },
});
