import { hc } from "hono/client";
import type { ApiApp } from "@monte/api";

const devBase = "http://localhost:8787";

function resolveBaseUrl() {
  if (process.env.NODE_ENV === "production") {
    const apiUrl = process.env.RAILWAY_API_URL;
    if (!apiUrl) {
      throw new Error("RAILWAY_API_URL must be configured in production");
    }
    return apiUrl;
  }
  return devBase;
}

export const api = hc<ApiApp>(resolveBaseUrl());
export type ApiClient = typeof api;
