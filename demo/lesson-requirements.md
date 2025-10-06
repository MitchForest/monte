# Demo Lesson Requirements

This document captures the functional and content requirements for the Montessori-inspired lesson experience that will sit on top of the foundational portion of the skill graph. It focuses on a single lesson template that can be reused across counting, comparison, early geometry, and other entry-level strands.

## 1. Lesson Structure

Each lesson is a self-contained experience delivered on a timeline canvas. It is composed of three ordered blocks; every block can contain one or more segments:

1. **Tutorial / Presentation ("Done for you")**
   - 1–N segments, typically one per material or presentation style.
   - Auto-playable narrative (audio + optional captions) with clear start/stop points.
   - Demonstrates the material before the learner interacts.
   - Can optionally include quick checks (non-graded gestures such as “point to the longer rod”).

2. **Worked Examples ("Done with you")**
   - 1–N interactive steps, usually one per skill introduced in the tutorial.
   - The learner follows prompts while the system scaffolds each action.
   - Immediate feedback is provided; incorrect actions trigger targeted hints tied to the error state.

3. **Independent Practice ("Done by you")**
   - For each covered skill: at least one canonical easy, medium, and hard problem.
   - The primary set uses the same presentation type as the tutorial; an optional secondary set lets the learner pick a preferred material.
   - Step-by-step explanatory paths are pre-authored. Every anticipated wrong turn maps to a remediation step so the UI can re-route the learner.

## 2. Timeline & Canvas Requirements

- A single horizontal timeline with play/pause control anchors the experience.
- Timeline markers denote the start of each segment (presentation, worked example, practice set).
- A scrubber allows jumping backwards; forward skipping is gated until the current segment is completed.
- The visual canvas hosts SolidJS components for materials, manipulatives, and prompts; background uses a util such as `bg-dot-grid` for a Montessori aesthetic.
- Each segment carries metadata so the UI can render a breadcrumb (Segment name, estimated duration, material icons).

## 3. Materials & Segment Metadata

- Lessons reference materials via IDs (e.g., `sandpaper-numerals`, `bead-stair`, `spindle-box`).
- A presentation may specify multiple materials in sequence (primary + optional variation). Worked examples and practice questions inherit or override the material list.
- Segment metadata:
  - `segmentId`
  - `segmentType`: `presentation`, `worked-example`, `practice`
  - `media`: references to narration, animations, still images
  - `materials`: ordered array of material usage entries (`materialId`, `purpose`, `optional` flag)
  - `skills`: list of `skillId` covered
  - `scriptMachine`: optional link to an XState definition for state-driven tutoring
  - `successCriteria`: textual description used for teacher observation notes

## 4. Worked Examples & Practice Questions

- Worked examples:
  - Structured as a sequence of steps (`prompt`, `expectedAction`, `hint`, `feedback`, `stepMaterial`).
  - Leverage the drag-and-drop interaction layer (see demo references) for manipulative placement and movement.
  - Track attempt history for analytics.
- Practice questions:
  - Each skill must have **exactly one** canonical question per difficulty level (easy / medium / hard).
  - Additional optional questions tie to presentation or learner-selected materials.
  - Schema per question:
    - `questionId`, `skillId`, `difficulty`
    - `prompt` (rich text)
    - `materialsAllowed` (subset of lesson materials the learner may choose from; optional `any` flag)
    - `answerModel` (correct answer representation; supports numeric, multiple choice, drag targets)
    - `stepScaffolds`: ordered list of remedial steps keyed by common misconception IDs.
    - `exemplarSolution`: final narrated solution for review mode.

## 5. State Management & Scripts

- Segment behavior (tutorial autoplay, guided example logic) is driven by XState state machines stored as JSON/TS modules under `demo/machines/`.
- Each segment references a machine; machines expose states for presentation phases, user actions, error remediation, and completion events.
- The timeline integrates with the state machine events to advance automatically once completion is emitted.

## 6. Interaction Layer

- Built with SolidJS components sitting on a canvas container.
- Drag-and-drop powered by the referenced implementation (gist) tailored for Solid; animations handled by `solid-motionone`.
- Support for keyboard navigation (tab + arrow keys) to meet accessibility expectations.
- Visual cues for Montessori materials (color schemes, natural textures) using CSS utilities rather than heavy image assets where possible.

## 7. Analytics & Progression

- Capture timestamps for each segment start/end, pauses, and repeat plays.
- Log error states encountered in worked examples/practice to refine scaffolds.
- Emit completion events per skill and per difficulty tier so mastery tracking can sync with the broader graph.

## 8. Content Authoring Guidelines

- Stick to Montessori language: concrete → pictorial → abstract.
- Limit tutorial segments to < 2 minutes each to maintain attention.
- Provide teacher notes for each segment (materials prep, classroom adaptation).
- Ensure practice questions escalate meaningfully: easy reinforces presentation, medium introduces slight variation, hard requires transfer or higher-number reasoning.

## 9. Deliverables

- Lesson schema definition (TypeScript interfaces / JSON schema).
- Content authoring templates (YAML or JSON examples) for the first lesson.
- SolidJS canvas shell, timeline component, and segment renderer.
- XState machine examples for a presentation and a worked example.
- Drag-and-drop utility integration demoing a counting lesson.

This requirement set should remain scoped inside `demo/` until the experience is production-ready.
