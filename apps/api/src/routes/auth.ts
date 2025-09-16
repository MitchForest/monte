import { Hono } from "hono";
import { auth } from "../lib/auth";

const router = new Hono();

// Handle all auth routes through better-auth
router.all("/*", (c) => auth.handler(c.req.raw));

export { router as authHandler };
