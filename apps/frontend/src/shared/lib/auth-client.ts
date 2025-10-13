import { createAuthClient } from 'better-auth/solid';
import { convexClient } from '@convex-dev/better-auth/client/plugins';
import {
  adminClient,
  jwtClient,
  magicLinkClient,
  oneTimeTokenClient,
  organizationClient,
} from 'better-auth/client/plugins';
import { readEnvString } from '@monte/api';

type ResolvedBaseSettings = {
  baseURL?: string;
  basePath?: string;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const resolveBaseSettings = (raw?: string): ResolvedBaseSettings => {
  if (!raw) {
    return {};
  }

  try {
    const url = new URL(raw);
    const normalizedPath = trimTrailingSlash(url.pathname);

    if (normalizedPath.endsWith('/api/auth/convex')) {
      return { baseURL: url.origin, basePath: '/api/auth' };
    }

    if (normalizedPath.endsWith('/api/auth')) {
      return { baseURL: url.origin, basePath: '/api/auth' };
    }

    return { baseURL: raw };
  } catch {
    return { baseURL: raw };
  }
};

const rawBaseUrl = readEnvString('VITE_CONVEX_SITE_URL') ?? readEnvString('VITE_CONVEX_URL');

const { baseURL, basePath } = resolveBaseSettings(rawBaseUrl);

const clientOptions = {
  baseURL,
  basePath,
  plugins: [
    convexClient(),
    magicLinkClient(),
    adminClient(),
    organizationClient(),
    jwtClient(),
    oneTimeTokenClient(),
  ],
};

export const authClient = createAuthClient(clientOptions);

export type AuthClient = typeof authClient;

export type BetterAuthSession = {
  session: {
    id: string;
    token?: string | null;
  };
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
  };
};

type SessionQueryOptions = {
  disableCookieCache?: boolean;
  disableRefresh?: boolean;
};

const unwrapSessionResponse = (response: unknown): BetterAuthSession | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }
  const candidate = response as { data?: unknown; error?: { message?: string | null } | null };
  if (candidate.error) {
    return null;
  }
  const payload = candidate.data ?? null;
  if (payload === null || typeof payload === 'undefined') {
    return null;
  }
  if (typeof (payload as { data?: unknown }).data !== 'undefined') {
    const nested = (payload as { data?: unknown }).data;
    return (nested ?? null) as BetterAuthSession | null;
  }
  return payload as BetterAuthSession;
};

export const getBetterAuthSession = async (
  query?: SessionQueryOptions,
): Promise<BetterAuthSession | null> => {
  const response = await authClient.getSession(query ? { query } : undefined);
  return unwrapSessionResponse(response);
};

export const refreshBetterAuthSession = async (): Promise<BetterAuthSession | null> => {
  try {
    const response = await authClient.getSession({
      query: {
        disableCookieCache: true,
      },
    });
    return unwrapSessionResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('aborted') || message.includes('Failed to fetch')) {
      return null;
    }
    throw error;
  }
};

export const fetchConvexAuthToken = async (): Promise<string | null> => {
  const result = await authClient.$fetch<{ token?: string; data?: { token?: string | null } | null }>(
    '/convex/token',
    {
      method: 'GET',
      throw: false,
    },
  );

  if (result?.error) {
    throw new Error(result.error.message ?? 'Failed to fetch Convex auth token');
  }

  const direct = result.data?.token ?? null;
  if (typeof direct === 'string') {
    return direct;
  }

  const nested = result.data?.data?.token;
  return typeof nested === 'string' ? nested : null;
};
