import {
  TimebackSubjectTracksResponseSchema,
  type TimebackSubjectTrack,
  type TimebackSubjectTracksResponse,
} from "@monte/shared/timeback";

import {
  getOneRosterClient,
  isOneRosterConfigured,
} from "../../lib/timeback/clients";
import { getAllowedTimebackOrgs } from "../../lib/timeback/orgs";

const JSON_HEADERS = {
  Accept: "application/json",
};

export class TimebackEdubridgeUnavailableError extends Error {
  constructor() {
    super("Timeback EduBridge integration is not configured");
    this.name = "TimebackEdubridgeUnavailableError";
  }
}

function filterSubjectTracks(
  tracks: TimebackSubjectTrack[],
): TimebackSubjectTrack[] {
  const allowlist = getAllowedTimebackOrgs();
  if (allowlist.size === 0) {
    return tracks;
  }
  return tracks.filter((track) => {
    const orgId = track.course?.org?.sourcedId;
    return orgId ? allowlist.has(orgId) : false;
  });
}

export async function fetchSubjectTracks(): Promise<TimebackSubjectTracksResponse> {
  const client = getOneRosterClient();
  if (!client || !isOneRosterConfigured()) {
    throw new TimebackEdubridgeUnavailableError();
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

  const payload = (await response.json()) as {
    subjectTrack?: unknown;
  };

  const rawTracks = Array.isArray(payload.subjectTrack)
    ? (payload.subjectTrack as unknown[])
    : [];

  const parsed = TimebackSubjectTracksResponseSchema.parse({
    data: {
      subjectTracks: rawTracks,
    },
  });

  const subjectTracks = filterSubjectTracks(parsed.data.subjectTracks);

  return {
    data: {
      subjectTracks,
    },
  } satisfies TimebackSubjectTracksResponse;
}
