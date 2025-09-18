import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

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
  const openApiConfig = {
    openapi: "3.1.0",
    info: {
      title: config.openapi?.title ?? "Monte API",
      version: config.openapi?.version ?? "1.0.0",
      description: config.openapi?.description ?? "Monte API Documentation",
    },
    servers: [
      {
        url: process.env.API_URL ?? "http://localhost:8080",
        description:
          process.env.NODE_ENV === "production" ? "Production" : "Development",
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

export function getCorsOrigins(): string[] {
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

  return allowedOrigins.length > 0 ? allowedOrigins : ["*"];
}
