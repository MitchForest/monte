import { For, Match, Show, Switch, createEffect, createMemo, createResource, onMount } from 'solid-js';
import { type PlayerStatus } from '@monte/lesson-service';
import type {
  GuidedEvaluatorId,
  GuidedStep,
  Lesson,
  LessonSegment,
  PracticeQuestion,
  PresentationScript,
} from '@monte/types';
import { LessonTimeline } from '../domains/curriculum/components/LessonTimeline';
import { PresentationSegment } from '../domains/curriculum/components/segments/PresentationSegment';
import { GuidedSegment } from '../domains/curriculum/components/segments/GuidedSegment';
import { PracticeSegment } from '../domains/curriculum/components/segments/PracticeSegment';
import type { DemoEventRecorder } from '../domains/curriculum/analytics/events';
import { resolveNarrationAssets } from '../domains/curriculum/utils/assets';
import { CurriculumAccessNotice } from '../components/CurriculumAccessNotice';
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
} from '../components/ui';
import { LessonInventoryProvider, useLessonInventory } from '../domains/curriculum/inventory/context';
import { useLessonViewModel } from '../domains/curriculum/lesson/viewModel';
import type { LessonScenario } from '../domains/curriculum/lesson/state';

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

const Lesson = () => {
  const { state, actions } = useLessonViewModel();

  const renderLoading = () => (
    <div class="min-h-screen bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)]">
      <PageSection class="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Card class="space-y-3 text-center">
          <p class="text-lg font-semibold">Loading lesson…</p>
          <p class="text-sm text-[color:var(--color-text-muted)]">Fetching the latest content.</p>
        </Card>
      </PageSection>
    </div>
  );

  const renderNotFound = () => (
    <div class="min-h-screen bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)]">
      <PageSection class="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Card class="space-y-4 text-center">
          <p class="text-lg font-semibold">We could not find that lesson.</p>
          <Button
            variant="secondary"
            size="compact"
            iconPosition="left"
            icon={<span aria-hidden>←</span>}
            onClick={actions.navigateToUnit}
          >
            Back to unit
          </Button>
        </Card>
      </PageSection>
    </div>
  );

  const renderError = (message: string) => (
    <div class="min-h-screen bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)]">
      <PageSection class="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Card class="space-y-4 text-center">
          <p class="text-lg font-semibold">Something went wrong.</p>
          <p class="text-sm text-[color:var(--color-text-muted)]">{message}</p>
          <Button
            variant="secondary"
            size="compact"
            iconPosition="left"
            icon={<span aria-hidden>↺</span>}
            onClick={() => void actions.refetchLesson()}
          >
            Try again
          </Button>
        </Card>
      </PageSection>
    </div>
  );

  createEffect(() => {
    state.ui.currentActionIndex();
    setTimeout(() => {
      const carousel = document.querySelector('.lesson-captions-carousel');
      const currentBubble = document.querySelector('.lesson-caption-current');
      if (carousel && currentBubble) {
        const carouselRect = carousel.getBoundingClientRect();
        const bubbleRect = currentBubble.getBoundingClientRect();
        const carouselCenter = carouselRect.height / 2;
        const bubbleCenter = bubbleRect.height / 2;
        const scrollTarget =
          (currentBubble as HTMLElement).offsetTop - carouselCenter + bubbleCenter;
        carousel.scrollTo({
          top: scrollTarget,
          behavior: 'smooth',
        });
      }
    }, 100);
  });

  const renderLessonView = () => (
    <div class="lesson-screen-fullscreen">
      {/* Start overlay - no auto-play for K-3 */}
      <Show when={!state.ui.hasStarted()}>
        <div class="lesson-start-overlay">
          <div class="lesson-start-content">
            <button
              type="button"
              onClick={() => actions.startLesson()}
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
                <BreadcrumbLink onClick={actions.navigateToHome}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={actions.navigateToUnit}>{state.lesson.unitTitle()}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink current>{state.lesson.lessonTitle()}</BreadcrumbLink>
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
            <Show when={state.ui.paperNotes().length > 0} fallback={
              <div class="text-[color:var(--color-text-muted)] text-sm text-center">
                Equation will appear here...
              </div>
            }>
              <MiniEquation notes={state.ui.paperNotes()} />
            </Show>
          </div>

          {/* Bottom section - carousel captions */}
          <div class="lesson-captions-section">
            <div class="lesson-captions-carousel">
              <div class="lesson-captions-container">
                <Show when={state.ui.captionHistory().length > 0} fallback={
                  <div class="lesson-caption-bubble lesson-caption-muted">
                    Narration will appear here...
                  </div>
                }>
                  <For each={state.ui.captionHistory()}>
                    {(caption) => (
                      <button
                        type="button"
                        classList={{
                          'lesson-caption-bubble': true,
                          'lesson-caption-current': caption.actionIndex === state.ui.currentActionIndex(),
                          'lesson-caption-past': caption.actionIndex < state.ui.currentActionIndex(),
                          'lesson-caption-future': caption.actionIndex > state.ui.currentActionIndex(),
                        }}
                        onClick={() => actions.jumpToAction(caption.actionIndex)}
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
          <Show when={state.lesson.lesson()} keyed>
            {(currentLesson) => (
              <LessonInventoryProvider inventory={currentLesson.materialInventory}>
                <Show when={state.player.activeSegment()} keyed>
                  {(segment) => (
                    <SegmentContent
                      lesson={currentLesson}
                      segment={segment}
                      playerStatus={state.player.status()}
                      onPresentationComplete={actions.presentationComplete}
                      onGuidedComplete={actions.guidedComplete}
                      onPracticeResult={actions.practiceResult}
                      onPracticeTaskResult={actions.practiceTaskResult}
                      onPracticeReset={actions.practiceReset}
                      scenario={state.lesson.scenario()}
                      recordEvent={state.recordEvent}
                      onNarrationChange={actions.updateNarration}
                      onPaperNotesChange={state.ui.setPaperNotes}
                      onActionChange={actions.setActionProgress}
                      actionJumpToIndex={state.ui.actionJumpToIndex()}
                    />
                  )}
                </Show>
              </LessonInventoryProvider>
            )}
          </Show>
        </div>

        {/* Right spacer - part of unified shell */}
        <div class="lesson-sidebar-right-spacer" />
      </div>

      {/* Bottom bar - part of app shell */}
      <LessonDock
        segments={state.lesson.timelineSegments()}
        activeIndex={state.player.activeIndex()}
        onSelect={actions.dockSelect}
        onTogglePlay={actions.togglePlay}
        isPlaying={state.player.isPlaying()}
        currentActionIndex={state.ui.currentActionIndex()}
        totalActions={state.ui.totalActions()}
        onActionSelect={actions.jumpToAction}
        showActionDots={state.player.activeSegmentType() === 'presentation'}
      />
    </div>
  );

  return (
    <Show
      when={state.meta.curriculumReady()}
      fallback={<CurriculumAccessNotice status={state.meta.fallbackStatus()} onSignIn={actions.signIn} />}
    >
      <Switch>
        <Match when={state.meta.showLoading()}>
          {renderLoading()}
        </Match>
        <Match when={state.meta.error()}>
          {renderError(state.meta.errorMessage())}
        </Match>
        <Match when={state.lesson.lesson()}>
          {renderLessonView()}
        </Match>
        <Match when={state.meta.showNotFound()}>
          {renderNotFound()}
        </Match>
      </Switch>
    </Show>
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
  onPracticeReset?: (options: { regenerate: boolean }) => void;
  scenario?: LessonScenario;
  recordEvent?: DemoEventRecorder;
  onNarrationChange?: (narration: string, actionIndex: number) => void;
  onPaperNotesChange?: (notes: string[]) => void;
  onActionChange?: (currentIndex: number, totalActions: number) => void;
  actionJumpToIndex?: number;
}) => {
  const inventoryContext = useLessonInventory();
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
    return props.segment.script;
  });

  const guidedSteps = createMemo<(GuidedStep & { evaluatorId: GuidedEvaluatorId })[]>(() => {
    if (props.segment.type !== 'guided') return [];
    return props.segment.steps;
  });

  const practiceQuestions = createMemo<PracticeQuestion[]>(() => {
    if (props.segment.type !== 'practice') return [];
    return props.segment.questions;
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
    if (!script || script.actions.length === 0) {
      return (
        <Card variant="soft" class="space-y-3 text-[color:var(--color-text-subtle)]">
          <p>Presentation segment "{props.segment.title}" is missing authored script actions. Update the lesson draft to continue.</p>
        </Card>
      );
    }

    const handlePresentationComplete = () => {
      recordSegmentEnd('narration-complete');
      props.onPresentationComplete();
    };

    const [narrationAssets] = createResource(
      () => ({ lessonId: props.lesson.id, segmentId: props.segment.id }),
      ({ lessonId, segmentId }) => resolveNarrationAssets(lessonId, segmentId),
    );

    const assets = () => narrationAssets() ?? { audio: undefined, caption: undefined };

    return (
      <PresentationSegment
        lessonId={props.lesson.id}
        segment={props.segment}
        playerStatus={props.playerStatus}
        onAutoAdvance={handlePresentationComplete}
        script={script}
        audioSrc={assets().audio}
        captionSrc={assets().caption}
        audioLoading={narrationAssets.loading}
        recordEvent={props.recordEvent}
        onNarrationChange={props.onNarrationChange}
        onPaperNotesChange={props.onPaperNotesChange}
        onActionChange={props.onActionChange}
        actionJumpToIndex={props.actionJumpToIndex}
      />
    );
  }

  if (props.segment.type === 'guided') {
    const steps = guidedSteps();
    if (steps.length === 0) {
      return (
        <Card variant="soft" class="space-y-3 text-[color:var(--color-text-subtle)]">
          <p>Guided segment "{props.segment.title}" requires at least one step before it can run.</p>
        </Card>
      );
    }
    const handleComplete = () => {
      recordSegmentEnd('manual-complete');
      props.onGuidedComplete(props.segment.id);
    };
    return (
      <GuidedSegment
        lessonId={props.lesson.id}
        segment={props.segment}
        steps={steps}
        scenario={scenario()}
        onSegmentComplete={handleComplete}
        recordEvent={props.recordEvent}
      />
    );
  }

  if (props.segment.type === 'practice') {
    const questions = practiceQuestions();
    if (questions.length === 0 || !props.segment.passCriteria) {
      return (
        <Card variant="soft" class="space-y-3 text-[color:var(--color-text-subtle)]">
          <p>Practice segment "{props.segment.title}" needs authored questions and pass criteria.</p>
        </Card>
      );
    }
    const handleResult = (result: 'pass' | 'fail') => {
      recordSegmentEnd('manual-complete');
      props.onPracticeResult(props.segment.id, result);
    };

    return (
      <PracticeSegment
        lessonId={props.lesson.id}
        segment={props.segment}
        questions={questions}
        passCriteria={props.segment.passCriteria}
        refreshKey={props.segment.questions.length}
        onSegmentResult={handleResult}
        onTaskResult={props.onPracticeTaskResult}
        recordEvent={props.recordEvent}
        scenarioSeed={scenario()?.seed}
        onReset={(options) => {
          inventoryContext.resetAll();
          props.onPracticeReset?.(options);
        }}
      />
    );
  }

  return (
    <div class="rounded-[var(--radius-md)] border border-[rgba(64,157,233,0.2)] bg-[rgba(233,245,251,0.7)] p-4 text-base text-[color:var(--color-text-subtle)]">
      <p>Unsupported segment configuration.</p>
    </div>
  );
};

export default Lesson;
