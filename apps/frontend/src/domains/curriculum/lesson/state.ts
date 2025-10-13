import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  type Accessor,
  type Setter,
} from 'solid-js';
import { useNavigate, useParams } from '@tanstack/solid-router';

import {
  fetchLessonBySlug,
  fetchUnitBySlug,
  isCurriculumApiAvailable,
  isCurriculumAuthReady,
  type CurriculumTreeUnit,
  type LessonDraftRecord,
} from '@monte/api';
import type {
  Lesson,
  LessonDocument,
  LessonSegment,
  LessonTask,
  LessonScenarioBinding,
} from '@monte/types';
import {
  generateGoldenBeadScenario,
  generateStampGameScenario,
  type GoldenBeadScenario,
  type StampGameScenario,
  type PlayerStatus,
} from '@monte/lesson-service';

import { safeBuildLessonTasks } from '../utils/lessonTasks';
import { useProgress } from '../state/progress';
import { useLessonPlayer } from '../state/lessonPlayer';
import { createLocalEventRecorder } from '../analytics/recorder';
import type { DemoEventRecorder } from '../analytics/events';
import { useAuth } from '../../../providers/AuthProvider';

export type LessonAvailability =
  | 'ready'
  | 'offline'
  | 'loading'
  | 'unauthorized';

export type LessonScenario = GoldenBeadScenario | StampGameScenario | undefined;

export interface LessonStateNavigation {
  unitSlug: Accessor<string | undefined>;
  lessonSlug: Accessor<string | undefined>;
  navigate: ReturnType<typeof useNavigate>;
}

export interface LessonStateResources {
  lesson: ReturnType<typeof createResource<LessonDraftRecord | undefined, string | undefined>>;
  unit: ReturnType<typeof createResource<CurriculumTreeUnit | undefined, string | undefined>>;
}

export interface LessonStateLesson {
  document: Accessor<LessonDocument | undefined>;
  lesson: Accessor<Lesson | undefined>;
  segments: Accessor<LessonSegment[]>;
  tasks: Accessor<LessonTask[]>;
  tasksBySegment: Accessor<Map<string, LessonTask[]>>;
  scenario: Accessor<LessonScenario>;
  timelineSegments: Accessor<Array<{ id: string; title: string; type: string }>>;
  unitTitle: Accessor<string>;
  lessonTitle: Accessor<string>;
}

export interface LessonStatePlayer {
  controller: ReturnType<typeof useLessonPlayer>;
  activeIndex: Accessor<number>;
  activeSegment: Accessor<LessonSegment | undefined>;
  status: Accessor<PlayerStatus>;
  isPlaying: Accessor<boolean>;
  activeSegmentType: Accessor<LessonSegment['type']>;
}

export interface LessonStateUi {
  captionHistory: Accessor<Array<{ text: string; actionIndex: number }>>;
  setCaptionHistory: Setter<Array<{ text: string; actionIndex: number }>>;
  paperNotes: Accessor<string[]>;
  setPaperNotes: Setter<string[]>;
  hasStarted: Accessor<boolean>;
  setHasStarted: Setter<boolean>;
  currentActionIndex: Accessor<number>;
  setCurrentActionIndex: Setter<number>;
  totalActions: Accessor<number>;
  setTotalActions: Setter<number>;
  actionJumpToIndex: Accessor<number | undefined>;
  setActionJumpToIndex: Setter<number | undefined>;
}

export interface LessonStateMeta {
  availability: Accessor<LessonAvailability>;
  fallbackStatus: Accessor<'loading' | 'offline' | 'unauthorized'>;
  curriculumReady: Accessor<boolean>;
  showLoading: Accessor<boolean>;
  showNotFound: Accessor<boolean>;
  error: Accessor<Error | string | undefined>;
  errorMessage: () => string;
}

export interface LessonState {
  navigation: LessonStateNavigation;
  resources: LessonStateResources;
  lesson: LessonStateLesson;
  player: LessonStatePlayer;
  ui: LessonStateUi;
  meta: LessonStateMeta;
  progress: ReturnType<typeof useProgress>;
  recordEvent: DemoEventRecorder;
}

const normalizeScenarioBinding = (value: unknown): LessonScenarioBinding | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Record<string, unknown>;
  const kind = candidate.kind;
  const seed = candidate.seed;
  if (kind !== 'golden-beads' && kind !== 'stamp-game') return undefined;
  if (typeof seed !== 'number') return undefined;
  return { kind, seed } satisfies LessonScenarioBinding;
};

const createScenario = (document: LessonDocument | undefined): LessonScenario => {
  if (!document) return undefined;
  const lessonSegments = document.lesson.segments;

  const segmentScenario = lessonSegments.find((segment) => segment.scenario)?.scenario;
  const directScenario = document.meta?.scenario;
  const metadataScenario =
    document.meta?.metadata && typeof document.meta.metadata === 'object'
      ? (document.meta.metadata as Record<string, unknown>).scenario
      : undefined;

  const binding =
    segmentScenario ??
    directScenario ??
    normalizeScenarioBinding(metadataScenario);
  if (!binding) return undefined;

  if (binding.kind === 'golden-beads') {
    return generateGoldenBeadScenario(binding.seed);
  }
  if (binding.kind === 'stamp-game') {
    return generateStampGameScenario(binding.seed);
  }
  return undefined;
};

export const createLessonState = (): LessonState => {
  const auth = useAuth();
  const params = useParams({ from: '/units/$unitSlug/lessons/$lessonSlug' });
  const navigate = useNavigate();
  const navigation: LessonStateNavigation = {
    unitSlug: createMemo(() => params().unitSlug),
    lessonSlug: createMemo(() => params().lessonSlug),
    navigate,
  };

  const availability = createMemo<LessonAvailability>(() => {
    if (!isCurriculumApiAvailable) return 'offline';
    if (auth.loading()) return 'loading';
    if (!isCurriculumAuthReady()) return 'offline';
    if (!auth.isAuthenticated()) return 'unauthorized';
    return 'ready';
  });

  const curriculumReady = createMemo(() => availability() === 'ready');
  const fallbackStatus = createMemo<'loading' | 'offline' | 'unauthorized'>(() => {
    if (availability() === 'ready') return 'loading';
    if (availability() === 'loading') return 'loading';
    if (availability() === 'unauthorized') return 'unauthorized';
    return 'offline';
  });

  const lessonResource = createResource<LessonDraftRecord | undefined, string | undefined>(
    () => {
      const slug = navigation.lessonSlug();
      return curriculumReady() && slug ? slug : undefined;
    },
    async (slug) => {
      if (!slug) return undefined;
      return fetchLessonBySlug(slug);
    },
  );

  const unitResource = createResource<CurriculumTreeUnit | undefined, string | undefined>(
    () => {
      const slug = navigation.unitSlug();
      return curriculumReady() && slug ? slug : undefined;
    },
    async (slug) => {
      if (!slug) return undefined;
      return fetchUnitBySlug(slug);
    },
  );

  const lessonDocument = createMemo<LessonDocument | undefined>(() => {
    const record = lessonResource[0]();
    if (!record) return undefined;
    return record.published ?? record.draft;
  });

  const lesson = createMemo<Lesson | undefined>(() => lessonDocument()?.lesson);
  const segments = createMemo(() => lesson()?.segments ?? []);
  const tasks = createMemo<LessonTask[]>(() => safeBuildLessonTasks(lesson(), 'lesson.viewModel'));

  const tasksBySegment = createMemo(() => {
    const map = new Map<string, LessonTask[]>();
    tasks().forEach((task) => {
      const existing = map.get(task.segmentId) ?? [];
      map.set(task.segmentId, [...existing, task]);
    });
    return map;
  });

  const progress = useProgress();

  createEffect(() => {
    const currentLesson = lesson();
    if (!currentLesson) return;
    const lessonTasks = tasks();
    if (lessonTasks.length === 0) return;
    progress.actions.ensureTasks(currentLesson.id, lessonTasks);
  });

  const player = useLessonPlayer(() => segments().length);
  const activeIndex = createMemo(() => {
    const contextIndex = player.state()?.context.index ?? 0;
    return Math.min(contextIndex, Math.max(segments().length - 1, 0));
  });
  const activeSegment = createMemo(() => segments()[activeIndex()] ?? segments()[0]);
  const status = createMemo(() => player.status());
  const isPlaying = createMemo(() => status() === 'playing');
  const activeSegmentType = createMemo(() => activeSegment()?.type ?? 'presentation');

  const scenario = createMemo<LessonScenario>(() => createScenario(lessonDocument()));

  const [captionHistory, setCaptionHistory] = createSignal<Array<{ text: string; actionIndex: number }>>([]);
  const [paperNotes, setPaperNotes] = createSignal<string[]>([]);
  const [hasStarted, setHasStarted] = createSignal(false);
  const [currentActionIndex, setCurrentActionIndex] = createSignal(0);
  const [totalActions, setTotalActions] = createSignal(0);
  const [actionJumpToIndex, setActionJumpToIndex] = createSignal<number | undefined>(undefined);

  const timelineSegments = createMemo(() =>
    segments().map((segment) => ({
      id: segment.id,
      title: segment.title,
      type: segment.type,
    })),
  );

  const unitTitle = createMemo(() => {
    const unit = unitResource[0]();
    if (!unit?.title) return 'Unit';
    return unit.title;
  });

  const lessonTitle = createMemo(() => {
    const document = lessonDocument();
    if (!document?.lesson?.title) return 'Lesson';
    return document.lesson.title;
  });

  const showLoading = createMemo(() => !lesson() && lessonResource[0].loading);
  const lessonError = createMemo(() => lessonResource[0].error as Error | string | undefined);
  const showNotFound = createMemo(() => !lessonResource[0].loading && !lessonError() && !lesson());

  const lessonErrorMessage = () => {
    const error = lessonError();
    if (!error) return 'Unable to load lesson.';
    if (error instanceof Error) return error.message || 'Unable to load lesson.';
    return typeof error === 'string' ? error : 'Unable to load lesson.';
  };

  const recordEvent = createLocalEventRecorder();

  return {
    navigation,
    resources: {
      lesson: lessonResource,
      unit: unitResource,
    },
    lesson: {
      document: lessonDocument,
      lesson,
      segments,
      tasks,
      tasksBySegment,
      scenario,
      timelineSegments,
      unitTitle,
      lessonTitle,
    },
    player: {
      controller: player,
      activeIndex,
      activeSegment,
      status,
      isPlaying,
      activeSegmentType,
    },
    ui: {
      captionHistory,
      setCaptionHistory,
      paperNotes,
      setPaperNotes,
      hasStarted,
      setHasStarted,
      currentActionIndex,
      setCurrentActionIndex,
      totalActions,
      setTotalActions,
      actionJumpToIndex,
      setActionJumpToIndex,
    },
    meta: {
      availability,
      fallbackStatus,
      curriculumReady,
      showLoading,
      showNotFound,
      error: lessonError,
      errorMessage: lessonErrorMessage,
    },
    progress,
    recordEvent,
  };
};
