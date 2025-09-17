import { OpenAPIHono } from "@hono/zod-openapi";

import { auth } from "../lib/auth";

const router = new OpenAPIHono();

// Handle all auth routes through better-auth
router.all("/*", (c) => auth.handler(c.req.raw));

export { router as authHandler };
