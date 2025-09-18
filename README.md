# Monte Monorepo

Monte is a Bun-powered Turborepo that delivers a Montessori operations platform with strict, end-to-end type safety. The codebase is intentionally layered so each boundary owns a single responsibility:

```
packages/timeback-clients   ──►  apps/api (Timeback adapter + BFF)  ──►  packages/shared  ──►  apps/web
      "Heavy" vendor SDK              Internal API surface & DB          Shared contracts         React UI
```

## Architecture Overview

| Layer | Purpose | Key Tech |
| ----- | ------- | -------- |
| [`packages/timeback-clients`](packages/timeback-clients) | Generated, server-only SDK for Timeback/1EdTech services (OneRoster, Caliper, Powerpath, QTI). Handles OAuth, fetch wrappers, and Zod validation of vendor responses. | Bun, `openapi-zod-client`, Zod |
| [`apps/api`](apps/api) | Adapter + Backend-for-Frontend. Wraps the vendor SDK, joins Montessori data (habits, lessons, observations), applies org/session policy, and exposes a stable REST contract to the UI. | Bun, Hono, Kysely, Zod |
| [`packages/shared`](packages/shared) | Source of truth for our internal contracts. Exports Zod schemas and inferred TypeScript types that both the API and web app consume. | Zod, TypeScript |
| [`apps/web`](apps/web) | Next.js UI that talks only to the internal API via typed endpoint helpers. Uses React Query for data flow. | Next.js 15, React 19, Tailwind, Radix, TanStack Query |
| [`packages/database`](packages/database) | PostgreSQL access layer shared by the API (Kysely client, transactions, migrations). | Kysely, SQL migrations |

## End-to-End Type Safety & Validation

1. **Contracts live in `packages/shared`**. Every route or domain object starts as a Zod schema. The API parses inbound data with that schema and validates the response before returning it. The web app imports the same schema to parse responses client-side, guaranteeing runtime validation in both directions.
2. **Vendor data flows through `packages/timeback-clients`**. The generated clients validate Timeback responses with Zod before the adapters ever touch them. If Timeback changes a field, the generated schema forces us to react immediately.
3. **Adapters in `apps/api` map vendor data to internal contracts**. Each handler combines Timeback data with Montessori tables (habits, observations, lessons) inside `withDbContext`, then parses the outgoing payload with `@monte/shared`. Unit boundaries never leak vendor-specific shapes.
4. **`apps/web` consumes the BFF via typed helpers**. All network calls go through `lib/api/endpoints.ts`, which calls the Hono client and revalidates with the shared schema. React Query then caches strongly-typed results for components.

If any layer drifts, either TypeScript or Zod will fail—catching mismatches before they reach production.

## Repository Layout

```
apps/
  api/        # Hono API (BFF + Timeback adapter)
  web/        # Next.js front-end
packages/
  database/   # PostgreSQL helper layer
  shared/     # Shared Zod schemas & inferred types
  timeback-clients/ # Generated vendor SDK (Timeback APIs)
```

## Development Workflow

```bash
bun install
cp apps/api/.env.example apps/api/.env        # configure API env
cp apps/web/.env.example apps/web/.env        # configure web env

bun run dev            # run API + Web together
bun run typecheck      # strict TypeScript everywhere
bun run lint           # Biome lint rules
bun run db:migrate     # apply migrations (requires DATABASE_URL)
```

Run commands per workspace with Turbo filters:

```bash
bun --filter @monte/api dev
bun --filter @monte/web typecheck
bun --filter @monte/timeback-clients generate
```

## Adding a Feature Safely

1. **Contract** – add/update the schema in `packages/shared` (`schemas.ts`, `api-types.ts`).
2. **Adapter/API** – implement the handler in `apps/api`, combine vendor + Montessori data, and parse the result with the shared schema before responding.
3. **Client helper** – expose a typed function in `apps/web/lib/api/endpoints.ts` that calls the BFF and validates the response with the same schema.
4. **UI** – fetch data via React Query and render components.

By following this flow every time, we preserve the guarantees illustrated above.

## Additional Docs

Each workspace has its own README describing local conventions, environment variables, and commands:

- [`apps/api/README.md`](apps/api/README.md)
- [`apps/web/README.md`](apps/web/README.md)
- [`packages/shared/README.md`](packages/shared/README.md)
- [`packages/timeback-clients/README.md`](packages/timeback-clients/README.md)
- [`packages/database/README.md`](packages/database/README.md)

Keep those documents up to date when boundaries or workflows evolve.
