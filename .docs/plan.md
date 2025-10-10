# Monte Platform Refactor Plan

_Last updated: 2025-04-02_

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
- ✅ Inventory snapshot sanity checks run before save/publish so authored supply and runtime deltas stay in sync.
- Extend inventory enforcement to every segment type (guided + presentation still assume infinite supply today).
- Keep runtime reporting simple: emit consume/replenish/reset events only, enough for content and product to trace manipulative usage.

## Track 2 — Editor Modularisation & Persistence
- ✅ Extract the remaining document/draft logic into a dedicated store, keeping `useEditorViewModel` as a thin composer.
- ✅ Add dirty/success cues, improved per-token ergonomics, and validation hints for inventory/segment alignment once the stores are split.

## Track 3 — Schema, Type Safety, & Zod Validation
- ✅ Entity metadata now shares a typed shape across Convex + frontend.
- ✅ No remaining `any` casts in curriculum/auth Convex modules.
- Keep schema updates scoped to real content needs—no extra typing passes until a new shape lands.

## Track 4 — Runtime Experience & Canvas
- LessonCanvas migration + pan/zoom controls are complete.
- Practice segments now refuse to regenerate problems beyond available tokens.
- Still needed before MVP sign-off:
  - ✅ Enforce the same inventory limits inside guided/presentation actions.
  - Finish the narration asset handshake (loader is ready; document the drop path + fallback rules for content).

## Track 5 — Auth & Access Control
- Learner routes (home/unit/lesson) now show explicit offline/unauthorised notices.
- ✅ Editor route now uses the same guard, so content authors never see blank states when Convex/auth is down.
- No automated auth tests yet—manual QA is fine until we stabilize the flow.

## Track 6 — Tooling, Testing, & DevOps
- CI already runs lint/type/build/codegen; no new tooling work until features require it.
- Skip automated test expansion for now—focus on shipping the runtime/editor experience.
- Seed scripts remain “good enough” for the current catalog; only revisit when new lesson formats land.

---

## Immediate Next Steps
- ✅ Gate the editor route with the same auth/offline notice used on learner surfaces so authors never hit blank states.
- Finish guided + presentation inventory parity: scripted actions should halt or prompt when supply runs dry, matching the practice segment safeguards.
- ✅ Document the narration asset drop flow in `.docs/reference/narration-assets.md` so the content team can prep audio/captions without engineering help.
