# Timeback SDK

The Timeback SDK is Monte’s shared integration layer for the TimeBack platform. It provides:

- A single Bun-friendly client (`TimebackClient`) that wires shared HTTP settings, bearer auth, and namespace enforcement across TimeBack Core and Caliper APIs
- Auto-generated Zod schemas and endpoint metadata (stored in `@monte/shared/timeback/generated`) so type definitions are shared across every Monte workspace
- Runtime validation of every request/response so upstream API drift fails fast during development
- Monte-aligned wrappers (`createMonteTimeback`) that return our `{ data, meta? }` envelope and are safe to consume in React Query or API handlers

## When to Use

Use this package whenever you need to:

- Synchronize users, rosters, or audit data from TimeBack Core
- Interact with OneRoster v1.2 entities (organizations, schools, classes, enrollments, academic sessions)
- Manage SSO sessions or authentication flows backed by TimeBack
- Work with Caliper events (validation, ingest, analytics queries, webhooks)

Instead of emitting ad-hoc `fetch` calls, import the shared SDK so every project stays aligned with the same TimeBack contract.

## Installation & Configuration

```ts
import { TimebackClient, createMonteTimeback } from "@monte/timeback-sdk";

const client = new TimebackClient({
  core: {
    baseUrl: process.env.TIMEBACK_CORE_URL!,
    token: process.env.TIMEBACK_CORE_TOKEN ?? null,
    namespace: "monte", // ensures OneRoster data is namespaced
  },
  caliper: {
    baseUrl: process.env.TIMEBACK_CALIPER_URL!,
    token: process.env.TIMEBACK_CALIPER_TOKEN ?? null,
  },
});

// Monte-aligned helpers: envelope responses under { data, meta? }
const timeback = createMonteTimeback(client);
const users = await timeback.users.list({ page: 1, pageSize: 20 });
const authInfo = await timeback.auth.getAuthInfo();
```

`TimebackClient` exposes the low-level SDK (`client.core.*`, `client.caliper?.*`). `createMonteTimeback(client)` wraps those methods and returns Monte’s envelope so downstream code can plug directly into React Query or API routes without manual normalization.

## Directory Structure

```
src/
├── client.ts         # Constructs TimebackClient (core + optional Caliper)
├── http/             # Fetch wrapper with request helpers and error normalization
├── core/             # Hand-authored helpers over generated Core endpoints
├── caliper/          # Hand-authored helpers over generated Caliper endpoints
├── monte/            # Monte-aligned wrappers returning { data, meta? }
└── index.ts          # Entry point re-exporting clients, helpers, and types
```

The OpenAPI-derived artifacts now live in `@monte/shared/timeback/generated`. All Monte workspaces rely on the same generated files, keeping type definitions and Zod schemas synchronized.

## Scripts & Code Generation

### Update Specs & Regenerate

```bash
bun --filter @monte/timeback-sdk update
```

This downloads the latest TimeBack OpenAPI definitions, writes them to `packages/timeback-sdk/specs`, and regenerates schemas/types into `packages/shared/src/timeback/generated`. After regeneration, run `bun run typecheck` (or the workspace aggregate) to ensure nothing drifted.

### Regenerate from Local Specs Only

```bash
bun --filter @monte/timeback-sdk generate
```

Generation uses a custom `openapi-zod-client` template that produces:

- Zod schemas for every request/response
- Endpoint metadata (method, path, parameters) for each tag
- Types consumed by the hand-authored wrappers

Because the generated code resides in `@monte/shared`, any consumer (`apps/api`, `apps/web`, or other packages) always references the same definitions.

## Namespace Guardrails

Passing `namespace` when constructing `TimebackClient` activates helper logic in `OneRosterClient` to:

- Stamp `metadata.monteNamespace` on every record we create
- Filter list responses to our namespace by default
- Reject destructive operations if the target record lacks our namespace stamp

This prevents accidental modifications to other tenants when sharing a TimeBack instance.

## Monte-Friendly Endpoint Helpers

Use `createMonteTimeback` for normalized responses:

```ts
const timeback = createMonteTimeback(client);

const roster = await timeback.oneRoster.listClasses({ limit: 50 });
// roster === { data: { classes: [...] }, meta?: {...} }

const caliperHealth = await timeback.caliper.health();
// caliperHealth === { data: { status: "ok", ... } }
```

Each helper wraps the underlying SDK method, validates with shared schemas, and emits Monte’s `{ data, meta? }` envelope. They are safe to drop directly into TanStack Query hooks.

## Development Commands

```bash
bun --filter @monte/timeback-sdk typecheck
bun --filter @monte/timeback-sdk generate
bun --filter @monte/timeback-sdk update
```

Linting is skipped (output is largely generated), but downstream projects should still run Biome on their own code.

## Staying in Sync

1. Run `bun --filter @monte/timeback-sdk update` whenever TimeBack publishes new API versions.
2. Commit the updated specs and generated files under `packages/shared/src/timeback/generated`.
3. Update `@monte/shared` schemas or Monte wrappers as needed to reflect new endpoints.
4. Update this README (and `packages/shared/docs` if applicable) so future contributors know the contract changed.

By centralizing contracts in `@monte/shared`, we eliminate drift between API, web, and SDK consumers and get the benefit of runtime validation everywhere.
