import { useEffect, useState } from 'react';
import { useInView } from '../../hooks/useReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { BreakActivity, type ActivityKey } from './BreakActivity';
import { Wordmark } from '../common/Wordmark';
import './SessionDemo.css';

type Phase = 'working' | 'prompt' | 'activity' | 'done' | 'dismissed';

const START_SECONDS = 2 * 3600 + 29 * 60 + 52; // 2:29:52
const TRIGGER_SECONDS = 2 * 3600 + 30 * 60; // 2:30:00

function clock(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface SessionDemoProps {
  /** Which activity runs if the visitor starts the break. */
  activity?: ActivityKey;
}

/**
 * A played-out version of the interaction we are proposing: a long session
 * crosses a threshold, OptiCare offers a pause, and the visitor decides.
 *
 * It only ever runs inside this frame. Nothing is timed, tracked or
 * interrupted on the visitor's own machine, and the threshold is presented as
 * a product idea rather than a medical rule.
 */
export function SessionDemo({ activity = 'blink' }: SessionDemoProps) {
  const reduced = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(START_SECONDS);
  const [phase, setPhase] = useState<Phase>('working');
  const ref = useInView<HTMLDivElement>(() => setStarted(true), 0.4);

  useEffect(() => {
    if (!started || phase !== 'working') return;

    if (reduced) {
      setSeconds(TRIGGER_SECONDS);
      setPhase('prompt');
      return;
    }

    const id = setInterval(() => {
      setSeconds((value) => {
        if (value + 1 >= TRIGGER_SECONDS) {
          clearInterval(id);
          setPhase('prompt');
          return TRIGGER_SECONDS;
        }
        return value + 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [phase, reduced, started]);

  const replay = () => {
    setSeconds(START_SECONDS);
    setPhase('working');
  };

  return (
    <div className="session" ref={ref}>
      <div className="session__frame">
        <div className="session__chrome" aria-hidden="true">
          <span className="session__dot" />
          <span className="session__dot" />
          <span className="session__dot" />
          <span className="session__tab">Assignment — final draft</span>
        </div>

        <div className="session__screen">
          {phase === 'activity' ? (
            <div className="session__activity">
              <BreakActivity
                activity={activity}
                duration={30}
                onComplete={() => setPhase('done')}
                onExit={() => setPhase('done')}
              />
            </div>
          ) : phase === 'done' ? (
            <div className="session__done">
              <span className="session__tick" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12.5 4.5 4.5L19 7" />
                </svg>
              </span>
              <p className="session__done-title">Break completed.</p>
              <p className="session__done-copy">Session timer reset. Nothing else changed.</p>
              <button type="button" className="btn btn--light btn--sm" onClick={replay}>
                Back to work
              </button>
            </div>
          ) : (
            <>
              <div className="session__doc" aria-hidden="true">
                <span className="session__line session__line--head" />
                <span className="session__line" />
                <span className="session__line session__line--short" />
                <span className="session__line" />
                <span className="session__line session__line--short" />
                <span className="session__line" />
                <span className="session__caret" />
              </div>

              <div className={`session__meter ${phase === 'prompt' ? 'is-hot' : ''}`}>
                <span className="session__meter-label">Continuous screen session</span>
                <span className="session__meter-value tnum">{clock(seconds)}</span>
              </div>

              {phase === 'prompt' && (
                <div className="session__toast" role="status">
                  <div className="session__toast-head">
                    <Wordmark variant="mark" size={16} />
                    <span className="session__toast-app">Eye break</span>
                  </div>
                  <p className="session__toast-title">
                    You&rsquo;ve been on a screen for about two and a half hours.
                  </p>
                  <p className="session__toast-copy">Take 60 seconds?</p>
                  <div className="session__toast-actions">
                    <button
                      type="button"
                      className="btn btn--accent btn--sm"
                      onClick={() => setPhase('activity')}
                    >
                      Start break
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm on-dark"
                      onClick={() => setPhase('dismissed')}
                    >
                      Not now
                    </button>
                  </div>
                </div>
              )}

              {phase === 'dismissed' && (
                <div className="session__toast session__toast--quiet" role="status">
                  <p className="session__toast-copy">
                    Dismissed. OptiCare would stay quiet and ask again later.
                  </p>
                  <button type="button" className="session__replay" onClick={replay}>
                    Replay this moment
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <p className="marker session__marker">Concept demonstration</p>
    </div>
  );
}
