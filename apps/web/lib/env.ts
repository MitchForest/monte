import { loadServerEnv } from "@monte/shared/env";

const devApiBaseUrl = "http://localhost:8787";

export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? null,
  authMock: process.env.NEXT_PUBLIC_AUTH_MOCK === "true",
  devAccessToken: process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN ?? "dev-token",
  devUserEmail: process.env.NEXT_PUBLIC_DEV_USER_EMAIL ?? "guide@example.com",
  devUserName: process.env.NEXT_PUBLIC_DEV_USER_NAME ?? "Guide User",
  cognitoAuthority:
    process.env.NEXT_PUBLIC_COGNITO_AUTHORITY ??
    "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_H5aVRMERg",
  cognitoClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? null,
  cognitoRedirectUri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? null,
  cognitoScope: process.env.NEXT_PUBLIC_COGNITO_SCOPE ?? "openid email profile",
  cognitoLogoutUri: process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI ?? null,
} as const;

function ensureServer(): void {
  if (typeof window !== "undefined") {
    throw new Error("Server-only environment access attempted in the browser");
  }
}

export function getServerEnv() {
  ensureServer();
  return loadServerEnv();
}

export function getServerApiBaseUrl(): string {
  if (typeof window === "undefined") {
    const env = loadServerEnv();
    return (
      env.RAILWAY_API_URL ?? env.API_URL ?? env.MONTE_API_URL ?? devApiBaseUrl
    );
  }
  return publicEnv.apiUrl ?? "/api";
}

export function getNodeEnv(): string | undefined {
  return process.env.NODE_ENV;
}

export function isAuthMockEnabled(): boolean {
  const clientId = publicEnv.cognitoClientId?.trim() ?? "";
  return publicEnv.authMock || clientId.length === 0;
}
