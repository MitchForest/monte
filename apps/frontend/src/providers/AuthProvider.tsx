import {
  ParentComponent,
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js';
import type { UserProfile, UserRole } from '@monte/types';

import { authClient, subscribeToSessionChanges, type AuthSessionPayload } from '../lib/auth-client';
import { ensureUserProfile, getCurrentUserProfile, clearAuthToken } from '../domains/curriculum/api/curriculumClient';

type AuthSession = AuthSessionPayload['session'] | null;
type AuthUser = AuthSessionPayload['user'] | null;

interface AuthContextValue {
  user: () => AuthUser;
  session: () => AuthSession;
  role: () => UserRole | null;
  profile: () => UserProfile | null;
  loading: () => boolean;
  isAuthenticated: () => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>();

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<AuthUser>(null);
  const [session, setSession] = createSignal<AuthSession>(null);
  const [role, setRole] = createSignal<UserRole | null>(null);
  const [profile, setProfile] = createSignal<UserProfile | null>(null);
  const [loading, setLoading] = createSignal(true);

  const loadProfile = async () => {
    try {
      const ensuredRole = await ensureUserProfile();
      setRole(ensuredRole);
      const profileDoc = await getCurrentUserProfile();
      if (profileDoc) {
        setProfile(profileDoc);
        setRole(profileDoc.role);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Unable to load user profile', error);
      setProfile(null);
      setRole(null);
    }
  };

  const isAuthPayload = (value: unknown): value is AuthSessionPayload => {
    if (typeof value !== 'object' || value === null) return false;
    const maybe = value as Partial<AuthSessionPayload>;
    return typeof maybe.user === 'object' && maybe.user !== null && typeof maybe.session === 'object' && maybe.session !== null;
  };

  const applySession = async (sessionData: unknown) => {
    if (isAuthPayload(sessionData)) {
      const payload = sessionData;
      setUser(payload.user);
      setSession(payload.session);
      await loadProfile();
    } else {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
    }
    setLoading(false);
  };

  onMount(() => {
    void authClient
      .getSession()
      .then((payload) => applySession(payload))
      .catch((error: unknown) => {
        console.error('Unable to initialize auth session', error);
        setLoading(false);
      });

    const unsubscribe = subscribeToSessionChanges((sessionData) => {
      void applySession(sessionData);
    });

    onCleanup(() => unsubscribe());
  });

  const signOut = async () => {
    await authClient.signOut();
    clearAuthToken();
  };

  const context: AuthContextValue = {
    user,
    session,
    role,
    profile,
    loading,
    isAuthenticated: createMemo(() => !!user()),
    signOut,
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
