import type { RatingQuestion } from '../../types';

interface RatingScaleProps {
  question: RatingQuestion;
  value: number | null;
  onChange: (value: number) => void;
}

/**
 * Five points, each with its own words. The label is always visible for the
 * selected point, so the meaning never depends on remembering that 4 is
 * "very" — and never on colour alone.
 */
export function RatingScale({ question, value, onChange }: RatingScaleProps) {
  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys = ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : -1;
    const current = value ?? (delta > 0 ? 0 : question.scale.length + 1);
    const next = Math.min(Math.max(current + delta, 1), question.scale.length);
    onChange(next);
  };

  const selected = question.scale.find((point) => point.value === value);

  return (
    <div className="rating">
      <div className="rating__row" role="radiogroup" aria-label={question.title} onKeyDown={onKeyDown}>
        {question.scale.map((point) => {
          const isOn = point.value === value;
          return (
            <button
              key={point.value}
              type="button"
              role="radio"
              aria-checked={isOn}
              aria-label={`${point.value} — ${point.label}`}
              tabIndex={isOn || (!value && point.value === 1) ? 0 : -1}
              className={`rating__point ${isOn ? 'is-selected' : ''}`}
              onClick={() => onChange(point.value)}
            >
              <span className="rating__number tnum">{point.value}</span>
              <span className="rating__label">{point.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rating__readout" aria-live="polite">
        {selected ? (
          <>
            <span className="rating__readout-value tnum">{selected.value}</span>
            <span className="rating__readout-label">{selected.label}</span>
          </>
        ) : (
          <span className="rating__readout-hint">
            1 is {question.scale[0].label.toLowerCase()}, 5 is{' '}
            {question.scale[4].label.toLowerCase()}.
          </span>
        )}
      </div>
    </div>
  );
}
