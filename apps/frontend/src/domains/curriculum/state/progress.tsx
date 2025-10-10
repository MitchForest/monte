import type { JSX } from 'solid-js';
import { createContext, createEffect, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

import type { LessonTask } from '@monte/types';

export type TaskStatus = 'locked' | 'ready' | 'in-progress' | 'completed' | 'incorrect';

interface LessonTaskState {
  status: TaskStatus;
  attempts: number;
}

interface LessonProgressState {
  tasks: Record<string, LessonTaskState>;
  orderedTaskIds: string[];
}

interface ProgressState {
  lessons: Record<string, LessonProgressState>;
}

interface ProgressActions {
  ensureTasks: (lessonId: string, tasks: LessonTask[]) => void;
  markTaskReady: (lessonId: string, taskId: string) => void;
  markTaskStatus: (lessonId: string, taskId: string, status: TaskStatus) => void;
  resetLesson: (lessonId: string) => void;
}

interface ProgressContextValue {
  state: ProgressState;
  actions: ProgressActions;
}

const ProgressContext = createContext<ProgressContextValue>();

const STORAGE_KEY = 'monte:progress-state';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStoredState = (): ProgressState => {
  if (!isBrowser) return { lessons: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lessons: {} };
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || typeof parsed !== 'object' || !parsed.lessons) return { lessons: {} };
    return parsed;
  } catch (error) {
    console.warn('Failed to read stored progress state', error);
    return { lessons: {} };
  }
};

const getInitialTaskState = (index: number): LessonTaskState => ({
  status: index === 0 ? 'ready' : 'locked',
  attempts: 0,
});

export const ProgressProvider = (props: { children: JSX.Element }) => {
  const [state, setState] = createStore<ProgressState>(readStoredState());

  if (isBrowser) {
    createEffect(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to persist progress state', error);
      }
    });
  }

  const ensureTasks: ProgressActions['ensureTasks'] = (lessonId, tasks) => {
    if (tasks.length === 0) return;

    setState('lessons', lessonId, (existingLesson) => {
      if (existingLesson) return existingLesson;

      const orderedTaskIds = tasks.map((task) => task.id);
      const taskState: Record<string, LessonTaskState> = {};
      orderedTaskIds.forEach((taskId, index) => {
        taskState[taskId] = getInitialTaskState(index);
      });

      return {
        tasks: taskState,
        orderedTaskIds,
      } satisfies LessonProgressState;
    });
  };

  const markTaskStatus: ProgressActions['markTaskStatus'] = (lessonId, taskId, status) => {
    setState('lessons', lessonId, 'tasks', taskId, (prev) => {
      if (!prev) return prev;
      const attempts = status === 'incorrect' ? prev.attempts + 1 : prev.attempts;
      const next: LessonTaskState = { ...prev, status, attempts };
      return next;
    });

    if (status === 'completed') {
      const lesson = state.lessons[lessonId];
      if (!lesson) return;
      const index = lesson.orderedTaskIds.indexOf(taskId);
      const nextId = lesson.orderedTaskIds[index + 1];
      if (nextId) {
        setState('lessons', lessonId, 'tasks', nextId, (prev) => {
          if (!prev) return prev;
          if (prev.status === 'locked') {
            const next: LessonTaskState = { ...prev, status: 'ready' };
            return next;
          }
          return prev;
        });
      }
    }
  };

  const markTaskReady: ProgressActions['markTaskReady'] = (lessonId, taskId) => {
    setState('lessons', lessonId, 'tasks', taskId, (prev) => {
      if (!prev) return prev;
      if (prev.status === 'locked') {
        const next: LessonTaskState = { ...prev, status: 'ready' };
        return next;
      }
      return prev;
    });
  };

  const resetLesson: ProgressActions['resetLesson'] = (lessonId) => {
    const lesson = state.lessons[lessonId];
    if (!lesson) return;
    const orderedTaskIds = lesson.orderedTaskIds;
    const taskMap: Record<string, LessonTaskState> = {};
    orderedTaskIds.forEach((id, index) => {
      taskMap[id] = getInitialTaskState(index);
    });
    setState('lessons', lessonId, {
      tasks: taskMap,
      orderedTaskIds,
    });
  };

  return (
    <ProgressContext.Provider value={{ state, actions: { ensureTasks, markTaskReady, markTaskStatus, resetLesson } }}>
      {props.children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
};

export const getLessonTaskStatus = (
  state: ProgressState,
  lessonId: string,
  taskId: string,
): TaskStatus | undefined => state.lessons[lessonId]?.tasks[taskId]?.status;

export const getLessonOrderedTasks = (state: ProgressState, lessonId: string): string[] =>
  state.lessons[lessonId]?.orderedTaskIds ?? [];
