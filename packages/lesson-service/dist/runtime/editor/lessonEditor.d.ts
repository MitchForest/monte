import type { LessonDocument, LessonMaterialInventory } from '@monte/types';
interface LessonEditorHistory {
    past: LessonDocument[];
    future: LessonDocument[];
}
export type LessonEditorSelection = {
    kind: 'lesson';
} | {
    kind: 'segment';
    segmentId: string;
} | {
    kind: 'action';
    segmentId: string;
    actionId: string;
} | {
    kind: 'guided-step';
    segmentId: string;
    stepId: string;
} | {
    kind: 'practice-question';
    segmentId: string;
    questionId: string;
} | {
    kind: 'materials';
};
export interface LessonEditorState {
    activeLessonId?: string;
    document?: LessonDocument;
    initialDocument?: LessonDocument;
    dirty: boolean;
    status: 'idle' | 'ready' | 'saving';
    lastSavedAt?: string;
    error?: string;
    history: LessonEditorHistory;
    selection?: LessonEditorSelection;
}
export declare const createLessonEditor: () => {
    readonly state: LessonEditorState;
    readonly loadDocument: (document: LessonDocument) => void;
    readonly applyUpdate: (makeChange: (draft: LessonDocument) => void) => void;
    readonly undo: () => void;
    readonly redo: () => void;
    readonly canUndo: import("solid-js").Accessor<boolean>;
    readonly canRedo: import("solid-js").Accessor<boolean>;
    readonly beginSaving: () => void;
    readonly markSaved: (timestamp?: string) => void;
    readonly resetToInitial: () => void;
    readonly select: (selection: LessonEditorSelection | undefined) => void;
    readonly setError: (message: string) => void;
    readonly applyInventoryUpdate: (mutate: (inventory: LessonMaterialInventory, draft: LessonDocument) => LessonMaterialInventory) => void;
};
export type LessonEditor = ReturnType<typeof createLessonEditor>;
export {};
//# sourceMappingURL=lessonEditor.d.ts.map