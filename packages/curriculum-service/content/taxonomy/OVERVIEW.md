# Curriculum Skill Graph

Generated from `.docs/scraping/k-2.md` and `.docs/scraping/2-5.md` using `scripts/generateSkillGraph.mjs`.

## Files

- `skills.json` – array of canonical mastery atoms.
- `relationships.json` – prerequisite edges between atoms.

## Skill Node Schema

```json
{
  "id": "skill.add-3-or-more-decimals",
  "title": "Add 3 or more decimals",
  "description": "Add 3 or more decimals",
  "verb": "add",
  "focus": "3 or more decimals",
  "range": null,
  "representations": ["ten-frame", "objects"],
  "contexts": ["word-problem"],
  "operation": "addition",
  "gradeSpans": ["K-2", "2-5"],
  "domains": ["Numerical Representations and Relationships"],
  "strands": ["Whole Numbers in the Place Value System"],
  "clusters": ["Numbers up to 20"],
  "unitId": "addition",
  "unitName": "Addition",
  "ritBands": [
    { "label": "146–158", "min": 146, "max": 158, "sourceId": "k-2" }
  ],
  "ritAnchor": 146,
  "ritStretch": 158,
  "sources": [
    { "sourceId": "k-2", "gradeSpan": "K-2", "ritLabel": "146–158" }
  ]
}
```

- `verb` is normalized to a base action; if no verb was evident the script falls back to `explore`/`classify`.
- `focus` captures the remaining skill phrase (range stripped where possible).
- `range` is present when a numeric limit was detected (`null` otherwise).
- `representations` and `contexts` are inferred keyword tags for downstream filtering.
- `ritBands` keeps every band the skill appears in; `ritAnchor`/`ritStretch` summarize the lower and upper RIT bounds.

## Relationship Schema

```json
{
  "id": "prereq-skill.count-dots-to-10-skill.count-dots-to-20",
  "type": "prerequisite",
  "from": "skill.count-dots-to-10",
  "to": "skill.count-dots-to-20",
  "rationale": "Progression within \"count dots\""
}
```

Edges are auto-generated in four passes:
- Descriptor progression (same raw skill phrasing, increasing range/RIT)
- Cluster progression (same curriculum cluster, ordered by difficulty)
- Unit sequencing with backfill to guarantee each non-root node has at least one incoming edge.
- Cross-unit bridges for high-rigor orphan nodes (operations-compatible feeders from earlier units). When a bridge would eliminate the only entry point for a unit, it is skipped so every unit retains an explicit root skill.

Additional classification heuristics ensure verbs/contexts steer skills into the intended unit (e.g., addition/multiplication verbs, money/time contexts, geometry shape vocabulary, counting cues for number sense). Measurement and Data is reserved for skills with explicit measurement/time/money signals or data-analysis domains, preventing generic shape language from drifting out of Geometry.

## Regeneration

```bash
pnpm --filter @monte/frontend typecheck # optional
node scripts/generateSkillGraph.mjs
```

The script can be adjusted to add crosswalks or new transforms; rerun it to refresh the JSON outputs.
