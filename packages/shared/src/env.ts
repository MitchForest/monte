import { z } from "zod";

const ServerEnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),
  APP_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  RAILWAY_API_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_ADDRESS: z.string().optional(),
  APP_ORIGINS: z.string().optional(),
  TIMEBACK_CORE_URL: z.string().optional(),
  TIMEBACK_CORE_TOKEN: z.string().optional(),
  TIMEBACK_CALIPER_URL: z.string().optional(),
  TIMEBACK_CALIPER_TOKEN: z.string().optional(),
  TIMEBACK_NAMESPACE: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function loadServerEnv(): ServerEnv {
  if (!cachedEnv) {
    cachedEnv = ServerEnvSchema.parse(process.env);
  }
  return cachedEnv;
}

export function requireServerEnv(key: keyof ServerEnv): string {
  const env = loadServerEnv();
  const value = env[key];
  if (!value) {
    throw new Error(`${String(key)} is required but not set`);
  }
  return value;
}

export function resetServerEnvCache(): void {
  cachedEnv = null;
}
