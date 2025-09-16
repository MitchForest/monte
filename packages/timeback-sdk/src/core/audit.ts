import { z } from "zod";
import { TimebackHttpClient } from "../http";
import type { HttpMethod } from "../http";
import { getEndpoint as getAuditEndpoint } from "@monte/shared/timeback/generated/core.ts/Audit";
import type {
  AuditStatsOptions,
  AuditStatsResponse,
  ListAuditLogsOptions,
  ListAuditLogsResponse,
} from "./types";

function requireEndpoint(alias: string) {
  const endpoint = getAuditEndpoint(alias);
  if (!endpoint) {
    throw new Error(`Audit endpoint "${alias}" is not available`);
  }
  return endpoint as {
    method: string;
    path: string;
    response: z.ZodTypeAny;
    parameters?: Array<{ type: string; name: string; schema: unknown }>;
  };
}

const listEndpoint = requireEndpoint("getApiAudit-logs");
const statsEndpoint = requireEndpoint("getApiAudit-logsStats");

const listQuerySchema = z
  .object(
    Object.fromEntries(
      (listEndpoint.parameters ?? [])
        .filter((parameter) => parameter.type === "Query")
        .map((parameter) => [parameter.name, parameter.schema as z.ZodTypeAny])
    )
  )
  .partial();

function toMethod(method: string): HttpMethod {
  return method.toUpperCase() as HttpMethod;
}

export class AuditClient {
  private readonly http: TimebackHttpClient;

  constructor(http: TimebackHttpClient) {
    this.http = http;
  }

  listLogs = async (
    options: ListAuditLogsOptions = {}
  ): Promise<ListAuditLogsResponse> => {
    const { accessToken, signal, ...queryOptions } = options;
    const query = listQuerySchema.parse(queryOptions);

    return this.http.request<ListAuditLogsResponse>(listEndpoint.path, {
      method: toMethod(listEndpoint.method),
      query,
      schema: listEndpoint.response as z.ZodType<ListAuditLogsResponse>,
      accessToken,
      signal,
    });
  };

  getStats = async (
    options: AuditStatsOptions = {}
  ): Promise<AuditStatsResponse> => {
    return this.http.request<AuditStatsResponse>(statsEndpoint.path, {
      method: toMethod(statsEndpoint.method),
      schema: statsEndpoint.response as z.ZodType<AuditStatsResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };
}
