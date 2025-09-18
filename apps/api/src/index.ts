import { serve } from "bun";

import { createAPIApp, getCorsOrigins } from "./lib/app";
import { HTTP_STATUS } from "./lib/http/status";
import { attendanceRouter } from "./routes/attendance";
import { classroomsRouter } from "./routes/classrooms";
import { curriculumRouter } from "./routes/curriculum";
import { guideDashboardRouter } from "./routes/guide-dashboard";
import { habitsRouter } from "./routes/habits";
import { invitesRouter } from "./routes/invites";
import { observationsRouter } from "./routes/observations";
import { organizationsRouter } from "./routes/organizations";
import { studentLessonsRouter } from "./routes/student-lessons";
import { studentParentsRouter } from "./routes/student-parents";
import { studentSummariesRouter } from "./routes/student-summaries";
import { studentsRouter } from "./routes/students";
import { tasksRouter } from "./routes/tasks";
import { teamRouter } from "./routes/team";
import { timebackAnalyticsRouter } from "./routes/timeback-analytics";
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
  .route("/timeback-analytics", timebackAnalyticsRouter)
  .route("/timeback-events", timebackEventsRouter)
  .route("/invites", invitesRouter)
  .route("/organizations", organizationsRouter)
  .route("/team", teamRouter);

typedApp.notFound((c) => c.json({ error: "Not found" }, HTTP_STATUS.notFound));

typedApp.onError((_err, c) =>
  c.json({ error: "Internal server error" }, HTTP_STATUS.internalServerError),
);

export type ApiApp = typeof typedApp;
export { typedApp as app };

const port = Number.parseInt(process.env.PORT ?? "8787", 10);

if (import.meta.main) {
  serve({
    port,
    fetch: typedApp.fetch,
  });
  process.stdout.write(`API listening on http://localhost:${port}\n`);
}
