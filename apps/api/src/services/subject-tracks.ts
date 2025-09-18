import {
  type SubjectTrackAssignment,
  SubjectTrackAssignmentSchema,
  SubjectTrackListResponseSchema,
} from "@monte/shared/student";
import { z } from "zod";

import {
  getOneRosterClient,
  isOneRosterConfigured,
} from "../lib/timeback/clients";
import { getAllowedTimebackOrgs } from "../lib/timeback/orgs";

const JSON_HEADERS = {
  Accept: "application/json",
};

const EduBridgeSubjectTrackSchema = z.object({
  id: z.string(),
  grade: z.string(),
  subject: z.string(),
  course: z
    .object({
      sourcedId: z.string().nullable().optional(),
      title: z.string().optional().default(""),
      courseCode: z.string().nullable().optional(),
      org: z
        .object({
          sourcedId: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
    })
    .optional(),
  application: z
    .object({
      name: z.string(),
    })
    .optional(),
});

const EduBridgeSubjectTracksPayloadSchema = z.object({
  subjectTrack: z.array(EduBridgeSubjectTrackSchema).optional(),
});

export class SubjectTracksUnavailableError extends Error {
  constructor() {
    super("EduBridge integration is not configured");
    this.name = "SubjectTracksUnavailableError";
  }
}

export async function listSubjectTracks(): Promise<SubjectTrackAssignment[]> {
  const client = getOneRosterClient();
  if (!client || !isOneRosterConfigured()) {
    throw new SubjectTracksUnavailableError();
  }

  const response = await client.fetch("/edubridge/subject-track/", {
    method: "GET",
    headers: JSON_HEADERS,
  });

  if (!response.ok) {
    throw new Error(
      `EduBridge subject track request failed (${response.status})`,
    );
  }

  const payload = EduBridgeSubjectTracksPayloadSchema.parse(
    (await response.json()) as unknown,
  );

  const allowlist = getAllowedTimebackOrgs();

  const mapped = (payload.subjectTrack ?? []).map((track) =>
    SubjectTrackAssignmentSchema.parse({
      id: track.id,
      grade: track.grade,
      subject: track.subject,
      course: {
        id: track.course?.sourcedId ?? track.course?.org?.sourcedId ?? null,
        title: track.course?.title ?? "Course",
        code: track.course?.courseCode ?? null,
      },
      application: {
        name: track.application?.name ?? "",
      },
    }),
  );

  const filtered =
    allowlist.size === 0
      ? mapped
      : mapped.filter((track) => {
          const courseOrgId = track.course.id;
          if (!courseOrgId) {
            return true;
          }
          return allowlist.has(courseOrgId);
        });

  return SubjectTrackListResponseSchema.parse({
    data: { tracks: filtered },
  }).data.tracks;
}
