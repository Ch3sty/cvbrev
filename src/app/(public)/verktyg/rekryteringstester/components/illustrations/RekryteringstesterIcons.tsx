/**
 * Custom SVG-illustrationer for /verktyg/rekryteringstester landningssidan.
 * Hero (120x120) + 3 testtyp-ikoner (72x72) + 4 step-ikoner (48x48)
 * + 6 fardighet-ikoner (56x56) = 14 ikoner totalt.
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
// HERO (120x120) - Abstrakt 3x3-matris med progression
// =============================================================
export function RekryteringstesterHeroIcon({ className }: IllustrationProps) {
  const id = 'rt-hero'
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <circle cx="60" cy="60" r="52" fill={`url(#${id}-soft)`} opacity="0.8" />

      {/* 3x3-matris ram */}
      <rect x="22" y="22" width="76" height="76" rx="8" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />

      {/* Linjer */}
      <line x1="22" y1="47" x2="98" y2="47" stroke="#FED7AA" strokeWidth="1" />
      <line x1="22" y1="72" x2="98" y2="72" stroke="#FED7AA" strokeWidth="1" />
      <line x1="47" y1="22" x2="47" y2="98" stroke="#FED7AA" strokeWidth="1" />
      <line x1="72" y1="22" x2="72" y2="98" stroke="#FED7AA" strokeWidth="1" />

      {/* Rad 1: 1 prick, 2 prickar, 3 prickar */}
      <circle cx="34.5" cy="34.5" r="2.5" fill={`url(#${id}-warm)`} />

      <circle cx="56" cy="32" r="2" fill={`url(#${id}-warm)`} />
      <circle cx="63" cy="37" r="2" fill={`url(#${id}-warm)`} />

      <circle cx="78" cy="30" r="1.8" fill={`url(#${id}-warm)`} />
      <circle cx="84.5" cy="34.5" r="1.8" fill={`url(#${id}-warm)`} />
      <circle cx="91" cy="39" r="1.8" fill={`url(#${id}-warm)`} />

      {/* Rad 2: kvadrat-progression */}
      <rect x="31" y="56" width="7" height="7" rx="1" fill={`url(#${id}-deep)`} opacity="0.55" />
      <rect x="55" y="55" width="9" height="9" rx="1" fill={`url(#${id}-deep)`} opacity="0.7" />
      <rect x="79" y="54" width="11" height="11" rx="1" fill={`url(#${id}-deep)`} opacity="0.85" />

      {/* Rad 3: triangel-progression */}
      <path d="M 34.5 88 L 31 82 L 38 82 Z" fill={`url(#${id}-warm)`} opacity="0.7" />
      <path d="M 59.5 89 L 55 80 L 64 80 Z" fill={`url(#${id}-warm)`} opacity="0.85" />
      {/* Sista cellen: fragetecken */}
      <text x="84.5" y="91" textAnchor="middle" fontSize="14" fontWeight="900" fill="url(#rt-hero-deep)">?</text>

      {/* Pulse */}
      <circle cx="84.5" cy="84.5" r="13" fill="none" stroke="#DC2626" strokeWidth="1.5" opacity="0.4" />
    </svg>
  )
}

// =============================================================
// TESTTYP-IKONER (72x72)
// =============================================================

export function IconMatrislogik({ className }: IllustrationProps) {
  const id = 'rt-ml'
  return (
    <svg className={className} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="68" height="68" rx="16" fill={`url(#${id}-soft)`} />

      {/* 3x3 grid */}
      <rect x="14" y="14" width="44" height="44" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="14" y1="28.5" x2="58" y2="28.5" stroke="#FED7AA" strokeWidth="1" />
      <line x1="14" y1="43" x2="58" y2="43" stroke="#FED7AA" strokeWidth="1" />
      <line x1="28.5" y1="14" x2="28.5" y2="58" stroke="#FED7AA" strokeWidth="1" />
      <line x1="43" y1="14" x2="43" y2="58" stroke="#FED7AA" strokeWidth="1" />

      {/* Forms i progression */}
      <circle cx="21" cy="21" r="2.2" fill={`url(#${id}-warm)`} />
      <circle cx="35.5" cy="20" r="2" fill={`url(#${id}-warm)`} />
      <circle cx="38.5" cy="22.5" r="2" fill={`url(#${id}-warm)`} />
      <circle cx="48" cy="19" r="1.8" fill={`url(#${id}-warm)`} />
      <circle cx="51.5" cy="21" r="1.8" fill={`url(#${id}-warm)`} />
      <circle cx="55" cy="23" r="1.8" fill={`url(#${id}-warm)`} />

      <rect x="18" y="32" width="6" height="6" rx="1" fill={`url(#${id}-deep)`} opacity="0.6" />
      <rect x="32" y="31" width="7" height="7" rx="1" fill={`url(#${id}-deep)`} opacity="0.75" />
      <rect x="46" y="30" width="8" height="8" rx="1" fill={`url(#${id}-deep)`} opacity="0.9" />

      <path d="M 21 53 L 18 47 L 24 47 Z" fill={`url(#${id}-warm)`} opacity="0.7" />
      <path d="M 35.5 54 L 32 46 L 39 46 Z" fill={`url(#${id}-warm)`} opacity="0.85" />
      {/* ? */}
      <text x="50" y="55" textAnchor="middle" fontSize="11" fontWeight="900" fill="url(#rt-ml-deep)">?</text>
    </svg>
  )
}

export function IconVerbal({ className }: IllustrationProps) {
  const id = 'rt-vb'
  return (
    <svg className={className} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="68" height="68" rx="16" fill={`url(#${id}-soft)`} />

      {/* Dokument */}
      <rect x="14" y="12" width="44" height="34" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="14" y="12" width="44" height="5" fill={`url(#${id}-warm)`} />
      {/* Text-rader */}
      <line x1="18" y1="22" x2="54" y2="22" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="26" x2="50" y2="26" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="30" x2="54" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="34" x2="46" y2="34" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="38" x2="42" y2="38" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />

      {/* Sant/Falskt-pills */}
      <rect x="14" y="50" width="13" height="9" rx="4.5" fill={`url(#${id}-warm)`} />
      <text x="20.5" y="56.6" textAnchor="middle" fontSize="6" fontWeight="900" fill="white">Sant</text>

      <rect x="29" y="50" width="14" height="9" rx="4.5" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.2" />
      <text x="36" y="56.6" textAnchor="middle" fontSize="6" fontWeight="900" fill="#DC2626">Falskt</text>

      <rect x="45" y="50" width="13" height="9" rx="4.5" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.2" />
      <text x="51.5" y="56.6" textAnchor="middle" fontSize="6" fontWeight="900" fill="#BE185D">?</text>
    </svg>
  )
}

export function IconNumerisk({ className }: IllustrationProps) {
  const id = 'rt-nu'
  return (
    <svg className={className} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="68" height="68" rx="16" fill={`url(#${id}-soft)`} />

      {/* Tabell */}
      <rect x="14" y="14" width="44" height="32" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="14" y="14" width="44" height="6" fill={`url(#${id}-warm)`} />
      {/* Header-celler */}
      <line x1="28.5" y1="14" x2="28.5" y2="46" stroke="#FED7AA" strokeWidth="1" />
      <line x1="43" y1="14" x2="43" y2="46" stroke="#FED7AA" strokeWidth="1" />
      <line x1="14" y1="26" x2="58" y2="26" stroke="#FED7AA" strokeWidth="1" />
      <line x1="14" y1="34" x2="58" y2="34" stroke="#FED7AA" strokeWidth="1" />
      {/* Tal */}
      <text x="21" y="32" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#1E293B">Q1</text>
      <text x="35.5" y="32" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#1E293B">142</text>
      <text x="50" y="32" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#1E293B">+8%</text>

      <text x="21" y="40" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#1E293B">Q2</text>
      <text x="35.5" y="40" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#1E293B">158</text>
      <text x="50" y="40" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#DC2626">+11%</text>

      {/* Procent-symbol */}
      <circle cx="55" cy="55" r="9" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <text x="55" y="59" textAnchor="middle" fontSize="11" fontWeight="900" fill="#BE185D">%</text>

      {/* Pil upp */}
      <path d="M 18 60 L 22 56 L 26 60" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="22" y1="56" x2="22" y2="64" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// =============================================================
// STEP-IKONER (48x48)
// =============================================================

export function IconValj({ className }: IllustrationProps) {
  const id = 'rt-va'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* 3 kort i ras, mitten markerad */}
      <rect x="9" y="14" width="9" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.4" />
      <rect x="20" y="11" width="9" height="26" rx="2" fill={`url(#${id}-warm)`} />
      <rect x="31" y="14" width="9" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.4" />
      <path d="M 21 22 L 23 24 L 27 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconLos({ className }: IllustrationProps) {
  const id = 'rt-lo'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Hjarna/pussel */}
      <path
        d="M 18 13 Q 14 13 14 17 Q 14 19 16 20 Q 13 21 13 24 Q 13 27 16 28 Q 14 29 14 32 Q 14 36 18 36 L 30 36 Q 34 36 34 32 Q 34 29 32 28 Q 35 27 35 24 Q 35 21 32 20 Q 34 19 34 17 Q 34 13 30 13 Z"
        fill={`url(#${id}-warm)`}
      />
      {/* Glodlampa */}
      <circle cx="24" cy="24" r="4" fill="white" />
      <line x1="24" y1="20" x2="24" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="24" x2="18" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="24" x2="30" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21" y1="21" x2="20" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="21" x2="28" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconScore({ className }: IllustrationProps) {
  const id = 'rt-sc'
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
        strokeDashoffset="20"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="27" textAnchor="middle" fontSize="9" fontWeight="900" fill="#DC2626">73%</text>
    </svg>
  )
}

export function IconAnalys({ className }: IllustrationProps) {
  const id = 'rt-an'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Lista med rader */}
      <rect x="11" y="11" width="26" height="26" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <circle cx="15" cy="17" r="1.6" fill="#22C55E" />
      <line x1="19" y1="17" x2="33" y2="17" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="15" cy="22" r="1.6" fill="#22C55E" />
      <line x1="19" y1="22" x2="31" y2="22" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="15" cy="27" r="1.6" fill="#DC2626" />
      <line x1="19" y1="27" x2="33" y2="27" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="15" cy="32" r="1.6" fill="#22C55E" />
      <line x1="19" y1="32" x2="29" y2="32" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// =============================================================
// FARDIGHET-IKONER (56x56) for "Vad du tranar pa"
// =============================================================

export function IconMonster({ className }: IllustrationProps) {
  const id = 'rt-mo'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Punkter i monster */}
      <circle cx="16" cy="16" r="3" fill={`url(#${id}-warm)`} />
      <circle cx="28" cy="16" r="3" fill={`url(#${id}-warm)`} opacity="0.75" />
      <circle cx="40" cy="16" r="3" fill={`url(#${id}-warm)`} opacity="0.5" />
      <circle cx="16" cy="28" r="3" fill={`url(#${id}-deep)`} opacity="0.55" />
      <circle cx="28" cy="28" r="3" fill={`url(#${id}-deep)`} />
      <circle cx="40" cy="28" r="3" fill={`url(#${id}-deep)`} opacity="0.55" />
      <circle cx="16" cy="40" r="3" fill={`url(#${id}-warm)`} opacity="0.5" />
      <circle cx="28" cy="40" r="3" fill={`url(#${id}-warm)`} opacity="0.75" />
      <circle cx="40" cy="40" r="3" fill={`url(#${id}-warm)`} />
      {/* Forbindande linjer */}
      <line x1="16" y1="16" x2="40" y2="40" stroke={`url(#${id}-deep)`} strokeWidth="1.4" opacity="0.5" />
      <line x1="40" y1="16" x2="16" y2="40" stroke={`url(#${id}-deep)`} strokeWidth="1.4" opacity="0.5" />
    </svg>
  )
}

export function IconLogik({ className }: IllustrationProps) {
  const id = 'rt-lg'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Pussel-bit */}
      <path
        d="M 14 18 L 24 18 Q 24 12 30 12 Q 36 12 36 18 L 42 18 Q 44 18 44 20 L 44 28 Q 38 28 38 34 Q 38 40 44 40 L 44 42 Q 44 44 42 44 L 36 44 L 36 42 Q 36 36 30 36 Q 24 36 24 42 L 24 44 L 14 44 Q 12 44 12 42 L 12 20 Q 12 18 14 18 Z"
        fill={`url(#${id}-warm)`}
      />
      <circle cx="28" cy="28" r="4" fill="white" />
    </svg>
  )
}

export function IconLasforstaelse({ className }: IllustrationProps) {
  const id = 'rt-lf'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Bok */}
      <path d="M 12 16 Q 12 14 14 14 L 26 14 Q 28 14 28 16 L 28 42 Q 28 40 26 40 L 14 40 Q 12 40 12 42 Z" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.6" />
      <path d="M 28 16 Q 28 14 30 14 L 42 14 Q 44 14 44 16 L 44 42 Q 44 40 42 40 L 30 40 Q 28 40 28 42 Z" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.6" />
      {/* Text */}
      <line x1="15" y1="20" x2="25" y2="20" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15" y1="24" x2="24" y2="24" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15" y1="28" x2="25" y2="28" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15" y1="32" x2="22" y2="32" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="31" y1="20" x2="41" y2="20" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="31" y1="24" x2="40" y2="24" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Forstoringsglas */}
      <circle cx="36" cy="32" r="5" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="2" />
      <line x1="40" y1="36" x2="44" y2="40" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconKritiskt({ className }: IllustrationProps) {
  const id = 'rt-kr'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Vagskal */}
      <line x1="28" y1="14" x2="28" y2="42" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="22" x2="42" y2="22" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
      <path d="M 10 22 L 20 22 L 17 32 L 13 32 Z" fill={`url(#${id}-warm)`} />
      <path d="M 36 22 L 46 22 L 43 30 L 39 30 Z" fill={`url(#${id}-warm)`} />
      {/* Bas */}
      <rect x="20" y="40" width="16" height="3" rx="1.5" fill={`url(#${id}-deep)`} />
      <circle cx="28" cy="14" r="3" fill={`url(#${id}-deep)`} />
      {/* Sant/Falskt */}
      <text x="15" y="38" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#22C55E">✓</text>
      <text x="41" y="36" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#DC2626">×</text>
    </svg>
  )
}

export function IconSnabbrakning({ className }: IllustrationProps) {
  const id = 'rt-sb'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Klocka */}
      <circle cx="28" cy="28" r="14" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <line x1="28" y1="28" x2="28" y2="20" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="28" x2="34" y2="30" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="28" r="1.5" fill={`url(#${id}-deep)`} />
      {/* Tal runt */}
      <text x="28" y="18" textAnchor="middle" fontSize="5" fontWeight="900" fill="#DC2626">×</text>
      <text x="38" y="29.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#DC2626">+</text>
      <text x="28" y="42" textAnchor="middle" fontSize="5" fontWeight="900" fill="#DC2626">÷</text>
      <text x="18" y="29.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#DC2626">−</text>
    </svg>
  )
}

// =============================================================
// PERSONLIGHETSPROFIL-IKON (72x72)
// =============================================================

export function IconPersonlighet({ className }: IllustrationProps) {
  const id = 'rt-pl'
  return (
    <svg className={className} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="68" height="68" rx="16" fill={`url(#${id}-soft)`} />

      {/* Siluett: huvud */}
      <circle cx="36" cy="19" r="8" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      {/* Siluett: axlar */}
      <path d="M 18 38 Q 18 28 36 28 Q 54 28 54 38 L 54 42 Q 54 44 52 44 L 20 44 Q 18 44 18 42 Z" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />

      {/* Big Five: 5 staplar */}
      {/* Stapel 1 - kort */}
      <rect x="11" y="56" width="7" height="8" rx="2" fill={`url(#${id}-warm)`} opacity="0.55" />
      {/* Stapel 2 - hög */}
      <rect x="20" y="49" width="7" height="15" rx="2" fill={`url(#${id}-warm)`} opacity="0.72" />
      {/* Stapel 3 - medel-hög */}
      <rect x="29" y="52" width="7" height="12" rx="2" fill={`url(#${id}-deep)`} opacity="0.88" />
      {/* Stapel 4 - låg */}
      <rect x="38" y="58" width="7" height="6" rx="2" fill={`url(#${id}-warm)`} opacity="0.65" />
      {/* Stapel 5 - medel */}
      <rect x="47" y="54" width="7" height="10" rx="2" fill={`url(#${id}-deep)`} />

      {/* Baslinje */}
      <line x1="10" y1="64.5" x2="55" y2="64.5" stroke="#FED7AA" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconTabell({ className }: IllustrationProps) {
  const id = 'rt-tb'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tabell-ram */}
      <rect x="11" y="14" width="34" height="28" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="11" y="14" width="34" height="6" fill={`url(#${id}-warm)`} />
      <line x1="22.3" y1="14" x2="22.3" y2="42" stroke="#FED7AA" strokeWidth="1" />
      <line x1="33.6" y1="14" x2="33.6" y2="42" stroke="#FED7AA" strokeWidth="1" />
      <line x1="11" y1="25" x2="45" y2="25" stroke="#FED7AA" strokeWidth="1" />
      <line x1="11" y1="33" x2="45" y2="33" stroke="#FED7AA" strokeWidth="1" />

      {/* Markerad cell */}
      <rect x="22.3" y="25" width="11.3" height="8" fill={`url(#${id}-warm)`} opacity="0.3" />
      {/* Tal */}
      <text x="16.5" y="31" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#1E293B">A</text>
      <text x="28" y="31" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#DC2626">142</text>
      <text x="39.3" y="31" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#1E293B">+8</text>
      <text x="16.5" y="39" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#1E293B">B</text>
      <text x="28" y="39" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#1E293B">158</text>
      <text x="39.3" y="39" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#1E293B">+11</text>
    </svg>
  )
}
