# @monte/frontend

SolidJS + Vite app organised around user-facing features. Every page, provider, and piece of state lives inside the feature it belongs to; shared surface area stays in `app/` or `shared/`.

## Directory map

```
src/
  app/         # Root layout, router config, top-level providers, globals
  features/    # One folder per user-facing feature (auth, lesson-player, editor, …)
  shared/      # Cross-feature UI, utilities, and ambient types
```

Each feature uses the same internal structure:

```
features/<feature>/
  pages/        # Route-level components (lazy loaded by the router)
  components/   # Feature-specific UI pieces
  state/        # Stores, hooks, and view-models
  api/          # Calls into @monte/api or other services
  utils/        # Helpers scoped to the feature
  types/        # Optional; only when the types are feature-specific
```

The router lives at `src/app/router.tsx` and lazy-loads pages from feature barrels. No legacy `routes/` directory or re-export shims remain.

## Commands

```bash
pnpm --filter @monte/frontend dev       # Vite dev server
pnpm --filter @monte/frontend build     # Production build
pnpm --filter @monte/frontend preview   # Preview the built output
pnpm --filter @monte/frontend typecheck # TypeScript only
```

Run `pnpm lint` from the repo root before pushing changes.

## Conventions

- Import shared types and clients from `@monte/types` / `@monte/api` rather than duplicating schemas locally.
- Keep cross-cutting utilities in `src/shared/lib` and design tokens/components in `src/shared/ui`.
- When a feature requires new shared primitives, add them to `shared` and update the relevant README or plan doc.
- Remove dead code immediately; do not leave compatibility exports in place.

For milestone tracking and cleanup tasks, see `.docs/reorg-refactor.md`.*** End Patch
