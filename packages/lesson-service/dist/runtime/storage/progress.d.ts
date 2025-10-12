export declare const PROGRESS_STORAGE_VERSION = 1;
export type TaskStatus = 'locked' | 'ready' | 'in-progress' | 'completed' | 'incorrect';
export interface LessonTaskState {
    status: TaskStatus;
    attempts: number;
}
export interface LessonProgressState {
    tasks: Record<string, LessonTaskState>;
    orderedTaskIds: string[];
}
export interface LessonAuthoringProgressState {
    lessons: Record<string, LessonProgressState>;
}
export declare const serializeProgressState: (state: LessonAuthoringProgressState) => string;
export declare const deserializeProgressState: (raw: string) => LessonAuthoringProgressState | undefined;
//# sourceMappingURL=progress.d.ts.map