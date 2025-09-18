"use client";

import { useContext } from "react";
import { AuthContext, type AuthContextProps } from "react-oidc-context";

const noop = () => {};
const noopAsync = async () => {};
const nullAsync = async () => null;
const createDisposable = () => noop;

const fallbackEvents = {
  addAccessTokenExpiring: () => createDisposable(),
  removeAccessTokenExpiring: noop,
  addAccessTokenExpired: () => createDisposable(),
  removeAccessTokenExpired: noop,
  addUserLoaded: () => createDisposable(),
  removeUserLoaded: noop,
  addUserUnloaded: () => createDisposable(),
  removeUserUnloaded: noop,
  addSilentRenewError: () => createDisposable(),
  removeSilentRenewError: noop,
  addUserSignedIn: () => createDisposable(),
  removeUserSignedIn: noop,
  addUserSignedOut: () => createDisposable(),
  removeUserSignedOut: noop,
  addUserSessionChanged: () => createDisposable(),
  removeUserSessionChanged: noop,
  load: noopAsync,
  unload: noopAsync,
  _raiseSilentRenewError: noopAsync,
  _raiseUserSignedIn: noopAsync,
  _raiseUserSignedOut: noopAsync,
  _raiseUserSessionChanged: noopAsync,
} as const;

const rejectUserPromise: AuthContextProps["signinPopup"] = async () => {
  throw new Error("OIDC authentication is not configured");
};

const rejectCredentialsPromise: AuthContextProps["signinResourceOwnerCredentials"] =
  async () => {
    throw new Error("OIDC authentication is not configured");
  };

const fallbackAuth: AuthContextProps = {
  user: null,
  isLoading: false,
  isAuthenticated: true,
  activeNavigator: undefined,
  error: undefined,
  settings: {} as AuthContextProps["settings"],
  events: fallbackEvents as unknown as AuthContextProps["events"],
  clearStaleState: noopAsync,
  removeUser: noopAsync,
  signinPopup: rejectUserPromise,
  signinSilent: nullAsync,
  signinRedirect: noopAsync,
  signinResourceOwnerCredentials: rejectCredentialsPromise,
  signoutRedirect: noopAsync,
  signoutPopup: noopAsync,
  signoutSilent: noopAsync,
  querySessionStatus: nullAsync,
  revokeTokens: noopAsync,
  startSilentRenew: noop,
  stopSilentRenew: noop,
};

export function useAuthSafe(): AuthContextProps {
  const context = useContext(AuthContext);
  return context ?? fallbackAuth;
}
