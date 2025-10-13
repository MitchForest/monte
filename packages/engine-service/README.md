# Engine Service

The engine service will orchestrate personalized learning for Monte. It consumes:

- **Graph Service** – to understand the canonical knowledge graph and each learner’s mastery/fluency overlay.
- **Question Service** – to populate lessons, drills, and quizzes with concrete prompts.
- **Curriculum Service** – to map graph nodes back to authored lessons and unit structure.

## Responsibilities (planned)

| Task                                   | Description                                                                                   | Status  |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | ------- |
| Task selection                         | Given a student state, choose the next best activity (lesson, drill, quiz, review, diagnostic). | Prototype returning status-rich results (disabled/no-graph/no-questions/success). |
| Spaced repetition & retention tracking | Maintain scheduling signals (e.g., forgetting curves, streaks) that feed into task ranking.   | Future work (will leverage FSRS libraries). |
| Progress gating                        | Ensure prerequisites are satisfied and lessons unlock in a coherent order.                    | Future |
| Feedback ingestion                     | Record outcomes from every question/task so the student model stays up to date.               | Future |

## Roadmap

1. **Student state ingestion** – define a lightweight schema for mastery, fluency, and review status (sourced from graph-service).
2. **Task ranking prototype** – start with simple heuristics (e.g., unfinished lessons first, then mental-math drills for newly completed skills).
3. **Integration with question-service** – whenever a task is selected, call the Question Service to populate the actual question set.
4. **Persistence + telemetry** – log task outcomes to feed the student model, spaced repetition, and analytics dashboards.
5. **Advanced scheduling & spaced repetition** – iterate toward Math Academy-style decision layers (expected value, memory decay, diagnostics) using open-source FSRS tooling: [open-spaced-repetition](https://github.com/open-spaced-repetition), [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs), [fsrs-browser](https://github.com/open-spaced-repetition/fsrs-browser).
