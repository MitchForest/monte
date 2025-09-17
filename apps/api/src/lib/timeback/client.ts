import { loadServerEnv } from "@monte/shared";
import { TimebackClient } from "@monte/timeback-sdk";

let cachedClient: TimebackClient | null = null;

export function getTimebackClient(): TimebackClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const env = loadServerEnv();

  const coreUrl = env.TIMEBACK_CORE_URL?.trim();
  const coreToken = env.TIMEBACK_CORE_TOKEN?.trim();
  const caliperUrl = env.TIMEBACK_CALIPER_URL?.trim();
  const caliperToken = env.TIMEBACK_CALIPER_TOKEN?.trim();

  if (!coreUrl || !coreToken || !caliperUrl || !caliperToken) {
    return null;
  }

  const namespace = env.TIMEBACK_NAMESPACE ?? null;

  cachedClient = new TimebackClient({
    core: {
      baseUrl: coreUrl,
      token: coreToken,
      namespace,
    },
    caliper: {
      baseUrl: caliperUrl,
      token: caliperToken,
    },
  });

  return cachedClient;
}

export function resetTimebackClient(): void {
  cachedClient = null;
}

export function isTimebackConfigured(): boolean {
  const env = loadServerEnv();
  return (
    Boolean(env.TIMEBACK_CORE_URL) &&
    Boolean(env.TIMEBACK_CORE_TOKEN) &&
    Boolean(env.TIMEBACK_CALIPER_URL) &&
    Boolean(env.TIMEBACK_CALIPER_TOKEN)
  );
}
