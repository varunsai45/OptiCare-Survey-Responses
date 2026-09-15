import { useEffect, useRef } from 'react';

/**
 * Adds `is-in` once an element scrolls into view, then stops observing it.
 * One observer instance per element keeps this cheap enough for a page of
 * this size, and it degrades to "always visible" without IntersectionObserver.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-in');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * Like `useReveal`, but reports the state instead of toggling a class — for
 * visuals that need to start an animation sequence rather than just fade in.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  onEnter: () => void,
  threshold = 0.4,
) {
  const ref = useRef<T | null>(null);
  const fired = useRef(false);
  const handler = useRef(onEnter);
  handler.current = onEnter;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      handler.current();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true;
            handler.current();
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
