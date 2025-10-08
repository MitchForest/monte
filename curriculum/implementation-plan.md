# Demo Lesson Implementation Plan

Goal: deliver two Montessori-inspired lessons (Counting 1–10, Addition within 10) running as a route inside the existing frontend app, backed by our current API stack. The plan emphasises building a reusable student workspace first, then layering content, interactions, and narrated scripts (audio + captions).

## Phase 0 – Foundations (Prep inside existing repo)

1. **Data contracts & content structure**
   - Define TypeScript interfaces / JSON schema for `Material`, `Lesson`, `Segment`, `WorkedExampleStep`, `PracticeQuestion` (easy/medium/hard), `RemediationStep`.
   - Capture canonical skill IDs from `skills.json` for both lessons.
   - Draft `demo/content/materials.json` describing Montessori materials, marking which lesson they serve as primary vs. optional extensions.
4. **Narration scripts & TTS pipeline**
   - Author presentation scripts in `demo/scripts/` (JSON/TS exports with per-step text and timing cues).
   - Implement a build script (`pnpm demo:tts`) that calls the OpenAI TTS endpoint (using `OPENAI_API_KEY`) to produce audio files and WebVTT captions stored under `demo/assets/audio/<lesson>/<segment>.{mp3,vtt}`.
2. **Frontend integration scaffold**
   - Create a `demo` route within the existing frontend app (e.g., `apps/frontend/src/routes/demo/index.tsx`).
   - Set up route-level lazy loading to keep the demo isolated.
   - Expose a feature flag / query param toggle so the route is opt-in.
3. **Backend considerations**
   - No new backend service required initially; lessons can ship as static JSON under `public/demo/` or fetched via an internal API mock.
   - Document how lessons will eventually persist (e.g., Supabase table) to avoid schema drift later.

## Phase 1 – Student Workspace Shell

1. **Timeline component**
   - Play/pause controls, segment markers, and progress indicator.
   - Integrate with keyboard shortcuts and accessible labels.
2. **Canvas layout**
   - Main `LessonCanvas` with Montessori-inspired styling (dot-grid background, warm palette).
   - Slots: segment header, instruction panel, manipulative workspace, timeline footer.
3. **State synchronisation**
   - Wire the timeline to an XState machine (states: `idle`, `presentation`, `workedExample`, `practice`, `completed`).
   - Ensure pause/resume hooks update the machine and the timeline UI.

## Phase 2 – Interaction Toolkit

1. **Drag-and-drop primitives**
   - Adapt the referenced Solid drag-and-drop gist into `useDragSurface` and `Draggable`/`Droppable` components with snapping and constraints.
2. **Motion utilities**
   - Integrate `solid-motionone` for entrance/exit animations and material movements.
3. **Material components**
   - Programmatically build manipulatives from data: `NumberRod`, `SandpaperNumeralCard`, `SpindleBox`, `CardAndCounter`, `BeadStair`, `AdditionStripBoard`.
   - Each component accepts props (`value`, `selected`, `interactive`) so the same component supports presentation → guided → independent flow without swapping materials mid-lesson.

## Phase 3 – Content Authoring & Data

1. **Lesson JSON drafts**
   - `demo/content/lessons/counting-to-10.json`
   - `demo/content/lessons/addition-to-10.json`
   - Each lesson enumerates presentations, worked examples, practice sets (easy/medium/hard per skill), remediation steps, material references, and an explicit `primaryMaterialId` per segment to keep continuity.
2. **Schema validation**
   - Add a lightweight script (`pnpm demo:validate`) that validates lesson JSON against the schema.
3. **XState machines**
   - Author machines for presentation playback (sync with generated audio + captions), guided example flow, and practice loop. Store under `demo/machines/`.

## Phase 4 – Rendering & Flow

1. **Segment renderer**
   - Consume lesson JSON + machine to render each segment inside the canvas.
   - Handle material instantiation, instructions, audio/caption playback, and completion events.
2. **Worked example engine**
   - Stepper UI with prompts, action validation, hint triggers mapped to remediation steps.
3. **Practice engine**
   - Sequentially surface easy → medium → hard questions per skill.
   - Default to the segment’s primary material while letting the learner opt into flagged extensions.
   - Provide per-step feedback based on `RemediationStep` definitions and surface the interactive workspace for the chosen material.

## Phase 5 – Analytics & Review

1. **Event logging**
   - Record segment start/end, audio playback events, errors, hint usage. For now, log to console and optionally send to existing analytics pipeline.
2. **Lesson summary**
   - Display covered skills, materials used, completed difficulty tiers, outstanding misconceptions, and provide download links for captions/audio.
3. **Teacher notes**
   - Render side panel (opt-in) summarising presentation instructions and classroom adaptations.
4. **Caption playback**
   - Overlay captions during presentation segments with user controls (on/off, transcript panel).

## Phase 6 – Polish & Extension

1. **Accessibility audit**
   - Ensure drag-and-drop has keyboard equivalents, provide ARIA roles.
   - Add captions or transcript toggle for tutorial narration.
2. **Content expansion**
   - Clone counting/addition template to a third lesson (e.g., “Comparisons up to 10”) once the pipeline proves reusable.
3. **Integration prep**
   - Outline how lessons will move from static JSON to database-backed content when ready.

By following these phases we keep the demo self-contained, leverage our existing frontend/back-end stack, and set up a repeatable authoring + delivery workflow for future lessons.
