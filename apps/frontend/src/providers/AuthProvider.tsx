import {
  ParentComponent,
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  type Accessor,
} from 'solid-js';
import type { OrganizationPlanKey, UserRole } from '@monte/types';
import { toast } from 'solid-sonner';

import {
  authClient,
  fetchConvexAuthToken,
  getBetterAuthSession,
  refreshBetterAuthSession,
  type AuthClient,
  type BetterAuthSession,
} from '../lib/auth-client';
import {
  clearAuthToken,
  setCurriculumAuthToken,
} from '../domains/curriculum/api/curriculumClient';
import {
  acceptInvitation,
  createOrganization,
  getActiveMember,
  listOrganizations,
  setActiveOrganization as setOrganizationActive,
  type AuthMember,
  type AuthOrganization,
} from '../domains/auth/organizationClient';

type AuthSession = BetterAuthSession['session'] | null;
type AuthUser = BetterAuthSession['user'] | null;

interface AuthContextValue {
  user: Accessor<AuthUser | null>;
  session: Accessor<AuthSession>;
  role: Accessor<UserRole | null>;
  organizations: Accessor<AuthOrganization[]>;
  activeOrganization: Accessor<AuthOrganization | null>;
  activeMembership: Accessor<AuthMember | null>;
  impersonatedBy: Accessor<string | null>;
  loading: Accessor<boolean>;
  error: Accessor<string | null>;
  isAuthenticated: Accessor<boolean>;
  signIn: (email: string) => Promise<void>;
  signUp: (intent: SignupIntent) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  reloadOrganizations: () => Promise<void>;
  setActiveOrganization: (organizationId?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>();

type SignupOrgDetails = {
  name: string;
  slug?: string;
  planKey?: OrganizationPlanKey;
  billingCycle?: 'monthly' | 'annual';
};

type SignupJoinDetails = {
  organizationId?: string;
  organizationSlug?: string;
  joinCode?: string;
  invitationId?: string;
};

type SignupIntent = {
  email: string;
  name?: string;
  role: UserRole;
  internalAccessCode?: string;
  org?: SignupOrgDetails;
  join?: SignupJoinDetails;
};

type PendingSignup = {
  email: string;
  name?: string;
  role: UserRole;
  internalAccessCode?: string;
  org?: SignupOrgDetails;
  join?: SignupJoinDetails;
};

type FetchResult<T> = {
  data?: T;
  error?: {
    message?: string | null;
  } | null;
};

const fetchFromAuth = async <T,>(
  path: string,
  {
    method,
    body,
    query,
  }: {
    method: 'GET' | 'POST';
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  },
  errorMessage: string,
): Promise<T> => {
  const result = (await authClient.$fetch(path, {
    method,
    body,
    query,
    throw: false,
  })) as FetchResult<T>;

  if (result?.error) {
    throw new Error(result.error.message ?? errorMessage);
  }

  return result?.data as T;
};

const normalizeGlobalRole = (value: unknown): UserRole | null => {
  if (Array.isArray(value)) {
    return normalizeGlobalRole(value[0]);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === 'internal' || trimmed === 'admin' || trimmed === 'guide' || trimmed === 'guardian' || trimmed === 'student') {
      return trimmed as UserRole;
    }
  }
  return null;
};

const PENDING_SIGNUP_KEY = 'montePendingSignup';

const setPendingSignup = (payload: PendingSignup) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(payload));
};

const getPendingSignup = (): PendingSignup | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.sessionStorage.getItem(PENDING_SIGNUP_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as PendingSignup;
  } catch (error) {
    console.warn('Unable to parse pending signup payload', error);
    return null;
  }
};

const clearPendingSignup = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PENDING_SIGNUP_KEY);
};

type CrossDomainVerificationResult = {
  data?: {
    session?: {
      token?: string | null;
    } | null;
  } | null;
  error?: {
    message?: string | null;
  } | null;
};

type CrossDomainActions = {
  oneTimeToken: {
    verify: (args: { token: string }) => Promise<CrossDomainVerificationResult>;
  };
  updateSession?: () => void;
};

type AuthClientWithCrossDomain = AuthClient & {
  crossDomain?: CrossDomainActions;
};

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<AuthUser | null>(null);
  const [session, setSession] = createSignal<AuthSession>(null);
  const [role, setRole] = createSignal<UserRole | null>(null);
  const [organizations, setOrganizations] = createSignal<AuthOrganization[]>([]);
  const [activeMembership, setActiveMembership] = createSignal<AuthMember | null>(null);
  const [impersonatedBy, setImpersonatedBy] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  let hydrating = false;

  const activeOrganization = createMemo(() => {
    const current = activeMembership()?.organizationId;
    if (!current) return null;
    return organizations().find((org) => org.id === current) ?? null;
  });

  const loadOrganizationState = async () => {
    try {
      const [orgs, membership] = await Promise.all([
        listOrganizations().catch((err) => {
          console.error('Unable to list organizations', err);
          return [];
        }),
        getActiveMember().catch((err) => {
          console.warn('Unable to read active membership', err);
          return null;
        }),
      ]);
      setOrganizations(orgs);
      setActiveMembership(membership);
    } catch (err) {
      console.error('Unable to load organization state', err);
      setOrganizations([]);
      setActiveMembership(null);
    }
  };

  const getCrossDomainActions = (): CrossDomainActions | null => {
    const candidate = (authClient as AuthClientWithCrossDomain).crossDomain as
      | (Partial<CrossDomainActions> & CrossDomainActions)
      | undefined;
    if (candidate && typeof candidate.oneTimeToken?.verify === 'function') {
      return candidate as CrossDomainActions;
    }
    return null;
  };

  const finalizeOneTimeToken = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      return false;
    }

    const url = new URL(window.location.href);
    const token = url.searchParams.get('ott');
    if (!token) {
      return false;
    }

    const crossDomain = getCrossDomainActions();
    if (!crossDomain) {
      url.searchParams.delete('ott');
      window.history.replaceState({}, '', url.toString());
      return false;
    }

    try {
      const result = await crossDomain.oneTimeToken.verify({ token });
      const verificationError = result.error;
      if (verificationError) {
        throw new Error(verificationError.message ?? 'Unable to verify magic link');
      }

      const sessionPayload = result.data?.session;
      if (sessionPayload?.token) {
        await authClient.getSession({
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${sessionPayload.token}`,
            },
          },
        });
      } else {
        await authClient.getSession({
          query: {
            disableCookieCache: true,
          },
        });
      }

      crossDomain.updateSession?.();
      return true;
    } catch (err) {
      console.error('One-time token verification failed', err);
      toast.error('Your sign-in link expired or was already used. Please request a new one.');
      return false;
    } finally {
      url.searchParams.delete('ott');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const applySession = async (payload: BetterAuthSession | null) => {
    if (!payload?.user) {
      setUser(null);
      setSession(null);
      setRole(null);
      setImpersonatedBy(null);
      setOrganizations([]);
      setActiveMembership(null);
      setCurriculumAuthToken(null);
      clearAuthToken();
      setError(null);
      return;
    }

    setUser(payload.user);
    setSession(payload.session);

    const impersonatedByValue = (payload.session as unknown as { impersonatedBy?: string | null })?.impersonatedBy ?? null;
    setImpersonatedBy(typeof impersonatedByValue === 'string' ? impersonatedByValue : null);

    try {
      const userData = await fetchFromAuth<{ user?: { role?: string | string[] } }>(
        '/admin/get-user',
        {
          method: 'GET',
          query: {
            id: payload.user.id,
          },
        },
        'Unable to load user details',
      );
      setRole(normalizeGlobalRole(userData?.user?.role));
    } catch (err) {
      console.warn('Unable to load user role', err);
      setRole(null);
    }

    try {
      const token = await fetchConvexAuthToken().catch((err) => {
        console.warn('Unable to fetch Convex auth token', err);
        return null;
      });
      if (token) {
        setCurriculumAuthToken(token);
      } else {
        setCurriculumAuthToken(null);
        clearAuthToken();
      }
    } catch (err) {
      console.warn('Convex auth token fetch failed', err);
      setCurriculumAuthToken(null);
      clearAuthToken();
    }

    await loadOrganizationState();
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
      setUser(null);
      setSession(null);
      setRole(null);
      setCurriculumAuthToken(null);
      setOrganizations([]);
      setActiveMembership(null);
      setError(message);
      toast.error('Session refresh failed. Please sign in again.');
      await authClient
        .signOut()
        .catch((signOutError) => console.warn('Better Auth sign out failed', signOutError));
    } finally {
      setLoading(false);
      hydrating = false;
    }
  };

  const createPendingSignupPayload = (intent: SignupIntent): PendingSignup => {
    const normalize = (value?: string | null) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    };

    const pending: PendingSignup = {
      email: intent.email,
      name: normalize(intent.name),
      role: intent.role,
      internalAccessCode: normalize(intent.internalAccessCode),
    };

    if (intent.org) {
      pending.org = {
        name: intent.org.name.trim(),
        slug: normalize(intent.org.slug),
        planKey: intent.org.planKey,
        billingCycle: intent.org.billingCycle,
      };
    }

    if (intent.join) {
      pending.join = {
        organizationId: normalize(intent.join.organizationId),
        organizationSlug: normalize(intent.join.organizationSlug),
        joinCode: normalize(intent.join.joinCode),
        invitationId: normalize(intent.join.invitationId),
      };
    }

    return pending;
  };

  const completePendingSignup = async () => {
    const pending = getPendingSignup();
    if (!pending) {
      return;
    }

    try {
      const sessionPayload = await refreshBetterAuthSession();
      const currentUser = sessionPayload?.user;
      if (!sessionPayload || !currentUser?.id) {
        throw new Error('Authentication required to finish setup');
      }

      if (pending.name?.trim()) {
        await fetchFromAuth(
          '/admin/update-user',
          {
            method: 'POST',
            body: {
              userId: currentUser.id,
              data: {
                name: pending.name.trim(),
              },
            },
          },
          'Unable to update profile',
        );
      }

      if (pending.role === 'internal') {
        const requiredCode = import.meta.env.VITE_INTERNAL_ACCESS_CODE ?? undefined;
        if (requiredCode && pending.internalAccessCode !== requiredCode) {
          throw new Error('Invalid internal access code');
        }
      }

      await fetchFromAuth(
        '/admin/set-role',
        {
          method: 'POST',
          body: {
            userId: currentUser.id,
            role: pending.role,
          },
        },
        'Unable to assign role',
      );

      if (pending.role === 'admin') {
        const orgInput = pending.org;
        if (!orgInput?.name?.trim()) {
          throw new Error('Organization name is required to create an admin account');
        }

        const organization = await createOrganization({
          name: orgInput.name.trim(),
          slug: orgInput.slug,
          planKey: orgInput.planKey,
          billingCycle: orgInput.billingCycle,
        });

        await setOrganizationActive(organization.id);
      } else if (pending.role === 'internal') {
        await setOrganizationActive(null);
      } else {
        const invitationId = pending.join?.invitationId;
        if (!invitationId) {
          throw new Error('An invitation is required to join this organization.');
        }

        const membership = await acceptInvitation(invitationId);
        if (membership?.organizationId) {
          await setOrganizationActive(membership.organizationId);
        }
      }

      clearPendingSignup();
      await loadOrganizationState();
    } catch (err) {
      console.error('Pending signup initialization failed', err);
      toast.error(
        err instanceof Error ? err.message : 'We could not finish setting up your account. Please request a new link or contact support.',
      );
    }
  };

  onMount(() => {
    void (async () => {
      const verified = await finalizeOneTimeToken();
      if (verified) {
        await completePendingSignup();
      }
      await hydrateFromSession({ refresh: verified || undefined });
    })();

    if (typeof window !== 'undefined') {
      const handleFocus = () => void hydrateFromSession({ refresh: true });
      const handleVisibility = () => {
        if (!document.hidden) {
          void hydrateFromSession({ refresh: true });
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibility);

      onCleanup(() => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibility);
      });
    }
  });

  const signIn = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.signIn.magicLink({
        email,
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

  const signUp = async (intent: SignupIntent) => {
    setLoading(true);
    setError(null);
    try {
      const pending = createPendingSignupPayload(intent);
      if (pending.role === 'internal') {
        const requiredCode = import.meta.env.VITE_INTERNAL_ACCESS_CODE ?? undefined;
        if (requiredCode && pending.internalAccessCode !== requiredCode) {
          throw new Error('Enter the internal access code provided by the Monte team.');
        }
      } else if (pending.role === 'admin') {
        if (!pending.org?.name?.trim()) {
          throw new Error('Organization name is required to create a new account.');
        }
      } else if (!pending.join?.invitationId) {
        throw new Error('Provide a valid invitation to join your organization.');
      }

      setPendingSignup(pending);
      const result = await authClient.signIn.magicLink({
        email: intent.email,
        name: intent.name,
        callbackURL: '/app',
        newUserCallbackURL: '/app',
        errorCallbackURL: '/auth/sign-in',
      });
      const magicError = (result as { error?: { message?: string | null } | null }).error;
      if (magicError) {
        clearPendingSignup();
        throw new Error(magicError.message ?? 'Unable to create account');
      }
      toast.success('Magic link sent! Check your email to finish signing up.');
    } catch (err) {
      clearPendingSignup();
      const message = err instanceof Error ? err.message : 'Unable to create account';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn('Better Auth sign out error', err);
    }
    setCurriculumAuthToken(null);
    clearAuthToken();
    setUser(null);
    setSession(null);
    setRole(null);
    setOrganizations([]);
    setActiveMembership(null);
    setImpersonatedBy(null);
    setError(null);
    clearPendingSignup();
    toast.success('Signed out. See you soon!');
  };

  const reloadOrganizations = async () => {
    await loadOrganizationState();
  };

  const setActiveOrganization = async (organizationId?: string | null) => {
    await setOrganizationActive(organizationId ?? null);
    await loadOrganizationState();
  };

  const context: AuthContextValue = {
    user,
    session,
    role,
    organizations,
    activeOrganization,
    activeMembership,
    impersonatedBy,
    loading,
    error,
    isAuthenticated: createMemo(() => !!user()),
    signIn,
    signUp,
    signOut,
    refresh: () => hydrateFromSession({ refresh: true }),
    reloadOrganizations,
    setActiveOrganization,
  };

  return <AuthContext.Provider value={context}>{props.children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
