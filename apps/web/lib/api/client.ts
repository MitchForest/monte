import { hc } from "hono/client";

import { getAccessToken } from "@/lib/auth/token-store";

const devBaseUrl = "http://localhost:8787";
const isServer = typeof window === "undefined";

function resolveBaseUrl(): string {
  if (isServer) {
    if (process.env.NODE_ENV === "production") {
      const apiUrl = process.env.RAILWAY_API_URL ?? process.env.API_URL;
      if (apiUrl) {
        return apiUrl;
      }
    }
    const fallback = process.env.API_URL ?? devBaseUrl;
    return fallback;
  }
  return "/api";
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

type HonoClient = ReturnType<typeof hc>;

function buildClient(baseUrl: string, fetcher: typeof fetch): HonoClient {
  return hc(baseUrl, {
    fetch: fetcher,
  });
}

function instantiateClient(headers?: HeadersInit) {
  const baseUrl = resolveBaseUrl();
  const fetcher = createFetch(headers);
  return buildClient(baseUrl, fetcher);
}

const defaultClient = instantiateClient();

export type ApiClient = HonoClient;
export const apiClient: ApiClient = defaultClient;

export function createApiClient(options?: CreateApiClientOptions): ApiClient {
  if (!options) {
    return defaultClient;
  }
  return instantiateClient(options.headers);
}
