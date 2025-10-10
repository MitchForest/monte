# Monte Platform Refactor Plan

_Last updated: 2025-03-21_

This plan consolidates the open work required to finish the refactor, harden runtime stability, and reach full type safety across the Monte lesson platform.

---

## Core Objectives
- Make `LessonMaterialInventory` the authoritative source for all manipulative supply, with runtime state machines that stay in sync across presentation, guided, and practice segments.
- Modularise the editor so inventory updates, segment authoring, and lesson persistence flow through typed APIs that support undo/redo and future collaboration work.
- Enforce schema contracts end-to-end using shared Zod validators, Convex mutations, and generated clients so no unchecked casts remain in the frontend or backend.
- Deliver a resilient lesson runtime (canvas, drag/drop, analytics) that can be demoed end-to-end with inventories, narration, and resets working together.

---

## Track 0 — UI Foundations & Conventions
- ✅ Components use the Tailwind + `cva` + Kobalte pattern across the design system.
- ✅ Contributor quick reference is available in `.docs/reference/ui-conventions.md`.

## Track 1 — Inventory & Manipulative Runtime
- Audit presentation/practice flows so every manipulative action emits inventory deltas through the provider.

## Track 2 — Editor Modularisation & Persistence
- Extract the remaining document/draft logic into a dedicated store, keeping `useEditorViewModel` as a thin composer.
- Add dirty/success cues, improved per-token ergonomics, and validation hints for inventory/segment alignment once the stores are split.

## Track 3 — Schema, Type Safety, & Zod Validation
- Wire `pnpm check:codegen` into CI and continue expanding shared validators as schemas evolve.
- Remove remaining `any` casts in Convex modules (e.g., `withIndex` query builders).

## Track 4 — Runtime Experience & Canvas
- Complete the LessonCanvas migration across guided/presentation/practice segments (replacing legacy layout math).
- Implement viewport controls (pan/zoom/reset) and record viewport analytics.
- Regenerate scenarios on retakes while respecting inventory counts.
- Harden narration fallbacks with signed audio/caption assets and graceful degradation.

## Track 5 — Auth & Access Control
- Gate frontend Convex interactions behind explicit auth-ready checks; surface offline/auth-failed UI states instead of console warnings.
- Add automated tests around auth flows to ensure unauthorised users cannot access editor/inventory endpoints.

## Track 6 — Tooling, Testing, & DevOps
- Integrate lint/type/build/codegen checks into CI and document schema-change expectations.
- Expand automated coverage (Vitest for inventory/progress/editor hooks, Playwright smoke for `/editor`).
- Refresh seeding scripts so generated lessons include inventory metadata and round-trip cleanly through the editor.

---

## Immediate Next Steps
1. Publish the UI conventions memo (Tailwind + `cva` + Kobalte, folder/naming rules) and remove dev-only imports from the shipping bundle.
2. Break apart `useEditorViewModel` into composable stores before layering new editor affordances (toasts, validation polish).
3. Harden learner surfaces by wrapping `buildLessonTasks` and related calls with defensive guards so incomplete lessons don’t crash the home dashboard.
4. Integrate `pnpm check:codegen` into CI, remove `any` casts from Convex query builders, and extend schema guardrails as new contracts land.
