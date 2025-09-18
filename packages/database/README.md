# @monte/database – PostgreSQL Access Layer

This package centralises database connectivity for the monorepo. It exposes a shared Kysely client, transaction helpers that respect row-level security, generated typings for the current schema, and the SQL migrations that shape our Montessori data model.

## Key Pieces
- `src/client.ts` – Creates a `pg.Pool`, instantiates Kysely, and exports a Proxy (`db`) so callers always talk to the same connection pool.
- `src/context.ts` – Provides `withDbContext({ userId, orgId }, async trx => { ... })`, which sets `app.user_id` / `app.org_id` Postgres settings before executing your callback. These values power row-level security policies defined in the migrations.
- `src/types.ts` – Auto-generated TypeScript types representing the current schema. Regenerate after every schema change.
- `migrations/*.sql` – Timestamped SQL migrations. They enable RLS, define enums, and manage all tables/indices.
- `scripts/` – Helper Bun scripts invoked by package.json commands (`db:new`, `db:migrate`, `db:codegen`).

## Environment
Set `DATABASE_URL` in `.env` (copy from `.env.example`). You can also control SSL behaviour with:
- `DATABASE_SSL_MODE` (`disable`, `require`, `verify-full`, etc.)
- `DATABASE_SSL_REJECT_UNAUTHORIZED` (`false` to accept self-signed certs)

`loadServerEnv` from `@monte/shared` parses these variables before connections are created.

## Commands
```bash
bun --filter @monte/database db:migrate   # Apply migrations (up only)
bun --filter @monte/database db:new --name add_students_table
bun --filter @monte/database db:codegen  # Regenerate src/types.ts
bun --filter @monte/database lint
bun --filter @monte/database typecheck
```

### Migration Workflow
1. `bun --filter @monte/database db:new --name meaningful_change`
2. Edit the new SQL file in `migrations/`. Use `if exists` guards and keep statements idempotent when possible.
3. Run `bun --filter @monte/database db:migrate` against your dev database.
4. Execute `bun --filter @monte/database db:codegen` to refresh `src/types.ts` (this uses the live schema from `DATABASE_URL`).
5. Commit both the migration and updated types.

### Using the Database in Other Packages
- Always call `withDbContext` and pass the authenticated session (`{ userId, orgId }`). This ensures RLS policies defined in `migrations/*__app_policies.sql` remain in effect.
- Inside the callback you receive a Kysely transaction (`trx`). Prefer composing queries with Kysely’s fluent API; raw SQL is acceptable for complex cases but should still run inside the same transaction.
- The exported `db` proxy is available for rare, context-free operations (e.g. background tasks), but API routes should stick with `withDbContext` to avoid leaking data across organisations.

Row-level security and context helpers are the backbone of our multi-tenant safety model—respecting them is critical whenever you touch the database.
