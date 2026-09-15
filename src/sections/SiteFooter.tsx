import { Wordmark } from '../components/common/Wordmark';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div>
          <Wordmark />
          <p className="footer__tagline">AI-Powered Eye Wellness. Anywhere. Anytime.</p>
        </div>

        <p className="footer__note">
          A student research site for a B.Tech Human-Centered Design unit. OptiCare is an early
          concept — it does not diagnose, treat or improve any eye condition, and nothing on this
          page is medical advice. For eye symptoms that persist, see a qualified optometrist.
        </p>
      </div>
    </footer>
  );
}
