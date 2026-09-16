import { useEffect, useState } from 'react';
import type { Interstitial } from '../../types';
import { ExposureChart } from '../visuals/ExposureChart';
import { Wordmark } from '../common/Wordmark';
import { Illustration } from '../common/Illustration';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ConceptCardProps {
  step: Interstitial;
  onContinue: () => void;
  onBack: () => void;
}

/** Ticks 2h 29m → 2h 30m, then reveals the notification it would trigger. */
function BreakConceptVisual() {
  const reduced = useReducedMotion();
  const [minutes, setMinutes] = useState(reduced ? 150 : 147);
  const [shown, setShown] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setMinutes((value) => {
        if (value >= 150) {
          clearInterval(id);
          setShown(true);
          return 150;
        }
        return value + 1;
      });
    }, 620);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="conceptviz">
      <Illustration
        name="eye-break-notification"
        alt="A long session reaching two and a half hours, then a notification offering an eye break, then a thirty to sixty second activity, then back to work."
        tone="dark"
        className="ill--wide"
      />

      <div className={`conceptviz__timer ${minutes >= 150 ? 'is-hot' : ''}`}>
        <span className="conceptviz__timer-label">Continuous screen session</span>
        <span className="conceptviz__timer-value tnum">
          {Math.floor(minutes / 60)}h {String(minutes % 60).padStart(2, '0')}m
        </span>
      </div>

      <div className={`conceptviz__toast ${shown ? 'is-shown' : ''}`} aria-hidden={!shown}>
        <div className="conceptviz__toast-head">
          <Wordmark variant="mark" size={15} />
          <span>Eye break</span>
        </div>
        <p className="conceptviz__toast-title">Your eyes deserve 60 seconds.</p>
        <p className="conceptviz__toast-copy">
          Start a short break — or carry on and be asked again later.
        </p>
      </div>

      <p className="marker">Concept, not a medical rule</p>
    </div>
  );
}

export function ConceptCard({ step, onContinue, onBack }: ConceptCardProps) {
  return (
    <div className="qscreen qscreen--concept">
      <div className="qscreen__body">
        <p className="eyebrow">{step.eyebrow}</p>
        <h2 className="qscreen__title qscreen__title--concept">{step.title}</h2>
        <p className="qscreen__desc">{step.body}</p>

        <div className="qscreen__concept-visual">
          {step.variant === 'break-concept' ? <BreakConceptVisual /> : <ExposureChart tone="dark" />}
        </div>
      </div>

      <div className="qnav">
        <button type="button" className="btn btn--ghost btn--sm on-dark" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn--accent" onClick={onContinue}>
          {step.cta}
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
