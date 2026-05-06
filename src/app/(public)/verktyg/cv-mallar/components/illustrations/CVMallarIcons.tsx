/**
 * Custom SVG-illustrationer for /verktyg/cv-mallar.
 * Hero (120x120) + 4 step-ikoner (48x48) + 6 feature-ikoner (56x56)
 * + 3 kategori-ikoner (24x24) for filter-pills.
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
// HERO (120x120) - Staplade CV-papper med pulserande mall-prick
// =============================================================
export function CVMallarHeroIcon({ className }: IllustrationProps) {
  const id = 'cvm-hero'
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

      {/* Bakre CV (lutat) */}
      <g transform="translate(20 30) rotate(-7 24 36)">
        <rect
          x="0"
          y="0"
          width="48"
          height="64"
          rx="4"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1.5"
        />
        <rect x="0" y="0" width="48" height="5" fill={`url(#${id}-warm)`} />
        <line x1="6" y1="14" x2="28" y2="14" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="22" x2="40" y2="22" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="28" x2="36" y2="28" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="34" x2="40" y2="34" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="40" x2="34" y2="40" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Mitten-CV */}
      <g transform="translate(36 26)">
        <rect
          x="0"
          y="0"
          width="48"
          height="68"
          rx="4"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1.5"
        />
        <rect x="0" y="0" width="48" height="6" fill={`url(#${id}-warm)`} />

        {/* Header */}
        <line x1="6" y1="14" x2="32" y2="14" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="6" y1="20" x2="24" y2="20" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />

        {/* Body rader */}
        <line x1="6" y1="30" x2="40" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="36" x2="36" y2="36" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="42" x2="40" y2="42" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <rect
          x="6"
          y="48"
          width="22"
          height="3"
          rx="1.5"
          fill={`url(#${id}-warm)`}
          opacity="0.85"
        />
        <line x1="6" y1="56" x2="38" y2="56" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="62" x2="34" y2="62" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Fram-CV (lutat at andra hallet) */}
      <g transform="translate(56 32) rotate(7 24 32)">
        <rect
          x="0"
          y="0"
          width="44"
          height="60"
          rx="4"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1.5"
        />
        <rect x="0" y="0" width="44" height="5" fill={`url(#${id}-deep)`} />
        <line x1="6" y1="14" x2="26" y2="14" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="22" x2="36" y2="22" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="28" x2="32" y2="28" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="34" x2="36" y2="34" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Pulserande prickar */}
      <circle cx="22" cy="30" r="3.5" fill={`url(#${id}-warm)`} />
      <circle cx="22" cy="30" r="6" fill="#F97316" opacity="0.18" />

      <circle cx="100" cy="34" r="3" fill={`url(#${id}-deep)`} />
      <circle cx="100" cy="34" r="5" fill="#BE185D" opacity="0.18" />

      <circle cx="20" cy="98" r="2.5" fill={`url(#${id}-warm)`} />
    </svg>
  )
}

// =============================================================
// STEP-IKONER (48x48) for "Sa funkar det"
// =============================================================

export function IconValjMall({ className }: IllustrationProps) {
  const id = 'st-vm'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Tre staplade mallar */}
      <rect x="9" y="14" width="12" height="20" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.2" transform="rotate(-7 15 24)" />
      <rect x="18" y="11" width="12" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="18" y="11" width="12" height="3" fill={`url(#${id}-warm)`} />
      <line x1="20" y1="17" x2="28" y2="17" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="20" y1="21" x2="28" y2="21" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="25" x2="28" y2="25" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <rect x="27" y="14" width="12" height="22" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.2" transform="rotate(7 33 25)" />
      {/* Vald-cirkel */}
      <circle cx="38" cy="38" r="6" fill={`url(#${id}-warm)`} />
      <path d="M35 38 L37 40 L41 36" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconFyllI({ className }: IllustrationProps) {
  const id = 'st-fy'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      <rect x="11" y="11" width="26" height="26" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      {/* Falt-rader */}
      <rect x="14" y="15" width="14" height="3" rx="1" fill="#CBD5E1" />
      <rect x="14" y="21" width="20" height="3" rx="1" fill="#CBD5E1" />
      <rect x="14" y="27" width="16" height="3" rx="1" fill={`url(#${id}-warm)`} opacity="0.85" />
      {/* Penna */}
      <g transform="rotate(40 36 14)">
        <rect x="34" y="11" width="3" height="14" rx="1" fill={`url(#${id}-deep)`} />
        <path d="M34 11 L37 11 L35.5 8 Z" fill="#1E293B" />
      </g>
    </svg>
  )
}

export function IconViFlyttar({ className }: IllustrationProps) {
  const id = 'st-vf'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Vanster - data */}
      <rect x="6" y="14" width="14" height="20" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.4" />
      <rect x="6" y="14" width="14" height="3" fill={`url(#${id}-warm)`} opacity="0.6" />
      <line x1="9" y1="22" x2="17" y2="22" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="26" x2="15" y2="26" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="30" x2="17" y2="30" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      {/* Pil */}
      <path d="M21 24 L27 24" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 21 L27 24 L24 27" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Hoger - mall ifylld */}
      <rect x="28" y="14" width="14" height="20" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="28" y="14" width="14" height="3" fill={`url(#${id}-warm)`} />
      <line x1="31" y1="22" x2="39" y2="22" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="31" y1="26" x2="37" y2="26" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="31" y1="30" x2="39" y2="30" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconLaddaNer({ className }: IllustrationProps) {
  const id = 'st-ln'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      <rect x="13" y="9" width="22" height="26" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="13" y="9" width="22" height="3" fill={`url(#${id}-warm)`} />
      <line x1="16" y1="17" x2="32" y2="17" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="22" x2="29" y2="22" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="27" x2="32" y2="27" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Download arrow */}
      <circle cx="24" cy="38" r="7" fill={`url(#${id}-warm)`} />
      <path d="M24 34 L24 41 M21 38 L24 41 L27 38" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// =============================================================
// FEATURE-IKONER (56x56) for "Vad du far"
// =============================================================

export function IconATSSakra({ className }: IllustrationProps) {
  const id = 'f-ats'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Skold */}
      <path
        d="M28 10 L42 16 L42 28 Q42 38 28 46 Q14 38 14 28 L14 16 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Check */}
      <path
        d="M22 28 L26 32 L34 22"
        stroke={`url(#${id}-deep)`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function IconExport({ className }: IllustrationProps) {
  const id = 'f-ex'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* PDF + Word-papper */}
      <rect x="11" y="14" width="16" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="11" y="14" width="16" height="4" fill={`url(#${id}-warm)`} />
      <text x="19" y="29" textAnchor="middle" fontSize="6" fontWeight="900" fill="#DC2626">PDF</text>
      <rect x="29" y="14" width="16" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="29" y="14" width="16" height="4" fill={`url(#${id}-deep)`} />
      <text x="37" y="29" textAnchor="middle" fontSize="6" fontWeight="900" fill="#DC2626">DOC</text>
      {/* Pil ner */}
      <path d="M28 42 L28 46 M25 43 L28 46 L31 43" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconFoto({ className }: IllustrationProps) {
  const id = 'f-fo'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Profilbild-ram */}
      <circle cx="28" cy="28" r="14" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <circle cx="28" cy="24" r="5" fill={`url(#${id}-warm)`} />
      <path d="M16 40 Q22 32 28 32 Q34 32 40 40" fill={`url(#${id}-warm)`} />
      {/* Plus-cirkel */}
      <circle cx="42" cy="42" r="6" fill={`url(#${id}-deep)`} />
      <path d="M42 39 L42 45 M39 42 L45 42" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconLinkedInFeature({ className }: IllustrationProps) {
  const id = 'f-li'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* "in"-blocket */}
      <rect x="11" y="14" width="34" height="28" rx="5" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <text x="28" y="33" textAnchor="middle" fontSize="14" fontWeight="900" fill={`url(#${id}-warm)`}>in</text>
      {/* Lank-symbol */}
      <circle cx="42" cy="42" r="6" fill={`url(#${id}-deep)`} />
      <path d="M40 42 L42 44 L45 41" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconEdit({ className }: IllustrationProps) {
  const id = 'f-ed'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      <rect x="11" y="14" width="26" height="28" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <line x1="14" y1="20" x2="32" y2="20" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="26" x2="28" y2="26" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="32" x2="30" y2="32" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Penna stor */}
      <g transform="rotate(45 42 22)">
        <rect x="40" y="14" width="4" height="22" rx="1" fill={`url(#${id}-warm)`} />
        <path d="M40 14 L44 14 L42 11 Z" fill="#1E293B" />
        <rect x="40" y="33" width="4" height="3" fill="#FBBF24" />
      </g>
    </svg>
  )
}

export function IconMobil({ className }: IllustrationProps) {
  const id = 'f-mo'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Telefon-ram */}
      <rect x="20" y="10" width="20" height="36" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <rect x="20" y="14" width="20" height="24" fill={`url(#${id}-soft)`} />
      <line x1="22" y1="20" x2="38" y2="20" stroke={`url(#${id}-warm)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="25" x2="34" y2="25" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="29" x2="36" y2="29" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="33" x2="32" y2="33" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Hem-knapp */}
      <circle cx="30" cy="42" r="1.5" fill={`url(#${id}-warm)`} />
    </svg>
  )
}

// =============================================================
// KATEGORI-IKONER (24x24) for filter-pills
// =============================================================

export function IconKategoriModern({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="3" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="2" />
      <line x1="7" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconKategoriTraditionell({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="16" x2="17" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconKategoriKreativ({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 5 L19 5 L19 19 L5 19 Z M5 5 L12 12 L19 5 M5 19 L12 12 L19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconKategoriAlla({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
    </svg>
  )
}
