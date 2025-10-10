# Monte Math Curriculum Blueprint

## 1. Vision & Guiding Principles
- **Mastery growth over grade level**: Track learner progress by MAP RIT score and skill mastery probabilities instead of grade labels. Support domain-specific acceleration (e.g., advanced geometry while reinforcing foundational operations).
- **Concrete → representational → abstract**: Sequence every new concept through Montessori-inspired manipulatives (golden beads, stamp game, bead frames, fraction insets, geometry insets) and other concrete models before symbolic work.
- **Atomic skills & standards alignment**: Organize instruction around granular skills mapped to CCSS clusters and sub-standards. Skills remain reusable across lessons and practice contexts.
- **Adaptive practice with spaced repetition**: Blend frontier learning, placement checks, and review using a skill-based scheduler that respects forgetting curves.
- **Strategy transparency & control of error**: Presentation, Guided Practice, and Independent Practice phases surface explicit strategies (make-ten, exchange, distributive reasoning) and provide immediate, non-punitive feedback.
- **Educator visibility**: Roll up mastery data by domain, unit, CCSS strand, and RIT band to inform intervention and celebrate growth.

## 2. Curriculum Primitives
| Primitive | Purpose | Key Attributes |
| --- | --- | --- |
| **Domain** | Top-level strand for reporting/navigation (Number Sense & Place Value, Operations & Algebraic Thinking, Fractions & Rational Numbers, Measurement & Data, Geometry & Spatial Reasoning, Patterns & Algebraic Thinking). | Name, description, CCSS clusters, MAP goal bands, canonical order. |
| **Unit** | Coherent progression within a domain (e.g., “Foundations of Counting,” “Multiplication Foundations”). | Domain, target RIT range(s), key CCSS codes, capstone assessment. |
| **Topic** | Ordered playlist of one or more lessons advancing a specific objective (e.g., “Counting to 10,” “Static Multiplication,” “Scaled Bar Graphs”). | Unit, driving skill list, lesson order, unlock prerequisites. |
| **Lesson** | Presentation → Guided → Independent experience targeting 1–3 skills with concrete-to-abstract representations. | Linked skills, activity shells and parameters, manipulative sequence, formative checks, mastery criteria, recommended duration. |
| **Skill** | Smallest assessable competency (e.g., `Count Objects ≤10`, `Static Multiplication (No Regroup)`, `Locate Unit Fractions`, `Interpret Scaled Bar Graphs`). | Domain, difficulty tier, MAP RIT band(s), CCSS tags, knowledge-graph edges, mastery thresholds, spacing settings. |
| **Skill Variant** | Optional lens on how a skill manifests (Concrete/Bridging/Abstract, context tags like money/time). | Skill id, representation tag(s), manipulative template reference, notes on fade-out rules. |
| **Manipulative Template** | Defines affordances and controls of error for each tool or representation. | Supported skills, presentation cues, scaffolding toggles, phased fade-out logic. |
| **Activity Shell** | Reusable interaction pattern for lessons and practice (Ten-Frame Lab, Operation Machine, Checkerboard Simulator, Tempo Drill, Review Mix, Number Line Runner, Shape Studio). | Supported representations, input parameters, telemetry hooks, feedback modes. |
| **Assessment** | Diagnostics, mastery checks, capstones, mixed reviews mapped to skills. | Item bank refs, difficulty calibration, timing, scoring, progression outcome. |
| **Skill Edge** | Directed relationship in the knowledge graph (prerequisites, strategy dependencies, representation bridges, enrichment). | Parent skill, child skill, edge type, rationale, unlock behavior, implicit credit weight. |

## 3. Domain → Unit → Topic Scaffold
The scaffold below draws from Montessori sequences (`.docs/reference/montessori.md`), MAP RIT band breakdowns (`k-2.md`, `2-5.md`), and CCSS mappings (`skill-to-CCSS.md`, `standards.md`). Topics list representative skill goals; detailed skill clusters appear in Section 4.

### Domain: Number Sense & Place Value
- **Unit: Foundations of Counting** (RIT <145; CCSS K.CC.A-B, K.OA.A)  
  - Topics: Counting within 5, Counting within 10 (scattered/structured), Compare quantities by matching, One more/one less, Count stories within 5, Count to 20 and by tens to 100.
- **Unit: Teen Numbers & 20s** (RIT 146–158; CCSS K.NBT.A, K.OA.A)  
  - Topics: Compose/decompose teen numbers, Represent numbers to 20 (words, numerals, models), Compare numbers to 20, Make-ten combinations, Subtraction within 10.
- **Unit: Place Value to 120** (RIT 159–175; CCSS 1.NBT.A-C, 2.NBT.A)  
  - Topics: Tens/ones composition, Ten more/less, Expanded form to 120, Hundred chart navigation, Skip-count by 2/5/10, Add multiple two-digit numbers.
- **Unit: Introduction to the Decimal System** (RIT 168–185; CCSS 2.NBT.A, 3.NBT.A)  
  - Topics: Compose/decompose thousands, Read/write 4-digit numbers, Thousand-chart navigation, Estimate on number lines.
- **Unit: Place Value to 1000** (RIT 176–200; CCSS 2.NBT.B, 3.NBT.A)  
  - Topics: Read/write 3-digit numbers, Compare and order to 1000, Rounding to nearest 10/100, Compose/decompose hundreds, Place value word problems, Dynamic addition within 1000, Dynamic subtraction within 1000.
- **Unit: Number Lines & Estimation** (RIT 170–200; CCSS 2.MD.B, 3.NBT.A)  
  - Topics: Locate numbers on number lines, Estimate sums/differences, Round on number lines, Skip count on number lines.
- **Unit: Decimals & Structure of Base-10** (RIT 196–205; CCSS 4.NBT.A, 4.NF.C)  
  - Topics: Tenths and hundredths models, Read/write decimals, Compare decimals, Relate fractions and decimals, Scale base-ten understanding to metric measurement.

### Domain: Operations & Algebraic Thinking
- **Unit: Addition Foundations** (RIT 150–182; CCSS K.OA.A, 1.OA.C, 2.OA.B)  
  - Topics: Counting-on addition, Make-ten bridge, Doubles/near doubles, Fact families within 20, Dynamic addition within 100.
- **Unit: Subtraction Foundations** (RIT 150–178; CCSS K.OA.A, 1.OA.B, 2.OA.B)  
  - Topics: Take-away models, Count back/count up, Subtraction fact families, Dynamic subtraction.
- **Unit: Addition & Subtraction Memorization** (RIT 160–182; CCSS 1.OA.C.6, 2.OA.B.2)  
  - Topics: Addition fact drills, Subtraction fact drills, Even and odd numbers, Make-ten fluency, Facts within 20 applications.
- **Unit: Multiplication Foundations** (RIT 176–200; CCSS 2.OA.C, 3.OA.A-B, 3.NBT.A.3)  
  - Topics: Equal groups and arrays, Static multiplication, Division as sharing, Skip counting for multiplication facts, Multiply by multiples of 10.
- **Unit: Division Foundations** (RIT 176–190; CCSS 3.OA.A-B)  
  - Topics: Division as sharing, Division as grouping, Relate division and multiplication, Division word problems.
- **Unit: Multiplication & Division Memorization** (RIT 180–198; CCSS 3.OA.B-C)  
  - Topics: Multiplication fact strategies, Division fact strategies, Multiplication & division fact families, Mixed fact drills.
- **Unit: Multiplication & Division Mastery** (RIT 191–205; CCSS 3.OA.C-D, 4.NBT.B)  
  - Topics: Dynamic multiplication (regrouping), Long division, Distributive and associative strategies, Multi-step word problems.
- **Unit: Operations Word Problems** (RIT 165–195; CCSS 1.OA.A, 2.OA.A, 3.OA.D)  
  - Topics: Additive word problems, Comparison word problems, Equal groups word problems, Two-step word problems.
- **Unit: Expressions & Early Algebra** (RIT 200–210; CCSS 4.OA.B-C, 5.OA.A-B)  
  - Topics: Factors and multiples, Patterns and rules, Numerical expressions, Intro equations and inequalities.

### Domain: Fractions & Rational Numbers
- **Unit: Fraction Foundations** (RIT 175–195; CCSS 3.NF.A-B)  
  - Topics: Partition shapes into equal parts, Unit fractions on number lines, Fractions of sets, Compare unit fractions.
- **Unit: Fraction Equivalence & Ordering** (RIT 195–205; CCSS 3.NF.A, 4.NF.A)  
  - Topics: Generate equivalent fractions, Compare fractions with unlike denominators, Benchmark fractions (1/2, 1/4, 3/4), Mixed numbers on number lines.
- **Unit: Fraction & Decimal Operations** (RIT 205–215; CCSS 4.NF.B-C, 5.NF.A-B)  
  - Topics: Add/subtract fractions with like denominators, Multiply fractions by whole numbers, Convert fractions and decimals, Add/subtract decimals to hundredths.

### Domain: Measurement & Data
- **Unit: Measurement Foundations** (RIT 150–175; CCSS K.MD, 1.MD.A-B)  
  - Topics: Compare length/weight/capacity with non-standard units, Choose appropriate tools, Order objects by attribute.
- **Unit: Length in Standard Units** (RIT 170–188; CCSS 2.MD.A-B, 2.MD.D)  
  - Topics: Measure lengths with rulers, Add and subtract lengths, Generate measurement data and line plots.
- **Unit: Time & Money** (RIT 160–195; CCSS 1.MD.B, 2.MD.C, 3.MD.A)  
  - Topics: Tell time to hour/half-hour/quarter-hour, Count coins (pennies → quarters), Make given amounts, Tell time to the nearest five minutes, Elapsed time to the minute, Time and money word problems.
- **Unit: Mass & Liquid Volume** (RIT 188–200; CCSS 3.MD.A)  
  - Topics: Measure and estimate mass in grams/kilograms, Measure and estimate liquid volume in liters, Solve one-step problems with mass and volume.
- **Unit: Data Displays** (RIT 165–200; CCSS 1.MD.C, 2.MD.D, 3.MD.B)  
  - Topics: Tally charts and tables, Picture graphs, Scaled bar graphs, Line plots with whole numbers, Interpret data to solve problems.
- **Unit: Measurement & Data Extensions** (RIT 200–210; CCSS 4.MD.A-C, 5.MD.A-C)  
  - Topics: Area and perimeter of rectangles, Volume of rectangular prisms, Line plots with fractions, Coordinate plane graphing, Intro to data variability.

### Domain: Geometry & Spatial Reasoning
- **Unit: Shape Foundations** (RIT 150–170; CCSS K.G.A-B, 1.G.A)  
  - Topics: Identify 2D/3D shapes, Describe positions, Compose/decompose shapes, Classify shapes by attributes.
- **Unit: Plane Geometry** (RIT 170–200; CCSS 2.G.A, 3.G.A, 4.G.A)  
  - Topics: Partition shapes into equal parts, Tile rectangles with rows and columns, Lines and angles, Types of triangles and quadrilaterals, Symmetry.
- **Unit: Measurement Geometry** (RIT 185–205; CCSS 3.MD.C, 4.MD.C, 5.MD.C)  
  - Topics: Area of rectangles/triangles, Surface area with nets, Volume concepts, Coordinate plane polygons.
- **Unit: Spatial Reasoning Extensions** (RIT 205–215; CCSS 5.G.A-B)  
  - Topics: Graph points in the coordinate plane, Classify 2D figures in hierarchies, Analyze transformations informally.

### Domain: Patterns & Algebraic Thinking
- **Unit: Early Patterns** (RIT 150–170; CCSS K.OA.A, 1.OA.B)  
  - Topics: Repeating and growing patterns, Unknown-addend problems, Balance contexts.
- **Unit: Multi-Step Thinking** (RIT 180–200; CCSS 3.OA.D, 4.OA.A)  
  - Topics: Multi-step word problems, Input-output tables, Pattern rules with arithmetic structure.
- **Unit: Pre-Algebra Foundations** (RIT 200–215; CCSS 5.OA.A-B, 6.EE.A)  
  - Topics: Evaluate numerical expressions, Write equations with variables, Coordinate relationships, Intro inequalities.

## 4. Representative Skill Clusters by Topic
The following table samples key skills per topic using naming aligned with IXL-style grain size (`.docs/reference/k-2.md`, `.docs/reference/2-5.md`) and CCSS codes.

| Topic | Representative Skills | CCSS Anchor(s) | RIT Band |
| --- | --- | --- | --- |
| Counting within 5 | Count dots ≤5, Match numbers to sets, Say the next number (≤5) | K.CC.A.1-3, K.CC.B.4 | <145 |
| Counting within 10 | Count scattered objects, Fill ten frames, Identify numerals to 10 | K.CC.A.1-3 | <145 |
| Count to 20 and by tens | Count forward from any number to 20, Skip-count by tens to 100, Use hundred charts | K.CC.A.1-2 | 138–152 |
| Compare quantities by matching | Match sets, Identify more/less/same (≤10), Relate to numerals | K.CC.C.6-7 | <145 |
| Compose teen numbers | Build 10+ones with manipulatives, Represent teen numbers in words, Match models to equations | K.NBT.A.1 | 146–158 |
| Make-ten combinations | Complete tens on frames, Decompose numbers to make 10, Apply make-ten in addition within 20 | 1.OA.C.6 | 150–170 |
| Counting-on addition | Add within 20 using counting-on strategies with counters, number lines, and mental steps | 1.OA.C.5 | 150–170 |
| Take-away models | Remove objects, draw subtraction stories, and record equations within 20 | 1.OA.A.1 | 150–170 |
| Ten more/less | Find 10 more/less without counting, Use hundred chart jumps, Explain place-value change | 1.NBT.C.5 | 159–175 |
| Add multiple two-digit numbers | Add three or four two-digit numbers using place-value and regrouping | 2.NBT.B.6 | 170–188 |
| Dynamic addition within 100 | Add two-digit numbers with regrouping using place-value models and number lines | 2.NBT.B.5 | 165–182 |
| Dynamic subtraction within 100 | Subtract two-digit numbers with regrouping using models and open number lines | 2.NBT.B.7 | 165–182 |
| Dynamic addition within 1000 | Add three-digit numbers with regrouping across hundreds and tens | 3.NBT.A.2 | 185–200 |
| Dynamic subtraction within 1000 | Subtract three-digit numbers with regrouping across hundreds and tens | 3.NBT.A.2 | 185–200 |
| Addition fact drills | Build fluency with optimized sequences, timed sets, and make-ten reinforcements | 1.OA.C.6 | 160–182 |
| Even and odd numbers | Determine evenness via pairing, arrays, and skip-count patterns | 2.OA.C.3 | 168–182 |
| Static multiplication | Build equal groups concretely, Map groups to repeated addition, Translate to array diagrams | 3.OA.A.1 | 176–190 |
| Division as sharing | Partition objects equally, Interpret remainders concretely, Represent with division statements | 3.OA.A.2 | 176–190 |
| Multiplication fact strategies | Use doubles, fives, and pattern reasoning to internalize multiplication facts | 3.OA.B.5 | 180–198 |
| Multiply by multiples of 10 | Multiply a one-digit factor by 10–90 using place-value reasoning | 3.NBT.A.3 | 190–200 |
| Dynamic multiplication | Exchange tens/hundreds during multiplication, Use bead frames/algorithms, Solve multi-digit products | 4.NBT.B.5 | 191–205 |
| Long division | Model division with racks & tubes, Transition to abstract algorithm, Interpret quotients and remainders | 4.NBT.B.6 | 195–210 |
| Partition shapes | Split shapes into halves/thirds/fourths, Label unit fractions, Match partitions to area models | 3.G.A.2, 3.NF.A.1 | 175–190 |
| Equivalent fractions | Generate equivalents with fraction strips, Place equivalents on number lines, Compare using common denominators | 3.NF.A.3, 4.NF.A.1 | 190–205 |
| Measure lengths with rulers | Measure and estimate in inches/centimeters to nearest whole unit | 2.MD.A.1-3 | 170–185 |
| Add and subtract lengths | Solve length word problems using drawings, number lines, and equations | 2.MD.B.5-6 | 172–188 |
| Tell time to five minutes | Read analog clocks to five minutes and identify a.m./p.m. contexts | 2.MD.C.7 | 172–188 |
| Elapsed time to the minute | Use open number lines to find start, end, or elapsed time to the minute | 3.MD.A.1 | 185–200 |
| Mass and liquid volume | Measure/estimate grams, kilograms, and liters; solve one-step problems | 3.MD.A.2 | 188–200 |
| Picture/bar graphs | Create picture graphs, Interpret scaled bar graphs, Solve word problems from data | 2.MD.D.10, 3.MD.B.3 | 170–195 |
| Line plots (fractions) | Create line plots with unit fractions, Interpret data, Solve measurement problems | 4.MD.B.4, 5.MD.B.2 | 200–210 |
| Area & perimeter | Find area/perimeter of rectangles, Apply to composite figures, Use multiplication connection | 3.MD.C.7, 4.MD.A.3 | 185–205 |
| Coordinate plane | Plot ordered pairs, Describe patterns, Interpret graph relationships | 5.G.A.1-2 | 205–215 |
| Tile rectangles with rows and columns | Partition rectangles into equal rows/columns and link to repeated addition | 2.G.A.2 | 172–185 |
| Patterns & rules | Extend growing patterns, Identify rule from table, Express rule with expressions | 4.OA.C.5, 5.OA.B.3 | 185–205 |
| Additive word problems | Solve join/separate/comparison contexts with equations and models | 1.OA.A.1, 2.OA.A.1 | 155–185 |

Topics not listed inherit skill granularity from the same references; each topic will map to 5–12 skill statements before lesson authoring.

## 5. Knowledge Graph Blueprint
- **Nodes**: Skills with metadata from Section 2. Include `retention_model` parameters and `implicit_practice_weight` to reward ancestor skills during advanced practice.
- **Edge Types**:  
  - `prereq_core`: Must be mastered before the child skill (e.g., `Compose Teen Numbers` → `Dynamic Addition`).  
  - `prereq_strategy`: Unlocks strategy transfer (e.g., `Make-Ten Addition` → `Dynamic Addition (Regroup)`).  
  - `representation_bridge`: Ensures learners experience intermediate representations (e.g., `Static Multiplication` via golden beads before abstract arrays).  
  - `enrichment`: Optional extensions or lateral applications.  
- **Hierarchy & Unlock Rules**: Units and topics define suggested order; the graph enforces readiness for adaptive sequencing and review injection. Maintains acyclicity and coverage checks via automated validation.

## 6. Instructional Flow
1. **Placement & Mastery Checks**: Short skill-aligned probes determine starting points and refresh confidence when uncertainty grows.
2. **Lesson Structure**: Every lesson delivers Presentation (scripted actions), Guided Practice (step-by-step prompts), and Independent Practice (5-question set with fast-pass/fail rules).
3. **Mastery & Progression**: Independent practice uses a 5-question check—fast pass on first two correct or any three correct; fast fail on three misses, prompting a redo. Mastery unlocks successor skills and schedules reviews.
4. **Spaced Repetition**: Scheduler selects review items as recall probability decays, mixing overdue skills with frontier practice.
5. **Feedback & Reflection**: Learner mastery map, XP/streak incentives, rationale for task selection; educator dashboards highlight progress toward standards and RIT growth.

## 7. Manipulative & Representation Guidelines
- Introduce every new quantitative concept with hands-on manipulatives (golden beads, fraction insets, geometry solids) before transitioning to symbolic forms.
- Each lesson defines explicit representation sequencing; the platform fades scaffolds once mastery confidence passes thresholds.
- Adaptive branching reintroduces supportive manipulatives when learners struggle abstractly.
- Ensure cross-context transfer by embedding skills in measurement, money, time, and story problems.

## 8. Standards & RIT Alignment
- Map each skill to a primary CCSS standard component; store supporting tags for cross-domain competencies.
- Aggregate mastery by CCSS clusters (Major/Supporting/Additional) to guide pacing.
- Use RIT band metadata from `.docs/reference/k-2.md` and `.docs/reference/2-5.md` for placement suggestions; periodic mastery checks refine placement and update MAP growth goals.
- Reporting slices by domain, unit, CCSS strand, and RIT growth to support MTSS/RTI decisions.

## 9. Example Skill Path — Multiplication Progression
1. `Equal Groups Reasoning` (`prereq_core` for Static Multiplication) – Activities: bead bars, grouping stories.  
2. `Static Multiplication (No Regroup)` – Lessons using golden beads, stamp game, array diagrams.  
3. `Division as Sharing` – Ensures inverse understanding before regrouping steps.  
4. `Dynamic Multiplication (Regroup)` – Golden beads exchanges, stamp game with trades, dot board practice.  
5. `Bead Frame Multiplication` – Transition to large bead frame and flat bead frame for multi-digit factors.  
6. `Checkerboard Multiplication` – Prepare for algorithmic abstraction; implicit review of place value.  
7. `Multiplication Fact Fluency` – Spaced drills with strategy tagging.  
8. `Distributive & Area Reasoning` – Connect arrays to area models, word problems, and algebraic structure.

## 10. Data Models
```ts
type Identifier = string;

interface Domain {
  id: Identifier;
  name: string;
  description: string;
  ccssClusters: string[];        // e.g., ["K.CC", "1.NBT"]
  ritBands: { min: number; max: number }[];
  canonicalOrder: number;        // display sequence
  unitOrder: Identifier[];       // ordered list of unit ids
  metadata?: Record<string, unknown>;
}

interface Unit {
  id: Identifier;
  domainId: Identifier;
  name: string;
  summary: string;
  ritRange: { min: number; max: number };
  primaryCcss: string[];         // e.g., ["1.NBT.A", "1.NBT.B"]
  capstoneAssessmentId?: Identifier;
  topicOrder: Identifier[];
  notes?: string;
}

interface Topic {
  id: Identifier;
  unitId: Identifier;
  name: string;
  description: string;
  priority: number;
  skillIds: Identifier[];        // canonical skill list for the topic
  lessonOrder: Identifier[];
  unlockRules: {
    prerequisiteTopics?: Identifier[];
    minMastery?: Array<{ skillId: Identifier; threshold: number }>;
  };
}

interface Lesson {
  id: Identifier;
  topicId: Identifier;
  name: string;
  objective: string;
  skillAlignments: Identifier[];
  ritFocus: { min: number; max: number };
  manipulativeSequence: Identifier[]; // manipulative template ids referenced in presentation/guided
  activityBlocks: Array<{
    phase: "presentation" | "guided" | "independent";
    activityShellId: Identifier;
    parameters: Record<string, unknown>;
  }>;
  independentPractice: {
    questionCount: number;     // default 5
    fastPass: { firstTwoCorrect: boolean; minTotalCorrect: number };
    fastFail: { maxMisses: number };
    questionBankId: Identifier;
  };
  durationMinutes: number;
  teacherNotes?: string;
}

interface Skill {
  id: Identifier;
  name: string;
  description: string;
  domainId: Identifier;
  ritBands: { min: number; max: number }[];
  primaryCcss: string;
  supportingCcss?: string[];
  difficulty: "emerging" | "developing" | "proficient" | "advanced";
  masteryThreshold: { accuracy: number; latencySec: number };
  retentionModel: { initialIntervalDays: number; growthFactor: number };
  implicitPracticeWeight: number; // credit passed to ancestors
  edgeIds: Identifier[];          // outgoing edges
  notes?: string;
}

interface SkillEdge {
  id: Identifier;
  parentSkillId: Identifier;
  childSkillId: Identifier;
  type: "prereq_core" | "prereq_strategy" | "representation_bridge" | "enrichment";
  rationale: string;
  unlockBehavior: {
    requirement: "mastery" | "proficiency" | "exposure";
    threshold: number;
  };
  implicitCredit?: number;        // how much practice credit flows upward
}

interface ManipulativeTemplate {
  id: Identifier;
  name: string;
  description: string;
  supportedSkillIds: Identifier[];
  presentationCues: string[];
  controlOfError: string;        // description of feedback mechanics
  fadeOutRules: {
    triggerMastery: number;
    alternateTemplateId?: Identifier;
  };
}

interface ActivityShell {
  id: Identifier;
  name: string;
  supportedRepresentations: string[];
  defaultDurationMinutes: number;
  telemetrySchema: Record<string, string>;
  configurationSchema: Record<string, unknown>;
}

interface SessionTask {
  id: Identifier;
  type: "lesson" | "drill" | "quiz";
  lessonId?: Identifier;        // required when type === "lesson"
  drillConfigId?: Identifier;   // required when type === "drill"
  quizConfigId?: Identifier;    // required when type === "quiz"
  targetSkillIds: Identifier[];
  estimatedMinutes: number;
  passCriteria?: {
    minCorrect?: number;
    fastPass?: { firstTwoCorrect?: boolean; minTotalCorrect?: number };
    fastFail?: { maxMisses?: number };
  };
}
```

## 11. Implementation Roadmap
1. **Data Modeling & Infrastructure**: Implement the schemas above, authoring tools, and validation scripts (cycle detection, orphan skills, RIT/CCSS coverage checks).
2. **Seed Knowledge Graph**: Populate skills for priority domains (Counting & Cardinality, Base-Ten, Operations, Fractions) using reference lists; define prerequisite edges from vetted manipulative-to-abstract sequences and CCSS progressions.
3. **Author Core Lessons**: For each priority topic, draft Presentation/Guided/Independent blocks, manipulative sequences, and mastery checks. Pilot sequences include Counting foundations, Place Value to 120, Addition/Subtraction strategies, Multiplication progression, Fraction foundations.
4. **Build Adaptive Engine Hooks**: Wire placement checks, mastery tracking, and spaced repetition to skill metadata; implement unlock logic based on edge types.
5. **Develop Authoring & QA Pipeline**: Provide templates and review checklists ensuring representation coverage, strategy focus, and standards tagging. Establish SME review cycles.
6. **Publish Reporting & Feedback Tools**: Deliver educator dashboards (mastery heatmaps, CCSS coverage, RIT growth) and learner-facing mastery maps, XP systems, and task rationales.
7. **Iterate & Expand**: Analyze telemetry, adjust skill difficulty, tweak edges, refine spacing intervals, and extend curriculum to upper-grade strands and enrichment pathways.

## 12. Next Immediate Actions
- Finalize the canonical skill lists for early topics in Number Sense, Place Value, Addition/Subtraction, and Multiplication foundations using reference documents.
- Draft detailed lesson specs for the initial 10 lessons, including manipulative sequences and activity shell parameters.
- Implement knowledge-graph validation tooling (cycle detection, missing prerequisites, standards coverage reports).
