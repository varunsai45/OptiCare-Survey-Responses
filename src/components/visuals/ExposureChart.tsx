import { useState } from 'react';
import { Glyph } from '../common/Glyph';
import { useInView } from '../../hooks/useReveal';
import { formatMinutes, useCountUp } from '../../hooks/useCountUp';
import type { GlyphName } from '../../types';
import './ExposureChart.css';

interface Row {
  device: string;
  icon: GlyphName;
  minutes: number;
}

/**
 * Illustrative figures. They are not collected data, they are not an average,
 * and the "Example only" marker sits next to them everywhere this is used.
 */
const rows: Row[] = [
  { device: 'Phone', icon: 'phone', minutes: 200 },
  { device: 'Laptop', icon: 'laptop', minutes: 310 },
  { device: 'Tablet', icon: 'tablet', minutes: 90 },
];

const total = rows.reduce((sum, row) => sum + row.minutes, 0);

function Bar({ row, active, index }: { row: Row; active: boolean; index: number }) {
  const minutes = useCountUp(row.minutes, active, 1200 + index * 160);
  const width = active ? (row.minutes / total) * 100 : 0;

  return (
    <li className="exposure__row">
      <span className="exposure__device">
        <Glyph name={row.icon} size={18} />
        <span>{row.device}</span>
      </span>
      <span className="exposure__track" aria-hidden="true">
        <span
          className="exposure__bar"
          style={{ width: `${width}%`, transitionDelay: `${index * 140}ms` }}
        />
      </span>
      <span className="exposure__value tnum">{formatMinutes(minutes)}</span>
    </li>
  );
}

interface ExposureChartProps {
  /** Renders on the dark stage sections. */
  tone?: 'light' | 'dark';
}

export function ExposureChart({ tone = 'light' }: ExposureChartProps) {
  const [active, setActive] = useState(false);
  const ref = useInView<HTMLDivElement>(() => setActive(true), 0.35);
  const totalMinutes = useCountUp(total, active, 1800);

  return (
    <div className={`exposure exposure--${tone}`} ref={ref}>
      <p className="marker">Example only</p>

      <ul className="exposure__rows">
        {rows.map((row, i) => (
          <Bar key={row.device} row={row} active={active} index={i} />
        ))}
      </ul>

      <div className="exposure__total">
        <span className="exposure__total-label">Combined</span>
        <span className="exposure__total-value tnum">{formatMinutes(totalMinutes)}</span>
      </div>

      <p className="exposure__caption">
        Each device counts its own hours. Nothing adds them up for you.
      </p>
    </div>
  );
}
