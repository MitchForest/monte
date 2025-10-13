# @monte/types

Single source of truth for shared Zod schemas, enums, and TypeScript helpers.

## Layout

```
src/
  shared/          # Cross-cutting primitives (ids, enums, helpers)
  domains/<domain> # Domain-specific schemas grouped by concern
  index.ts         # Re-exports shared + domain barrels
```

Frontend, backend, and API packages all import from these modules. Add new schemas here first, then propagate consumers.

## Commands

```bash
pnpm --filter @monte/types build     # Build ESM + types
pnpm --filter @monte/types typecheck # TypeScript only
```

## Conventions

- Domain folders can organise themselves into submodules (`lesson/`, `manifest/`, etc.) but must export through a single barrel.
- Avoid runtime logic; this package should contain types, schemas, and light validation helpers only.
- After significant schema changes, run `pnpm build:shared` from the repo root so `@monte/api` picks up the updates.*** End Patch
