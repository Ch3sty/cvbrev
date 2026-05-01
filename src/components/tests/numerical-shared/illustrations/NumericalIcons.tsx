/**
 * Custom SVGs för numeriskt-test (V1 + V2 delar dessa).
 *
 * Stil: orange/röd-DNA (#F97316 → #DC2626 → #BE185D), inga emojis,
 * bara SVG. Matchar VerbalIcons + MatrixIcons.
 */

interface IconProps {
  className?: string;
}

// =============================================================
// HERO ILLUSTRATION — bakgrund för testets hero (kalkylator + grafer)
// =============================================================
export function NumericalHeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="380"
      height="380"
      viewBox="0 0 380 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="num-hero-bar1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
        <linearGradient id="num-hero-bar2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#DC2626" />
          <stop offset="1" stopColor="#FCA5A5" />
        </linearGradient>
        <linearGradient id="num-hero-bar3" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#BE185D" />
          <stop offset="1" stopColor="#F9A8D4" />
        </linearGradient>
      </defs>

      {/* Stor kalkylator-form i bakgrunden, lutad */}
      <g transform="translate(220 60) rotate(8 70 110)" opacity="0.85">
        <rect x="0" y="0" width="140" height="220" rx="14" fill="white" opacity="0.95" />
        <rect x="0" y="0" width="140" height="6" rx="3" fill="#F97316" />
        {/* Display */}
        <rect x="12" y="20" width="116" height="40" rx="6" fill="#1E293B" />
        <rect x="80" y="32" width="40" height="6" rx="2" fill="#FB923C" opacity="0.8" />
        <rect x="60" y="44" width="60" height="8" rx="2" fill="white" opacity="0.9" />
        {/* Knappar - 4x4 grid */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 4 }).map((_, col) => (
            <rect
              key={`${row}-${col}`}
              x={12 + col * 30}
              y={70 + row * 38}
              width="24"
              height="32"
              rx="4"
              fill={col === 3 ? '#FB923C' : '#F1F5F9'}
              stroke="#CBD5E1"
              strokeWidth="0.5"
            />
          ))
        )}
      </g>

      {/* Stapeldiagram-illustration framför (lutad andra hållet) */}
      <g transform="translate(40 100) rotate(-5 90 100)">
        {/* Skugga */}
        <rect x="6" y="14" width="180" height="180" rx="14" fill="rgba(0,0,0,0.18)" />
        {/* Bakgrund */}
        <rect x="0" y="0" width="180" height="180" rx="14" fill="white" />
        {/* Topp-strip */}
        <rect x="0" y="0" width="180" height="6" rx="3" fill="url(#num-hero-bar2)" />
        {/* Y-axis */}
        <line x1="20" y1="20" x2="20" y2="160" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="20" y1="160" x2="170" y2="160" stroke="#CBD5E1" strokeWidth="1.5" />
        {/* Stationsmärken på Y */}
        {[40, 80, 120].map((y) => (
          <line key={y} x1="18" y1={y} x2="170" y2={y} stroke="#FED7AA" strokeWidth="0.75" strokeDasharray="2 3" />
        ))}
        {/* Staplar */}
        <rect x="36" y="100" width="22" height="60" rx="3" fill="url(#num-hero-bar1)" />
        <rect x="68" y="60" width="22" height="100" rx="3" fill="url(#num-hero-bar2)" />
        <rect x="100" y="80" width="22" height="80" rx="3" fill="url(#num-hero-bar3)" />
        <rect x="132" y="40" width="22" height="120" rx="3" fill="url(#num-hero-bar1)" />
      </g>

      {/* Cirkeldiagram-prick längst ner-höger */}
      <g transform="translate(240 240)">
        <circle cx="50" cy="50" r="50" fill="white" opacity="0.95" />
        {/* 60% orange */}
        <path
          d="M 50 50 L 50 0 A 50 50 0 0 1 95 75 Z"
          fill="#F97316"
        />
        {/* 25% röd */}
        <path
          d="M 50 50 L 95 75 A 50 50 0 0 1 30 92 Z"
          fill="#DC2626"
        />
        {/* 15% rosa */}
        <path
          d="M 50 50 L 30 92 A 50 50 0 0 1 50 0 Z"
          fill="#BE185D"
        />
        <circle cx="50" cy="50" r="20" fill="white" />
      </g>

      {/* Floating siffror runt */}
      <text x="50" y="50" fontSize="28" fontWeight="900" fill="white" opacity="0.6">42</text>
      <text x="320" y="320" fontSize="22" fontWeight="900" fill="white" opacity="0.6">85%</text>
      <text x="180" y="40" fontSize="20" fontWeight="900" fill="white" opacity="0.55">Σ</text>
    </svg>
  );
}

// =============================================================
// TYP-IKONER (för feature-pills och results-breakdown)
// =============================================================

const SW = 2;

export function TableTopicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth={SW} />
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth={SW} />
      <line x1="3" y1="14.5" x2="21" y2="14.5" stroke="currentColor" strokeWidth={SW * 0.85} opacity="0.7" />
      <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth={SW * 0.85} opacity="0.7" />
      <line x1="15" y1="4" x2="15" y2="20" stroke="currentColor" strokeWidth={SW * 0.85} opacity="0.7" />
    </svg>
  );
}

export function ChartTopicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line x1="3" y1="20" x2="21" y2="20" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="3" y1="20" x2="3" y2="4" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <rect x="6" y="13" width="3" height="7" fill="currentColor" />
      <rect x="11" y="9" width="3" height="11" fill="currentColor" />
      <rect x="16" y="6" width="3" height="14" fill="currentColor" />
    </svg>
  );
}

export function SeriesTopicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="11" cy="12" r="2.4" fill="currentColor" />
      <circle cx="17" cy="12" r="2.8" fill="currentColor" />
      <line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <circle cx="22.5" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function WordProblemTopicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth={SW} />
      <line x1="6" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="6" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="6" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="6" y1="16" x2="11" y2="16" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <circle cx="19" cy="17" r="3.5" fill="currentColor" />
      <text x="19" y="20" fontSize="6" fontWeight="900" fill="white" textAnchor="middle">?</text>
    </svg>
  );
}

export function ConversionTopicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 7 L18 7 L15 4 M18 7 L15 10" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 17 L6 17 L9 14 M6 17 L9 20" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// =============================================================
// EMPTY-STATE illustration (när inga sessions finns)
// =============================================================
export function NumericalEmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="num-empty-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
      </defs>
      {/* Bakgrunds-cirkel */}
      <circle cx="60" cy="60" r="54" fill="#FFF7ED" />
      <circle cx="60" cy="60" r="54" stroke="#FED7AA" strokeWidth="1.5" strokeDasharray="3 4" />
      {/* Stapeldiagram */}
      <line x1="32" y1="84" x2="88" y2="84" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="84" x2="32" y2="40" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="40" y="62" width="10" height="22" rx="2" fill="url(#num-empty-bar)" />
      <rect x="55" y="50" width="10" height="34" rx="2" fill="url(#num-empty-bar)" />
      <rect x="70" y="58" width="10" height="26" rx="2" fill="url(#num-empty-bar)" />
      {/* Question mark */}
      <circle cx="86" cy="36" r="14" fill="white" stroke="#FB923C" strokeWidth="2" />
      <text x="86" y="42" fontSize="18" fontWeight="900" fill="#DC2626" textAnchor="middle">?</text>
    </svg>
  );
}

// =============================================================
// THUMBNAIL för tester-hubben (mini-grafstil)
// =============================================================
interface ThumbnailProps {
  variant: 'v1' | 'v2';
  className?: string;
}

export function NumericalCardThumbnail({ variant, className }: ThumbnailProps) {
  // V1 = enklare mönster, V2 = mer avancerat
  const seed = variant === 'v1' ? 0 : 1;

  return (
    <svg
      className={className}
      width="140"
      height="100"
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`thumb-num-bar-${variant}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
        <linearGradient id={`thumb-num-bar2-${variant}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#DC2626" />
          <stop offset="1" stopColor="#FCA5A5" />
        </linearGradient>
      </defs>
      {/* Bakgrund */}
      <rect x="0" y="0" width="140" height="100" rx="8" fill="white" stroke="#FED7AA" strokeWidth="1" />
      {/* Y-axis */}
      <line x1="14" y1="14" x2="14" y2="84" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="14" y1="84" x2="128" y2="84" stroke="#CBD5E1" strokeWidth="1" />
      {/* Grid lines */}
      {[28, 50, 70].map((y) => (
        <line key={y} x1="14" y1={y} x2="128" y2={y} stroke="#FED7AA" strokeWidth="0.5" strokeDasharray="2 3" />
      ))}
      {/* Bars */}
      {seed === 0 ? (
        <>
          <rect x="22" y="56" width="14" height="28" rx="2" fill={`url(#thumb-num-bar-${variant})`} />
          <rect x="42" y="34" width="14" height="50" rx="2" fill={`url(#thumb-num-bar2-${variant})`} />
          <rect x="62" y="46" width="14" height="38" rx="2" fill={`url(#thumb-num-bar-${variant})`} />
          <rect x="82" y="22" width="14" height="62" rx="2" fill={`url(#thumb-num-bar2-${variant})`} />
          <rect x="102" y="40" width="14" height="44" rx="2" fill={`url(#thumb-num-bar-${variant})`} />
        </>
      ) : (
        // V2: linjediagram
        <>
          <path
            d="M 22 70 L 42 56 L 62 60 L 82 38 L 102 28 L 122 18"
            stroke="#DC2626"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 22 70 L 42 56 L 62 60 L 82 38 L 102 28 L 122 18 L 122 84 L 22 84 Z"
            fill="url(#thumb-num-bar-v2)"
            opacity="0.3"
          />
          {[
            { x: 22, y: 70 },
            { x: 42, y: 56 },
            { x: 62, y: 60 },
            { x: 82, y: 38 },
            { x: 102, y: 28 },
            { x: 122, y: 18 },
          ].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill="#DC2626" />
          ))}
        </>
      )}
    </svg>
  );
}
