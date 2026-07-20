/**
 * Custom SVG-illustrationer for /exempel-hubben.
 * 6 kategori-ikoner (vard, tech, ekonomi, service, utbildning, offentlig)
 * + 3 step-ikoner for "Sa anvander du" + 1 hero-ikon.
 * Stil: orange/rod-DNA, samma Defs-pattern som ToolIllustrations och BrevIcons.
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
// KATEGORI-IKONER (56x56) for populara yrken + kategori-hub
// =============================================================

export function IconVard({ className }: IllustrationProps) {
  const id = 'k-vard'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Hjarta */}
      <path d="M28 44 C 14 34 14 22 22 22 C 26 22 28 25 28 25 C 28 25 30 22 34 22 C 42 22 42 34 28 44 Z" fill={`url(#${id}-warm)`} />
      {/* Pulsslag */}
      <line x1="14" y1="32" x2="20" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 32 L22 28 L24 36 L26 30 L28 32" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="36" y1="32" x2="42" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconTech({ className }: IllustrationProps) {
  const id = 'k-tech'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Skarm */}
      <rect x="10" y="14" width="36" height="24" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="10" y="14" width="36" height="4" fill={`url(#${id}-warm)`} />
      {/* Code-tags */}
      <path d="M18 24 L14 28 L18 32" stroke={`url(#${id}-deep)`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M38 24 L42 28 L38 32" stroke={`url(#${id}-deep)`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="24" y1="32" x2="32" y2="22" stroke={`url(#${id}-warm)`} strokeWidth="2.2" strokeLinecap="round" />
      {/* Stativ */}
      <rect x="22" y="40" width="12" height="3" rx="1" fill="#FED7AA" />
    </svg>
  )
}

export function IconEkonomi({ className }: IllustrationProps) {
  const id = 'k-ekon'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Stigande staplar */}
      <rect x="11" y="32" width="6" height="14" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.55" />
      <rect x="20" y="24" width="6" height="22" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.75" />
      <rect x="29" y="18" width="6" height="28" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.9" />
      <rect x="38" y="12" width="6" height="34" rx="1.5" fill={`url(#${id}-deep)`} />
      {/* Kr-symbol */}
      <text x="41" y="34" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">kr</text>
    </svg>
  )
}

export function IconService({ className }: IllustrationProps) {
  const id = 'k-serv'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Servett-bricka */}
      <ellipse cx="28" cy="36" rx="18" ry="3" fill={`url(#${id}-warm)`} />
      {/* Glas/kopp */}
      <path d="M22 18 L22 32 Q 22 36 28 36 Q 34 36 34 32 L 34 18 Z" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <ellipse cx="28" cy="18" rx="6" ry="1.5" fill={`url(#${id}-deep)`} />
      {/* Anga */}
      <path d="M25 14 Q 26 12 25 10" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M28 13 Q 29 11 28 9" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M31 14 Q 32 12 31 10" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function IconUtbildning({ className }: IllustrationProps) {
  const id = 'k-utb'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Bok */}
      <rect x="12" y="14" width="32" height="26" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <line x1="28" y1="14" x2="28" y2="40" stroke="#FED7AA" strokeWidth="1.5" />
      <line x1="16" y1="20" x2="25" y2="20" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="25" x2="25" y2="25" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="30" x2="22" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="31" y1="20" x2="40" y2="20" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="31" y1="25" x2="40" y2="25" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="31" y1="30" x2="38" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Examensbluv-tofs */}
      <circle cx="28" cy="44" r="3" fill={`url(#${id}-warm)`} />
      <line x1="28" y1="44" x2="34" y2="48" stroke={`url(#${id}-warm)`} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconOffentlig({ className }: IllustrationProps) {
  const id = 'k-off'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Byggnad/pelare */}
      <rect x="10" y="20" width="36" height="22" rx="1" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      {/* Tak */}
      <path d="M8 20 L28 12 L48 20 Z" fill={`url(#${id}-warm)`} />
      {/* Pelare */}
      <line x1="16" y1="22" x2="16" y2="40" stroke="#FED7AA" strokeWidth="2.5" />
      <line x1="22" y1="22" x2="22" y2="40" stroke="#FED7AA" strokeWidth="2.5" />
      <line x1="28" y1="22" x2="28" y2="40" stroke="#FED7AA" strokeWidth="2.5" />
      <line x1="34" y1="22" x2="34" y2="40" stroke="#FED7AA" strokeWidth="2.5" />
      <line x1="40" y1="22" x2="40" y2="40" stroke="#FED7AA" strokeWidth="2.5" />
      {/* Bas */}
      <rect x="8" y="42" width="40" height="3" rx="1" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

export function IconHantverk({ className }: IllustrationProps) {
  const id = 'k-hant'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Planka */}
      <rect x="8" y="34" width="40" height="8" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <line x1="14" y1="38" x2="18" y2="38" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="38" x2="30" y2="38" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="38" x2="42" y2="38" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
      {/* Hammarskaft */}
      <rect x="25.5" y="16" width="5" height="18" rx="2" transform="rotate(35 28 25)" fill={`url(#${id}-warm)`} />
      {/* Hammarhuvud */}
      <rect x="16" y="10" width="16" height="8" rx="2.5" transform="rotate(35 24 14)" fill={`url(#${id}-deep)`} />
      {/* Spik */}
      <line x1="40" y1="26" x2="40" y2="34" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
      <line x1="37.5" y1="26" x2="42.5" y2="26" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// =============================================================
// STEP-IKONER (56x56) for "Sa anvander du exemplen"
// =============================================================

export function IconHitta({ className }: IllustrationProps) {
  const id = 's-hitta'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Forstoringsglas */}
      <circle cx="24" cy="24" r="9" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2.5" />
      <line x1="31" y1="31" x2="40" y2="40" stroke={`url(#${id}-warm)`} strokeWidth="3" strokeLinecap="round" />
      {/* Lista inuti glaset */}
      <line x1="19" y1="21" x2="29" y2="21" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="19" y1="25" x2="27" y2="25" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="19" y1="29" x2="29" y2="29" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconLas({ className }: IllustrationProps) {
  const id = 's-las'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Dokument */}
      <rect x="13" y="11" width="22" height="30" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="13" y="11" width="22" height="3.5" fill={`url(#${id}-warm)`} />
      <line x1="16" y1="20" x2="32" y2="20" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="25" x2="29" y2="25" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="30" x2="32" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="35" x2="26" y2="35" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Glodlampa-accent */}
      <circle cx="40" cy="38" r="5" fill={`url(#${id}-deep)`} />
      <path d="M40 35 L40 41 M37.5 38 L42.5 38" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconSkapa({ className }: IllustrationProps) {
  const id = 's-skapa'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Penna som skriver */}
      <rect x="13" y="14" width="24" height="30" rx="2.5" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="13" y="14" width="24" height="3" fill={`url(#${id}-warm)`} />
      <line x1="17" y1="22" x2="33" y2="22" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="27" x2="30" y2="27" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="17" y1="32" x2="33" y2="32" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="17" y1="37" x2="27" y2="37" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Penna */}
      <g transform="rotate(40 40 18)">
        <rect x="38" y="14" width="4" height="20" rx="1" fill={`url(#${id}-deep)`} />
        <path d="M38 14 L42 14 L40 11 Z" fill="#1E293B" />
        <rect x="38" y="32" width="4" height="3" fill="#FBBF24" />
      </g>
    </svg>
  )
}

// =============================================================
// HERO-IKON (120x120) - bibliotek-tema
// =============================================================

export function ExempelHeroIcon({ className }: IllustrationProps) {
  const id = 'hero-ex'
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <circle cx="60" cy="60" r="52" fill={`url(#${id}-soft)`} opacity="0.8" />
      {/* Tre staplade dokument */}
      <rect x="22" y="30" width="44" height="60" rx="4" fill="white" stroke="#FED7AA" strokeWidth="1.5" transform="rotate(-8 44 60)" />
      <rect x="34" y="26" width="44" height="60" rx="4" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="34" y="26" width="44" height="5" fill={`url(#${id}-warm)`} />
      {/* Innehall */}
      <line x1="40" y1="40" x2="62" y2="40" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="48" x2="58" y2="48" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="40" y="56" width="20" height="3" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.85" />
      <line x1="40" y1="64" x2="68" y2="64" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="40" y1="70" x2="62" y2="70" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="40" y1="76" x2="68" y2="76" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Tredje pa hoger */}
      <rect x="46" y="32" width="44" height="60" rx="4" fill="white" stroke="#FED7AA" strokeWidth="1.5" transform="rotate(8 68 62)" />
      {/* Stjarn-accent */}
      <circle cx="92" cy="32" r="4" fill={`url(#${id}-warm)`} />
      <circle cx="92" cy="32" r="7" fill="#F97316" opacity="0.18" />
    </svg>
  )
}
