import type { z } from "zod";
import { ApiSuccessSchema } from "../api-types";

/**
 * Builds the standard Monte response envelope for Timeback integrations.
 * Wraps the external payload in our `{ data, meta? }` structure so that
 * all consumers downstream follow the same convention.
 */
export const TimebackSuccessSchema = <T extends z.ZodTypeAny>(
  payloadSchema: T,
) => ApiSuccessSchema(payloadSchema);

export type TimebackSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export function toTimebackSuccess<T>(
  payload: T,
  meta?: Record<string, unknown>,
): TimebackSuccess<T> {
  return meta && Object.keys(meta).length > 0
    ? { data: payload, meta }
    : { data: payload };
}
