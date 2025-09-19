"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import {
  type AuthProviderProps,
  AuthProvider as OidcAuthProvider,
  useAuth,
} from "react-oidc-context";

import { devAccessToken, isMockAuthMode } from "@/lib/auth/config";
import { syncSessionCookie } from "@/lib/auth/session-sync";
import { setAccessToken } from "@/lib/auth/token-store";
import { publicEnv } from "@/lib/env";

const DEFAULT_AUTHORITY = publicEnv.cognitoAuthority;
const DEFAULT_SCOPE = publicEnv.cognitoScope;
const isMockMode = isMockAuthMode;

function resolveRedirectUri(): string | undefined {
  if (typeof window === "undefined") {
    return publicEnv.cognitoRedirectUri ?? undefined;
  }
  return (
    publicEnv.cognitoRedirectUri ?? `${window.location.origin}/auth/callback`
  );
}

function AuthSync() {
  const auth = useAuth();

  useEffect(() => {
    const token = auth.user?.access_token ?? null;
    setAccessToken(token);

    if (isMockMode) {
      return;
    }

    const controller = new AbortController();
    void syncSessionCookie(token, { signal: controller.signal });

    return () => controller.abort();
  }, [auth.user]);

  return null;
}

type ProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: ProviderProps) {
  const mockToken = devAccessToken;

  useEffect(() => {
    if (isMockMode) {
      setAccessToken(mockToken);
      const controller = new AbortController();
      void syncSessionCookie(mockToken, { signal: controller.signal });
      return () => controller.abort();
    }
  }, [mockToken]);

  const oidcConfig = useMemo<AuthProviderProps | null>(() => {
    if (isMockMode) {
      return null;
    }

    const clientId = publicEnv.cognitoClientId;
    const authority = DEFAULT_AUTHORITY;
    const redirectUri = resolveRedirectUri();

    if (!clientId || !redirectUri) {
      return null;
    }

    return {
      authority,
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: DEFAULT_SCOPE,
      onSigninCallback: () => {
        setAccessToken(null);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      },
      metadata: {
        issuer: authority,
        authorization_endpoint: `${authority}/oauth2/authorize`,
        token_endpoint: `${authority}/oauth2/token`,
        userinfo_endpoint: `${authority}/oauth2/userinfo`,
        end_session_endpoint: `${authority}/logout`,
      },
    } satisfies AuthProviderProps;
  }, []);

  if (!oidcConfig) {
    return <>{children}</>;
  }

  return (
    <OidcAuthProvider {...oidcConfig}>
      <AuthSync />
      {children}
    </OidcAuthProvider>
  );
}
