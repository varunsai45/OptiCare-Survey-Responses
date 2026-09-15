import './Wordmark.css';

interface WordmarkProps {
  /** `mark` renders the eye alone; `full` adds the OPTICARE lockup. */
  variant?: 'full' | 'mark';
  size?: number;
}

/**
 * The identity is a single idea: the O in OPTICARE is also an eye. The mark
 * is the same geometry pulled out on its own. Nothing else — no gradient,
 * no container, no glow.
 */
export function Wordmark({ variant = 'full', size = 20 }: WordmarkProps) {
  const mark = (
    <svg
      className="wordmark__mark"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1.8 12C5.2 6.8 8.6 4.2 12 4.2S18.8 6.8 22.2 12c-3.4 5.2-6.8 7.8-10.2 7.8S5.2 17.2 1.8 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.3" fill="currentColor" />
    </svg>
  );

  if (variant === 'mark') {
    return (
      <span className="wordmark wordmark--mark">
        {mark}
        <span className="sr-only">OptiCare</span>
      </span>
    );
  }

  return (
    <span className="wordmark">
      {mark}
      <span className="wordmark__text" aria-hidden="true">
        OPTICARE
      </span>
      <span className="sr-only">OptiCare</span>
    </span>
  );
}
