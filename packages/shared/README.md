# @monte/shared – Contracts & Utilities

`@monte/shared` is the canonical source of our shared contracts and runtime
utilities. Both the API and the web app consume these Zod schemas directly so
we can guarantee request and response parity.

## Responsibilities

- Define the DTOs, envelopes, and helpers that power cross-app contracts.
- Validate and read strongly-typed environment variables with
  `loadServerEnv/requireServerEnv`.

Keep this package focused on declarative schemas and pure utilities—no direct
data fetching or framework bindings. When contracts change, bump them here
first, run `bun typecheck`, and let the failures guide the caller updates.

## Commands

```bash
bun --filter @monte/shared lint
bun --filter @monte/shared typecheck
```

Formatting is handled by Biome at the repo root.
