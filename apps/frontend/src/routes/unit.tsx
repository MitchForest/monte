import { For, Show, createEffect, createMemo, createResource } from 'solid-js';
import { useNavigate, useParams } from '@tanstack/solid-router';

import {
  fetchUnitBySlug,
  fetchLessonsByUnit,
  isCurriculumAuthReady,
  isCurriculumApiAvailable,
  type CurriculumTreeUnit,
  type LessonDraftRecord,
} from '@monte/api';
import { curriculumMaterials } from '../domains/curriculum/materials';
import { getLessonTaskStatus, useProgress } from '../domains/curriculum/state/progress';
import { safeBuildLessonTasks } from '../domains/curriculum/utils/lessonTasks';
import type { Id, Lesson, LessonTask } from '@monte/types';
import { Button, Card, Chip, PageSection, ProgressDots, type ChipProps } from '../components/ui';
import { CurriculumAccessNotice, type CurriculumAvailabilityStatus } from '../components/CurriculumAccessNotice';
import { useAuth } from '../providers/AuthProvider';

const materialNameMap = new Map(curriculumMaterials.map((material) => [material.id, material.name]));

type ChipTone = NonNullable<ChipProps['tone']>;
type LessonStatus = 'locked' | 'ready' | 'in-progress' | 'completed' | 'coming-soon';

const lessonStatusTone: Record<LessonStatus, ChipTone> = {
  locked: 'neutral',
  ready: 'primary',
  'in-progress': 'blue',
  completed: 'green',
  'coming-soon': 'neutral',
};

const lessonStatusLabel: Record<LessonStatus, string> = {
  locked: 'Locked',
  ready: 'Ready',
  'in-progress': 'In progress',
  completed: 'Completed',
  'coming-soon': 'Coming soon',
};

interface LessonNodeDisplay {
  id: string;
  slug: string;
  lesson?: Lesson;
  title: string;
  summary?: string;
  material?: string;
  locked: boolean;
  status: LessonStatus;
  completedTasks: number;
  totalTasks: number;
  estimatedDurationMinutes?: number;
  topicId: string;
  topicTitle: string;
  topicIndex: number;
  lessonIndex: number;
}

interface TopicDisplay {
  id: string;
  index: number;
  title: string;
  overview?: string;
  locked: boolean;
  complete: boolean;
  lessons: LessonNodeDisplay[];
}

interface PathData {
  topics: TopicDisplay[];
  lessons: LessonNodeDisplay[];
}

const Unit = () => {
  const navigate = useNavigate();
  const params = useParams({ from: '/units/$unitSlug' });
  const unitSlug = createMemo(() => params().unitSlug);
  const { actions, state } = useProgress();
  const auth = useAuth();
  type Availability = 'ready' | CurriculumAvailabilityStatus;
  const availability = createMemo<Availability>(() => {
    if (!isCurriculumApiAvailable) return 'offline';
    if (auth.loading()) return 'loading';
    if (!isCurriculumAuthReady()) return 'offline';
    if (!auth.isAuthenticated()) return 'unauthorized';
    return 'ready';
  });
  const curriculumReady = createMemo(() => availability() === 'ready');

  const [unitResource, { refetch: refetchUnit }] = createResource<CurriculumTreeUnit | undefined, string | undefined>(
    unitSlug,
    async (slug) => {
      if (!slug || !curriculumReady()) {
        return undefined;
      }
      return fetchUnitBySlug(slug);
    },
  );

  const [lessonsResource, { refetch: refetchLessons }] = createResource(
    () => {
      const unit = unitResource();
      return curriculumReady() && unit ? unit._id : undefined;
    },
    async (unitId: Id<'units'> | undefined): Promise<LessonDraftRecord[]> => {
      if (!unitId) return [];
      return fetchLessonsByUnit(unitId);
    },
  );

  createEffect(() => {
    if (!curriculumReady()) return;
    const slug = unitSlug();
    if (slug) {
      void refetchUnit();
    }
  });

  createEffect(() => {
    if (!curriculumReady()) return;
    const unit = unitResource();
    if (unit?._id) {
      void refetchLessons();
    }
  });

  const unitData = createMemo(() => unitResource());
  const lessonRecords = createMemo(() => lessonsResource() ?? []);

  createEffect(() => {
    const unit = unitData();
    const records = lessonRecords();
    if (!unit || records.length === 0) return;

    unit.topics.forEach((topic) => {
      topic.lessons.forEach((lessonMeta) => {
        const record = records.find((entry) => entry._id === lessonMeta._id);
        const document = record?.published ?? record?.draft;
        if (!document) return;
        const lesson = document.lesson;
        const tasks = safeBuildLessonTasks(lesson, 'unit.ensureTasks');
        if (tasks.length > 0) {
          actions.ensureTasks(lesson.id, tasks);
        }
      });
    });
  });

  const pathData = createMemo<PathData>(() => {
    const unit = unitData();
    const records = lessonRecords();
    if (!unit) {
      return { topics: [], lessons: [] };
    }

    const topics: TopicDisplay[] = [];
    const lessons: LessonNodeDisplay[] = [];
    let previousComplete = true;

    unit.topics.forEach((topic, topicIndex) => {
      const topicLessons: LessonNodeDisplay[] = [];
      let topicComplete = true;

      const topicRecords = topic.lessons.length
        ? topic.lessons.map((meta, lessonIndex) => {
            const record = records.find((entry) => entry._id === meta._id);
            return { meta, record, lessonIndex };
          })
        : [
            {
              meta: {
                _id: `${topic._id}-coming-soon`,
                slug: `${topic._id}-coming-soon`,
                title: 'Coming soon',
                summary: undefined,
                status: 'draft',
                updatedAt: Date.now(),
              },
              record: undefined,
              lessonIndex: 0,
            },
          ];

      topicRecords.forEach(({ meta, record, lessonIndex }) => {
        const document = record?.published ?? record?.draft;
        const lesson = document?.lesson;
        const lessonId = lesson?.id ?? `${meta.slug}-draft`;
        let tasks: LessonTask[] = [];
        if (lesson) {
          tasks = safeBuildLessonTasks(lesson, 'unit.pathData');
        }
        const progress = lesson ? state.lessons[lesson.id] : undefined;
        const orderedTaskIds = lesson
          ? progress?.orderedTaskIds ?? tasks.map((task) => task.id)
          : [];
        const totalTasks = lesson ? orderedTaskIds.length : 0;
        const completedTasks = lesson
          ? orderedTaskIds.filter((taskId) => getLessonTaskStatus(state, lesson.id, taskId) === 'completed').length
          : 0;
        const hasActive = lesson
          ? orderedTaskIds.some((taskId) => {
              const status = getLessonTaskStatus(state, lesson.id, taskId);
              return status === 'in-progress' || status === 'incorrect';
            })
          : false;
        const isComplete = lesson ? totalTasks > 0 && completedTasks === totalTasks : false;
        const locked = !previousComplete || !lesson;

        const status: LessonStatus = !lesson
          ? 'coming-soon'
          : isComplete
          ? 'completed'
          : locked
          ? 'locked'
          : hasActive || completedTasks > 0
          ? 'in-progress'
          : 'ready';

        const node: LessonNodeDisplay = {
          id: lessonId,
          slug: meta.slug,
          lesson,
          title: meta.title ?? lesson?.title ?? 'Coming soon',
          summary: meta.summary ?? lesson?.summary,
          material: lesson ? materialNameMap.get(lesson.primaryMaterialId) ?? lesson.primaryMaterialId : undefined,
          locked,
          status,
          completedTasks,
          totalTasks,
          estimatedDurationMinutes: lesson?.estimatedDurationMinutes,
          topicId: topic._id,
          topicTitle: topic.title,
          topicIndex,
          lessonIndex,
        };

        topicLessons.push(node);
        lessons.push(node);
        if (!isComplete) {
          topicComplete = false;
        }
        previousComplete = previousComplete && isComplete;
      });

      topics.push({
        id: topic._id,
        index: topicIndex,
        title: topic.title,
        overview: topic.overview,
        locked: topicLessons[0]?.locked ?? true,
        complete: topicComplete,
        lessons: topicLessons,
      });
    });

    return { topics, lessons };
  });

  const playableLessons = createMemo(() => pathData().lessons.filter((lesson) => Boolean(lesson.lesson)));
  const allLessons = createMemo(() => pathData().lessons);
  const completedLessonCount = createMemo(() =>
    playableLessons().filter((lesson) => lesson.status === 'completed').length,
  );

  const handleStartLesson = (lesson: LessonNodeDisplay) => {
    if (!lesson.lesson) return;
    const slug = unitSlug();
    if (!slug) return;
    void navigate({
      to: '/units/$unitSlug/lessons/$lessonSlug',
      params: { unitSlug: slug, lessonSlug: lesson.slug },
    });
  };

  const handleSignIn = () => {
    void navigate({ to: '/auth/sign-in' });
  };

  return (
    <div class="min-h-screen bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] px-4 pb-16 pt-16">
      <Show
        when={curriculumReady()}
        fallback=
          {
            <CurriculumAccessNotice
              status={availability() === 'ready' ? 'loading' : (availability() as CurriculumAvailabilityStatus)}
              onSignIn={handleSignIn}
            />
          }
      >
        <PageSection class="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <Show when={unitData()} fallback={<Card class="p-6 text-center text-[color:var(--color-text-muted)]">Loading unit…</Card>}>
            {(unit) => (
              <>
              <header class="space-y-3">
                <Chip tone="primary" size="sm">
                  Learning path
                </Chip>
                <h1 class="text-3xl font-semibold leading-tight">{unit().title}</h1>
                <p class="text-[color:var(--color-text-muted)] text-base">{unit().summary ?? 'Expand this unit in the authoring tool to add a description.'}</p>
              </header>

              <section class="grid gap-4 md:grid-cols-2">
                <Card variant="soft" class="space-y-3 p-4">
                  <h2 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Progress</h2>
                  <div class="flex items-center gap-3">
                    <ProgressDots
                      total={allLessons().length}
                      completed={completedLessonCount()}
                    />
                    <span class="text-sm text-[color:var(--color-text-muted)]">
                      {completedLessonCount()}/{playableLessons().length} lessons completed
                    </span>
                  </div>
                </Card>

                <Card variant="soft" class="space-y-3 p-4">
                  <h2 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Lessons</h2>
                  <div class="space-y-2">
                    <For each={playableLessons()}>
                      {(lesson) => (
                        <div class="flex items-center justify-between rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 text-sm shadow-sm">
                          <div class="flex flex-col">
                            <span class="font-medium">{lesson.title}</span>
                            <span class="text-xs text-[color:var(--color-text-muted)]">
                              {lesson.material ?? 'Material TBD'} · {lesson.estimatedDurationMinutes ?? 15} min
                            </span>
                          </div>
                          <Chip tone={lessonStatusTone[lesson.status]} size="sm">
                            {lessonStatusLabel[lesson.status]}
                          </Chip>
                        </div>
                      )}
                    </For>
                    <Show when={playableLessons().length === 0}>
                      <p class="text-xs text-[color:var(--color-text-muted)]">Add lessons in the editor to populate this unit.</p>
                    </Show>
                  </div>
                </Card>
              </section>

              <section class="space-y-6">
                <For each={pathData().topics}>
                  {(topic) => (
                    <Card variant="floating" class="space-y-4 p-5">
                      <header class="space-y-2">
                        <div class="flex items-center justify-between">
                          <h2 class="text-2xl font-semibold">{topic.title}</h2>
                          <Chip tone={topic.complete ? 'green' : 'primary'} size="sm">
                            {topic.complete ? 'Complete' : topic.locked ? 'Locked' : 'In progress'}
                          </Chip>
                        </div>
                        <p class="text-[color:var(--color-text-muted)] text-sm">{topic.overview ?? 'Describe this topic in the editor.'}</p>
                      </header>

                      <div class="space-y-3">
                        <For each={topic.lessons}>
                          {(lesson) => (
                            <div class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-3 text-sm shadow-sm">
                              <div class="flex-1 min-w-[200px]">
                                <p class="font-medium">{lesson.title}</p>
                                <p class="text-xs text-[color:var(--color-text-muted)]">
                                  {lesson.summary ?? 'Add a summary to this lesson in the editor.'}
                                </p>
                                <Show when={lesson.totalTasks > 0}>
                                  <p class="text-xs text-[color:var(--color-text-muted)] mt-1">
                                    {lesson.completedTasks}/{lesson.totalTasks} tasks completed
                                  </p>
                                </Show>
                              </div>
                              <div class="flex items-center gap-2">
                                <Chip tone={lessonStatusTone[lesson.status]} size="sm">
                                  {lessonStatusLabel[lesson.status]}
                                </Chip>
                                <Button
                                  variant="primary"
                                  size="compact"
                                  disabled={lesson.locked || !lesson.lesson}
                                  onClick={() => handleStartLesson(lesson)}
                                >
                                  {lesson.locked
                                    ? 'Locked'
                                    : lesson.status === 'in-progress'
                                    ? 'Resume'
                                    : lesson.status === 'completed'
                                    ? 'Review'
                                    : 'Start lesson'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </Card>
                  )}
                </For>
                <Show when={pathData().topics.length === 0}>
                  <Card class="p-6 text-center text-[color:var(--color-text-muted)]">No topics yet. Add topics to this unit in the editor.</Card>
                </Show>
              </section>
              </>
            )}
          </Show>
        </PageSection>
      </Show>
    </div>
  );
};

export default Unit;
