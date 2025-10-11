import { ConvexHttpClient } from 'convex/browser';
import { z } from 'zod';
import { CurriculumManifest, LessonAuthoringStatus, Id, LessonGradeLevel, CurriculumTree, CurriculumTreeUnit, LessonDraftRecord, EntityMetadata, LessonDocument, CurriculumSyncSummary } from '@monte/types';
export { CurriculumManifest, CurriculumSyncSummary, CurriculumTree, CurriculumTreeLesson, CurriculumTreeTopic, CurriculumTreeUnit, LessonAuthoringStatus, LessonDraftRecord, LessonGradeLevel } from '@monte/types';

type SyncManifestInput = {
    manifest: CurriculumManifest;
    prune?: boolean;
    manifestCommit?: string;
    defaultStatus?: LessonAuthoringStatus;
};
type UpdateLessonAuthoringInput = {
    lessonId: Id<'lessons'>;
    authoringStatus?: LessonAuthoringStatus | null;
    assigneeId?: string | null;
    authoringNotes?: string | null;
    gradeLevels?: LessonGradeLevel[] | null;
};
type LessonAuthoringUpdate = {
    lessonId: Id<'lessons'>;
    authoringStatus: LessonAuthoringStatus | null;
    assigneeId: string | null;
    authoringNotes: string | null;
    gradeLevels: LessonGradeLevel[];
    updatedAt: number;
};
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
    updateLessonAuthoring: (input: UpdateLessonAuthoringInput) => Promise<LessonAuthoringUpdate>;
    listLessons: (topicId?: Id<'topics'>) => Promise<LessonDraftRecord[]>;
    syncManifest: (input: SyncManifestInput) => Promise<CurriculumSyncSummary>;
    exportManifest: () => Promise<CurriculumManifest>;
}
declare const createCurriculumClient: (httpClient: ConvexHttpClient) => CurriculumClient;
declare const createCurriculumHttpClient: (convexUrl: string) => CurriculumClient;
declare const curriculumClient: CurriculumClient;
declare const isCurriculumApiAvailable: boolean;
declare const isCurriculumAuthReady: () => boolean;
declare const setCurriculumAuthToken: (token?: string | null) => void;
declare const clearAuthToken: () => void;
declare const fetchCurriculumTree: () => Promise<CurriculumTree>;
declare const fetchUnitBySlug: (slug: string) => Promise<CurriculumTreeUnit | undefined>;
declare const fetchLessonBySlug: (slug: string) => Promise<LessonDraftRecord | undefined>;
declare const fetchLessonById: (lessonId: Id<"lessons">) => Promise<LessonDraftRecord | undefined>;
declare const createUnit: (input: {
    title: string;
    slug?: string;
    summary?: string;
    coverImage?: string;
    metadata?: EntityMetadata;
}) => Promise<{
    unitId: Id<"units">;
}>;
declare const updateUnit: (input: {
    unitId: Id<"units">;
    title?: string;
    slug?: string;
    summary?: string;
    coverImage?: string;
    metadata?: EntityMetadata;
    status?: "active" | "archived";
}) => Promise<void>;
declare const deleteUnit: (unitId: Id<"units">) => Promise<void>;
declare const reorderUnits: (unitIds: Id<"units">[]) => Promise<void>;
declare const createTopic: (input: {
    unitId: Id<"units">;
    title: string;
    slug?: string;
    overview?: string;
    focusSkills?: string[];
    estimatedDurationMinutes?: number;
    metadata?: EntityMetadata;
}) => Promise<{
    topicId: Id<"topics">;
}>;
declare const updateTopic: (input: {
    topicId: Id<"topics">;
    title?: string;
    slug?: string;
    overview?: string;
    focusSkills?: string[];
    estimatedDurationMinutes?: number;
    metadata?: EntityMetadata;
    status?: "active" | "archived";
}) => Promise<void>;
declare const deleteTopic: (topicId: Id<"topics">) => Promise<void>;
declare const moveTopic: (input: {
    topicId: Id<"topics">;
    targetUnitId: Id<"units">;
    targetIndex: number;
}) => Promise<void>;
declare const reorderTopics: (unitId: Id<"units">, topicIds: Id<"topics">[]) => Promise<void>;
declare const createLesson: (input: {
    topicId: Id<"topics">;
    title: string;
    slug?: string;
}) => Promise<{
    lessonId: Id<"lessons">;
}>;
declare const saveLessonDraft: (lessonId: Id<"lessons">, draft: LessonDocument) => Promise<void>;
declare const publishLesson: (lessonId: Id<"lessons">) => Promise<void>;
declare const deleteLesson: (lessonId: Id<"lessons">) => Promise<void>;
declare const moveLesson: (input: {
    lessonId: Id<"lessons">;
    targetTopicId: Id<"topics">;
    targetIndex: number;
}) => Promise<void>;
declare const reorderLessons: (topicId: Id<"topics">, lessonIds: Id<"lessons">[]) => Promise<void>;
declare const updateLessonAuthoring: (input: UpdateLessonAuthoringInput) => Promise<LessonAuthoringUpdate>;
declare const listLessons: (topicId?: Id<"topics">) => Promise<LessonDraftRecord[]>;
declare const syncManifest: (input: SyncManifestInput) => Promise<CurriculumSyncSummary>;
declare const exportManifest: () => Promise<CurriculumManifest>;
declare const fetchLessonDrafts: (topicId?: Id<"topics">) => Promise<{
    status: "draft" | "published";
    slug: string;
    createdAt: number;
    updatedAt: number;
    title: string;
    order: number;
    topicId: string & {
        __tableName: "topics";
    };
    draft: {
        lesson: {
            id: string;
            title: string;
            primaryMaterialId: string;
            materials: {
                materialId: string;
                purpose: string;
                optional?: boolean | undefined;
            }[];
            topicId: string;
            estimatedDurationMinutes: number;
            segments: ({
                type: "presentation";
                id: string;
                title: string;
                materials: {
                    materialId: string;
                    purpose: string;
                    optional?: boolean | undefined;
                }[];
                skills: string[];
                description?: string | undefined;
                scenario?: {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                } | undefined;
                representation?: "concrete" | "abstract" | undefined;
                primaryMaterialId?: string | undefined;
                scriptId?: string | undefined;
                script?: {
                    id: string;
                    title: string;
                    actions: ({
                        type: "narrate";
                        id: string;
                        text: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "showCard";
                        id: string;
                        position: "multiplicand-stack" | "multiplier" | "paper";
                        card: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "placeBeads";
                        id: string;
                        quantity: number;
                        place: "unit" | "ten" | "hundred" | "thousand";
                        tray: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "duplicateTray";
                        id: string;
                        count: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "exchange";
                        id: string;
                        quantity: number;
                        from: "unit" | "ten" | "hundred";
                        to: "ten" | "hundred" | "thousand";
                        remainder: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "moveBeadsBelowLine";
                        id: string;
                        place: "unit" | "ten" | "hundred";
                        totalCount: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "groupForExchange";
                        id: string;
                        place: "unit" | "ten" | "hundred";
                        remainder: number;
                        groupsOfTen: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "exchangeBeads";
                        id: string;
                        from: "unit" | "ten" | "hundred";
                        to: "ten" | "hundred" | "thousand";
                        groupsOfTen: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        value: number;
                        type: "placeResultCard";
                        id: string;
                        place: "unit" | "ten" | "hundred" | "thousand";
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "stackPlaceValues";
                        id: string;
                        order: ("unit" | "ten" | "hundred" | "thousand")[];
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        value: string;
                        type: "writeResult";
                        id: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "highlight";
                        id: string;
                        target: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                        text?: string | undefined;
                    } | {
                        type: "showStamp";
                        id: string;
                        stamp: "1" | "10" | "100";
                        columns: number;
                        rows: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        value: string;
                        type: "countTotal";
                        id: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    })[];
                    summary?: string | undefined;
                } | undefined;
                materialBankId?: string | undefined;
                timeline?: {
                    version: 1;
                    steps: {
                        id: string;
                        keyframes: {
                            nodeId: string;
                            keyframes: {
                                transform: {
                                    position: {
                                        x: number;
                                        y: number;
                                    };
                                    rotation?: number | undefined;
                                    scale?: {
                                        x: number;
                                        y: number;
                                    } | undefined;
                                    opacity?: number | undefined;
                                };
                                timeMs: number;
                                metadata?: Record<string, unknown> | undefined;
                                easing?: string | undefined;
                            }[];
                            metadata?: Record<string, unknown> | undefined;
                        }[];
                        actor: "guide" | "student";
                        durationMs: number;
                        metadata?: Record<string, unknown> | undefined;
                        title?: string | undefined;
                        caption?: string | undefined;
                        interactions?: {
                            kind: "custom" | "drop-zone" | "input";
                            id: string;
                            props?: Record<string, unknown> | undefined;
                            targetNodeId?: string | undefined;
                        }[] | undefined;
                    }[];
                    metadata?: Record<string, unknown> | undefined;
                    label?: string | undefined;
                } | undefined;
            } | {
                type: "guided";
                id: string;
                workspace: "golden-beads" | "stamp-game";
                title: string;
                steps: {
                    id: string;
                    prompt: string;
                    expectation: string;
                    successCheck: string;
                    nudge: string;
                    evaluatorId: "golden-beads-build-base" | "golden-beads-duplicate" | "golden-beads-exchange-units" | "golden-beads-exchange-tens" | "golden-beads-exchange-hundreds" | "golden-beads-stack-result" | "stamp-game-build" | "stamp-game-repeat-columns" | "stamp-game-exchange" | "stamp-game-read-result";
                    authoring?: {
                        metadata?: Record<string, unknown> | undefined;
                        notes?: string | undefined;
                        label?: string | undefined;
                        description?: string | undefined;
                        tags?: string[] | undefined;
                    } | undefined;
                    durationMs?: number | undefined;
                    explanation?: string | undefined;
                }[];
                materials: {
                    materialId: string;
                    purpose: string;
                    optional?: boolean | undefined;
                }[];
                skills: string[];
                description?: string | undefined;
                scenario?: {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                } | undefined;
                representation?: "concrete" | "abstract" | undefined;
                materialBankId?: string | undefined;
                timeline?: {
                    version: 1;
                    steps: {
                        id: string;
                        keyframes: {
                            nodeId: string;
                            keyframes: {
                                transform: {
                                    position: {
                                        x: number;
                                        y: number;
                                    };
                                    rotation?: number | undefined;
                                    scale?: {
                                        x: number;
                                        y: number;
                                    } | undefined;
                                    opacity?: number | undefined;
                                };
                                timeMs: number;
                                metadata?: Record<string, unknown> | undefined;
                                easing?: string | undefined;
                            }[];
                            metadata?: Record<string, unknown> | undefined;
                        }[];
                        actor: "guide" | "student";
                        durationMs: number;
                        metadata?: Record<string, unknown> | undefined;
                        title?: string | undefined;
                        caption?: string | undefined;
                        interactions?: {
                            kind: "custom" | "drop-zone" | "input";
                            id: string;
                            props?: Record<string, unknown> | undefined;
                            targetNodeId?: string | undefined;
                        }[] | undefined;
                    }[];
                    metadata?: Record<string, unknown> | undefined;
                    label?: string | undefined;
                } | undefined;
            } | {
                type: "practice";
                id: string;
                workspace: "golden-beads" | "stamp-game";
                title: string;
                materials: {
                    materialId: string;
                    purpose: string;
                    optional?: boolean | undefined;
                }[];
                skills: string[];
                questions: {
                    id: string;
                    multiplier: number;
                    prompt: string;
                    multiplicand: number;
                    correctAnswer: number;
                    difficulty: "easy" | "medium" | "hard";
                    authoring?: {
                        metadata?: Record<string, unknown> | undefined;
                        notes?: string | undefined;
                        label?: string | undefined;
                        description?: string | undefined;
                        tags?: string[] | undefined;
                    } | undefined;
                }[];
                passCriteria: {
                    type: "threshold";
                    firstCorrect: number;
                    totalCorrect: number;
                    maxMisses: number;
                };
                description?: string | undefined;
                scenario?: {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                } | undefined;
                representation?: "concrete" | "abstract" | undefined;
                materialBankId?: string | undefined;
                timeline?: {
                    version: 1;
                    steps: {
                        id: string;
                        keyframes: {
                            nodeId: string;
                            keyframes: {
                                transform: {
                                    position: {
                                        x: number;
                                        y: number;
                                    };
                                    rotation?: number | undefined;
                                    scale?: {
                                        x: number;
                                        y: number;
                                    } | undefined;
                                    opacity?: number | undefined;
                                };
                                timeMs: number;
                                metadata?: Record<string, unknown> | undefined;
                                easing?: string | undefined;
                            }[];
                            metadata?: Record<string, unknown> | undefined;
                        }[];
                        actor: "guide" | "student";
                        durationMs: number;
                        metadata?: Record<string, unknown> | undefined;
                        title?: string | undefined;
                        caption?: string | undefined;
                        interactions?: {
                            kind: "custom" | "drop-zone" | "input";
                            id: string;
                            props?: Record<string, unknown> | undefined;
                            targetNodeId?: string | undefined;
                        }[] | undefined;
                    }[];
                    metadata?: Record<string, unknown> | undefined;
                    label?: string | undefined;
                } | undefined;
            })[];
            summary?: string | undefined;
            focusSkills?: string[] | undefined;
            materialInventory?: {
                version: 1;
                tokenTypes: {
                    label: string;
                    id: string;
                    materialId: string;
                    workspace: "golden-beads" | "stamp-game";
                    visual: {
                        kind: "bead";
                        place: "unit" | "ten" | "hundred" | "thousand";
                    } | {
                        value: number;
                        kind: "card";
                        size: "sm" | "md" | "lg";
                    } | {
                        value: 1 | 10 | 100;
                        kind: "stamp";
                    } | {
                        kind: "custom";
                        componentId: string;
                        props?: Record<string, unknown> | undefined;
                    };
                    quantityPerToken?: number | undefined;
                    authoring?: {
                        metadata?: Record<string, unknown> | undefined;
                        notes?: string | undefined;
                        label?: string | undefined;
                        description?: string | undefined;
                        tags?: string[] | undefined;
                    } | undefined;
                }[];
                banks: {
                    label: string;
                    id: string;
                    materialId: string;
                    scope: "lesson" | "segment";
                    accepts: string[];
                    initialQuantity: number | Record<string, number>;
                    metadata?: Record<string, unknown> | undefined;
                    segmentId?: string | undefined;
                    depletion?: "static" | "consume" | "replenish" | undefined;
                    layout?: {
                        position: {
                            x: number;
                            y: number;
                        };
                        width?: number | undefined;
                        height?: number | undefined;
                        align?: "start" | "center" | "end" | undefined;
                    } | undefined;
                }[];
                defaultRules?: {
                    onExchange?: {
                        triggerTokenType: string;
                        produces: {
                            tokenType: string;
                            quantity: number;
                        }[];
                        consumes: {
                            tokenType: string;
                            quantity: number;
                        }[];
                    }[] | undefined;
                    onReplenish?: {
                        whenBankId: string;
                        method: "custom" | "reset-on-exit" | "reset-on-undo";
                        customHandlerId?: string | undefined;
                    }[] | undefined;
                    onConsumption?: {
                        bankId: string;
                        allowNegative?: boolean | undefined;
                        blockWhenEmpty?: boolean | undefined;
                    }[] | undefined;
                } | undefined;
                sceneNodes?: {
                    id: string;
                    materialId: string;
                    metadata?: Record<string, unknown> | undefined;
                    label?: string | undefined;
                    transform?: {
                        position: {
                            x: number;
                            y: number;
                        };
                        rotation?: number | undefined;
                        scale?: {
                            x: number;
                            y: number;
                        } | undefined;
                        opacity?: number | undefined;
                    } | undefined;
                }[] | undefined;
            } | undefined;
        };
        version: "1.0";
        meta?: {
            metadata?: z.objectOutputType<{
                source: z.ZodOptional<z.ZodString>;
                tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                notes: z.ZodOptional<z.ZodString>;
                scenario: z.ZodOptional<z.ZodObject<{
                    kind: z.ZodEnum<["golden-beads", "stamp-game"]>;
                    seed: z.ZodNumber;
                    snapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    notes: z.ZodOptional<z.ZodString>;
                }, "strict", z.ZodTypeAny, {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                }, {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                }>>;
            }, z.ZodUnknown, "strip"> | undefined;
            createdAt?: string | number | undefined;
            updatedAt?: string | number | undefined;
            notes?: string | undefined;
            scenario?: {
                kind: "golden-beads" | "stamp-game";
                seed: number;
                notes?: string | undefined;
                snapshot?: Record<string, unknown> | undefined;
            } | undefined;
            author?: string | undefined;
        } | undefined;
    };
    _id: string & {
        __tableName: "lessons";
    };
    metadata?: z.objectOutputType<{
        source: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        notes: z.ZodOptional<z.ZodString>;
        scenario: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<["golden-beads", "stamp-game"]>;
            seed: z.ZodNumber;
            snapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            kind: "golden-beads" | "stamp-game";
            seed: number;
            notes?: string | undefined;
            snapshot?: Record<string, unknown> | undefined;
        }, {
            kind: "golden-beads" | "stamp-game";
            seed: number;
            notes?: string | undefined;
            snapshot?: Record<string, unknown> | undefined;
        }>>;
    }, z.ZodUnknown, "strip"> | undefined;
    summary?: string | undefined;
    published?: {
        lesson: {
            id: string;
            title: string;
            primaryMaterialId: string;
            materials: {
                materialId: string;
                purpose: string;
                optional?: boolean | undefined;
            }[];
            topicId: string;
            estimatedDurationMinutes: number;
            segments: ({
                type: "presentation";
                id: string;
                title: string;
                materials: {
                    materialId: string;
                    purpose: string;
                    optional?: boolean | undefined;
                }[];
                skills: string[];
                description?: string | undefined;
                scenario?: {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                } | undefined;
                representation?: "concrete" | "abstract" | undefined;
                primaryMaterialId?: string | undefined;
                scriptId?: string | undefined;
                script?: {
                    id: string;
                    title: string;
                    actions: ({
                        type: "narrate";
                        id: string;
                        text: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "showCard";
                        id: string;
                        position: "multiplicand-stack" | "multiplier" | "paper";
                        card: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "placeBeads";
                        id: string;
                        quantity: number;
                        place: "unit" | "ten" | "hundred" | "thousand";
                        tray: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "duplicateTray";
                        id: string;
                        count: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "exchange";
                        id: string;
                        quantity: number;
                        from: "unit" | "ten" | "hundred";
                        to: "ten" | "hundred" | "thousand";
                        remainder: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "moveBeadsBelowLine";
                        id: string;
                        place: "unit" | "ten" | "hundred";
                        totalCount: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "groupForExchange";
                        id: string;
                        place: "unit" | "ten" | "hundred";
                        remainder: number;
                        groupsOfTen: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "exchangeBeads";
                        id: string;
                        from: "unit" | "ten" | "hundred";
                        to: "ten" | "hundred" | "thousand";
                        groupsOfTen: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        value: number;
                        type: "placeResultCard";
                        id: string;
                        place: "unit" | "ten" | "hundred" | "thousand";
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "stackPlaceValues";
                        id: string;
                        order: ("unit" | "ten" | "hundred" | "thousand")[];
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        value: string;
                        type: "writeResult";
                        id: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        type: "highlight";
                        id: string;
                        target: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                        text?: string | undefined;
                    } | {
                        type: "showStamp";
                        id: string;
                        stamp: "1" | "10" | "100";
                        columns: number;
                        rows: number;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    } | {
                        value: string;
                        type: "countTotal";
                        id: string;
                        authoring?: {
                            metadata?: Record<string, unknown> | undefined;
                            notes?: string | undefined;
                            label?: string | undefined;
                            description?: string | undefined;
                            tags?: string[] | undefined;
                        } | undefined;
                        durationMs?: number | undefined;
                    })[];
                    summary?: string | undefined;
                } | undefined;
                materialBankId?: string | undefined;
                timeline?: {
                    version: 1;
                    steps: {
                        id: string;
                        keyframes: {
                            nodeId: string;
                            keyframes: {
                                transform: {
                                    position: {
                                        x: number;
                                        y: number;
                                    };
                                    rotation?: number | undefined;
                                    scale?: {
                                        x: number;
                                        y: number;
                                    } | undefined;
                                    opacity?: number | undefined;
                                };
                                timeMs: number;
                                metadata?: Record<string, unknown> | undefined;
                                easing?: string | undefined;
                            }[];
                            metadata?: Record<string, unknown> | undefined;
                        }[];
                        actor: "guide" | "student";
                        durationMs: number;
                        metadata?: Record<string, unknown> | undefined;
                        title?: string | undefined;
                        caption?: string | undefined;
                        interactions?: {
                            kind: "custom" | "drop-zone" | "input";
                            id: string;
                            props?: Record<string, unknown> | undefined;
                            targetNodeId?: string | undefined;
                        }[] | undefined;
                    }[];
                    metadata?: Record<string, unknown> | undefined;
                    label?: string | undefined;
                } | undefined;
            } | {
                type: "guided";
                id: string;
                workspace: "golden-beads" | "stamp-game";
                title: string;
                steps: {
                    id: string;
                    prompt: string;
                    expectation: string;
                    successCheck: string;
                    nudge: string;
                    evaluatorId: "golden-beads-build-base" | "golden-beads-duplicate" | "golden-beads-exchange-units" | "golden-beads-exchange-tens" | "golden-beads-exchange-hundreds" | "golden-beads-stack-result" | "stamp-game-build" | "stamp-game-repeat-columns" | "stamp-game-exchange" | "stamp-game-read-result";
                    authoring?: {
                        metadata?: Record<string, unknown> | undefined;
                        notes?: string | undefined;
                        label?: string | undefined;
                        description?: string | undefined;
                        tags?: string[] | undefined;
                    } | undefined;
                    durationMs?: number | undefined;
                    explanation?: string | undefined;
                }[];
                materials: {
                    materialId: string;
                    purpose: string;
                    optional?: boolean | undefined;
                }[];
                skills: string[];
                description?: string | undefined;
                scenario?: {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                } | undefined;
                representation?: "concrete" | "abstract" | undefined;
                materialBankId?: string | undefined;
                timeline?: {
                    version: 1;
                    steps: {
                        id: string;
                        keyframes: {
                            nodeId: string;
                            keyframes: {
                                transform: {
                                    position: {
                                        x: number;
                                        y: number;
                                    };
                                    rotation?: number | undefined;
                                    scale?: {
                                        x: number;
                                        y: number;
                                    } | undefined;
                                    opacity?: number | undefined;
                                };
                                timeMs: number;
                                metadata?: Record<string, unknown> | undefined;
                                easing?: string | undefined;
                            }[];
                            metadata?: Record<string, unknown> | undefined;
                        }[];
                        actor: "guide" | "student";
                        durationMs: number;
                        metadata?: Record<string, unknown> | undefined;
                        title?: string | undefined;
                        caption?: string | undefined;
                        interactions?: {
                            kind: "custom" | "drop-zone" | "input";
                            id: string;
                            props?: Record<string, unknown> | undefined;
                            targetNodeId?: string | undefined;
                        }[] | undefined;
                    }[];
                    metadata?: Record<string, unknown> | undefined;
                    label?: string | undefined;
                } | undefined;
            } | {
                type: "practice";
                id: string;
                workspace: "golden-beads" | "stamp-game";
                title: string;
                materials: {
                    materialId: string;
                    purpose: string;
                    optional?: boolean | undefined;
                }[];
                skills: string[];
                questions: {
                    id: string;
                    multiplier: number;
                    prompt: string;
                    multiplicand: number;
                    correctAnswer: number;
                    difficulty: "easy" | "medium" | "hard";
                    authoring?: {
                        metadata?: Record<string, unknown> | undefined;
                        notes?: string | undefined;
                        label?: string | undefined;
                        description?: string | undefined;
                        tags?: string[] | undefined;
                    } | undefined;
                }[];
                passCriteria: {
                    type: "threshold";
                    firstCorrect: number;
                    totalCorrect: number;
                    maxMisses: number;
                };
                description?: string | undefined;
                scenario?: {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                } | undefined;
                representation?: "concrete" | "abstract" | undefined;
                materialBankId?: string | undefined;
                timeline?: {
                    version: 1;
                    steps: {
                        id: string;
                        keyframes: {
                            nodeId: string;
                            keyframes: {
                                transform: {
                                    position: {
                                        x: number;
                                        y: number;
                                    };
                                    rotation?: number | undefined;
                                    scale?: {
                                        x: number;
                                        y: number;
                                    } | undefined;
                                    opacity?: number | undefined;
                                };
                                timeMs: number;
                                metadata?: Record<string, unknown> | undefined;
                                easing?: string | undefined;
                            }[];
                            metadata?: Record<string, unknown> | undefined;
                        }[];
                        actor: "guide" | "student";
                        durationMs: number;
                        metadata?: Record<string, unknown> | undefined;
                        title?: string | undefined;
                        caption?: string | undefined;
                        interactions?: {
                            kind: "custom" | "drop-zone" | "input";
                            id: string;
                            props?: Record<string, unknown> | undefined;
                            targetNodeId?: string | undefined;
                        }[] | undefined;
                    }[];
                    metadata?: Record<string, unknown> | undefined;
                    label?: string | undefined;
                } | undefined;
            })[];
            summary?: string | undefined;
            focusSkills?: string[] | undefined;
            materialInventory?: {
                version: 1;
                tokenTypes: {
                    label: string;
                    id: string;
                    materialId: string;
                    workspace: "golden-beads" | "stamp-game";
                    visual: {
                        kind: "bead";
                        place: "unit" | "ten" | "hundred" | "thousand";
                    } | {
                        value: number;
                        kind: "card";
                        size: "sm" | "md" | "lg";
                    } | {
                        value: 1 | 10 | 100;
                        kind: "stamp";
                    } | {
                        kind: "custom";
                        componentId: string;
                        props?: Record<string, unknown> | undefined;
                    };
                    quantityPerToken?: number | undefined;
                    authoring?: {
                        metadata?: Record<string, unknown> | undefined;
                        notes?: string | undefined;
                        label?: string | undefined;
                        description?: string | undefined;
                        tags?: string[] | undefined;
                    } | undefined;
                }[];
                banks: {
                    label: string;
                    id: string;
                    materialId: string;
                    scope: "lesson" | "segment";
                    accepts: string[];
                    initialQuantity: number | Record<string, number>;
                    metadata?: Record<string, unknown> | undefined;
                    segmentId?: string | undefined;
                    depletion?: "static" | "consume" | "replenish" | undefined;
                    layout?: {
                        position: {
                            x: number;
                            y: number;
                        };
                        width?: number | undefined;
                        height?: number | undefined;
                        align?: "start" | "center" | "end" | undefined;
                    } | undefined;
                }[];
                defaultRules?: {
                    onExchange?: {
                        triggerTokenType: string;
                        produces: {
                            tokenType: string;
                            quantity: number;
                        }[];
                        consumes: {
                            tokenType: string;
                            quantity: number;
                        }[];
                    }[] | undefined;
                    onReplenish?: {
                        whenBankId: string;
                        method: "custom" | "reset-on-exit" | "reset-on-undo";
                        customHandlerId?: string | undefined;
                    }[] | undefined;
                    onConsumption?: {
                        bankId: string;
                        allowNegative?: boolean | undefined;
                        blockWhenEmpty?: boolean | undefined;
                    }[] | undefined;
                } | undefined;
                sceneNodes?: {
                    id: string;
                    materialId: string;
                    metadata?: Record<string, unknown> | undefined;
                    label?: string | undefined;
                    transform?: {
                        position: {
                            x: number;
                            y: number;
                        };
                        rotation?: number | undefined;
                        scale?: {
                            x: number;
                            y: number;
                        } | undefined;
                        opacity?: number | undefined;
                    } | undefined;
                }[] | undefined;
            } | undefined;
        };
        version: "1.0";
        meta?: {
            metadata?: z.objectOutputType<{
                source: z.ZodOptional<z.ZodString>;
                tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                notes: z.ZodOptional<z.ZodString>;
                scenario: z.ZodOptional<z.ZodObject<{
                    kind: z.ZodEnum<["golden-beads", "stamp-game"]>;
                    seed: z.ZodNumber;
                    snapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    notes: z.ZodOptional<z.ZodString>;
                }, "strict", z.ZodTypeAny, {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                }, {
                    kind: "golden-beads" | "stamp-game";
                    seed: number;
                    notes?: string | undefined;
                    snapshot?: Record<string, unknown> | undefined;
                }>>;
            }, z.ZodUnknown, "strip"> | undefined;
            createdAt?: string | number | undefined;
            updatedAt?: string | number | undefined;
            notes?: string | undefined;
            scenario?: {
                kind: "golden-beads" | "stamp-game";
                seed: number;
                notes?: string | undefined;
                snapshot?: Record<string, unknown> | undefined;
            } | undefined;
            author?: string | undefined;
        } | undefined;
    } | undefined;
    authoringStatus?: "presentation" | "guided" | "practice" | "published" | "not_started" | "outline" | "qa" | undefined;
    assigneeId?: string | undefined;
    gradeLevels?: ("kindergarten" | "grade1" | "grade2" | "grade3")[] | undefined;
    authoringNotes?: string | undefined;
    manifestHash?: string | undefined;
    manifestGeneratedAt?: string | undefined;
    manifestCommit?: string | undefined;
}[]>;

export { type CurriculumClient, type LessonAuthoringUpdate, type SyncManifestInput, type UpdateLessonAuthoringInput, clearAuthToken, createCurriculumClient, createCurriculumHttpClient, createLesson, createTopic, createUnit, curriculumClient, deleteLesson, deleteTopic, deleteUnit, exportManifest, fetchCurriculumTree, fetchLessonById, fetchLessonBySlug, fetchLessonDrafts, fetchUnitBySlug, isCurriculumApiAvailable, isCurriculumAuthReady, listLessons, moveLesson, moveTopic, publishLesson, reorderLessons, reorderTopics, reorderUnits, saveLessonDraft, setCurriculumAuthToken, syncManifest, updateLessonAuthoring, updateTopic, updateUnit };
