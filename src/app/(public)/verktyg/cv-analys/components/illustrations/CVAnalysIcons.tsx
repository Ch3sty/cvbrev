/**
 * Custom SVG-illustrationer for /verktyg/cv-analys.
 * Hero (120x120) + 4 step-ikoner (48x48) + 6 kategori-ikoner (56x56) + 5 tips-ikoner (32x32).
 * Stil: orange/rod-DNA med Defs-pattern (warm/deep/soft gradienter).
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
// HERO (120x120) - CV-papper med ATS-cirkel + pulserande poang-stjarnor
// =============================================================
export function CVAnalysHeroIcon({ className }: IllustrationProps) {
  const id = 'cva-hero'
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

      {/* CV-papper */}
      <g transform="translate(20 24)">
        <rect
          x="0"
          y="0"
          width="50"
          height="68"
          rx="5"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1.5"
        />
        <rect x="0" y="0" width="50" height="6" fill={`url(#${id}-warm)`} />

        {/* Header-sektion */}
        <line x1="6" y1="14" x2="32" y2="14" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="6" y1="20" x2="24" y2="20" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />

        {/* Erfarenhet rader */}
        <line x1="6" y1="30" x2="42" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="36" x2="38" y2="36" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="42" x2="42" y2="42" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="48" x2="36" y2="48" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="54" x2="42" y2="54" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="60" x2="34" y2="60" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* ATS-cirkel ovanpa nedre hornet */}
      <g transform="translate(72 60)">
        <circle cx="20" cy="20" r="22" fill="white" />
        <circle
          cx="20"
          cy="20"
          r="20"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="2.5"
        />
        {/* Progress-ring (ca 85%) */}
        <circle
          cx="20"
          cy="20"
          r="17"
          fill="none"
          stroke={`url(#${id}-warm)`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="106.8"
          strokeDashoffset="16"
          transform="rotate(-90 20 20)"
        />
        <text
          x="20"
          y="25"
          textAnchor="middle"
          fontSize="14"
          fontWeight="900"
          fill="#DC2626"
        >
          89
        </text>
      </g>

      {/* Pulserande poang-stjarnor */}
      <circle cx="22" cy="30" r="3.5" fill={`url(#${id}-warm)`} />
      <circle cx="22" cy="30" r="6" fill="#F97316" opacity="0.18" />

      <circle cx="98" cy="32" r="3" fill={`url(#${id}-deep)`} />
      <circle cx="98" cy="32" r="5" fill="#BE185D" opacity="0.18" />

      <circle cx="18" cy="98" r="2.5" fill={`url(#${id}-warm)`} />
    </svg>
  )
}

// =============================================================
// STEP-IKONER (48x48) for "Sa funkar det"
// =============================================================

export function IconUpload({ className }: IllustrationProps) {
  const id = 'st-up'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      <rect x="13" y="11" width="22" height="28" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="13" y="11" width="22" height="3" fill={`url(#${id}-warm)`} />
      <line x1="16" y1="20" x2="32" y2="20" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="25" x2="29" y2="25" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="30" x2="32" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Upload arrow */}
      <circle cx="36" cy="36" r="6" fill={`url(#${id}-warm)`} />
      <path d="M36 39 L36 33 M33 36 L36 33 L39 36" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconAnalyze({ className }: IllustrationProps) {
  const id = 'st-an'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Forstoringsglas */}
      <circle cx="20" cy="20" r="9" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2.5" />
      <line x1="27" y1="27" x2="36" y2="36" stroke={`url(#${id}-warm)`} strokeWidth="3" strokeLinecap="round" />
      {/* Kontrollkrocker inuti glaset */}
      <path d="M16 20 L19 23 L25 17" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Pulse-prick */}
      <circle cx="36" cy="14" r="2.5" fill={`url(#${id}-deep)`} />
      <circle cx="36" cy="14" r="4.5" fill="#BE185D" opacity="0.25" />
    </svg>
  )
}

export function IconScore({ className }: IllustrationProps) {
  const id = 'st-sc'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* ATS-cirkel */}
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
        strokeDashoffset="11"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="29" textAnchor="middle" fontSize="13" fontWeight="900" fill="#DC2626">
        89
      </text>
    </svg>
  )
}

export function IconSaveCV({ className }: IllustrationProps) {
  const id = 'st-sv'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      <rect x="13" y="10" width="22" height="28" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="13" y="10" width="22" height="3" fill={`url(#${id}-warm)`} />
      <line x1="16" y1="18" x2="32" y2="18" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="23" x2="29" y2="23" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="28" x2="32" y2="28" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Check-cirkel */}
      <circle cx="35" cy="36" r="7" fill={`url(#${id}-warm)`} />
      <path d="M32 36 L34 38 L38 34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// =============================================================
// KATEGORI-IKONER (56x56) for "Vad vi kontrollerar"
// =============================================================

export function IconATS({ className }: IllustrationProps) {
  const id = 'k-ats'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Robot-skarm med vink-ogon */}
      <rect x="11" y="14" width="34" height="24" rx="4" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="11" y="14" width="34" height="4" fill={`url(#${id}-warm)`} />
      {/* Ogon */}
      <circle cx="20" cy="28" r="3" fill={`url(#${id}-deep)`} />
      <circle cx="36" cy="28" r="3" fill={`url(#${id}-deep)`} />
      {/* Antenn */}
      <line x1="28" y1="14" x2="28" y2="9" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="8" r="2" fill={`url(#${id}-warm)`} />
      {/* Botten-streck */}
      <rect x="18" y="42" width="20" height="2.5" rx="1.25" fill={`url(#${id}-warm)`} opacity="0.7" />
    </svg>
  )
}

export function IconStruktur({ className }: IllustrationProps) {
  const id = 'k-str'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      <rect x="13" y="10" width="30" height="36" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      {/* Sektion 1 */}
      <rect x="16" y="14" width="14" height="3" rx="1" fill={`url(#${id}-deep)`} />
      <line x1="16" y1="20" x2="40" y2="20" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="24" x2="36" y2="24" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Avgransning */}
      <line x1="13" y1="28" x2="43" y2="28" stroke="#FED7AA" strokeWidth="1.5" />
      {/* Sektion 2 */}
      <rect x="16" y="31" width="12" height="3" rx="1" fill={`url(#${id}-deep)`} />
      <line x1="16" y1="37" x2="40" y2="37" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="41" x2="34" y2="41" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconSprak({ className }: IllustrationProps) {
  const id = 'k-spr'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Stora bokstaven A */}
      <path
        d="M16 42 L24 14 L32 42 M19 32 L29 32"
        stroke={`url(#${id}-warm)`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Liten check-cirkel */}
      <circle cx="40" cy="36" r="6" fill={`url(#${id}-deep)`} />
      <path d="M37 36 L39 38 L43 34" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconNyckelord({ className }: IllustrationProps) {
  const id = 'k-nyc'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Nyckel */}
      <circle cx="20" cy="28" r="8" fill="none" stroke={`url(#${id}-warm)`} strokeWidth="3" />
      <circle cx="20" cy="28" r="2.5" fill={`url(#${id}-warm)`} />
      <line x1="27" y1="28" x2="46" y2="28" stroke={`url(#${id}-warm)`} strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="28" x2="40" y2="34" stroke={`url(#${id}-warm)`} strokeWidth="3" strokeLinecap="round" />
      <line x1="44" y1="28" x2="44" y2="32" stroke={`url(#${id}-warm)`} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function IconKvantifiering({ className }: IllustrationProps) {
  const id = 'k-kva'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Stigande staplar */}
      <rect x="11" y="32" width="6" height="14" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.55" />
      <rect x="20" y="24" width="6" height="22" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.75" />
      <rect x="29" y="18" width="6" height="28" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.9" />
      <rect x="38" y="12" width="6" height="34" rx="1.5" fill={`url(#${id}-deep)`} />
      {/* Procenttecken */}
      <text x="41" y="32" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">%</text>
    </svg>
  )
}

export function IconProfil({ className }: IllustrationProps) {
  const id = 'k-pro'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Person-silhuette */}
      <circle cx="28" cy="22" r="7" fill={`url(#${id}-warm)`} />
      <path d="M14 46 Q14 32 28 32 Q42 32 42 46" fill={`url(#${id}-warm)`} />
      {/* Stjarna ovanpa */}
      <path
        d="M40 12 L41.5 15 L45 15.5 L42.5 18 L43 21.5 L40 19.8 L37 21.5 L37.5 18 L35 15.5 L38.5 15 Z"
        fill={`url(#${id}-deep)`}
      />
    </svg>
  )
}

// =============================================================
// TIPS-IKONER (32x32)
// =============================================================

export function IconKvantifiera({ className }: IllustrationProps) {
  const id = 'tip-q'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      <rect x="7" y="20" width="4" height="6" rx="1" fill={`url(#${id}-warm)`} opacity="0.5" />
      <rect x="13" y="16" width="4" height="10" rx="1" fill={`url(#${id}-warm)`} opacity="0.7" />
      <rect x="19" y="11" width="4" height="15" rx="1" fill={`url(#${id}-warm)`} />
      <path d="M9 12 L23 7" stroke={`url(#${id}-deep)`} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 7 L23 7 L23 11" stroke={`url(#${id}-deep)`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconVerb({ className }: IllustrationProps) {
  const id = 'tip-v'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      {/* Pil framat */}
      <line x1="8" y1="16" x2="22" y2="16" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 11 L24 16 L18 21" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconKeywords({ className }: IllustrationProps) {
  const id = 'tip-k'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      <rect x="6" y="11" width="9" height="4" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.85" />
      <rect x="17" y="11" width="7" height="4" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.85" />
      <rect x="6" y="17" width="6" height="4" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.85" />
      <rect x="14" y="17" width="11" height="4" rx="1.5" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

export function IconLength({ className }: IllustrationProps) {
  const id = 'tip-l'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      <rect x="9" y="6" width="14" height="20" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="12" y1="11" x2="20" y2="11" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="15" x2="20" y2="15" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="18" y2="18" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="21" x2="20" y2="21" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconNoBild({ className }: IllustrationProps) {
  const id = 'tip-nb'
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      {/* Kameran */}
      <rect x="7" y="12" width="18" height="12" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <circle cx="16" cy="18" r="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      {/* Diagonal "nej"-streck */}
      <line x1="6" y1="8" x2="26" y2="28" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
