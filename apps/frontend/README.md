# @monte/frontend

Minimal SolidJS + Vite entry point. Routing, forms, tables, and Tailwind are installed; pages stay empty until we ship real features.

## Scripts

```bash
pnpm --filter @monte/frontend dev
pnpm --filter @monte/frontend build
pnpm --filter @monte/frontend preview
pnpm --filter @monte/frontend typecheck
```

## Notes

- Tailwind v4 styles live in `src/globals.css`.
- Routes are declared in `src/router.tsx`; add pages under `src/routes`.
- TanStack Form/Table utilities are available for when data wiring starts.
- The lesson editor uses the live Convex deployment, so changes you make to units/topics/lessons in the UI are written straight to the database via the mutations in `src/curriculum/api/curriculumClient.ts`.

### Curriculum content seeding

Authoring JSON lives under `src/curriculum/data/`. When you update those files or the catalog metadata, re-run the seed script to push the content into Convex:

```bash
CONVEX_URL=https://<your-convex-deployment>.convex.cloud \
pnpm --filter @monte/frontend curriculum:seed
```

This script is idempotent: it upserts units/topics/lessons and reorders them to match the catalog. Re-run it any time you change the static JSON source of truth.
