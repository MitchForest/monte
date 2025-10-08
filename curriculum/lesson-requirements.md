# Demo Lesson Requirements

This document outlines the current scope for the multiplication-focused demo experience. The demo highlights two Montessori multiplication lessons that share a consistent segment structure and material flow.

- **Golden Bead Multiplication** (`skill.multiply-4-digit-by-1-digit`)
- **Stamp Game Multiplication** (`skill.multiply-3-digit-by-1-digit`)

The experience keeps the same primary manipulative across every segment of a lesson: presentation → guided practice → independent practice. Any optional variations are called out explicitly inside a segment.

## 1. Lesson Structure

Each lesson is delivered on a horizontal timeline canvas. Every version of a lesson follows the structure below and uses a shared set of TypeScript types defined in `apps/frontend/src/demo/types.ts`.

1. **Tutorial / Presentation (“done for you”)**
   - Scripted sequence of `PresentationAction`s (narrate, place materials, exchange, highlight).
   - Auto-advances while the lesson player is in `playing` state; the learner can pause or scrub.
   - Updates a lightweight “stage” model so cards, beads, and stamps are visible on screen.

2. **Guided Practice (“done with you”)**
   - `GuidedSegment` wraps a workspace UI and a list of authored steps.
   - Each step declares an `evaluatorId`; the UI maps this to a concrete validator (e.g., `golden-beads-exchange-tens`).
   - Immediate feedback: success records progress and advances; failure surfaces the authored nudge text.

3. **Independent Practice (“done by you”)**
   - Five multiplication problems per lesson. Learners answer with the final product after using the same material.
   - Pass conditions: first two questions correct **or** any three total correct. Fail after three misses.
   - On fail the lesson resets, new numbers are generated, and progress history is cleared via `resetLesson`.

## 2. Timeline & Canvas

- Single horizontal timeline with play/pause controls.
- `lessonPlayer` XState machine manages the active index, play state, and completion events.
- Scrubbing backwards is always allowed; forward locking is enforced until the segment emits completion.
- Canvas uses SolidJS segment components (`PresentationSegment`, `GuidedSegment`, `PracticeSegment`).

## 3. Materials & Metadata

- Materials are registered in `apps/frontend/src/demo/materials.ts`. Current IDs:
  - `golden-beads`
  - `golden-bead-cards`
  - `multiplication-ribbon`
  - `stamp-game`
- Each segment lists `materials: MaterialUsage[]` and `skills: string[]` so UI badges remain accurate.
- Segment metadata includes:
  - `type`: `presentation | guided | practice`
  - `scriptId` (presentation only)
  - `workspace` (guided/practice)
  - `steps` (guided) with `evaluatorId`
  - `questions` + `passCriteria` (practice)

## 4. Presentation Scripts

- Presentation scripts are generated from the scenario builders in `apps/frontend/src/demo/scenarios/multiplication.ts`.
- Each builder returns a `PresentationScript` with a title, optional summary, and `actions: PresentationAction[]` tailored to the active multiplicand and multiplier.
- Actions manipulate a simplified stage model (cards, beads, stamp columns, exchanges). The UI renders textual and numeric states for clarity. Text-to-speech will be layered on in a future iteration.

## 5. Guided Evaluators

- Guided step validators are keyed by `GuidedEvaluatorId` and implemented inside `GuidedSegment.tsx`.
- Current evaluators check place-value counts, copy counts, exchange results, and final products for active scenario data (golden bead and stamp game multiplication).
- The guided workspaces provide drag-and-drop trays: learners pull bead bars, stamp tiles, copy markers, and digit tokens from supply pools into labeled zones. Each drop updates the validator state, enabling targeted feedback without manual number entry.

## 6. Practice Engine

- `PracticeSegment` drives numeric-answer prompts.
- Tracks per-question status and emits events via `onTaskResult` so the progress store stays in sync.
- Regeneration uses workspace-aware randomization to create fresh multiplicands and multipliers while keeping question IDs stable for progress tracking.
- Failures call `resetLesson` and snap the player back to the first segment, meeting the “redo the lesson” requirement.

## 7. Progress & Analytics

- `useProgress` registers every task via `ensureTasks` when a lesson loads.
- Step/task updates occur from:
  - Presentation completion (marks tutorial task complete).
  - Guided step checks (each successful step records a completed task).
  - Practice question outcomes (correct ⇒ `completed`, incorrect ⇒ `incorrect`).
- Practice pass/fail surfaces at the segment level, ensuring the lesson timeline advances only when mastery conditions are satisfied.

## 8. Montessori Materials Palette

- **Golden Beads**: thousand cubes, hundred squares, ten bars, unit beads, number cards, yellow multiplication ribbon.
- **Stamp Game**: colored tiles valued at 1, 10, 100; arranged in repeated columns before exchanging.

## 9. Content Authoring Notes

- Author guided prompts with explicit expectations and nudges so validators have deterministic criteria.
- Presentation narrations should describe every manipulation (card placement, bead exchange, stacking) in Montessori language.
- Practice prompts emphasise modeling first, then reading the product aloud before submitting.
- When regenerating problems, keep multiplicands within material-friendly ranges (golden beads ≤ 4-digit, stamp game ≤ 3-digit).

## 10. Outstanding TODOs

- Integrate actual manipulative canvases (drag/drop, spatial layout) once the scripted architecture stabilises.
- Introduce TTS + captions, referencing the new `PresentationAction` format.
- Expand evaluators to cover multi-digit multipliers and additional exchange cases.
- Generate guided/presentation numbers dynamically (aligned with regenerated practice sets) so every retake uses a new worked example.
