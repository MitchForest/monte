import { z } from "zod";
import { TimebackHttpClient } from "../http";
import type { HttpMethod } from "../http";
import {
  getEndpoint as getCaliperEventEndpoint,
} from "../generated/caliper.ts/Caliper_Events";
import {
  getEndpoint as getAnalyticsEndpoint,
} from "../generated/caliper.ts/Analytics";
import {
  getEndpoint as getWebhooksEndpoint,
} from "../generated/caliper.ts/Webhooks";
import { getEndpoint as getSystemEndpoint } from "../generated/caliper.ts/System";
import type {
  CaliperAnalyticsEvent,
  CaliperAnalyticsResponse,
  CaliperEnvelope,
  CaliperIngestOptions,
  CaliperIngestResponse,
  CaliperRequestOptions,
  CaliperValidationOptions,
  CaliperValidationResponse,
  CaliperHealthResponse,
  CaliperWebhook,
  CreateWebhookBody,
  CreateWebhookOptions,
  DeleteWebhookOptions,
  GetEventOptions,
  GetWebhookOptions,
  ListWebhooksOptions,
  ListWebhooksResponse,
  QueryEventsFilters,
  QueryEventsOptions,
  UpdateWebhookBody,
  UpdateWebhookOptions,
} from "./types";
import {
  CaliperEnvelopeSchema,
  CreateWebhookSchema,
  UpdateWebhookSchema,
  getEventPathSchema,
  queryEventsQuerySchema,
  webhookPathSchema,
} from "./types";

function requireEndpoint(alias: string, provider: (alias: string) => unknown) {
  const endpoint = provider(alias);
  if (!endpoint) {
    throw new Error(`Caliper endpoint "${alias}" is not available`);
  }
  return endpoint as {
    method: string;
    path: string;
    response: z.ZodTypeAny;
  };
}

const validateEndpoint = requireEndpoint(
  "postCaliperv1p2eventsvalidate",
  getCaliperEventEndpoint
);
const ingestEndpoint = requireEndpoint("postCaliperv1p2events", getCaliperEventEndpoint);
const queryEndpoint = requireEndpoint("getAnalyticsevents", getAnalyticsEndpoint);
const getEventEndpoint = requireEndpoint("getAnalyticsevents_id", getAnalyticsEndpoint);
const listWebhooksEndpoint = requireEndpoint("getWebhooks", getWebhooksEndpoint);
const getWebhookEndpoint = requireEndpoint("getWebhooks_id", getWebhooksEndpoint);
const createWebhookEndpoint = requireEndpoint("postWebhooks", getWebhooksEndpoint);
const updateWebhookEndpoint = requireEndpoint("putWebhooks_id", getWebhooksEndpoint);
const deleteWebhookEndpoint = requireEndpoint("deleteWebhooks_id", getWebhooksEndpoint);
const healthEndpoint = requireEndpoint("getHealth", getSystemEndpoint);

function toMethod(method: string): HttpMethod {
  return method.toUpperCase() as HttpMethod;
}

function applyPathParams(path: string, params: Record<string, string | number | boolean>): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, (match, key) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing value for path parameter "${key}"`);
    }
    return encodeURIComponent(String(value));
  });
}

export class CaliperClient {
  readonly http: TimebackHttpClient;

  constructor(http: TimebackHttpClient) {
    this.http = http;
  }

  validateEnvelope = async (
    envelope: CaliperEnvelope,
    options: CaliperValidationOptions = {}
  ): Promise<CaliperValidationResponse> => {
    const body = CaliperEnvelopeSchema.parse(envelope);
    return this.http.request<CaliperValidationResponse>(validateEndpoint.path, {
      method: toMethod(validateEndpoint.method),
      body,
      schema: validateEndpoint.response as z.ZodType<CaliperValidationResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  sendEnvelope = async (
    envelope: CaliperEnvelope,
    options: CaliperIngestOptions = {}
  ): Promise<CaliperIngestResponse> => {
    const body = CaliperEnvelopeSchema.parse(envelope);
    return this.http.request<CaliperIngestResponse>(ingestEndpoint.path, {
      method: toMethod(ingestEndpoint.method),
      body,
      schema: ingestEndpoint.response as z.ZodType<CaliperIngestResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  queryEvents = async (
    options: QueryEventsOptions = {}
  ): Promise<CaliperAnalyticsResponse> => {
    const { accessToken, signal, filters = {} } = options;
    const queries: QueryEventsFilters = queryEventsQuerySchema.parse(filters);

    return this.http.request<CaliperAnalyticsResponse>(queryEndpoint.path, {
      method: toMethod(queryEndpoint.method),
      query: queries,
      schema: queryEndpoint.response as z.ZodType<CaliperAnalyticsResponse>,
      accessToken,
      signal,
    });
  };

  getEvent = async (
    id: string,
    options: GetEventOptions = {}
  ): Promise<CaliperAnalyticsEvent> => {
    const params = getEventPathSchema.parse({ id });
    const path = applyPathParams(getEventEndpoint.path, params);

    return this.http.request<CaliperAnalyticsEvent>(path, {
      method: toMethod(getEventEndpoint.method),
      schema: getEventEndpoint.response as z.ZodType<CaliperAnalyticsEvent>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  createWebhook = async (
    body: CreateWebhookBody,
    options: CreateWebhookOptions = {}
  ): Promise<CaliperWebhook> => {
    const payload = CreateWebhookSchema.parse(body);

    return this.http.request<CaliperWebhook>(createWebhookEndpoint.path, {
      method: toMethod(createWebhookEndpoint.method),
      body: payload,
      schema: createWebhookEndpoint.response as z.ZodType<CaliperWebhook>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  listWebhooks = async (
    options: ListWebhooksOptions = {}
  ): Promise<ListWebhooksResponse> => {
    return this.http.request<ListWebhooksResponse>(listWebhooksEndpoint.path, {
      method: toMethod(listWebhooksEndpoint.method),
      schema: listWebhooksEndpoint.response as z.ZodType<ListWebhooksResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  getWebhook = async (
    id: string,
    options: GetWebhookOptions = {}
  ): Promise<CaliperWebhook> => {
    const params = webhookPathSchema.parse({ id });
    const path = applyPathParams(getWebhookEndpoint.path, params);

    return this.http.request<CaliperWebhook>(path, {
      method: toMethod(getWebhookEndpoint.method),
      schema: getWebhookEndpoint.response as z.ZodType<CaliperWebhook>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  updateWebhook = async (
    id: string,
    body: UpdateWebhookBody,
    options: UpdateWebhookOptions = {}
  ): Promise<CaliperWebhook> => {
    const params = webhookPathSchema.parse({ id });
    const path = applyPathParams(updateWebhookEndpoint.path, params);
    const payload = UpdateWebhookSchema.parse(body);

    return this.http.request<CaliperWebhook>(path, {
      method: toMethod(updateWebhookEndpoint.method),
      body: payload,
      schema: updateWebhookEndpoint.response as z.ZodType<CaliperWebhook>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  deleteWebhook = async (
    id: string,
    options: DeleteWebhookOptions = {}
  ): Promise<void> => {
    const params = webhookPathSchema.parse({ id });
    const path = applyPathParams(deleteWebhookEndpoint.path, params);

    await this.http.request<void>(path, {
      method: toMethod(deleteWebhookEndpoint.method),
      schema: deleteWebhookEndpoint.response as z.ZodType<void>,
      accessToken: options.accessToken,
      signal: options.signal,
      expect: "void",
    });
  };

  getHealth = async (): Promise<CaliperHealthResponse> => {
    return this.http.request<CaliperHealthResponse>(healthEndpoint.path, {
      method: toMethod(healthEndpoint.method),
      schema: healthEndpoint.response as z.ZodType<CaliperHealthResponse>,
    });
  };
}

export type {
  CaliperAnalyticsEvent,
  CaliperAnalyticsResponse,
  CaliperEnvelope,
  CaliperIngestOptions,
  CaliperIngestResponse,
  CaliperHealthResponse,
  CaliperRequestOptions,
  CaliperValidationOptions,
  CaliperValidationResponse,
  CaliperWebhook,
  CreateWebhookBody,
  CreateWebhookOptions,
  DeleteWebhookOptions,
  GetEventOptions,
  GetWebhookOptions,
  ListWebhooksOptions,
  ListWebhooksResponse,
  QueryEventsOptions,
  UpdateWebhookBody,
  UpdateWebhookOptions,
} from "./types";
