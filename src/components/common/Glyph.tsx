import type { GlyphName } from '../../types';

/**
 * A small hand-drawn line-icon set. Kept in one file (rather than pulled from
 * an icon library) so every glyph shares the same 24px grid, 1.5px stroke and
 * squared-off geometry — consistency is what keeps them from looking like
 * clip art.
 */
const paths: Record<GlyphName, JSX.Element> = {
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="1.6" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3 12.5h18" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7.5 8h9a4.5 4.5 0 0 1 4.34 5.67l-.7 2.6A2.6 2.6 0 0 1 15.9 17l-1.2-1.6h-5.4L8.1 17a2.6 2.6 0 0 1-4.24-.73l-.7-2.6A4.5 4.5 0 0 1 7.5 8Z" />
      <path d="M7.2 11v2.4M6 12.2h2.4M15.6 11.6h.01M17.4 13.2h.01" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M10.4 9.3 15 12l-4.6 2.7V9.3Z" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V6M17 20v-9" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.6 8 4.2-8 4.2-8-4.2 8-4.2Z" />
      <path d="m4.4 12.6 7.6 4 7.6-4M4.4 16.6l7.6 4 7.6-4" />
    </>
  ),
  dots: (
    <>
      <circle cx="6" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="18" cy="12" r="1.2" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.8" width="10" height="18.4" rx="2.2" />
      <path d="M10.6 18.2h2.8" />
    </>
  ),
  laptop: (
    <>
      <rect x="4.5" y="5" width="15" height="10" rx="1.4" />
      <path d="M2.5 18.4h19" />
    </>
  ),
  desktop: (
    <>
      <rect x="3" y="4.5" width="18" height="11.5" rx="1.4" />
      <path d="M9 19.5h6M12 16v3.5" />
    </>
  ),
  tablet: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M10.8 17.8h2.4" />
    </>
  ),
  tv: (
    <>
      <rect x="2.8" y="5" width="18.4" height="12" rx="1.6" />
      <path d="M8.5 20.5h7M12 17v3.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12S6.8 6 12 6s9.2 6 9.2 6-4 6-9.2 6-9.2-6-9.2-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  droplet: <path d="M12 3.6s5.4 5.6 5.4 9.2a5.4 5.4 0 0 1-10.8 0c0-3.6 5.4-9.2 5.4-9.2Z" />,
  blur: (
    <>
      <path d="M2.8 12S6.8 6 12 6s9.2 6 9.2 6-4 6-9.2 6-9.2-6-9.2-6Z" strokeDasharray="3 2.4" />
      <circle cx="12" cy="12" r="2.6" strokeDasharray="2.2 2" />
    </>
  ),
  head: (
    <>
      <path d="M8 20.5v-2.2a6 6 0 1 1 8-5.6v1.9h1.6a.9.9 0 0 1 .7 1.45l-1.1 1.4v2.15a.9.9 0 0 1-.9.9H8Z" />
    </>
  ),
  spark: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.4v2.4M12 18.2v2.4M3.4 12h2.4M18.2 12h2.4M6 6l1.7 1.7M16.3 16.3 18 18M18 6l-1.7 1.7M7.7 16.3 6 18" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6" />
    </>
  ),
  check: <path d="m5.5 12.6 4.2 4.2 8.8-9.6" />,
  bell: (
    <>
      <path d="M6.6 17.2V11a5.4 5.4 0 0 1 10.8 0v6.2H6.6ZM5 17.2h14" />
      <path d="M10.2 20h3.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.6" y="5" width="16.8" height="15.4" rx="1.6" />
      <path d="M3.6 9.8h16.8M8.4 3.2v3.4M15.6 3.2v3.4" />
    </>
  ),
  pause: <path d="M9.4 6v12M14.6 6v12" />,
};

interface GlyphProps {
  name: GlyphName;
  size?: number;
  className?: string;
}

export function Glyph({ name, size = 22, className }: GlyphProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
