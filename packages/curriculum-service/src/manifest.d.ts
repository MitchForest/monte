import domains from '../content/domains.json';
type LessonPlanGradeKey = 'kindergarten' | 'grade1' | 'grade2' | 'grade3';
export type CurriculumManifestUnit = {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    domainId?: string;
    ritRange?: {
        min: number;
        max: number;
    };
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
    ritRange?: {
        min: number;
        max: number;
    };
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
export declare const buildCurriculumManifest: () => CurriculumManifest;
export {};
//# sourceMappingURL=manifest.d.ts.map