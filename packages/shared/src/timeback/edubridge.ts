import { z } from "zod";

import { TimebackSuccessSchema } from "./envelope";

export const TimebackApplicationSchema = z.object({
  sourcedId: z.string(),
  name: z.string(),
  domain: z.array(z.string()),
  clientAppId: z.string(),
  dateLastModified: z.string().optional(),
  description: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  status: z.string().optional(),
  tenantId: z.string().optional(),
});

export type TimebackApplication = z.infer<typeof TimebackApplicationSchema>;

export const TimebackSubjectTrackCourseSchema = z.object({
  sourcedId: z.string().optional(),
  status: z.string().optional(),
  dateLastModified: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  title: z.string(),
  courseCode: z.string().nullable().optional(),
  grades: z.array(z.string()).nullable().optional(),
  subjects: z.array(z.string()).nullable().optional(),
  subjectCodes: z.array(z.string()).nullable().optional(),
  org: z
    .object({
      sourcedId: z.string(),
    })
    .optional(),
  level: z.string().nullable().optional(),
});

export type TimebackSubjectTrackCourse = z.infer<
  typeof TimebackSubjectTrackCourseSchema
>;

export const TimebackSubjectTrackSchema = z.object({
  id: z.string(),
  grade: z.string(),
  subject: z.string(),
  course: TimebackSubjectTrackCourseSchema,
  application: TimebackApplicationSchema,
});

export type TimebackSubjectTrack = z.infer<typeof TimebackSubjectTrackSchema>;

export const TimebackSubjectTracksResponseSchema = TimebackSuccessSchema(
  z.object({
    subjectTracks: z.array(TimebackSubjectTrackSchema),
  }),
);

export type TimebackSubjectTracksResponse = z.infer<
  typeof TimebackSubjectTracksResponseSchema
>;
