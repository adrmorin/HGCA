// Decorative animated background: line-art silhouettes of the HCGA fleet
// (dry van, reefer, flatbed, box truck, cargo van, U-Box carrier) driving
// across the viewport in different directions. Purely visual: fixed behind
// the content, very low contrast, no pointer events and hidden from AT.
// Drawing space: 400 x 104, trucks face right, ground at y = 100.

const Wheel = ({ cx, cy = 89, r = 11 }) => (
  <g className="truck-bg__wheel" style={{ transformOrigin: `${cx}px ${cy}px` }}>
    <circle className="tb-tire" cx={cx} cy={cy} r={r} />
    <circle className="tb-body" cx={cx} cy={cy} r={r * 0.5} />
    <line x1={cx - r * 0.5} y1={cy} x2={cx + r * 0.5} y2={cy} />
    <line x1={cx} y1={cy - r * 0.5} x2={cx} y2={cy + r * 0.5} />
  </g>
);

// Conventional long-nose tractor with sleeper (x 268–394)
const Tractor = () => (
  <>
    {/* exhaust stack */}
    <rect className="tb-body" x="309" y="8" width="4" height="50" rx="1" />
    <path className="tb-body" d="M268 84 V30 Q268 20 278 20 H330 Q338 20 341 27 L351 50 L384 53 Q393 54 393 63 V80 Q393 84 389 84 Z" />
    <path className="tb-glass" d="M318 28 H333 L343 48 H318 Z" />
    <line x1="314" y1="26" x2="314" y2="80" />
    <line x1="274" y1="34" x2="304" y2="34" />
    {/* hood line, grille, headlight, bumper */}
    <line x1="351" y1="50" x2="351" y2="66" />
    <line x1="389" y1="57" x2="389" y2="74" />
    <rect className="tb-glass" x="382" y="60" width="6" height="4" rx="1" />
    <rect className="tb-dark" x="376" y="80" width="20" height="5" rx="1.5" />
    {/* mirror */}
    <path d="M344 46 L348 36 H352 V44" />
    {/* fuel tank, step and fender */}
    <rect className="tb-body" x="318" y="70" width="28" height="12" rx="6" />
    <path className="tb-body" d="M352 84 A15 15 0 0 1 380 84" />
    <rect className="tb-dark" x="268" y="80" width="46" height="5" />
    <Wheel cx={284} />
    <Wheel cx={306} />
    <Wheel cx={366} />
  </>
);

// 53ft trailer running gear: tandem axle, chassis, mud flap, landing gear
const TrailerGear = ({ floor = 78 }) => (
  <>
    <rect className="tb-dark" x="16" y={floor} width="62" height="6" />
    <path d={`M80 ${floor} V96 H84`} />
    <path d={`M214 ${floor} V94 M209 96 H219`} />
    <Wheel cx={32} />
    <Wheel cx={58} />
  </>
);

const VanTrailer = ({ ribs }) => (
  <>
    <rect className="tb-body" x="2" y="12" width="262" height="66" rx="2" />
    <line x1="2" y1="18" x2="264" y2="18" />
    {ribs && Array.from({ length: 10 }, (_, i) => (
      <line key={i} x1={26 + i * 24} y1="18" x2={26 + i * 24} y2="78" />
    ))}
    {/* rear doors, lock rods and tail light */}
    <line x1="10" y1="18" x2="10" y2="78" />
    <line x1="6" y1="26" x2="6" y2="70" />
    <rect className="tb-glass" x="2" y="70" width="5" height="4" />
    <line x1="264" y1="72" x2="276" y2="72" />
  </>
);

const TRUCKS = {
  dryVan: (
    <>
      <VanTrailer ribs />
      <TrailerGear />
      <Tractor />
    </>
  ),
  reefer: (
    <>
      <VanTrailer />
      {/* refrigeration unit */}
      <rect className="tb-body" x="256" y="22" width="12" height="32" rx="2" />
      <line x1="259" y1="28" x2="265" y2="28" />
      <line x1="259" y1="33" x2="265" y2="33" />
      <line x1="259" y1="38" x2="265" y2="38" />
      {/* frost mark */}
      <g transform="translate(132 45)">
        <line x1="-12" y1="0" x2="12" y2="0" />
        <line x1="-6" y1="-10.4" x2="6" y2="10.4" />
        <line x1="-6" y1="10.4" x2="6" y2="-10.4" />
      </g>
      <TrailerGear />
      <Tractor />
    </>
  ),
  flatbed: (
    <>
      <rect className="tb-dark" x="2" y="70" width="264" height="8" />
      {/* headache rack */}
      <rect className="tb-body" x="256" y="38" width="8" height="32" />
      <line x1="260" y1="38" x2="260" y2="70" />
      {/* steel coil, lumber stack, crate */}
      <circle className="tb-body" cx="40" cy="52" r="18" />
      <circle cx="40" cy="52" r="7" />
      <rect className="tb-body" x="70" y="42" width="100" height="28" />
      <line x1="70" y1="51" x2="170" y2="51" />
      <line x1="70" y1="60" x2="170" y2="60" />
      <rect className="tb-body" x="180" y="36" width="70" height="34" />
      <path d="M180 36 L250 70 M250 36 L180 70" />
      {/* straps */}
      <line x1="100" y1="42" x2="100" y2="78" />
      <line x1="140" y1="42" x2="140" y2="78" />
      <line x1="215" y1="36" x2="215" y2="78" />
      <TrailerGear />
      <Tractor />
    </>
  ),
  uBox: (
    <>
      <rect className="tb-dark" x="2" y="70" width="264" height="8" />
      {[6, 92, 178].map((x) => (
        <g key={x}>
          <rect className="tb-body" x={x} y="16" width="80" height="54" rx="4" />
          <line x1={x} y1="24" x2={x + 80} y2="24" />
          <rect x={x + 24} y="30" width="32" height="34" rx="1" />
          <line x1={x + 40} y1="30" x2={x + 40} y2="64" />
        </g>
      ))}
      <TrailerGear />
      <Tractor />
    </>
  ),
  boxTruck: (
    <>
      {/* 26ft box with roll-up door and lift gate */}
      <rect className="tb-body" x="60" y="14" width="222" height="66" rx="2" />
      <line x1="60" y1="20" x2="282" y2="20" />
      <line x1="68" y1="20" x2="68" y2="80" />
      <path d="M60 34 H68 M60 48 H68 M60 62 H68" />
      <rect className="tb-dark" x="54" y="78" width="10" height="6" />
      <rect className="tb-dark" x="90" y="80" width="200" height="5" />
      {/* medium-duty conventional cab */}
      <path className="tb-body" d="M286 84 V34 Q286 26 294 26 H328 Q334 26 337 32 L347 54 L370 57 Q378 58 378 66 V80 Q378 84 374 84 Z" />
      <path className="tb-glass" d="M300 33 H330 L339 52 H300 Z" />
      <line x1="294" y1="30" x2="294" y2="80" />
      <path d="M340 50 L344 42 H348 V48" />
      <rect className="tb-glass" x="368" y="62" width="6" height="4" rx="1" />
      <rect className="tb-dark" x="362" y="80" width="20" height="5" rx="1.5" />
      <path className="tb-body" d="M338 84 A15 15 0 0 1 366 84" />
      <rect className="tb-body" x="300" y="72" width="24" height="10" rx="5" />
      <Wheel cx={118} />
      <Wheel cx={140} />
      <Wheel cx={352} />
    </>
  ),
  cargoVan: (
    <>
      {/* high-roof cargo van */}
      <path className="tb-body" d="M150 86 V30 Q150 18 162 18 H320 Q332 18 340 30 L354 54 Q378 58 384 68 V82 Q384 86 380 86 Z" />
      <path className="tb-glass" d="M324 26 Q330 26 334 32 L348 54 H324 Z" />
      <line x1="318" y1="24" x2="318" y2="84" />
      <line x1="262" y1="24" x2="262" y2="84" />
      <line x1="200" y1="28" x2="318" y2="28" />
      <line x1="158" y1="24" x2="158" y2="84" />
      <rect className="tb-glass" x="150" y="40" width="4" height="12" />
      <rect className="tb-glass" x="374" y="64" width="7" height="4" rx="1" />
      <rect className="tb-dark" x="366" y="80" width="20" height="5" rx="1.5" />
      <path d="M346 50 L350 42 H354 V48" />
      <path className="tb-body" d="M176 86 A16 16 0 0 1 208 86" />
      <path className="tb-body" d="M324 86 A16 16 0 0 1 356 86" />
      <Wheel cx={192} />
      <Wheel cx={340} />
    </>
  ),
};

// top: lane position (% of viewport height), angle: lane tilt in degrees,
// dir: 1 = left→right, -1 = right→left. Negative delays spread trucks out on load.
const LANES = [
  { type: 'dryVan', top: 12, angle: 0, dir: 1, duration: 38, delay: -4, scale: 1 },
  { type: 'cargoVan', top: 24, angle: -8, dir: -1, duration: 30, delay: -18, scale: 0.7 },
  { type: 'reefer', top: 38, angle: 0, dir: -1, duration: 44, delay: -10, scale: 1.05 },
  { type: 'flatbed', top: 52, angle: 6, dir: 1, duration: 46, delay: -30, scale: 0.95 },
  { type: 'boxTruck', top: 66, angle: 0, dir: 1, duration: 34, delay: -8, scale: 0.85, desktopOnly: true },
  { type: 'uBox', top: 78, angle: -5, dir: -1, duration: 50, delay: -22, scale: 1 },
  { type: 'dryVan', top: 90, angle: 0, dir: 1, duration: 42, delay: -36, scale: 0.85, desktopOnly: true },
  { type: 'reefer', top: 45, angle: 28, dir: -1, duration: 56, delay: -44, scale: 0.75, desktopOnly: true },
];

// variant="dark" paints its own always-dark ground (driver FleetOS dashboard)
export default function TruckBackground({ variant }) {
  return (
    <div className={`truck-bg${variant === 'dark' ? ' truck-bg--dark' : ''}`} aria-hidden="true">
      {LANES.map((lane, i) => (
        <div
          key={i}
          className={`truck-bg__lane${lane.desktopOnly ? ' truck-bg__lane--desktop' : ''}`}
          style={{ top: `${lane.top}%`, transform: `translate(-50%, -50%) rotate(${lane.angle}deg)` }}
        >
          <span className="truck-bg__road" />
          <div
            className={`truck-bg__truck${lane.dir < 0 ? ' truck-bg__truck--reverse' : ''}`}
            style={{ animationDuration: `${lane.duration}s`, animationDelay: `${lane.delay}s`, '--truck-scale': lane.scale }}
          >
            <svg viewBox="0 0 400 104" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {TRUCKS[lane.type]}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
