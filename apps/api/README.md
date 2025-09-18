# @monte/api – Adapter & Backend for Frontend

This workspace exposes the internal Monte API consumed by the Next.js app. It shields the UI from Timeback/1EdTech details, applies Montessori-specific business rules, and guarantees that every request/response matches the Zod schemas in `@monte/shared`.

## What Lives Here
- **Hono application** (`src/index.ts`) bootstraps the API, sets up CORS, and mounts feature routers under `/students`, `/habits`, and so on.
- **Authentication** (`src/lib/auth/session.ts`) verifies Cognito access tokens or provisions a dev guide when `DEV_AUTH_BYPASS=true`. It also syncs OneRoster memberships and ensures users belong to an org.
- **HTTP helpers** (`src/lib/http`) provide `respond(route, ctx, payload, status)` and `HTTP_STATUS` constants so route handlers stay aligned with the OpenAPI definition produced by `@hono/zod-openapi`.
- **Timeback integration helpers** (`src/lib/timeback`) instantiates cached clients from `@monte/timeback-clients`, enforces the optional org allowlist, and exposes helpers like `isCaliperConfigured()`.
- **Domain services** (`src/services`) shape vendor data into Monte nouns. Examples: `services/students/xp.ts` normalises Caliper events for consumption by the UI, while `services/students/placements.ts` turns PowerPath payloads into our placement summary format.
- **Routes** (`src/routes`) are thin; they validate inputs, call services, and validate outputs before returning.

## Request Lifecycle
1. **Route definition** – use `createRoute` from `@hono/zod-openapi` to describe method, params, and response schemas from `@monte/shared`.
2. **Session** – call `getServerSession(c.req.raw)` to resolve the user/org context. Return `HTTP_STATUS.unauthorized` when absent.
3. **Data access** – wrap DB work with `withDbContext({ userId, orgId }, trx => ...)`. This sets Postgres RLS headers (`app.user_id`, `app.org_id`) so policies apply automatically.
4. **Vendor calls** – use helpers in `src/lib/timeback`. These functions create generated SDK clients, retry with fresh OAuth tokens when needed, and fall back to local data if the service is disabled.
5. **Validation** – parse all outgoing payloads with the shared schema (e.g. `StudentDetailResponseSchema.parse({ data: ... })`). Only then call `respond(route, c, payload)`.

Following this pattern keeps OpenAPI docs accurate and prevents accidentally leaking vendor-specific fields.

## Environment Variables (`.env`)
| Key | Purpose |
| --- | ------- |
| `PORT` | HTTP port for the Bun server (default 8787). |
| `API_URL` | Base URL advertised in the generated OpenAPI spec (useful in production). |
| `APP_ORIGINS` | Comma-separated list used by `getCorsOrigins()` to configure CORS. |
| `DATABASE_URL` | Postgres connection string consumed by `@monte/database`. |
| `COGNITO_AUTHORITY` / `COGNITO_AUDIENCE` | Cognito issuer + audience for validating Bearer tokens. |
| `DEV_AUTH_BYPASS` + `DEV_*` | Enable a seeded dev user/org for local work without Cognito. |
| `DEFAULT_ORGANIZATION_ID` | Optional fallback org id when a user has no membership. |
| `TIMEBACK_ORG_ALLOWLIST` | Comma-separated Timeback org IDs we allow to sync. Leave blank to allow all. |
| `TIMEBACK_*` / `ONEROSTER_*` / `CALIPER_*` | Service-specific client credentials. Forwarded to the generated clients. |
| `OPENAI_API_KEY` | Required for AI-generated summaries (`lib/integrations/openai`). |
| `RESEND_API_KEY` / `RESEND_FROM_ADDRESS` | Transactional email for summaries and invites. |

See `apps/api/.env.example` for the full list.

## Commands
```bash
bun run dev          # Start the Bun server with hot reload
bun run build        # Bundle for production (outputs to dist/)
bun run start        # Run the compiled build with .env loaded
bun run typecheck    # tsc --noEmit
bun run lint         # Biome lint for this workspace
bun run test         # Bun tests (currently lightweight)
bun run db:migrate   # Apply migrations through @monte/database
```
Use Turbo filters to scope commands from the repo root: `bun --filter @monte/api dev`.

## Adding or Modifying a Route
1. **Update schemas** in `packages/shared` first so every consumer knows the shape.
2. **Define the route** under `src/routes/<feature>.ts`:
   - Create a `createRoute` definition with tags, params, and response schemas imported from `@monte/shared`.
   - Register it on an `OpenAPIHono` instance via `.openapi(route, handler)`.
3. **Authenticate** with `getServerSession`. Handle the null case before any IO.
4. **Run work inside `withDbContext`** using the session's `userId`/`orgId`.
5. **Call services** for Timeback/OneRoster data when needed (add new helpers under `src/services` if logic grows).
6. **Validate** the final payload with the schema you referenced in step 2 and return it with `respond(route, ctx, payload)`.
7. **Register the router** in `src/index.ts` if it's new (e.g. `.route("/students", studentsRouter)`).
8. **Regenerate OpenAPI** documentation by hitting `/openapi.json` or `/docs` to ensure the endpoint appears.

## Working With Timeback
- Get clients from `src/lib/timeback/clients` (`getOneRosterClient`, `getCaliperClient`, etc.). They cache OAuth tokens and return `null` when a service is unconfigured.
- Use `isOrgAllowed(orgId)` before syncing data to respect the allowlist.
- Map vendor payloads into Monte domain types within `src/services`. Avoid returning raw Timeback JSON from routes—add or adjust shared schemas in `@monte/shared` first.
- When adding operations, update the generated SDK (`bun --filter @monte/timeback-clients generate`) and create a domain helper that translates the response into our contract.

## Testing & Troubleshooting
- Set `DEV_AUTH_BYPASS=true` locally to skip Cognito (a dev guide user/org will be created automatically).
- Use `bun --filter @monte/database db:new --name <change>` to create migrations. Re-run `bun --filter @monte/database db:codegen` afterward so the `DB` types stay fresh.
- Check `/health` for a quick liveness probe and `/docs` for Swagger UI.
- Log vendors errors with `process.stderr.write(...)`—this keeps stdout clean for expected Bun logs.

Keep routes thin, move orchestration into services, and let shared schemas do the heavy lifting. That way new features stay predictable and we continue to catch integration drift early.
