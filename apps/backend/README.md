# @monte/backend

Convex backend organised by domains. Auth, config, and generated artefacts live under `convex/core`; feature logic lives under `convex/domains/<domain>`.

## Layout

```
convex/
  core/                # Auth client, adapters, config, generated assets
  domains/<domain>/    # queries.ts, mutations.ts, services.ts, index.ts
  routes/http.ts       # HTTP router composition
  schema/              # tables.ts + index.ts export
  index.ts             # Re-export domain barrels
  _generated/          # Convex codegen output (kept in sync with packages/api)
```

Regenerate bindings after schema or function changes:

```bash
pnpm sync:codegen
```

## Scripts

```bash
pnpm --filter @monte/backend dev       # Convex dev server
pnpm --filter @monte/backend deploy    # Deploy functions to Convex
pnpm --filter @monte/backend typecheck # TypeScript only
```

## Conventions

- Author shared utilities in `core/` only when they apply to every domain; otherwise keep helpers beside the domain that uses them.
- Update `convex/schema/tables.ts` through shared schemas from `@monte/types`; do not duplicate schemas locally.
- After any schema change, run `pnpm sync:codegen` and commit the resulting updates in both `apps/backend/convex/_generated` and `packages/api/convex/_generated`.
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` from the repo root before opening a PR.*** End Patch
