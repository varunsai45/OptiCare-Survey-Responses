import { DeviceComposition } from '../components/visuals/DeviceComposition';

interface HeroProps {
  onStart: () => void;
  resuming: boolean;
}

export function Hero({ onStart, resuming }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">
            Design research · B.Tech Human-Centered Design
          </p>

          <h1 className="display hero__title">
            Your eyes work hard
            <br />
            every day.
          </h1>

          <p className="lede hero__lede">
            We use phones, laptops, tablets and other screens throughout the day. But how much
            screen exposure do we really experience — and how often do we give our eyes a proper
            break?
          </p>

          <div className="hero__actions">
            <button type="button" className="btn" onClick={onStart}>
              {resuming ? 'Continue where you left off' : 'Take the 2-minute experience'}
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </button>
            <p className="hero__sub">Your answers will help us understand real screen-use habits.</p>
          </div>

          <p className="note hero__privacy">
            No name, no email, no phone number, no location, no camera. Ten questions, collected
            only for our academic user research.
          </p>
        </div>

        <div className="hero__visual">
          <DeviceComposition />
        </div>
      </div>

      <a className="hero__scroll" href="#problem">
        <span>Read the problem first</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
