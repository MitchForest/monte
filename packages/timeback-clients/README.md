# @monte/timeback-clients – Timeback/1EdTech SDK Wrapper

This package contains the generated clients and helpers we use to talk to Timeback/1EdTech services (OneRoster, Caliper, Powerpath, QTI). It hides OAuth token juggling, request retries, and schema drift from the rest of the monorepo.

## What It Provides
- **Environment loader** (`src/env.ts`) — reads `.env` and figures out which base URLs, token endpoints, scopes, and credentials belong to each service (`staging` vs `production`).
- **OAuth helpers** (`src/auth`) — `createOAuthClient` caches client-credential tokens with clock-skew protection. `createOAuthClientFromService` wires environment configs into a ready-to-use client.
- **HTTP wrapper** (`src/http`) — `createTimebackFetch` injects OAuth tokens, normalises errors into `TimebackClientError`, and exposes `callOperation(client, alias, args)` generated from the OpenAPI specs.
- **Service clients** (`src/{service}`) — typed factories (e.g. `createOneRosterClient`) and helper functions for common operations.
- **Type exports** (`src/types.ts`) — derived `OperationSpecMap`, `OperationAlias`, etc., so higher layers can call operations without stringly typed endpoints.

## Environment Setup
Copy `.env.example` to `.env` and fill in at least the staging credentials you received from Timeback:
```
STAGING_CLIENT_ID=...
STAGING_CLIENT_SECRET=...
STAGING_AUTH_API=https://...
ONEROSTER_STAGING_API_URL=https://...
CALIPER_STAGING_API_URL=https://...
# ...and so on per service
```
You can optionally provide production values for later promotion. The loader automatically falls back between global credentials (e.g. `STAGING_CLIENT_ID`) and service-specific overrides (e.g. `ONEROSTER_STAGING_CLIENT_ID`).

The API package pulls configuration at runtime via `loadTimebackEnv()` and `getTimebackServiceConfig(service)`—if keys are missing the client factory simply returns `null`, allowing graceful fallbacks.

## Code Generation Workflow
1. Update the OpenAPI YAML files under `openapi/` (either manually or with the fetch script).
   ```bash
   bun --filter @monte/timeback-clients fetch-specs
   ```
2. Regenerate Zod schemas, TypeScript types, and client wrappers:
   ```bash
   bun --filter @monte/timeback-clients generate
   ```
3. Export new helpers from `src/index.ts` as needed.

Generated files are committed so consumers always get the same shapes. When specs change, regenerate and update callers in `apps/api`.

## Using the Clients
Higher-level code (usually in `apps/api`) should:
```ts
import { oneroster } from "@monte/timeback-clients";
const client = oneroster.createOneRosterClient({ environment: "staging" });
if (!client) {
  // service disabled – fall back to local data
}
const roster = await oneroster.listStudents(client, { limit: 100 });
```
Prefer the convenience helpers exported from each service module rather than manually calling `callOperation`. They include typed request/response shapes and Zod validation out of the box.

## Caching & Error Handling
- OAuth tokens are cached per service until they are near expiry. `client.auth.invalidate()` forces a refresh (rarely needed).
- The HTTP wrapper retries once on `401 Unauthorized` by refreshing the token.
- Responses are parsed with generated Zod schemas so schema drift is caught immediately.
- Throwing `TimebackClientError` gives callers access to the HTTP status, body, and operation name for logging.

## When to Touch This Package
- Timeback releases new endpoints or fields we want to consume.
- Credentials or environment detection logic changes.
- We want to add higher-level helpers (e.g. mapping OneRoster users into our domain models) that are still vendor-specific.

All other work should happen in the API layer. Keeping vendor quirks bottled up here ensures the rest of the repo only deals with stable, Monte-shaped data.
