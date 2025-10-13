# @monte/api

Typed helpers that wrap Convex HTTP clients. Generated bindings are synced from `apps/backend/convex/_generated`, then domain-specific helpers add higher-level ergonomics.

## Layout

```
convex/_generated/   # Copied from apps/backend via pnpm sync:codegen
src/
  core/              # Convex client factory and other cross-domain helpers
  domains/<domain>/  # Domain-specific clients (curriculum, …)
  shared/            # Environment accessors and other shared utilities
  index.ts           # Public exports
```

Consumers should import from `@monte/api` or `@monte/api/<path>` rather than reading generated files directly.

## Commands

```bash
pnpm --filter @monte/api build     # Bundle helpers + emit types
pnpm --filter @monte/api typecheck # TypeScript only
```

## Notes

- Run `pnpm sync:codegen` in the repo root after backend changes so the generated bindings stay in sync.
- Keep fallback logic minimal—prefer surfacing informative errors when the Convex URL is missing instead of mirroring production APIs locally.*** End Patch
