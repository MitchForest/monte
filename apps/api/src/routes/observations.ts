import { Hono } from "hono";

const router = new Hono();

router.get("/", async (c) => {
  return c.json({ observations: [] });
});

export { router as observationsRouter };
