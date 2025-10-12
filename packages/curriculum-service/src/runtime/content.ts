import domains from '../../content/domains.json';
import fluencyDrills from '../../content/fluency-drills.json';
import fluencyQuestionSeeds from '../../content/fluency-question-seeds.json';
import masteryQuizzes from '../../content/mastery-quizzes.json';
import topics from '../../content/topics.json';
import units from '../../content/units.json';

import kindergartenLessonPlans from '../../content/lesson-plans/kindergarten.json';
import grade1LessonPlans from '../../content/lesson-plans/grade1.json';
import grade2LessonPlans from '../../content/lesson-plans/grade2.json';
import grade3LessonPlans from '../../content/lesson-plans/grade3.json';

import numberSenseSkills from '../../content/domain-graphs/number-sense-place-value/skills.number-sense-place-value.json';
import numberSenseEdges from '../../content/domain-graphs/number-sense-place-value/skill-edges.number-sense-place-value.json';
import operationsSkills from '../../content/domain-graphs/operations-algebraic-thinking/skills.operations-algebraic-thinking.json';
import operationsEdges from '../../content/domain-graphs/operations-algebraic-thinking/skill-edges.operations-algebraic-thinking.json';
import fractionsSkills from '../../content/domain-graphs/fractions-rational-numbers/skills.fractions-rational-numbers.json';
import fractionsEdges from '../../content/domain-graphs/fractions-rational-numbers/skill-edges.fractions-rational-numbers.json';
import geometrySkills from '../../content/domain-graphs/geometry-spatial-reasoning/skills.geometry-spatial-reasoning.json';
import geometryEdges from '../../content/domain-graphs/geometry-spatial-reasoning/skill-edges.geometry-spatial-reasoning.json';
import measurementSkills from '../../content/domain-graphs/measurement-data/skills.measurement-data.json';
import measurementEdges from '../../content/domain-graphs/measurement-data/skill-edges.measurement-data.json';
import patternsSkills from '../../content/domain-graphs/patterns-algebraic-thinking/skills.patterns-algebraic-thinking.json';
import patternsEdges from '../../content/domain-graphs/patterns-algebraic-thinking/skill-edges.patterns-algebraic-thinking.json';

export const curriculumUnits = units;
export const curriculumTopics = topics;
export const curriculumDomains = domains;
export const curriculumLessonPlans = {
  kindergarten: kindergartenLessonPlans,
  grade1: grade1LessonPlans,
  grade2: grade2LessonPlans,
  grade3: grade3LessonPlans,
} as const;
export const curriculumFluencyPrograms = {
  drills: fluencyDrills,
  questionSeeds: fluencyQuestionSeeds,
  masteryQuizzes,
} as const;

export const curriculumDomainGraphs = {
  'number-sense-place-value': {
    skills: numberSenseSkills,
    edges: numberSenseEdges,
  },
  'operations-algebraic-thinking': {
    skills: operationsSkills,
    edges: operationsEdges,
  },
  'fractions-rational-numbers': {
    skills: fractionsSkills,
    edges: fractionsEdges,
  },
  'geometry-spatial-reasoning': {
    skills: geometrySkills,
    edges: geometryEdges,
  },
  'measurement-data': {
    skills: measurementSkills,
    edges: measurementEdges,
  },
  'patterns-algebraic-thinking': {
    skills: patternsSkills,
    edges: patternsEdges,
  },
} as const;

export type CurriculumUnit = (typeof curriculumUnits)[number];
export type CurriculumTopic = (typeof curriculumTopics)[number];
export type CurriculumDomain = (typeof curriculumDomains)[number];
export type LessonPlanGradeLevel = keyof typeof curriculumLessonPlans;
export type CurriculumLessonPlan = (typeof curriculumLessonPlans)[LessonPlanGradeLevel][number];

export type CurriculumDomainKey = keyof typeof curriculumDomainGraphs;
export type CurriculumDomainGraph = (typeof curriculumDomainGraphs)[CurriculumDomainKey];

export const curriculumContent = {
  domains: curriculumDomains,
  domainGraphs: curriculumDomainGraphs,
  fluency: curriculumFluencyPrograms,
  lessonPlans: curriculumLessonPlans,
  topics: curriculumTopics,
  units: curriculumUnits,
} as const;

export type CurriculumContent = typeof curriculumContent;
