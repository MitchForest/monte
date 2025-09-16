import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { config as loadDotEnv } from "dotenv";
import { Client } from "pg";

function resolveEnvFile(startDir) {
  let current = startDir;
  for (;;) {
    const candidate = path.join(current, ".env");
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

const envFile =
  process.env.DOTENV_CONFIG_PATH ?? resolveEnvFile(process.cwd()) ?? undefined;
loadDotEnv(envFile ? { path: envFile } : {});

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (!DATABASE_URL) {
  process.stderr.write("DATABASE_URL is not set.\n");
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function byNameAsc(a, b) {
  return a.localeCompare(b);
}

async function ensureMigrationsTable() {
  await client.query(
    "create table if not exists app_migrations (id serial primary key, name text unique not null, run_at timestamptz not null default now())",
  );
}

async function appliedMigrations() {
  const res = await client.query(
    "select name from app_migrations order by name asc",
  );
  return new Set(res.rows.map((r) => r.name));
}

async function run() {
  await client.connect();
  await ensureMigrationsTable();

  const dir = path.resolve(process.cwd(), "migrations");
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".sql"));
  } catch (_e) {
    // no migrations directory yet
    files = [];
  }
  files.sort(byNameAsc);

  const applied = await appliedMigrations();
  const pending = files.filter((f) => !applied.has(f));

  for (const file of pending) {
    const full = path.join(dir, file);
    const sql = await readFile(full, "utf8");
    try {
      await client.query(sql);
      await client.query("insert into app_migrations(name) values($1)", [file]);
      process.stdout.write(`Applied ${file}\n`);
    } catch (error) {
      process.stderr.write(
        `Failed ${file}: ${String(error?.message ?? error)}\n`,
      );
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  process.stdout.write(
    pending.length ? "Migrations complete.\n" : "No pending migrations.\n",
  );
}

run().catch((e) => {
  process.stderr.write(`${String(e?.message ?? e)}\n`);
  process.exit(1);
});
