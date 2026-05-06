/**
 * Custom SVG-illustrationer for /verktyg/jobbmatchning landningssidan.
 * Hero (120x120) + 4 step-ikoner (48x48) + 6 datapunkt-ikoner (56x56)
 * + 6 feature-ikoner (56x56) = 17 ikoner totalt.
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
// HERO (120x120) - Magnet med jobb-kort som dras in
// =============================================================
export function JobbmatchningHeroIcon({ className }: IllustrationProps) {
  const id = 'jm-hero'
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

      {/* Magnet (U-form) */}
      <g transform="translate(40 36)">
        <path
          d="M0 0 L0 26 Q0 40 14 40 L20 40 L20 28 L14 28 Q12 28 12 26 L12 0 Z"
          fill={`url(#${id}-warm)`}
        />
        <path
          d="M40 0 L40 26 Q40 40 26 40 L20 40 L20 28 L26 28 Q28 28 28 26 L28 0 Z"
          fill={`url(#${id}-deep)`}
        />
        {/* Magnet-poler (vit topp) */}
        <rect x="0" y="0" width="12" height="6" fill="white" />
        <rect x="28" y="0" width="12" height="6" fill="white" />
      </g>

      {/* Jobb-kort som dras in */}
      <g transform="translate(8 50)">
        <rect x="0" y="0" width="22" height="14" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.2" />
        <line x1="3" y1="4" x2="14" y2="4" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3" y1="8" x2="18" y2="8" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
        <circle cx="17" cy="11" r="3" fill={`url(#${id}-warm)`} />
        <text x="17" y="13" textAnchor="middle" fontSize="3.5" fontWeight="900" fill="white">94</text>
      </g>

      <g transform="translate(86 60)">
        <rect x="0" y="0" width="22" height="14" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.2" />
        <line x1="3" y1="4" x2="14" y2="4" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3" y1="8" x2="18" y2="8" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
        <circle cx="17" cy="11" r="3" fill={`url(#${id}-warm)`} />
        <text x="17" y="13" textAnchor="middle" fontSize="3.5" fontWeight="900" fill="white">87</text>
      </g>

      {/* Pulse-prickar */}
      <circle cx="20" cy="30" r="3" fill={`url(#${id}-warm)`} />
      <circle cx="20" cy="30" r="5.5" fill="#F97316" opacity="0.18" />

      <circle cx="100" cy="30" r="2.5" fill={`url(#${id}-deep)`} />
      <circle cx="100" cy="30" r="4.5" fill="#BE185D" opacity="0.18" />
    </svg>
  )
}

// =============================================================
// STEP-IKONER (48x48) for "Sa funkar det"
// =============================================================

export function IconAktivera({ className }: IllustrationProps) {
  const id = 'jm-akt'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      <rect x="13" y="11" width="22" height="28" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="13" y="11" width="22" height="3" fill={`url(#${id}-warm)`} />
      <line x1="16" y1="20" x2="32" y2="20" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="25" x2="29" y2="25" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="30" x2="32" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Power-cirkel */}
      <circle cx="36" cy="36" r="7" fill={`url(#${id}-warm)`} />
      <circle cx="36" cy="36" r="3" fill="none" stroke="white" strokeWidth="1.6" />
      <line x1="36" y1="32" x2="36" y2="36" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconExtrahera({ className }: IllustrationProps) {
  const id = 'jm-ex'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      <rect x="9" y="11" width="14" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="9" y="11" width="14" height="3" fill={`url(#${id}-warm)`} />
      {/* CV-data extraheras till tags */}
      <line x1="11" y1="18" x2="21" y2="18" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="11" y1="22" x2="19" y2="22" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="11" y1="26" x2="21" y2="26" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      {/* Pil */}
      <line x1="25" y1="22" x2="29" y2="22" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
      <path d="M27 19 L29 22 L27 25" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Tags */}
      <rect x="31" y="13" width="12" height="5" rx="2" fill={`url(#${id}-warm)`} opacity="0.85" />
      <rect x="31" y="20" width="9" height="5" rx="2" fill={`url(#${id}-warm)`} opacity="0.85" />
      <rect x="31" y="27" width="11" height="5" rx="2" fill={`url(#${id}-deep)`} opacity="0.85" />
    </svg>
  )
}

export function IconSoka({ className }: IllustrationProps) {
  const id = 'jm-sok'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Forstoringsglas */}
      <circle cx="20" cy="20" r="9" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2.5" />
      <line x1="27" y1="27" x2="36" y2="36" stroke={`url(#${id}-warm)`} strokeWidth="3" strokeLinecap="round" />
      {/* Tre jobb-kort inuti */}
      <line x1="15" y1="17" x2="25" y2="17" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="15" y1="20" x2="23" y2="20" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="15" y1="23" x2="25" y2="23" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" />
      {/* Pulse */}
      <circle cx="36" cy="14" r="2.5" fill={`url(#${id}-deep)`} />
      <circle cx="36" cy="14" r="4.5" fill="#BE185D" opacity="0.25" />
    </svg>
  )
}

export function IconMatcha({ className }: IllustrationProps) {
  const id = 'jm-ma'
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
        strokeDashoffset="11"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="29" textAnchor="middle" fontSize="13" fontWeight="900" fill="#DC2626">
        92
      </text>
    </svg>
  )
}

// =============================================================
// DATAPUNKT-IKONER (56x56) for "Vad vi extraherar"
// =============================================================

export function IconYrke({ className }: IllustrationProps) {
  const id = 'd-yrke'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Kavaj-silhuett */}
      <path
        d="M28 14 Q22 14 22 22 L18 26 L18 44 L38 44 L38 26 L34 22 Q34 14 28 14 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Slips */}
      <path d="M28 22 L26 30 L28 38 L30 30 Z" fill={`url(#${id}-deep)`} />
      {/* Krage */}
      <line x1="22" y1="22" x2="28" y2="26" stroke={`url(#${id}-warm)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="22" x2="28" y2="26" stroke={`url(#${id}-warm)`} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconKompetens({ className }: IllustrationProps) {
  const id = 'd-komp'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Stjarna med stralar */}
      <path
        d="M28 12 L31 22 L42 22 L33 28 L36 38 L28 32 L20 38 L23 28 L14 22 L25 22 Z"
        fill={`url(#${id}-warm)`}
        stroke={`url(#${id}-deep)`}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Sparkles */}
      <circle cx="44" cy="14" r="1.5" fill={`url(#${id}-deep)`} />
      <circle cx="12" cy="42" r="1.5" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

export function IconUtbildning({ className }: IllustrationProps) {
  const id = 'd-utb'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Examensbluv */}
      <path
        d="M28 16 L44 22 L28 28 L12 22 Z"
        fill={`url(#${id}-warm)`}
        stroke={`url(#${id}-deep)`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M18 25 L18 34 Q28 40 38 34 L38 25" stroke={`url(#${id}-warm)`} strokeWidth="2" fill="none" strokeLinejoin="round" />
      {/* Tofs */}
      <line x1="44" y1="22" x2="44" y2="32" stroke={`url(#${id}-deep)`} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="44" cy="34" r="2" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

export function IconPlats({ className }: IllustrationProps) {
  const id = 'd-pl'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Pin */}
      <path
        d="M28 12 Q18 12 18 24 Q18 32 28 44 Q38 32 38 24 Q38 12 28 12 Z"
        fill={`url(#${id}-warm)`}
        stroke={`url(#${id}-deep)`}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="24" r="5" fill="white" />
      <circle cx="28" cy="24" r="2.5" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

export function IconSprak({ className }: IllustrationProps) {
  const id = 'd-spr'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Globe */}
      <circle cx="28" cy="28" r="13" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <ellipse cx="28" cy="28" rx="6" ry="13" fill="none" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="15" y1="28" x2="41" y2="28" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <ellipse cx="28" cy="28" rx="13" ry="5" fill="none" stroke={`url(#${id}-warm)`} strokeWidth="1.2" />
    </svg>
  )
}

export function IconErfarenhet({ className }: IllustrationProps) {
  const id = 'd-erf'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Klocka/timer */}
      <circle cx="28" cy="30" r="13" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <line x1="28" y1="30" x2="28" y2="22" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="30" x2="34" y2="30" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="30" r="2" fill={`url(#${id}-deep)`} />
      {/* Knapp pa toppen */}
      <rect x="26" y="14" width="4" height="3" rx="1" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

// =============================================================
// FEATURE-IKONER (56x56) for "Vad du far"
// =============================================================

export function IconTusentals({ className }: IllustrationProps) {
  const id = 'f-tus'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tre staplade jobb-kort */}
      <rect x="9" y="14" width="32" height="8" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.2" />
      <rect x="9" y="24" width="32" height="8" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="9" y="34" width="32" height="8" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.2" />
      <rect x="9" y="14" width="3" height="8" fill={`url(#${id}-warm)`} opacity="0.6" />
      <rect x="9" y="24" width="3" height="8" fill={`url(#${id}-warm)`} />
      <rect x="9" y="34" width="3" height="8" fill={`url(#${id}-deep)`} opacity="0.6" />
      <line x1="15" y1="18" x2="35" y2="18" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="15" y1="28" x2="35" y2="28" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="15" y1="38" x2="35" y2="38" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <text x="48" y="33" textAnchor="middle" fontSize="6" fontWeight="900" fill={`url(#${id}-deep)`}>+</text>
    </svg>
  )
}

export function IconProcent({ className }: IllustrationProps) {
  const id = 'f-pro'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Procent-cirkel stor */}
      <circle cx="28" cy="28" r="15" fill="white" stroke="#FED7AA" strokeWidth="2" />
      <circle
        cx="28"
        cy="28"
        r="13"
        fill="none"
        stroke={`url(#${id}-warm)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="81.7"
        strokeDashoffset="12"
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="33" textAnchor="middle" fontSize="13" fontWeight="900" fill="#DC2626">
        85%
      </text>
    </svg>
  )
}

export function IconDistans({ className }: IllustrationProps) {
  const id = 'f-dis'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tva pins med linje */}
      <path
        d="M16 18 Q11 18 11 24 Q11 28 16 34 Q21 28 21 24 Q21 18 16 18 Z"
        fill={`url(#${id}-warm)`}
      />
      <circle cx="16" cy="24" r="2" fill="white" />
      <line x1="20" y1="32" x2="36" y2="32" stroke={`url(#${id}-warm)`} strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2" />
      <path
        d="M40 22 Q35 22 35 28 Q35 32 40 38 Q45 32 45 28 Q45 22 40 22 Z"
        fill={`url(#${id}-deep)`}
      />
      <circle cx="40" cy="28" r="2" fill="white" />
    </svg>
  )
}

export function IconUppdaterad({ className }: IllustrationProps) {
  const id = 'f-upd'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Refresh-cirkel */}
      <path
        d="M42 28 A14 14 0 1 1 28 14"
        stroke={`url(#${id}-warm)`}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M42 14 L42 22 L34 22" stroke={`url(#${id}-warm)`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Inre dot */}
      <circle cx="28" cy="28" r="4" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

export function IconRelevans({ className }: IllustrationProps) {
  const id = 'f-rel'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Sorteringspilar */}
      <rect x="10" y="14" width="30" height="5" rx="2" fill={`url(#${id}-deep)`} />
      <rect x="10" y="22" width="24" height="5" rx="2" fill={`url(#${id}-warm)`} />
      <rect x="10" y="30" width="18" height="5" rx="2" fill={`url(#${id}-warm)`} opacity="0.7" />
      <rect x="10" y="38" width="12" height="5" rx="2" fill={`url(#${id}-warm)`} opacity="0.45" />
      <path d="M44 14 L44 42" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
      <path d="M40 38 L44 42 L48 38" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconAllaBranscher({ className }: IllustrationProps) {
  const id = 'f-bra'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Fyra ikoner i 2x2 grid (vard, tech, ekonomi, service) */}
      <rect x="11" y="11" width="14" height="14" rx="3" fill={`url(#${id}-warm)`} opacity="0.85" />
      <path d="M14 18 L24 18 M19 13 L19 23" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <rect x="31" y="11" width="14" height="14" rx="3" fill={`url(#${id}-deep)`} opacity="0.85" />
      <path d="M37 13 L33 18 L37 23 M39 13 L43 18 L39 23" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="11" y="31" width="14" height="14" rx="3" fill={`url(#${id}-deep)`} opacity="0.85" />
      <text x="18" y="42" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">kr</text>
      <rect x="31" y="31" width="14" height="14" rx="3" fill={`url(#${id}-warm)`} opacity="0.85" />
      <circle cx="38" cy="36" r="2.5" fill="white" />
      <path d="M33 43 Q38 39 43 43" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}
