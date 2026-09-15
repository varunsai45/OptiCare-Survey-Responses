import { DayTimeline } from '../components/visuals/DayTimeline';
import { ExposureChart } from '../components/visuals/ExposureChart';
import { useReveal } from '../hooks/useReveal';

export function Problem() {
  const headRef = useReveal<HTMLDivElement>();
  const pullRef = useReveal<HTMLDivElement>();

  return (
    <>
      <section className="section" id="problem">
        <div className="wrap">
          <div className="reveal" ref={headRef}>
            <p className="eyebrow">The problem we are researching</p>
            <h2 className="h2 section__title">One day. Multiple screens.</h2>
            <p className="lede section__lede">
              Screen time is rarely one long block on one device. It is scattered across a morning,
              a working day and an evening — which makes it hard to notice how much of it there
              actually was.
            </p>
          </div>

          <DayTimeline />

          <div className="pull reveal" ref={pullRef}>
            <p className="pull__text">
              Screen exposure doesn&rsquo;t always happen on one device.
            </p>
            <p className="pull__sub">
              Your phone may show one number. Your day may tell a different story. That gap is what
              we want to understand — we are not claiming it is true for everyone.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--paper2" id="exposure">
        <div className="wrap exposure-layout">
          <div>
            <p className="eyebrow">If the hours were added up</p>
            <h2 className="h2 section__title">What would the total look like?</h2>
            <p className="lede section__lede">
              Every device keeps its own count. Nothing puts them side by side. Here is a sketch of
              what a combined view could show — the figures below are invented for illustration, not
              measured from anyone.
            </p>
          </div>

          <div className="exposure-layout__chart">
            <ExposureChart />
          </div>
        </div>
      </section>
    </>
  );
}
