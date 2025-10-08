import { For, Show, createEffect, createMemo, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

import type { DemoEventRecorder } from '../../analytics/events';
import type { PracticePassCriteria, PracticeQuestion, PracticeSegment as PracticeSegmentType } from '../../types';
import { Button, Card, Chip } from '../../../design-system';

interface PracticeSegmentProps {
  lessonId: string;
  segment: PracticeSegmentType;
  questions: PracticeQuestion[];
  passCriteria: PracticePassCriteria;
  refreshKey?: number;
  onSegmentResult: (result: 'pass' | 'fail') => void;
  onTaskResult?: (taskId: string, status: 'completed' | 'incorrect') => void;
  recordEvent?: DemoEventRecorder;
}

interface QuestionState {
  status: 'pending' | 'correct' | 'incorrect';
  answer?: number;
}

const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const regenerateQuestions = (workspace: PracticeSegmentType['workspace'], base: PracticeQuestion[]) => {
  return base.map((question) => {
    let multiplicand = question.multiplicand;
    let multiplier = question.multiplier;

    if (workspace === 'golden-beads') {
      multiplicand = randomInRange(1200, 4999);
      multiplier = randomInRange(2, 8);
    } else {
      multiplicand = randomInRange(210, 599);
      multiplier = randomInRange(2, 6);
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
  });

  const resetState = (regenerate: boolean) => {
    const resetQuestions = regenerate ? regenerateQuestions(props.segment.workspace, props.questions) : props.questions;
    setQuestions([...resetQuestions]);
    setQuestionStates(() => buildInitialStates(resetQuestions));
    setIndex(0);
    setAnswer('');
    setFeedback(null);
    setSegmentStatus('idle');
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnsweredCount(0);
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

  return (
    <div class="flex flex-col gap-5 text-[color:var(--color-text)]">
      <header class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Chip tone="primary" size="sm">
            Question {index() + 1} of {questions().length}
          </Chip>
          <Chip tone="blue" size="sm">
            {currentQuestion()?.difficulty.toUpperCase()}
          </Chip>
        </div>
        <h4 class="text-2xl font-semibold text-[color:var(--color-heading)]">{currentQuestion()?.prompt}</h4>
        <p class="text-sm text-subtle">
          Answer with the total after modeling the problem using the {props.segment.workspace === 'golden-beads' ? 'golden bead material' : 'stamp game'}.
        </p>
      </header>

      <Card variant="flat" class={`rounded-[var(--radius-lg)] p-4 sm:p-5 space-y-2 ${
        segmentStatus() === 'pass'
          ? 'surface-success'
          : segmentStatus() === 'fail'
          ? 'surface-attention'
          : 'surface-neutral'
      }`}>
        <p class="text-sm font-semibold leading-snug">
          {segmentStatus() === 'pass'
            ? 'Practice complete! Mark the lesson segment done.'
            : segmentStatus() === 'fail'
            ? `${props.passCriteria.maxMisses} misses reached. Reset to try a new problem set.`
            : 'Work the problem, then enter your final answer.'}
        </p>
        <p class="text-xs text-subtle opacity-80">
          Correct: {correctCount()} • Incorrect: {incorrectCount()} • Attempts: {answeredCount()}
        </p>
      </Card>

      <Card variant="soft" class="rounded-[var(--radius-lg)] p-4 sm:p-5 space-y-3">
        <label class="flex flex-col gap-2 text-sm">
          <span>Answer</span>
          <input
            type="number"
            value={answer()}
            onInput={(event) => setAnswer(event.currentTarget.value)}
            class="rounded-[var(--radius-sm)] border border-[rgba(64,157,233,0.35)] bg-white px-3 py-2 text-base"
            disabled={segmentStatus() !== 'idle'}
          />
        </label>
        <div class="flex flex-wrap gap-2">
          <Button size="compact" onClick={handleCheck} disabled={segmentStatus() !== 'idle'}>
            Check answer
          </Button>
          <Button variant="secondary" size="compact" onClick={() => handleReset(false)}>
            Reset current set
          </Button>
          <Button variant="ghost" size="compact" onClick={() => handleReset(true)}>
            Regenerate problems
          </Button>
          <Show when={index() < questions().length - 1 && segmentStatus() === 'idle'}>
            <Button variant="ghost" size="compact" onClick={handleNext}>
              Skip to next
            </Button>
          </Show>
        </div>
        <Show when={feedback()}>
          {(message) => <p class="text-sm text-subtle">{message()}</p>}
        </Show>
      </Card>

      <Card variant="flat" class="surface-neutral rounded-[var(--radius-lg)] p-4 sm:p-5 space-y-3">
        <p class="text-xs uppercase tracking-wide text-label-soft">Question tracker</p>
        <div class="flex flex-col gap-2">
          <For each={questions()}>
            {(question, questionIndex) => {
              const state = () => questionStates[question.id];
              return (
                <div class="rounded-[var(--radius-md)] border border-[rgba(64,157,233,0.2)] bg-white/85 px-4 py-3 text-sm">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-label-soft">
                        Question {questionIndex() + 1}
                      </p>
                      <p class="mt-1 font-semibold leading-snug">
                        {question.multiplicand} × {question.multiplier}
                      </p>
                    </div>
                    <Chip
                      tone={
                        state()?.status === 'correct'
                          ? 'green'
                          : state()?.status === 'incorrect'
                          ? 'red'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {state()?.status === 'correct'
                        ? 'Correct'
                        : state()?.status === 'incorrect'
                        ? 'Incorrect'
                        : 'Pending'}
                    </Chip>
                  </div>
                  <Show when={state()?.answer !== undefined}>
                    <p class="mt-1 text-xs text-subtle">Your answer: {state()?.answer}</p>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </Card>
    </div>
  );
};
