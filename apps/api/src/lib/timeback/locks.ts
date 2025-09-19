import { getDb } from "@monte/database";
import { sql } from "kysely";

export const TIMEBACK_QUEUE_LOCK_KEY = 42_123_987;
export const TIMEBACK_ROSTER_LOCK_KEY = 42_123_988;

export async function tryAcquireAdvisoryLock(key: number): Promise<boolean> {
  const result = await sql<{ acquired: boolean }>`
    select pg_try_advisory_lock(${key}) as acquired
  `.execute(getDb());
  return Boolean(result.rows.at(0)?.acquired);
}

export async function releaseAdvisoryLock(key: number): Promise<void> {
  await sql`select pg_advisory_unlock(${key})`.execute(getDb());
}
