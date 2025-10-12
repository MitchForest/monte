import { z } from 'zod';

export const PROGRESS_STORAGE_VERSION = 1;

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

const TaskStatusSchema: z.ZodType<TaskStatus> = z.union([
  z.literal('locked'),
  z.literal('ready'),
  z.literal('in-progress'),
  z.literal('completed'),
  z.literal('incorrect'),
]);
const LessonTaskStateSchema: z.ZodType<LessonTaskState> = z.object({
  status: TaskStatusSchema,
  attempts: z.number(),
});
const LessonProgressStateSchema: z.ZodType<LessonProgressState> = z.object({
  tasks: z.record(LessonTaskStateSchema),
  orderedTaskIds: z.array(z.string()),
});
const LessonAuthoringProgressStateSchema: z.ZodType<LessonAuthoringProgressState> = z.object({
  lessons: z.record(LessonProgressStateSchema),
});

const StoredProgressSchema: z.ZodType<{
  version: number;
  state: LessonAuthoringProgressState;
}> = z.object({
  version: z.literal(PROGRESS_STORAGE_VERSION),
  state: LessonAuthoringProgressStateSchema,
});

export const serializeProgressState = (state: LessonAuthoringProgressState): string =>
  JSON.stringify({
    version: PROGRESS_STORAGE_VERSION,
    state,
  });

export const deserializeProgressState = (raw: string): LessonAuthoringProgressState | undefined => {
  const parsed = StoredProgressSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return undefined;
  }
  return parsed.data.state;
};
