import { z } from "zod";
import { TimebackHttpClient } from "../http";
import type { HttpMethod } from "../http";
import {
  getEndpoint as getSsoEndpoint,
  schemas as ssoSchemas,
} from "../generated/core.ts/SSO";
import type {
  CheckSsoResponse,
  ListSsoSessionsResponse,
  RegisterSsoInput,
  RegisterSsoResponse,
  RevokeSsoResponse,
  SsoRequestOptions,
} from "./types";

function requireEndpoint(alias: string) {
  const endpoint = getSsoEndpoint(alias);
  if (!endpoint) {
    throw new Error(`SSO endpoint "${alias}" is not available`);
  }
  return endpoint as {
    method: string;
    path: string;
    response: z.ZodTypeAny;
  };
}

const registerEndpoint = requireEndpoint("postApiAuthSessionsRegister");
const checkEndpoint = requireEndpoint("postApiAuthSessionsCheck");
const revokeEndpoint = requireEndpoint("deleteApiAuthSessionsRevoke");
const listEndpoint = requireEndpoint("getApiAuthSessions");

function toMethod(method: string): HttpMethod {
  return method.toUpperCase() as HttpMethod;
}

export class SsoClient {
  private readonly http: TimebackHttpClient;

  constructor(http: TimebackHttpClient) {
    this.http = http;
  }

  register = async (
    input: RegisterSsoInput,
    options: SsoRequestOptions = {}
  ): Promise<RegisterSsoResponse> => {
    const body = ssoSchemas.postApiAuthSessionsRegister_Body.parse(input);
    return this.http.request<RegisterSsoResponse>(registerEndpoint.path, {
      method: toMethod(registerEndpoint.method),
      body,
      schema: registerEndpoint.response as z.ZodType<RegisterSsoResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  check = async (
    input: RegisterSsoInput,
    options: SsoRequestOptions = {}
  ): Promise<CheckSsoResponse> => {
    const body = ssoSchemas.postApiAuthSessionsRegister_Body.parse(input);
    return this.http.request<CheckSsoResponse>(checkEndpoint.path, {
      method: toMethod(checkEndpoint.method),
      body,
      schema: checkEndpoint.response as z.ZodType<CheckSsoResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  revokeAll = async (
    options: SsoRequestOptions = {}
  ): Promise<RevokeSsoResponse> => {
    return this.http.request<RevokeSsoResponse>(revokeEndpoint.path, {
      method: toMethod(revokeEndpoint.method),
      schema: revokeEndpoint.response as z.ZodType<RevokeSsoResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  listSessions = async (
    options: SsoRequestOptions = {}
  ): Promise<ListSsoSessionsResponse> => {
    return this.http.request<ListSsoSessionsResponse>(listEndpoint.path, {
      method: toMethod(listEndpoint.method),
      schema: listEndpoint.response as z.ZodType<ListSsoSessionsResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };
}
