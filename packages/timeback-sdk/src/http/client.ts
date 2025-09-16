import { toTimebackSuccess, type TimebackSuccess } from "@monte/shared/timeback";
import { TimebackError } from "./errors";
import type {
  FetchLike,
  HttpMethod,
  QueryRecord,
  RequestOptions,
  ResolveAccessToken,
  TimebackHttpClientOptions,
  TimebackRequestContext,
} from "./types";

const normalizeBaseUrl = (value: string): string => {
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const inferFetch = (): FetchLike => {
  if (typeof fetch !== "undefined") {
    return fetch.bind(globalThis);
  }
  throw new Error("A fetch implementation is required to use TimebackHttpClient");
};

const isBodyInit = (value: unknown): value is BodyInit => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return true;
  }
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }
  if (value instanceof ArrayBuffer) {
    return true;
  }
  if (typeof FormData !== "undefined" && value instanceof FormData) {
    return true;
  }
  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) {
    return true;
  }
  if (typeof ReadableStream !== "undefined" && value instanceof ReadableStream) {
    return true;
  }
  return false;
};

const buildUrl = (baseUrl: string, path: string, query?: QueryRecord | URLSearchParams): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);
  if (!query) {
    return url.toString();
  }
  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    return url.toString();
  }
  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null) {
      continue;
    }
    if (Array.isArray(rawValue)) {
      for (const item of rawValue) {
        if (item === undefined || item === null) {
          continue;
        }
        url.searchParams.append(key, String(item));
      }
      continue;
    }
    url.searchParams.append(key, String(rawValue));
  }
  return url.toString();
};

const mergeHeaders = (
  defaults: Record<string, string>,
  overrides?: Record<string, string | undefined>
): Record<string, string> => {
  const result: Record<string, string> = { ...defaults };
  if (!overrides) {
    return result;
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      continue;
    }
    result[key.toLowerCase()] = value;
  }
  return result;
};

const shouldParseJson = (contentType: string | null): boolean => {
  if (!contentType) {
    return false;
  }
  return contentType.includes("application/json") || contentType.includes("+json");
};

const toRequestContext = (url: string, method: HttpMethod, headers: Record<string, string>, body: unknown): TimebackRequestContext => ({
  url,
  method,
  headers,
  body,
});

export class TimebackHttpClient {
  private readonly baseUrl: string;
  private readonly fetchFn: FetchLike;
  private readonly getAccessToken?: ResolveAccessToken | null;
  private readonly defaultHeaders: Record<string, string>;
  private token: string | null;

  constructor(options: TimebackHttpClientOptions) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
    this.fetchFn = options.fetch ?? inferFetch();
    this.getAccessToken = options.getAccessToken ?? null;
    this.defaultHeaders = {};
    for (const [key, value] of Object.entries(options.defaultHeaders ?? {})) {
      if (value === undefined) {
        continue;
      }
      this.defaultHeaders[key.toLowerCase()] = value;
    }
    if (!this.defaultHeaders.accept) {
      this.defaultHeaders.accept = "application/json";
    }
    this.token = options.token ?? null;
  }

  setAccessToken = (token: string | null): void => {
    this.token = token ?? null;
  };

  private resolveAccessToken = async (override?: string | null): Promise<string | null> => {
    if (override !== undefined) {
      return override;
    }
    if (this.token) {
      return this.token;
    }
    if (!this.getAccessToken) {
      return null;
    }
    const value = await this.getAccessToken();
    return value ?? null;
  };

  request = async <TResponse = unknown, TBody = unknown>(
    path: string,
    options: RequestOptions<TBody, TResponse> = {}
  ): Promise<TResponse> => {
    const method: HttpMethod = options.method ?? "GET";
    const url = buildUrl(this.baseUrl, path, options.query);
    const headers = mergeHeaders(this.defaultHeaders, options.headers);
    const accessToken = await this.resolveAccessToken(options.accessToken);
    if (accessToken) {
      headers.authorization = `Bearer ${accessToken}`;
    }

    let bodyInit: BodyInit | undefined;
    let serializedBody: unknown = options.body;
    if (options.body !== undefined) {
      if (isBodyInit(options.body)) {
        bodyInit = options.body;
      } else {
        headers["content-type"] = headers["content-type"] ?? "application/json";
        bodyInit = JSON.stringify(options.body);
      }
    }

    const response = await this.fetchFn(url, {
      method,
      headers,
      body: bodyInit,
      signal: options.signal,
    });

    if (!response.ok) {
      let message = response.statusText || "Request failed";
      let details: unknown;
      try {
        if (shouldParseJson(response.headers.get("content-type"))) {
          details = await response.json();
          if (details && typeof details === "object") {
            const candidate = (details as { error?: unknown; message?: unknown }).error;
            if (candidate && typeof candidate === "object") {
              const errorMessage = (candidate as { message?: unknown }).message;
              if (typeof errorMessage === "string" && errorMessage.length > 0) {
                message = errorMessage;
              }
            }
            const directMessage = (details as { message?: unknown }).message;
            if (typeof directMessage === "string" && directMessage.length > 0) {
              message = directMessage;
            }
          }
        } else {
          const text = await response.text();
          if (text) {
            details = text;
            message = text;
          }
        }
      } catch {
        // Ignore parse failures and fall back to the status text
      }

      const requestContext = toRequestContext(url, method, headers, serializedBody);
      throw new TimebackError({
        status: response.status,
        message,
        details,
        request: requestContext,
      });
    }

    if (options.expect === "void" || response.status === 204) {
      return undefined as TResponse;
    }

    if (options.expect === "text") {
      const payload = await response.text();
      return payload as TResponse;
    }

    if (!shouldParseJson(response.headers.get("content-type"))) {
      return undefined as TResponse;
    }

    const parsed = (await response.json()) as TResponse;
    if (options.schema) {
      return options.schema.parse(parsed);
    }
    return parsed;
  };

  requestSuccess = async <TResponse = unknown, TBody = unknown>(
    path: string,
    options: RequestOptions<TBody, TResponse> = {}
  ): Promise<TimebackSuccess<TResponse>> => {
    const payload = await this.request<TResponse, TBody>(path, options);
    return toTimebackSuccess(payload);
  };
}
