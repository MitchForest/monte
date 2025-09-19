import type { ApiApp } from "@monte/api";
import { hc } from "hono/client";

import { getAccessToken } from "@/lib/auth/token-store";
import { getServerApiBaseUrl, publicEnv } from "@/lib/env";
import { getImpersonationSelection } from "@/lib/impersonation/store";

const isServer = typeof window === "undefined";

function resolveBaseUrl(): string {
  if (isServer) {
    return getServerApiBaseUrl();
  }
  return publicEnv.apiUrl ?? "/api";
}

function toHeaders(init?: HeadersInit): Headers {
  if (!init) {
    return new Headers();
  }
  if (init instanceof Headers) {
    return new Headers(init);
  }
  return new Headers(init);
}

function mergeHeaders(base?: HeadersInit, override?: HeadersInit): Headers {
  const headers = toHeaders(base);
  if (!override) {
    return headers;
  }
  const next = toHeaders(override);
  next.forEach((value, key) => {
    headers.set(key, value);
  });
  return headers;
}

type CreateApiClientOptions = {
  headers?: HeadersInit;
};

function createFetch(defaultHeaders?: HeadersInit): typeof fetch {
  const wrapped = (async (
    input: Parameters<typeof fetch>[0],
    init: Parameters<typeof fetch>[1] = {},
  ) => {
    const mergedHeaders = mergeHeaders(defaultHeaders, init?.headers);
    if (!isServer) {
      const token = getAccessToken();
      if (token) {
        mergedHeaders.set("authorization", `Bearer ${token}`);
      }
      const impersonation = getImpersonationSelection();
      if (impersonation.kind !== "self") {
        mergedHeaders.set("x-monte-impersonate-kind", impersonation.kind);
        if (impersonation.kind === "student") {
          mergedHeaders.set(
            "x-monte-impersonate-student-id",
            impersonation.studentId,
          );
        } else if (impersonation.kind === "guide") {
          mergedHeaders.set(
            "x-monte-impersonate-guide-id",
            impersonation.guideId,
          );
        } else if (impersonation.kind === "parent") {
          mergedHeaders.set(
            "x-monte-impersonate-parent-id",
            impersonation.parentId,
          );
          mergedHeaders.set(
            "x-monte-impersonate-student-id",
            impersonation.studentId,
          );
        }
      }
    }
    const finalInit: RequestInit = {
      ...init,
      headers: mergedHeaders,
      credentials: init?.credentials ?? "omit",
    };
    return fetch(input, finalInit);
  }) as typeof fetch;

  return Object.assign(wrapped, fetch);
}

type HonoClient = ReturnType<typeof hc<ApiApp>>;

function buildClient(baseUrl: string, fetcher: typeof fetch): HonoClient {
  return hc<ApiApp>(baseUrl, {
    fetch: fetcher,
  });
}

function instantiateClient(headers?: HeadersInit) {
  const baseUrl = resolveBaseUrl();
  const fetcher = createFetch(headers);
  return buildClient(baseUrl, fetcher);
}

const defaultClient = instantiateClient();
const defaultFetch = createFetch();

export type ApiClient = HonoClient;
export const apiClient: ApiClient = defaultClient;

export function createApiClient(options?: CreateApiClientOptions): ApiClient {
  if (!options) {
    return defaultClient;
  }
  return instantiateClient(options.headers);
}

export function getApiBaseUrl(): string {
  return resolveBaseUrl();
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = new URL(path, getApiBaseUrl());
  return defaultFetch(url.toString(), init);
}
