# Monte Monorepo

Monte is the home for our Montessori operations platform. The repository is a Bun-powered Turborepo that keeps vendor integrations, the internal API, shared contracts, and the Next.js UI aligned through end-to-end runtime validation and shared TypeScript types. This README gives junior developers the context they need to navigate the codebase confidently and ship changes without breaking cross-boundary guarantees.

## Why the Architecture Looks This Way
- **Keep vendor churn isolated.** The generated Timeback clients live in `packages/timeback-clients`, so if 1EdTech changes an API we only touch that package.
- **Expose a stable internal contract.** `apps/api` adapts vendor data and combines it with our Montessori database before handing it to the UI. All requests and responses are validated with the schemas in `packages/shared`.
- **Share truth through schemas.** Zod schemas flow from `packages/shared` → API handlers → React Query hooks. If a shape changes, both TypeScript and Zod fail fast.
- **Protect the database.** `packages/database` wraps Kysely and enforces row-level security by setting `app.user_id`/`app.org_id` inside every transaction via `withDbContext`.

```
Timeback APIs ─┬─> packages/timeback-clients  ─┐
               │ (generated SDK + OAuth)      │
               └─────────────► apps/api (BFF + adapters) ─► packages/shared (schemas & types) ─► apps/web (Next.js UI)
                                            │                             │
                                            └──────────── packages/database (Kysely + migrations)
```

## Workspace Responsibilities & Boundaries
- `apps/api`: Bun + Hono backend-for-frontend. Owns authentication, orchestration, and contract validation. It never returns raw vendor payloads.
- `apps/web`: Next.js 15 (App Router) UI. All server/client components consume data through typed helpers in `lib/api`. No direct fetches or vendor calls.
- `packages/shared`: Canonical contracts. Contains Zod schemas, inferred types, and small environment helpers (`loadServerEnv`, `requireServerEnv`).
- `packages/database`: Shared Kysely client, transaction helpers, and SQL migrations. Always call `withDbContext` so row-level security stays active.
- `packages/timeback-clients`: Generated Timeback/1EdTech clients plus OAuth + HTTP wrappers. Higher layers only interact with exported helper functions.

## Who Does What (and Who Talks to Whom)

### apps/web — "The UI"
**Purpose:** The frontend web app.  
**Talks to:** `apps/api` only.  
**Gets its types from:** `packages/shared`.

**Do:**
- Render pages, forms, and components.
- Call `apps/api` using request/response types from `packages/shared`.

**Don’t:**
- Talk directly to databases or external vendors.
- Define its own data models or API shapes.

---

### apps/api — "Our server"
**Purpose:** API routes for Monte (Timeback-related and internal endpoints).  
**Talks to:** `packages/database`, `packages/timeback-clients`.  
**Shares types with web via:** `packages/shared`.

**Do:**
- Implement route handlers.
- Validate inputs/outputs using schemas from `packages/shared`.
- Read/write data via `packages/database`.
- Call external services via `packages/timeback-clients`.

**Don’t:**
- Return shapes not defined in `packages/shared`.
- Query the DB directly without going through `packages/database`.

---

### packages/shared — "The contract"
**Purpose:** Source of truth for types & schemas shared between `apps/web` and `apps/api`.

**Do:**
- Define request/response types, enums, and validation schemas that both sides use.
- Keep names and shapes stable so web and API stay in sync.

**Don’t:**
- Contain business logic, DB code, or HTTP calls.

---

### packages/database — "DB access"
**Purpose:** Database queries and generated types (via Kysely).

**Do:**
- Define Kysely models, migrations, and query helpers.
- Export typed functions that `apps/api` calls.

**Don’t:**
- Know about HTTP or UI.
- Be imported by `apps/web`.

---

### packages/timeback-clients — "External APIs"
**Purpose:** Typed, Zod-validated clients for OneRoster, QTI, Caliper, and related vendor APIs.  
**Gets specs from:** OpenAPI docs, then adds runtime validation + TypeScript types.

**Do:**
- Fetch vendor specs and generate typed clients.
- Validate requests/responses with Zod.
- Expose simple functions `apps/api` can call.

**Don’t:**
- Be used directly by `apps/web`.
- Define our app’s response shapes (those live in `packages/shared`).

---

### Import Rules at a Glance
- `apps/web` → talks to `apps/api` over HTTP and imports shared schemas from `packages/shared` only.
- `apps/api` → imports from `packages/shared`, `packages/database`, `packages/timeback-clients`.
- `packages/shared` → stays pure (no DB, HTTP, or app-specific imports).
- `packages/database` → never imports web code or vendor clients.
- `packages/timeback-clients` → never imports web or database code.

This separation keeps responsibilities clear and prevents circular dependencies.

## Data Flow: Request to Render
1. **UI** calls a function from `apps/web/lib/api/endpoints.ts` (often via a React Query hook).
2. **Hono client** issues a request to `apps/api`. The response is parsed with the same Zod schema that defined the contract.
3. **API route** validates inbound params, pulls Timeback data (via cached clients) and Montessori data (via Kysely + `withDbContext`), then validates the outgoing payload again before calling `respond(...)`.
4. **Database** enforces policies using the context set in `withDbContext`.
5. **Vendor integrations** are hidden behind `packages/timeback-clients`. OAuth tokens, retries, and schema drift are handled there.

If any layer drifts from the shared schema, Zod throws at runtime and TypeScript raises compile errors.

## Tooling & Conventions
- **Runtime**: Bun 1.1 (scripts, API runtime, tests) + Turbo for orchestration.
- **Type safety**: TypeScript `strict` everywhere; no `any`. Zod schemas define contracts first.
- **Lint/format**: Biome (`bun run lint`, `bun format`).
- **Queries**: Prefer `for...of` over `Array.forEach` (Biome enforces). No bitwise operators, `var`, or `console` in code.
- **Database access**: Only inside `withDbContext({ userId, orgId }, trx => ...)`. Never query with the raw `db` in API routes.
- **HTTP layer**: Build routes with `@hono/zod-openapi`'s `createRoute`, respond via `respond(route, c, payload, status)`. This keeps OpenAPI docs accurate.
- **UI data access**: Always go through `lib/api/endpoints.ts` (or wrappers that call it). React Query handles caching and invalidation.
- **Environment loading**: Use `loadServerEnv`/`requireServerEnv` (`packages/shared/env.ts`) instead of `process.env` directly so tests can reset the cache.

## Getting Started Locally
1. Install prerequisites: Bun ≥1.1, Node 20+, PostgreSQL 15+ (with a database you can connect to), and `pdm` for generating vendor docs if needed.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Copy env files and fill in credentials (staging Timeback keys work for local):
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp packages/database/.env.example packages/database/.env
   cp packages/timeback-clients/.env.example packages/timeback-clients/.env
   ```
4. Apply database migrations (requires `DATABASE_URL` in `packages/database/.env`):
   ```bash
   bun run db:migrate
   ```
5. Start the API and web app together:
   ```bash
   bun run dev
   ```
   Turbo runs both workspaces concurrently with hot reload.

### Useful Workspace-Specific Commands
```bash
bun --filter @monte/api dev          # API only
bun --filter @monte/web dev          # Web only
bun --filter @monte/database db:new --name add_table
bun --filter @monte/database db:codegen
bun --filter @monte/timeback-clients fetch-specs
bun --filter @monte/timeback-clients generate
bun run lint                         # biome lint across the monorepo
bun run typecheck                    # tsc --noEmit in every workspace
```

## Adding a Feature Safely
1. **Shape the contract** in `packages/shared` (update the relevant schema + inferred types). Run `bun run typecheck` to see downstream fallout.
2. **Adapt data in `apps/api`**: create or extend a route using `createRoute`. Validate request/response with the shared schema and wrap DB access with `withDbContext`.
3. **Expose a typed helper in `apps/web/lib/api`**. Parse the response with the same schema and surface a friendly function for React Query.
4. **Build UI** components/hooks using those helpers. Handle loading and error states explicitly.
5. **Write migrations** if data changes (use `bun --filter @monte/database db:new`). Regenerate types with `db:codegen` and commit the generated file.
6. **Test** locally (`bun run lint`, `bun run typecheck`, targeted tests or manual flows) before opening a PR.

## Working With Timeback
- All machine-to-machine credentials live in `packages/timeback-clients/.env`. The package loads configs lazily and caches OAuth tokens per service.
- The API can optionally restrict which Timeback organizations we sync via `TIMEBACK_ORG_ALLOWLIST`.
- During local development you can set `DEV_AUTH_BYPASS=true` in `apps/api/.env` to auto-create a mock guide user.
- If you add new vendor operations, update or add the OpenAPI spec under `packages/timeback-clients/openapi/`, run `bun --filter @monte/timeback-clients generate`, and expose helpers through `src/index.ts`.

## Additional Documentation
- API docs are generated via `bun run scripts/generate-api-docs.ts` into `.docs/api`.
- Check `AGENTS.md` for automation details and `.docs/1EdTech-Docs.md` for vendor background.

Keeping the boundaries above intact ensures that juniors (and seniors!) get quick feedback when something drifts. When in doubt, start from the shared schema, follow the arrows in the architecture diagram, and let the tooling guide you.
