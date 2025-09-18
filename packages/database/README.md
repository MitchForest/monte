# @monte/database – Postgres Access Layer

`@monte/database` centralises database access for the monorepo. It wraps the
shared Postgres pool, exposes a Kysely instance with row-level-security context,
and contains the SQL migrations that shape the Montessori schema.

## Responsibilities

- Create and cache the shared Kysely client + pg Pool (`src/client.ts`).
- Provide `withDbContext` which sets `app.user_id` / `app.org_id` before running
  queries so Postgres policies remain intact (`src/context.ts`).
- Generate the `DB` type definition from live schema (`src/types.ts`).
- Store versioned SQL migrations in `migrations/` and helper scripts for
  running/creating migrations (`scripts/`).

## Commands

```bash
# Apply migrations
bun --filter @monte/database db:migrate

# Create a timestamped migration shell
bun --filter @monte/database db:new --name add_students_table

# Regenerate Kysely types (requires DATABASE_URL)
bun --filter @monte/database db:codegen

# Lint / typecheck helpers
bun --filter @monte/database lint
bun --filter @monte/database typecheck
```

## Conventions

- Always run Kysely queries inside `withDbContext` so policies see the active
  user/org.
- Migrations should be idempotent and include ``drop ... if exists`` guards
  where appropriate; seed data belongs in application code, not migrations.
- When the schema changes, regenerate `src/types.ts` and commit the result so
  downstream packages stay type-safe.

