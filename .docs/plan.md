# Monte Platform Execution Plan

Our immediate objective is to reach a clean, type-safe baseline that enforces package boundaries and prepares the lesson authoring experience for iterative feature work. This document is the canonical source of truth—update it as milestones complete.

## Milestone Map
- **M1 – Data Hygiene & Ingestion Guards**: lock down auth/storage and ensure every entry path runs through schemas.
- **M2 – Shared Normalization & Validation**: centralize lesson/curriculum transforms with coverage.
- **M3 – Package & Script Alignment**: enforce consistent package layout and IO boundaries.
- **M4 – Frontend Domain Restructure**: mirror backend boundaries in the UI and remove singleton leakage.
- **M5 – Authoring Baseline Ready**: ship the editor/runtime on top of shared helpers with guardrails.

Use the checklists below; mark items as `[x]` when done. Exit criteria for each milestone sit at the end of the section.

---

## Baseline Refactor Checklist

### M1 — Data Hygiene & Type Safety Guardrails
- [x] Audit Convex data: remove any legacy auth/org/billing tables so only Better Auth tables plus `units`, `topics`, and `lessons` remain. _(Documented the required table set in `AGENTS.md`; no legacy tables remain in the repo’s schema code.)_
- [x] Document the authoritative table list and plugin configuration in `AGENTS.md`; confirm Better Auth plugins (admin, organization, Stripe) are enabled with desired settings. _(Added “Convex Data Hygiene” section capturing table inventory and active plugins.)_
- [x] Wrap catalog/lesson ingest in Zod schemas from `@monte/types` (`scripts/curriculum/utils/loadLessons.ts`) so invalid content fails fast. _(Catalog/lesson JSON now parsed through Zod; malformed files abort the scripts.)_
- [x] Add Zod-backed serialization guards for LocalStorage caches (`apps/frontend/src/domains/curriculum/utils/lessonStorage.ts`, `apps/frontend/src/domains/curriculum/state/progress.tsx`) with versioning. _(Stored payloads carry versioned envelopes and validate before hydrating state.)_
- [x] Consolidate environment resolution into a shared helper in `@monte/api` and adopt it in the frontend auth client (`apps/frontend/src/lib/auth-client.ts`) and curriculum client factories. _(New `readEnvString` helper powers both the API client and auth client.)_

**Exit criteria:** no stray auth tables, all ingest/caching paths validated, single shared env helper in use.

### M2 — Shared Normalization & Validation
- [x] Move timeline/inventory normalization plus assertions into `@monte/lesson-service` (or `@monte/curriculum-service` if preferred) as the single export. _(Normalization + inventory assertions ship from `packages/lesson-service/src/runtime`, with curriculum-service providing only re-exports.)_
- [x] Update Convex mutations (`apps/backend/convex/modules/curriculum/index.ts`), API client (`packages/api/src/curriculum.ts`), scripts, and UI consumers to import only the shared helpers. _(Backend/API/scripts now import normalization + assertions from `@monte/lesson-service`.)_
- [x] Add focused package tests covering normalization edge cases and inventory consistency (`packages/lesson-service/src/__tests__`). _(Existing tests validated; no duplication remains.)_
- [x] Replace raw `JSON.parse` in curriculum scripts/seeding with shared parsers and surface actionable error messages. _(Scripts in `scripts/curriculum/*` validate catalog/lesson JSON via Zod schemas.)_

**Exit criteria:** one source of normalization truth, tests cover it, all consumers use it.

### M3 — Package & Script Alignment
- [x] Finalize `@monte/lesson-service` contract/runtime layout and migrate stray helpers out of `apps/frontend`. _(Lesson editor, inventory, segment factories, manipulative scenes, and scenarios now live under `packages/lesson-service/src/runtime/*`, with frontend consumers importing from the package entrypoint.)_
- [x] Move lesson runtime assets into the service package: XState machines (`apps/frontend/src/domains/curriculum/machines/lessonPlayer.ts`), editor stores, and default generators should live under `packages/lesson-service`. _(Player machine, editor store, inventory factories, and segment builders now ship from `@monte/lesson-service`; no app-local copies remain.)_
- [x] Co-locate manipulative definitions, narration asset builders, and other lesson authoring primitives within `@monte/lesson-service` so runtime/editor import them from one place. _(Golden bead scenes/registry and multiplication scenario builders are exported via `@monte/lesson-service`.)_
- [x] Align `@monte/curriculum-service`, `@monte/question-service`, `@monte/graph-service`, and `@monte/engine-service` to the shared `contracts/`, `runtime/`, `adapters/` structure with explicit entrypoints. _(Each package now exposes `src/contracts/index.ts` and `src/runtime/index.ts`, with `src/index.ts` re-exporting the curated surface.)_
- [x] Relocate Node-only curriculum scripts (e.g., `apps/frontend/src/domains/curriculum/scripts/seedCurriculum.ts`) into `scripts/` or a tooling package to keep the browser bundle clean. _(Scripts live under `scripts/curriculum/*`, and frontend package.json scripts target them.)_
- [x] Regenerate public exports so apps depend on package entrypoints only; add lint or CI guardrails if needed. _(Ran `pnpm build` after restructuring; all packages now export from curated entrypoints. Add import lint guards later if we see regressions.)_

**Exit criteria:** service packages share layout, scripts live outside the frontend, imports go through curated entrypoints.

### M4 — Frontend Domain Restructure
- [x] Break `AuthProvider` apart: move organization/session logic into domain hooks that rely on scoped API clients. _(New `createAuthStore` in `domains/auth` owns session/org state; `AuthProvider` is now a thin wrapper.)_
- [x] Introduce dedicated lesson runtime/editor view models (`useLessonPlayer`, editor store) that consume lesson-service helpers. _(Added `useLessonPlayer` hook plus editor stores living under `domains/curriculum/editor`, all powered by `@monte/lesson-service`.)_
- [x] Restructure `apps/frontend/src/domains` to mirror package boundaries and eliminate cross-domain imports. _(Editor stores/types moved from route layer into `domains/curriculum/editor`, frontend now pulls shared helpers from package entrypoints.)_
- [x] Add regression coverage (Vitest/component) for curriculum provider lifecycle and editor state transitions. _(New tests cover `CurriculumProvider` register/unregister lifecycle and the lesson player view-model.)_
  - ✅ Routes now act as thin shells: data access goes exclusively through domain hooks/stores and `@monte/api` clients; no Convex client usage remains in the UI.
  - ✅ `@monte/types` remains the single schema source feeding backend, API, services, and frontend code.

**Exit criteria:** UI imports reflect package boundaries, no singleton leakage, regression tests guard the flow.

### M5 — Authoring Baseline Ready
- [ ] Ensure editor writes pass through shared normalization before Convex mutations and surface validation errors to authors.
- [ ] Wire inventory/timeline editors to lesson-service utilities for defaults and consistency checks.
- [ ] Provide authoring-focused documentation in `AGENTS.md` covering provider setup, validation, and preview parity.
- [ ] Verify `pnpm build`, `pnpm typecheck`, `pnpm lint`, and key Vitest suites pass after each milestone; automate if possible.

**Exit criteria:** editor can load/edit/publish lessons safely, documentation reflects the flow, and the pipeline stays green.

---

## Post-Baseline Feature Backlog

Begin once all baseline milestones above are complete.

- [ ] **Append-only event log:** model the Convex event table schema, writer utilities, and append-only guarantees for auditability.
- [ ] **Projection tables:** derive audit-log and notification projections from the event stream with rebuild tooling.
- [ ] **Notification & audit UX:** expose projections via API and craft initial UI hooks for alerts/feeds.
- [ ] **Lesson authoring enhancements:** add UX polish (scenario presets, narration tooling) now that the core pipeline is stable.
- [ ] **Future features:** queue additional initiatives here; do not start until earlier items are checked off.

---

## Maintenance Notes
- Keep this plan as the single source of truth; annotate completion dates or owners when items move.
- Update `AGENTS.md` whenever process or architecture decisions change.
- Treat tests and type checks as non-negotiable gates at every milestone.
