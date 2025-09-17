import { loadServerEnv, requireServerEnv } from "@monte/shared";
import { Kysely, PostgresDialect } from "kysely";
import { Pool, type PoolConfig } from "pg";
import type { Database } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __monteDbProxy: Kysely<Database> | undefined;
  // eslint-disable-next-line no-var
  var __monteDbPool: Pool | undefined;
}

function createPool(): Pool {
  const { DATABASE_URL, DATABASE_SSL_MODE, DATABASE_SSL_REJECT_UNAUTHORIZED } =
    {
      ...loadServerEnv(),
      DATABASE_SSL_MODE: process.env.DATABASE_SSL_MODE,
      DATABASE_SSL_REJECT_UNAUTHORIZED:
        process.env.DATABASE_SSL_REJECT_UNAUTHORIZED,
    } as Record<string, string | undefined>;

  const databaseUrl = DATABASE_URL ?? requireServerEnv("DATABASE_URL");

  const sslMode = (DATABASE_SSL_MODE ?? "no-verify").toLowerCase();
  const shouldRejectUnauthorized = DATABASE_SSL_REJECT_UNAUTHORIZED !== "false";

  let ssl: PoolConfig["ssl"];
  if (sslMode === "disable" || sslMode === "off") {
    ssl = false;
  } else if (sslMode === "require" || sslMode === "verify-full") {
    ssl = { rejectUnauthorized: shouldRejectUnauthorized };
  } else {
    ssl = { rejectUnauthorized: false };
  }

  const poolConfig: PoolConfig = {
    connectionString: databaseUrl,
  };

  if (ssl !== undefined) {
    poolConfig.ssl = ssl;
  }

  return new Pool(poolConfig);
}

function getPool(): Pool {
  if (!globalThis.__monteDbPool) {
    globalThis.__monteDbPool = createPool();
  }
  return globalThis.__monteDbPool;
}

function createDb(): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool: getPool() }),
  });
}

export function getDb(): Kysely<Database> {
  if (!globalThis.__monteDbProxy) {
    globalThis.__monteDbProxy = createDb();
  }
  return globalThis.__monteDbProxy;
}

export const db: Kysely<Database> = new Proxy({} as Kysely<Database>, {
  get(_target, property, receiver) {
    const instance = getDb();
    return Reflect.get(instance, property, receiver);
  },
});

export { getPool as pool };
