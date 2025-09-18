import type { z } from "zod";

import { ApiSuccessSchema } from "../api-types";

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
