import { z } from "zod";

import { TimebackSuccessSchema } from "./envelope";

export const TimebackAnalyticsEventSchema = z.object({
  id: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  action: z.string().optional().nullable(),
  eventTime: z.string().optional().nullable(),
  storedAt: z.string().optional().nullable(),
  sensor: z.string().optional().nullable(),
  actor: z.object({
    id: z.string().min(1),
    type: z.string().optional().nullable(),
  }),
  object: z.object({
    id: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
  }),
  xpEarned: z.number().optional().nullable(),
});

export type TimebackAnalyticsEvent = z.infer<
  typeof TimebackAnalyticsEventSchema
>;

export const TimebackAnalyticsFiltersSchema = z.object({
  studentId: z.string().min(1),
  startTime: z.string().datetime({ offset: true }).optional(),
  endTime: z.string().datetime({ offset: true }).optional(),
  eventType: z.string().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export type TimebackAnalyticsFilters = z.infer<
  typeof TimebackAnalyticsFiltersSchema
>;

export const TimebackAnalyticsSummarySchema = z.object({
  studentId: z.string().min(1),
  eventCount: z.number().int().min(0),
  totalXp: z.number().min(0),
  events: z.array(TimebackAnalyticsEventSchema),
});

export type TimebackAnalyticsSummary = z.infer<
  typeof TimebackAnalyticsSummarySchema
>;

export const TimebackAnalyticsResponseSchema = TimebackSuccessSchema(
  TimebackAnalyticsSummarySchema,
);

export type TimebackAnalyticsResponse = z.infer<
  typeof TimebackAnalyticsResponseSchema
>;
