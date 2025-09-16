import { Hono } from "hono";

const router = new Hono();

router.get("/", async (c) => {
  return c.json({ tasks: [] });
});

export { router as tasksRouter };
