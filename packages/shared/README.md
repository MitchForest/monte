# @monte/shared

`@monte/shared` is the single source of truth for Monte domain contracts. It now also houses the generated TimeBack schemas so every workspace (API, web, SDK) relies on the same definitions.

## Contents

```
src/
├── api-types.ts    # Monte response envelopes (ApiSuccessSchema, etc.)
├── schemas.ts      # Montessori domain Zod schemas
├── types.ts        # Montessori domain TypeScript types
├── utils.ts        # Shared utilities (cn, etc.)
└── timeback/
    ├── analytics.ts # Monte-defined helpers for TimeBack analytics summaries
    ├── generated/   # Zod schemas & endpoint metadata generated from TimeBack OpenAPI specs
    ├── envelope.ts  # Monte response helpers for TimeBack integrations
    └── index.ts     # Barrel exports for TimeBack-related modules
```

## How TimeBack Shapes Arrive Here

1. Run `bun --filter @monte/timeback-sdk update` to download the latest specs.
2. The SDK’s `generate` script writes the output directly into `packages/shared/src/timeback/generated`.
3. Re-export anything you need from `packages/shared` (e.g., `import { timeback } from "@monte/shared";`).
4. Use the shared Zod schemas to parse responses in API routes or UI client helpers.

By anchoring generated files inside `@monte/shared`, we guarantee the SDK, backend, and frontend use identical contracts without copy/paste.

## End-To-End Type Safety

- Define or update Zod schemas in `schemas.ts` (Monte domain) or rely on the generated TimeBack schemas under `timeback/generated`.
- Use `ApiSuccessSchema` (or the TimeBack-specific `TimebackSuccessSchema`) to keep response envelopes consistent.
- Re-export inferred types via `z.infer` so both runtime validation and TypeScript agree on shapes.

## Commands

```bash
bun --filter @monte/shared typecheck
bun --filter @monte/shared lint
```

Keep this package up to date whenever domain models or external contracts change; doing so prevents drift everywhere else.
