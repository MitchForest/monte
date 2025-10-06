# Monte

pnpm workspace pairing a SolidJS frontend with a Convex backend. Everything is wired but intentionally minimal so real product code can land without rewrites.

## Packages

- `apps/frontend` – SolidJS + Vite app prepped with TanStack Router/Form/Table and Tailwind v4.
- `apps/backend` – Convex project scaffold with config and TypeScript ready to extend.

## Getting Started

```bash
pnpm install
pnpm dev
```

Use `pnpm --filter @monte/frontend dev` or `pnpm --filter @monte/backend dev` to run packages individually.
