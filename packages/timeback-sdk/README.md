# Timeback SDK

Monte’s central integration point for TimeBack. This package gives every app and service a single, type-safe way to talk to TimeBack’s Core platform (Open Badges, OneRoster, CASE, QTI, Users, etc.) and the Caliper analytics service. Instead of sprinkling ad-hoc `fetch` calls across the codebase, we share one SDK that:

- Encodes all request/response shapes directly from TimeBack’s OpenAPI specs
- Validates responses at runtime so backend changes surface immediately during development
- Prevents divergence between Monte apps and TimeBack contracts by failing fast when the API drifts
- Provides ergonomic clients (`core.auth`, `core.users`, `core.oneroster`, `caliper.*`) that can be consumed in API routes, background jobs, and the Next.js app

The SDK is the gateway for future automation: seeding users from OneRoster, issuing Open Badges, syncing CASE frameworks, importing QTI assessments, and streaming Caliper analytics.

## Features

- Shared HTTP client with pluggable `fetch`, bearer token handling, and consistent error reporting
- Core API helpers for authentication flows (Better Auth-compatible), SSO session management, user administration, OneRoster rostering endpoints, and audit reporting/health checks
- Caliper helpers for validating and ingesting events as well as managing analytics queries and webhooks
- Runtime validation and static types derived directly from the official OpenAPI specifications
- Code generation produces per-tag modules (Authentication, Open Badges, CASE, QTI, OneRoster, etc.) with Zod schemas and request metadata
- Optional Monte namespace enforcement (`namespace` option) tags every OneRoster record with `metadata.monteNamespace` so the SDK only reads/modifies data we own

## Usage

```ts
import { TimebackClient } from "@monte/timeback-sdk";

const client = new TimebackClient({
  fetch,
  core: {
    baseUrl: "https://core.timebackapi.com/v2",
    token: process.env.TIMEBACK_CORE_TOKEN ?? null,
    namespace: "monte",
  },
  caliper: {
    baseUrl: "https://caliper.timebackapi.com",
    token: process.env.TIMEBACK_CALIPER_TOKEN ?? null,
  },
});

const currentUser = await client.core.auth.getCurrentUser();
const health = await client.core.health.check();
const schools = await client.core.oneroster.listSchools({ limit: 100 });

if (client.caliper) {
  await client.caliper.sendEnvelope(envelope);
}
```

The SDK ships without side effects and can be consumed from API routes, background jobs, or command-line tooling.

## Architecture Overview

- `src/http` – lightweight fetch wrapper that handles bearer auth, JSON serialization, and error normalization.
- `src/generated` – auto-generated Zod schemas and endpoint definitions produced from the OpenAPI specs.
- `src/core` – friendly wrappers for the Core API that currently expose authentication flows, user management, SSO session management, audit reporting, namespace-aware OneRoster CRUD (organizations, schools, academic sessions, courses, classes, enrollments), and the core health probe. Remaining tags such as Open Badges, CASE, QTI, and API Keys already have generated schemas in `src/generated/core.ts/*` ready to wire up.
- `src/caliper` – wrappers for Caliper envelope validation/ingest, analytics queries, and webhook CRUD using the generated `caliper.ts` artifacts.
- `src/client.ts` – combined entry point that wires shared HTTP configuration across Core and Caliper clients.

### Namespace Guardrails

Pass `namespace` when constructing `TimebackClient`/`CoreClient` to have the SDK automatically:

- Attach `metadata.monteNamespace` to every OneRoster entity we create
- Filter list responses to records carrying that namespace
- Reject updates/deletes for data that isn’t stamped with our namespace

This keeps Monte from clobbering data that belongs to other tenants using the same TimeBack instance.

## Core API Domains (TimeBack)

| Resource Tag | Purpose & Typical Use Cases |
| --- | --- |
| **Authentication** | Session introspection (`/api/auth/me`), configuration discovery, login/logout flows backed by AWS Cognito. Used for validating Monte user sessions against TimeBack. |
| **SSO** | Handles registration and lifecycle of external sessions. Useful when federating identity providers beyond the Better Auth integration. |
| **Users** | CRUD plus OneRoster association helpers for staff/student accounts. Key when syncing Monte users with TimeBack directories. |
| **API Keys** | Manage programmatic access tokens, typically for server-to-server integrations. |
| **Audit** | Access audit logs and statistics for compliance/monitoring. |
| **OneRoster v1.2 – Rostering** | Full IMS OneRoster rostering endpoints (orgs, users, classes, enrollments, academic sessions, etc.). Ideal for importing school hierarchy and class rosters into Monte. |
| **OneRoster v1.2 – Demographics / Credentials / Gradebook / Resources / Component Resources / Course Components** | Supplemental IMS endpoints covering student demographics, issued credentials, gradebooks, resource metadata, and proprietary component extensions. Critical for richer reporting and credential workflows. |
| **Open Badges v3.0** | Issue, revoke, verify Open Badges and manage issuer profiles. Enables Monte to participate in digital credential ecosystems. |
| **CASE v1.1** | Manage competency frameworks, associations, and rubrics via IMS CASE. Useful for aligning curricula and assessments to standards. |
| **QTI v3.0** | Authoring and lifecycle endpoints for IMS QTI assessment items, tests, sections, and validation. Supports advanced assessment authoring scenarios. |
| **CLR 2.0** | Comprehensive learner record discovery and credential retrieval endpoints. |

### Core Coverage Snapshot

| Domain | Endpoints | Wrapped | Coverage | Notes |
| --- | --- | --- | --- | --- |
| Authentication | 4 | **4** | 100% | `core.auth` client (get current user, info, login, logout). |
| OneRoster v1.2 – Rostering | 53 | **27** | ≈51% | `core.oneroster` covers schools (list/get), organizations, academic sessions, courses, classes, and enrollments with namespace guards. |
| OneRoster (Demographics / Credentials / Gradebook / Resources / Components) | 65 | 0 | 0% | Generated schemas available; wrappers TBD. |
| Open Badges v3.0 (incl. Profiles) | 17 | 0 | 0% | Ready for future credential work. |
| CASE v1.1 (all tags) | 13 | 0 | 0% | Standards import planned when needed. |
| QTI v3.0 (all tags) | 38 | 0 | 0% | No wrappers yet. |
| CLR 2.0 | 7 | 0 | 0% | Available for future CLR ingestion. |
| Users | 6 | **6** | 100% | `core.users` supports list/create/get/update/delete and OneRoster association. |
| API Keys | 3 | 0 | 0% | |
| Audit | 2 | **2** | 100% | `core.audit` exposes `listLogs` and `getStats`. |
| SSO | 4 | **4** | 100% | `core.sso` handles register/check/revoke/list sessions. |
| System / Health | 1 | **1** | 100% | `core.health.check()` returns service heartbeat status. |

> ✅ Focus areas today: Authentication, namespace-aware OneRoster CRUD (orgs/schools/sessions/courses/classes/enrollments), users, SSO, audit, and health checks. Additional tags remain ready for expansion via the generated schemas.

## Caliper API Domains

| Resource Tag | Purpose & Typical Use Cases |
| --- | --- |
| **System** | Health check endpoint to monitor Caliper ingestion availability. |
| **Caliper Events** | Validate or ingest Caliper v1.2 event envelopes. |
| **Analytics** | Query stored Caliper events (filter/paginate) or fetch individual events. |
| **Webhooks** | CRUD for outbound webhooks that forward Caliper events to external systems. |

### Caliper Coverage Snapshot

| Domain | Endpoints | Wrapped | Coverage | Notes |
| --- | --- | --- | --- | --- |
| Caliper Events | 2 | **2** | 100% | `caliper.validateEnvelope`, `caliper.sendEnvelope`. |
| Analytics | 2 | **2** | 100% | `caliper.queryEvents`, `caliper.getEvent`. |
| Webhooks | 5 | **5** | 100% | Full CRUD wrappers. |
| System | 1 | **1** | 100% | `caliper.getHealth` returns ingestion status. |

### Generated Resources

Running the generator creates per-tag files under `src/generated/core.ts/` (Authentication, SSO, Users, API_Keys, Audit, Open_Badges_v3_0, OneRoster_v1_2, CASE_v1_1, QTI_v3_0, CLR_2_0, etc.) and `src/generated/caliper.ts/` (System, Caliper_Events, Analytics, Webhooks). Each module exports:

- `endpoints`: array of Zodios metadata describing HTTP method, path, parameters, and response schema
- `schemas`: Zod validators for request bodies (where applicable)
- helper `createApiClient`/`getEndpoint` factories (unused directly but useful if adopting Zodios clients later)

The wrappers in `src/core` and `src/caliper` import these generated artifacts, infer TypeScript return types with `z.infer`, and run Zod validation on outgoing payloads.

## Regenerating from OpenAPI

The generated bindings live in `src/generated`, and the source OpenAPI snapshots are stored locally in `specs/CoreAPI.yaml` and `specs/CaliperAPI.yaml`. The `update` script downloads the latest definitions from the live TimeBack instances and re-runs code generation so the SDK stays in sync.

### Quick Refresh

Download the latest upstream specs and regenerate everything:

```bash
bun --filter @monte/timeback-sdk update
```

### Regenerate from Local Specs

If you have already updated the files and just want to rebuild the client:

```bash
bun --filter @monte/timeback-sdk generate
```

This uses a custom `openapi-zod-client` template to emit Zod schemas and endpoint metadata that power the typed wrappers. Because Zod schemas feed both type inference and runtime validation, any upstream change (new field, enum tweak, removed endpoint) either produces updated code or causes typecheck failures—alerting us before the change hits production.

### Keeping the SDK Fresh Automatically (Option 3)

To ensure deployments always reflect the latest API contract:

1. Add `bun --filter @monte/timeback-sdk update` (or the separate `generate` command if you prefer checked-in specs) to your CI/CD pipeline, e.g., in the Turborepo `build` task or a dedicated `predeploy` step.
2. Commit regenerated files or treat them as build artifacts (if you prefer not to commit, run the generator as part of your packaging workflow instead).
3. Pair the generation step with `bun --filter @monte/timeback-sdk typecheck` to fail builds if the OpenAPI contract introduces breaking changes that aren’t yet handled by our wrappers.

Because `openapi-zod-client` reads the entire spec, new endpoints are always emitted under the appropriate tag file. Even if we haven’t hand-authored wrappers yet, the generated Zod schemas make it straightforward to add coverage by importing the relevant endpoint module.

## Next Steps

- Expand Core coverage with additional OneRoster, Open Badges, CASE, and QTI endpoints
- Add high-level helpers for token lifecycle management and session refresh flows
- Automate broader request typing (query/path helpers) across the remaining endpoints
- Wire the generator + typecheck into CI so the SDK refreshes automatically before deploy
