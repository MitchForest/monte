import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { loadApiEnv } from "./env";

export type APIAppConfig = {
  cors?: Parameters<typeof cors>[0];
  openapi?: {
    title?: string;
    version?: string;
    description?: string;
  };
};

export function createAPIApp(config: APIAppConfig = {}) {
  const app = new OpenAPIHono();

  // Configure CORS
  if (config.cors) {
    app.use("*", cors(config.cors));
  }

  // Configure OpenAPI documentation
  const env = loadApiEnv();
  const openApiConfig = {
    openapi: "3.1.0",
    info: {
      title: config.openapi?.title ?? "Monte API",
      version: config.openapi?.version ?? "1.0.0",
      description: config.openapi?.description ?? "Monte API Documentation",
    },
    servers: [
      {
        url: env.API_URL ?? "http://localhost:8080",
        description:
          env.NODE_ENV === "production" ? "Production" : "Development",
      },
    ],
  };

  // OpenAPI JSON endpoint
  app.doc("/openapi.json", openApiConfig);

  // Swagger UI
  app.get(
    "/docs",
    swaggerUI({
      url: "/openapi.json",
    }),
  );

  // Health check
  app.get("/health", (c) => {
    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
