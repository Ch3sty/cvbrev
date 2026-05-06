/**
 * Custom SVG-illustrationer for /verktyg/jobbcoachen landningssidan.
 * Hero (120x120) + 4 step-ikoner (48x48) + 6 amne-ikoner (56x56)
 * + 6 kall-ikoner (56x56) = 17 ikoner totalt.
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
// HERO (120x120) - Chat-bubbla med kall-prick
// =============================================================
export function JobbcoachenHeroIcon({ className }: IllustrationProps) {
  const id = 'jc-hero'
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

      {/* Stor chat-bubbla (svar) */}
      <g transform="translate(20 28)">
        <path
          d="M 6 0 L 74 0 Q 80 0 80 6 L 80 44 Q 80 50 74 50 L 26 50 L 16 60 L 16 50 L 6 50 Q 0 50 0 44 L 0 6 Q 0 0 6 0 Z"
          fill={`url(#${id}-warm)`}
        />
        {/* Avatar inuti bubblan */}
        <circle cx="14" cy="18" r="6" fill="white" opacity="0.95" />
        <circle cx="14" cy="16" r="2" fill="#DC2626" />
        <path d="M 10 22 Q 10 19 14 19 Q 18 19 18 22" fill="#DC2626" />
        {/* Text-rader */}
        <rect x="24" y="12" width="46" height="3" rx="1.5" fill="white" />
        <rect x="24" y="18" width="38" height="2.5" rx="1.25" fill="white" opacity="0.85" />
        <rect x="6" y="30" width="68" height="2.5" rx="1.25" fill="white" opacity="0.95" />
        <rect x="6" y="36" width="60" height="2.5" rx="1.25" fill="white" opacity="0.95" />
        <rect x="6" y="42" width="52" height="2.5" rx="1.25" fill="white" opacity="0.85" />
      </g>

      {/* Liten kall-pill */}
      <g transform="translate(76 18)">
        <rect x="0" y="0" width="32" height="14" rx="7" fill="white" stroke="#FB923C" strokeWidth="1.4" />
        <circle cx="6" cy="7" r="2" fill={`url(#${id}-deep)`} />
        <line x1="11" y1="5" x2="22" y2="5" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="11" y1="9" x2="19" y2="9" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Liten user-bubbla */}
      <g transform="translate(78 92)">
        <path
          d="M 4 0 L 28 0 Q 32 0 32 4 L 32 12 Q 32 16 28 16 L 12 16 L 6 22 L 6 16 L 4 16 Q 0 16 0 12 L 0 4 Q 0 0 4 0 Z"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1.5"
        />
        <line x1="6" y1="6" x2="22" y2="6" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="10" x2="18" y2="10" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Pulse-prickar */}
      <circle cx="20" cy="28" r="3" fill={`url(#${id}-warm)`} />
      <circle cx="20" cy="28" r="5.5" fill="#F97316" opacity="0.18" />
    </svg>
  )
}

// =============================================================
// STEP-IKONER (48x48) for "Sa funkar det"
// =============================================================

export function IconFraga({ className }: IllustrationProps) {
  const id = 'jc-fr'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Chat-bubbla */}
      <path
        d="M 10 12 L 36 12 Q 40 12 40 16 L 40 28 Q 40 32 36 32 L 22 32 L 16 38 L 16 32 L 12 32 Q 8 32 8 28 L 8 16 Q 8 12 12 12 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2"
      />
      {/* Fragetecken */}
      <text x="24" y="28" textAnchor="middle" fontSize="16" fontWeight="900" fill="url(#jc-fr-warm)">?</text>
    </svg>
  )
}

export function IconKalla({ className }: IllustrationProps) {
  const id = 'jc-ka'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Bok */}
      <path
        d="M 10 14 Q 10 12 12 12 L 22 12 Q 24 12 24 14 L 24 36 Q 24 34 22 34 L 12 34 Q 10 34 10 36 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.8"
      />
      <path
        d="M 24 14 Q 24 12 26 12 L 36 12 Q 38 12 38 14 L 38 36 Q 38 34 36 34 L 26 34 Q 24 34 24 36 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.8"
      />
      {/* Bok-rygg */}
      <line x1="24" y1="13" x2="24" y2="35" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      {/* Rader */}
      <line x1="13" y1="18" x2="21" y2="18" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="22" x2="20" y2="22" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="26" x2="21" y2="26" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="27" y1="18" x2="35" y2="18" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="27" y1="22" x2="34" y2="22" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bokmarke */}
      <path d="M 32 12 L 32 22 L 34 20 L 36 22 L 36 12 Z" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

export function IconSvar({ className }: IllustrationProps) {
  const id = 'jc-sv'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Chat-bubbla med kalla */}
      <path
        d="M 8 12 L 36 12 Q 40 12 40 16 L 40 28 Q 40 32 36 32 L 22 32 L 16 38 L 16 32 L 12 32 Q 8 32 8 28 Z"
        fill={`url(#${id}-warm)`}
      />
      {/* Text-rader */}
      <rect x="13" y="17" width="20" height="2" rx="1" fill="white" />
      <rect x="13" y="22" width="22" height="2" rx="1" fill="white" opacity="0.85" />
      <rect x="13" y="27" width="14" height="2" rx="1" fill="white" opacity="0.85" />
      {/* Kall-badge */}
      <circle cx="36" cy="16" r="6" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <text x="36" y="19" textAnchor="middle" fontSize="6" fontWeight="900" fill="#DC2626">1</text>
    </svg>
  )
}

export function IconFolja({ className }: IllustrationProps) {
  const id = 'jc-fo'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Tva chat-bubblor som speglar varandra */}
      <path
        d="M 6 10 L 26 10 Q 28 10 28 12 L 28 18 Q 28 20 26 20 L 14 20 L 10 24 L 10 20 L 8 20 Q 6 20 6 18 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.6"
      />
      <line x1="10" y1="14" x2="22" y2="14" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="17" x2="20" y2="17" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />

      <path
        d="M 22 28 L 40 28 Q 42 28 42 30 L 42 36 Q 42 38 40 38 L 30 38 L 26 42 L 26 38 L 24 38 Q 22 38 22 36 Z"
        fill={`url(#${id}-warm)`}
      />
      <line x1="26" y1="32" x2="38" y2="32" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="26" y1="35" x2="36" y2="35" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

// =============================================================
// AMNE-IKONER (56x56) for "Vad du kan fraga om"
// =============================================================

export function IconCvBrev({ className }: IllustrationProps) {
  const id = 'jc-cv'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* CV-blad */}
      <rect x="12" y="12" width="22" height="30" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="12" y="12" width="22" height="4" fill={`url(#${id}-warm)`} />
      <circle cx="18" cy="22" r="3" fill={`url(#${id}-warm)`} opacity="0.6" />
      <line x1="23" y1="21" x2="31" y2="21" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="23" y1="24" x2="29" y2="24" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="30" x2="32" y2="30" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="34" x2="29" y2="34" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="38" x2="32" y2="38" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Brev (overlapp) */}
      <rect x="30" y="22" width="16" height="22" rx="2" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <line x1="33" y1="28" x2="43" y2="28" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33" y1="32" x2="42" y2="32" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33" y1="36" x2="43" y2="36" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33" y1="40" x2="40" y2="40" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconLon({ className }: IllustrationProps) {
  const id = 'jc-lon'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Mynt-stack */}
      <ellipse cx="28" cy="42" rx="16" ry="4" fill={`url(#${id}-warm)`} />
      <rect x="12" y="32" width="32" height="10" fill={`url(#${id}-warm)`} />
      <ellipse cx="28" cy="32" rx="16" ry="4" fill={`url(#${id}-deep)`} />

      <ellipse cx="28" cy="28" rx="13" ry="3.5" fill={`url(#${id}-warm)`} />
      <rect x="15" y="20" width="26" height="8" fill={`url(#${id}-warm)`} />
      <ellipse cx="28" cy="20" rx="13" ry="3.5" fill={`url(#${id}-deep)`} />

      {/* Kr-tecken */}
      <text x="28" y="25" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">kr</text>
      {/* Pil upp */}
      <path d="M 36 14 L 40 10 L 44 14" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="40" y1="10" x2="40" y2="18" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconIntervju({ className }: IllustrationProps) {
  const id = 'jc-int'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tva personer som pratar */}
      <circle cx="20" cy="22" r="6" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.6" />
      <circle cx="20" cy="20" r="2.2" fill={`url(#${id}-warm)`} />
      <path d="M 13 30 Q 13 26 20 26 Q 27 26 27 30 L 27 38 L 13 38 Z" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.6" />

      <circle cx="38" cy="22" r="6" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.6" />
      <circle cx="38" cy="20" r="2.2" fill={`url(#${id}-deep)`} />
      <path d="M 31 30 Q 31 26 38 26 Q 45 26 45 30 L 45 38 L 31 38 Z" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.6" />

      {/* Pratbubbla mitten */}
      <ellipse cx="29" cy="14" rx="6" ry="4" fill={`url(#${id}-warm)`} />
      <circle cx="27" cy="14" r="0.8" fill="white" />
      <circle cx="29" cy="14" r="0.8" fill="white" />
      <circle cx="31" cy="14" r="0.8" fill="white" />
    </svg>
  )
}

export function IconArbetsratt({ className }: IllustrationProps) {
  const id = 'jc-ar'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Vagskal */}
      <rect x="27" y="14" width="2" height="28" fill={`url(#${id}-deep)`} rx="1" />
      <rect x="20" y="40" width="16" height="3" rx="1.5" fill={`url(#${id}-deep)`} />
      <line x1="14" y1="18" x2="42" y2="18" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
      {/* Vanster skal */}
      <path d="M 8 18 L 20 18 L 17 28 L 11 28 Z" fill={`url(#${id}-warm)`} />
      <ellipse cx="14" cy="28" rx="3.5" ry="1.2" fill={`url(#${id}-deep)`} />
      {/* Hoger skal */}
      <path d="M 36 18 L 48 18 L 45 28 L 39 28 Z" fill={`url(#${id}-warm)`} />
      <ellipse cx="42" cy="28" rx="3.5" ry="1.2" fill={`url(#${id}-deep)`} />
      {/* Topp */}
      <circle cx="28" cy="14" r="3" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

export function IconKarriarbyte({ className }: IllustrationProps) {
  const id = 'jc-kb'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Cirkulara pilar (transformation) */}
      <path
        d="M 28 12 A 16 16 0 0 1 44 28"
        stroke={`url(#${id}-warm)`}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 44 28 L 41 24 L 41 31 Z" fill="#DC2626" />

      <path
        d="M 28 44 A 16 16 0 0 1 12 28"
        stroke={`url(#${id}-deep)`}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 12 28 L 15 32 L 15 25 Z" fill="#BE185D" />

      {/* Mittprick */}
      <circle cx="28" cy="28" r="6" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <path d="M 25 28 L 27 30 L 31 26" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconAkassa({ className }: IllustrationProps) {
  const id = 'jc-ak'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Skold */}
      <path
        d="M 28 10 L 42 16 L 42 30 Q 42 40 28 46 Q 14 40 14 30 L 14 16 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2"
      />
      <path
        d="M 28 10 L 42 16 L 42 30 Q 42 40 28 46 Q 14 40 14 30 L 14 16 Z"
        fill={`url(#${id}-warm)`}
        opacity="0.15"
      />
      {/* Check */}
      <path
        d="M 21 28 L 26 33 L 35 22"
        stroke={`url(#${id}-deep)`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// =============================================================
// KALL-IKONER (56x56) for "Kallorna bakom svaren"
// =============================================================

export function IconArbetsformedlingen({ className }: IllustrationProps) {
  const id = 'jc-af'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Kontorsbyggnad */}
      <rect x="14" y="18" width="28" height="26" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.8" />
      <rect x="14" y="18" width="28" height="5" fill={`url(#${id}-warm)`} />
      {/* Fonster */}
      <rect x="18" y="26" width="5" height="5" rx="0.5" fill={`url(#${id}-warm)`} opacity="0.5" />
      <rect x="25.5" y="26" width="5" height="5" rx="0.5" fill={`url(#${id}-warm)`} opacity="0.5" />
      <rect x="33" y="26" width="5" height="5" rx="0.5" fill={`url(#${id}-warm)`} opacity="0.5" />
      <rect x="18" y="33" width="5" height="5" rx="0.5" fill={`url(#${id}-warm)`} opacity="0.5" />
      <rect x="33" y="33" width="5" height="5" rx="0.5" fill={`url(#${id}-warm)`} opacity="0.5" />
      {/* Dorr */}
      <rect x="25" y="33" width="6" height="11" rx="1" fill={`url(#${id}-deep)`} />
      {/* Flagga */}
      <line x1="28" y1="10" x2="28" y2="18" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <path d="M 28 10 L 36 12 L 28 14 Z" fill={`url(#${id}-warm)`} />
    </svg>
  )
}

export function IconScb({ className }: IllustrationProps) {
  const id = 'jc-scb'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Stapeldiagram */}
      <line x1="12" y1="42" x2="44" y2="42" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="14" y="30" width="6" height="12" rx="1" fill={`url(#${id}-warm)`} opacity="0.7" />
      <rect x="22" y="22" width="6" height="20" rx="1" fill={`url(#${id}-warm)`} />
      <rect x="30" y="26" width="6" height="16" rx="1" fill={`url(#${id}-deep)`} opacity="0.85" />
      <rect x="38" y="18" width="6" height="24" rx="1" fill={`url(#${id}-deep)`} />
      {/* Trendlinje */}
      <path d="M 17 30 L 25 22 L 33 26 L 41 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="41" cy="18" r="2" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
    </svg>
  )
}

export function IconFack({ className }: IllustrationProps) {
  const id = 'jc-fa'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tre personer i ring (kollektiv) */}
      <circle cx="28" cy="16" r="5" fill={`url(#${id}-warm)`} />
      <path d="M 22 24 Q 22 20 28 20 Q 34 20 34 24 L 34 28 L 22 28 Z" fill={`url(#${id}-warm)`} />

      <circle cx="16" cy="32" r="5" fill={`url(#${id}-deep)`} />
      <path d="M 10 40 Q 10 36 16 36 Q 22 36 22 40 L 22 44 L 10 44 Z" fill={`url(#${id}-deep)`} />

      <circle cx="40" cy="32" r="5" fill={`url(#${id}-deep)`} />
      <path d="M 34 40 Q 34 36 40 36 Q 46 36 46 40 L 46 44 L 34 44 Z" fill={`url(#${id}-deep)`} />

      {/* Forenade hander (mitten) */}
      <circle cx="28" cy="34" r="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
    </svg>
  )
}

export function IconForsakring({ className }: IllustrationProps) {
  const id = 'jc-fk'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Hand som halls under */}
      <path
        d="M 10 40 Q 10 32 18 32 L 38 32 Q 46 32 46 40 L 46 44 L 10 44 Z"
        fill={`url(#${id}-warm)`}
      />
      {/* Hjarta over */}
      <path
        d="M 28 28 C 24 24 18 24 18 18 C 18 14 22 12 25 14 C 26 15 27 16 28 17 C 29 16 30 15 31 14 C 34 12 38 14 38 18 C 38 24 32 24 28 28 Z"
        fill={`url(#${id}-deep)`}
      />
    </svg>
  )
}

export function IconCsn({ className }: IllustrationProps) {
  const id = 'jc-csn'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Studenthatt */}
      <path d="M 28 14 L 46 22 L 28 30 L 10 22 Z" fill={`url(#${id}-deep)`} />
      <path d="M 28 14 L 46 22 L 28 30 L 10 22 Z" fill={`url(#${id}-warm)`} opacity="0.4" />
      {/* Bok under hatten */}
      <path d="M 16 28 L 16 40 Q 22 38 28 40 Q 34 38 40 40 L 40 28 Q 34 26 28 28 Q 22 26 16 28 Z" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="28" y1="28" x2="28" y2="40" stroke={`url(#${id}-warm)`} strokeWidth="1.2" />
      {/* Tofs */}
      <line x1="40" y1="22" x2="42" y2="32" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <circle cx="42" cy="32" r="2" fill={`url(#${id}-warm)`} />
    </svg>
  )
}

export function IconSkatteverket({ className }: IllustrationProps) {
  const id = 'jc-sk'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Dokument */}
      <rect x="14" y="12" width="28" height="34" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.8" />
      <rect x="14" y="12" width="28" height="5" fill={`url(#${id}-warm)`} />
      {/* % stamp */}
      <circle cx="28" cy="28" r="9" fill="none" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeDasharray="3 1.5" />
      <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="900" fill="#BE185D">%</text>
      {/* Rader */}
      <line x1="18" y1="40" x2="38" y2="40" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="43" x2="34" y2="43" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
