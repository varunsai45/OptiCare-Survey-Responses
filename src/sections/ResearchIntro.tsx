import { useReveal } from '../hooks/useReveal';

interface ResearchIntroProps {
  onStart: () => void;
  resuming: boolean;
}

const facts = [
  { label: 'Questions', value: '10' },
  { label: 'Roughly', value: '2 min' },
  { label: 'Personal details asked', value: 'None' },
];

export function ResearchIntro({ onStart, resuming }: ResearchIntroProps) {
  const ref = useReveal<HTMLDivElement>(0.2);

  return (
    <section className="section" id="research">
      <div className="wrap research reveal" ref={ref}>
        <p className="eyebrow">Where you come in</p>
        <h2 className="h2 research__title">
          But before building further, we want to hear from real people.
        </h2>
        <p className="lede research__lede">
          We&rsquo;re exploring how people actually use screens, how they feel after long sessions,
          how they take breaks, and what kind of support would genuinely be useful. If the answers
          say the idea is wrong, that is a result worth having.
        </p>

        <dl className="research__facts">
          {facts.map((fact) => (
            <div className="research__fact" key={fact.label}>
              <dt>{fact.label}</dt>
              <dd className="tnum">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <button type="button" className="btn research__cta" onClick={onStart}>
          {resuming ? 'Continue where you left off' : 'Start the research'}
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>

        <p className="note research__privacy">
          We don&rsquo;t ask for your name, phone number, email, location, camera access, or other
          unnecessary personal information. Your answers are collected only for our academic user
          research, and your progress is saved on your own device so you can finish later.
        </p>
      </div>
    </section>
  );
}
