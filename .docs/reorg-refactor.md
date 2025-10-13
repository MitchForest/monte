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
- [ ] `apps/frontend/` has a recorded target layout: `app/`, `features/`, `shared/`.
- [ ] Decisions about naming (“features/” vs “domains/”) captured in this doc and `apps/frontend/README.md`.
- [ ] Inventory of files slated for deletion collected (tests, smoke suites, legacy docs).

Checklist:
- [ ] Update `apps/frontend/README.md` with the new high-level directory map and conventions.
- [ ] Enumerate all test directories (`__tests__`, `*.test.tsx?`) and note them for removal.
- [ ] Map existing docs under `.docs/` that are no longer needed (everything except `apps/frontend/README.md` and this plan).
- [ ] Confirm no new folders are required beyond the agreed layout.

---

## Milestone 1 — Establish Shared & App Layers

Definition of done:
- [ ] Create `apps/frontend/app/` and move shell files (`App.tsx`, `router.tsx`, `main.tsx`, global CSS).
- [ ] Create `apps/frontend/shared/ui/` and move design system components currently under `components/ui`.
- [ ] Create `apps/frontend/shared/lib/` for cross-feature utilities (`lib/cn.ts`, `lib/auth-client.ts`).
- [ ] Provide a single barrel export per shared folder (`shared/ui/index.ts`, `shared/lib/index.ts`).
- [ ] Provide `shared/types/` for cross-feature TypeScript declarations (move anything under `types/` that is still required).
- [ ] Remove the old `components/`, `lib/`, and `types/` directories (after migrating all consumers).

Checklist:
- [ ] Update imports to reference `shared/ui` + `shared/lib`.
- [ ] Keep non-UI shared helpers alongside `shared/lib`.
- [ ] Consolidate ambient/global declarations under `shared/types` (declare modules for assets, etc.).
- [ ] Confirm tree shaking still works (Vite dev build).
- [ ] Delete `components/CurriculumAccessNotice.tsx` after moving it into an appropriate feature (handled in Milestone 3, but flag dependency).

---

## Milestone 2 — Extract Auth Feature

Definition of done:
- [ ] Create `apps/frontend/features/auth/` with sub-folders `pages/`, `components/`, `state/`, `api/`, `utils/`, and optional `types/` as needed.
- [ ] Move `providers/AuthProvider.tsx`, `domains/auth/**` into the new feature layout.
- [ ] Expose a single entry point `features/auth/index.ts` exporting `AuthProvider`, hooks, `RoleGuard`, and route-level helpers.
- [ ] Remove `providers/` directory (all consumers updated).
- [ ] Delete auth-related tests (`providers/__tests__`, any `domains/auth` specs).

Checklist:
- [ ] Consolidate auth client wrappers under `features/auth/api/`.
- [ ] Ensure `useAuth` remains the only consumer-facing hook (re-exported via the feature barrel).
- [ ] Update route components (`routes/auth/**`) to import from `features/auth/view/...`.
- [ ] Run lint/typecheck and verify no unused exports remain.

---

## Milestone 3 — Build Lesson Player Feature

Definition of done:
- [ ] Create `apps/frontend/features/lesson-player/` with `pages/`, `components/`, `state/`, `api/`, `utils/`, and optional `types/`.
- [ ] Move everything supporting lesson viewing (progress store, lesson loader state, canvas, analytics recorder, materials preview) into the new feature.
- [ ] Provide `features/lesson-player/index.ts` exporting public entry points (`LessonPage`, `UnitPage`, `HomePage`, providers, hooks).
- [ ] Delete `domains/curriculum/state/**` (lesson + progress), `domains/curriculum/canvas/**`, `domains/curriculum/components/**`, and related utils once migrated.

Checklist:
- [ ] Collapse duplicate `LessonCanvas` implementations into a single component under `features/lesson-player/components/`.
- [ ] Co-locate the `ProgressProvider` and `useProgress` under `features/lesson-player/state/`.
- [ ] House materials palette under `features/lesson-player/components/materials/` and expose through the feature barrel.
- [ ] Ensure any `CurriculumAccessNotice`-style messaging becomes `features/lesson-player/components/AccessNotice` (or similar).
- [ ] Update `app` routing to import `HomePage`, `UnitPage`, `LessonPage` from the feature barrel.

---

## Milestone 4 — Build Editor Feature

Definition of done:
- [ ] Create `apps/frontend/features/editor/` with `pages/`, `components/`, `state/`, `api/`, `utils/`, `types/` (as needed).
- [ ] Move `domains/curriculum/editor/**`, `domains/curriculum/inventory/**`, `domains/curriculum/timeline/**`, and `routes/editor/**` assets into the feature structure.
- [ ] Expose `EditorPage` (and any supporting modals) via `features/editor/index.ts`.
- [ ] Delete old `routes/editor/**` and `domains/curriculum/editor/**` folders after migration.
- [ ] Remove associated editor tests (`routes/editor/components/__tests__`, `domains/curriculum/inventory/__tests__`, timeline tests).

Checklist:
- [ ] Place view-model logic (`useEditorViewModel`) under `features/editor/state/` or `features/editor/utils/`.
- [ ] Keep inventory/timeline stores contiguous with the editor feature (no cross-folder imports).
- [ ] Ensure materials shared between editor and lesson player move into `shared/` or are duplicated only intentionally.
- [ ] Validate the editor barrel exposes just what the router needs (`EditorPage`, maybe `EditorGuard`).

---

## Milestone 5 — Router Restructure

Definition of done:
- [ ] Delete the top-level `routes/` directory entirely.
- [ ] Each route in `app/router.tsx` imports page components from feature barrels (`features/auth/pages`, `features/lesson-player/pages`, `features/editor/pages`).
- [ ] Page files inside features handle their own loaders/component wiring; router entries are shallow lazy imports.
- [ ] Any navigation helpers (guards, back-button logic) live within the relevant feature.

Checklist:
- [ ] Ensure lazy imports still work (update `app/router.tsx` accordingly).
- [ ] Confirm there is no residual route-only utility file hanging around.
- [ ] Keep `App` shell pure: layout + provider composition only.

---

## Milestone 6 — Purge Legacy Tests, Docs, and Smoke Suites

Definition of done:
- [ ] Delete every test file under `apps/frontend/src` (`__tests__`, `*.test.tsx?`).
- [ ] Remove smoke/e2e scaffolding if present (search for `smoke`, `playwright`, `cypress`, etc.; delete whole folders).
- [ ] Clear `.docs/` directory except `apps/frontend/README.md` and this `reorg-refactor.md`.
- [ ] Verify package scripts referencing removed assets are updated or deleted.
- [ ] Collect before/after directory snapshot to confirm no stragglers.

Checklist:
- [ ] Remove `domains/curriculum/state/__tests__`, `domains/curriculum/canvas/__tests__`, `domains/curriculum/inventory/__tests__`, `routes/editor/components/__tests__`, `providers/__tests__`.
- [ ] Delete `.docs/better-auth`, `.docs/map`, `.docs/math-academy-plan.md`, `.docs/editor-plan.md`, `.docs/reference`, etc.
- [ ] Update `package.json` scripts and CI configs that referenced removed tests or docs.
- [ ] Run `pnpm lint && pnpm typecheck` as final confirmation after cleanup.

---

## Final Verification

- [ ] Directory tree matches the target architecture exactly.
- [ ] No unused files remain (`git status` shows only intentional changes).
- [ ] All imports resolve to `app/`, `shared/`, or `features/*` paths.
- [ ] `pnpm build`, `pnpm lint`, `pnpm typecheck` succeed without warnings.
- [ ] Document remaining follow-ups (if any) directly in this file; do not open side documents.
