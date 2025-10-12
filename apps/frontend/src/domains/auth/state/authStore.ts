import { createMemo, createSignal } from 'solid-js';
import { toast } from 'solid-sonner';

import type { UserRole } from '@monte/types';
import type { BetterAuthSession } from '../../../lib/auth-client';
import {
  authClient,
  fetchConvexAuthToken,
  getBetterAuthSession,
  refreshBetterAuthSession,
} from '../../../lib/auth-client';
import {
  clearAuthToken,
  setCurriculumAuthToken,
} from '../../curriculum/api/curriculumClient';
import {
  getActiveMember,
  listOrganizations,
  setActiveOrganization as setOrganizationActive,
  type AuthMember,
  type AuthOrganization,
} from '../organizationClient';

export type AuthSession = BetterAuthSession['session'] | null;
export type AuthUser = BetterAuthSession['user'] | null;

const extractImpersonator = (session: AuthSession): string | null => {
  if (!session) return null;
  const candidate = (session as unknown as { impersonatedBy?: unknown }).impersonatedBy;
  return typeof candidate === 'string' && candidate.trim().length > 0 ? candidate : null;
};

const normalizeRole = (raw: unknown): UserRole | null => {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed === 'admin' || trimmed === 'user' ? trimmed : null;
};

export interface AuthStore {
  state: {
    user: () => AuthUser | null;
    session: () => AuthSession;
    role: () => UserRole | null;
    organizations: () => AuthOrganization[];
    activeOrganization: () => AuthOrganization | null;
    activeMembership: () => AuthMember | null;
    impersonatedBy: () => string | null;
    loading: () => boolean;
    error: () => string | null;
    isAuthenticated: () => boolean;
  };
  actions: {
    signIn: (email: string, name?: string) => Promise<void>;
    signUp: (email: string, name?: string) => Promise<void>;
    signOut: () => Promise<void>;
    refresh: () => Promise<void>;
    reloadOrganizations: () => Promise<void>;
    setActiveOrganization: (organizationId?: string | null) => Promise<void>;
  };
  lifecycle: {
    mount: () => void;
    unmount: () => void;
  };
}

export const createAuthStore = (): AuthStore => {
  const [user, setUser] = createSignal<AuthUser | null>(null);
  const [session, setSession] = createSignal<AuthSession>(null);
  const [role, setRole] = createSignal<UserRole | null>(null);
  const [organizations, setOrganizations] = createSignal<AuthOrganization[]>([]);
  const [activeMembership, setActiveMembership] = createSignal<AuthMember | null>(null);
  const [impersonatedBy, setImpersonatedBy] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const activeOrganization = createMemo(() => {
    const membership = activeMembership();
    if (!membership?.organizationId) return null;
    return organizations().find((org) => org.id === membership.organizationId) ?? null;
  });

  let hydrating = false;
  let visibilityHandler: (() => void) | undefined;

  const resetState = () => {
    setUser(null);
    setSession(null);
    setRole(null);
    setOrganizations([]);
    setActiveMembership(null);
    setImpersonatedBy(null);
    setCurriculumAuthToken(null);
    clearAuthToken();
  };

  const hydrateOrganizations = async () => {
    try {
      const [orgs, membership] = await Promise.all([
        listOrganizations().catch((err) => {
          console.warn('Unable to list organizations', err);
          return [] as AuthOrganization[];
        }),
        getActiveMember().catch((err) => {
          console.warn('Unable to load active membership', err);
          return null;
        }),
      ]);
      setOrganizations(orgs);
      setActiveMembership(membership);
    } catch (err) {
      console.warn('Unable to hydrate organization state', err);
      setOrganizations([]);
      setActiveMembership(null);
    }
  };

  const applySession = async (payload: BetterAuthSession | null) => {
    if (!payload?.user) {
      resetState();
      setError(null);
      return;
    }

    setUser(payload.user);
    setSession(payload.session);
    setRole(normalizeRole(payload.user.role));
    setImpersonatedBy(extractImpersonator(payload.session));

    try {
      const token = await fetchConvexAuthToken();
      if (token) {
        setCurriculumAuthToken(token);
      } else {
        clearAuthToken();
      }
    } catch (err) {
      console.warn('Unable to fetch Convex auth token', err);
      clearAuthToken();
    }

    await hydrateOrganizations();
    setError(null);
  };

  const hydrateFromSession = async (options?: { refresh?: boolean }) => {
    if (hydrating) return;
    hydrating = true;
    setLoading(true);
    try {
      let sessionPayload: BetterAuthSession | null = null;
      if (options?.refresh) {
        sessionPayload = await refreshBetterAuthSession().catch((err) => {
          console.warn('Session refresh failed', err);
          return null;
        });
      }
      sessionPayload = sessionPayload ?? (await getBetterAuthSession());
      await applySession(sessionPayload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to refresh session';
      console.error('Auth hydration failed', err);
      resetState();
      setError(message);
      await authClient
        .signOut()
        .catch((signOutError: unknown) =>
          console.warn('Better Auth sign out failed', signOutError),
        );
    } finally {
      setLoading(false);
      hydrating = false;
    }
  };

  const signIn = async (email: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.signIn.magicLink({
        email: email.trim(),
        name: name?.trim() || undefined,
        callbackURL: '/app',
        newUserCallbackURL: '/app',
        errorCallbackURL: '/auth/sign-in',
      });
      const magicError = (result as { error?: { message?: string | null } | null }).error;
      if (magicError) {
        throw new Error(magicError.message ?? 'Unable to send magic link');
      }
      toast.success('Magic link sent! Check your email to continue.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to send magic link';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, name?: string) => {
    await signIn(email, name);
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn('Better Auth sign out error', err);
    }
    resetState();
    setError(null);
    toast.success('Signed out. See you soon!');
  };

  const reloadOrganizations = async () => {
    await hydrateOrganizations();
  };

  const setActiveOrganization = async (organizationId?: string | null) => {
    await setOrganizationActive(organizationId ?? null);
    await hydrateOrganizations();
  };

  const refresh = async () => hydrateFromSession({ refresh: true });

  const mount = () => {
    void hydrateFromSession();
    if (typeof document !== 'undefined') {
      visibilityHandler = () => {
        if (!document.hidden) {
          void hydrateFromSession({ refresh: true });
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  };

  const unmount = () => {
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = undefined;
    }
  };

  return {
    state: {
      user,
      session,
      role,
      organizations,
      activeOrganization,
      activeMembership,
      impersonatedBy,
      loading,
      error,
      isAuthenticated: () => Boolean(user()),
    },
    actions: {
      signIn,
      signUp,
      signOut,
      refresh,
      reloadOrganizations,
      setActiveOrganization,
    },
    lifecycle: {
      mount,
      unmount,
    },
  } satisfies AuthStore;
};
