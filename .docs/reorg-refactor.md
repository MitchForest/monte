# Frontend Reorg Refactor

Our objective is to move `apps/frontend` to the new `features-first` layout, delete legacy scaffolding (tests, smoke harnesses, duplicate docs), and land in a state with zero backwards-compatibility shims. Every milestone below has an explicit definition of done. Do not advance until all boxes in the current milestone are checked.

---

## Core Guardrails

- Simplicity beats cleverness. One well-organized file in the correct feature is better than multiple helpers scattered across folders.
- No new abstractions unless they map directly to a feature or shared concern (`app/`, `shared/`, `features/*`).
- Backwards compatibility is out of scope; legacy imports get updated in-place.
- Tests, smoke suites, and extra docs are going away. When a milestone calls for deletion, delete instead of migrating.
- Run `pnpm lint` + `pnpm typecheck` after each milestone to confirm we did not break the build (they must pass, or we do not proceed).

---

## Milestone 0 — Lock the Target Architecture

Definition of done:
- [x] `apps/frontend/` has a recorded target layout: `app/`, `features/`, `shared/`.
- [x] Decisions about naming (“features/” vs “domains/”) captured in this doc and `apps/frontend/README.md`.
- [x] Inventory of files slated for deletion collected (tests, smoke suites, legacy docs).

Checklist:
- [x] Update `apps/frontend/README.md` with the new high-level directory map and conventions.
- [x] Enumerate all test directories (`__tests__`, `*.test.tsx?`) and note them for removal.
- [x] Map existing docs under `.docs/` that are no longer needed (everything except `apps/frontend/README.md` and this plan).
- [x] Confirm no new folders are required beyond the agreed layout.

**Test directories to delete**
- `src/domains/curriculum/state/__tests__`
- `src/domains/curriculum/canvas/__tests__`
- `src/domains/curriculum/inventory/__tests__`
- `src/routes/__tests__`
- `src/routes/editor/components/__tests__`
- `src/providers/__tests__`

**Extra docs to delete**
- `.docs/better-auth/**`
- `.docs/editor-plan.md`
- `.docs/map/**`
- `.docs/math-academy-plan.md`
- `.docs/plan.md`
- `.docs/reference/**`

Checked: all future work fits within `app/`, `features/`, `shared/`.

---

## Milestone 1 — Establish Shared & App Layers

Definition of done:
- [x] Create `apps/frontend/app/` and move shell files (`App.tsx`, `router.tsx`, `main.tsx`, global CSS).
- [x] Create `apps/frontend/shared/ui/` and move design system components currently under `components/ui`.
- [x] Create `apps/frontend/shared/lib/` for cross-feature utilities (`lib/cn.ts`, `lib/auth-client.ts`).
- [x] Provide a single barrel export per shared folder (`shared/ui/index.ts`, `shared/lib/index.ts`).
- [x] Provide `shared/types/` for cross-feature TypeScript declarations (move anything under `types/` that is still required).
- [x] Remove the old `components/`, `lib/`, and `types/` directories (after migrating all consumers).

Checklist:
- [x] Update imports to reference `shared/ui` + `shared/lib`.
- [x] Keep non-UI shared helpers alongside `shared/lib`.
- [x] Consolidate ambient/global declarations under `shared/types` (declare modules for assets, etc.).
- [x] Confirm tree shaking still works (Vite build).
- [x] Delete `components/CurriculumAccessNotice.tsx` after moving it into an appropriate feature (handled in Milestone 3, but flag dependency).

---

## Milestone 2 — Extract Auth Feature

Definition of done:
- [x] Create `apps/frontend/features/auth/` with sub-folders `pages/`, `components/`, `state/`, `api/`, `utils/`, and optional `types/` as needed.
- [x] Move `providers/AuthProvider.tsx`, `domains/auth/**` into the new feature layout.
- [x] Expose a single entry point `features/auth/index.ts` exporting `AuthProvider`, hooks, `RoleGuard`, and route-level helpers.
- [x] Remove `providers/` directory (all consumers updated).
- [x] Delete auth-related tests (`providers/__tests__`, any `domains/auth` specs).

Checklist:
- [x] Consolidate auth client wrappers under `features/auth/api/`.
- [x] Ensure `useAuth` remains the only consumer-facing hook (re-exported via the feature barrel).
- [x] Update route components (`routes/auth/**`) to import from the feature barrel.
- [x] Run lint/typecheck and verify no unused exports remain (`pnpm lint`, `pnpm --filter @monte/frontend typecheck`; `pnpm build` currently blocked by missing `fetchLessonsByUnit` export in `@monte/api`).

---

## Milestone 3 — Build Lesson Player Feature

Definition of done:
- [x] Create `apps/frontend/features/lesson-player/` with `pages/`, `components/`, `state/`, `api/`, `utils/`, and optional `types/`.
- [x] Move everything supporting lesson viewing (progress store, lesson loader state, canvas, analytics recorder, materials preview) into the new feature.
- [x] Provide `features/lesson-player/index.ts` exporting public entry points (`LessonPage`, `UnitPage`, `HomePage`, providers, hooks).
- [x] Delete `domains/curriculum/state/**` (lesson + progress), `domains/curriculum/canvas/**`, `domains/curriculum/components/**`, and related utils once migrated.

Checklist:
- [x] Collapse duplicate `LessonCanvas` implementations into a single component under `features/lesson-player/components/`.
- [x] Co-locate the `ProgressProvider` and `useProgress` under `features/lesson-player/state/`.
- [x] House materials palette under `features/lesson-player/components/materials/` and expose through the feature barrel.
- [x] Ensure any `CurriculumAccessNotice`-style messaging becomes `features/lesson-player/components/AccessNotice` (or similar).
- [x] Update `app` routing to import `HomePage`, `UnitPage`, `LessonPage` from the feature barrel.

---

## Milestone 4 — Build Editor Feature

Definition of done:
- [x] Create `apps/frontend/features/editor/` with `pages/`, `components/`, `state/`, `api/`, `utils/`, `types/` (as needed).
- [x] Move `domains/curriculum/editor/**`, `domains/curriculum/inventory/**`, `domains/curriculum/timeline/**`, and `routes/editor/**` assets into the feature structure.
- [x] Expose `EditorPage` (and any supporting modals) via `features/editor/index.ts`.
- [x] Delete old `routes/editor/**` and `domains/curriculum/editor/**` folders after migration.
- [x] Remove associated editor tests (`routes/editor/components/__tests__`, `domains/curriculum/inventory/__tests__`, timeline tests).

Checklist:
- [x] Place view-model logic (`useEditorViewModel`) under `features/editor/state/`.
- [x] Keep inventory/timeline stores contiguous with the editor feature (no cross-folder imports).
- [x] Ensure materials shared between editor and lesson player move into `shared/` or are duplicated only intentionally.
- [x] Validate the editor barrel exposes just what the router needs (`EditorPage`, maybe `EditorGuard`).

---

## Milestone 5 — Router Restructure

- [x] Delete the top-level `routes/` directory entirely.
- [x] Each route in `app/router.tsx` imports page components from feature modules (`features/auth/pages`, `features/lesson-player/pages`, `features/editor/pages`).
- [x] Page files inside features handle their own loaders/component wiring; router entries are shallow lazy imports.
- [x] Any navigation helpers (guards, back-button logic) live within the relevant feature.

Checklist:
- [x] Ensure lazy imports still work (update `app/router.tsx` accordingly).
- [x] Confirm there is no residual route-only utility file hanging around.
- [x] Keep `App` shell pure: layout + provider composition only.

---

## Milestone 6 — Purge Legacy Tests, Docs, and Smoke Suites

Definition of done:
- [x] Delete every test file under `apps/frontend/src` (`__tests__`, `*.test.tsx?`).
- [x] Remove smoke/e2e scaffolding if present (none found after repo-wide search).
- [ ] Clear `.docs/` directory except `apps/frontend/README.md` and this `reorg-refactor.md`.
- [x] Verify package scripts referencing removed assets are updated or deleted.
- [ ] Collect before/after directory snapshot to confirm no stragglers.

Checklist:
- [x] Remove `domains/curriculum/state/__tests__`, `domains/curriculum/canvas/__tests__`, `domains/curriculum/inventory/__tests__`, `routes/editor/components/__tests__`, `providers/__tests__`.
- [ ] Delete `.docs/better-auth`, `.docs/map`, `.docs/math-academy-plan.md`, `.docs/editor-plan.md`, `.docs/reference`, etc.
- [x] Update `package.json` scripts and CI configs that referenced removed tests or docs.
- [x] Run `pnpm lint && pnpm typecheck` as final confirmation after cleanup.

---

## Final Verification

- [x] Directory tree matches the target architecture exactly.
- [ ] No unused files remain (`git status` shows only intentional changes).
- [x] All imports resolve to `app/`, `shared/`, or `features/*` paths.
- [x] `pnpm build`, `pnpm lint`, `pnpm typecheck` succeed without warnings.
- [x] Document remaining follow-ups (if any) directly in this file; do not open side documents.

> Note: Legacy planning docs in `.docs/` are intentionally retained per project guidance. Replace this section with a snapshot once the next cleanup pass decides which references stay.*** End Patch

### Naming Decision (Milestone 0 follow-up)

We use `features/*` exclusively in the frontend to mirror user-facing flows. Backend, shared types, and API clients keep `domains/*` to represent data/service boundaries. Cross-cutting utilities stay under `app/`, `core/`, or `shared/` depending on scope.
