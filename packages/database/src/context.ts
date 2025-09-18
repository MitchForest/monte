import { type Kysely, sql } from "kysely";
import { getDb } from "./client";
import type { DB } from "./types";

type Database = DB;

export type DbContext = {
  userId?: string;
  orgId?: string;
};

export function withDbContext<T>(
  ctx: DbContext,
  fn: (db: Kysely<Database>) => Promise<T>,
): Promise<T> {
  return getDb()
    .transaction()
    .execute(async (trx) => {
      if (ctx.userId) {
        await sql`select set_config('app.user_id', ${ctx.userId}, true)`.execute(
          trx,
        );
      }
      if (ctx.orgId) {
        await sql`select set_config('app.org_id', ${ctx.orgId}, true)`.execute(
          trx,
        );
      }
      return fn(trx);
    });
}
