import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts from 0 to `target` once `active` turns true. Reduced-motion users get
 * the final value immediately — the number is the information, the count is
 * only the flourish.
 */
export function useCountUp(target: number, active: boolean, duration = 1400): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * easeOut(t)));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [active, duration, reduced, target]);

  return value;
}

/** 200 → "3h 20m". Minutes are dropped when they are zero. */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
