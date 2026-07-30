// Illustrationer för Sökta tjänster: hero-orb och empty state.
// Samma geometriska stil som mina-brev (LetterIcons): mjuka orange gradienter,
// inga clipart-detaljer.

interface IllustrationProps {
  className?: string;
}

/** Hero-orb: en stiliserad väg med milstolpar, resan från ansökan till jobb. */
export function TrackerOrb({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="trackerOrbBg" x1="0" y1="0" x2="80" y2="80">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FFEDD5" />
        </linearGradient>
        <linearGradient id="trackerOrbAccent" x1="12" y1="60" x2="66" y2="20">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#trackerOrbBg)" />
      <circle cx="40" cy="40" r="38" stroke="#FED7AA" strokeWidth="1.5" />
      {/* Vägen: en mjuk kurva genom orben */}
      <path
        d="M14 58 C 26 58, 28 40, 40 40 C 52 40, 54 22, 66 22"
        stroke="url(#trackerOrbAccent)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Milstolpar längs vägen */}
      <circle cx="14" cy="58" r="5" fill="#FB923C" />
      <circle cx="40" cy="40" r="5" fill="#F97316" />
      <circle cx="66" cy="22" r="6.5" fill="#DC2626" />
      {/* Bock i målpunkten */}
      <path
        d="M63 22 l2.2 2.2 L69.5 20"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Empty state: dokument på väg mot en målflagga. */
export function EmptyTrackerIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="trackerEmptyBg" x1="0" y1="0" x2="200" y2="160">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FFEDD5" />
        </linearGradient>
        <linearGradient id="trackerEmptyAccent" x1="30" y1="120" x2="170" y2="40">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="132" rx="76" ry="14" fill="url(#trackerEmptyBg)" />
      {/* Streckad väg */}
      <path
        d="M36 122 C 70 122, 76 84, 104 84 C 130 84, 136 52, 162 46"
        stroke="url(#trackerEmptyAccent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 10"
        fill="none"
      />
      {/* Dokumentkort vid startpunkten */}
      <g>
        <rect x="22" y="92" width="44" height="54" rx="8" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1.5" />
        <rect x="30" y="102" width="28" height="4" rx="2" fill="#FDBA74" />
        <rect x="30" y="112" width="20" height="3.5" rx="1.75" fill="#FFE1C4" />
        <rect x="30" y="120" width="24" height="3.5" rx="1.75" fill="#FFE1C4" />
        <rect x="30" y="128" width="16" height="3.5" rx="1.75" fill="#FFE1C4" />
      </g>
      {/* Mellanliggande milstolpe */}
      <circle cx="104" cy="84" r="7" fill="#FFFFFF" stroke="#FB923C" strokeWidth="2.5" />
      <circle cx="104" cy="84" r="2.5" fill="#F97316" />
      {/* Målflagga */}
      <g>
        <line x1="162" y1="46" x2="162" y2="14" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
        <path d="M162 15 L188 22 L162 30 Z" fill="url(#trackerEmptyAccent)" />
        <circle cx="162" cy="46" r="6" fill="#DC2626" />
        <path
          d="M159.2 46 l2 2 L166 43.5"
          stroke="#FFFFFF"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
