import { getDb } from "@monte/database";
import { logger } from "@monte/shared";

async function main() {
  const db = getDb();
  const [, , eventIdArg] = process.argv;

  const rows = await db
    .selectFrom("timeback_events_dlq")
    .select(["id", "event_id", "payload"])
    .where((eb) =>
      eventIdArg
        ? eb("event_id", "=", eventIdArg)
        : eb("event_id", "is not", null),
    )
    .orderBy("created_at", "asc")
    .limit(200)
    .execute();

  if (rows.length === 0) {
    logger.info("No DLQ entries found for replay");
    return;
  }

  await Promise.all(
    rows.map((row) =>
      db
        .insertInto("timeback_event_queue")
        .values({
          event_id: row.event_id ?? `dlq-${row.id}`,
          payload: row.payload,
          status: "pending",
          attempts: 0,
          next_attempt_at: new Date().toISOString(),
          scheduled_at: new Date().toISOString(),
        })
        .onConflict((oc) =>
          oc.column("event_id").doUpdateSet(({ val }) => ({
            payload: val(row.payload),
            status: val("pending"),
            attempts: val(0),
            last_error: val(null),
            next_attempt_at: val(new Date().toISOString()),
            updated_at: val(new Date().toISOString()),
          })),
        )
        .execute(),
    ),
  );

  const ids = rows.map((row) => row.id);
  await db.deleteFrom("timeback_events_dlq").where("id", "in", ids).execute();

  logger.info("Requeued DLQ events", { count: ids.length });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error("Failed to replay DLQ events", { message });
  process.exit(1);
});
