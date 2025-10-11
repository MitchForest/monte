const readEnvFlag = (key: string): boolean => {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  const nodeEnv = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const raw = metaEnv[key] ?? nodeEnv[key] ?? undefined;
  if (!raw) return false;
  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
};

export const featureTimeline = readEnvFlag('VITE_FEATURE_TIMELINE');
