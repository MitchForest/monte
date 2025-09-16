import type { z } from "zod";

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => Promise<Response>;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | null | undefined;

export type QueryRecord = Record<string, QueryValue | QueryValue[]>;

export type ResolveAccessToken = () => string | Promise<string> | null;

export type RequestOptions<TBody, TResponse> = {
  method?: HttpMethod;
  query?: QueryRecord | URLSearchParams;
  body?: TBody;
  headers?: Record<string, string | undefined>;
  accessToken?: string | null;
  signal?: AbortSignal;
  expect?: "json" | "text" | "void";
  schema?: z.ZodType<TResponse>;
};

export type TimebackHttpClientOptions = {
  baseUrl: string;
  fetch?: FetchLike;
  token?: string | null;
  getAccessToken?: ResolveAccessToken | null;
  defaultHeaders?: Record<string, string | undefined>;
};

export type TimebackRequestContext = {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: unknown;
};
