/**
 * Custom SVG-illustrationer for /verktyg/skapa-cv landningssidan.
 * Hero (120x120) + 4 step-ikoner (48x48) + 6 feature-ikoner (56x56).
 * Stil: orange/rod-DNA med Defs-pattern.
 *
 * Namn: SkapaCvLandingIcons (inte SkapaCvIcons) for att inte krocka med
 * dashboard-mappens befintliga SkapaCvIcons.tsx.
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
// HERO (120x120) - CV-papper med pulserande "+"-cirkel som signalerar skapande
// =============================================================
export function SkapaCvHeroIcon({ className }: IllustrationProps) {
  const id = 'sk-hero'
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

      {/* Bakre lutat papper */}
      <g transform="translate(22 28) rotate(-6 24 32)">
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
        <rect x="0" y="0" width="44" height="5" fill={`url(#${id}-warm)`} opacity="0.6" />
      </g>

      {/* Framre CV som byggs */}
      <g transform="translate(30 24)">
        <rect
          x="0"
          y="0"
          width="50"
          height="68"
          rx="5"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1.6"
        />
        <rect x="0" y="0" width="50" height="6" fill={`url(#${id}-warm)`} />

        {/* Header */}
        <line x1="6" y1="14" x2="32" y2="14" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="6" y1="20" x2="24" y2="20" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />

        {/* Body */}
        <line x1="6" y1="30" x2="42" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="36" x2="38" y2="36" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="6" y="42" width="22" height="3" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.85" />
        <line x1="6" y1="50" x2="40" y2="50" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="56" x2="36" y2="56" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="62" x2="38" y2="62" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Stor "+"-cirkel som signalerar skapande */}
      <g transform="translate(82 72)">
        <circle cx="14" cy="14" r="16" fill={`url(#${id}-warm)`} />
        <circle cx="14" cy="14" r="20" fill="#F97316" opacity="0.18" />
        <line x1="14" y1="6" x2="14" y2="22" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="6" y1="14" x2="22" y2="14" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Pulserande prickar */}
      <circle cx="22" cy="32" r="3" fill={`url(#${id}-deep)`} />
      <circle cx="22" cy="32" r="5.5" fill="#BE185D" opacity="0.18" />

      <circle cx="100" cy="32" r="2.5" fill={`url(#${id}-warm)`} />
    </svg>
  )
}

// =============================================================
// STEP-IKONER (48x48) for "Sa funkar det"
// =============================================================

export function IconValjMall({ className }: IllustrationProps) {
  const id = 'sk-vm'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      <rect x="9" y="14" width="12" height="20" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.2" transform="rotate(-7 15 24)" />
      <rect x="18" y="11" width="12" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="18" y="11" width="12" height="3" fill={`url(#${id}-warm)`} />
      <line x1="20" y1="17" x2="28" y2="17" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="20" y1="21" x2="28" y2="21" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="25" x2="28" y2="25" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <rect x="27" y="14" width="12" height="22" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.2" transform="rotate(7 33 25)" />
      <circle cx="38" cy="38" r="6" fill={`url(#${id}-warm)`} />
      <path d="M35 38 L37 40 L41 36" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconFyllI({ className }: IllustrationProps) {
  const id = 'sk-fy'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Sju steg-prickar */}
      <circle cx="11" cy="14" r="2" fill={`url(#${id}-warm)`} />
      <circle cx="17" cy="14" r="2" fill={`url(#${id}-warm)`} />
      <circle cx="23" cy="14" r="2" fill={`url(#${id}-warm)`} />
      <circle cx="29" cy="14" r="2" fill={`url(#${id}-warm)`} opacity="0.6" />
      <circle cx="35" cy="14" r="2" fill="#FED7AA" />
      <circle cx="41" cy="14" r="2" fill="#FED7AA" />
      {/* Aktiv form */}
      <rect x="11" y="20" width="26" height="3" rx="1.5" fill="#1E293B" />
      <rect x="11" y="26" width="26" height="3" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.85" />
      <rect x="11" y="32" width="20" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="11" y="38" width="14" height="3" rx="1.5" fill="#CBD5E1" />
    </svg>
  )
}

export function IconViSatterIhop({ className }: IllustrationProps) {
  const id = 'sk-si'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Pussel-bitar som monteras */}
      <rect x="9" y="11" width="14" height="14" rx="2" fill={`url(#${id}-warm)`} opacity="0.85" />
      <rect x="25" y="11" width="14" height="14" rx="2" fill={`url(#${id}-deep)`} opacity="0.85" />
      <rect x="9" y="27" width="14" height="14" rx="2" fill={`url(#${id}-deep)`} opacity="0.85" />
      <rect x="25" y="27" width="14" height="14" rx="2" fill={`url(#${id}-warm)`} opacity="0.85" />
      {/* Center-cirkel */}
      <circle cx="24" cy="26" r="6" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="2" />
      <path d="M21 26 L23.5 28.5 L27.5 23" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconLaddaNer({ className }: IllustrationProps) {
  const id = 'sk-ln'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      <rect x="13" y="9" width="22" height="26" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="13" y="9" width="22" height="3" fill={`url(#${id}-warm)`} />
      <line x1="16" y1="17" x2="32" y2="17" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="22" x2="29" y2="22" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="27" x2="32" y2="27" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="24" cy="38" r="7" fill={`url(#${id}-warm)`} />
      <path d="M24 34 L24 41 M21 38 L24 41 L27 38" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// =============================================================
// FEATURE-IKONER (56x56) for "Vad du far"
// =============================================================

export function IconATSSakra({ className }: IllustrationProps) {
  const id = 'sk-ats'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      <path
        d="M28 10 L42 16 L42 28 Q42 38 28 46 Q14 38 14 28 L14 16 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2"
        strokeLinejoin="round"
      />
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

export function IconLivePreview({ className }: IllustrationProps) {
  const id = 'sk-lp'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Vanster: form */}
      <rect x="9" y="14" width="16" height="28" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="12" y="18" width="10" height="2.5" rx="1" fill="#CBD5E1" />
      <rect x="12" y="24" width="8" height="2.5" rx="1" fill="#CBD5E1" />
      <rect x="12" y="30" width="10" height="2.5" rx="1" fill={`url(#${id}-warm)`} opacity="0.85" />
      {/* Pil */}
      <line x1="26" y1="28" x2="30" y2="28" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
      <path d="M28 26 L30 28 L28 30" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Hoger: live preview */}
      <rect x="31" y="14" width="16" height="28" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="31" y="14" width="16" height="3" fill={`url(#${id}-warm)`} />
      <line x1="34" y1="22" x2="44" y2="22" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="27" x2="42" y2="27" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="34" y1="31" x2="44" y2="31" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="34" y1="35" x2="42" y2="35" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconAutoSave({ className }: IllustrationProps) {
  const id = 'sk-as'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Cirkular pil (refresh-pattern) */}
      <path
        d="M40 28 A12 12 0 1 1 28 16"
        stroke={`url(#${id}-warm)`}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M40 16 L40 22 L34 22" stroke={`url(#${id}-warm)`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Check inuti */}
      <circle cx="28" cy="28" r="6" fill={`url(#${id}-deep)`} />
      <path d="M25 28 L27 30 L31 26" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconExport({ className }: IllustrationProps) {
  const id = 'sk-ex'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      <rect x="11" y="14" width="16" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="11" y="14" width="16" height="4" fill={`url(#${id}-warm)`} />
      <text x="19" y="29" textAnchor="middle" fontSize="6" fontWeight="900" fill="#DC2626">PDF</text>
      <rect x="29" y="14" width="16" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="29" y="14" width="16" height="4" fill={`url(#${id}-deep)`} />
      <text x="37" y="29" textAnchor="middle" fontSize="6" fontWeight="900" fill="#DC2626">DOC</text>
      <path d="M28 42 L28 46 M25 43 L28 46 L31 43" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconImport({ className }: IllustrationProps) {
  const id = 'sk-im'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* LinkedIn-blocket */}
      <rect x="10" y="14" width="18" height="18" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <text x="19" y="27" textAnchor="middle" fontSize="10" fontWeight="900" fill={`url(#${id}-warm)`}>in</text>
      {/* Pil */}
      <line x1="30" y1="23" x2="38" y2="23" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35 20 L38 23 L35 26" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* CV */}
      <rect x="40" y="11" width="14" height="24" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="40" y="11" width="14" height="3" fill={`url(#${id}-deep)`} />
      <line x1="42" y1="18" x2="52" y2="18" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="42" y1="22" x2="50" y2="22" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="42" y1="26" x2="52" y2="26" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="42" y1="30" x2="48" y2="30" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconMobil({ className }: IllustrationProps) {
  const id = 'sk-mo'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      <rect x="20" y="10" width="20" height="36" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <rect x="20" y="14" width="20" height="24" fill={`url(#${id}-soft)`} />
      <line x1="22" y1="20" x2="38" y2="20" stroke={`url(#${id}-warm)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="25" x2="34" y2="25" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="29" x2="36" y2="29" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="33" x2="32" y2="33" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="30" cy="42" r="1.5" fill={`url(#${id}-warm)`} />
    </svg>
  )
}
