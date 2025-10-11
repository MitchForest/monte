# Monte Fluency & Mastery Program Specs

This document extends the curriculum blueprint with explicit guidance for mental-math fluency drills, mastery quizzes, and question generation seeds. It is the source of truth for the new JSON artifacts that support adaptive scheduling and LLM-backed item generation.

---

## 1. Guiding Objectives
- **Keep lessons conceptual:** Every skill is introduced and developed through CRA-aligned lessons. Fluency work exists to automate recall and reduce cognitive load, not to replace instruction.
- **Build automaticity on high-leverage facts:** Archimedes mental-math expectations inform which skills become fluency targets (successor/predecessor, make-ten, fact families, multiplication/division facts, power-of-ten adjustments).
- **Protect learner time:** Each 25-minute session should surface one frontier lesson plus either a drill or a mastery quiz. When time allows, two lessons can run back-to-back.
- **Adapt to mastery probability:** The scheduler favors 80 % tasks that reinforce known material and 20 % stretch tasks that extend the frontier.
- **Continuously improve item quality:** Every skill/difficulty combination exposes a canonical example that seeds question generation and powers analytics on latency and accuracy.

---

## 2. Task Types within a Session

| Task Type | Duration Target | Primary Purpose | Trigger Highlights |
| --- | --- | --- | --- |
| **Lesson** | 12–14 min | CRA instruction, strategy development, manipulative work | Always first unless the learner is in a review-only block. |
| **Fluency Drill** | 5–6 min | Timed recall of facts/mental strategies | Scheduled when a fluency skill drops below mastery, ages out of its interval, or a new related lesson closes. |
| **Mastery Quiz** | 5–7 min | Mixed retrieval to confirm durable understanding | Scheduled when a topic/unit hits proficiency or when spaced repetition predicts risk of forgetting. |

The scheduler always attempts `lesson + (drill or quiz)`. If time remains, a bonus lesson may run; if time is tight, it truncates the second task but still logs progress.

---

## 3. Fluency Drill Design

### 3.1 Skill Eligibility
- Fluency candidates are skills tagged with `fluency: true` in their metadata (initial set listed in `fluency-drills.json`).
- Skills must already have lesson coverage and clear mastery criteria; drills never introduce new content.

### 3.2 Two-Phase Structure
Each drill run uses two rapid phases:
1. **Focus Burst (≈60–90 s):** Items draw exclusively from the target skill(s) tied to the most recent lesson or the largest deficit.
2. **Spiral Burst (≈60–90 s):** Items interleave previously mastered fluency skills that still require maintenance (determined by spaced repetition intervals).

### 3.3 Difficulty Adaptation
- Every skill exposes `easy`, `medium`, and `hard` exemplar prompts (see Section 5). Item generators sample 80 % from the learner’s current mastery tier and 20 % from the next tier.
- Latency and accuracy thresholds define success. For example, a drill completes when the learner answers ≥12 items with ≥90 % accuracy and median response time under target (per skill).

### 3.4 Scheduling Logic
- **Trigger after lesson close:** When a lesson tied to a fluency skill reaches proficiency, enqueue a drill within the next session.
- **Spaced recurrence:** Each fluency skill has an expanding interval (`initialDays`, `growthFactor`) so automaticity decays gracefully.
- **Adaptive substitutions:** If a learner is overdue for both a drill and a quiz, the system picks the higher-priority item (see Section 4.3).

Detailed configuration lives in `fluency-drills.json`.

---

## 4. Mastery Quiz Design

### 4.1 Quiz Types
- **Topic Checks:** Short, 5-item quizzes focused on a single topic’s skill cluster to confirm readiness for the next topic.
- **Unit Syntheses:** 8–10 item mixes sampling from current and previous topics within a unit.
- **Spiral Reviews:** 8–10 item mixes prioritizing skills at risk of forgetting based on spaced repetition signals.

### 4.2 Item Blueprints
- 60 % items from the currently targeted scope; 40 % spiral from prerequisite and sibling topics.
- Include at least one conceptual, one application, and optionally one mental-math prompt (pulling from the same question seeds to ensure consistency).
- Feedback mirrors lesson strategies; wrong answers flag specific remediation steps (e.g., re-queue a lesson, schedule an additional drill).

### 4.3 Scheduling Logic
- Fire a Topic Check after all lessons in the topic report ≥0.8 mastery probability.
- Fire a Unit Synthesis when ≥75 % of the unit’s topics have passed their checks.
- Spiral Reviews run according to spaced intervals (initial 4 days, growth factor 1.6) or when analytics predict regression.

Detailed cadence and composition are defined in `mastery-quizzes.json`.

---

## 5. Question Seed Specification

To bootstrap LLM-backed generation and maintain a reference bank:

```json
{
  "skillId": "skill.addition-fact-drills.fluent-addition-10",
  "difficulty": "easy",
  "prompt": "What is 3 + 4?",
  "answer": 7,
  "strategyNote": "Encourage counting on from 4 using mental images of a ten-frame."
}
```

- Every fluency skill must have at least one seed per difficulty.
- Lessons and quizzes can also reference these seeds when they need quick mental-math checks.
- `fluency-question-seeds.json` provides the initial library for the prioritized fluency skills; additional skills should extend this file as they join the fluency program.
- Delivery services record latency, accuracy, and source (`seed` vs. `generated`) to continually retrain the generator and retire underperforming items.

---

## 6. Data Artifacts

| File | Purpose |
| --- | --- |
| `fluency-drills.json` | Defines each drill (scope, cadence, thresholds, phase composition). |
| `mastery-quizzes.json` | Defines quiz blueprints (type, scope, cadence, item mix). |
| `fluency-question-seeds.json` | Catalogues exemplar questions for fluency skills across difficulty tiers. |

All files live in `packages/curriculum-service/content` and mirror the curriculum IDs already in `topics.json` and the domain graph.

---

## 7. Implementation Checklist
1. Add `fluency: true` (or equivalent tagging) to relevant skill metadata.
2. Backfill question seeds for the remaining fluency skills beyond the starter set in `fluency-question-seeds.json`.
3. Update the scheduler to consume the new JSON specs and honor the two-task session target.
4. Instrument latency/accuracy logging with source attribution to drive the feedback loop.
5. Validate that drill/quiz cadence keeps average session length within 25 minutes via pilot telemetry.

---

By codifying fluency drills, mastery quizzes, and question seeds in parallel, Monte can stay faithful to its Montessori-inspired, mastery-first vision while ensuring the Archimedes mental-math expectations are met through adaptive practice.
