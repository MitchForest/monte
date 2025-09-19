import { logger } from "@monte/shared";
import { serve } from "bun";

import { createAPIApp } from "./lib/app";
import { getCorsOrigins, getPort } from "./lib/env";
import { HTTP_STATUS } from "./lib/http/status";
import { attendanceRouter } from "./routes/attendance";
import { classroomsRouter } from "./routes/classrooms";
import { currentUserRouter } from "./routes/current-user";
import { curriculumRouter } from "./routes/curriculum";
import { guideDashboardRouter } from "./routes/guide-dashboard";
import { habitsRouter } from "./routes/habits";
import { invitesRouter } from "./routes/invites";
import { observationsRouter } from "./routes/observations";
import { organizationsRouter } from "./routes/organizations";
import { parentsRouter } from "./routes/parents";
import { studentLessonsRouter } from "./routes/student-lessons";
import { studentParentsRouter } from "./routes/student-parents";
import { studentPlacementsRouter } from "./routes/student-placements";
import { studentSummariesRouter } from "./routes/student-summaries";
import { studentXpRouter } from "./routes/student-xp";
import { studentsRouter } from "./routes/students";
import { subjectTracksRouter } from "./routes/subject-tracks";
import { tasksRouter } from "./routes/tasks";
import { teamRouter } from "./routes/team";
import { timebackEventsRouter } from "./routes/timeback-events";

const app = createAPIApp({
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
  },
  openapi: {
    title: "Monte API",
    version: "1.0.0",
    description: "Monte API for education management",
  },
});

const typedApp = app
  .route("/students", studentsRouter)
  .route("/students", studentParentsRouter)
  .route("/classrooms", classroomsRouter)
  .route("/observations", observationsRouter)
  .route("/student-summaries", studentSummariesRouter)
  .route("/student-lessons", studentLessonsRouter)
  .route("/tasks", tasksRouter)
  .route("/habits", habitsRouter)
  .route("/curriculum", curriculumRouter)
  .route("/guide-dashboard", guideDashboardRouter)
  .route("/attendance", attendanceRouter)
  .route("/student-xp", studentXpRouter)
  .route("/student-placements", studentPlacementsRouter)
  .route("/subject-tracks", subjectTracksRouter)
  .route("/timeback-events", timebackEventsRouter)
  .route("/invites", invitesRouter)
  .route("/organizations", organizationsRouter)
  .route("/parents", parentsRouter)
  .route("/current-user", currentUserRouter)
  .route("/team", teamRouter);

typedApp.notFound((c) => c.json({ error: "Not found" }, HTTP_STATUS.notFound));

typedApp.onError((err, c) => {
  logger.error("API error", {
    message: err instanceof Error ? err.message : String(err),
  });
  return c.json(
    { error: "Internal server error" },
    HTTP_STATUS.internalServerError,
  );
});

export type ApiApp = typeof typedApp;
export { typedApp as app };

const port = getPort();

if (import.meta.main) {
  serve({
    port,
    fetch: typedApp.fetch,
  });
  logger.info("Monte API listening", { port });
}
