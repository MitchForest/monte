# @monte/timeback-clients – Timeback/1EdTech SDK

`@monte/timeback-clients` hosts our generated clients for Timeback/1EdTech
services (OneRoster, Caliper, Powerpath, QTI). It combines OAuth helpers,
fetch wrappers, and the generated operation catalog so the rest of the repo can
depend on a single, typed entry point.

## Responsibilities

- Load Timeback environment variables and normalise per-service configuration
  (`src/env.ts`).
- Create OAuth client-credential flows for service calls (`src/auth`).
- Expose a typed fetch wrapper that injects tokens, retries on `401`, and
  annotates responses (`src/http`).
- Generate strongly typed request/response helpers for each API (under
  `src/{service}`) using `openapi-zod-client`.
- Provide small service-level helpers (e.g. OneRoster grade mastery utilities).

Keep vendor-specific logic bottled up here. Higher layers should only call the
helper functions exported from `src/index.ts`.

## Specs & Codegen

The `openapi/` directory stores the checked-in vendor OpenAPI documents. Update
them with:

```bash
bun --filter @monte/timeback-clients fetch-specs
bun --filter @monte/timeback-clients generate
```

`fetch-specs` downloads the latest YAML (staging + production). `generate`
transforms those specs into Zod schemas and types.

## Commands

```bash
bun --filter @monte/timeback-clients lint
bun --filter @monte/timeback-clients test
```

Type-checking currently happens via the consumers; we plan to re-enable a
package-local step once the generated output stabilises.

