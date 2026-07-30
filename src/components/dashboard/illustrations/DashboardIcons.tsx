/**
 * Custom SVG-illustrationer for /dashboard.
 * 4 snabb-ikoner (48x48) + 6 aktivitet-ikoner (32x32) + 3 kvot-ikoner (24x24)
 * + 1 streak-eld (96x96) + 3 shell-ikoner (40x40 / 48x48) = 17 ikoner totalt.
 * Stil: orange/rod-DNA med Defs-pattern.
 */

interface IllustrationProps {
  className?: string
}

const Defs = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F97316" />
      <stop offset="1" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id={`${id}-deep`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#DC2626" />
      <stop offset="1" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id={`${id}-soft`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFEDD5" />
      <stop offset="1" stopColor="#FED7AA" />
    </linearGradient>
  </defs>
)

// =============================================================
// STREAK-ELD (96x96) - Stylisk eld i orange/rod
// =============================================================
export function IconEld({ className }: IllustrationProps) {
  const id = 'db-eld'
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-flame`} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor="#BE185D" />
          <stop offset="0.4" stopColor="#DC2626" />
          <stop offset="0.85" stopColor="#F97316" />
          <stop offset="1" stopColor="#FCD34D" />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor="#DC2626" />
          <stop offset="0.6" stopColor="#F97316" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* Yttre flamma */}
      <path
        d="M 48 88 C 26 88 14 72 14 56 C 14 42 26 36 28 26 C 32 32 36 36 38 32 C 42 22 38 14 44 8 C 48 18 56 24 60 36 C 62 32 66 30 68 26 C 70 36 78 42 80 56 C 82 72 70 88 48 88 Z"
        fill={`url(#${id}-flame)`}
      />
      {/* Inre flamma */}
      <path
        d="M 48 80 C 34 80 26 70 26 60 C 26 52 32 48 34 42 C 38 46 40 48 42 46 C 44 38 44 32 48 28 C 52 36 56 42 58 48 C 60 46 62 44 64 42 C 66 50 70 54 70 62 C 70 72 62 80 48 80 Z"
        fill={`url(#${id}-inner)`}
      />
      {/* Innersta gnista */}
      <path
        d="M 48 72 C 42 72 38 66 38 60 C 38 56 42 54 44 50 C 46 54 48 56 50 54 C 52 56 56 60 56 64 C 56 68 54 72 48 72 Z"
        fill="#FCD34D"
        opacity="0.9"
      />
    </svg>
  )
}

// =============================================================
// STREAK-ELD, MILSTOLPE-VARIANT (120x120)
// Samma flamgeometri som IconEld men med glodring och gnistor.
// Anvands vid streak-milstolpar (dag 7/30) och som bakgrundsdekoration
// i det firande streak-kortet.
// =============================================================
export function IconEldMilstolpe({ className }: IllustrationProps) {
  const id = 'db-eld-mil'
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-flame`} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor="#BE185D" />
          <stop offset="0.4" stopColor="#DC2626" />
          <stop offset="0.85" stopColor="#F97316" />
          <stop offset="1" stopColor="#FCD34D" />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor="#DC2626" />
          <stop offset="0.6" stopColor="#F97316" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* Glodring */}
      <circle cx="60" cy="60" r="54" stroke={`url(#${id}-flame)`} strokeWidth="2.5" opacity="0.35" />
      <circle cx="60" cy="60" r="46" stroke="#FCD34D" strokeWidth="1.5" opacity="0.4" strokeDasharray="2 7" strokeLinecap="round" />

      {/* Gnistor runt flamman */}
      <circle cx="22" cy="34" r="2.5" fill="#FBBF24" />
      <circle cx="100" cy="42" r="2" fill="#F97316" />
      <circle cx="94" cy="90" r="2.5" fill="#FB923C" />
      <circle cx="18" cy="78" r="1.8" fill="#FCD34D" />

      {/* Flamman (IconElds geometri, förskjuten till mitten) */}
      <g transform="translate(12, 12)">
        <path
          d="M 48 88 C 26 88 14 72 14 56 C 14 42 26 36 28 26 C 32 32 36 36 38 32 C 42 22 38 14 44 8 C 48 18 56 24 60 36 C 62 32 66 30 68 26 C 70 36 78 42 80 56 C 82 72 70 88 48 88 Z"
          fill={`url(#${id}-flame)`}
        />
        <path
          d="M 48 80 C 34 80 26 70 26 60 C 26 52 32 48 34 42 C 38 46 40 48 42 46 C 44 38 44 32 48 28 C 52 36 56 42 58 48 C 60 46 62 44 64 42 C 66 50 70 54 70 62 C 70 72 62 80 48 80 Z"
          fill={`url(#${id}-inner)`}
        />
        <path
          d="M 48 72 C 42 72 38 66 38 60 C 38 56 42 54 44 50 C 46 54 48 56 50 54 C 52 56 56 60 56 64 C 56 68 54 72 48 72 Z"
          fill="#FCD34D"
          opacity="0.9"
        />
      </g>
    </svg>
  )
}

// =============================================================
// LEVEL-CREST (40x40) - Skoldmärke med ädelsten for level-pillen.
// Ger levelsystemet en egen form istallet for en generisk trendpil.
// =============================================================
export function LevelCrest({ className }: IllustrationProps) {
  const id = 'db-crest'
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <path
        d="M20 3 L34 10 L34 21 Q34 32 20 37 Q6 32 6 21 L6 10 Z"
        fill={`url(#${id}-warm)`}
      />
      <path
        d="M20 6.5 L31 12 L31 21 Q31 29.5 20 33.5 Q9 29.5 9 21 L9 12 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        opacity="0.45"
      />
      {/* Ädelsten */}
      <path d="M20 13 L26 19 L20 27 L14 19 Z" fill="#FCD34D" />
      <path d="M20 13 L26 19 L14 19 Z" fill="#FDE68A" />
    </svg>
  )
}

// =============================================================
// TOMLAGE: SENASTE AKTIVITET (140x140)
// Solfjader av tomma aktivitetskort + pulsprick. Samma ribba som
// EmptyLetterIllustration/EmptyTrackerIllustration.
// =============================================================
export function EmptyActivityIllustration({ className }: IllustrationProps) {
  const id = 'db-empty-act'
  return (
    <svg
      className={className}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <ellipse cx="70" cy="118" rx="52" ry="10" fill={`url(#${id}-soft)`} />

      {/* Bakre kort, roterade som en solfjader */}
      <g transform="rotate(-8 70 70)">
        <rect x="30" y="34" width="80" height="26" rx="9" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1.5" />
        <circle cx="45" cy="47" r="6.5" fill="#FFE1C4" />
        <rect x="57" y="42" width="34" height="4" rx="2" fill="#FFE1C4" />
        <rect x="57" y="50" width="22" height="3.5" rx="1.75" fill="#FFEDD5" />
      </g>
      <g transform="rotate(4 70 82)">
        <rect x="28" y="62" width="84" height="26" rx="9" fill="#FFFFFF" stroke="#FDBA74" strokeWidth="1.5" />
        <circle cx="44" cy="75" r="6.5" fill={`url(#${id}-soft)`} />
        <rect x="56" y="70" width="38" height="4" rx="2" fill="#FDBA74" />
        <rect x="56" y="78" width="26" height="3.5" rx="1.75" fill="#FFE1C4" />
      </g>
      {/* Framsta kortet med pulsprick: har landar nasta handelse */}
      <g>
        <rect x="26" y="92" width="88" height="26" rx="9" fill="#FFFFFF" stroke="#FB923C" strokeWidth="1.75" />
        <circle cx="42" cy="105" r="6.5" fill={`url(#${id}-warm)`} />
        <rect x="54" y="100" width="42" height="4" rx="2" fill="#FDBA74" />
        <rect x="54" y="108" width="30" height="3.5" rx="1.75" fill="#FFE1C4" />
        <circle cx="106" cy="105" r="4" fill={`url(#${id}-warm)`}>
          <animate attributeName="opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  )
}

// =============================================================
// RADAR-CHIP (32x32) - Mikroformat av RecruiterRadar, indigo.
// Indigo anvands uteslutande for rekryterarytan (Bli upptackt,
// meddelanden), aldrig nagon annanstans.
// =============================================================
export function RadarChip({ className }: IllustrationProps) {
  const id = 'db-radar-chip'
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#3730A3" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${id}-bg)`} />
      <circle cx="16" cy="16" r="11" stroke="#FFFFFF" strokeWidth="1" opacity="0.15" />
      <circle cx="16" cy="16" r="7" stroke="#FFFFFF" strokeWidth="1" opacity="0.25" />
      {/* Rekryterarprickar */}
      <circle cx="8" cy="9" r="1.8" fill="#FB923C" />
      <circle cx="25" cy="12" r="1.5" fill="#FB923C" />
      <circle cx="23" cy="24" r="1.6" fill="#FB923C" />
      {/* Profilkapsel i mitten */}
      <rect x="12" y="11.5" width="8" height="10" rx="2.5" fill="#FFFFFF" />
      <circle cx="16" cy="15" r="1.6" fill="#4F46E5" />
      <rect x="13.5" y="18" width="5" height="1.4" rx="0.7" fill="#C7D2FE" />
    </svg>
  )
}

// =============================================================
// AKTIVITETSIKON: SÖKT TJÄNST (32x32)
// =============================================================
export function IconAktAnsokan({ className }: IllustrationProps) {
  const id = 'db-akt-ans'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="1" y="1" width="30" height="30" rx="8" fill={`url(#${id}-soft)`} />
      <path
        d="M10 6.5 A 1.5 1.5 0 0 1 11.5 5 H 20.5 A 1.5 1.5 0 0 1 22 6.5 V 25 L 16 21.5 L 10 25 Z"
        fill="#FFFFFF"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13 12.5 L 15 14.5 L 19 10.5"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// =============================================================
// SNABB-IKONER (48x48) - Snabbatgarder
// =============================================================

export function IconSnabbBrev({ className }: IllustrationProps) {
  const id = 'db-sb'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      <rect x="11" y="9" width="22" height="30" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.6" />
      <rect x="11" y="9" width="22" height="5" fill={`url(#${id}-warm)`} />
      <line x1="14" y1="19" x2="30" y2="19" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="23" x2="28" y2="23" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="27" x2="30" y2="27" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="31" x2="26" y2="31" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Penna */}
      <path d="M 30 32 L 36 38 L 40 36 L 36 30 L 32 28 Z" fill={`url(#${id}-deep)`} />
      <path d="M 36 38 L 40 36 L 38 40 Z" fill="#1E293B" />
    </svg>
  )
}

export function IconSnabbMatch({ className }: IllustrationProps) {
  const id = 'db-sm'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* 3 jobb-kort */}
      <rect x="9" y="11" width="30" height="7" rx="1.5" fill="white" stroke="#FB923C" strokeWidth="1.3" />
      <circle cx="13" cy="14.5" r="1.8" fill={`url(#${id}-warm)`} />
      <line x1="17" y1="13.5" x2="28" y2="13.5" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="17" y1="16" x2="24" y2="16" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />

      <rect x="9" y="20.5" width="30" height="7" rx="1.5" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.6" />
      <circle cx="13" cy="24" r="1.8" fill={`url(#${id}-deep)`} />
      <line x1="17" y1="23" x2="28" y2="23" stroke={`url(#${id}-warm)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="17" y1="25.5" x2="24" y2="25.5" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <circle cx="35" cy="24" r="2.5" fill={`url(#${id}-deep)`} />
      <text x="35" y="25.5" textAnchor="middle" fontSize="3" fontWeight="900" fill="white">94</text>

      <rect x="9" y="30" width="30" height="7" rx="1.5" fill="white" stroke="#FB923C" strokeWidth="1.3" />
      <circle cx="13" cy="33.5" r="1.8" fill={`url(#${id}-warm)`} />
      <line x1="17" y1="32.5" x2="26" y2="32.5" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="17" y1="35" x2="22" y2="35" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function IconSnabbAnalys({ className }: IllustrationProps) {
  const id = 'db-sa'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Procent-cirkel */}
      <circle cx="24" cy="24" r="14" fill="white" stroke="#FED7AA" strokeWidth="2" />
      <circle
        cx="24"
        cy="24"
        r="12"
        fill="none"
        stroke={`url(#${id}-warm)`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="75.4"
        strokeDashoffset="14"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="27" textAnchor="middle" fontSize="9" fontWeight="900" fill="#DC2626">87</text>
      <text x="24" y="33" textAnchor="middle" fontSize="3" fontWeight="700" fill="#DC2626" opacity="0.7">/100</text>
    </svg>
  )
}

export function IconSnabbTester({ className }: IllustrationProps) {
  const id = 'db-st'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* 3x3 grid */}
      <rect x="11" y="11" width="26" height="26" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="11" y1="19.6" x2="37" y2="19.6" stroke="#FED7AA" strokeWidth="1" />
      <line x1="11" y1="28.3" x2="37" y2="28.3" stroke="#FED7AA" strokeWidth="1" />
      <line x1="19.6" y1="11" x2="19.6" y2="37" stroke="#FED7AA" strokeWidth="1" />
      <line x1="28.3" y1="11" x2="28.3" y2="37" stroke="#FED7AA" strokeWidth="1" />
      {/* Pilar i rotation */}
      <path d="M 15.3 14 L 15.3 18 M 14.3 16 L 15.3 14 L 16.3 16" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 22.5 16 L 26.5 16 M 24.5 15 L 26.5 16 L 24.5 17" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 33 14 L 33 18 M 32 16 L 33 18 L 34 16" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 15.3 25 L 15.3 21 M 14.3 23 L 15.3 25 L 16.3 23" stroke={`url(#${id}-deep)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 26.5 24 L 22.5 24 M 24.5 23 L 22.5 24 L 24.5 25" stroke={`url(#${id}-deep)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 33 25 L 33 21" stroke={`url(#${id}-deep)`} strokeWidth="1.4" strokeLinecap="round" />
      {/* Sista cellen: ? */}
      <text x="33" y="35" textAnchor="middle" fontSize="6" fontWeight="900" fill="url(#db-st-deep)">?</text>
    </svg>
  )
}

export function IconSnabbSokta({ className }: IllustrationProps) {
  const id = 'db-sok'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Checklista pa kort */}
      <rect x="10" y="9" width="28" height="30" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      {/* Rad 1: klar */}
      <circle cx="16" cy="16.5" r="2.6" fill={`url(#${id}-warm)`} />
      <path d="M 14.9 16.5 L 15.7 17.3 L 17.2 15.7" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="21" y1="16.5" x2="33" y2="16.5" stroke="#FDBA74" strokeWidth="1.6" strokeLinecap="round" />
      {/* Rad 2: klar */}
      <circle cx="16" cy="24" r="2.6" fill={`url(#${id}-deep)`} />
      <path d="M 14.9 24 L 15.7 24.8 L 17.2 23.2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="21" y1="24" x2="30" y2="24" stroke="#FDBA74" strokeWidth="1.6" strokeLinecap="round" />
      {/* Rad 3: pagaende */}
      <circle cx="16" cy="31.5" r="2.6" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <line x1="21" y1="31.5" x2="27" y2="31.5" stroke="#FED7AA" strokeWidth="1.6" strokeLinecap="round" />
      {/* Trendpil upp i hornet */}
      <path d="M 29 34 L 33 30 L 36 33 L 40 27" stroke={`url(#${id}-deep)`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 37.2 26.8 L 40 27 L 40.2 29.8" stroke={`url(#${id}-deep)`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconSnabbUpptackt({ className }: IllustrationProps) {
  const id = 'db-su'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Radarringar (indigo: rekryterarytans signaturfarg) */}
      <circle cx="24" cy="24" r="16" stroke="#4F46E5" strokeWidth="1" opacity="0.18" />
      <circle cx="24" cy="24" r="10.5" stroke="#4F46E5" strokeWidth="1" opacity="0.28" />
      {/* Rekryterarprickar som dras mot profilen */}
      <circle cx="11" cy="13" r="2.2" fill={`url(#${id}-warm)`} />
      <circle cx="38" cy="17" r="1.9" fill={`url(#${id}-warm)`} />
      <circle cx="35" cy="37" r="2" fill={`url(#${id}-deep)`} />
      {/* Profilkapsel i mitten */}
      <rect x="18" y="16" width="12" height="16" rx="3.5" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.4" />
      <circle cx="24" cy="21.5" r="2.4" fill="#4F46E5" />
      <rect x="20.5" y="26" width="7" height="1.8" rx="0.9" fill="#C7D2FE" />
      <rect x="20.5" y="29" width="5" height="1.6" rx="0.8" fill="#E0E7FF" />
    </svg>
  )
}

// =============================================================
// AKTIVITET-IKONER (32x32)
// =============================================================

export function IconAktBrev({ className }: IllustrationProps) {
  const id = 'db-ab'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      <rect x="8" y="6" width="14" height="20" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <rect x="8" y="6" width="14" height="3" fill={`url(#${id}-warm)`} />
      <line x1="10" y1="13" x2="20" y2="13" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="16" x2="18" y2="16" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="19" x2="20" y2="19" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="22" x2="16" y2="22" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function IconAktAnalys({ className }: IllustrationProps) {
  const id = 'db-aa'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      <circle cx="16" cy="16" r="9" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
      <circle
        cx="16"
        cy="16"
        r="7.5"
        fill="none"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="47"
        strokeDashoffset="9"
        transform="rotate(-90 16 16)"
      />
      <text x="16" y="18.5" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#DC2626">87</text>
    </svg>
  )
}

export function IconAktCV({ className }: IllustrationProps) {
  const id = 'db-ac'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      <rect x="8" y="6" width="16" height="20" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <rect x="8" y="6" width="16" height="3" fill={`url(#${id}-warm)`} />
      <circle cx="12" cy="13.5" r="2" fill={`url(#${id}-warm)`} opacity="0.6" />
      <line x1="15" y1="13" x2="22" y2="13" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="15" y1="15" x2="20" y2="15" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="19" x2="22" y2="19" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="22" x2="20" y2="22" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function IconAktLinkedin({ className }: IllustrationProps) {
  const id = 'db-al'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      {/* Profilkort i miniatyr */}
      <rect x="6" y="8" width="20" height="16" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <rect x="6" y="8" width="20" height="4" fill={`url(#${id}-warm)`} />
      <circle cx="11" cy="15" r="2.5" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.2" />
      <line x1="15" y1="15" x2="24" y2="15" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15" y1="17.5" x2="22" y2="17.5" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <line x1="8" y1="20" x2="22" y2="20" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="8" y1="22.5" x2="18" y2="22.5" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function IconAktNedladdning({ className }: IllustrationProps) {
  const id = 'db-an'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      <rect x="9" y="6" width="14" height="16" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <line x1="11" y1="11" x2="21" y2="11" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="11" y1="14" x2="19" y2="14" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="11" y1="17" x2="21" y2="17" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      {/* Nedladdnings-pil */}
      <line x1="16" y1="20" x2="16" y2="27" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
      <path d="M 13 24 L 16 27 L 19 24" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconAktTest({ className }: IllustrationProps) {
  const id = 'db-at'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      {/* 3x3 grid */}
      <rect x="7" y="7" width="18" height="18" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <line x1="7" y1="13" x2="25" y2="13" stroke="#FED7AA" strokeWidth="0.8" />
      <line x1="7" y1="19" x2="25" y2="19" stroke="#FED7AA" strokeWidth="0.8" />
      <line x1="13" y1="7" x2="13" y2="25" stroke="#FED7AA" strokeWidth="0.8" />
      <line x1="19" y1="7" x2="19" y2="25" stroke="#FED7AA" strokeWidth="0.8" />
      {/* Prickar */}
      <circle cx="10" cy="10" r="1.2" fill={`url(#${id}-warm)`} />
      <circle cx="16" cy="10" r="1.2" fill={`url(#${id}-warm)`} opacity="0.7" />
      <circle cx="22" cy="10" r="1.2" fill={`url(#${id}-warm)`} opacity="0.4" />
      <rect x="9" y="15" width="2" height="2" fill={`url(#${id}-deep)`} />
      <rect x="15" y="15" width="2" height="2" fill={`url(#${id}-deep)`} opacity="0.7" />
      <rect x="21" y="15" width="2" height="2" fill={`url(#${id}-deep)`} />
      <text x="22" y="24" textAnchor="middle" fontSize="4" fontWeight="900" fill="url(#db-at-deep)">?</text>
    </svg>
  )
}

// =============================================================
// KVOT-IKONER (24x24)
// =============================================================

export function IconKvotBrev({ className }: IllustrationProps) {
  const id = 'db-kb'
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="5" y="3" width="14" height="18" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="5" y="3" width="14" height="3" fill={`url(#${id}-warm)`} />
      <line x1="8" y1="10" x2="16" y2="10" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="13" x2="14" y2="13" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="16" x2="16" y2="16" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconKvotAnalys({ className }: IllustrationProps) {
  const id = 'db-ka'
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <circle cx="12" cy="12" r="9" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <circle
        cx="12"
        cy="12"
        r="7"
        fill="none"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="44"
        strokeDashoffset="9"
        transform="rotate(-90 12 12)"
      />
      <text x="12" y="14" textAnchor="middle" fontSize="6" fontWeight="900" fill="#DC2626">87</text>
    </svg>
  )
}

export function IconKvotLinkedin({ className }: IllustrationProps) {
  const id = 'db-kl'
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="3" y="5" width="18" height="14" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="3" y="5" width="18" height="3.5" fill={`url(#${id}-warm)`} />
      <circle cx="8" cy="13" r="2" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.2" />
      <line x1="11" y1="13" x2="19" y2="13" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="16" x2="17" y2="16" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

// =============================================================
// SHELL-IKONER - for header, banner och CvStatusCard
// =============================================================

/**
 * IconCheckmark (40x40) - Gradient-cirkel med vit bock.
 * Anvands i CvStatusCard nar anvandaren har CV.
 */
export function IconCheckmark({ className }: IllustrationProps) {
  const id = 'db-chk'
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      {/* Soft halo */}
      <circle cx="20" cy="20" r="18" fill={`url(#${id}-soft)`} opacity="0.6" />
      {/* Filled gradient circle */}
      <circle cx="20" cy="20" r="13" fill={`url(#${id}-warm)`} />
      {/* White checkmark */}
      <path
        d="M 13.5 20 L 18 24.5 L 27 15.5"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * IconVarning (40x40) - Vanlig varningstriangel i orange/rod-gradient.
 * Anvands i email-verification-banner och no-CV-banner.
 */
export function IconVarning({ className }: IllustrationProps) {
  const id = 'db-var'
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      {/* Soft halo */}
      <circle cx="20" cy="20" r="18" fill={`url(#${id}-soft)`} opacity="0.7" />
      {/* Triangle */}
      <path
        d="M 20 9 L 32 28 Q 33 30 31 30 L 9 30 Q 7 30 8 28 Z"
        fill={`url(#${id}-warm)`}
      />
      {/* Exclamation */}
      <rect x="18.7" y="15" width="2.6" height="8" rx="1.3" fill="white" />
      <circle cx="20" cy="26" r="1.5" fill="white" />
    </svg>
  )
}

/**
 * IconTarget (48x48) - Sikt-mal med koncentriska cirklar.
 * Anvands i onboarding-banner pa dashboarden.
 */
export function IconTarget({ className }: IllustrationProps) {
  const id = 'db-tgt'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      {/* Outermost ring */}
      <circle cx="24" cy="24" r="20" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      {/* Middle ring */}
      <circle cx="24" cy="24" r="14" fill={`url(#${id}-soft)`} stroke={`url(#${id}-warm)`} strokeWidth="1.5" opacity="0.85" />
      {/* Inner ring */}
      <circle cx="24" cy="24" r="8" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      {/* Bullseye */}
      <circle cx="24" cy="24" r="3.5" fill={`url(#${id}-deep)`} />
      {/* Pil som pekar mot mal (subtilt fran ovre hogra hornet) */}
      <line
        x1="38"
        y1="10"
        x2="27"
        y2="21"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 27 21 L 30 19 M 27 21 L 29 24"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// =============================================================
// BAKGRUNDS-IKONER for streak-kortets kvota-kolumn (192x192)
// Tunn stroke, opacity styrs av forbrukaren via opacity-prop
// =============================================================

/**
 * IconKvotorTimer - klocka som visar att tiden tickar mot reset.
 * Anvands som bakgrundsfigur i kvota-kolumnen for free-anvandare.
 */
export function IconKvotorTimer({ className }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 192 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Klock-ram (yttre) */}
      <circle cx="96" cy="104" r="68" strokeWidth="3" />
      {/* Inre ring */}
      <circle cx="96" cy="104" r="56" strokeWidth="1.5" opacity="0.6" />
      {/* Toppknapp */}
      <line x1="96" y1="36" x2="96" y2="24" strokeWidth="3" strokeLinecap="round" />
      <line x1="84" y1="20" x2="108" y2="20" strokeWidth="3" strokeLinecap="round" />
      {/* Timmarmarkeringar */}
      <line x1="96" y1="44" x2="96" y2="52" strokeWidth="2" strokeLinecap="round" />
      <line x1="96" y1="156" x2="96" y2="164" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="104" x2="44" y2="104" strokeWidth="2" strokeLinecap="round" />
      <line x1="148" y1="104" x2="156" y2="104" strokeWidth="2" strokeLinecap="round" />
      {/* Diagonala markeringar (svagare) */}
      <line x1="56" y1="62" x2="62" y2="68" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="130" y1="68" x2="136" y2="62" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="56" y1="146" x2="62" y2="140" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="130" y1="140" x2="136" y2="146" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      {/* Visare */}
      <line x1="96" y1="104" x2="96" y2="60" strokeWidth="3" strokeLinecap="round" />
      <line x1="96" y1="104" x2="128" y2="120" strokeWidth="3" strokeLinecap="round" />
      <circle cx="96" cy="104" r="4" fill="currentColor" />
    </svg>
  )
}

/**
 * IconKvotorPremium - krona med stralar som visuellt forstarker "Premium aktivt".
 * Anvands som bakgrundsfigur i kvota-kolumnen for premium-anvandare.
 */
export function IconKvotorPremium({ className }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 192 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Krona-bas */}
      <path
        d="M 36 124 L 36 88 L 60 108 L 96 64 L 132 108 L 156 88 L 156 124 Z"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Botten-rektangel pa kronan */}
      <line x1="36" y1="132" x2="156" y2="132" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="148" x2="156" y2="148" strokeWidth="3" strokeLinecap="round" />
      {/* Stenar pa kronan (cirklar) */}
      <circle cx="60" cy="108" r="4" strokeWidth="2" />
      <circle cx="96" cy="100" r="5" strokeWidth="2" />
      <circle cx="132" cy="108" r="4" strokeWidth="2" />
      {/* Stralar ovanfor */}
      <line x1="96" y1="48" x2="96" y2="36" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="74" y1="54" x2="68" y2="44" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="118" y1="54" x2="124" y2="44" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="56" y1="74" x2="46" y2="70" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="136" y1="74" x2="146" y2="70" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Stjarnor for extra effekt */}
      <path
        d="M 30 60 L 32 64 L 36 65 L 32 66 L 30 70 L 28 66 L 24 65 L 28 64 Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M 162 56 L 164 60 L 168 61 L 164 62 L 162 66 L 160 62 L 156 61 L 160 60 Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  )
}
