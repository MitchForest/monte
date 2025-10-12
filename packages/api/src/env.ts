const readMetaEnvValue = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && typeof (import.meta as { env?: unknown }).env === 'object') {
    const env = (import.meta as { env?: Record<string, unknown> }).env;
    const candidate = env?.[key];
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
};

const readNodeEnvValue = (key: string): string | undefined => {
  if (typeof globalThis === 'object' && 'process' in globalThis) {
    const env = (globalThis as { process?: { env?: Record<string, unknown> } }).process?.env;
    const candidate = env?.[key];
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
};

export const readEnvString = (key: string): string | undefined =>
  readMetaEnvValue(key) ?? readNodeEnvValue(key);

export const requireEnvString = (key: string): string => {
  const value = readEnvString(key);
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  throw new Error(`Missing required environment variable: ${key}`);
};
