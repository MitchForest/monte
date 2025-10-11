# Question Service

This package centralizes every prompt we surface across Monte’s learning stack. Lessons, assessments, and the new mental‑math drills all pull from the same question generator so that we stay consistent with the knowledge graph, the student model, and the task-selection research captured in `.docs/reference/MA-research.md`.

## Why a dedicated service?

- **Single source of truth.** Skill definitions remain lean (we only add a `mentalMathEligible` boolean when a skill needs rapid recall work). All other metadata that lessons, drills, or quizzes require lives here.
- **MA-aligned architecture.** Math Academy’s model separates the knowledge graph, learning engine, and task selection. Mirroring that separation with service packages (`question-service`, `curriculum-service`, `graph-service`, `engine-service`) keeps us ready for individualized spacing, diagnostics, and future graph-driven scheduling.
- **Feedback loop.** By routing every prompt through one service we can log accuracy/latency, retire weak questions, and request new ones without touching the curriculum schema.

## Responsibilities & status

| Context        | Entry point                                    | Notes                                                                                 | Status            |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------- |
| **Lessons**    | `generate({ skillIds, context: 'lesson', phase })`       | Returns presentation / guided / independent practice items keyed by skill + phase.   | Supported (needs bank content) |
| **Drills**     | `generate({ skillIds, context: 'drill', mode: 'mental-math' })`  | Emits rapid mental-math items. Ignores manipulatives; only skills with `mentalMathEligible` will request these. | Supported (requires question banks) |
| **Quizzes**    | `generate({ skillIds, context: 'quiz', mode })`           | Builds mastery or fluency checks, selecting difficulty mixes and timing constraints. | Supported (requires bank content) |

Internally, the service now:

1. Reads canonical question banks from `questions/<skillId>.json`. Each file can expose sections for lessons, drills, and quizzes.
2. Dedupes items across skills and supports optional shuffle/limit controls.
3. Exposes a stubbed `logResult` hook for accuracy/latency telemetry (to be wired to persistence/analytics).

## Package layout

```
packages/question-service/
  ├── package.json          # pnpm workspace package manifest
  ├── README.md             # (this file) design doc
  ├── src/
  │   └── index.ts          # QuestionService API surface (stub for now)
  ├── questions/
  │   └── skill.sample.json # Example question bank structure (placeholder)
  └── tsconfig.json
```

We intentionally start with stubs so other teams can integrate step by step:

1. **Tag skills** – add `mentalMathEligible: true` (and nothing else) to skills that require memorization or rapid mental operations.
2. **Seed question banks** – author concise drill items (no manipulatives) in `questions/<skillId>.json` (file name must match the exact skill id). Lessons and quizzes can reuse existing canonical items until the generator matures.
3. **Integrate** – lesson planner, drill queue, and quiz builder import `QuestionService` to request items; results feed back into the service’s logging hook.
4. **Evolve** – analytics code consumes the logs to retire weak items, auto-generate new variants, or prompt content authors for new seeds.

## Next steps

- Flesh out `src/index.ts` so each context pulls the right buckets:
  - Lessons: honor the `phase` argument and return the relevant `presentation` / `guided` / `independent` cards.
  - Drills: return only `drill.mentalMath` items and require that each skill has `mentalMathEligible: true`.
  - Quizzes: allow callers to request `mode: 'mastery' | 'fluency'` so we can mix speed checks and mastery checks.
- Emit structured telemetry (`{ skillId, context, difficulty, correct, latencySec }`) so analytics and content ops can prune weak prompts or request new ones.
- Build simple rotation heuristics (sampling, spiral with mastered skills) on top of the raw question banks.
- Integrate with `curriculum-service` (lesson orchestration) and the future `engine-service` (task selection + spaced repetition) so the Question Service stays purely concerned with content generation.
