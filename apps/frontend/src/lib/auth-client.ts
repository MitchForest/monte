import { createAuthClient } from 'better-auth/client';
import { convexClient } from '@convex-dev/better-auth/client/plugins';

import { setCurriculumAuthToken } from '../domains/curriculum/api/curriculumClient';

export interface SessionShape {
  token?: string | null;
  userId?: string;
  expiresAt?: string | number;
}

export interface UserShape {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export type AuthSessionPayload = {
  session: SessionShape;
  user: UserShape;
};

const resolveBaseUrl = () => {
  const candidate =
    (import.meta.env.VITE_CONVEX_SITE_URL as string | undefined) ??
    (import.meta.env.VITE_CONVEX_URL as string | undefined);

  if (candidate && candidate.length > 0) {
    return candidate;
  }

  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }

  return 'http://localhost:3000';
};

const isSessionPayload = (value: unknown): value is AuthSessionPayload => {
  if (typeof value !== 'object' || value === null) return false;
  const maybe = value as Partial<AuthSessionPayload>;
  return typeof maybe.user === 'object' && maybe.user !== null && typeof maybe.session === 'object' && maybe.session !== null;
};

const applySessionToken = (payload: unknown) => {
  if (isSessionPayload(payload)) {
    const tokenCandidate = payload.session.token;
    const token = typeof tokenCandidate === 'string' ? tokenCandidate : null;
    setCurriculumAuthToken(token);
    return;
  }
  setCurriculumAuthToken(null);
};

export const authClient = createAuthClient({
  baseURL: resolveBaseUrl(),
  plugins: [convexClient()],
});

void authClient.getSession().then((payload) => applySessionToken(payload));

const subscribeToSessionChanges = (handler: (payload: unknown) => void) => {
  const fn = (authClient as { onSessionChange?: (listener: (payload: unknown) => void) => () => void }).onSessionChange;
  if (typeof fn === 'function') {
    return fn(handler);
  }
  return () => {};
};

subscribeToSessionChanges((session) => {
  applySessionToken(session);
});

export { subscribeToSessionChanges };

export type AuthClient = typeof authClient;
