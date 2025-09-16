import { z } from "zod";
import { TimebackHttpClient } from "../http";
import type { HttpMethod } from "../http";
import { getEndpoint as getAuthenticationEndpoint } from "../generated/core.ts/Authentication";
import type {
  AuthRequestOptions,
  CoreAuthInfoEnvelope,
  CoreAuthMeEnvelope,
  CoreLoginEnvelope,
  CoreLogoutEnvelope,
  LoginRequestOptions,
  LoginWithPasswordInput,
} from "./types";

function requireEndpoint(alias: string) {
  const endpoint = getAuthenticationEndpoint(alias);
  if (!endpoint) {
    throw new Error(`Authentication endpoint "${alias}" is not available`);
  }
  return endpoint;
}

const authMeEndpoint = requireEndpoint("getApiAuthMe");
const authInfoEndpoint = requireEndpoint("getApiAuthInfo");
const loginEndpoint = requireEndpoint("postApiAuthLogin");
const logoutEndpoint = requireEndpoint("postApiAuthLogout");

function toMethod(method: string): HttpMethod {
  return method.toUpperCase() as HttpMethod;
}

export class CoreAuthClient {
  private readonly http: TimebackHttpClient;

  constructor(http: TimebackHttpClient) {
    this.http = http;
  }

  getCurrentUser = async (
    options: AuthRequestOptions = {}
  ): Promise<CoreAuthMeEnvelope> => {
    return this.http.request<CoreAuthMeEnvelope>(authMeEndpoint.path, {
      method: toMethod(authMeEndpoint.method),
      schema: authMeEndpoint.response as z.ZodType<CoreAuthMeEnvelope>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  getAuthInfo = async (
    options: AuthRequestOptions = {}
  ): Promise<CoreAuthInfoEnvelope> => {
    return this.http.request<CoreAuthInfoEnvelope>(authInfoEndpoint.path, {
      method: toMethod(authInfoEndpoint.method),
      schema: authInfoEndpoint.response as z.ZodType<CoreAuthInfoEnvelope>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  loginWithPassword = async (
    credentials: LoginWithPasswordInput,
    options: LoginRequestOptions = {}
  ): Promise<CoreLoginEnvelope> => {
    return this.http.request<CoreLoginEnvelope>(loginEndpoint.path, {
      method: toMethod(loginEndpoint.method),
      body: credentials,
      schema: loginEndpoint.response as z.ZodType<CoreLoginEnvelope>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  logout = async (
    options: AuthRequestOptions = {}
  ): Promise<CoreLogoutEnvelope> => {
    return this.http.request<CoreLogoutEnvelope>(logoutEndpoint.path, {
      method: toMethod(logoutEndpoint.method),
      schema: logoutEndpoint.response as z.ZodType<CoreLogoutEnvelope>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };
}
