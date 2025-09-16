# @monte/database

This package provides the shared PostgreSQL access layer for the Monte platform. It bundles the Kysely client, migration scripts, and helper utilities that every API route uses.

### What is Kysely?

Kysely is a type-safe SQL query builder for TypeScript. Instead of writing raw SQL strings, we build queries with fluent methods (`selectFrom`, `where`, `insertInto`, etc.). The compiler knows the shape of each table, so if a column is renamed or removed, the TypeScript compiler will fail—preventing runtime surprises. Kysely also supports transactions and joins with full type inference, making it a foundation of our end-to-end type safety story.

## Components

- **`src/client.ts`** – Creates the Kysely instance using the Bun Postgres driver and reads `DATABASE_URL`.
- **`src/context.ts`** – Exposes `withDbContext({ userId, orgId }, fn)` which opens a transaction, sets Postgres `app.user_id`/`app.org_id`, and executes the callback. All API handlers should call this to cooperate with RLS.
- **`src/types.ts`** – Exports the generated Kysely table & enum types (re-exported through `index.ts`).
- **`migrations/`** – Timestamped SQL files that define the schema and security policies.
- **`scripts/`** – Bun scripts for executing migrations and regenerating types.

## Commands

```bash
bun run db:migrate   # apply pending migrations
bun run db:codegen   # regenerate types from the live database
bun run typecheck    # ensure TypeScript coverage
bun run lint         # Biome lint rules
```

## Conventions

1. **Timestamped migrations**: name files `YYYYMMDD_HHMMSS__description.sql`. Keep DDL idempotent where possible.
2. **RLS context**: every data access must run inside `withDbContext` so helper functions populate `current_setting('app.*')` values used by policies.
3. **Generated types**: run `bun run db:codegen` after any migration to keep `src/types.ts` aligned. Downstream packages (API + web) depend on these exports.
4. **No raw clients**: never instantiate Kysely manually in other packages—always import `{ db, withDbContext }` from `@monte/database`.

## Example Usage

```typescript
import { withDbContext } from "@monte/database";

export async function listStudentsForOrg(session: { userId: string; orgId: string }) {
  return withDbContext(session, async (trx) =>
    trx
      .selectFrom("students")
      .select(["id", "full_name", "org_id"])
      .where("org_id", "=", session.orgId)
      .orderBy("full_name", "asc")
      .execute()
  );
}
```

## Environment

Set `DATABASE_URL` (including SSL parameters if required) in the root `.env`. The Kysely client enables SSL by default with `rejectUnauthorized: false` for hosted Postgres providers—adjust if your environment requires stricter settings.

## Adding Tables or Policies

1. Create a new migration in `migrations/`.
2. Define tables/enums/policies using SQL (we prefer explicit column lists and constraints).
3. Run `bun run db:migrate` to apply.
4. Run `bun run db:codegen` to refresh TypeScript types.
5. Update shared schemas in `@monte/shared` so API + UI layers can consume the new data safely.

Keep this README current when new patterns or scripts are introduced—this package underpins the type system for the entire monorepo.
