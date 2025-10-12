# Monte Refactor Initiative

## Goals
- Decouple authored curriculum metadata from interactive lesson runtimes so feature teams can ship independently.
- Eliminate duplicated normalization logic and ad-hoc persistence layers that threaten schema drift.
- Restructure the frontend lesson experience into composable modules with clear view-model boundaries.
- Provide stable, testable packages for procedure-heavy assets (digital manipulatives, question generation, lesson flows).

---

## Current Pain Points
- **Lesson route monolith**: `apps/frontend/src/routes/lesson.tsx` mixes fetching, state machines, analytics, UI, and bespoke math parsing in a 1 000+ line component, blocking incremental changes.
- **Auth provider sprawl**: `AuthProvider` handles session bootstrap, organization management, and networking boilerplate. Duplication appears in `domains/auth/organizationClient.ts`, making role/organization changes fragile.
- **Schema drift risk**: Timeline and manifest normalization exist in four places (backend, frontend, API, curriculum-service). Inventory normalization helpers are similarly duplicated.
- **Global singleton client**: `@monte/api` exposes a mutable global `curriculumClient`; auth tokens leak between requests/tests.
- **Untyped local persistence**: Progress, cached lesson documents, and analytics rely on raw `localStorage` writes without versioning or schema guards.
- **Content responsibilities intertwined**: Curriculum metadata, interactive lesson authoring (XState flows), and manipulative logic all live together, making it difficult to split work between engineering and content ops.

---

## Proposed Architecture Adjustments

### 1. Auth & Data Hygiene (Must Complete Before Any Other Work)
- Run a full schema audit of the Convex deployment and delete any app-managed auth/org/billing tables (`organizations`, `orgMemberships`, `orgInvites`, `billingAccounts`, `impersonationSessions`, `userProfiles`, etc.). The only tables left after this pass should be:
  - Better Auth tables created by the installed plugins (admin, organization, Stripe once added).
  - Runtime curriculum tables (`units`, `topics`, `lessons`) which we will also wipe and reseed later.
- Enable the Better Auth Stripe plugin (see `.docs/better-auth/stripe.md`) so all billing/subscription data lives in Better Auth—no duplicate app tables.
- Reconfigure the Better Auth organization plugin so only owners/admins can invite, and plan metadata differentiates school vs household orgs. Keep the app namespace completely clean; all auth/org/billing data must flow through Better Auth.
- Document the exact table list (Better Auth and runtime) after cleanup and confirm there are no stray collections before moving forward.

### 2. Content Package Realignment
- Keep `@monte/curriculum-service` focused on canonical metadata (domains, units, topics, lesson manifest summaries, taxonomy, domain graphs). Convex only carries a synchronized runtime snapshot, never the source files.
- Introduce `@monte/lesson-service`:
  - Source of truth for authored lesson content (presentation scripts, guided steps, practice banks, narration assets, procedural configs).
  - Ships runtime-friendly bundles: parsed `LessonDocument`s, segment machines, metadata used by the editor/runtime.
  - Provides importable helpers for Solid runtime, editor tooling, and future automated tests.
- Keep procedural manipulative definitions co-located within `lesson-service`:
  - Expose canonical manipulative schemas, generators, and rendering primitives alongside lesson flows.
  - Reuse the same primitives across runtime rendering, editor tooling, and inventory orchestration.
  - Hook into `question-service` where manipulative state influences generated questions.

### 3. Shared Normalization & Validation
- Move all timeline/inventory normalization utilities into `@monte/curriculum-service` (e.g., `normalizeLessonDocumentTimelines`, `assertInventoryConsistency`).
- Refactor backend (`apps/backend/convex/modules/curriculum`), API (`packages/api`), and frontend (`apps/frontend/src/domains/curriculum`) to import these helpers instead of redefining them.
- Create a shared `@monte/content-validators` module (within `curriculum-service` or `lesson-service`) for manifest comparison, ensuring the CLI scripts reuse the same logic.
- Once shared helpers land, wipe the existing `units`, `topics`, `lessons` tables in the dev deployments, then reseed via the new pipeline so Convex contains only lesson documents produced by the packages.

### 3. API Client Isolation
- Replace the global `curriculumClient` singleton with:
  - `createCurriculumClient({ convexUrl })` factory (already exists) exposed as the primary entrypoint.
  - Dependency-injected client within frontend providers (`AuthProvider`, editor view models).
  - Optional shared singleton for browser-only contexts to preserve existing ergonomics.
- Update `setCurriculumAuthToken` and related functions to operate on scoped client instances, preventing token leakage across SSR/tests.

### 4. Frontend Refactor Plan
- Extract a `useLessonPlayer` hook handling:
  - Resource fetching (units, lessons) via injected `CurriculumClient`.
  - Scenario resolution and manipulative orchestration (delegating to `lesson-service`).
  - Progress syncing with `ProgressProvider`.
- Split `lesson.tsx` into focused components:
  - View shell (`LessonPage`).
  - Segment renderers (`PresentationView`, `GuidedView`, `PracticeView`).
  - Sidebar/panel components (captions, paper notes, scenario inspector).
  - Delegate analytics logging to a dedicated hook.
- Refactor `AuthProvider` into smaller composables:
  - `useAuthSession()` for Better Auth session lifecycle.
  - `useOrganizationDirectory()` for organization/member management.
  - Shared fetch wrapper leveraging `@monte/api` parsing helpers.

### 5. Persistence Hardening
- Introduce versioned storage helpers (`createStorageChannel({ key, schema, version })`) inside a new `@monte/app-storage` utility.
- Migrate progress state, cached lessons, and analytics logs to use schema-validated reads with opt-in migration hooks.
- Add fallback behavior + telemetry for corrupt/local-only data resets.

### 6. Testing & Tooling
- Provide schema-compliant fixtures via `@monte/lesson-service/testing` (e.g., `createLessonDocumentFixture`).
- Replace `as unknown as LessonDocument` in tests with generated fixtures.
- Add integration tests for curriculum mutations using Convex test harness + new shared normalization helpers.
- Expand CLI scripts in `scripts/` to validate new package outputs (lesson bundles, manipulative definitions).

---

## Execution Roadmap

### Phase 0 — Foundations (Pre-work)
1. Extract normalization helpers into `@monte/curriculum-service`.
2. Update backend/frontend/API to consume the shared helpers.
3. Introduce versioned storage utility and migrate progress + lesson caches.

### Phase 1 — Package Extraction
1. Scaffold `packages/lesson-service` with initial exports (lesson schema adapters, manipulative engine modules, asset loaders, `LessonDocument` builders).
2. Move presentation/guided/practice authoring assets, manipulative definitions, and XState sequences from `apps/frontend` to `lesson-service`.
3. Add build/validation scripts ensuring the package emits ESM/CJS bundles with typed exports.
4. Publish Solid-friendly helper entry points (e.g., `@monte/lesson-service/solid`) that the frontend editor/runtime can consume without additional wiring.

### Phase 2 — API Client & Auth Cleanup
1. Refactor `@monte/api` to encourage factory-based client usage; retain deprecated singleton temporarily with warnings.
2. Rewrite `AuthProvider` to inject scoped curriculum clients and split organization logic into composable hooks.
3. Update editor + lesson routes to depend on injected clients.
4. Configure Better Auth to use the Stripe subscription plugin (`.docs/better-auth/stripe.md`), ensuring billing/customer/org data lives entirely in the Better Auth tables so no duplicate Convex collections are maintained by hand.

### Phase 3 — Frontend Lesson Breakdown
1. Implement `useLessonPlayer` hook and migrate current route logic.
2. Move scenario generation, caption handling, and manipulative orchestration into dedicated modules within `lesson-service`.
3. Replace in-route components with imported UI modules (ensuring design system consistency).
4. Add unit + integration tests covering the new modularized flow.

### Phase 4 — Content Team Enablement
1. Implement editor CRUD flows for domains, units, topics, and lesson metadata backed by `@monte/api` mutations (create, reorder, archive).
2. Document authoring workflow for `lesson-service` (how to add/edit sequences, manipulative scripts, narration assets).
3. Provide CLI utilities for lesson validation (`pnpm --filter @monte/lesson-service validate`).
4. Integrate with `question-service` to ensure practice questions align with generated manipulative states.

### Phase 5 — Follow-up Enhancements
1. Build curriculum/lesson sync pipeline so manifest updates automatically refresh lesson bundles.
2. Implement telemetry ingestion (lesson + question outcomes) via `engine-service`.
3. Establish Playwright/Vitest coverage for cross-package integrations.

---

## Open Decisions & Notes
- **Package naming**: `lesson-service` vs. `lesson-engine`—align with roadmap before scaffolding.
- **Manipulative rendering**: Determine which Solid components stay in `apps/frontend` vs. what core primitives remain in `lesson-service` to avoid tight coupling.

---

## Integration Blueprint

### Package Responsibilities
- `@monte/types`: Continues as schema source of truth; gains lesson/manipulative-specific refinements needed by `lesson-service`.
- `@monte/lesson-service`:
  - Owns `LessonDocument` generation, procedural manipulative configs, XState machine builders, narration asset discovery, and validation utilities.
  - Exposes editor-friendly APIs (e.g., `listLessonTemplates`, `generateGoldenBeadsLayout(seed)`).
  - Provides build artifacts the runtime/editor import directly.
- `@monte/curriculum-service`: Focused on curriculum manifest (domains, units, topics, skills) and exports manifest ingestion helpers to Convex scripts.
- `@monte/api`: Supplies typed clients created via factories; it is the sole gateway for live Convex reads/mutations. Apps and scripts should never call Convex directly—everything flows through these helpers.
- `@monte/frontend`:
  - Lesson runtime consumes `lesson-service` helpers for rendering/manipulative orchestration.
  - Editor shells (forms, list views) call into `@monte/api` for CRUD and leverage `lesson-service` for authoring previews, validation, and asset scaffolding.
- `@monte/backend`:
  - Convex mutations stay slim; they parse payloads with schemas from `lesson-service`/`types` and persist documents.
  - Manifest sync scripts import normalization from `curriculum-service` and `lesson-service` to keep data coherent.

### Editor Workflow After Refactor
1. Editor loads curriculum tree via `@monte/api` and renders units/topics/lessons using shared components.
2. When author selects a lesson, the editor retrieves its `LessonDocument` through Convex and hydrates the local store.
3. Authoring tools (timeline editor, manipulative inventory designer, presentation script builder) rely on `lesson-service` utilities to:
   - Generate default segments.
   - Preview manipulative layouts (e.g., golden beads, stamp game) using shared procedural definitions.
   - Validate lesson completeness before saving.
4. Saving a lesson:
   - Editor serializes via `lesson-service` normalization helpers.
   - Payload is sent through `@monte/api` mutation to Convex, which validates against the same helpers and stores the result.
5. Preview/runtime reuse identical helpers, ensuring authored content renders exactly as previewed.

### Backend Alignment
- Convex schema continues storing normalized `LessonDocument` plus metadata; manipulative state stays embedded within lesson segments to keep a single source.
- Manifest sync writes curriculum primitives; lesson authoring mutations manage live lesson docs.
- Question service references `lesson-service` when generating manipulative-dependent practice questions to ensure consistent seeds/layouts.

---

## Target Outcomes
- Curriculum team can CRUD domains/units/topics via editor UI backed by Convex mutations—no manual JSON edits.
- Lesson authors can load, edit, and publish rich lessons (including procedural manipulative steps) entirely in the editor.
- Golden bead (and other manipulative) logic is shared across at least 20+ lessons without duplication.
- Runtime and editor exhibit parity by consuming the same `lesson-service` outputs.
- By refactor completion, a static multiplication lesson with golden beads can be authored, previewed, and delivered end-to-end without touching code.
- Convex holds only lesson documents and runtime metadata derived from the package sources; stale seeded rows have been purged and rebuilt through the new sync pipeline.
- **Distribution**: Decide if lesson bundles ship as static JSON (importable) or convex-backed documents; the package should support both.
- **Migration plan**: Introduce deprecation warnings for legacy imports (`domains/curriculum/utils`) before removal to avoid breaking downstream work.

Document owners: Platform team. Update as phases progress.
