import { ConvexHttpClient } from 'convex/browser';
import { CurriculumTree, CurriculumTreeUnit, LessonDraftRecord, Id, EntityMetadata, LessonDocument, UserRole, UserProfile } from '@monte/types';
export { CurriculumTree, CurriculumTreeLesson, CurriculumTreeTopic, CurriculumTreeUnit, LessonDraftRecord } from '@monte/types';

interface CurriculumClient {
    setAuthToken: (token?: string | null) => void;
    clearAuthToken: () => void;
    fetchCurriculumTree: () => Promise<CurriculumTree>;
    fetchUnitBySlug: (slug: string) => Promise<CurriculumTreeUnit | undefined>;
    fetchLessonBySlug: (slug: string) => Promise<LessonDraftRecord | undefined>;
    fetchLessonById: (lessonId: Id<'lessons'>) => Promise<LessonDraftRecord | undefined>;
    createUnit: (input: {
        title: string;
        slug?: string;
        summary?: string;
        coverImage?: string;
        metadata?: EntityMetadata;
    }) => Promise<{
        unitId: Id<'units'>;
    }>;
    updateUnit: (input: {
        unitId: Id<'units'>;
        title?: string;
        slug?: string;
        summary?: string;
        coverImage?: string;
        metadata?: EntityMetadata;
        status?: 'active' | 'archived';
    }) => Promise<void>;
    deleteUnit: (unitId: Id<'units'>) => Promise<void>;
    reorderUnits: (unitIds: Id<'units'>[]) => Promise<void>;
    createTopic: (input: {
        unitId: Id<'units'>;
        title: string;
        slug?: string;
        overview?: string;
        focusSkills?: string[];
        estimatedDurationMinutes?: number;
        metadata?: EntityMetadata;
    }) => Promise<{
        topicId: Id<'topics'>;
    }>;
    updateTopic: (input: {
        topicId: Id<'topics'>;
        title?: string;
        slug?: string;
        overview?: string;
        focusSkills?: string[];
        estimatedDurationMinutes?: number;
        metadata?: EntityMetadata;
        status?: 'active' | 'archived';
    }) => Promise<void>;
    deleteTopic: (topicId: Id<'topics'>) => Promise<void>;
    moveTopic: (input: {
        topicId: Id<'topics'>;
        targetUnitId: Id<'units'>;
        targetIndex: number;
    }) => Promise<void>;
    reorderTopics: (unitId: Id<'units'>, topicIds: Id<'topics'>[]) => Promise<void>;
    createLesson: (input: {
        topicId: Id<'topics'>;
        title: string;
        slug?: string;
    }) => Promise<{
        lessonId: Id<'lessons'>;
    }>;
    saveLessonDraft: (lessonId: Id<'lessons'>, draft: LessonDocument) => Promise<void>;
    publishLesson: (lessonId: Id<'lessons'>) => Promise<void>;
    deleteLesson: (lessonId: Id<'lessons'>) => Promise<void>;
    moveLesson: (input: {
        lessonId: Id<'lessons'>;
        targetTopicId: Id<'topics'>;
        targetIndex: number;
    }) => Promise<void>;
    reorderLessons: (topicId: Id<'topics'>, lessonIds: Id<'lessons'>[]) => Promise<void>;
    listLessons: (topicId?: Id<'topics'>) => Promise<LessonDraftRecord[]>;
    ensureUserProfile: () => Promise<UserRole>;
    getCurrentUserProfile: () => Promise<UserProfile | null>;
    getCurrentUserRole: () => Promise<UserRole | null>;
    updateUserRole: (targetUserId: string, role: UserRole) => Promise<void>;
}
declare const createCurriculumClient: (httpClient: ConvexHttpClient) => CurriculumClient;
declare const createCurriculumHttpClient: (convexUrl: string) => CurriculumClient;

export { type CurriculumClient, createCurriculumClient, createCurriculumHttpClient };
