import { createRoute, OpenAPIHono, type z } from "@hono/zod-openapi";
import { ApiErrorSchema } from "@monte/shared";
import { SubjectTrackListResponseSchema } from "@monte/shared/student";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";
import {
  listSubjectTracks,
  SubjectTracksUnavailableError,
} from "../services/subject-tracks";

const subjectTracksRouter = new OpenAPIHono();

const subjectTracksRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Subject Tracks"],
  summary: "List subject track assignments",
  description:
    "Returns the default course assignment for each subject/grade combination configured in Timeback.",
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Subject tracks",
      content: {
        "application/json": {
          schema: SubjectTrackListResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.unauthorized]: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

subjectTracksRouter.openapi(subjectTracksRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      subjectTracksRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  try {
    const tracks = await listSubjectTracks();
    const body = SubjectTrackListResponseSchema.parse({ data: { tracks } });
    return respond(subjectTracksRoute, c, body);
  } catch (error) {
    if (error instanceof SubjectTracksUnavailableError) {
      return respond(
        subjectTracksRoute,
        c,
        { error: error.message },
        HTTP_STATUS.serviceUnavailable,
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to fetch subject tracks";
    return respond(
      subjectTracksRoute,
      c,
      { error: message },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { subjectTracksRouter };
