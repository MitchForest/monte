import { type ZodType } from "zod";
import { TimebackHttpClient } from "../http";
import type { HttpMethod } from "../http";
import { healthSchema, type CoreHealthResponse } from "./types";

const path = "/health";
const method: HttpMethod = "GET";

export class HealthClient {
  private readonly http: TimebackHttpClient;

  constructor(http: TimebackHttpClient) {
    this.http = http;
  }

  check = async (): Promise<CoreHealthResponse> => {
    return this.http.request<CoreHealthResponse>(path, {
      method,
      schema: healthSchema as unknown as ZodType<CoreHealthResponse>,
    });
  };
}
