import { useEffect, useRef } from 'react';
import { Glyph } from '../common/Glyph';
import type { MultiQuestion, QuestionOption, SingleQuestion } from '../../types';

interface OptionListProps {
  question: SingleQuestion | MultiQuestion;
  value: string | string[] | null;
  detail: string;
  onChange: (value: string | string[]) => void;
  onDetailChange: (value: string) => void;
}

function isSelected(value: string | string[] | null, option: QuestionOption) {
  return Array.isArray(value) ? value.includes(option.value) : value === option.value;
}

/**
 * Renders both single- and multi-select questions. Multi-select handles the
 * "none of these" case: choosing it clears the rest, and choosing anything
 * else clears it, so the two can never be recorded together.
 */
export function OptionList({
  question,
  value,
  detail,
  onChange,
  onDetailChange,
}: OptionListProps) {
  const multi = question.type === 'multi';
  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  const otherPicked =
    question.options.some((o) => o.allowsDetail && isSelected(value, o)) &&
    (Array.isArray(value) ? value.includes('Other') : value === 'Other');

  useEffect(() => {
    if (otherPicked) detailRef.current?.focus();
  }, [otherPicked]);

  const toggle = (option: QuestionOption) => {
    if (!multi) {
      onChange(option.value);
      return;
    }

    const current = Array.isArray(value) ? value : [];
    const exclusives = question.options.filter((o) => o.exclusive).map((o) => o.value);

    if (option.exclusive) {
      onChange(current.includes(option.value) ? [] : [option.value]);
      return;
    }

    const without = current.filter((v) => !exclusives.includes(v));
    onChange(
      without.includes(option.value)
        ? without.filter((v) => v !== option.value)
        : [...without, option.value],
    );
  };

  /** Arrow keys walk the list; everything else is left to the browser. */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];
    if (!keys.includes(event.key)) return;
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('.option') ?? [],
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;
    event.preventDefault();
    const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
    buttons[(index + delta + buttons.length) % buttons.length]?.focus();
  };

  return (
    <div>
      <div
        className={`options ${question.options.length > 6 ? 'options--dense' : ''}`}
        ref={listRef}
        onKeyDown={onKeyDown}
        role={multi ? 'group' : 'radiogroup'}
        aria-label={question.title}
      >
        {question.options.map((option) => {
          const selected = isSelected(value, option);
          return (
            <button
              key={option.value}
              type="button"
              className={`option ${selected ? 'is-selected' : ''}`}
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={selected}
              onClick={() => toggle(option)}
            >
              {option.icon && (
                <span className="option__icon">
                  <Glyph name={option.icon} size={20} />
                </span>
              )}
              <span className="option__text">
                <span className="option__label">{option.value}</span>
                {option.hint && <span className="option__hint">{option.hint}</span>}
              </span>
              <span className={`option__mark ${multi ? 'option__mark--box' : ''}`} aria-hidden="true">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 8.4 3.2 3.2L13 4.8" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      {otherPicked && (
        <label className="detail">
          <span className="detail__label">What would you call it?</span>
          <input
            ref={detailRef}
            className="detail__input"
            type="text"
            value={detail}
            maxLength={80}
            onChange={(event) => onDetailChange(event.target.value)}
            placeholder="A few words is enough"
          />
        </label>
      )}
    </div>
  );
}
