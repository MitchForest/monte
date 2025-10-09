import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { useNavigate, useParams } from '@tanstack/solid-router';
import { createActor, type ActorRefFrom } from 'xstate';

import { buildLessonTasks } from '../curriculum/utils/lessonTasks';
import { useProgress } from '../curriculum/state/progress';
import { createLessonPlayerMachine, type PlayerEvent, type PlayerStatus } from '../curriculum/machines/lessonPlayer';
import type {
  GuidedEvaluatorId,
  GuidedStep,
  Lesson,
  LessonDocument,
  LessonScenarioBinding,
  LessonSegment,
  PracticeQuestion,
  PresentationScript,
} from '../curriculum/types';
import { LessonTimeline } from '../curriculum/components/LessonTimeline';
import { PresentationSegment } from '../curriculum/components/segments/PresentationSegment';
import { GuidedSegment } from '../curriculum/components/segments/GuidedSegment';
import { PracticeSegment } from '../curriculum/components/segments/PracticeSegment';
import { createLocalEventRecorder } from '../curriculum/analytics/recorder';
import type { DemoEventRecorder } from '../curriculum/analytics/events';
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
import { fetchLessonBySlug, fetchUnitBySlug } from '../curriculum/api/curriculumClient';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Card,
  PageSection,
  ProfileAvatar,
} from '../design-system';

// Mini equation component for left sidebar (compact version)
const MiniEquation = (props: { notes: string[] }) => {
  const equation = () => {
    let multiplicand = '';
    let multiplier = '';
    
    props.notes.forEach((note) => {
      if (note.includes('×')) {
        const parts = note.split('×').map(p => p.trim());
        multiplicand = parts[0].replace(/,/g, '');
        multiplier = parts[1];
      }
    });

    return { multiplicand, multiplier };
  };

  const { multiplicand, multiplier } = equation();

  return (
    <div class="lesson-equation-mini">
      <Show when={multiplicand}>
        <div class="equation-mini-row">
          <For each={multiplicand.split('')}>
            {(digit) => <span class="equation-mini-digit">{digit}</span>}
          </For>
        </div>
      </Show>
      <Show when={multiplier}>
        <div class="equation-mini-row">
          <span class="equation-mini-symbol">×</span>
          <For each={Array(Math.max(0, multiplicand.length - multiplier.length)).fill('')}>
            {() => <span class="equation-mini-digit" />}
          </For>
          <For each={multiplier.split('')}>
            {(digit) => <span class="equation-mini-digit">{digit}</span>}
          </For>
        </div>
      </Show>
      <Show when={multiplicand && multiplier}>
        <div class="equation-mini-divider" />
      </Show>
    </div>
  );
};

// Component to display vertical equation format (currently unused - kept for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WorkEquation = (props: { notes: string[] }) => {
  // Extract carries and result from notes  
  const parseNotes = () => {
    const carries: Record<number, string> = {}; // position -> carry value
    let multiplicand = '';
    let multiplier = '';
    let resultDigits: string[] = [];

    props.notes.forEach((note) => {
      // Parse "2,466 × 3" format
      if (note.includes('×')) {
        const parts = note.split('×').map(p => p.trim());
        multiplicand = parts[0].replace(/,/g, '');
        multiplier = parts[1];
      }
      
      // Parse exchange notes like "Exchange: 10 units → tens, remainder 8"
      if (note.startsWith('Exchange:')) {
        const match = note.match(/remainder\s+(\d+)/);
        if (match) {
          const remainder = match[1];
          if (note.includes('units')) {
            resultDigits[0] = remainder; // ones place
          } else if (note.includes('tens')) {
            resultDigits[1] = remainder; // tens place
          } else if (note.includes('hundreds')) {
            resultDigits[2] = remainder; // hundreds place
          }
        }
        // Extract carry
        const carryMatch = note.match(/(\d+)\s+(\w+)s?\s*→\s*(\w+)/);
        if (carryMatch) {
          const [, quantity, from] = carryMatch;
          const carried = Math.floor(parseInt(match?.[1] || '0') / parseInt(quantity));
          if (from === 'unit' && carried > 0) {
            carries[1] = '1'; // carry to tens
          } else if (from === 'ten') {
            const totalTens = parseInt(note.match(/(\d+)\s+ten/)?.[1] || '0');
            if (totalTens >= 10) {
              carries[2] = Math.floor(totalTens / 10).toString();
            }
          } else if (from === 'hundred') {
            const totalHundreds = parseInt(note.match(/(\d+)\s+hundred/)?.[1] || '0');
            if (totalHundreds >= 10) {
              carries[3] = Math.floor(totalHundreds / 10).toString();
            }
          }
        }
      }
      
      // Parse sentences like "8 units remain and 1 ten is carried."
      if (note.includes('remain') && note.includes('carried')) {
        const remainMatch = note.match(/(\d+)\s+(\w+)\s+remain/);
        const carryMatch = note.match(/(\d+)\s+(\w+)\s+.*carried/);
        if (remainMatch && carryMatch) {
          const [, remainder, place] = remainMatch;
          const [, carry] = carryMatch;
          if (place === 'units' || place === 'unit') {
            resultDigits[0] = remainder;
            carries[1] = carry;
          } else if (place === 'tens' || place === 'ten') {
            resultDigits[1] = remainder;
            carries[2] = carry;
          } else if (place === 'hundreds' || place === 'hundred') {
            resultDigits[2] = remainder;
            carries[3] = carry;
          }
        }
      }
      
      // Parse final result from "equals X" or just a number
      const equalsMatch = note.match(/equals\s+([\d,]+)/);
      if (equalsMatch) {
        const fullResult = equalsMatch[1].replace(/,/g, '');
        resultDigits = fullResult.split('').reverse();
      }
    });

    const result = resultDigits.reverse().join('');
    return { carries, multiplicand, multiplier, result };
  };

  const { carries, multiplicand, multiplier, result } = parseNotes();

  return (
    <div class="vertical-equation">
      {/* Carries row */}
      <Show when={Object.keys(carries).length > 0}>
        <div class="equation-carries">
          <For each={multiplicand.split('')}>
            {(_, index) => {
              const position = index();
              const carry = carries[position + 1]; // carries are 1-indexed (tens=1, hundreds=2, etc.)
              return <span class="carry-digit">{carry || ''}</span>;
            }}
          </For>
        </div>
      </Show>

      {/* Multiplicand */}
      <Show when={multiplicand}>
        <div class="equation-row equation-multiplicand">
          <For each={multiplicand.split('')}>
            {(digit) => <span class="equation-digit">{digit}</span>}
          </For>
        </div>
      </Show>

      {/* Multiplier with × symbol */}
      <Show when={multiplier}>
        <div class="equation-row equation-multiplier">
          <span class="equation-symbol">×</span>
          <For each={Array(Math.max(0, multiplicand.length - multiplier.length)).fill('')}>
            {() => <span class="equation-digit" />}
          </For>
          <For each={multiplier.split('')}>
            {(digit) => <span class="equation-digit">{digit}</span>}
          </For>
        </div>
      </Show>

      {/* Divider line */}
      <Show when={multiplicand && multiplier}>
        <div class="equation-divider" />
      </Show>

      {/* Result */}
      <Show when={result}>
        <div class="equation-row equation-result">
          <For each={Array(Math.max(0, multiplicand.length - result.length)).fill('')}>
            {() => <span class="equation-digit" />}
          </For>
          <For each={result.split('')}>
            {(digit) => <span class="equation-digit">{digit}</span>}
          </For>
        </div>
      </Show>
    </div>
  );
};

type LessonScenario = GoldenBeadScenario | StampGameScenario | undefined;

const normalizeScenarioBinding = (value: unknown): LessonScenarioBinding | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Record<string, unknown>;
  const kind = candidate.kind;
  const seed = candidate.seed;
  if (kind !== 'golden-beads' && kind !== 'stamp-game') return undefined;
  if (typeof seed !== 'number') return undefined;
  return { kind, seed } satisfies LessonScenarioBinding;
};

const extractScenarioBinding = (document: LessonDocument | undefined): LessonScenarioBinding | undefined => {
  if (!document) return undefined;
  for (const segment of document.lesson.segments) {
    if (segment.scenario) return segment.scenario;
  }
  if (document.meta?.scenario) return document.meta.scenario;
  return normalizeScenarioBinding(document.meta?.metadata?.scenario);
};

const createScenarioForLesson = (document: LessonDocument | undefined): LessonScenario => {
  const binding = extractScenarioBinding(document);
  if (!binding) return undefined;
  switch (binding.kind) {
    case 'golden-beads':
      return generateGoldenBeadScenario(binding.seed);
    case 'stamp-game':
      return generateStampGameScenario(binding.seed);
    default:
      return undefined;
  }
};

const Lesson = () => {
  const params = useParams({ from: '/units/$unitSlug/lessons/$lessonSlug' });
  const lessonSlug = createMemo(() => params().lessonSlug);
  const unitSlug = createMemo(() => params().unitSlug);
  const navigate = useNavigate();

  const [lessonRecordResource, { refetch: refetchLessonRecord }] = createResource(
    lessonSlug,
    async (slug) => {
      if (!slug) return undefined;
      return await fetchLessonBySlug(slug);
    },
  );

  const [unitResource] = createResource(unitSlug, async (slug) => {
    if (!slug) return undefined;
    return await fetchUnitBySlug(slug);
  });

  const lessonDocument = createMemo<LessonDocument | undefined>(() => {
    const record = lessonRecordResource();
    if (!record) return undefined;
    return (record.published ?? record.draft) as LessonDocument;
  });

  const lesson = createMemo<Lesson | undefined>(() => lessonDocument()?.lesson);
  const segments = createMemo(() => lesson()?.segments ?? []);
  const tasks = createMemo(() => {
    if (!lesson()) return [];
    return buildLessonTasks(lesson()!);
  });

  const { actions: progressActions } = useProgress();
  const recordEvent = createLocalEventRecorder();

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
  const currentScenario = createMemo<LessonScenario>(() => {
    const document = lessonDocument();
    if (!document) return undefined;
    return createScenarioForLesson(document);
  });

  // Shared state for captions and paper notes (K-3 UX: sidebars)
  const [captionHistory, setCaptionHistory] = createSignal<Array<{ text: string; actionIndex: number }>>([]);
  const [paperNotes, setPaperNotes] = createSignal<string[]>([]);
  const [hasStarted, setHasStarted] = createSignal(false);
  
  // Action-level timeline state for presentation segments
  const [currentActionIndex, setCurrentActionIndex] = createSignal(0);
  const [totalActions, setTotalActions] = createSignal(0);
  const [actionJumpToIndex, setActionJumpToIndex] = createSignal<number | undefined>(undefined);

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

  const handleNavigateToUnit = () => {
    const slug = unitSlug();
    if (slug) {
      void navigate({ to: '/units/$unitSlug', params: { unitSlug: slug } });
      return;
    }
    void navigate({ to: '/' });
  };

  const handleNavigateToHome = () => {
    void navigate({ to: '/' });
  };

  const unitTitle = createMemo(() => {
    const unit = unitResource();
    if (!unit?.title) return 'Unit';
    return unit.title;
  });

  const lessonTitle = createMemo(() => {
    const doc = lessonDocument();
    if (!doc?.lesson?.title) return 'Lesson';
    return doc.lesson.title;
  });

  const renderLoading = () => (
    <div class="min-h-screen bg-shell">
      <PageSection class="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Card class="space-y-3 text-center">
          <p class="text-lg font-semibold">Loading lesson…</p>
          <p class="text-sm text-muted">Fetching the latest content.</p>
        </Card>
      </PageSection>
    </div>
  );

  const renderNotFound = () => (
    <div class="min-h-screen bg-shell">
      <PageSection class="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Card class="space-y-4 text-center">
          <p class="text-lg font-semibold">We could not find that lesson.</p>
          <Button
            variant="secondary"
            size="compact"
            iconPosition="left"
            icon={<span aria-hidden>←</span>}
            onClick={handleNavigateToUnit}
          >
            Back to unit
          </Button>
        </Card>
      </PageSection>
    </div>
  );

  const renderError = (message: string) => (
    <div class="min-h-screen bg-shell">
      <PageSection class="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Card class="space-y-4 text-center">
          <p class="text-lg font-semibold">Something went wrong.</p>
          <p class="text-sm text-muted">{message}</p>
          <Button
            variant="secondary"
            size="compact"
            iconPosition="left"
            icon={<span aria-hidden>↺</span>}
            onClick={() => void refetchLessonRecord()}
          >
            Try again
          </Button>
        </Card>
      </PageSection>
    </div>
  );

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
    send({ type: 'SET_INDEX', index: 0 });
  };

  const handleTogglePlay = () => {
    if (status() === 'playing') {
      send({ type: 'PAUSE' });
      return;
    }
    send({ type: 'PLAY' });
  };

  const handleDockSelect = (index: number) => {
    const current = activeSegment();
    const currentLesson = lesson();
    if (current && currentLesson) {
      recordEvent({
        type: 'segment.end',
        lessonId: currentLesson.id,
        segmentId: current.id,
        reason: 'skipped',
      });
    }
    // Clear captions when switching segments
    setCaptionHistory([]);
    send({ type: 'SET_INDEX', index });
  };

  const timelineSegments = createMemo(() =>
    segments().map((segment) => ({
      id: segment.id,
      title: segment.title,
      type: segment.type,
    })),
  );

  const handleStartLesson = () => {
    setHasStarted(true);
    // Don't auto-play - let user click Play button
  };

  const handleNarrationUpdate = (narration: string, actionIndex: number) => {
    setCaptionHistory((prev) => {
      // Check if caption for this action already exists
      const existing = prev.find((c) => c.actionIndex === actionIndex);
      if (existing) return prev; // Don't duplicate
      return [...prev, { text: narration, actionIndex }];
    });
  };
  
  // Separate effect to handle auto-scrolling when currentActionIndex changes
  createEffect(() => {
    currentActionIndex(); // Track changes
    // Auto-scroll to center the active caption (carousel-style)
    setTimeout(() => {
      const carousel = document.querySelector('.lesson-captions-carousel');
      const currentBubble = document.querySelector('.lesson-caption-current');
      if (carousel && currentBubble) {
        const carouselRect = carousel.getBoundingClientRect();
        const bubbleRect = currentBubble.getBoundingClientRect();
        const carouselCenter = carouselRect.height / 2;
        const bubbleCenter = bubbleRect.height / 2;
        const scrollTarget = (currentBubble as HTMLElement).offsetTop - carouselCenter + bubbleCenter;
        carousel.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }
    }, 100);
  });

  const handleActionChange = (currentIndex: number, total: number) => {
    setCurrentActionIndex(currentIndex);
    setTotalActions(total);
  };

  const handleActionSelect = (index: number) => {
    setActionJumpToIndex(index);
    // Reset after a tick so it can be triggered again
    setTimeout(() => setActionJumpToIndex(undefined), 10);
  };

  const renderLessonView = () => (
    <div class="lesson-screen-fullscreen">
      {/* Start overlay - no auto-play for K-3 */}
      <Show when={!hasStarted()}>
        <div class="lesson-start-overlay">
          <div class="lesson-start-content">
            <button
              type="button"
              onClick={handleStartLesson}
              class="lesson-start-button"
              aria-label="Start lesson"
            >
              <span class="lesson-start-icon">▶</span>
            </button>
            <p class="lesson-start-text">Click to begin</p>
          </div>
        </div>
      </Show>

      {/* Top navigation bar - logo, breadcrumbs, and profile */}
      <div class="lesson-nav-bar">
        <div class="lesson-nav-logo">Bemo</div>
        <div class="lesson-nav-breadcrumbs">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={handleNavigateToHome}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={handleNavigateToUnit}>{unitTitle()}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink current>{lessonTitle()}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div class="lesson-nav-profile">
          <ProfileAvatar seed="Taylor" size={40} />
        </div>
      </div>

      {/* Main content area with 3-column layout */}
      <div class="lesson-content-grid">
        {/* Left sidebar - equation (top 1/3) + captions carousel (bottom 2/3) */}
        <aside class="lesson-sidebar-left">
          {/* Top section - mini equation */}
          <div class="lesson-equation-section">
            <Show when={paperNotes().length > 0} fallback={
              <div class="text-muted text-sm text-center">
                Equation will appear here...
              </div>
            }>
              <MiniEquation notes={paperNotes()} />
            </Show>
          </div>

          {/* Bottom section - carousel captions */}
          <div class="lesson-captions-section">
            <div class="lesson-captions-carousel">
              <div class="lesson-captions-container">
                <Show when={captionHistory().length > 0} fallback={
                  <div class="lesson-caption-bubble lesson-caption-muted">
                    Narration will appear here...
                  </div>
                }>
                  <For each={captionHistory()}>
                    {(caption) => (
                      <button
                        type="button"
                        classList={{
                          'lesson-caption-bubble': true,
                          'lesson-caption-current': caption.actionIndex === currentActionIndex(),
                          'lesson-caption-past': caption.actionIndex < currentActionIndex(),
                          'lesson-caption-future': caption.actionIndex > currentActionIndex(),
                        }}
                        onClick={() => handleActionSelect(caption.actionIndex)}
                        aria-label={`Jump to: ${caption.text}`}
                      >
                        {caption.text}
                      </button>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </div>
        </aside>

        {/* Main player - takes up remaining space */}
        <div class="lesson-player-center">
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
                    recordEvent={recordEvent}
                    onNarrationChange={handleNarrationUpdate}
                    onPaperNotesChange={setPaperNotes}
                    onActionChange={handleActionChange}
                    actionJumpToIndex={actionJumpToIndex()}
                  />
                )}
              </Show>
            )}
          </Show>
        </div>

        {/* Right spacer - part of unified shell */}
        <div class="lesson-sidebar-right-spacer" />
      </div>

      {/* Bottom bar - part of app shell */}
      <LessonDock
        segments={timelineSegments()}
        activeIndex={activeIndex()}
        onSelect={handleDockSelect}
        onTogglePlay={handleTogglePlay}
        isPlaying={isPlaying()}
        currentActionIndex={currentActionIndex()}
        totalActions={totalActions()}
        onActionSelect={handleActionSelect}
        showActionDots={activeSegmentType() === 'presentation'}
      />
    </div>
  );

  const showLoading = createMemo(() => !lesson() && lessonRecordResource.loading);
  const lessonError = createMemo(() => lessonRecordResource.error as Error | string | undefined);
  const showNotFound = createMemo(() => !lessonRecordResource.loading && !lessonError() && !lesson());
  const lessonErrorMessage = () => {
    const error = lessonError();
    if (!error) return 'Unable to load lesson.';
    if (error instanceof Error) return error.message || 'Unable to load lesson.';
    return typeof error === 'string' ? error : 'Unable to load lesson.';
  };

  return (
    <Switch>
      <Match when={showLoading()}>
        {renderLoading()}
      </Match>
      <Match when={lessonError()}>
        {renderError(lessonErrorMessage())}
      </Match>
      <Match when={lesson()}>
        {renderLessonView()}
      </Match>
      <Match when={showNotFound()}>
        {renderNotFound()}
      </Match>
    </Switch>
  );
};

interface LessonDockProps {
  segments: { id: string; title: string; type: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
  currentActionIndex?: number;
  totalActions?: number;
  onActionSelect?: (index: number) => void;
  showActionDots?: boolean;
}

const LessonDock = (props: LessonDockProps) => {
  return (
    <footer class="lesson-dock">
      <div class="lesson-dock-spacer-left" />
      <div class="lesson-dock-inner">
        <Button
          variant="secondary"
          size="compact"
          onClick={props.onTogglePlay}
          class="lesson-dock-play"
          aria-pressed={props.isPlaying}
          aria-label={props.isPlaying ? 'Pause' : 'Play'}
        >
          {props.isPlaying ? (
            <span aria-hidden style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>⏸</span>
          ) : (
            <span aria-hidden style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'center', 'margin-left': '2px' }}>▶</span>
          )}
        </Button>
        
        {/* Show action dots for presentation segments */}
        <Show when={props.showActionDots && props.totalActions && props.totalActions > 0}>
          <div class="lesson-action-timeline">
            <For each={Array(props.totalActions).fill(0)}>
              {(_, index) => {
                const position = props.totalActions! <= 1 ? 0 : (index() / (props.totalActions! - 1)) * 100;
                return (
                  <button
                    type="button"
                    classList={{
                      'lesson-action-dot': true,
                      'lesson-action-dot--active': index() === props.currentActionIndex
                    }}
                    style={{ left: `${position}%` }}
                    aria-label={`Action ${index() + 1} of ${props.totalActions}`}
                    onClick={() => props.onActionSelect?.(index())}
                  />
                );
              }}
            </For>
          </div>
        </Show>
        
        {/* Show segment timeline */}
        <LessonTimeline 
          segments={props.segments} 
          activeIndex={props.activeIndex} 
          onSelect={props.onSelect}
          currentActionIndex={props.currentActionIndex}
          totalActions={props.totalActions}
          showActionProgress={props.showActionDots}
        />
      </div>
      <div class="lesson-dock-spacer-right" />
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
  recordEvent?: DemoEventRecorder;
  onNarrationChange?: (narration: string, actionIndex: number) => void;
  onPaperNotesChange?: (notes: string[]) => void;
  onActionChange?: (currentIndex: number, totalActions: number) => void;
  actionJumpToIndex?: number;
}) => {
  const scenario = () => props.scenario;

  onMount(() => {
    props.recordEvent?.({
      type: 'segment.start',
      lessonId: props.lesson.id,
      segmentId: props.segment.id,
    });
  });

  const presentationScript = createMemo<PresentationScript | undefined>(() => {
    if (props.segment.type !== 'presentation') return undefined;
    if (props.segment.script) return props.segment.script;
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
    if (props.segment.steps.length > 0) {
      return props.segment.steps;
    }
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

    if (props.segment.questions.length > 0) {
      return {
        questions: props.segment.questions,
        passCriteria: props.segment.passCriteria,
        refreshKey: props.segment.questions.length,
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

  const recordSegmentEnd = (reason: 'manual-complete' | 'narration-complete' | 'skipped') => {
    props.recordEvent?.({
      type: 'segment.end',
      lessonId: props.lesson.id,
      segmentId: props.segment.id,
      reason,
    });
  };

  if (props.segment.type === 'presentation') {
    const script = presentationScript();
    if (!script) {
      return (
        <Card variant="soft" class="space-y-3 text-subtle">
          <p>Presentation script unavailable.</p>
        </Card>
      );
    }

    const handlePresentationComplete = () => {
      recordSegmentEnd('narration-complete');
      props.onPresentationComplete();
    };

    return (
      <PresentationSegment
        lessonId={props.lesson.id}
        segment={props.segment}
        playerStatus={props.playerStatus}
        onAutoAdvance={handlePresentationComplete}
        script={script}
        audioSrc={`/curriculum/assets/audio/${props.lesson.id}/${props.segment.id}.mp3`}
        captionSrc={`/curriculum/assets/audio/${props.lesson.id}/${props.segment.id}.vtt`}
        recordEvent={props.recordEvent}
        onNarrationChange={props.onNarrationChange}
        onPaperNotesChange={props.onPaperNotesChange}
        onActionChange={props.onActionChange}
        actionJumpToIndex={props.actionJumpToIndex}
      />
    );
  }

  if (props.segment.type === 'guided') {
    const handleComplete = () => {
      recordSegmentEnd('manual-complete');
      props.onGuidedComplete(props.segment.id);
    };
    return (
      <GuidedSegment
        lessonId={props.lesson.id}
        segment={props.segment}
        steps={guidedSteps().length ? guidedSteps() : props.segment.steps}
        scenario={scenario()}
        onSegmentComplete={handleComplete}
      />
    );
  }

  if (props.segment.type === 'practice') {
    const config = practiceConfig();
    const handleResult = (result: 'pass' | 'fail') => {
      recordSegmentEnd('manual-complete');
      props.onPracticeResult(props.segment.id, result);
    };

    return (
      <PracticeSegment
        lessonId={props.lesson.id}
        segment={props.segment}
        questions={config.questions.length ? config.questions : props.segment.questions}
        passCriteria={config.passCriteria ?? props.segment.passCriteria}
        refreshKey={config.refreshKey}
        onSegmentResult={handleResult}
        onTaskResult={props.onPracticeTaskResult}
        recordEvent={props.recordEvent}
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
