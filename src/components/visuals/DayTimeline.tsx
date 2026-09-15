import { Glyph } from '../common/Glyph';
import { useReveal } from '../../hooks/useReveal';
import type { GlyphName } from '../../types';
import './DayTimeline.css';

interface Moment {
  time: string;
  label: string;
  device: string;
  icon: GlyphName;
  detail: string;
}

/**
 * A recognisable day, not a claimed one. The copy stays descriptive
 * ("a day might look like this") because nothing here is measured data.
 */
const moments: Moment[] = [
  {
    time: '07:20',
    label: 'Morning',
    device: 'Phone',
    icon: 'phone',
    detail: 'Messages, feed, the first scroll of the day.',
  },
  {
    time: '09:00',
    label: 'Work / study',
    device: 'Laptop',
    icon: 'laptop',
    detail: 'The long stretch. Documents, tabs, video calls.',
  },
  {
    time: '16:40',
    label: 'Afternoon',
    device: 'Phone',
    icon: 'phone',
    detail: 'A break from the laptop — on another screen.',
  },
  {
    time: '21:15',
    label: 'Evening',
    device: 'Tablet / TV',
    icon: 'tv',
    detail: 'Winding down, still lit.',
  },
];

export function DayTimeline() {
  const ref = useReveal<HTMLOListElement>(0.2);

  return (
    <ol className="timeline reveal" ref={ref}>
      {moments.map((moment, i) => (
        <li className="timeline__item" key={moment.time} style={{ '--i': i } as React.CSSProperties}>
          <div className="timeline__rail" aria-hidden="true">
            <span className="timeline__dot" />
          </div>
          <div className="timeline__body">
            <p className="timeline__time tnum">{moment.time}</p>
            <p className="timeline__label">{moment.label}</p>
            <p className="timeline__device">
              <Glyph name={moment.icon} size={18} />
              <span>{moment.device}</span>
            </p>
            <p className="timeline__detail">{moment.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
