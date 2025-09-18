import { z } from "zod";

import { ApiSuccessSchema } from "../api/response";

export const StudentXpMetricSchema = z.object({
  type: z.string(),
  value: z.number(),
});

export type StudentXpMetric = z.infer<typeof StudentXpMetricSchema>;

export const StudentXpEventSchema = z.object({
  id: z.string().optional().nullable(),
  occurredAt: z.string().optional().nullable(),
  activityTitle: z.string().optional().nullable(),
  resourceUri: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  app: z.string().optional().nullable(),
  course: z
    .object({
      id: z.string().optional().nullable(),
      name: z.string().optional().nullable(),
    })
    .optional(),
  xpEarned: z.number().optional().nullable(),
  metrics: z.array(StudentXpMetricSchema).optional(),
});

export type StudentXpEvent = z.infer<typeof StudentXpEventSchema>;

export const StudentXpSummarySchema = z.object({
  studentId: z.string(),
  eventCount: z.number().int().nonnegative(),
  totalXp: z.number().nonnegative(),
  events: z.array(StudentXpEventSchema),
});

export type StudentXpSummary = z.infer<typeof StudentXpSummarySchema>;

export const StudentXpSummaryResponseSchema = ApiSuccessSchema(
  StudentXpSummarySchema,
);

export type StudentXpSummaryResponse = z.infer<
  typeof StudentXpSummaryResponseSchema
>;
