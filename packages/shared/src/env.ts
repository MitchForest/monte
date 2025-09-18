import { z } from "zod";

const ServerEnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_SSL_MODE: z.string().optional(),
  DATABASE_SSL_REJECT_UNAUTHORIZED: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_ADDRESS: z.string().optional(),
  APP_ORIGINS: z.string().optional(),
  API_URL: z.string().optional(),
  RAILWAY_API_URL: z.string().optional(),
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
