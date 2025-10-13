import { Show, createEffect, createMemo, createResource } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import {
  fetchCurriculumTree,
  isCurriculumApiAvailable,
  isCurriculumAuthReady,
  listLessons,
  type CurriculumTree,
  type LessonDraftRecord,
} from '@monte/api';
import { safeBuildLessonTasks } from '../domains/curriculum/utils/lessonTasks';
import { getLessonTaskStatus, useProgress } from '../domains/curriculum/state/progress';
import type { Lesson, LessonTask } from '@monte/types';
import { Button, Card, Chip, PageSection } from '../components/ui';
import { useAuth } from '../providers/AuthProvider';
import { CurriculumAccessNotice, type CurriculumAvailabilityStatus } from '../components/CurriculumAccessNotice';

const Home = () => {
  const navigate = useNavigate();
  const { state, actions } = useProgress();
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

  const fetchCurriculumTreeSafe = async (): Promise<CurriculumTree> => {
    if (!curriculumReady()) {
      return [];
    }
    return fetchCurriculumTree();
  };

  const fetchLessonListSafe = async (): Promise<LessonDraftRecord[]> => {
    if (!curriculumReady()) {
      return [];
    }
    return listLessons();
  };

  const [treeResource, { refetch: refetchTree }] = createResource(fetchCurriculumTreeSafe);
  const [lessonsResource, { refetch: refetchLessons }] = createResource(fetchLessonListSafe);

  createEffect(() => {
    if (curriculumReady()) {
      void refetchTree();
      void refetchLessons();
    }
  });

  createEffect(() => {
    const records = lessonsResource();
    if (!records) return;
    records.forEach((record) => {
      const document = record.published ?? record.draft;
      const lesson = document.lesson;
      const tasks = safeBuildLessonTasks(lesson, 'home.ensureTasks');
      if (tasks.length > 0) {
        actions.ensureTasks(lesson.id, tasks);
      }
    });
  });

  const lessonSummaries = createMemo(() => {
    const records = lessonsResource();
    if (!records) return [] as LessonSummary[];
    return records.map((record) => {
      const document = record.published ?? record.draft;
      const lesson = document.lesson;
      const tasks: LessonTask[] = safeBuildLessonTasks(lesson, 'home.lessonSummaries');
      const progress = state.lessons[lesson.id];
      const orderedTaskIds = progress?.orderedTaskIds ?? tasks.map((task) => task.id);
      const completed = orderedTaskIds.filter(
        (taskId) => getLessonTaskStatus(state, lesson.id, taskId) === 'completed',
      ).length;
      const isComplete = orderedTaskIds.length > 0 && completed === orderedTaskIds.length;
      return {
        id: lesson.id,
        slug: record.slug,
        lesson,
        tasks,
        completed,
        total: orderedTaskIds.length,
        isComplete,
      } satisfies LessonSummary;
    });
  });

  const summary = createMemo(() => {
    const lessons = lessonSummaries();
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((lesson) => lesson.isComplete).length;
    const completedTasks = lessons.reduce((acc, lesson) => acc + lesson.completed, 0);
    const xp = completedTasks * 10;
    const streak = Math.min(completedLessons, 7);
    return {
      totalLessons,
      completedLessons,
      xp,
      streak,
    };
  });

  const nextUnit = createMemo(() => {
    const tree = treeResource();
    if (!tree || tree.length === 0) return undefined;
    return tree[0];
  });

  const handleContinue = () => {
    const unit = nextUnit();
    if (!unit) return;
    void navigate({ to: '/units/$unitSlug', params: { unitSlug: unit.slug } });
  };

  const handleSignIn = () => {
    void navigate({ to: '/auth/sign-in' });
  };

  return (
    <div class="flex min-h-[calc(100vh-6rem)] items-start justify-center px-4 pt-20 pb-12">
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
        <PageSection class="w-full max-w-4xl">
          <Card
            variant="floating"
            class="flex flex-col items-center gap-8 px-6 pb-10 pt-10 text-center sm:px-10"
          >
            <Chip tone="primary" size="sm">
              Welcome back!
            </Chip>
            <div class="space-y-3">
              <h1 class="text-4xl font-semibold leading-tight sm:text-5xl">
                Ready for your next adventure?
              </h1>
              <p class="text-lg text-[color:var(--color-text-muted)] sm:text-xl">
                Keep your streak glowing with just one more lesson today.
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 text-sm sm:text-base">
              <Chip tone="blue">{summary().xp} XP</Chip>
              <Chip tone="yellow">Streak {summary().streak} day{summary().streak === 1 ? '' : 's'}</Chip>
              <Chip tone="green">
                {summary().completedLessons}/{summary().totalLessons} lessons
              </Chip>
            </div>
            <Button onClick={handleContinue} icon={<span aria-hidden>&gt;</span>}>
              Continue learning
            </Button>
            <Show when={auth.role() === 'admin'}>
              <Button variant="secondary" onClick={() => void navigate({ to: '/editor' })}>
                Open lesson editor
              </Button>
            </Show>
          </Card>
        </PageSection>
      </Show>
    </div>
  );
};

interface LessonSummary {
  id: string;
  slug: string;
  lesson: Lesson;
  tasks: LessonTask[];
  completed: number;
  total: number;
  isComplete: boolean;
}

export default Home;
