# Lesson Editor Evolution Plan

Monte already has a working baseline for lesson CRUD, manual segment scripting, and a beta timeline canvas. This plan describes the simplest set of incremental steps that transform that foundation into the authoring workflow envisioned: searchable curriculum queues, a canvas-first storyboard experience, reusable guided/independent flows, and tight question-service integration. Each phase is small, testable, and reversible.

---

## Ground Rules
- **Simplicity first.** Prefer linear workflows and explicit data flows over clever abstractions.
- **One new concept per phase.** Ship vertical slices that can be QA’d in isolation, avoiding large, interdependent refactors.
- **Shared contract upgrades flow outward**: adjust `@monte/types` → `@monte/lesson-service` → apps/backend → frontend, in that order.
- **Always keep M5 exit criteria green** (`pnpm lint`, `pnpm typecheck`, `pnpm build`, targeted Vitest suites).

---

## Phase 0 – Baseline Audit
1. **Inventory current lesson data**  
   - Confirm we can flag “empty” lessons (no segments/materials/questions) via backend queries.  
   - Document current schema fields we will extend (lesson metadata, segments, timeline nodes).
2. **Capture UX gaps**  
   - Record screencasts of the existing editor to highlight missing filters, drag tooling, and question authoring.  
   - Log any performance or stability issues (timeline flicker, inventory resets) that need pre-emptive fixes.

Deliverable: Issue backlog describing gaps and schema touchpoints.

---

## Phase 1 – Lesson Discovery & Status Filters
1. **Status metadata**  
   - Extend Convex `lessons` table and API surfaces with `authoringStatus` states we actually use (`none`, `draft`, `ready`, `live`).  
   - Enforce updates via existing mutations to prevent drift.
2. **Filterable lesson list**  
   - Add server query for lesson summaries with optional filters (domain/unit/topic/status/hasDraftContent).  
   - Create a new “Lesson Directory” panel in the editor with search + filters + sorting by recency.  
   - Surface quick stats (empty, in-progress, published) to prioritize work.

Deliverable: Curators can find un-authored lessons without scrolling the tree.

---

## Phase 2 – Canvas Foundations
1. **Palette & placement**  
   - Expose inventory token types/materials in a draggable palette.  
   - Allow dropping new scene nodes onto the canvas (no timeline linkage yet).  
   - Persist placed nodes back into the lesson document (`lesson.materialInventory.sceneNodes`).
2. **Grid & snap**  
   - Add configurable grid overlays (toggle, size selector).  
   - Snap positions/rotations to grid when enabled.  
3. **Viewport polish**  
   - Smooth wheel zoom, remember viewport per segment, and ensure loading a new lesson resets gracefully.

Deliverable: Authors can arrange manipulatives visually with predictable positioning.

---

## Phase 3 – Timeline Automation & Step Capture
1. **Step recording**  
   - Introduce a “Record” mode that:
     - Captures node transforms on drop/move and appends a timeline step automatically.
     - Allows manual captions per step (inline editor).  
   - Add keyboard shortcuts (e.g., `Shift+Enter` new step, `Cmd+Z` undo last transform).
2. **Target zones & overlays**  
   - Extend scene nodes with a `role` (`manipulative`, `target`, `label`).  
   - Provide tooling to define rectangular drop zones with snapping.  
3. **Timeline review**  
   - Add basic playback within the editor (step-by-step preview).  
   - Support step duplication and reordering directly in the timeline list.

Deliverable: Presentation segments can be authored by doing, not hand-editing arrays.

---

## Phase 4 – Guided & Independent Flow Reuse
1. **Segment cloning**  
   - Implement “Clone presentation into guided practice” and “Clone into independent practice” actions.  
   - Store clone lineage to support future diffing/highlighting.
2. **Actor roles & prompts**  
   - Let authors mark each step’s actor (`guide`, `student`).  
   - Provide per-step hint/nudge text fields (stored alongside steps).
3. **Retry scaffolding**  
   - Extend lesson schema with guidance triggers (e.g., show hint after N failed attempts).  
   - Ensure the runtime reads these fields even if UI support ships later.

Deliverable: Presentation flow can seed guided and independent practice with minimal rework.

---

## Phase 5 – Question Service Integration
1. **Canonical question browsing**  
   - Expose `@monte/question-service` skill catalog in the editor (skill picker with easy/medium/hard exemplars).  
   - Allow attaching canonical question templates to practice steps.  
2. **Authoring custom variants**  
   - Provide form controls to override prompts/answers while keeping canonical references.  
   - Store references so analytics can tie attempts back to base items.
3. **Retry logic wiring**  
   - When a student exhausts attempts, surface the associated hint/nudge or replay snippet defined earlier.  
   - Stub runtime glue now; full learner execution can follow.

Deliverable: Practice segments use structured question data instead of free-form text.

---

## Phase 6 – Materials Workbench
1. **Material catalog UI**  
   - Build a separate “Materials” view listing existing manipulatives with previews.  
   - Support create/edit of material metadata (name, tags, default visuals, component mapping).
2. **Component preview harness**  
   - Render materials in isolation with adjustable props (e.g., bead quantity).  
   - Generate screenshot/thumbnails for documentation.
3. **Publish workflow**  
   - Gate new materials behind review (draft → published), mirroring lesson status fields.

Deliverable: Authors can add or tweak manipulatives without touching code.

---

## Phase 7 – Polishing & Guardrails
1. **Validation**  
   - Add lint rules or Vitest suites for lessons (e.g., every step has an actor, hints <= 160 chars).  
   - Validate timeline nodes against the inventory schema before saving.
2. **Onboarding & docs**  
   - Update `AGENTS.md` with the new authoring workflow, keyboard shortcuts, and troubleshooting steps.  
   - Create a short “authoring checklist” surfaced inside the editor.
3. **Instrumentation**  
   - Log key author actions (record start/stop, clone events, question attachments) to monitor adoption.

Deliverable: Stable, observable authoring flow aligned with the original vision.

---

## Suggested Sequencing & Review Cadence
| Phase | Duration (est.) | Primary Output | Review Gate |
| ----- | ---------------- | -------------- | ----------- |
| 0–1   | 1–2 sprints       | Filterable lesson queue | Demo + schema sign-off |
| 2     | 1 sprint          | Palette + grid canvas    | Usability review |
| 3     | 1–2 sprints       | Auto-step timeline       | Internal dogfood |
| 4     | 1 sprint          | Guided/independent cloning | Walkthrough with curriculum lead |
| 5     | 1–2 sprints       | Question picker + hints  | Content QA + runtime smoke test |
| 6     | 1 sprint          | Materials workbench      | Admin UX review |
| 7     | ongoing           | Stability + docs         | Checklist completion |

Adjust scope per sprint based on in-flight feedback, but keep the sequence intact so downstream features always build on hardened primitives.

---

## Success Criteria
- Authors can discover un-authored lessons in seconds and start from a clean template.
- Presentation segments are captured visually (no manual JSON editing) with grid-snapped manipulatives.
- Guided and independent practice flows inherit presentation steps, with clear student/guide responsibilities and hints.
- Practice questions come from the structured question service, including difficulty tiers and retry logic.
- Materials are manageable through a dedicated UI without code changes.
- Documentation, tests, and telemetry cover each new capability.

When these boxes are checked, the editor will match the vision: a simple, powerful workspace where lessons are storyboarded visually, refined collaboratively, and grounded in canonical questions.
