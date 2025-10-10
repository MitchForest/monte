import { Show, createEffect, createMemo, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

import type { DemoEventRecorder } from '../../analytics/events';
import type { PracticePassCriteria, PracticeQuestion, PracticeSegment as PracticeSegmentType } from '@monte/types';
import { Button, Chip } from '../../../../design-system';
import { LessonCanvas, useViewportObserver } from '../../canvas';
import { LessonInventoryOverlay, useSegmentInventory } from '../../inventory/context';

export interface PracticeSegmentProps {
  lessonId: string;
  segment: PracticeSegmentType;
  questions: PracticeQuestion[];
  passCriteria: PracticePassCriteria;
  refreshKey?: number;
  scenarioSeed?: number;
  onSegmentResult: (result: 'pass' | 'fail') => void;
  onTaskResult?: (taskId: string, status: 'completed' | 'incorrect') => void;
  onReset?: (options: { regenerate: boolean }) => void;
  recordEvent?: DemoEventRecorder;
}

interface QuestionState {
  status: 'pending' | 'correct' | 'incorrect';
  answer?: number;
}

const createSeededRng = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInclusive = (rand: () => number, min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const regenerateQuestions = (
  workspace: PracticeSegmentType['workspace'],
  base: PracticeQuestion[],
  seed?: number,
) => {
  const rand = typeof seed === 'number' ? createSeededRng(seed) : Math.random;
  return base.map((question) => {
    let multiplicand = question.multiplicand;
    let multiplier = question.multiplier;

    if (workspace === 'golden-beads') {
      multiplicand = randomInclusive(rand, 1200, 4999);
      multiplier = randomInclusive(rand, 2, 8);
    } else {
      multiplicand = randomInclusive(rand, 210, 599);
      multiplier = randomInclusive(rand, 2, 6);
    }

    return {
      ...question,
      multiplicand,
      multiplier,
      correctAnswer: multiplicand * multiplier,
      prompt: `Solve ${multiplicand} × ${multiplier}.`,
    } satisfies PracticeQuestion;
  });
};

export const PracticeSegment = (props: PracticeSegmentProps) => {
  const baseQuestions = props.questions;
  const segmentInventory = useSegmentInventory({
    id: props.segment.id,
    materialBankId: props.segment.materialBankId,
  });
  const inventoryBank = segmentInventory.bank;
  const inventoryTokens = segmentInventory.tokenTypes;
  const workspace = createMemo<PracticeSegmentType['workspace']>(() => segmentInventory.workspace() ?? props.segment.workspace);

  const buildInitialStates = (qs: PracticeQuestion[]) => {
    const initial: Record<string, QuestionState> = {};
    qs.forEach((question) => {
      initial[question.id] = { status: 'pending' };
    });
    return initial;
  };

  const [questions, setQuestions] = createSignal<PracticeQuestion[]>([...baseQuestions], { equals: false });
  const [questionStates, setQuestionStates] = createStore<Record<string, QuestionState>>(buildInitialStates(baseQuestions));

  const [index, setIndex] = createSignal(0);
  const [answer, setAnswer] = createSignal('');
  const [feedback, setFeedback] = createSignal<string | null>(null);
  const [segmentStatus, setSegmentStatus] = createSignal<'idle' | 'pass' | 'fail'>('idle');
  const [correctCount, setCorrectCount] = createSignal(0);
  const [incorrectCount, setIncorrectCount] = createSignal(0);
  const [answeredCount, setAnsweredCount] = createSignal(0);
  const [regenerationCount, setRegenerationCount] = createSignal(0);

  const currentQuestion = createMemo(() => questions()[index()]);

  const refreshSignature = createMemo(() => {
    const key = props.refreshKey ?? 0;
    const ids = props.questions.map((question) => question.id).join('|');
    return `${key}-${ids}`;
  });

  createEffect(() => {
    refreshSignature();
    const latestQuestions = props.questions;
    setQuestions([...latestQuestions]);
    setQuestionStates(() => buildInitialStates(latestQuestions));
    setIndex(0);
    setAnswer('');
    setFeedback(null);
    setSegmentStatus('idle');
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnsweredCount(0);
    setRegenerationCount(0);
  });

  const resetState = (regenerate: boolean) => {
    let generationSeed = regenerationCount();
    if (regenerate) {
      generationSeed += 1;
      setRegenerationCount(generationSeed);
    }
    const seed = typeof props.scenarioSeed === 'number' ? props.scenarioSeed + generationSeed : undefined;
    const resetQuestions = regenerate ? regenerateQuestions(workspace(), props.questions, seed) : props.questions;
    setQuestions([...resetQuestions]);
    setQuestionStates(() => buildInitialStates(resetQuestions));
    setIndex(0);
    setAnswer('');
    setFeedback(null);
    setSegmentStatus('idle');
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnsweredCount(0);
    props.onReset?.({ regenerate });
  };

  const handleCheck = () => {
    const question = currentQuestion();
    if (!question) return;
    if (answer().trim() === '') {
      setFeedback('Enter an answer before checking.');
      return;
    }

    const numericAnswer = Number(answer());
    const isCorrect = numericAnswer === question.correctAnswer;

    setQuestionStates(question.id, { status: isCorrect ? 'correct' : 'incorrect', answer: numericAnswer });
    const totalAnswered = answeredCount() + 1;
    setAnsweredCount(totalAnswered);

    if (isCorrect) {
      setCorrectCount((value) => value + 1);
      setFeedback('Nice! That matches the expected product.');
      props.onTaskResult?.(`${props.segment.id}-${question.id}`, 'completed');
    } else {
      setIncorrectCount((value) => value + 1);
      setFeedback(`Not yet. ${question.multiplicand} × ${question.multiplier} = ${question.correctAnswer}.`);
      props.onTaskResult?.(`${props.segment.id}-${question.id}`, 'incorrect');
    }

    props.recordEvent?.({
      type: 'practice.check',
      lessonId: props.lessonId,
      segmentId: props.segment.id,
      questionId: question.id,
      success: isCorrect,
      attempts: 1,
    });

    const requiredFirst = props.passCriteria.firstCorrect;
    const firstSlice = questions().slice(0, requiredFirst);
    const firstThresholdMet =
      requiredFirst === 0 ||
      (totalAnswered >= requiredFirst &&
        firstSlice.every((item) => {
          const state = questionStates[item.id];
          if (item.id === question.id) {
            return isCorrect;
          }
          return state?.status === 'correct';
        }));

    const passByFirstTwo = firstThresholdMet;
    const passByTotal = isCorrect
      ? correctCount() + 1 >= props.passCriteria.totalCorrect
      : correctCount() >= props.passCriteria.totalCorrect;

    const failReached = !isCorrect && incorrectCount() + 1 >= props.passCriteria.maxMisses;

    if (passByFirstTwo || passByTotal) {
      setSegmentStatus('pass');
      questions().forEach((item) => {
        if (questionStates[item.id]?.status === 'pending') {
          props.onTaskResult?.(`${props.segment.id}-${item.id}`, 'completed');
        }
      });
      props.onSegmentResult('pass');
      return;
    }

    if (failReached) {
      setSegmentStatus('fail');
      questions().forEach((item) => {
        if (questionStates[item.id]?.status === 'pending') {
          props.onTaskResult?.(`${props.segment.id}-${item.id}`, 'incorrect');
        }
      });
      props.onSegmentResult('fail');
      return;
    }

    if (index() < questions().length - 1) {
      setIndex((value) => value + 1);
      setAnswer('');
    } else {
      // exhausted questions without meeting pass condition -> treat as fail
      setSegmentStatus('fail');
      questions().forEach((item) => {
        if (questionStates[item.id]?.status === 'pending') {
          props.onTaskResult?.(`${props.segment.id}-${item.id}`, 'incorrect');
        }
      });
      props.onSegmentResult('fail');
    }
  };

  const handleNext = () => {
    if (index() < questions().length - 1) {
      setIndex((value) => value + 1);
      setAnswer('');
      setFeedback(null);
    }
  };

  const handleReset = (regenerate = false) => {
    resetState(regenerate);
  };

  useViewportObserver(
    (state) => {
      props.recordEvent?.({
        type: 'canvas.viewport',
        lessonId: props.lessonId,
        segmentId: props.segment.id,
        scale: Number(state.scale.toFixed(3)),
        offset: {
          x: Math.round(state.offset.x),
          y: Math.round(state.offset.y),
        },
      });
    },
    {
      throttleMs: 200,
      minScaleDelta: 0.02,
      minOffsetDelta: 4,
    },
  );

  return (
    <LessonCanvas
      data-variant="practice"
      stageClass="lesson-segment lesson-segment--practice practice-stage"
      renderOverlay={<LessonInventoryOverlay bank={inventoryBank} tokens={inventoryTokens} />}
    >

      <header class="lesson-segment__header">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Chip tone="primary" size="sm">
            Question {index() + 1} of {questions().length}
          </Chip>
          <Chip tone="blue" size="sm">
            {currentQuestion()?.difficulty.toUpperCase()}
          </Chip>
        </div>
        <h4 class="lesson-segment__title">{currentQuestion()?.prompt}</h4>
        <p class="lesson-segment__subtitle">
          Model the problem with the {workspace() === 'golden-beads' ? 'golden beads' : 'stamp game'}, then enter the product.
        </p>
        <p class={`lesson-segment__status lesson-segment__status--${segmentStatus()}`}>
          {segmentStatus() === 'pass'
            ? 'Practice complete!'
            : segmentStatus() === 'fail'
            ? `${props.passCriteria.maxMisses} misses reached. Reset to try again.`
            : `Correct ${correctCount()} • Incorrect ${incorrectCount()} • Attempts ${answeredCount()}`}
        </p>
      </header>

      <div class="lesson-segment__canvas practice-stage__canvas">
        <div class="practice-stage__panel">
          <label class="practice-stage__field">
            <span>Answer</span>
            <input
              type="number"
              value={answer()}
              onInput={(event) => setAnswer(event.currentTarget.value)}
              class="practice-stage__input"
              disabled={segmentStatus() !== 'idle'}
            />
          </label>
          <Show when={feedback()}>
            {(message) => <p class="lesson-segment__feedback">{message()}</p>}
          </Show>
        </div>
      </div>

      <footer class="lesson-segment__footer practice-stage__footer">
        <div class="practice-stage__controls">
          <Button onClick={handleCheck} disabled={segmentStatus() !== 'idle'}>
            Check
          </Button>
          <Button variant="secondary" onClick={() => handleReset(false)}>
            Reset set
          </Button>
          <Button variant="ghost" onClick={() => handleReset(true)}>
            New problems
          </Button>
          <Show when={index() < questions().length - 1 && segmentStatus() === 'idle'}>
            <Button variant="ghost" onClick={handleNext}>
              Skip
            </Button>
          </Show>
        </div>
      </footer>
    </LessonCanvas>
  );
};
