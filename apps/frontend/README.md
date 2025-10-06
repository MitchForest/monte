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
