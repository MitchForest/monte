import { ObservationsListResponseSchema } from "@monte/shared";
import { Hono } from "hono";

const router = new Hono();

router.get("/", (c) => {
  const response = ObservationsListResponseSchema.parse({
    data: { observations: [] },
  });
  return c.json(response);
});

export { router as observationsRouter };
