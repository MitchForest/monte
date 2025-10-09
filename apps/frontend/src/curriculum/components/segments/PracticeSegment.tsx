import { Show, createEffect, createMemo, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

import type { DemoEventRecorder } from '../../analytics/events';
import type { PracticePassCriteria, PracticeQuestion, PracticeSegment as PracticeSegmentType } from '../../types';
import { Button, Chip } from '../../../design-system';

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
    <div class="lesson-stage" data-variant="practice">
      <header class="lesson-stage__header">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Chip tone="primary" size="sm">
            Question {index() + 1} of {questions().length}
          </Chip>
          <Chip tone="blue" size="sm">
            {currentQuestion()?.difficulty.toUpperCase()}
          </Chip>
        </div>
        <h4 class="lesson-stage__title">{currentQuestion()?.prompt}</h4>
        <p class="lesson-stage__subtitle">
          Model the problem with the {props.segment.workspace === 'golden-beads' ? 'golden beads' : 'stamp game'}, then enter the product.
        </p>
        <p class={`lesson-stage__status lesson-stage__status--${segmentStatus()}`}>
          {segmentStatus() === 'pass'
            ? 'Practice complete!'
            : segmentStatus() === 'fail'
            ? `${props.passCriteria.maxMisses} misses reached. Reset to try again.`
            : `Correct ${correctCount()} • Incorrect ${incorrectCount()} • Attempts ${answeredCount()}`}
        </p>
      </header>

      <div class="lesson-stage__canvas practice-stage__canvas">
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
            {(message) => <p class="lesson-stage__feedback">{message()}</p>}
          </Show>
        </div>
      </div>

      <footer class="lesson-stage__footer practice-stage__footer">
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
    </div>
  );
};
