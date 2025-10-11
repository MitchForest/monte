# Curriculum Platform Migration Plan

This plan describes how we will evolve the new `@monte/curriculum` package into the canonical CMS for the lesson platform, wire Convex import/export pathways, and deliver the internal LMS authoring experience (canvas, CRUD, demo playback). Work is organized into phases so the content team can start producing lessons while infrastructure steadily matures.

---

## Phase 0 — Content Source Of Truth (✅ in progress)

- **Workspace package**: keep editable JSON/MD assets under `packages/curriculum/content`, manipulatives/media under `packages/curriculum/assets`, and utility helpers under `packages/curriculum/src`.
- **Manifest generation**: run `pnpm sync:curriculum` to produce `packages/curriculum/content/manifest.json` (units, topics, lesson scaffolds, grade coverage). Record counts and grade distribution for quick health checks.
- **Documentation**: migrate historical planning docs into `.docs/reference` and keep roadmap updates in this plan.

Deliverables:
- [x] Content package with manifest builder (`buildCurriculumManifest`).
- [ ] CI check that ensures manifest is regenerated when content changes.

---

## Phase 1 — Convex Integration

### 1. Import pipeline
1. **Schema updates**: extend Convex `lessons` table with editorial fields (`assigneeId`, `status`, `notes`, `gradeLevels`, `manifestHash`).
2. **Manifest schema**: add `CurriculumManifestSchema` to `@monte/types` mirroring the JSON produced by the manifest builder.
3. **Backend mutation**: implement `curriculum.syncManifest` that:
   - hashes the manifest payload,
   - upserts units/topics by slug (id),
   - creates or updates lessons with default `LessonDocument` scaffolds, copying grade levels and prerequisites into metadata,
   - cleans up records removed from the manifest when `--prune` is passed.
4. **CLI command**: expand `pnpm sync:curriculum` to upload the manifest to Convex (using `@monte/api` admin client) once authenticated, and log a diff summary (created/updated/pruned).

### 2. Export pipeline
1. **Query**: add `curriculum.exportManifest` Convex query that returns the latest draft snapshot (including Convex-only fields like assignments).
2. **Round-trip script**: support `pnpm sync:curriculum --export` to pull Convex data and reconcile it back into the repo (write to `packages/curriculum/content/*`, update manifest, raise conflicts if manual edits diverge).
3. **Audit trail**: write the git commit SHA and manifest hash into Convex (`curriculum.manifestVersion`) each time we import; surface that in the authoring UI so editors know which revision they're editing.

### 3. Automation
- Add CI job that runs `pnpm sync:curriculum --dry-run` and fails if the manifest or Convex diff is stale.
- Provide a GitHub Action workflow for content-only PRs (validate JSON schema, regenerate manifest, ping reviewers with delta summaries).

---

## Phase 2 — Internal Curriculum LMS

### 1. Curriculum dashboard
- **Route**: `/app/curriculum` (internal) listing units/topics/lessons from Convex.
- **Filters**: status, assignee, grade band, dependency readiness (topics with blocked prerequisites).
- **Actions**: assign author/reviewer, update status, open lesson detail, open comment thread.
- **Visuals**: Kanban or table view with progress bars and highlight of manifest version vs. live draft.

### 2. Lesson detail panel
- **Metadata tab**: summary, grade levels, CCSS alignment, prerequisites, linked Fluency drills/mastery quizzes.
- **Segments tab**: placeholder preview of presentation/guided/practice segments and material inventories (read-only until editor is ready).
- **Activity feed**: comment/QA notes, manifest change logs, links to drafts/PRs.

### 3. CRUD support
- **Create**: scaffold lessons/topics/units directly in Convex (optionally add to manifest on export).
- **Edit**: inline editors for narrative fields, reorder topics/lessons, attach materials.
- **Delete/Archive**: archive flows with dependency warnings to avoid orphaned records.
- **Bulk operations**: apply status changes or assignments to a selection (useful for planning sprints).

Implementation notes:
- Reuse `@tanstack/solid-table` for tabular views, maintain optimistic updates via Convex mutations.
- Add xstate machines for form submission states (idle/saving/error) to keep UI responsive.

---

## Phase 3 — Authoring Workspace Enhancements

### 1. Canvas & Materials
- **Material palette**: query `lesson.materialInventory` and allow authors to drag items into the canvas; create/edit materials via modal (persist to Convex materials table).
- **Canvas upgrades**: multi-select, marquee, alignment guides, snap-to-grid, layer ordering, keyboard shortcuts (duplicate, align, distribute).
- **Keyframe editing**: timeline view where each step records transform/easing values for selected tokens; store data in the lesson document schema.

### 2. Timeline segmentation
- Adopt consistent step schema across Presentation, Guided, and Practice segments:
  ```ts
  {
    id: string;
    caption: string;
    actor: 'guide' | 'student';
    keyframes: TransformKeyframe[];
    prompts?: PromptDefinition[];
  }
  ```
- Provide copy/reuse operations so Presentation drop zones and manipulatives automatically carry into Guided and Practice segments.
- Implement undo/redo stack (local) with commit points synced to Convex.

### 3. Playback & Demo mode
- Embed a "Play as Student" toggle that spins up the lesson player with the current draft, allowing step-through, auto-play, and timeline scrubbing.
- Record telemetry (time per step, flagged issues) and attach to the lesson for QA.
- Expose an "Author Demo" route that launches a fullscreen playback flow with annotations and quick-jump to editing each step.

---

## Phase 4 — Guided & Independent Practice Authoring

- **Guided practice**: specify expected student interactions (drop zones, input fields) and evaluation logic using shared primitives; allow authors to mark steps as "student action" vs. "guide prompt".
- **Independent practice**: configure a bank of questions per difficulty and target pass/fail thresholds (fast-pass after 2 correct, fast-fail after 3 misses).
- **Adaptive scaffolds**: record how guided steps map to practice items so analytics can correlate which demonstrations support mastery.
- **Preview tooling**: run-through mode that simulates wrong answers, fast-pass/fail conditions, and resets.

---

## Phase 5 — Fluency Drills & Mastery Quizzes

- **Schema extensions**: map `fluency-drills.json`, `mastery-quizzes.json`, and `fluency-question-seeds.json` into Convex collections with version hashes.
- **Scheduling logic**: integrate spaced repetition engine (KNIGHT) driven by personalized knowledge graph (see `.docs/reference/MA-research.md`).
- **Task selector**: adapt session planner to mix presentation lessons, guided practice refreshers, fluency drills, and mastery quizzes based on mastery scores.
- **Spaced repetition**: store per-student mastery decay curves, schedule reviews, and surface upcoming tasks in dashboards.
- **Analytics**: capture attempt data (latency, accuracy, hints) and feed back into question seed generation.

---

## Tooling & Governance

- **Change review**: enforce code owners for `packages/curriculum` and Convex modules; require preview builds for UI changes and manifest diffs for content changes.
- **Versioning**: each manifest sync tags the commit SHA; maintain a changelog (`packages/curriculum/CHANGELOG.md`) summarizing content shifts.
- **Backups**: nightly job exports manifest + Convex drafts to S3; include audio assets and materials metadata.
- **Testing**: introduce snapshot tests for manifest shape, Vitest coverage for importers/exporters, and integration tests for canvas interactions.

---

## Milestone Checklist

- [ ] Convex import/export end-to-end (manifest push/pull, hash auditing).
- [ ] Internal curriculum dashboard with CRUD + assignment workflow.
- [ ] Authoring canvas with keyframes, shared manipulatives, undo/redo.
- [ ] Guided/independent practice schema & tooling (fast-pass/fail simulation).
- [ ] Demo mode enabling full lesson playback & quick edits.
- [ ] Fluency/mastery modeling aligned with Math Academy feature parity targets.

The phases build on each other: once phases 1–3 are stable and the content team has successfully authored multiple lessons with demo playback, we pivot to Phase 5 to tackle fluency and mastery acceleration. Each phase should ship behind feature flags or controlled routes so we can onboard the internal team incrementally.
