# Demo Lesson Implementation Plan

This plan outlines the sequence of work to deliver the Montessori-inspired lesson demo. The goal is to ship a fully functional prototype for the “Counting to 10” lesson that can be reused across other foundational strands.

## Phase 0 – Foundations

1. **Define data contracts**
   - Spec TypeScript interfaces / JSON schema for lessons, segments, materials, practice questions, and state machines.
   - Capture canonical difficulty levels and material metadata.
2. **Set up demo workspace**
   - Create a local SolidJS app (Vite + Solid) under `demo/app/`.
   - Add dependencies: `solid-js`, `xstate`, `@xstate/solid`, `@solid-primitives/motion` (or `solid-motionone`), drag-and-drop helper adapted from referenced gist.
3. **Material library stub**
   - Author `demo/content/materials.json` listing Montessori manipulatives with thumbnails, description, interaction affordances.

## Phase 1 – Timeline & Canvas Shell

1. **Timeline component**
   - Build a Solid component with play/pause, scrubber, segment markers, progress tracking.
   - Integrate keyboard controls and aria labels.
2. **Canvas layout**
   - Implement `LessonCanvas` with CSS grid/flex, background utility (`bg-dot-grid`), container for material components.
   - Establish slots for segment header, instructions, manipulative area, timeline.
3. **State sync**
   - Wire timeline to a simple XState machine controlling segment progression (states: idle, playing, paused, completed).

## Phase 2 – Interaction Toolkit

1. **Drag-and-drop wrapper**
   - Port the provided drag-and-drop gist into a reusable Solid hook/component.
   - Add snapping/grid alignment for bead placements.
2. **Animation helpers**
   - Configure `solid-motionone` for fade/translate animations on segment transitions and material movements.
3. **Reusable manipulatives**
   - Build primitive components: `BeadStair`, `SandpaperNumeral`, `NumberCard`, `TenFrame` with props for value, orientation, etc.

## Phase 3 – Content Authoring & Rendering

1. **Seed lesson content**
   - Author `demo/content/lessons/counting-to-10.json` covering four core skills with presentations, worked examples, practice questions (easy/medium/hard per skill).
   - Include mappings to materials and step-by-step scaffolds.
2. **XState script creation**
   - Produce machines for (a) tutorial narration with auto-advance, (b) worked example with hint states, (c) independent practice with remediation.
3. **Segment renderer**
   - Implement a Solid component that consumes a segment definition + machine, renders instructions, binds manipulative interactions, emits completion events.

## Phase 4 – Experience Stitching

1. **Lesson player**
   - Combine timeline, segment renderer, and state machines into a single flow controlled by lesson JSON.
   - Ensure timeline markers highlight the active segment; disable future segments until prerequisites met.
2. **Practice engine**
   - Instantiate easy/medium/hard questions sequentially; allow learner to choose a material for optional second pass.
   - Log attempts and surface step scaffolds when the learner deviates.
3. **Review & mastery tracking**
   - Provide a lesson summary view: skills covered, successes, hints used.
   - Emit events (console/log) for integration reference.

## Phase 5 – Polish & Extensions

1. **Accessibility & UX polish**
   - Add captions/subtitles to tutorial audio.
   - Ensure drag-and-drop has keyboard alternatives.
2. **Authoring tooling (optional)**
   - Create a simple schema validator + preview script.
3. **Next-lesson cloning**
   - Duplicate the approach for “Comparisons up to 10” or “One more / one less” to validate reusability.

Deliverables for each phase should remain inside `demo/` to avoid impacting production code paths until the prototype is vetted.
