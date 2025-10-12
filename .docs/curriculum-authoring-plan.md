# Curriculum Authoring Plan

This document consolidates the curriculum platform roadmap (content service, LMS, import/export) and the lesson authoring canvas/timeline milestones. It lists what is complete and the remaining steps to deliver the full internal authoring experience.

---

## Completed Work

- **Single Source of Truth**
  - `packages/curriculum-service` now houses all editable curriculum content, shared materials/manipulatives, and timeline utilities.
  - `pnpm sync:curriculum` generates `content/manifest.json`; CI verifies the manifest stays in sync.
- **Convex Integration (Phase 1 foundation)**
  - `curriculum.syncManifest` imports units/topics/lessons, hashes manifests, and upserts Convex data.
  - Export helpers and CLI support (`--push`, `--export`, `--check`) round-trip data between repo and Convex.
  - Authoring metadata (`assigneeId`, status, notes, grade levels) lives in Convex `lessons`.
- **Timeline Schema Foundations (Milestone A)**
  - Added timeline primitives (`SegmentTimeline`, `SegmentStep`, `TimelineTrack`, `SceneNode`) to `@monte/types`.
  - Backend and editor normalize timelines whenever lessons load/save, ensuring every segment has a valid timeline shell.
- **Shared Manipulatives**
  - Golden Beads manifest and registry live under `packages/curriculum-service/assets/manipulatives`, ready for reuse across lessons.
- **Timeline Beta UI (Milestone B slices)**
  - Feature-flagged (`VITE_FEATURE_TIMELINE`) editor surface shows a basic timeline: step list, scene nodes, keyframe capture, and persistence back into lesson documents.
  - Canvas integration renders shared manipulatives (e.g., Golden Beads) on top of `LessonCanvas` with multi-select and drag-to-position before capturing keyframes.

---

## Remaining Work & Step-by-Step Plan

### Phase 1 — Convex & Automation (wrap-up)
1. **Import/export polish**
   - [ ] Add CLI migration to prune stale lessons when `--prune` is used.
   - [ ] Expose manifest hash/version in editor sidebar and curriculum dashboard.
2. **Automation**
   - [x] CI job for `pnpm sync:curriculum --check --dry-run` (done).
   - [ ] GitHub workflow for content-only PRs to comment summary diff.

### Phase 2 — Internal Curriculum LMS
1. **Curriculum dashboard**
   - [ ] Implement `/app/curriculum` route with filters (status, grade, assignee).
   - [ ] Inline actions: assign author, change status, open lesson detail timeline.
2. **Lesson detail view**
   - [ ] Metadata tab (summary, grade levels, skills, dependencies).
   - [ ] Activity/notes feed and manifest version badge.
3. **CRUD flows**
   - [ ] Create/edit/archive units/topics/lessons via Convex mutations with optimistic UI.

### Phase 3 — Authoring Workspace Enhancements
**Milestone B — Canvas & Materials**
- [ ] Integrate timeline store with the actual `LessonCanvas` scene graph (render manipulatives, sync transforms).
- [ ] Multi-select UI: bounding boxes, alignment guides, snapping.
- [ ] Keyboard shortcuts (duplicate, delete, step navigation).

**Milestone C — Timeline UI**
- [ ] Replace legacy action editors with track-based timeline (per-step headers, track lanes).
- [ ] Step inspector for caption/actor/duration/easing.
- [ ] Copy/reuse steps across presentation/guided/practice, tie into undo/redo.

**Milestone D — Demo Mode**
- [ ] Drive lesson player from timeline data (“Play as student”, scrubbing, step jump).
- [ ] Record QA telemetry (time per step, flagged issues) and surface quick “jump to edit”.

### Phase 4 — Guided & Independent Practice Authoring
- [ ] Define interaction primitives (drop zones, inputs) shared across segments.
- [ ] Author guided practice flows with student-action markers and evaluation logic.
- [ ] Build independent practice question bank authoring with fast-pass/fail rules.

### Phase 5 — Fluency Drills & Mastery Quizzes
- [ ] Load fluency drill & mastery quiz manifests from the service package into Convex.
- [ ] Implement personalized scheduling (knowledge graph, spaced repetition) per `.docs/reference/MA-research.md`.
- [ ] Task selector to mix lessons, guided refreshers, fluency, and mastery checks.

---

## Parallel Tasks & Infrastructure
- **Testing**: Add Vitest coverage for timeline reducers / scene graph mutations, Playwright smoke test for authoring flow.
- **Documentation**: Update curriculum authoring handbook with new timeline workflow; add quick-start guides.
- **Migrations**: Provide scripts to convert legacy lessons into timeline data (idempotent).
- **Feature Flags**: Keep new timeline/canvas features behind `VITE_FEATURE_TIMELINE` until stable; add analytics to measure adoption.
- **Governance**: Maintain changelog, code owners, and nightly backups of manifest + lesson drafts.

---

### Current Focus
- Finish Milestone B (canvas integration) and Milestone C (timeline UI) to unlock full authoring experience.
- Parallelize Phase 2 dashboard work so internal team can plan and assign lessons while the editor matures.
