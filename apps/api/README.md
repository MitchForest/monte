# @monte/api – Timeback Adapter & BFF

This workspace is the Backend-for-Frontend that the web app consumes. It sits between the generated Timeback SDK and our Montessori data, applying authorization, caching, and schema mapping before exposing a stable REST contract.

## Responsibilities

- **Timeback adapter** – wrap `@monte/timeback-clients` (OneRoster, Caliper, Powerpath, QTI), constrain it to the operations we use, and translate vendor payloads into internal contracts.
- **Montessori data access** – read/write Postgres through `@monte/database` using `withDbContext` so row-level security stays in effect.
- **Contract enforcement** – validate every request/response with the Zod schemas exported from `@monte/shared`.
- **Stable BFF** – expose routes consumed by the web app; never leak vendor-specific shapes across the boundary.

```
(Timeback APIs) ──► @monte/timeback-clients ──► apps/api ──► @monte/shared ──► apps/web
                      (SDK)                     (adapter/BFF)   (contracts)      (UI)
```

## Project Structure

```
src/
├── index.ts          # Hono app entry (CORS, OpenAPI metadata, route mounting)
├── lib/
│   ├── auth/         # Better Auth session helpers
│   ├── http/         # respond(), status codes, shared middleware
│   └── timeback/     # Cached instances of generated clients + feature services
├── routes/           # Hono routers per resource (students, habits, analytics, etc.)
└── services/         # Domain logic that combines Timeback + Montessori data
```

Each route has the same lifecycle:

1. **Parse input** with the shared schema (`schema.parse(...)`).
2. **Fetch vendor data** through a service (which calls the relevant Timeback client helper).
3. **Join Montessori data** inside `withDbContext({ userId, orgId }, trx => ...)`.
4. **Map to internal contract** and validate with the shared response schema.
5. **Return via `respond(route, c, payload, status)`** so typing stays aligned with the OpenAPI declaration.

## Commands

```bash
bun run dev          # start Hono with hot reload
bun run build        # bundle for production
bun run start        # run the built output
bun run typecheck    # strict TypeScript checks
bun run lint         # Biome lint
bun run db:migrate   # apply migrations (delegates to @monte/database)
```

Use Turbo filters to scope:

```bash
bun --filter @monte/api dev
bun --filter @monte/api typecheck
```

## Environment

Copy `apps/api/.env.example` to `.env` and provide:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/monte
PORT=8787
APP_ORIGINS=http://localhost:3000
BETTER_AUTH_URL=http://localhost:8787
BETTER_AUTH_SECRET=super-secret

# Optional Timeback integration (staging credentials recommended early on)
TIMEBACK_ENVIRONMENT=staging
ONEROSTER_STAGING_API_URL=...
ONEROSTER_STAGING_CLIENT_ID=...
ONEROSTER_STAGING_CLIENT_SECRET=...
CALIPER_STAGING_API_URL=...
CALIPER_STAGING_CLIENT_ID=...
CALIPER_STAGING_CLIENT_SECRET=...
```

Leave Timeback variables empty to disable the integration during development; the app will stub those routes gracefully.

## Adding a Route

1. **Contracts** – extend `packages/shared/src/schemas.ts` and `api-types.ts` with the new request/response schema.
2. **Service** – (optional) add a function in `src/services/...` that orchestrates Timeback + local data.
3. **Route** – create `src/routes/<feature>.ts`, derive a typed `createRoute`, validate input/output, and register it in `src/index.ts`.
4. **Client helper** – add the matching function in `apps/web/lib/api/endpoints.ts` so React Query can consume it.

Keep this README updated if the adapter responsibilities or policies evolve.
