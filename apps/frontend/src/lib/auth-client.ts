import { createAuthClient } from 'better-auth/solid';
import { convexClient } from '@convex-dev/better-auth/client/plugins';
import { adminClient, magicLinkClient, organizationClient } from 'better-auth/client/plugins';

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

const readEnvValue = (key: string): string | undefined => {
  const meta =
    typeof import.meta !== 'undefined' && typeof (import.meta as { env?: unknown }).env === 'object'
      ? ((import.meta as { env?: Record<string, unknown> }).env ?? undefined)
      : undefined;
  const metaCandidate = meta?.[key];
  if (typeof metaCandidate === 'string' && metaCandidate.length > 0) {
    return metaCandidate;
  }

  const nodeEnv =
    typeof globalThis === 'object' && 'process' in globalThis
      ? (globalThis as { process?: { env?: Record<string, unknown> } }).process?.env
      : undefined;
  const nodeCandidate = nodeEnv?.[key];
  if (typeof nodeCandidate === 'string' && nodeCandidate.length > 0) {
    return nodeCandidate;
  }

  return undefined;
};

const rawBaseUrl = readEnvValue('VITE_CONVEX_SITE_URL') ?? readEnvValue('VITE_CONVEX_URL');

const { baseURL, basePath } = resolveBaseSettings(rawBaseUrl);

const clientOptions = {
  baseURL,
  basePath,
  plugins: [
    convexClient(),
    magicLinkClient(),
    adminClient(),
    organizationClient(),
  ],
};

type SessionQueryOptions = {
  disableCookieCache?: boolean;
  disableRefresh?: boolean;
};

type SessionApi = {
  getSession: (args?: { query?: SessionQueryOptions }) => Promise<{
    data: BetterAuthSession | null;
    error: { message?: string | null } | null;
  }>;
};

type ConvexApi = {
  convex: {
    token: () => Promise<ConvexTokenResponse>;
  };
};

type RawAuthClient = ReturnType<typeof createAuthClient<typeof clientOptions>>;

const hasSessionApi = (value: RawAuthClient): value is RawAuthClient & SessionApi => {
  const candidate = value as Partial<SessionApi>;
  return typeof candidate.getSession === 'function';
};

const hasConvexApi = (value: RawAuthClient): value is RawAuthClient & ConvexApi => {
  const candidate = value as Partial<ConvexApi>;
  return typeof candidate.convex?.token === 'function';
};

type MagicLinkApi = {
  signIn: {
    magicLink: (args: unknown) => Promise<{ error?: { message?: string | null } | null }>;
  };
  magicLink: {
    verify: (args: unknown) => Promise<{ error?: { message?: string | null } | null }>;
  };
};

const hasMagicLinkApi = (value: RawAuthClient): value is RawAuthClient & MagicLinkApi => {
  const candidate = value as Partial<MagicLinkApi>;
  return (
    typeof candidate.signIn?.magicLink === 'function' &&
    typeof candidate.magicLink?.verify === 'function'
  );
};

const ensureAuthClientCapabilities = (
  client: RawAuthClient,
): RawAuthClient & SessionApi & ConvexApi & MagicLinkApi => {
  if (!hasSessionApi(client)) {
    throw new Error('Better Auth client missing session helpers');
  }
  if (!hasConvexApi(client)) {
    throw new Error('Better Auth client missing convex token helper');
  }
  if (!hasMagicLinkApi(client)) {
    throw new Error('Better Auth client missing magic link helpers');
  }
  return client;
};

export const authClient = ensureAuthClientCapabilities(createAuthClient(clientOptions));

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

type ConvexTokenResponse = {
  data?: {
    token?: string | null;
  } | null;
};

type SessionFetchResult = Awaited<ReturnType<SessionApi['getSession']>>;

const unwrapSessionResponse = (response: SessionFetchResult): BetterAuthSession | null => {
  if (response.error) {
    return null;
  }
  const payload = response.data;
  if (!payload) {
    return null;
  }
  if (typeof (payload as { data?: unknown }).data !== 'undefined') {
    const inner = (payload as { data?: unknown; error?: unknown }).data;
    return (inner ?? null) as BetterAuthSession | null;
  }
  return payload as unknown as BetterAuthSession | null;
};

export const getBetterAuthSession = async (
  query?: SessionQueryOptions,
): Promise<BetterAuthSession | null> => {
  const response = await authClient.getSession(query ? { query } : undefined);
  return unwrapSessionResponse(response);
};

type ConvexTokenResult = Awaited<ReturnType<(typeof authClient)['convex']['token']>>;

const extractConvexToken = (result: ConvexTokenResult): string | null => {
  if (!result?.data) return null;
  const wrapped = result.data as ConvexTokenResponse;
  return wrapped?.data?.token ?? (result.data as unknown as { token?: string })?.token ?? null;
};

export const fetchConvexAuthToken = async (): Promise<string | null> => {
  const result = await authClient.convex.token();
  if (result.error) {
    throw new Error(result.error.message ?? 'Failed to fetch Convex auth token');
  }
  return extractConvexToken(result);
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
