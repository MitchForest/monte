import { ActionsListResponseSchema } from "@monte/shared";
import { Hono } from "hono";

const router = new Hono();

router.get("/", (c) => {
  const response = ActionsListResponseSchema.parse({
    data: { actions: [] },
  });
  return c.json(response);
});

export { router as tasksRouter };
