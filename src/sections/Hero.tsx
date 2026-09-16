import { Illustration } from '../components/common/Illustration';
import { useReveal } from '../hooks/useReveal';

interface HeroProps {
  onStart: () => void;
  resuming: boolean;
}

/**
 * What the visitor is about to walk through. It gives the landing page some
 * weight without a second wall of prose, and it doubles as navigation.
 */
const contents = [
  {
    n: '01',
    href: '#problem',
    title: 'One day. Multiple screens.',
    body: 'Where screen time actually goes.',
  },
  {
    n: '02',
    href: '#why-missed',
    title: 'Why breaks get missed.',
    body: 'Four hunches we want tested.',
  },
  {
    n: '03',
    href: '#concept',
    title: 'The idea we are exploring.',
    body: 'A nudge, and sixty seconds.',
  },
  {
    n: '04',
    href: '#research',
    title: 'Ten questions.',
    body: 'About two minutes of yours.',
  },
];

export function Hero({ onStart, resuming }: HeroProps) {
  const indexRef = useReveal<HTMLOListElement>(0.15);

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
          <Illustration
            name="landing-devices"
            alt="A phone, a laptop and a tablet, their screen light rising towards a single open eye above, with a usage bar filling beneath each device."
            className="ill--hero"
          />
        </div>
      </div>

      <div className="wrap">
        <ol className="hindex reveal" ref={indexRef}>
          {contents.map((item, i) => (
            <li
              className="hindex__item"
              key={item.n}
              style={{ '--reveal-delay': `${i * 60}ms` } as React.CSSProperties}
            >
              <a className="hindex__link" href={item.href}>
                <span className="hindex__n tnum">{item.n}</span>
                <span className="hindex__title">{item.title}</span>
                <span className="hindex__body">{item.body}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
