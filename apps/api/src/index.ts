import "./lib/openapi";

import { OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "bun";
import { cors } from "hono/cors";

import { HTTP_STATUS } from "./lib/http/status";
import { authHandler } from "./routes/auth";
import { classroomsRouter } from "./routes/classrooms";
import { habitsRouter } from "./routes/habits";
import { observationsRouter } from "./routes/observations";
import { studentSummariesRouter } from "./routes/student-summaries";
import { studentsRouter } from "./routes/students";
import { tasksRouter } from "./routes/tasks";
import { teamRouter } from "./routes/team";
import { timebackAnalyticsRouter } from "./routes/timeback-analytics";

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.APP_URL,
].filter((value): value is string => Boolean(value));

const configuredOrigins = (process.env.APP_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const allowedOrigins =
  configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins;
const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : ["*"];

const app = new OpenAPIHono();

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Monte API",
    version: "1.0.0",
  },
});

app.use(
  "*",
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

const typedApp = app
  .route("/auth", authHandler)
  .route("/students", studentsRouter)
  .route("/classrooms", classroomsRouter)
  .route("/observations", observationsRouter)
  .route("/student-summaries", studentSummariesRouter)
  .route("/tasks", tasksRouter)
  .route("/habits", habitsRouter)
  .route("/timeback/analytics", timebackAnalyticsRouter)
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
