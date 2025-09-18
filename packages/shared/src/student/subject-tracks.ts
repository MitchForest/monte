import { z } from "zod";

import { ApiSuccessSchema } from "../api/response";

export const SubjectTrackAssignmentSchema = z.object({
  id: z.string(),
  grade: z.string(),
  subject: z.string(),
  course: z.object({
    id: z.string().nullable(),
    title: z.string(),
    code: z.string().nullable(),
  }),
  application: z.object({
    name: z.string(),
  }),
});

export type SubjectTrackAssignment = z.infer<
  typeof SubjectTrackAssignmentSchema
>;

export const SubjectTrackListResponseSchema = ApiSuccessSchema(
  z.object({ tracks: z.array(SubjectTrackAssignmentSchema) }),
);

export type SubjectTrackListResponse = z.infer<
  typeof SubjectTrackListResponseSchema
>;
