import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

function resolveBaseURL(): string {
  // During build time, we need the full URL
  const explicit =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL;
  
  if (process.env.NODE_ENV !== "production") {
    const resolved = explicit || "http://localhost:3000";
    process.stdout.write(
      `auth base URL resolved to ${resolved}\n`
    );
  }
  
  if (explicit) {
    return explicit;
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return "http://localhost:3000";
}

type GlobalAuth = {
  __monteBetterAuth?: ReturnType<typeof betterAuth>;
};

const globalAuth = globalThis as GlobalAuth;

const initializedAuth =
  globalAuth.__monteBetterAuth ??
  betterAuth({
    appName: "Monte",
    baseURL: resolveBaseURL(),
    basePath: "/api/auth",
    secret: process.env.BETTER_AUTH_SECRET,
    database: {
      db,
      type: "postgres",
      casing: "snake",
    },
    plugins: [nextCookies()],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    user: {
      modelName: "users",
      fields: {
        email: "email",
        name: "name",
        image: "image_url",
        createdAt: "created_at",
        updatedAt: "updated_at",
        emailVerified: "email_verified",
      },
    },
    session: {
      modelName: "auth_sessions",
      fields: {
        userId: "user_id",
        token: "token",
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
      },
    },
    account: {
      modelName: "auth_accounts",
      fields: {
        accountId: "account_id",
        providerId: "provider_id",
        userId: "user_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        scope: "scope",
        password: "password",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    verification: {
      modelName: "auth_verifications",
      fields: {
        identifier: "identifier",
        value: "value",
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },
  });

globalAuth.__monteBetterAuth = initializedAuth;

export const auth = initializedAuth;
