import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { steps } from '../data/questions';
import type { Answers, AnswerValue, Question, QuestionId, SubmissionState } from '../types';
import {
  buildPayload,
  createSubmissionId,
  submitSurvey,
  SubmissionError,
} from '../services/surveySubmission';

const STORAGE_KEY = 'opticare.research.v1';

interface PersistedState {
  answers: Answers;
  details: Partial<Record<QuestionId, string>>;
  stepIndex: number;
  submissionId: string;
  completed: boolean;
}

function readStorage(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return {
      answers: parsed.answers ?? {},
      details: parsed.details ?? {},
      stepIndex: Math.min(Math.max(parsed.stepIndex ?? 0, 0), steps.length - 1),
      submissionId: parsed.submissionId || createSubmissionId(),
      completed: Boolean(parsed.completed),
    };
  } catch {
    // Private mode, disabled storage, corrupted value — start clean rather
    // than break the experience.
    return null;
  }
}

function writeStorage(state: PersistedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — progress simply won't survive a refresh */
  }
}

function clearStorage() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

/** Is this answer good enough to move on? */
export function validate(
  question: Question,
  value: AnswerValue | undefined,
  detail?: string,
): string | null {
  const needsDetail =
    'options' in question &&
    question.options.some((o) => o.allowsDetail && o.value === 'Other') &&
    (Array.isArray(value) ? value.includes('Other') : value === 'Other');

  if (needsDetail && !(detail ?? '').trim()) {
    return 'Add a few words so we know what to record.';
  }

  switch (question.type) {
    case 'single':
      if (!value) return question.required ? 'Choose one option to continue.' : null;
      return null;
    case 'multi': {
      const list = Array.isArray(value) ? value : [];
      if (list.length < (question.minSelections ?? 1) && question.required) {
        return 'Choose at least one option to continue.';
      }
      return null;
    }
    case 'rating':
      if (typeof value !== 'number') return 'Pick a point on the scale to continue.';
      return null;
    case 'text': {
      const text = typeof value === 'string' ? value.trim() : '';
      if (!text && question.required) return 'A short sentence is all we need.';
      if (question.minLength && text.length > 0 && text.length < question.minLength) {
        return `Just a few more characters — at least ${question.minLength}.`;
      }
      return null;
    }
  }
}

export function useSurvey() {
  const restored = useRef<PersistedState | null>(null);
  if (restored.current === null && typeof window !== 'undefined') {
    restored.current = readStorage() ?? {
      answers: {},
      details: {},
      stepIndex: 0,
      submissionId: createSubmissionId(),
      completed: false,
    };
  }
  const initial = restored.current!;

  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [details, setDetails] = useState<Partial<Record<QuestionId, string>>>(initial.details);
  const [stepIndex, setStepIndex] = useState(initial.completed ? 0 : initial.stepIndex);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionState>(
    initial.completed ? { status: 'success' } : { status: 'idle' },
  );
  const submissionId = useRef(initial.submissionId);
  const inFlight = useRef(false);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  /* `next` and `submit` can be called from a timer (the auto-advance on a
     short single-choice question), by which point the values captured in a
     closure are a render behind. These refs keep both reading the answers as
     they are now, not as they were when the callback was created. */
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const detailsRef = useRef(details);
  detailsRef.current = details;
  const stepIndexRef = useRef(stepIndex);
  stepIndexRef.current = stepIndex;

  useEffect(() => {
    writeStorage({
      answers,
      details,
      stepIndex,
      submissionId: submissionId.current,
      completed: submission.status === 'success',
    });
  }, [answers, details, stepIndex, submission.status]);

  const setAnswer = useCallback((id: QuestionId, value: AnswerValue) => {
    setError(null);
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setDetail = useCallback((id: QuestionId, value: string) => {
    setDetails((prev) => ({ ...prev, [id]: value }));
  }, []);

  const goTo = useCallback((index: number, dir: 1 | -1) => {
    setDirection(dir);
    setError(null);
    setStepIndex(index);
  }, []);

  const back = useCallback(() => {
    if (stepIndex > 0) goTo(stepIndex - 1, -1);
  }, [goTo, stepIndex]);

  /** Validates whatever step is current right now. Null means "good to go". */
  const checkCurrent = useCallback((): string | null => {
    const current = steps[stepIndexRef.current];
    if (current.kind !== 'question') return null;
    return validate(
      current.question,
      answersRef.current[current.question.id],
      detailsRef.current[current.question.id],
    );
  }, []);

  /** Returns true when the flow moved forward. */
  const next = useCallback((): boolean => {
    const problem = checkCurrent();
    if (problem) {
      setError(problem);
      return false;
    }
    if (stepIndexRef.current >= steps.length - 1) return false;
    goTo(stepIndexRef.current + 1, 1);
    return true;
  }, [checkCurrent, goTo]);

  const submit = useCallback(async () => {
    if (inFlight.current) return;

    const problem = checkCurrent();
    if (problem) {
      setError(problem);
      return;
    }

    inFlight.current = true;
    setSubmission({ status: 'submitting' });
    try {
      await submitSurvey(buildPayload(answersRef.current, detailsRef.current, submissionId.current));
      setSubmission({ status: 'success' });
    } catch (err) {
      const message =
        err instanceof SubmissionError
          ? err.message
          : "We couldn't submit your response right now. Your answers are safe — please try again.";
      setSubmission({ status: 'error', message });
    } finally {
      inFlight.current = false;
    }
  }, [checkCurrent]);

  const restart = useCallback(() => {
    clearStorage();
    submissionId.current = createSubmissionId();
    setAnswers({});
    setDetails({});
    setStepIndex(0);
    setDirection(1);
    setError(null);
    setSubmission({ status: 'idle' });
  }, []);

  /** 0–1, counting only real questions so interstitials don't inflate it. */
  const progress = useMemo(() => {
    const answered = steps
      .slice(0, stepIndex)
      .filter((s) => s.kind === 'question').length;
    const total = steps.filter((s) => s.kind === 'question').length;
    return Math.min(answered / total, 1);
  }, [stepIndex]);

  /** True when the participant has enough saved progress to be worth resuming. */
  const hasSavedProgress =
    initial.stepIndex > 0 && !initial.completed && Object.keys(initial.answers).length > 0;

  return {
    step,
    stepIndex,
    direction,
    answers,
    details,
    error,
    submission,
    progress,
    isLast,
    hasSavedProgress,
    setAnswer,
    setDetail,
    setError,
    back,
    next,
    submit,
    restart,
    goTo,
  };
}

export type SurveyController = ReturnType<typeof useSurvey>;
