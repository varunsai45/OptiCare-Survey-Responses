import { useEffect, useRef, useState } from 'react';
import { questionCount, questionNumber } from '../../data/questions';
import { useSurvey } from '../../hooks/useSurvey';
import type { AnswerValue } from '../../types';
import { Wordmark } from '../common/Wordmark';
import { ConceptCard } from './ConceptCard';
import { OptionList } from './OptionList';
import { RatingScale } from './RatingScale';
import { SuccessScreen } from './SuccessScreen';
import { TextResponse } from './TextResponse';
import './Questionnaire.css';

interface QuestionnaireProps {
  onClose: () => void;
}

const AUTO_ADVANCE_MS = 420;

export function Questionnaire({ onClose }: QuestionnaireProps) {
  const survey = useSurvey();
  const {
    step,
    stepIndex,
    direction,
    answers,
    details,
    error,
    submission,
    progress,
    isLast,
    setAnswer,
    setDetail,
    back,
    next,
    submit,
    restart,
  } = survey;

  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<number>();
  const [leaving, setLeaving] = useState(false);

  /* Move focus to the new question so screen-reader and keyboard users are
     taken with the flow instead of being left at the bottom of the page. */
  useEffect(() => {
    headingRef.current?.focus();
    // Drop any pending auto-advance: if the step changed by some other route
    // (Back, Continue, a keypress) the timer must not move things again.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, [stepIndex]);

  useEffect(() => {
    document.body.classList.add('is-locked');
    return () => {
      document.body.classList.remove('is-locked');
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  /* Enter continues, but only from outside a textarea and only when the
     current answer passes validation. Escape closes; it never clears. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Enter') return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'TEXTAREA' && !event.metaKey && !event.ctrlKey) return;
      if (target?.tagName === 'BUTTON') return;
      event.preventDefault();
      if (isLast) void submit();
      else next();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLast, next, onClose, submit]);

  const close = () => {
    setLeaving(true);
    window.setTimeout(onClose, 220);
  };

  if (submission.status === 'success') {
    return (
      <div className={`quiz on-dark ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Research complete">
        <SuccessScreen onRestart={restart} onClose={close} />
      </div>
    );
  }

  if (step.kind === 'interstitial') {
    return (
      <div className={`quiz on-dark ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="OptiCare research">
        <QuizHeader progress={progress} label="A moment of context" onClose={close} />
        <div className="quiz__stage" key={step.id} data-dir={direction}>
          <ConceptCard step={step} onContinue={() => next()} onBack={back} />
        </div>
      </div>
    );
  }

  const question = step.question;
  const value = (answers[question.id] ?? null) as AnswerValue;
  const detail = details[question.id] ?? '';
  const index = questionNumber[question.id];
  const submitting = submission.status === 'submitting';

  const handleChange = (nextValue: AnswerValue) => {
    setAnswer(question.id, nextValue);

    if (
      question.type === 'single' &&
      question.autoAdvance &&
      typeof nextValue === 'string' &&
      nextValue !== 'Other'
    ) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => next(), AUTO_ADVANCE_MS);
    }
  };

  return (
    <div className={`quiz on-dark ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="OptiCare research questionnaire">
      <QuizHeader
        progress={progress}
        label={`${String(index).padStart(2, '0')} / ${questionCount}`}
        onClose={close}
      />

      <div className="quiz__stage" key={question.id} data-dir={direction}>
        <div className="qscreen">
          <div className="qscreen__body">
            <h2 className="qscreen__title" tabIndex={-1} ref={headingRef}>
              {question.title}
            </h2>
            {question.description && <p className="qscreen__desc">{question.description}</p>}

            <div className="qscreen__control">
              {(question.type === 'single' || question.type === 'multi') && (
                <OptionList
                  question={question}
                  value={value as string | string[] | null}
                  detail={detail}
                  onChange={handleChange}
                  onDetailChange={(text) => setDetail(question.id, text)}
                />
              )}
              {question.type === 'rating' && (
                <RatingScale
                  question={question}
                  value={typeof value === 'number' ? value : null}
                  onChange={handleChange}
                />
              )}
              {question.type === 'text' && (
                <TextResponse
                  question={question}
                  value={typeof value === 'string' ? value : ''}
                  onChange={handleChange}
                />
              )}
            </div>

            <details className="why">
              <summary className="why__summary">Why we ask this</summary>
              <p className="why__body">{question.researchPurpose}</p>
            </details>
          </div>

          <div className="qnav">
            <button
              type="button"
              className="btn btn--ghost btn--sm on-dark"
              onClick={back}
              disabled={stepIndex === 0 || submitting}
            >
              Back
            </button>

            <div className="qnav__right">
              {error && (
                <p className="qnav__error" role="alert">
                  {error}
                </p>
              )}
              {isLast ? (
                <button
                  type="button"
                  className="btn btn--accent"
                  onClick={() => void submit()}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    'Submit my response'
                  )}
                </button>
              ) : (
                <button type="button" className="btn btn--accent" onClick={() => next()}>
                  Continue
                  <span className="btn__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              )}
            </div>
          </div>

          {submission.status === 'error' && (
            <div className="qerror" role="alert">
              <p className="qerror__msg">{submission.message}</p>
              <button
                type="button"
                className="btn btn--light btn--sm"
                onClick={() => void submit()}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuizHeader({
  progress,
  label,
  onClose,
}: {
  progress: number;
  label: string;
  onClose: () => void;
}) {
  return (
    <header className="quiz__head">
      <div
        className="quiz__progress"
        role="progressbar"
        aria-label="Questionnaire progress"
        aria-valuemin={0}
        aria-valuemax={questionCount}
        aria-valuenow={Math.round(progress * questionCount)}
      >
        <span className="quiz__progress-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="quiz__head-row">
        <Wordmark />
        <span className="quiz__count tnum">{label}</span>
        <button type="button" className="quiz__close" onClick={onClose}>
          <span className="sr-only">Leave the questionnaire</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
