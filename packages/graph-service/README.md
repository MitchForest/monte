# Graph Service

This package will own every representation of the Monte knowledge graph. It exposes read APIs for:

- **Canonical graph** – the curated prerequisite network defined in `@monte/curriculum-service`. Each node mirrors a skill (`CurriculumSkill`) plus edges (prerequisites, dependents, enrichment links, etc.).
- **Student graph** – learner-specific overlays that store mastery, fluency, retention, review schedules, and any extra metadata the learning engine needs.

## Responsibilities (current + roadmap)

| Concern                | Description                                                                                     | Status  |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------- |
| Graph ingestion        | Load skills, edges, and metadata from curriculum content (or future graph authoring tools).     | TODO – stub API returns an empty graph today. |
| Student overlays       | Persist per-student mastery/fluency states and expose fast lookups for engine-service.          | TODO |
| Consistency checks     | Detect cycles, missing nodes, and other issues when the canonical graph is updated.             | Future |
| Audit & analytics      | Provide snapshots / diffs so we can compare graph revisions over time.                          | Future |

The goal is to keep this package purely about graph state so downstream services (question generation, learning engine, analytics) can rely on a single source of truth.

## Roadmap

1. **Wire in curriculum data** – consume the skill/edge files from `@monte/curriculum-service` and expose the canonical graph via `getCanonicalGraph()`.
2. **Student graph store** – define a lightweight persistence layer (Convex tables or similar) for mastery, fluency, and review timestamps.
3. **API surface** – add helpers such as `getPrerequisites(skillId)`, `getDependents(skillId)`, `getStudentReadiness(studentId, skillId)`.
4. **Validation tooling** – run integrity checks whenever graph content changes and surface warnings to the authoring pipeline.
