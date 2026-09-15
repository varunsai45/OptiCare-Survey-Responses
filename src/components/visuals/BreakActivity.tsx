import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './BreakActivity.css';

export type ActivityKey = 'blink' | 'focus' | 'color' | 'peripheral' | 'reading';

export const activityMeta: Record<
  ActivityKey,
  { name: string; instruction: string; blurb: string }
> = {
  blink: {
    name: 'Blink challenge',
    instruction: 'Blink slowly and comfortably with the circle.',
    blurb: 'A steady rhythm to follow, so blinking stops being something you forget.',
  },
  focus: {
    name: 'Focus & relax',
    instruction: 'Follow the point as it moves closer and further away.',
    blurb: 'A single point travels near and far. Your eyes travel with it.',
  },
  color: {
    name: 'Colour match',
    instruction: 'Tap the swatch that matches the name.',
    blurb: 'A few seconds of looking at something that is not text.',
  },
  peripheral: {
    name: 'Peripheral awareness',
    instruction: 'Keep your eyes on the centre. Which edge lit up?',
    blurb: 'Attention moves to the edges of the screen instead of the middle.',
  },
  reading: {
    name: 'Quick reading',
    instruction: 'Read one line at a time, unhurried.',
    blurb: 'A short, calm line of text. Nothing to scroll, nothing to answer.',
  },
};

/* ------------------------------------------------------------------ blink */

function BlinkStage({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState<'open' | 'close'>('open');

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setPhase((p) => (p === 'open' ? 'close' : 'open')), 2400);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="stage stage--blink">
      <div className={`blink__ring blink__ring--${phase}`} aria-hidden="true">
        <span className="blink__core" />
      </div>
      <p className="stage__cue" aria-live="polite">
        {phase === 'open' ? 'Eyes open, soft' : 'Close gently'}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ focus */

function FocusStage() {
  return (
    <div className="stage stage--focus">
      <div className="focus__field" aria-hidden="true">
        <span className="focus__ring focus__ring--far" />
        <span className="focus__ring focus__ring--mid" />
        <span className="focus__dot" />
      </div>
      <p className="stage__cue">Near… and far again.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ colour */

const swatches = [
  { name: 'Moss', hex: '#5d7a5a' },
  { name: 'Clay', hex: '#b07a5c' },
  { name: 'Slate', hex: '#5a6c7d' },
  { name: 'Plum', hex: '#7a5a72' },
  { name: 'Sand', hex: '#c2a878' },
  { name: 'Teal', hex: '#3f8a8a' },
];

/** Three swatches per round, walking the list so no round repeats the last. */
function pickRound(round: number) {
  const choices = [0, 1, 2].map((offset) => swatches[(round * 2 + offset) % swatches.length]);
  const target = choices[round % 3];
  return { choices, target };
}

function ColourStage() {
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<'none' | 'right' | 'wrong'>('none');
  const { choices, target } = useMemo(() => pickRound(round + 1), [round]);

  const answer = (name: string) => {
    if (name === target.name) {
      setResult('right');
      setTimeout(() => {
        setResult('none');
        setRound((r) => r + 1);
      }, 600);
    } else {
      setResult('wrong');
      setTimeout(() => setResult('none'), 600);
    }
  };

  return (
    <div className="stage stage--colour">
      <p className="colour__target">{target.name}</p>
      <div className="colour__row">
        {choices.map((swatch) => (
          <button
            key={swatch.name}
            type="button"
            className="colour__swatch"
            style={{ background: swatch.hex }}
            onClick={() => answer(swatch.name)}
          >
            <span className="sr-only">{swatch.name}</span>
          </button>
        ))}
      </div>
      <p className="stage__cue" aria-live="polite">
        {result === 'right' ? 'That’s it.' : result === 'wrong' ? 'Not quite — try again.' : ' '}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------- peripheral */

const edges = ['top', 'right', 'bottom', 'left'] as const;
type Edge = (typeof edges)[number];

function PeripheralStage() {
  const [lit, setLit] = useState<Edge | null>(null);
  const [feedback, setFeedback] = useState<string>(' ');
  const timer = useRef<number>();

  const flash = useCallback(() => {
    const edge = edges[Math.floor(Math.random() * edges.length)];
    setLit(edge);
    timer.current = window.setTimeout(() => setLit(null), 900);
  }, []);

  useEffect(() => {
    const id = setInterval(flash, 2600);
    flash();
    return () => {
      clearInterval(id);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [flash]);

  const guess = (edge: Edge) => {
    setFeedback(edge === lit ? 'Yes — without looking straight at it.' : 'Keep your eyes centred.');
    setTimeout(() => setFeedback(' '), 1200);
  };

  return (
    <div className="stage stage--peripheral">
      <div className="periph__field">
        {edges.map((edge) => (
          <span key={edge} className={`periph__edge periph__edge--${edge} ${lit === edge ? 'is-lit' : ''}`} aria-hidden="true" />
        ))}
        <span className="periph__centre" aria-hidden="true" />
      </div>
      <div className="periph__controls">
        {edges.map((edge) => (
          <button key={edge} type="button" className="periph__btn" onClick={() => guess(edge)}>
            {edge}
          </button>
        ))}
      </div>
      <p className="stage__cue" aria-live="polite">
        {feedback}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- reading */

const lines = [
  'Let your shoulders drop.',
  'Find something further away than this screen.',
  'Rest your eyes there for a moment.',
  'Nothing needs your attention right now.',
];

function ReadingStage({ reduced }: { reduced: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % lines.length), 5000);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="stage stage--reading">
      <p className="reading__line" key={index}>
        {lines[index]}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------- container */

interface BreakActivityProps {
  activity: ActivityKey;
  duration?: number;
  onComplete: () => void;
  onExit?: () => void;
  tone?: 'light' | 'dark';
}

export function BreakActivity({
  activity,
  duration = 30,
  onComplete,
  onExit,
  tone = 'dark',
}: BreakActivityProps) {
  const reduced = useReducedMotion();
  const [remaining, setRemaining] = useState(duration);
  const done = useRef(false);
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    setRemaining(duration);
    done.current = false;
    const id = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(id);
          if (!done.current) {
            done.current = true;
            complete.current();
          }
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activity, duration]);

  const meta = activityMeta[activity];
  const progress = 1 - remaining / duration;
  const circumference = 2 * Math.PI * 22;

  return (
    <div className={`activity activity--${tone}`}>
      <div className="activity__head">
        <p className="activity__name">{meta.name}</p>
        <div className="activity__timer">
          <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
            <circle className="activity__timer-track" cx="26" cy="26" r="22" />
            <circle
              className="activity__timer-fill"
              cx="26"
              cy="26"
              r="22"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <span className="activity__count tnum" aria-live="off">
            {String(remaining).padStart(2, '0')}
          </span>
        </div>
      </div>

      <p className="activity__instruction">{meta.instruction}</p>

      <div className="activity__stage">
        {activity === 'blink' && <BlinkStage reduced={reduced} />}
        {activity === 'focus' && <FocusStage />}
        {activity === 'color' && <ColourStage />}
        {activity === 'peripheral' && <PeripheralStage />}
        {activity === 'reading' && <ReadingStage reduced={reduced} />}
      </div>

      <p className="sr-only" aria-live="polite">
        {remaining} seconds remaining in the {meta.name} activity.
      </p>

      {onExit && (
        <button type="button" className="activity__exit" onClick={onExit}>
          End the break early
        </button>
      )}
    </div>
  );
}
