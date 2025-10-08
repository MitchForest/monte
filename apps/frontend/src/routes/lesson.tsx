import { Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useNavigate, useParams } from '@tanstack/solid-router';
import { createActor, type ActorRefFrom } from 'xstate';

import { curriculumLessons, curriculumTopics } from '../curriculum/lessons';
import { buildLessonTasks } from '../curriculum/utils/lessonTasks';
import { useProgress } from '../curriculum/state/progress';
import { createLessonPlayerMachine, type PlayerEvent, type PlayerStatus } from '../curriculum/machines/lessonPlayer';
import type {
  GuidedEvaluatorId,
  GuidedStep,
  Lesson,
  LessonSegment,
  PracticeQuestion,
  PresentationScript,
  Topic,
} from '../curriculum/types';
import { LessonTimeline } from '../curriculum/components/LessonTimeline';
import { PresentationSegment } from '../curriculum/components/segments/PresentationSegment';
import { GuidedSegment } from '../curriculum/components/segments/GuidedSegment';
import { PracticeSegment } from '../curriculum/components/segments/PracticeSegment';
import {
  generateGoldenBeadScenario,
  generateStampGameScenario,
  buildGoldenBeadPresentationScript,
  buildStampGamePresentationScript,
  buildGoldenBeadGuidedSteps,
  buildStampGameGuidedSteps,
  buildGoldenBeadPractice,
  buildStampGamePractice,
  goldenBeadPassCriteria,
  stampGamePassCriteria,
  type GoldenBeadScenario,
  type StampGameScenario,
} from '../curriculum/scenarios/multiplication';
import { Button, Card, Chip, PageSection } from '../design-system';

const segmentTypeLabel: Record<string, string> = {
  presentation: 'Tutorial',
  guided: 'Guided practice',
  practice: 'Independent practice',
};

type LessonScenario = GoldenBeadScenario | StampGameScenario | undefined;

const scenarioStorageKey = (lessonId: string) => `monte:scenario:${lessonId}`;

const loadScenarioFromStorage = (lessonId: string): LessonScenario => {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.sessionStorage.getItem(scenarioStorageKey(lessonId));
    if (!raw) return undefined;
    return JSON.parse(raw) as LessonScenario;
  } catch (error) {
    console.warn('Failed to load stored scenario', error);
    return undefined;
  }
};

const saveScenarioToStorage = (lessonId: string, scenario: LessonScenario) => {
  if (typeof window === 'undefined') return;
  if (!scenario) {
    window.sessionStorage.removeItem(scenarioStorageKey(lessonId));
    return;
  }
  window.sessionStorage.setItem(scenarioStorageKey(lessonId), JSON.stringify(scenario));
};

const createScenarioForLesson = (lessonId: string): LessonScenario => {
  switch (lessonId) {
    case 'lesson-multiplication-golden-beads':
      return generateGoldenBeadScenario();
    case 'lesson-multiplication-stamp-game':
      return generateStampGameScenario();
    default:
      return undefined;
  }
};

const Lesson = () => {
  const params = useParams({ from: '/units/$unitSlug/lessons/$lessonSlug' });
  const getLessonSlug = (id: string) => id.replace(/^lesson-/, '');
  const lessonSlug = createMemo(() => params().lessonSlug);
  const navigate = useNavigate();
  const lesson = createMemo<Lesson | undefined>(() =>
    curriculumLessons.find((item) => getLessonSlug(item.id) === lessonSlug()),
  );
  const topic = createMemo<Topic | undefined>(() => curriculumTopics.find((item) => item.id === lesson()?.topicId));
  const segments = createMemo(() => lesson()?.segments ?? []);
  const tasks = createMemo(() => {
    if (!lesson()) return [];
    return buildLessonTasks(lesson()!);
  });

  const { actions: progressActions } = useProgress();

  createEffect(() => {
    if (lesson()) {
      progressActions.ensureTasks(lesson()!.id, tasks());
    }
  });

  const tasksBySegment = createMemo(() => {
    const map = new Map<string, ReturnType<typeof tasks>>();
    tasks().forEach((task) => {
      const existing = map.get(task.segmentId) ?? [];
      map.set(task.segmentId, [...existing, task]);
    });
    return map;
  });

  type LessonMachine = ReturnType<typeof createLessonPlayerMachine>;
  type LessonActor = ActorRefFrom<LessonMachine>;
  type LessonSnapshot = ReturnType<LessonActor['getSnapshot']>;

  const [playerState, setPlayerState] = createSignal<LessonSnapshot | null>(null);
  const [service, setService] = createSignal<LessonActor | null>(null);
  const [lessonScenarios, setLessonScenarios] = createStore<Record<string, LessonScenario>>({});

  const currentScenario = createMemo<LessonScenario>(() => {
    const lessonValue = lesson();
    if (!lessonValue) return undefined;
    const existing = lessonScenarios[lessonValue.id] ?? loadScenarioFromStorage(lessonValue.id);
    if (existing) {
      if (!lessonScenarios[lessonValue.id]) {
        setLessonScenarios(lessonValue.id, existing);
      }
      return existing;
    }
    const generated = createScenarioForLesson(lessonValue.id);
    if (generated) {
      setLessonScenarios(lessonValue.id, generated);
      saveScenarioToStorage(lessonValue.id, generated);
    }
    return generated;
  });

  createEffect(() => {
    const lessonValue = lesson();
    if (!lessonValue) return;

    const machine = createLessonPlayerMachine(lessonValue.segments.length);
    const actor = createActor(machine);

    setPlayerState(actor.getSnapshot());
    const subscription = actor.subscribe((state) => setPlayerState(state));
    actor.start();
    setPlayerState(actor.getSnapshot());
    setService(actor);

    onCleanup(() => {
      subscription.unsubscribe();
      actor.stop();
    });
  });

  const send = (event: PlayerEvent) => service()?.send(event);

  const activeIndex = createMemo(() => {
    const contextIndex = playerState()?.context.index ?? 0;
    return Math.min(contextIndex, Math.max(segments().length - 1, 0));
  });

  const activeSegment = createMemo(() => segments()[activeIndex()] ?? segments()[0]);
  const status = createMemo<PlayerStatus>(() => playerState()?.context.status ?? 'idle');
  const isPlaying = createMemo(() => status() === 'playing');
  const activeSegmentType = createMemo(() => activeSegment()?.type ?? 'presentation');

  if (!lesson()) {
    return (
      <div class="min-h-screen bg-shell">
        <PageSection class="flex h-[70vh] flex-col items-center justify-center space-y-4">
          <Card class="space-y-4 text-center">
            <p class="text-lg font-semibold">We could not find that lesson.</p>
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
      </div>
    );
  }

  const markSegmentTasksCompleted = (segmentId: string) => {
    const relatedTasks = tasksBySegment().get(segmentId);
    if (!relatedTasks) return;
    relatedTasks.forEach((task) => progressActions.markTaskStatus(lesson()!.id, task.id, 'completed'));
  };

  const handlePresentationComplete = () => {
    const currentSegment = activeSegment();
    if (!currentSegment) return;
    markSegmentTasksCompleted(currentSegment.id);
    send({ type: 'COMPLETE' });
  };

  const handleGuidedComplete = (segmentId: string) => {
    markSegmentTasksCompleted(segmentId);
    send({ type: 'COMPLETE' });
  };

  const handlePracticeTaskResult = (taskId: string, status: 'completed' | 'incorrect') => {
    progressActions.markTaskStatus(lesson()!.id, taskId, status);
  };

  const handlePracticeResult = (segmentId: string, result: 'pass' | 'fail') => {
    const segmentTasks = tasksBySegment().get(segmentId) ?? [];

    if (result === 'pass') {
      segmentTasks.forEach((task) => progressActions.markTaskStatus(lesson()!.id, task.id, 'completed'));
      send({ type: 'COMPLETE' });
      return;
    }

    segmentTasks.forEach((task) => progressActions.markTaskStatus(lesson()!.id, task.id, 'incorrect'));
    progressActions.resetLesson(lesson()!.id);
    const refreshed = createScenarioForLesson(lesson()!.id);
    setLessonScenarios(lesson()!.id, refreshed);
    saveScenarioToStorage(lesson()!.id, refreshed);
    send({ type: 'SET_INDEX', index: 0 });
  };

  const isPresentationSegment = createMemo(() => activeSegment()?.type === 'presentation');
  const showPlayOverlay = createMemo(() => isPresentationSegment() && status() !== 'playing');

  const handleTogglePlay = () => {
    if (status() === 'playing') {
      send({ type: 'PAUSE' });
      return;
    }
    send({ type: 'PLAY' });
  };

  const handleDockSelect = (index: number) => {
    send({ type: 'SET_INDEX', index });
  };

  const timelineSegments = createMemo(() =>
    segments().map((segment) => ({
      id: segment.id,
      title: segment.title,
      type: segment.type,
    })),
  );

  return (
    <div class="lesson-screen">
      <div class="lesson-player-wrapper">
        <div class="lesson-player-frame">
          {/* REMOVED: All header overlays, titles, and chips per cognitive load requirements */}
          {/* K-3 learners need ZERO distractions - only the content matters */}
          
          <div class="lesson-player-surface">
            <Show when={lesson()} keyed>
              {(currentLesson) => (
                <Show when={activeSegment()} keyed>
                  {(segment) => (
                    <SegmentContent
                      lesson={currentLesson}
                      segment={segment}
                      playerStatus={status()}
                      onPresentationComplete={handlePresentationComplete}
                      onGuidedComplete={handleGuidedComplete}
                      onPracticeResult={handlePracticeResult}
                      onPracticeTaskResult={handlePracticeTaskResult}
                      scenario={currentScenario()}
                    />
                  )}
                </Show>
              )}
            </Show>
          </div>
        </div>
      </div>

      <LessonDock
        segments={timelineSegments()}
        activeIndex={activeIndex()}
        onSelect={handleDockSelect}
        onTogglePlay={handleTogglePlay}
        isPlaying={isPlaying()}
      />
    </div>
  );
};

interface LessonDockProps {
  segments: { id: string; title: string; type: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
}

const LessonDock = (props: LessonDockProps) => {
  return (
    <footer class="lesson-dock">
      <div class="lesson-dock-inner">
        <Button
          variant="secondary"
          size="compact"
          onClick={props.onTogglePlay}
          class="lesson-dock-play"
          aria-pressed={props.isPlaying}
        >
          {props.isPlaying ? 'Pause' : 'Play'}
        </Button>
        <LessonTimeline segments={props.segments} activeIndex={props.activeIndex} onSelect={props.onSelect} />
      </div>
    </footer>
  );
};

const SegmentContent = (props: {
  lesson: Lesson;
  segment: LessonSegment;
  playerStatus: PlayerStatus;
  onPresentationComplete: () => void;
  onGuidedComplete: (segmentId: string) => void;
  onPracticeResult: (segmentId: string, result: 'pass' | 'fail') => void;
  onPracticeTaskResult: (taskId: string, status: 'completed' | 'incorrect') => void;
  scenario?: LessonScenario;
}) => {
  const scenario = () => props.scenario;

  const presentationScript = createMemo<PresentationScript | undefined>(() => {
    if (props.segment.type !== 'presentation') return undefined;
    if (props.lesson.id === 'lesson-multiplication-golden-beads' && scenario()?.kind === 'golden-beads') {
      return buildGoldenBeadPresentationScript(scenario() as GoldenBeadScenario);
    }
    if (props.lesson.id === 'lesson-multiplication-stamp-game' && scenario()?.kind === 'stamp-game') {
      return buildStampGamePresentationScript(scenario() as StampGameScenario);
    }
    return undefined;
  });

  const guidedSteps = createMemo<(GuidedStep & { evaluatorId: GuidedEvaluatorId })[]>(() => {
    if (props.segment.type !== 'guided') return [];
    if (props.lesson.id === 'lesson-multiplication-golden-beads' && scenario()?.kind === 'golden-beads') {
      return buildGoldenBeadGuidedSteps(scenario() as GoldenBeadScenario);
    }
    if (props.lesson.id === 'lesson-multiplication-stamp-game' && scenario()?.kind === 'stamp-game') {
      return buildStampGameGuidedSteps(scenario() as StampGameScenario);
    }
    return props.segment.steps;
  });

  const practiceConfig = createMemo(() => {
    if (props.segment.type !== 'practice') {
      return {
        questions: [] as PracticeQuestion[],
        passCriteria: undefined,
        refreshKey: 0,
      } as const;
    }

    if (props.lesson.id === 'lesson-multiplication-golden-beads' && scenario()?.kind === 'golden-beads') {
      const concreteScenario = scenario() as GoldenBeadScenario;
      return {
        questions: buildGoldenBeadPractice(concreteScenario),
        passCriteria: goldenBeadPassCriteria,
        refreshKey: concreteScenario.product,
      } as const;
    }

    if (props.lesson.id === 'lesson-multiplication-stamp-game' && scenario()?.kind === 'stamp-game') {
      const concreteScenario = scenario() as StampGameScenario;
      return {
        questions: buildStampGamePractice(concreteScenario),
        passCriteria: stampGamePassCriteria,
        refreshKey: concreteScenario.product,
      } as const;
    }

    return {
      questions: props.segment.questions,
      passCriteria: props.segment.passCriteria,
      refreshKey: 0,
    } as const;
  });

  if (props.segment.type === 'presentation') {
    const script = presentationScript();
    if (!script) {
      return (
        <Card variant="soft" class="space-y-3 text-subtle">
          <p>Presentation script unavailable.</p>
        </Card>
      );
    }

    return (
      <PresentationSegment
        lessonId={props.lesson.id}
        segment={props.segment}
        playerStatus={props.playerStatus}
        onAutoAdvance={props.onPresentationComplete}
        script={script}
      />
    );
  }

  if (props.segment.type === 'guided') {
    return (
      <GuidedSegment
        lessonId={props.lesson.id}
        segment={props.segment}
        steps={guidedSteps().length ? guidedSteps() : props.segment.steps}
        scenario={scenario()}
        onSegmentComplete={() => props.onGuidedComplete(props.segment.id)}
      />
    );
  }

  if (props.segment.type === 'practice') {
    const config = practiceConfig();

    return (
      <PracticeSegment
        lessonId={props.lesson.id}
        segment={props.segment}
        questions={config.questions.length ? config.questions : props.segment.questions}
        passCriteria={config.passCriteria ?? props.segment.passCriteria}
        refreshKey={config.refreshKey}
        onSegmentResult={(result) => props.onPracticeResult(props.segment.id, result)}
        onTaskResult={props.onPracticeTaskResult}
      />
    );
  }

  return (
    <div class="rounded-[var(--radius-md)] border border-[rgba(64,157,233,0.2)] bg-[rgba(233,245,251,0.7)] p-4 text-base text-subtle">
      <p>Unsupported segment configuration.</p>
    </div>
  );
};

export default Lesson;
