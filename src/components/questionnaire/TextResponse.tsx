import { useEffect, useRef } from 'react';
import type { TextQuestion } from '../../types';

interface TextResponseProps {
  question: TextQuestion;
  value: string;
  onChange: (value: string) => void;
}

/**
 * The one place we ask people to type. The field grows with the answer so the
 * mobile keyboard never covers what has been written, and the counter only
 * appears once it is close to mattering.
 */
export function TextResponse({ question, value, onChange }: TextResponseProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.max(node.scrollHeight, 120)}px`;
  }, [value]);

  const remaining = question.maxLength - value.length;

  return (
    <div className="textresponse">
      <label className="sr-only" htmlFor={question.id}>
        {question.title}
      </label>
      <textarea
        id={question.id}
        ref={ref}
        className="textresponse__field"
        value={value}
        placeholder={question.placeholder}
        maxLength={question.maxLength}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="textresponse__meta">
        <span>Your words go into the research exactly as written.</span>
        {remaining < 120 && (
          <span className="tnum" aria-live="polite">
            {remaining} left
          </span>
        )}
      </div>
    </div>
  );
}
