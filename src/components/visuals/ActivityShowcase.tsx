import { useState } from 'react';
import { useInView } from '../../hooks/useReveal';
import { BreakActivity, activityMeta, type ActivityKey } from './BreakActivity';
import './ActivityShowcase.css';

const order: ActivityKey[] = ['blink', 'focus', 'color', 'peripheral', 'reading'];

/**
 * Five candidate break formats, one of which is playing at any time. The
 * visitor picks; nothing auto-rotates, because a demo that changes under you
 * is harder to judge than one you chose.
 */
export function ActivityShowcase() {
  const [active, setActive] = useState<ActivityKey>('blink');
  const [runId, setRunId] = useState(0);
  // The demo only starts once it is on screen, so nothing is ticking away in
  // the background while someone is reading a different part of the page.
  const [started, setStarted] = useState(false);
  const panelRef = useInView<HTMLDivElement>(() => setStarted(true), 0.3);

  const choose = (key: ActivityKey) => {
    setActive(key);
    setRunId((n) => n + 1);
  };

  return (
    <div className="showcase">
      <div className="showcase__list" role="tablist" aria-label="Eye-rest activity concepts">
        {order.map((key) => {
          const meta = activityMeta[key];
          const selected = key === active;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`activity-tab-${key}`}
              aria-selected={selected}
              aria-controls="activity-panel"
              className={`showcase__item ${selected ? 'is-active' : ''}`}
              onClick={() => choose(key)}
            >
              <span className="showcase__item-name">{meta.name}</span>
              <span className="showcase__item-blurb">{meta.blurb}</span>
            </button>
          );
        })}
      </div>

      <div
        className="showcase__panel"
        id="activity-panel"
        role="tabpanel"
        ref={panelRef}
        aria-labelledby={`activity-tab-${active}`}
      >
        {started && (
          <BreakActivity
            key={`${active}-${runId}`}
            activity={active}
            duration={30}
            onComplete={() => setRunId((n) => n + 1)}
          />
        )}
      </div>
    </div>
  );
}
