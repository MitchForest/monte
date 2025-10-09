import { createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';

import type { LessonDocument } from '../types';

const cloneDocument = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

interface LessonEditorHistory {
  past: LessonDocument[];
  future: LessonDocument[];
}

export type LessonEditorSelection =
  | { kind: 'lesson' }
  | { kind: 'segment'; segmentId: string }
  | { kind: 'action'; segmentId: string; actionId: string }
  | { kind: 'guided-step'; segmentId: string; stepId: string }
  | { kind: 'practice-question'; segmentId: string; questionId: string }
  | { kind: 'materials' };

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

const HISTORY_LIMIT = 50;

const enqueuePast = (history: LessonEditorHistory, snapshot: LessonDocument): LessonEditorHistory => {
  const nextPast = [...history.past, snapshot];
  if (nextPast.length > HISTORY_LIMIT) {
    nextPast.shift();
  }
  return {
    past: nextPast,
    future: [],
  } satisfies LessonEditorHistory;
};

export const createLessonEditor = () => {
  const [state, setState] = createStore<LessonEditorState>({
    dirty: false,
    status: 'idle',
    history: { past: [], future: [] },
  });

  const loadDocument = (document: LessonDocument) => {
    const cloned = cloneDocument(document);
    setState({
      activeLessonId: cloned.lesson.id,
      document: cloned,
      initialDocument: cloneDocument(cloned),
      dirty: false,
      status: 'ready',
      history: { past: [], future: [] },
      error: undefined,
      selection: undefined,
      lastSavedAt: undefined,
    });
  };

  const applyUpdate = (makeChange: (draft: LessonDocument) => void) => {
    if (!state.document) return;
    try {
      const snapshot = cloneDocument(state.document);
      const draft = cloneDocument(state.document);
      makeChange(draft);
      setState({
        document: draft,
        dirty: true,
        history: enqueuePast(state.history, snapshot),
        activeLessonId: draft.lesson.id,
      });
    } catch (error) {
      console.error('Failed to apply lesson edit', error);
      setState('error', 'Unable to apply changes.');
    }
  };

  const select = (selection: LessonEditorSelection | undefined) => {
    setState('selection', selection);
  };

  const undo = () => {
    if (!state.document) return;
    const nextPast = [...state.history.past];
    if (nextPast.length === 0) return;
    const previous = nextPast.pop()!;
    const currentSnapshot = cloneDocument(state.document);
    setState({
      document: cloneDocument(previous),
      dirty: true,
      history: {
        past: nextPast,
        future: [currentSnapshot, ...state.history.future],
      },
    });
  };

  const redo = () => {
    if (!state.document) return;
    const [next, ...rest] = state.history.future;
    if (!next) return;
    const currentSnapshot = cloneDocument(state.document);
    setState({
      document: cloneDocument(next),
      dirty: true,
      history: {
        past: [...state.history.past, currentSnapshot],
        future: rest,
      },
    });
  };

  const canUndo = createMemo(() => state.history.past.length > 0);
  const canRedo = createMemo(() => state.history.future.length > 0);

  const beginSaving = () => {
    setState({ status: 'saving', error: undefined });
  };

  const markSaved = (timestamp?: string) => {
    if (state.document) {
      setState({
        initialDocument: cloneDocument(state.document),
        dirty: false,
        status: 'ready',
        lastSavedAt: timestamp ?? new Date().toISOString(),
        history: { past: [], future: [] },
      });
    } else {
      setState({ dirty: false, status: 'ready', lastSavedAt: timestamp });
    }
  };

  const resetToInitial = () => {
    if (!state.initialDocument) return;
    const cloned = cloneDocument(state.initialDocument);
    setState({
      document: cloned,
      dirty: false,
      history: { past: [], future: [] },
      selection: undefined,
      status: 'ready',
    });
  };

  const setError = (message: string) => {
    setState({ error: message, status: 'ready' });
  };

  return {
    state,
    loadDocument,
    applyUpdate,
    undo,
    redo,
    canUndo,
    canRedo,
    beginSaving,
    markSaved,
    resetToInitial,
    select,
    setError,
  } as const;
};

export type LessonEditor = ReturnType<typeof createLessonEditor>;
