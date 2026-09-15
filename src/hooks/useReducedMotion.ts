import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the user's motion preference so JS-driven sequences (counters,
 * timers, staged demos) can jump to their end state instead of animating.
 * CSS-driven motion is handled separately in `global.css`.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
