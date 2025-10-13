import {
  ParentComponent,
  createContext,
  onCleanup,
  onMount,
  useContext,
  type Accessor,
} from 'solid-js';

import {
  createAuthStore,
  type AuthSession,
  type AuthUser,
} from '../domains/auth/state/authStore';
import type { AuthMember, AuthOrganization } from '../domains/auth/organizationClient';
import type { OrganizationRole, UserRole } from '../domains/auth/types';

interface AuthContextValue {
  user: Accessor<AuthUser | null>;
  session: Accessor<AuthSession>;
  role: Accessor<UserRole | null>;
  membershipRole: Accessor<OrganizationRole | null>;
  organizations: Accessor<AuthOrganization[]>;
  activeOrganization: Accessor<AuthOrganization | null>;
  activeMembership: Accessor<AuthMember | null>;
  impersonatedBy: Accessor<string | null>;
  loading: Accessor<boolean>;
  error: Accessor<string | null>;
  isAuthenticated: Accessor<boolean>;
  signIn: (email: string, name?: string) => Promise<void>;
  signUp: (email: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  reloadOrganizations: () => Promise<void>;
  setActiveOrganization: (organizationId?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>();

export const AuthProvider: ParentComponent = (props) => {
  const store = createAuthStore();

  onMount(() => store.lifecycle.mount());
  onCleanup(() => store.lifecycle.unmount());

  const contextValue: AuthContextValue = {
    user: store.state.user,
    session: store.state.session,
    role: store.state.role,
    membershipRole: store.state.membershipRole,
    organizations: store.state.organizations,
    activeOrganization: store.state.activeOrganization,
    activeMembership: store.state.activeMembership,
    impersonatedBy: store.state.impersonatedBy,
    loading: store.state.loading,
    error: store.state.error,
    isAuthenticated: store.state.isAuthenticated,
    signIn: store.actions.signIn,
    signUp: store.actions.signUp,
    signOut: store.actions.signOut,
    refresh: store.actions.refresh,
    reloadOrganizations: store.actions.reloadOrganizations,
    setActiveOrganization: store.actions.setActiveOrganization,
  } satisfies AuthContextValue;

  return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
