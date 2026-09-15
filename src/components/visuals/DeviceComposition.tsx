import './DeviceComposition.css';

/**
 * The hero composition: a laptop, a phone and a tablet drawn as flat hardware
 * silhouettes on a single 8px grid, with a thin "activity" bar under each one
 * that fills as the composition settles.
 *
 * Deliberately line-drawn rather than rendered in 3D: three light objects that
 * load instantly and stay legible at 360px wide.
 */
export function DeviceComposition() {
  return (
    <div className="devices" aria-hidden="true">
      <svg viewBox="0 0 620 420" className="devices__svg" role="presentation">
        <defs>
          <clipPath id="dc-laptop-screen">
            <rect x="166" y="102" width="288" height="176" rx="5" />
          </clipPath>
          <clipPath id="dc-phone-screen">
            <rect x="72" y="196" width="104" height="188" rx="10" />
          </clipPath>
          <clipPath id="dc-tablet-screen">
            <rect x="452" y="152" width="128" height="170" rx="6" />
          </clipPath>
        </defs>

        {/* Desk line — one horizontal rule that anchors all three objects. */}
        <line className="devices__desk" x1="24" y1="392" x2="596" y2="392" />

        {/* ---------------- Tablet (enters third, sits furthest back) ------- */}
        <g className="devices__item devices__item--tablet">
          <rect
            className="devices__body"
            x="444"
            y="140"
            width="144"
            height="194"
            rx="12"
          />
          <rect className="devices__screen" x="452" y="152" width="128" height="170" rx="6" />
          <g clipPath="url(#dc-tablet-screen)" className="devices__content">
            <rect x="464" y="166" width="72" height="7" rx="3.5" />
            <rect x="464" y="184" width="104" height="5" rx="2.5" />
            <rect x="464" y="196" width="96" height="5" rx="2.5" />
            <rect x="464" y="208" width="104" height="5" rx="2.5" />
            <rect x="464" y="230" width="104" height="56" rx="4" className="devices__block" />
          </g>
          <line className="devices__activity" x1="452" y1="346" x2="580" y2="346" />
          <line
            className="devices__activity-fill devices__activity-fill--tablet"
            x1="452"
            y1="346"
            x2="580"
            y2="346"
          />
        </g>

        {/* ---------------- Laptop (enters second, the centre of gravity) --- */}
        <g className="devices__item devices__item--laptop">
          <rect className="devices__body" x="156" y="92" width="308" height="196" rx="10" />
          <rect className="devices__screen" x="166" y="102" width="288" height="176" rx="5" />
          <g clipPath="url(#dc-laptop-screen)" className="devices__content">
            <rect x="182" y="118" width="120" height="8" rx="4" />
            <rect x="182" y="140" width="256" height="6" rx="3" />
            <rect x="182" y="154" width="232" height="6" rx="3" />
            <rect x="182" y="168" width="248" height="6" rx="3" />
            <rect x="182" y="190" width="118" height="72" rx="4" className="devices__block" />
            <rect x="314" y="190" width="124" height="6" rx="3" />
            <rect x="314" y="204" width="104" height="6" rx="3" />
            <rect x="314" y="218" width="120" height="6" rx="3" />
            <rect x="314" y="232" width="86" height="6" rx="3" />
          </g>
          {/* Base: a shallow trapezoid, the way a laptop actually reads side-on. */}
          <path className="devices__body" d="M138 288h344l22 20H116l22-20Z" />
          <line className="devices__notch" x1="284" y1="297" x2="336" y2="297" />
          <line className="devices__activity" x1="166" y1="330" x2="454" y2="330" />
          <line
            className="devices__activity-fill devices__activity-fill--laptop"
            x1="166"
            y1="330"
            x2="454"
            y2="330"
          />
        </g>

        {/* ---------------- Phone (enters first, nearest the viewer) -------- */}
        <g className="devices__item devices__item--phone">
          <rect className="devices__body" x="62" y="186" width="124" height="208" rx="16" />
          <rect className="devices__screen" x="72" y="196" width="104" height="188" rx="10" />
          <g clipPath="url(#dc-phone-screen)" className="devices__content">
            <rect x="84" y="210" width="44" height="6" rx="3" />
            <rect x="84" y="228" width="80" height="34" rx="4" className="devices__block" />
            <rect x="84" y="272" width="80" height="5" rx="2.5" />
            <rect x="84" y="284" width="64" height="5" rx="2.5" />
            <rect x="84" y="302" width="80" height="34" rx="4" className="devices__block" />
            <rect x="84" y="346" width="72" height="5" rx="2.5" />
          </g>
          <circle className="devices__lens" cx="124" cy="203" r="2.4" />
        </g>
      </svg>
    </div>
  );
}
