# Monte

Monte is a fully type-safe Montessori operations platform built in a Bun-powered Turborepo. Every workspace is designed to share contracts, enforce accessibility, and keep the API surface consistent from database to React components.

## Repository Layout

| Path | Description |
| ---- | ----------- |
| `apps/api` | Bun + Hono REST API with Better Auth, Kysely-backed handlers, shared `respond()` helper, and optional TimeBack integrations. |
| `apps/web` | Next.js 15 application using React 19, Tailwind v4, Shadcn/Radix primitives, and TanStack Query. |
| `packages/database` | Postgres access layer (Kysely client, transactions, migrations). |
| `packages/shared` | Single source of truth for Zod schemas, TypeScript types, response envelopes, and TimeBack analytics helpers. |
| `packages/timeback-sdk` | External TimeBack API SDK; generation targets `@monte/shared/timeback` so all workspaces share the same contract. |

## Tech Stack at a Glance

- **Runtime & Tooling**: Bun ≥ 1.1, Turborepo, strict TypeScript, Biome formatting/linting.
- **Frontend**: Next.js App Router, Server Components where possible, Tailwind CSS v4, Shadcn UI abstractions over Radix primitives, TanStack React Query for data orchestration.
- **Backend**: Hono HTTP framework, Better Auth, PostgreSQL via Kysely (with row-level security context helpers).
- **Shared Contracts**: All types and response envelopes come from `@monte/shared` Zod schemas to guarantee parity between API and UI.

## Development Workflow

```bash
bun install          # install dependencies
cp .env.example .env # configure environment

bun run dev          # run all workspaces (api + web)
bun run build        # build everything
bun run typecheck    # strict TS across the monorepo
bun run lint         # Biome lint/format checks

bun run db:migrate   # apply database migrations
bun run db:codegen   # regenerate Kysely types after schema changes
```

Use Turbo filters to scope commands:

```bash
bun --filter @monte/api dev
bun --filter @monte/web typecheck
```

## End-to-End Type Safety

Monte enforces a single contract for every domain entity through the `packages/shared` workspace. A new route or mutation should follow this template:

1. **Define/extend schemas** in `packages/shared`.
   - Add or update the Zod schema in `schemas.ts` and export inferred types from `api-types.ts`.
   - Include request/response envelopes using the shared `ApiSuccessSchema` helper so every response is `{ data, meta? }`.
2. **Implement the API handler** in `apps/api`.
   - Parse input using the shared schema (`Schema.parse(...)`) before executing.
   - Wrap database work in `withDbContext({ userId, orgId }, trx => ...)` to participate in multi-tenant RLS.
   - Parse the outbound payload with the shared response schema and return it with `respond(route, c, parsed, status?)` so TypeScript enforces status-aware typing.
3. **Expose the client helper** in `apps/web/lib/api/endpoints.ts`.
   - Call the Hono client (`apiClient`) and pass responses through `handleResponse(..., SharedSchema)` to keep runtime validation aligned with build-time types.
   - Export simple functions (e.g. `listStudents`, `createStudent`) returning the parsed data for React Query.
4. **Add a React Query hook or usage** in the consuming component.
   - Queries are keyed (`['students', { search, classroomId }]`) and mutate via `useMutation`, invalidating the relevant keys on success.
   - Components should not perform manual `fetch` calls—always reuse the typed endpoint helpers.

This loop guarantees that if any shape diverges, compilation or runtime parsing fails immediately in both API and UI layers.

### Tooling Primer

- **Kysely** is a type-safe SQL builder for TypeScript. We use it to talk to Postgres without writing raw SQL in application code. Kysely infers return types from column selections, which keeps database queries synchronized with our generated TypeScript definitions.
- **Zod** supplies runtime validation on top of TypeScript types. Schemas defined in `@monte/shared` guard API inputs/outputs and power `z.infer` to produce matching static types for consumers.
- **TanStack React Query** is our data orchestration layer in the React app. It manages caching, loading states, background refetching, and error handling for all network interactions. Every query or mutation in the UI flows through React Query so we never reimplement fetching logic manually.
- **Shadcn UI & Radix** provide accessible, unstyled primitives. We wrap these components with Tailwind classes to keep the UI consistent while meeting accessibility rules.
- **Shared `respond()` helper** guarantees every success path mirrors the OpenAPI metadata. Import it from `apps/api/src/lib/http/respond.ts` to return typed responses instead of calling `c.json` directly.
- **TimeBack SDK** generates Zod schemas from TimeBack’s OpenAPI specs directly into `@monte/shared/timeback`. Use `createMonteTimeback(client)` to access helpers that return Monte’s `{ data, meta? }` envelope while staying in sync with the external contract.

## React Query & Data Flow

- All network access from the web app goes through `apps/web/lib/api/endpoints.ts`, which wraps the shared Hono client with Zod validation.
- `apps/web/components/providers/query-provider.tsx` registers a single `QueryClient` at the root so both Server Components and client routes share cache state.
- Mutations must invalidate the exact query keys they impact (e.g., `queryClient.invalidateQueries({ queryKey: ['students'] })`).
- Errors propagate through TanStack Query into the `toast` UX helpers; do not swallow exceptions in components.

## Database Conventions

- `withDbContext` ensures every transaction sets `app.user_id` and `app.org_id`. Always use it when performing work tied to authenticated users or organizations.
- Migrations live in `packages/database/migrations`. Use UTC timestamps in file names (`YYYYMMDD_HHMMSS__description.sql`).
- After editing migrations or schema, run `bun run db:codegen` to regenerate types consumed across packages.

## Project Policies

- **No direct fetches** outside the shared API client.
- **No schema drift**—backend must parse outgoing data using shared schemas.
- **React Query only** for client-side data orchestration (no ad-hoc `useEffect` fetchers).
- **Strict linting/formatting** with Biome; run `bun run lint` prior to commits.
- **Accessibility**: adhere to the ruleset in the repo (e.g., no custom roles on native elements, proper form labeling).

## Adding a Feature Checklist

1. Update or create schemas/types in `@monte/shared`.
2. Create migrations (if schema change) and regenerate database types.
3. Implement the Hono route using schema parsing + `withDbContext`.
4. Add typed endpoint helpers and React Query hooks.
5. Write UI components that consume hooks (no direct fetch).
6. Run `bun run typecheck` and `bun run lint`.
7. Update relevant README sections to document new contracts or flows.

Following these steps prevents architectural drift and keeps every layer aligned.
