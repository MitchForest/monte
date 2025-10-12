# Math Academy Inspired MVP Plan

This document outlines the minimum viable product that ties Monte’s existing apps (`@monte/frontend`, `@monte/backend`) and packages (`@monte/types`, `@monte/api`, `@monte/curriculum-service`) into a personalized learning system inspired by Math Academy. It complements ongoing auth/org cleanup and curriculum authoring efforts.

---

## 1. Product Pillars

1. **Structured Curriculum Backbone**  
   - Authoritative units, topics, lessons, and skill graph sourced from `@monte/curriculum-service`.  
   - Convex holds canonical copies, guaranteeing that editor updates, runtime consumption, and spaced repetition share the same data.

2. **Learner Identity & Access**  
   - Better Auth provides authenticated users, organization membership, plan enforcement, and impersonation safeguards.  
   - Learner records are established in Convex the moment a user with a student-capable role signs in.

3. **Adaptive Learning Engine**  
   - Bayesian-lite mastery model per skill node with decay to approximate spaced repetition.  
   - Task selection blends unlockable lessons, targeted practice/reviews, and diagnostics, always respecting prerequisites.

4. **Dynamic Task Rendering & Authoring**  
   - Lesson runtime generates fresh problem instances (e.g., Montessori bead multiplication) using shared helpers from the forthcoming `@monte/lesson-service`, while logging outcomes against skills.  
   - Guided/presentation segments remain authored, but practice tasks leverage seeded generators for variation, and authors preview identical flows inside the editor.

5. **Motivation & Progress UX**  
   - XP, streaks, and lesson/skill completion statuses computed server-side and reflected in the Solid app.  
   - Learners see upcoming tasks, overdue reviews, recent mastery gains, and recommended next actions.

---

## 2. Current Assets & Ownership

| Area | Current State (Jan 2025) | Owner(s) |
| --- | --- | --- |
| Auth & Organizations | Better Auth integration in progress; frontend uses organization client wrappers; Convex exposes admin/organization modules | Auth/org agent |
| Curriculum Authoring | Lesson editor scaffolding, Convex manifest sync, static curriculum canon in `@monte/curriculum-service` | Curriculum agent |
| Lesson Runtime | Solid UI with task progress tracked locally; seeded Montessori scenarios | Core app team |
| Lesson Service (planned) | Centralizes lesson documents, manipulative engines, and runtime/editor helpers | Curriculum + platform agents |
| Knowledge Graph | `@monte/graph-service` package scaffolds canonical + learner graphs, pending ingestion from curriculum | Graph service agent |
| Question Generation | `@monte/question-service` centralizes per-skill question banks & generators (stubs awaiting seeded data/telemetry) | Question service agent |
| Learning Engine | `@monte/engine-service` defines orchestrator responsibilities, will consume graph/question/curriculum data | Engine service agent |
| Shared Types/API | Schemas in `@monte/types`; HTTP client in `@monte/api`; scripts to sync Convex/client codegen | Core platform |
| Convex Runtime Data | Will store only synced lesson documents/unit/topic runtime metadata; legacy seed rows slated for purge before MVP | Platform agent |

---

## 3. MVP Requirements

### 3.1 Data Model Extensions (Convex)
- `skills` table: id, slug, title, description, difficulty, domainId, prerequisites, metadata.
- `skillEdges` table: sourceSkillId, targetSkillId, relation (`prerequisite`, `encompasses`, `support`).
- `lessons` table enhancements: `skillIds` array, `diagnosticItems`, `practiceTemplates` references.
- `learners` table: userId, orgId, planKey, createdAt, profile metadata.
- `learnerSkillStates`: learnerId, skillId, masteryProbability, lastInteractionAt, stabilityScore, decayFactor.
- `learnerTaskLog`: records of lesson segments, practice attempts, scores, duration, generated seed.
- `learnerQueues`: pending tasks with type (lesson, review, diagnostic), scheduledAt, priority score.
- `xpLedger`: learnerId, amount, reason, sourceTaskId, timestamp.

### 3.2 Curriculum & Graph Ingestion Pipeline
1. Enhance `scripts/sync-curriculum.mjs` to:
   - Import skill graphs (`domain-graphs`), map prerequisites, and populate the new `skills`/`skillEdges` tables.
   - Link lessons to their skill IDs using manifest data.
   - Optionally seed diagnostic/practice templates extracted from lesson plans.
2. Version manifest imports with hash + timestamp already captured in Convex for audit.
3. Validate ingestion with schema-aware checks (e.g., ensure lesson skill references exist, detect cycles).
4. Surface the ingested structures through `@monte/graph-service` so other services (engine, question, analytics) rely on one canonical API.

### 3.3 Learner Lifecycle
1. When a student signs in (post Better Auth migration):
   - Create `learners` record if absent.
   - Initialize `learnerSkillStates` for skills appearing in enrolled lessons’ prerequisite chain (sparse creation).
2. Support guardian/guide views by linking relationships from organization member metadata.
3. Enforce plan limits (seat counts, access tiers) before enabling personalized queue generation.

### 3.4 Lesson Authoring & Manipulative Tooling
1. Deliver a curriculum dashboard inside the editor that lists domains → units → topics → lessons using Convex data (no manual JSON edits).  
2. Integrate the new `@monte/lesson-service` so the editor and runtime share:
   - Procedural manipulative generators (golden beads, stamp game, colored bead stair, etc.).  
   - Segment templates for presentation/guided/practice flows with narration/caption scaffolds.  
   - Validation helpers covering timelines, inventory, narration assets, and pass criteria.  
3. Provide CRUD flows for curriculum primitives (create/update/reorder domains, units, topics, lessons) through Convex mutations exposed by `@monte/api`.  
4. Enable lesson preview mode that renders the exact runtime experience (including manipulatives and procedural question seeds) inside the editor.  
5. Seed an initial “static multiplication with golden beads” lesson authored entirely through the UI as an acceptance test for the pipeline.  
6. Expose canonical skill links and coverage indicators so authors understand prerequisites and question availability while editing.

### 3.5 Mastery Model MVP (Engine Service scope)
1. **Input**: Task outcome (correct, incorrect, partial), difficulty, time to complete.
2. **Update**: Bayesian-like update with logistic function; propagate partial credit up ancestor skills.
   - Example: `P_new = clamp(P_old + learningRate * (result - P_old))`.
   - Maintain uncertainty score for diagnostics (e.g., limited attempts -> high variance).
3. **Decay**: Apply forgetting curve daily via scheduled Convex cron job:
   - `P(t+Δ) = P * exp(-λ * Δ)` with skill-specific or global λ.
4. **States**: Flag skill as `learning`, `mastered`, or `review-needed` based on thresholds (e.g., 0.2 / 0.8).

### 3.6 Task Selection Engine (Engine Service scope)
1. Aggregate candidate tasks per learner:
   - **Unlockables**: Lessons whose prerequisites are mastered or near-threshold.
   - **Reviews**: Skills where `P < retentionThreshold`.
   - **Diagnostics**: High-uncertainty skills or newly added nodes.
2. Score tasks by expected value:
   - Combine mastery gain delta, time cost, and spacing urgency.
   - Add heuristics to mix representations (e.g., presentation vs practice).
3. Store top N tasks in `learnerQueues`; expose via API for frontend to display.
4. On task completion, pop from queue and refill by re-running the selector (event-driven mutation).

### 3.7 Question Service Integration
1. Store canonical question banks per skill (easy/medium/hard, tagged for presentation/guided/independent practice, drills, quizzes) in `@monte/question-service/questions`.
2. Build `QuestionService.generate` APIs to support contexts:
   - **Lessons**: return curated sets for each phase with difficulty mix controls.
   - **Drills**: supply rapid recall items pulled from skill banks, respecting `mentalMathEligible`.
   - **Quizzes**: construct mastery or fluency assessments with difficulty stratification.
3. Implement a feedback loop:
   - `QuestionService.logResult` captures `{ skillId, context, difficulty, correct, latencySec, hintUsed }`.
   - Use telemetry to retire weak prompts, promote high-performing templates, and seed new LLM-generated variants.
4. Self-improving workflow:
   - 80–90% of prompts come from the validated bank; 10–20% are fresh LLM generations evaluated via learner outcomes.
   - Add “I don’t know” / “request hint” signals to refine difficulty calibration.
5. Expose APIs for lesson editor to preview available questions per skill/phase.

### 3.8 Learning Engine ↔ Question Service Contract
1. When `engine-service` selects a task, it requests the appropriate question set:
   - Pass learner context (mastery snapshot, desired difficulty distribution) to `QuestionService`.
   - Receive question payloads plus metadata for analytics hooks.
2. After task completion, the engine:
   - Logs outcomes to `QuestionService.logResult`.
   - Updates mastery via section 3.5 and schedules follow-up reviews.
3. Document the contract in `packages/engine-service/README.md` with links to open-source TypeScript learning engines (FSRS repositories already listed; add additional references as discovered).

### 3.9 Frontend Integration
1. Replace local `ProgressProvider` storage with Convex-synced state:
   - Load queue, active tasks, XP, streak from backend queries.
   - Post task outcomes through new `logTaskCompletion` mutation which triggers mastery update pipeline.
2. Update home route to display:
   - Next task card (lesson/review/diagnostic) with context explanation.
   - XP/streak numbers from `xpLedger` aggregates.
   - Upcoming reviews timeline.
3. Lesson runtime:
   - Request scenario seeds and pass task attempt metadata back to backend.
   - Provide immediate feedback while awaiting server confirmation.
4. Editor:
   - Allow tagging segments/questions with underlying skills and difficulty.
   - Surface authoring status aligned with mastery data (e.g., show which lessons lack practice coverage).

### 3.10 Motivation Layer (Engine Service scope)
1. XP awards:
   - Base XP per task, bonus for perfect runs, scaled by difficulty/time.
   - Streak increments when learner completes ≥1 task per day.
2. Badges/Awards:
   - MVP: simple achievements (first lesson, 5-day streak, mastery of domain). Store server-side.
3. UI updates:
   - Dashboard to display streak, XP history, recently mastered skills.

### 3.11 Analytics & Observability
1. Log every mastery update and queue decision for audit/replay.
2. Add dashboards (start with Convex trace + simple admin table) to inspect learner skill trajectories.
3. Instrument frontend with event recorder (extend existing analytics scaffolding) to track time-on-task, hint usage, and “I don’t know” rates.
4. Feed Question Service telemetry back into content ops dashboards to guide bank tuning and LLM prompt regeneration.

---

## 4. Technical Execution Phases

### Phase A — Infrastructure Alignment
- Finish Better Auth org/admin migration (auth agent).  
- Define shared types for skills, mastery states, and learner queues in `@monte/types`.  
- Update `@monte/api` to expose new Convex queries/mutations.

### Phase B — Knowledge Graph, Lesson Service & Question Bank Foundations
- Implement Convex tables and ingestion script updates.  
- Run dry-run sync, validate counts (domains/units/topics/lessons/skills) against manifest.  
- Backfill existing content; confirm editor + runtime read the enriched data via `@monte/graph-service`.  
- Scaffold `@monte/lesson-service` with manipulative generators, segment templates, and validation helpers; publish its initial build pipeline.  
- Seed representative question banks for priority skills and expose them through `@monte/question-service`.  
- Stand up a shared OpenAI client wrapper (reading `OPENAI_API_KEY` from `.env.local` or Convex secrets) so audits/question generation share one integration path.  
- Double-check `.env`/`.env.local` entries are git-ignored and set the Convex secret via `npx convex env set OPENAI_API_KEY`.

### Phase C — Learner Model Foundation
- Create learner/mastery tables with indices for per-learner queries.  
- Ship initial mastery update mutation + decay cron.  
- Add `logTaskCompletion` to persist outcomes and XP ledger entries.

### Phase D — Task Selection & Question Service Integration
- Implement selector service (Convex mutation or scheduled function) to maintain `learnerQueues`.  
- Integrate question generation requests within task dispatch.  
- Add admin debugging view to inspect queues, selected questions, and mastery deltas per learner.

### Phase E — Runtime & UX Integration
- Replace local progress with backend state.  
- Wire lesson/practice components to submit outcomes and fetch fresh seeds.  
- Build dashboard widgets for XP, streaks, upcoming reviews.

### Phase F — QA & Iteration
- Author test learners, simulate various mastery paths, confirm queue coherence.  
- Validate spaced repetition by advancing time (cron or manual adjustments).  
- Measure latency and adjust caching (e.g., prefetch queue on sign-in).
- Establish the recurring GPT-5 Pro curriculum audit loop: export domain/unit/skill/question snapshots, prompt in manageable batches, capture feedback artifacts, and track remediation status before re-running audits.
- Run end-to-end authoring acceptance tests (create → preview → publish the golden bead multiplication lesson) to ensure UI-only workflows function without code edits.

---

## 5. Dependencies & Coordination

| Dependency | Notes |
| --- | --- |
| Auth/org agent | Must finalize Better Auth tables, active org handling, plan tiers, and impersonation guardrails. |
| Curriculum agent | Needs to annotate lessons with skills, maintain manifest accuracy, and support editor UI for skill tagging. |
| Graph service agent | Owns canonical + learner graph ingestion and APIs consumed by engine/question services. |
| Question service agent | Seeds question banks, builds generator APIs, and closes the telemetry loop for self-improving banks. |
| Technical debt cleanup | Ensure schema migrations, linting, and build scripts stay compatible; coordinate on Convex schema changes. |
| AI integration stream | Maintains OpenAI key management, shared SDK wrapper, GPT audit workflows, and question-bank generation scripts. |

---

## 6. Risks & Mitigations

- **Data Synchronization Drift**: If curriculum manifest and Convex diverge, personalization breaks.  
  _Mitigation_: `check-codegen` style script for manifest vs Convex diff; enforce CI gate.

- **Mastery Model Accuracy**: Simplistic updates may misrepresent readiness.  
  _Mitigation_: Start with conservative thresholds; log outcomes for tuning; plan iteration once MVP stable.

- **Performance**: Task selection and question sampling might be expensive for large skill graphs/question banks.  
  _Mitigation_: Cache prerequisite closures per skill, batch queries, limit queue size, and precompute question rotations.

- **Auth Coupling**: Personalized data depends on org membership; delays in auth migration stall MVP.  
  _Mitigation_: Align schedules, define feature flags to run personalization in dev/staging once auth ready.

- **Content Coverage**: Authoring backlog may leave lessons without practice templates.  
  _Mitigation_: Prioritize high-leverage units; allow fallback practice question generators until authored content arrives.

---

## 7. Success Metrics (MVP)

- 100% of student users launch to a personalized queue instead of static unit list.  
- At least one complete loop of: lesson assigned → practice attempts → mastery probability change → review scheduled.  
- XP/streak data persists across sessions and reflects task completion timestamps.  
- Editor users can tag skills and see updated coverage reports.  
- Admin/debug tools reveal learner mastery snapshots, queue contents, and question bank effectiveness stats (hit rates, hint usage).

---

## 8. Post-MVP Enhancements

- Swap heuristic mastery updates for full Bayesian/IRT model with parameter estimation.  
- Introduce adaptive diagnostics that jump across the graph to reduce uncertainty.  
- Expand motivation system with badges, challenge problems, and social feedback.  
- Support multi-domain scheduling (e.g., interleave measurement/fractions practice).  
- Integrate audio narration and AI tutoring for guided steps.  
- Roll out guardian dashboards using learner mastery data.  
- Instrument A/B testing to tune task selection weights and reward schemes.

---

## 9. Immediate Next Actions

1. Schedule joint design review between auth, curriculum, graph, question, and engine agents to freeze shared data contracts.  
2. Prototype Convex schema changes for skills/learners/questions and circulate for review.  
3. Extend `@monte/types` plus `@monte/api` with new definitions so frontend/editor can compile once backend lands.  
4. Stand up seed scripts that import sample learners, question banks, and starter lessons from `@monte/lesson-service`, then simulate task completions for testing the mastery + telemetry pipeline.  
5. Draft acceptance tests covering queue generation, mastery updates, XP accumulation, question feedback logging, and editor-driven lesson authoring/publishing flows.

---

By following this plan, we can deliver a Math Academy–inspired MVP that unites our existing tooling into a coherent personalized learning experience while leaving room for iterative sophistication.***
