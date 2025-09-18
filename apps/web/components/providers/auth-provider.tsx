"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import {
  type AuthProviderProps,
  AuthProvider as OidcAuthProvider,
  useAuth,
} from "react-oidc-context";

import { setAccessToken } from "@/lib/auth/token-store";

const DEFAULT_AUTHORITY =
  process.env.NEXT_PUBLIC_COGNITO_AUTHORITY ??
  "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_H5aVRMERg";
const DEFAULT_SCOPE =
  process.env.NEXT_PUBLIC_COGNITO_SCOPE ?? "openid email profile";
const isMockMode =
  process.env.NEXT_PUBLIC_AUTH_MOCK === "true" ||
  (!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID &&
    process.env.NODE_ENV !== "production");

function resolveRedirectUri(): string | undefined {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;
  }
  return (
    process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ??
    `${window.location.origin}/auth/callback`
  );
}

function AuthSync() {
  const auth = useAuth();

  useEffect(() => {
    setAccessToken(auth.user?.access_token ?? null);
  }, [auth.user]);

  return null;
}

type ProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: ProviderProps) {
  const mockToken =
    process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN ?? "dev-access-token";

  useEffect(() => {
    if (isMockMode) {
      setAccessToken(mockToken);
    }
  }, [mockToken]);

  const oidcConfig = useMemo<AuthProviderProps | null>(() => {
    if (isMockMode) {
      return null;
    }

    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
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
