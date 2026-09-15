import { Wordmark } from '../common/Wordmark';

interface SuccessScreenProps {
  onRestart: () => void;
  onClose: () => void;
}

/**
 * No counters, no confetti, no claim that anything has been changed by one
 * response. A quiet acknowledgement and a way back out.
 */
export function SuccessScreen({ onRestart, onClose }: SuccessScreenProps) {
  return (
    <div className="success">
      <div className="success__mark" aria-hidden="true">
        <svg viewBox="0 0 96 96" width="96" height="96" fill="none">
          <circle className="success__ring" cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="1.2" />
          <path
            className="success__tick"
            d="M31 49.5 43 61.5 66 35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="success__title">Thank you.</h2>
      <p className="success__copy">Your experience has been added to our research.</p>
      <p className="success__copy success__copy--muted">
        Every response helps us understand real users better.
      </p>

      <div className="success__sign">
        <Wordmark />
        <p className="success__tagline">AI-Powered Eye Wellness. Anywhere. Anytime.</p>
      </div>

      <div className="success__actions">
        <button type="button" className="btn btn--light btn--sm" onClick={onClose}>
          Back to the site
        </button>
        <button type="button" className="success__restart" onClick={onRestart}>
          Someone else wants to answer — start again
        </button>
      </div>
    </div>
  );
}
