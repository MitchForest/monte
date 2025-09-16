import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { HTTP_STATUS } from "./lib/http/status";
import { authHandler } from "./routes/auth";
import { classroomsRouter } from "./routes/classrooms";
import { habitsRouter } from "./routes/habits";
import { observationsRouter } from "./routes/observations";
import { studentsRouter } from "./routes/students";
import { tasksRouter } from "./routes/tasks";
import { teamRouter } from "./routes/team";

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

export const app = new Hono();

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

app.route("/auth", authHandler);
app.route("/students", studentsRouter);
app.route("/classrooms", classroomsRouter);
app.route("/observations", observationsRouter);
app.route("/tasks", tasksRouter);
app.route("/habits", habitsRouter);
app.route("/team", teamRouter);

app.notFound((c) => c.json({ error: "Not found" }, HTTP_STATUS.notFound));

app.onError((_err, c) =>
  c.json({ error: "Internal server error" }, HTTP_STATUS.internalServerError),
);

export type ApiApp = typeof app;

const port = Number.parseInt(process.env.PORT ?? "8787", 10);

if (import.meta.main) {
  serve({
    port,
    fetch: app.fetch,
  });
  process.stdout.write(`API listening on http://localhost:${port}\n`);
}
