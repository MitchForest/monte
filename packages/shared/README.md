# @monte/shared

`@monte/shared` is the source of truth for every domain type, Zod schema, and API envelope used by the Monte stack. Both the API and the web app import definitions from here to guarantee consistency.

## Contents

```
src/
├── types.ts        # Table & domain TypeScript types
├── schemas.ts      # Zod schemas for each entity
├── api-types.ts    # Response wrappers using ApiSuccessSchema
├── utils.ts        # Lightweight utilities (e.g., cn)
└── index.ts        # Barrel exports
```

## Design Principles

1. **Single contract**: anything shared between API and UI must live here—never redefine shapes inside an app.
2. **Schema-first**: Zod schemas define the runtime contract and power inferred types via `z.infer`. When you update a schema, export the new type.
3. **Standard envelope**: use `ApiSuccessSchema` for every success payload so responses always look like `{ data: ..., meta?: ... }`.
4. **Naming**: keep schema names descriptive (`StudentSchema`, `ClassroomWithGuidesSchema`) and mirror the database naming when possible.

## Adding a New Contract

1. Create or update the base entity schema in `schemas.ts`.
2. Extend or compose schemas in `api-types.ts` for responses (lists, details, etc.).
3. Export the inferred TypeScript types (`export type Student = z.infer<typeof StudentSchema>`).
4. Run `bun run typecheck` to ensure downstream packages pick up the changes.
5. Update the API route to parse with the new schema and the web app endpoint helper to validate responses.

## Commands

```bash
bun run typecheck
bun run lint
```

Keeping this package accurate prevents contract drift across the monorepo. When in doubt, define the structure here first, then consume it elsewhere.
