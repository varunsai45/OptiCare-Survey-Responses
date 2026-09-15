import { useReveal } from '../hooks/useReveal';

/**
 * Observations, framed as things we think we are seeing and want to test —
 * never as findings. There is no data behind this site yet, and the copy is
 * written so that nobody could mistake it for some.
 */
const observations = [
  {
    n: '01',
    title: 'The work is not finished.',
    body: 'A break in the middle of a task costs more than it saves — or at least it feels that way at the time.',
  },
  {
    n: '02',
    title: 'The break is another screen.',
    body: 'Stepping away from the laptop often means picking up the phone. The eyes never actually change what they are doing.',
  },
  {
    n: '03',
    title: 'Nothing marks the time.',
    body: 'Two hours at a screen can feel much the same as twenty minutes. Without something to mark the time, the session just continues.',
  },
  {
    n: '04',
    title: 'The reminder is easy to dismiss.',
    body: '"Take a break" asks you to invent what the break should be. Deciding is effort, so the notification gets swiped away.',
  },
];

export function WhyMissed() {
  const headRef = useReveal<HTMLDivElement>();

  return (
    <section className="section" id="why-missed">
      <div className="wrap">
        <div className="reveal" ref={headRef}>
          <p className="eyebrow">What we think might be happening</p>
          <h2 className="h2 section__title">Why breaks get missed.</h2>
          <p className="lede section__lede">
            Four things we have noticed in conversations so far. They are hunches, not conclusions —
            the survey exists to find out how many of them hold up.
          </p>
        </div>

        <ol className="obs">
          {observations.map((item, i) => (
            <Observation key={item.n} item={item} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Observation({
  item,
  index,
}: {
  item: (typeof observations)[number];
  index: number;
}) {
  const ref = useReveal<HTMLLIElement>(0.25);
  return (
    <li className="obs__item reveal" ref={ref} style={{ '--reveal-delay': `${index * 70}ms` } as React.CSSProperties}>
      <span className="obs__n tnum">{item.n}</span>
      <div>
        <h3 className="h3 obs__title">{item.title}</h3>
        <p className="obs__body">{item.body}</p>
      </div>
    </li>
  );
}
