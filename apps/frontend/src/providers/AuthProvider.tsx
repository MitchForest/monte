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
import type { UserProfile, UserRole } from '@monte/types';
import { toast } from 'solid-sonner';

import {
  authClient,
  fetchConvexAuthToken,
  getBetterAuthSession,
  refreshBetterAuthSession,
  type BetterAuthSession,
} from '../lib/auth-client';
import {
  clearAuthToken,
  ensureUserProfile,
  getCurrentUserProfile,
  setCurriculumAuthToken,
} from '../domains/curriculum/api/curriculumClient';

type AuthSession = BetterAuthSession['session'] | null;
type AuthUser = BetterAuthSession['user'] | null;

interface AuthContextValue {
  user: Accessor<AuthUser | null>;
  session: Accessor<AuthSession>;
  role: Accessor<UserRole | null>;
  profile: Accessor<UserProfile | null>;
  loading: Accessor<boolean>;
  error: Accessor<string | null>;
  isAuthenticated: Accessor<boolean>;
  signIn: (email: string, name?: string) => Promise<void>;
  signUp: (email: string, name: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>();

type PendingSignup = {
  email: string;
  name?: string;
  role?: UserRole;
};

const PENDING_SIGNUP_KEY = 'montePendingSignup';

const setPendingSignup = (payload: PendingSignup) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(payload));
};

const clearPendingSignup = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PENDING_SIGNUP_KEY);
};

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<AuthUser | null>(null);
  const [session, setSession] = createSignal<AuthSession>(null);
  const [role, setRole] = createSignal<UserRole | null>(null);
  const [profile, setProfile] = createSignal<UserProfile | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  let hydrating = false;

  const loadProfile = async () => {
    try {
      const ensuredRole = await ensureUserProfile();
      setRole(ensuredRole);
      const profileDoc = await getCurrentUserProfile();
      setProfile(profileDoc ?? null);
      if (profileDoc) {
        setRole(profileDoc.role);
      }
    } catch (err) {
      console.error('Unable to load user profile', err);
      setProfile(null);
      setRole(null);
    }
  };

  const applySession = async (payload: BetterAuthSession | null) => {
    if (!payload?.user) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      setCurriculumAuthToken(null);
      clearAuthToken();
      clearPendingSignup();
      setError(null);
      return;
    }

    setUser(payload.user);
    setSession(payload.session);

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

    await loadProfile();
    clearPendingSignup();
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
      setProfile(null);
      setRole(null);
      setCurriculumAuthToken(null);
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

  onMount(() => {
    void hydrateFromSession();

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

  const signIn = async (email: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.signIn.magicLink({
        email,
        name,
        callbackURL: '/editor',
        newUserCallbackURL: '/editor',
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

  const signUp = async (email: string, name: string, role: UserRole = 'teacher') => {
    setLoading(true);
    setError(null);
    try {
      setPendingSignup({ email, name, role });
      const result = await authClient.signIn.magicLink({
        email,
        name,
        callbackURL: '/editor',
        newUserCallbackURL: '/editor',
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
    setProfile(null);
    setRole(null);
    setError(null);
    toast.success('Signed out. See you soon!');
  };

  const context: AuthContextValue = {
    user,
    session,
    role,
    profile,
    loading,
    error,
    isAuthenticated: createMemo(() => !!user()),
    signIn,
    signUp,
    signOut,
    refresh: () => hydrateFromSession({ refresh: true }),
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
