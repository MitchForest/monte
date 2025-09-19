import { loadServerEnv, resetServerEnvCache } from "@monte/shared/env";

type ApiEnv = {
  NODE_ENV?: "development" | "test" | "production";
  PORT?: string;
  API_URL?: string;
  APP_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  APP_ORIGINS?: string;
  COGNITO_AUTHORITY?: string;
  COGNITO_JWKS_URI?: string;
  COGNITO_AUDIENCE?: string;
  COGNITO_CLIENT_ID?: string;
  DEV_AUTH_BYPASS?: "true" | "false";
  DEV_USER_EMAIL?: string;
  DEV_USER_NAME?: string;
  DEV_ORG_NAME?: string;
  DEV_ORGANIZATION_ID?: string;
  DEFAULT_ORGANIZATION_ID?: string;
  DEV_ONEROSTER_ORG_ID?: string;
  DEV_ONEROSTER_USER_ID?: string;
  DEV_ONEROSTER_ID?: string;
  DEV_USER_ROLE?: string;
  MONTE_ONEROSTER_ORG_ID?: string;
  ONEROSTER_STAGING_API_URL?: string;
  TIMEBACK_ORG_ALLOWLIST?: string;
  TIMEBACK_CALIPER_TOKEN?: string;
  TIMEBACK_CALIPER_WEBHOOK_URL?: string;
  TIMEBACK_WORKER_TOKEN?: string;
};

function readEnv(): ApiEnv {
  return loadServerEnv() as ApiEnv;
}

export function loadApiEnv(): ApiEnv {
  return readEnv();
}

export function resetApiEnv(): void {
  resetServerEnvCache();
}

export function requireApiEnv<TKey extends keyof ApiEnv>(
  key: TKey,
): NonNullable<ApiEnv[TKey]> {
  const env = readEnv();
  const value = env[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(`${String(key)} is required but not set`);
  }
  return value as NonNullable<ApiEnv[TKey]>;
}

export function getPort(): number {
  const envPort = readEnv().PORT;
  const parsed = envPort ? Number.parseInt(envPort, 10) : Number.NaN;
  if (Number.isNaN(parsed)) {
    return 8787;
  }
  return parsed;
}

export function getCorsOrigins(): string[] {
  const env = readEnv();
  const defaultOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    env.NEXT_PUBLIC_APP_URL,
    env.APP_URL,
  ].filter((value): value is string => Boolean(value));

  const configuredOrigins = (env.APP_ORIGINS ?? "")
    .split(",")
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (defaultOrigins.length > 0) {
    return defaultOrigins;
  }

  return ["*"];
}
