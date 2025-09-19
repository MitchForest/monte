import { z } from "zod";

type LoaderCache<TValue> = {
  value: TValue | null;
};

function createLoaderCache<TValue>(): LoaderCache<TValue> {
  return { value: null };
}

export function createEnvLoader<TEnv extends Record<string, unknown>>(
  schema: z.ZodType<TEnv, z.ZodTypeDef, unknown>,
) {
  const cache = createLoaderCache<TEnv>();

  function load(): TEnv {
    if (!cache.value) {
      cache.value = schema.parse(process.env);
    }
    return cache.value;
  }

  function reset(): void {
    cache.value = null;
  }

  function requireKey<TKey extends keyof TEnv>(
    key: TKey,
  ): NonNullable<TEnv[TKey]> {
    const env = load();
    const value = env[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`${String(key)} is required but not set`);
    }
    return value as NonNullable<TEnv[TKey]>;
  }

  return {
    load,
    reset,
    requireKey,
  } as const;
}

const ServerEnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_SSL_MODE: z.string().optional(),
  DATABASE_SSL_REJECT_UNAUTHORIZED: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_ADDRESS: z.string().optional(),
  APP_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  APP_ORIGINS: z.string().optional(),
  API_URL: z.string().optional(),
  RAILWAY_API_URL: z.string().optional(),
  TIMEBACK_ORG_ALLOWLIST: z.string().optional(),
  TIMEBACK_CALIPER_TOKEN: z.string().optional(),
  TIMEBACK_CALIPER_WEBHOOK_URL: z.string().optional(),
  TIMEBACK_WORKER_TOKEN: z.string().optional(),
  TIMEBACK_ENVIRONMENT: z.string().optional(),
  TIMEBACK_TOKEN_URL: z.string().optional(),
  TIMEBACK_STAGING_TOKEN_URL: z.string().optional(),
  TIMEBACK_PRODUCTION_TOKEN_URL: z.string().optional(),
  STAGING_CLIENT_ID: z.string().optional(),
  STAGING_CLIENT_SECRET: z.string().optional(),
  PROD_CLIENT_ID: z.string().optional(),
  PROD_CLIENT_SECRET: z.string().optional(),
  TIMEBACK_STAGING_CLIENT_ID: z.string().optional(),
  TIMEBACK_STAGING_CLIENT_SECRET: z.string().optional(),
  TIMEBACK_PRODUCTION_CLIENT_ID: z.string().optional(),
  TIMEBACK_PRODUCTION_CLIENT_SECRET: z.string().optional(),
  COGNITO_AUTHORITY: z.string().optional(),
  COGNITO_JWKS_URI: z.string().optional(),
  COGNITO_AUDIENCE: z.string().optional(),
  COGNITO_CLIENT_ID: z.string().optional(),
  DEV_AUTH_BYPASS: z.string().optional(),
  DEV_USER_EMAIL: z.string().optional(),
  DEV_USER_NAME: z.string().optional(),
  DEV_ORG_NAME: z.string().optional(),
  DEV_ORGANIZATION_ID: z.string().optional(),
  DEFAULT_ORGANIZATION_ID: z.string().optional(),
  DEV_ONEROSTER_ORG_ID: z.string().optional(),
  DEV_ONEROSTER_USER_ID: z.string().optional(),
  DEV_ONEROSTER_ID: z.string().optional(),
  DEV_USER_ROLE: z.string().optional(),
  MONTE_ONEROSTER_ORG_ID: z.string().optional(),
  ONEROSTER_STAGING_API_URL: z.string().optional(),
  ONEROSTER_PROD_API_URL: z.string().optional(),
  ONEROSTER_API_URL: z.string().optional(),
  CALIPER_STAGING_API_URL: z.string().optional(),
  CALIPER_PROD_API_URL: z.string().optional(),
  CALIPER_API_URL: z.string().optional(),
  MONTE_API_URL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

const serverEnvLoader = createEnvLoader(ServerEnvSchema);

export function loadServerEnv(): ServerEnv {
  return serverEnvLoader.load();
}

export function requireServerEnv(key: keyof ServerEnv): string {
  return serverEnvLoader.requireKey(key);
}

export function resetServerEnvCache(): void {
  serverEnvLoader.reset();
}
