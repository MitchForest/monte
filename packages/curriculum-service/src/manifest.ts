import domains from '../content/domains.json';
import topics from '../content/topics.json';
import units from '../content/units.json';
import lessonPlansKindergarten from '../content/lesson-plans/kindergarten.json';
import lessonPlansGrade1 from '../content/lesson-plans/grade1.json';
import lessonPlansGrade2 from '../content/lesson-plans/grade2.json';
import lessonPlansGrade3 from '../content/lesson-plans/grade3.json';

type LessonPlanGradeKey = 'kindergarten' | 'grade1' | 'grade2' | 'grade3';

type LessonPlanRecord = (typeof lessonPlansKindergarten)[number];

type LessonPlanWithGrade = LessonPlanRecord & {
  gradeLevel: LessonPlanGradeKey;
};

const lessonPlanSources: Record<LessonPlanGradeKey, LessonPlanRecord[]> = {
  kindergarten: lessonPlansKindergarten,
  grade1: lessonPlansGrade1,
  grade2: lessonPlansGrade2,
  grade3: lessonPlansGrade3,
};

export type CurriculumManifestUnit = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  domainId?: string;
  ritRange?: { min: number; max: number };
  primaryCcss?: string[];
  topicOrder: string[];
};

export type CurriculumManifestTopic = {
  id: string;
  slug: string;
  unitId: string;
  title: string;
  overview?: string;
  focusSkills: string[];
  ritRange?: { min: number; max: number };
  ccssFocus?: string[];
  priority?: number;
  prerequisiteTopicIds: string[];
};

export type CurriculumManifestLesson = {
  id: string;
  slug: string;
  topicId: string;
  title: string;
  materialId?: string;
  gradeLevels: LessonPlanGradeKey[];
  segments: Array<{
    type: string;
    representation?: string;
  }>;
  prerequisiteLessonIds: string[];
  skills: string[];
  notes?: string;
};

export type CurriculumManifest = {
  generatedAt: string;
  domains: typeof domains;
  units: CurriculumManifestUnit[];
  topics: CurriculumManifestTopic[];
  lessons: CurriculumManifestLesson[];
};

const unique = <Value>(values: Iterable<Value>): Value[] => Array.from(new Set(values));

const normalizeLessonPlans = (): CurriculumManifestLesson[] => {
  const byLessonId = new Map<string, CurriculumManifestLesson>();

  for (const [gradeLevel, plans] of Object.entries(lessonPlanSources) as [
    LessonPlanGradeKey,
    LessonPlanRecord[],
  ][]) {
    for (const plan of plans) {
      const slug = plan.id;
      const existing = byLessonId.get(slug);

      if (existing) {
        existing.gradeLevels = unique([...existing.gradeLevels, gradeLevel]);
        existing.skills = unique([...existing.skills, ...plan.skills]);
        existing.prerequisiteLessonIds = unique([
          ...existing.prerequisiteLessonIds,
          ...plan.prerequisiteLessonIds,
        ]);
        existing.segments = plan.segments.length ? plan.segments : existing.segments;
        existing.notes = existing.notes ?? plan.notes;
        continue;
      }

      byLessonId.set(slug, {
        id: plan.id,
        slug,
        topicId: plan.topicId,
        title: plan.name,
        materialId: plan.materialId,
        gradeLevels: [gradeLevel],
        segments: plan.segments.map((segment) => ({
          type: segment.type,
          representation: segment.representation,
        })),
        prerequisiteLessonIds: plan.prerequisiteLessonIds ?? [],
        skills: plan.skills ?? [],
        notes: plan.notes,
      });
    }
  }

  return Array.from(byLessonId.values()).sort((a, b) => a.slug.localeCompare(b.slug));
};

const normalizeTopics = (): CurriculumManifestTopic[] =>
  topics
    .map((topic) => ({
      id: topic.id,
      slug: topic.id,
      unitId: topic.unitId,
      title: topic.name,
      overview: topic.description,
      focusSkills: topic.ccssFocus ?? [],
      ritRange: topic.ritRange,
      ccssFocus: topic.ccssFocus,
      priority: topic.priority,
      prerequisiteTopicIds: topic.prerequisiteTopicIds ?? [],
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

const normalizeUnits = (): CurriculumManifestUnit[] =>
  units
    .map((unit) => ({
      id: unit.id,
      slug: unit.id,
      title: unit.name,
      summary: unit.summary,
      domainId: unit.domainId,
      ritRange: unit.ritRange,
      primaryCcss: unit.primaryCcss,
      topicOrder: unit.topicOrder ?? [],
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

export const buildCurriculumManifest = (): CurriculumManifest => {
  const manifestUnits = normalizeUnits();
  const manifestTopics = normalizeTopics();
  const manifestLessons = normalizeLessonPlans();

  return {
    generatedAt: new Date().toISOString(),
    domains,
    units: manifestUnits,
    topics: manifestTopics,
    lessons: manifestLessons,
  };
};
