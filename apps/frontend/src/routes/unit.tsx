import { For, Show, createEffect, createMemo } from 'solid-js';
import { useNavigate, useParams } from '@tanstack/solid-router';

import { curriculumUnits } from '../curriculum/units';
import { curriculumLessons, curriculumTopics } from '../curriculum/lessons';
import { buildLessonTasks } from '../curriculum/utils/lessonTasks';
import { getLessonTaskStatus, useProgress } from '../curriculum/state/progress';
import type { Lesson, LessonTask, UnitTopicRef } from '../curriculum/types';
import { Button, Card, Chip, PageSection, ProgressDots, type ChipProps } from '../design-system';
import { curriculumMaterials } from '../curriculum/materials';

const materialNameMap = new Map(curriculumMaterials.map((material) => [material.id, material.name]));
const lessonMap = new Map(curriculumLessons.map((lesson) => [lesson.id, lesson] as const));
const topicMap = new Map(curriculumTopics.map((topic) => [topic.id, topic] as const));
const lessonTaskMap = new Map<string, LessonTask[]>(curriculumLessons.map((lesson) => [lesson.id, buildLessonTasks(lesson)]));

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

const resolveLessonIds = (ref: UnitTopicRef): string[] => {
  const topic = topicMap.get(ref.topicId);
  if (ref.lessonIds && ref.lessonIds.length > 0) {
    return ref.lessonIds;
  }
  return topic?.lessons.map((lesson) => lesson.id) ?? [];
};

const Unit = () => {
  const navigate = useNavigate();
  const params = useParams({ from: '/units/$unitSlug' });
  const getUnitSlug = (id: string) => id.replace(/^unit-/, '');
  const getLessonSlug = (id: string) => id.replace(/^lesson-/, '');

  const unitSlug = createMemo(() => params().unitSlug);
  const unit = createMemo(() => curriculumUnits.find((item) => getUnitSlug(item.id) === unitSlug()));
  const { actions, state } = useProgress();

  createEffect(() => {
    const activeUnit = unit();
    if (!activeUnit) return;

    activeUnit.topics.forEach((topicRef) => {
      resolveLessonIds(topicRef).forEach((lessonId) => {
        const lesson = lessonMap.get(lessonId);
        if (!lesson) return;
        const tasks = lessonTaskMap.get(lesson.id) ?? [];
        if (tasks.length === 0) return;
        actions.ensureTasks(lesson.id, tasks);
      });
    });
  });

  const pathData = createMemo<PathData>(() => {
    const activeUnit = unit();
    if (!activeUnit) {
      return { topics: [], lessons: [] };
    }

    const topics: TopicDisplay[] = [];
    const lessons: LessonNodeDisplay[] = [];
    let previousComplete = true;

    activeUnit.topics.forEach((topicRef, topicIndex) => {
      const topic = topicMap.get(topicRef.topicId);
      const topicId = topic?.id ?? topicRef.topicId;
      const topicTitle = topic?.title ?? 'Topic in development';
      const topicOverview = topic?.overview;
      const lessonIds = resolveLessonIds(topicRef);
      const entries = lessonIds.length
        ? lessonIds.map((lessonId, lessonIndex) => ({ lessonId, lessonIndex, lesson: lessonMap.get(lessonId) }))
        : [{ lessonId: `${topicId}-coming-soon`, lessonIndex: 0, lesson: undefined }];

      let topicComplete = true;
      const lessonDisplays: LessonNodeDisplay[] = [];

      entries.forEach((entry) => {
        const lesson = entry.lesson;
        const lessonId = entry.lessonId;
        const tasks = lesson ? lessonTaskMap.get(lesson.id) ?? [] : [];
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

        const display: LessonNodeDisplay = {
          id: lessonId,
          lesson,
          title: lesson?.title ?? 'Coming soon',
          summary: lesson?.summary,
          material: lesson ? materialNameMap.get(lesson.primaryMaterialId) ?? lesson.primaryMaterialId : undefined,
          locked,
          status,
          completedTasks,
          totalTasks,
          estimatedDurationMinutes: lesson?.estimatedDurationMinutes,
          topicId,
          topicTitle,
          topicIndex,
          lessonIndex: entry.lessonIndex,
        };

        lessonDisplays.push(display);
        if (!isComplete) {
          topicComplete = false;
        }
        previousComplete = previousComplete && isComplete;
      });

      const topicDisplay: TopicDisplay = {
        id: topicId,
        index: topicIndex,
        title: topicTitle,
        overview: topicOverview,
        locked: lessonDisplays[0]?.locked ?? !previousComplete,
        complete: topicComplete,
        lessons: lessonDisplays,
      };

      topics.push(topicDisplay);
      lessons.push(...lessonDisplays);
    });

    return { topics, lessons };
  });

  const playableLessons = createMemo(() => pathData().lessons.filter((lesson) => Boolean(lesson.lesson)));
  const allLessons = createMemo(() => pathData().lessons);

  const groupedLessons = createMemo(() => {
    const map = new Map<string, LessonNodeDisplay[]>();
    allLessons().forEach((lesson) => {
      const list = map.get(lesson.topicId) ?? [];
      list.push(lesson);
      map.set(lesson.topicId, list);
    });
    return map;
  });

  const overallProgress = createMemo(() => {
    const lessons = playableLessons();
    const completed = lessons.filter((lesson) => lesson.status === 'completed').length;
    return { completed, total: lessons.length };
  });

  const nextLesson = createMemo(() => {
    const lessons = playableLessons();
    if (!lessons.length) return undefined;
    const firstPending = lessons.find((lesson) => lesson.status !== 'completed');
    if (firstPending) {
      return firstPending;
    }
    return lessons[lessons.length - 1];
  });

  const canContinue = createMemo(() => {
    const lesson = nextLesson();
    if (!lesson || lesson.locked || lesson.status === 'coming-soon') return false;
    return Boolean(lesson.lesson);
  });

  const heroButtonLabel = createMemo(() => {
    if (overallProgress().total === 0) return 'Lessons coming soon';
    if (!nextLesson() || !nextLesson()!.lesson) return 'Lessons coming soon';
    if (overallProgress().completed === overallProgress().total) return 'Review lessons';
    return nextLesson()!.status === 'in-progress' ? 'Resume lesson' : 'Continue lesson';
  });

  const focusTopicIndex = createMemo(() => {
    const topics = pathData().topics;
    for (const topic of topics) {
      const lessonsInTopic = groupedLessons().get(topic.id) ?? [];
      const firstIncomplete = lessonsInTopic.find((lesson) => lesson.status !== 'completed');
      if (firstIncomplete) return topic.index;
    }
    return topics.length ? topics[topics.length - 1].index : -1;
  });

  const topicGroups = createMemo(() =>
    pathData().topics.map((topic) => ({ topic, lessons: groupedLessons().get(topic.id) ?? [] })),
  );

  const activeLessonId = createMemo(() => nextLesson()?.id);

  const handleLessonNavigate = (lesson: LessonNodeDisplay) => {
    if (lesson.locked || lesson.status === 'coming-soon' || !lesson.lesson) return;
    void navigate({
      to: '/units/$unitSlug/lessons/$lessonSlug',
      params: { unitSlug: unitSlug(), lessonSlug: getLessonSlug(lesson.lesson.id) },
    });
  };

  const handleContinue = () => {
    const target = nextLesson();
    if (!target) return;
    handleLessonNavigate(target);
  };

  if (!unit()) {
    return (
      <PageSection class="pt-12">
        <Card class="space-y-4 text-center">
          <p class="text-lg font-semibold">We could not find that unit.</p>
          <Button
            variant="secondary"
            size="compact"
            iconPosition="left"
            icon={<span aria-hidden>←</span>}
            onClick={() => void navigate({ to: '/' })}
          >
            Back to units
          </Button>
        </Card>
      </PageSection>
    );
  }

  const activeUnit = unit()!;
  return (
    <div class="space-y-8 pb-12">
      <PageSection class="pt-8">
        <Card variant="floating" class="space-y-6">
          <div class="flex flex-wrap items-end justify-between gap-6">
            <div class="space-y-3">
              <h1 class="text-4xl font-semibold leading-tight">{activeUnit.name}</h1>
              <p class="max-w-2xl text-lg text-subtle">{activeUnit.summary}</p>
              <div class="flex items-center gap-3 text-sm text-subtle">
                <span>
                  Lessons {overallProgress().completed}/{Math.max(overallProgress().total, 1)}
                </span>
                <ProgressDots total={Math.max(overallProgress().total, 1)} completed={overallProgress().completed} />
              </div>
            </div>
            <Show when={nextLesson()?.lesson}>
              <div class="rounded-[var(--radius-lg)] bg-[rgba(233,245,251,0.68)] px-4 py-3 text-sm text-[color:var(--color-heading)] shadow-ambient">
                <p class="text-xs font-semibold uppercase tracking-wide text-label-soft">Next up</p>
                <p class="text-base font-semibold">{nextLesson()!.lesson!.title}</p>
              </div>
            </Show>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <Button onClick={handleContinue} disabled={!canContinue()} icon={<span aria-hidden>&gt;</span>}>
              {heroButtonLabel()}
            </Button>
            <Show when={!canContinue()}>
              <span class="text-sm text-subtle">
                {overallProgress().total === 0
                  ? 'Lessons for this unit are in development.'
                  : 'Finish current lessons to unlock the next step.'}
              </span>
            </Show>
          </div>
        </Card>
      </PageSection>

      <PageSection class="pt-2 pb-6">
        <div class="space-y-6">
          <For each={topicGroups()}>
            {(group) => (
              <TopicJourneyCard
                topic={group.topic}
                lessons={group.lessons}
                activeLessonId={activeLessonId()}
                isActive={group.topic.index === focusTopicIndex()}
                onSelectLesson={handleLessonNavigate}
              />
            )}
          </For>
        </div>
      </PageSection>
    </div>
  );
};

export default Unit;

interface TopicJourneyCardProps {
  topic: TopicDisplay;
  lessons: LessonNodeDisplay[];
  activeLessonId?: string;
  isActive: boolean;
  onSelectLesson: (lesson: LessonNodeDisplay) => void;
}

const TopicJourneyCard = (props: TopicJourneyCardProps) => {
  const visibleLessons = createMemo(() => props.lessons.filter((lesson) => Boolean(lesson.lesson)));
  const completedCount = () => visibleLessons().filter((lesson) => lesson.status === 'completed').length;
  const lessonSummary = () => {
    if (visibleLessons().length === 0) return 'Lessons coming soon';
    if (completedCount() === visibleLessons().length) return 'All lessons complete!';
    return `${completedCount()}/${visibleLessons().length} lessons finished`;
  };

  return (
    <section class={`topic-journey-card ${props.isActive ? 'topic-journey-card--active' : ''}`}>
      <div class="topic-journey-grid">
        <aside class="topic-journey-info">
          <Chip tone={props.topic.complete ? 'green' : props.topic.locked ? 'neutral' : 'primary'} size="sm">
            Topic {props.topic.index + 1}
          </Chip>
          <h2 class="topic-journey-title">{props.topic.title}</h2>
          <Show when={props.topic.overview}>
            <p class="topic-journey-overview">{props.topic.overview}</p>
          </Show>
          <p class="topic-journey-count">{lessonSummary()}</p>
        </aside>
        <div class="topic-journey-lessons">
          <Show
            when={visibleLessons().length > 0}
            fallback={<div class="topic-journey-placeholder">Lessons for this topic are in development.</div>}
          >
            <For each={visibleLessons()}>
              {(lesson) => (
                <LessonJourneyNode
                  lesson={lesson}
                  isActive={props.activeLessonId === lesson.id}
                  onSelect={props.onSelectLesson}
                />
              )}
            </For>
          </Show>
        </div>
      </div>
    </section>
  );
};

interface LessonJourneyNodeProps {
  lesson: LessonNodeDisplay;
  isActive: boolean;
  onSelect: (lesson: LessonNodeDisplay) => void;
}

const LessonJourneyNode = (props: LessonJourneyNodeProps) => {
  const { lesson } = props;
  const disabled = lesson.locked || lesson.status === 'coming-soon' || !lesson.lesson;
  const statusTone = lessonStatusTone[lesson.status];
  const nodeClass = () => {
    const classes = ['journey-card'];
    if (lesson.status === 'completed') classes.push('journey-card--completed');
    if (lesson.status === 'in-progress' || props.isActive) classes.push('journey-card--active');
    if (disabled) classes.push('journey-card--disabled');
    return classes.join(' ');
  };

  const handleSelect = () => {
    if (disabled) return;
    props.onSelect(lesson);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      props.onSelect(lesson);
    }
  };

  return (
    <div class="lesson-journey-item">
      <div
        class={nodeClass()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled ? 'true' : 'false'}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
      >
        <div class="journey-status">
          <Chip tone={statusTone} size="sm">
            {lessonStatusLabel[lesson.status]}
          </Chip>
          <span class="journey-topic-label">{lesson.topicTitle}</span>
        </div>
        <div class="journey-content">
          <h3 class="journey-title">{lesson.title}</h3>
          <Show when={lesson.summary}>
            <p class="journey-summary">{lesson.summary}</p>
          </Show>
          <div class="journey-meta">
            <Show when={lesson.material && lesson.status !== 'coming-soon'}>
              <span class="journey-material-label">{lesson.material}</span>
            </Show>
            <span class="journey-progress">
              {lesson.totalTasks ? `${lesson.completedTasks}/${lesson.totalTasks} steps` : 'Steps coming soon'}
            </span>
          </div>
        </div>
        <div class="journey-cta">
          <Button
            variant={lesson.status === 'completed' ? 'secondary' : 'primary'}
            size="compact"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
          >
            {lesson.status === 'completed' ? 'Review' : lesson.status === 'in-progress' ? 'Resume' : 'Start'}
          </Button>
        </div>
      </div>
    </div>
  );
};
