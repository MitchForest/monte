import type { PlayerEvent } from '@monte/lesson-service';

import type { LessonState } from './state';

const getLessonId = (state: LessonState) => state.lesson.lesson()?.id;

const sendEvent = (state: LessonState, event: PlayerEvent) => {
  state.player.controller.send(event);
};

const markSegmentTasksCompleted = (state: LessonState, segmentId: string) => {
  const lessonId = getLessonId(state);
  if (!lessonId) return;
  const relatedTasks = state.lesson.tasksBySegment().get(segmentId);
  if (!relatedTasks) return;
  relatedTasks.forEach((task) =>
    state.progress.actions.markTaskStatus(lessonId, task.id, 'completed'),
  );
};

export interface LessonActions {
  navigateToUnit: () => void;
  navigateToHome: () => void;
  presentationComplete: () => void;
  guidedComplete: (segmentId: string) => void;
  practiceTaskResult: (taskId: string, status: 'completed' | 'incorrect') => void;
  practiceResult: (segmentId: string, result: 'pass' | 'fail') => void;
  practiceReset: (options?: { regenerate: boolean }) => void;
  togglePlay: () => void;
  dockSelect: (index: number) => void;
  startLesson: () => void;
  updateNarration: (narration: string, actionIndex: number) => void;
  setActionProgress: (currentIndex: number, total: number) => void;
  jumpToAction: (index: number) => void;
  signIn: () => void;
  refetchLesson: () => Promise<unknown>;
}

export const createLessonActions = (state: LessonState): LessonActions => {
  const navigateToUnit = () => {
    const slug = state.navigation.unitSlug();
    if (slug) {
      void state.navigation.navigate({ to: '/units/$unitSlug', params: { unitSlug: slug } });
      return;
    }
    void state.navigation.navigate({ to: '/' });
  };

  const navigateToHome = () => {
    void state.navigation.navigate({ to: '/' });
  };

  const presentationComplete = () => {
    const currentSegment = state.player.activeSegment();
    if (!currentSegment) return;
    markSegmentTasksCompleted(state, currentSegment.id);
    sendEvent(state, { type: 'COMPLETE' });
  };

  const guidedComplete = (segmentId: string) => {
    markSegmentTasksCompleted(state, segmentId);
    sendEvent(state, { type: 'COMPLETE' });
  };

  const practiceTaskResult = (taskId: string, status: 'completed' | 'incorrect') => {
    const lessonId = getLessonId(state);
    if (!lessonId) return;
    state.progress.actions.markTaskStatus(lessonId, taskId, status);
  };

  const practiceResult = (segmentId: string, result: 'pass' | 'fail') => {
    const lessonId = getLessonId(state);
    if (!lessonId) return;
    const segmentTasks = state.lesson.tasksBySegment().get(segmentId) ?? [];

    if (result === 'pass') {
      segmentTasks.forEach((task) =>
        state.progress.actions.markTaskStatus(lessonId, task.id, 'completed'),
      );
      sendEvent(state, { type: 'COMPLETE' });
      return;
    }

    segmentTasks.forEach((task) =>
      state.progress.actions.markTaskStatus(lessonId, task.id, 'incorrect'),
    );
    state.progress.actions.resetLesson(lessonId);
    sendEvent(state, { type: 'SET_INDEX', index: 0 });
  };

  const practiceReset = (_options?: { regenerate: boolean }) => {
    const lessonId = getLessonId(state);
    if (!lessonId) return;
    state.progress.actions.resetLesson(lessonId);
  };

  const togglePlay = () => {
    if (state.player.status() === 'playing') {
      sendEvent(state, { type: 'PAUSE' });
      return;
    }
    sendEvent(state, { type: 'PLAY' });
  };

  const dockSelect = (index: number) => {
    const currentLesson = state.lesson.lesson();
    const currentSegment = state.player.activeSegment();
    if (currentLesson && currentSegment) {
      state.recordEvent({
        type: 'segment.end',
        lessonId: currentLesson.id,
        segmentId: currentSegment.id,
        reason: 'skipped',
      });
    }
    state.ui.setCaptionHistory([]);
    sendEvent(state, { type: 'SET_INDEX', index });
  };

  const startLesson = () => {
    state.ui.setHasStarted(true);
  };

  const updateNarration = (narration: string, actionIndex: number) => {
    state.ui.setCaptionHistory((previous) => {
      const existing = previous.find((caption) => caption.actionIndex === actionIndex);
      if (existing) return previous;
      return [...previous, { text: narration, actionIndex }];
    });
  };

  const setActionProgress = (currentIndex: number, total: number) => {
    state.ui.setCurrentActionIndex(currentIndex);
    state.ui.setTotalActions(total);
  };

  const jumpToAction = (index: number) => {
    state.ui.setActionJumpToIndex(index);
    setTimeout(() => state.ui.setActionJumpToIndex(undefined), 10);
  };

  const signIn = () => {
    void state.navigation.navigate({ to: '/auth/sign-in' });
  };

  const refetchLesson = async () => {
    const controls = state.resources.lesson[1];
    return controls?.refetch();
  };

  return {
    navigateToUnit,
    navigateToHome,
    presentationComplete,
    guidedComplete,
    practiceTaskResult,
    practiceResult,
    practiceReset,
    togglePlay,
    dockSelect,
    startLesson,
    updateNarration,
    setActionProgress,
    jumpToAction,
    signIn,
    refetchLesson,
  };
};
