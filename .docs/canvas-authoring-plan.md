# Authoring Canvas & Timeline Upgrade Plan

This document captures the detailed implementation plan for Phase 3 of the curriculum roadmap: transforming the lesson authoring workspace into a full keyframe/timeline editor with reusable manipulatives and a student-style demo mode.

---

## 1. Schema & Data Model

1. Extend `@monte/types` with timeline primitives:
   - `Transform2D` (`position`, `rotation`, `scale`), `Keyframe`, and `TimelineTrack` definitions.
   - Shared `SegmentStep` schema with `presentation | guided | practice` discriminant and:
     ```ts
     {
       id: string;
       title: string;
       caption?: string;
       actor: 'guide' | 'student';
       durationMs: number;
       keyframes: TimelineTrack[];
       interactions?: InteractionSpec[];
     }
     ```
2. Embed per-segment timelines inside `LessonSegment`:
   - `timeline: SegmentTimeline` (array of ordered steps + metadata).
   - `materialsByStep` map for quick lookup of active assets.
3. Add `SceneNode` descriptions to `LessonMaterialInventory` to describe renderable tokens (id, sprite/component ref, default transform).
4. Update Convex `lessons` documents to persist the new timeline payload; add compatibility migration (live lessons fallback to empty timelines).

## 2. Canvas Architecture

1. **Scene graph**
   - Build a normalized store (`scene.nodes`, `scene.selection`, `scene.keyframes`) separate from Solid component state.
   - Each node references a `materialId` and optional custom props.
2. **Manipulation tools**
   - Multi-select with bounding-box handles (translate/scale/rotate).
   - Snap-to-grid & alignment guides.
   - Keyboard shortcuts (duplicate `cmd+d`, delete `del`, step navigation with `←/→`).
3. **Keyframe recording**
   - Timeline scrubber sets the current time within a step.
   - “Capture transform” button stores transforms for selected nodes.
   - Interpolate using Motion One or custom tween helpers when playing back.
4. **Undo/redo**
   - Reuse lesson editor history; wrap timeline mutations in `applyUpdate`.

## 3. Timeline UI

1. **Segment navigator**
   - Vertical list of segments (existing) plus horizontal timeline surface per segment.
   - Show step markers with labels, duration, and actor badge.
2. **Step inspector**
   - Editing panel for caption, actor, duration, easing, and interaction parameters.
   - Copy/duplicate step actions.
3. **Track view**
   - Per-material track showing keyframes; drag to adjust timing.
   - Support grouping nodes (e.g., bead trays) to move in sync.
4. **Guided/practice reuse**
   - Shared step schema with additional flags (e.g., `requiresStudentAction`, `targetDropZoneId`).
   - Guided/practice timelines reference presentation keyframes where possible (copy-on-write).

## 4. Material Palette & Inventory

1. Palette panel lists available materials (from inventory + shared templates).
2. Drag-dropping a material instantiates a scene node at the drop location.
3. Material inspector:
   - Assign aliases (e.g., “Tray A”).
   - Toggle visibility by step.
4. Support custom material presets saved back to `packages/curriculum/content/material-presets`.

## 5. Author Demo Mode

1. Integrate lesson player with new timeline data:
   - Build a derived “render script” from timeline + interactions.
   - Reuse existing xstate machines but feed them timeline events instead of hard-coded scripts.
2. Demo panel controls:
   - Play/pause, step forward/back, scrubbing.
   - “Jump to editor” button that focuses the originating step and opens inspector.
3. Recording hooks: capture session events (time per step, issues) and attach to lesson metadata for QA.

## 6. Implementation Milestones

1. **Milestone A — Data foundations**
   - Add schema changes, Convex mutation for saving timelines.
   - Build serialization helpers (`serializeTimeline`, `mergeLegacyScript`).
2. **Milestone B — Canvas tooling**
   - Launch scene graph + multi-select.
   - Implement keyframe capture & playback within editor.
3. **Milestone C — Timeline UI**
   - Replace current action lists with new timeline components.
   - Ensure undo/redo and autosave work with new data.
4. **Milestone D — Demo mode**
   - Hook timelines into runtime player.
   - Deliver preview toggles + QA recording.

## 7. Parallel Work

- **Documentation**: update curriculum authoring handbook with new workflow, create quick-start video.
- **Testing**: add Vitest coverage for timeline reducers and scene graph mutations; add Playwright smoke test for authoring/demonstration flow.
- **Migrations**: scripts to convert existing multiplication lesson from script-based actions to timeline steps.

---

This plan keeps backend, data, and UI changes staged so functionality can ship incrementally while preserving lesson editor stability. Each milestone should land behind a feature flag (`VITE_FEATURE_TIMELINE`) to unblock the current authoring team during the transition.
