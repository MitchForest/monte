import type { ApiApp } from "@monte/api";
import { hc } from "hono/client";

const devBaseUrl = "http://localhost:8787";
const isServer = typeof window === "undefined";

function resolveBaseUrl(): string {
  if (isServer) {
    if (process.env.NODE_ENV === "production") {
      const apiUrl = process.env.RAILWAY_API_URL;
      if (!apiUrl) {
        throw new Error("RAILWAY_API_URL must be configured on the server");
      }
      return apiUrl;
    }
    return devBaseUrl;
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
    const finalInit: RequestInit = {
      ...init,
      headers: mergedHeaders,
      credentials: init?.credentials ?? (isServer ? "omit" : "include"),
    };
    return fetch(input, finalInit);
  }) as typeof fetch;

  return Object.assign(wrapped, fetch);
}

function buildClient(baseUrl: string, fetcher: typeof fetch) {
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

export type ApiClient = ReturnType<typeof buildClient>;
export const apiClient: ApiClient = defaultClient;

export function createApiClient(options?: CreateApiClientOptions): ApiClient {
  if (!options) {
    return defaultClient;
  }
  return instantiateClient(options.headers);
}
