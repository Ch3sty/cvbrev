/**
 * Custom SVG-illustrationer for /dashboard.
 * 4 snabb-ikoner (48x48) + 6 aktivitet-ikoner (32x32) + 3 kvot-ikoner (24x24)
 * + 1 streak-eld (96x96) = 14 ikoner totalt.
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
