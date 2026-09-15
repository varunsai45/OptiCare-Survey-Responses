import { useReveal } from '../hooks/useReveal';
import { SessionDemo } from '../components/visuals/SessionDemo';
import { ActivityShowcase } from '../components/visuals/ActivityShowcase';

const pillars = [
  {
    title: 'Screen exposure awareness',
    body: 'Bring the hours from different devices into one place, instead of four separate counts.',
  },
  {
    title: 'Break reminders',
    body: 'Notice a long unbroken session and offer a pause — once, quietly, easy to decline.',
  },
  {
    title: 'Short eye-rest activities',
    body: 'Give the break a shape, so it is something to do rather than something to decide.',
  },
  {
    title: 'Personal wellness suggestions',
    body: 'Adjust the suggestion to how someone actually uses their devices.',
  },
  {
    title: 'Basic eye-wellness self-checks',
    body: 'Simple self-reported checks. Not a diagnosis, and not a substitute for an eye test.',
  },
  {
    title: 'Eye-health information',
    body: 'Plain explanations of what screens ask of your eyes, without alarm.',
  },
];

export function Concept() {
  const headRef = useReveal<HTMLDivElement>();
  const demoRef = useReveal<HTMLDivElement>(0.1);
  const actRef = useReveal<HTMLDivElement>(0.1);

  return (
    <section className="section section--deep on-dark" id="concept">
      <div className="wrap">
        <div className="reveal" ref={headRef}>
          <p className="eyebrow">The idea we are exploring</p>
          <h2 className="h2 section__title">
            A phone-centred eye-wellness
            <br className="br-md" /> experience.
          </h2>
          <p className="lede section__lede">
            OptiCare is a concept, not a finished product. The phone would sit at the centre, since
            it is the device that is always there, and the rest would be about noticing screen
            exposure and making a short break easy to take.
          </p>
          <p className="marker concept__marker">Proposed · none of this is validated yet</p>
        </div>

        <ol className="pillars">
          {pillars.map((pillar, i) => (
            <Pillar key={pillar.title} pillar={pillar} index={i} />
          ))}
        </ol>

        <div className="concept__block reveal" ref={demoRef}>
          <div className="concept__block-copy">
            <p className="eyebrow">The moment we keep coming back to</p>
            <h3 className="h2 section__title">
              A long session, and one small interruption.
            </h3>
            <p className="lede section__lede">
              Say a screen session has run for about two and a half hours. OptiCare could notice,
              and offer sixty seconds. You start the break, or you carry on — both are fine, and
              nothing happens to your screen either way.
            </p>
            <p className="note concept__note">
              Two and a half hours is a number we chose for the concept. It is not a medical
              threshold, and OptiCare does not treat, diagnose or improve any eye condition.
            </p>
          </div>

          <div className="concept__block-demo">
            <SessionDemo activity="blink" />
          </div>
        </div>

        <div className="concept__activities reveal" ref={actRef}>
          <p className="eyebrow">If you did take the break</p>
          <h3 className="h2 section__title">Make the break easier to take.</h3>
          <p className="lede section__lede">
            Five formats we are considering for a thirty-to-sixty second pause. Try one — the
            question later asks which, if any, you would actually want.
          </p>
          <ActivityShowcase />
        </div>
      </div>
    </section>
  );
}

function Pillar({ pillar, index }: { pillar: (typeof pillars)[number]; index: number }) {
  const ref = useReveal<HTMLLIElement>(0.25);
  return (
    <li
      className="pillars__item reveal"
      ref={ref}
      style={{ '--reveal-delay': `${(index % 3) * 80}ms` } as React.CSSProperties}
    >
      <h3 className="pillars__title">{pillar.title}</h3>
      <p className="pillars__body">{pillar.body}</p>
    </li>
  );
}
