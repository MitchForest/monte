# @monte/backend

Convex project scaffold. Schema and functions are intentionally empty so we can model data alongside product work.

## Scripts

```bash
pnpm --filter @monte/backend dev
pnpm --filter @monte/backend deploy
pnpm --filter @monte/backend typecheck
```

## Notes

- Configure tables in `convex/schema.ts`.
- Add queries/mutations under `convex/` as features require them.
- Run `convex login` once before `pnpm --filter @monte/backend dev`.
