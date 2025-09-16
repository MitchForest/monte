import { z } from "zod";
import {
  schemas as caliperEventSchemas,
  getEndpoint as getCaliperEventEndpoint,
} from "../generated/caliper.ts/Caliper_Events";
import {
  getEndpoint as getAnalyticsEndpoint,
} from "../generated/caliper.ts/Analytics";
import {
  schemas as webhookSchemas,
  getEndpoint as getWebhooksEndpoint,
} from "../generated/caliper.ts/Webhooks";
import { getEndpoint as getSystemEndpoint } from "../generated/caliper.ts/System";

function requireEndpoint(
  get: (alias: string) => unknown,
  alias: string
): { response: z.ZodTypeAny; method: string; path: string; parameters?: Array<{ type: string; name: string; schema: unknown }> } {
  const endpoint = get(alias) as
    | {
        response?: z.ZodTypeAny;
        method: string;
        path: string;
        parameters?: Array<{ type: string; name: string; schema: unknown }>;
      }
    | undefined;
  if (!endpoint || !endpoint.response) {
    throw new Error(`Caliper endpoint "${alias}" is not available`);
  }
  return endpoint as {
    response: z.ZodTypeAny;
    method: string;
    path: string;
    parameters?: Array<{ type: string; name: string; schema: unknown }>;
  };
}

const validateEndpoint = requireEndpoint(
  getCaliperEventEndpoint,
  "postCaliperv1p2eventsvalidate"
);
const ingestEndpoint = requireEndpoint(getCaliperEventEndpoint, "postCaliperv1p2events");
const queryEndpoint = requireEndpoint(getAnalyticsEndpoint, "getAnalyticsevents");
const getEventEndpoint = requireEndpoint(getAnalyticsEndpoint, "getAnalyticsevents_id");
const listWebhooksEndpoint = requireEndpoint(getWebhooksEndpoint, "getWebhooks");
const getWebhookEndpoint = requireEndpoint(getWebhooksEndpoint, "getWebhooks_id");
const createWebhookEndpoint = requireEndpoint(getWebhooksEndpoint, "postWebhooks");
const updateWebhookEndpoint = requireEndpoint(getWebhooksEndpoint, "putWebhooks_id");
const deleteWebhookEndpoint = requireEndpoint(getWebhooksEndpoint, "deleteWebhooks_id");
const healthEndpoint = requireEndpoint(getSystemEndpoint, "getHealth");

function buildParameterSchema(
  endpoint: { parameters?: Array<{ type: string; name: string; schema: unknown }> },
  kind: "Query" | "Path"
) {
  const shape = Object.fromEntries(
    (endpoint.parameters ?? [])
      .filter((parameter) => parameter.type === kind)
      .map((parameter) => [parameter.name, parameter.schema as z.ZodTypeAny])
  );
  return z.object(shape).partial();
}

const queryEventsQuerySchema = buildParameterSchema(queryEndpoint, "Query");
const getEventPathSchema = buildParameterSchema(getEventEndpoint, "Path");
const webhookPathSchema = buildParameterSchema(getWebhookEndpoint, "Path");

export type CaliperRequestOptions = {
  accessToken?: string | null;
  signal?: AbortSignal;
};

export type CaliperEnvelope = z.input<typeof caliperEventSchemas.CaliperEnvelope>;
export const CaliperEnvelopeSchema = caliperEventSchemas.CaliperEnvelope;

export type CaliperValidationResponse = z.infer<typeof validateEndpoint.response>;
export type CaliperIngestResponse = z.infer<typeof ingestEndpoint.response>;

export type CaliperValidationOptions = CaliperRequestOptions;
export type CaliperIngestOptions = CaliperRequestOptions;

export type QueryEventsFilters = z.input<typeof queryEventsQuerySchema>;
export type QueryEventsOptions = CaliperRequestOptions & {
  filters?: QueryEventsFilters;
};
export type CaliperAnalyticsResponse = z.infer<typeof queryEndpoint.response>;
export type CaliperAnalyticsEvent = z.infer<typeof getEventEndpoint.response>;

export type GetEventOptions = CaliperRequestOptions;

export type CaliperHealthResponse = z.infer<typeof healthEndpoint.response>;

export type ListWebhooksResponse = z.infer<typeof listWebhooksEndpoint.response>;
export type CaliperWebhook = ListWebhooksResponse extends { webhooks: infer Webhooks }
  ? Webhooks extends Array<infer Webhook>
    ? Webhook
    : never
  : never;

export type ListWebhooksOptions = CaliperRequestOptions;
export type GetWebhookOptions = CaliperRequestOptions;
export type DeleteWebhookOptions = CaliperRequestOptions;

export type CreateWebhookBody = z.input<typeof webhookSchemas.postWebhooks_Body>;
export const CreateWebhookSchema = webhookSchemas.postWebhooks_Body;
export type CreateWebhookOptions = CaliperRequestOptions;

export type UpdateWebhookBody = z.input<typeof webhookSchemas.putWebhooks_id_Body>;
export const UpdateWebhookSchema = webhookSchemas.putWebhooks_id_Body;
export type UpdateWebhookOptions = CaliperRequestOptions;

export { queryEventsQuerySchema, getEventPathSchema, webhookPathSchema };
