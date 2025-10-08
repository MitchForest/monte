import { createMemo } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import { curriculumTopics } from '../curriculum/lessons';
import { curriculumUnits } from '../curriculum/units';
import { useProgress } from '../curriculum/state/progress';
import { Button, Card, Chip, PageSection } from '../design-system';

const Home = () => {
  const navigate = useNavigate();
  const { state } = useProgress();

  const getUnitSlug = (unitId: string) => unitId.replace(/^unit-/, '');

  const units = createMemo(() =>
    curriculumUnits.map((unit) => {
      const lessonIds = unit.topics.flatMap((topicRef) => {
        const topic = curriculumTopics.find((item) => item.id === topicRef.topicId);
        if (!topic) return [] as string[];
        if (topicRef.lessonIds && topicRef.lessonIds.length > 0) {
          return topicRef.lessonIds;
        }
        return topic.lessons.map((lesson) => lesson.id);
      });

      const lessonCount = lessonIds.length;
      const completedLessons = lessonIds.filter((lessonId) => {
        const lessonProgress = state.lessons[lessonId];
        if (!lessonProgress) return false;
        if (lessonProgress.orderedTaskIds.length === 0) return false;
        return lessonProgress.orderedTaskIds.every(
          (taskId) => lessonProgress.tasks[taskId]?.status === 'completed',
        );
      }).length;

      return {
        ...unit,
        lessonIds,
        lessonCount,
        completedLessons,
        slug: getUnitSlug(unit.id),
      };
    }),
  );

  const summary = createMemo(() => {
    const lessonProgress = state.lessons;
    let completedTasks = 0;

    Object.values(lessonProgress).forEach((lessonState) => {
      if (!lessonState) return;
      lessonState.orderedTaskIds.forEach((taskId) => {
        if (lessonState.tasks[taskId]?.status === 'completed') {
          completedTasks += 1;
        }
      });
    });

    const totalLessons = units().reduce((acc, unit) => acc + unit.lessonCount, 0);
    const completedLessons = units().reduce((acc, unit) => acc + unit.completedLessons, 0);

    const xp = completedTasks * 10;
    const streak = Math.min(completedLessons, 7);

    return {
      totalLessons,
      completedLessons,
      xp,
      streak,
    };
  });

  const nextUnit = createMemo(() => units().find((unit) => unit.completedLessons < unit.lessonCount) ?? units()[0]);

  const handleContinue = () => {
    const unit = nextUnit();
    if (!unit) return;
    void navigate({ to: '/units/$unitSlug', params: { unitSlug: unit.slug } });
  };

  return (
    <div class="flex min-h-[calc(100vh-6rem)] items-start justify-center px-4 pt-20 pb-12">
      <PageSection class="w-full max-w-4xl">
        <Card
          variant="floating"
          class="flex flex-col items-center gap-8 px-6 pb-10 pt-10 text-center sm:px-10"
        >
          <Chip tone="primary" size="sm">
            Hi Taylor!
          </Chip>
          <div class="space-y-3">
            <h1 class="text-4xl font-semibold leading-tight sm:text-5xl">
              Ready for your next adventure?
            </h1>
            <p class="text-lg text-muted sm:text-xl">
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
        </Card>
      </PageSection>
    </div>
  );
};

export default Home;
