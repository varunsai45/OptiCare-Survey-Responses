import { Illustration } from '../common/Illustration';
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
      <Illustration name="survey-complete" tone="dark" className="ill--complete success__mark" />

      <p className="success__progress tnum">10 / 10 complete</p>

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
