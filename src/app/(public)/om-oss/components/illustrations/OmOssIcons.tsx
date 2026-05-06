/**
 * Custom SVG-illustrationer for /om-oss landningssidan.
 * Hero (120x120) + 4 milstolpe (48x48) + 3 princip (56x56) + 5 plattform (56x56)
 * + 4 sverige (56x56) = 17 ikoner totalt.
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
// HERO (120x120) - Karriar-resa: vag uppat med Sverige-koppling
// =============================================================
export function OmOssHeroIcon({ className }: IllustrationProps) {
  const id = 'oo-hero'
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

      {/* Diagonalt vag uppat */}
      <path
        d="M 16 92 Q 30 76 46 70 Q 62 64 70 52 Q 78 40 88 28"
        stroke={`url(#${id}-warm)`}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Stoppunkter pa vagen */}
      <circle cx="16" cy="92" r="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <circle cx="46" cy="70" r="3.5" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <circle cx="70" cy="52" r="3.5" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="2" />

      {/* Mal-flagga */}
      <line x1="88" y1="28" x2="88" y2="46" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M 88 28 L 102 32 L 88 38 Z"
        fill={`url(#${id}-warm)`}
      />
      <circle cx="88" cy="46" r="3" fill={`url(#${id}-deep)`} />

      {/* Sverige-symbol (flagg-kors i sista cirkeln) */}
      <line x1="84" y1="33" x2="98" y2="33" stroke="white" strokeWidth="0.8" />
      <line x1="91" y1="29" x2="91" y2="37" stroke="white" strokeWidth="0.8" />

      {/* Pulse-cirkel runt malet */}
      <circle cx="88" cy="32" r="14" fill="none" stroke="#DC2626" strokeWidth="1" opacity="0.3" />

      {/* Person-punkt vid start */}
      <circle cx="16" cy="84" r="2.2" fill={`url(#${id}-deep)`} />
      <path d="M 11 92 Q 11 88 16 88 Q 21 88 21 92" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

// =============================================================
// MILSTOLPE-IKONER (48x48)
// =============================================================

export function IconStart({ className }: IllustrationProps) {
  const id = 'oo-st'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Pennspets (cvbrev-arvet) */}
      <path d="M 14 36 L 14 30 L 30 14 L 36 20 L 20 36 Z" fill={`url(#${id}-warm)`} />
      <path d="M 30 14 L 36 20 L 38 18 L 32 12 Z" fill={`url(#${id}-deep)`} />
      <path d="M 14 36 L 18 36 L 14 32 Z" fill="#1E293B" />
      {/* Brev-rad */}
      <line x1="14" y1="40" x2="34" y2="40" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconInsikt({ className }: IllustrationProps) {
  const id = 'oo-in'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Glodlampa */}
      <path
        d="M 24 12 Q 32 12 32 20 Q 32 25 28 28 L 28 32 L 20 32 L 20 28 Q 16 25 16 20 Q 16 12 24 12 Z"
        fill={`url(#${id}-warm)`}
      />
      <rect x="20" y="33" width="8" height="2" rx="1" fill={`url(#${id}-deep)`} />
      <rect x="21" y="36" width="6" height="2" rx="1" fill={`url(#${id}-deep)`} />
      {/* Stralar */}
      <line x1="24" y1="6" x2="24" y2="9" stroke={`url(#${id}-deep)`} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="36" y1="14" x2="38" y2="12" stroke={`url(#${id}-deep)`} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="14" x2="10" y2="12" stroke={`url(#${id}-deep)`} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="38" y1="22" x2="41" y2="22" stroke={`url(#${id}-deep)`} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="10" y1="22" x2="7" y2="22" stroke={`url(#${id}-deep)`} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconNamnbyte({ className }: IllustrationProps) {
  const id = 'oo-nb'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Tva cirklar med pil mellan (transformation) */}
      <circle cx="14" cy="24" r="7" fill="white" stroke="#94A3B8" strokeWidth="1.5" />
      <text x="14" y="27" textAnchor="middle" fontSize="8" fontWeight="900" fill="#94A3B8">cv</text>

      <line x1="22" y1="24" x2="28" y2="24" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
      <path d="M 25 21 L 28 24 L 25 27" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      <circle cx="34" cy="24" r="7" fill={`url(#${id}-warm)`} />
      <text x="34" y="27" textAnchor="middle" fontSize="8" fontWeight="900" fill="white">jc</text>
    </svg>
  )
}

export function IconLansering({ className }: IllustrationProps) {
  const id = 'oo-la'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Raket */}
      <path
        d="M 24 8 Q 30 14 30 24 L 30 32 L 18 32 L 18 24 Q 18 14 24 8 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.8"
      />
      <circle cx="24" cy="20" r="3" fill={`url(#${id}-warm)`} />
      <path d="M 18 32 L 14 38 L 18 36 Z" fill={`url(#${id}-warm)`} />
      <path d="M 30 32 L 34 38 L 30 36 Z" fill={`url(#${id}-warm)`} />
      {/* Eldslagor */}
      <path d="M 21 32 L 21 38 Q 22 41 24 42 Q 26 41 27 38 L 27 32 Z" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

// =============================================================
// PRINCIP-IKONER (56x56)
// =============================================================

export function IconKontroll({ className }: IllustrationProps) {
  const id = 'oo-ko'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Las-kropp */}
      <rect x="16" y="26" width="24" height="20" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      {/* Las-bygel */}
      <path
        d="M 21 26 L 21 18 Q 21 12 28 12 Q 35 12 35 18 L 35 26"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Nyckelhal */}
      <circle cx="28" cy="34" r="3" fill={`url(#${id}-deep)`} />
      <rect x="27" y="36" width="2" height="6" rx="0.5" fill={`url(#${id}-deep)`} />
      {/* Hand som haller nyckel (hint av kontroll) */}
      <circle cx="42" cy="36" r="3.5" fill={`url(#${id}-deep)`} />
      <line x1="42" y1="36" x2="48" y2="36" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconKallor({ className }: IllustrationProps) {
  const id = 'oo-ka'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tre dokument-stack */}
      <rect x="14" y="14" width="22" height="28" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.4" transform="rotate(-6 25 28)" />
      <rect x="17" y="13" width="22" height="28" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.4" />
      <rect x="20" y="12" width="22" height="28" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.8" />
      <rect x="20" y="12" width="22" height="5" fill={`url(#${id}-warm)`} />
      <line x1="23" y1="22" x2="38" y2="22" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="23" y1="26" x2="36" y2="26" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="23" y1="30" x2="38" y2="30" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="23" y1="34" x2="34" y2="34" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Verifierad-check */}
      <circle cx="40" cy="42" r="6" fill={`url(#${id}-deep)`} />
      <path d="M 37.5 42 L 39.5 44 L 43 40.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconUtanKort({ className }: IllustrationProps) {
  const id = 'oo-uk'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Kort med overstreck */}
      <rect x="12" y="20" width="32" height="20" rx="3" fill="white" stroke="#94A3B8" strokeWidth="1.5" />
      <rect x="12" y="20" width="32" height="5" fill="#CBD5E1" />
      <rect x="15" y="29" width="10" height="4" rx="1" fill="#CBD5E1" />
      <line x1="15" y1="36" x2="28" y2="36" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Stor X over kortet */}
      <line x1="10" y1="14" x2="46" y2="46" stroke={`url(#${id}-deep)`} strokeWidth="3.5" strokeLinecap="round" />
      {/* Check-cirkel intill */}
      <circle cx="42" cy="14" r="6" fill={`url(#${id}-warm)`} />
      <path d="M 39.5 14 L 41.5 16 L 45 12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// =============================================================
// PLATTFORM-IKONER (56x56) - Sa hjalper plattformen dig
// =============================================================

export function IconAnsokning({ className }: IllustrationProps) {
  const id = 'oo-an'
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
    </svg>
  )
}

export function IconHittaJobb({ className }: IllustrationProps) {
  const id = 'oo-hj'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tre jobb-kort i list */}
      <rect x="12" y="12" width="32" height="9" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.4" />
      <circle cx="17" cy="16.5" r="2.5" fill={`url(#${id}-warm)`} />
      <line x1="22" y1="15.5" x2="34" y2="15.5" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="22" y1="18" x2="30" y2="18" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />

      <rect x="12" y="23.5" width="32" height="9" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.6" />
      <circle cx="17" cy="28" r="2.5" fill={`url(#${id}-deep)`} />
      <line x1="22" y1="27" x2="34" y2="27" stroke={`url(#${id}-warm)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="29.5" x2="30" y2="29.5" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      {/* Match-procent */}
      <circle cx="40" cy="28" r="3" fill={`url(#${id}-deep)`} />
      <text x="40" y="29.5" textAnchor="middle" fontSize="3.5" fontWeight="900" fill="white">94</text>

      <rect x="12" y="35" width="32" height="9" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.4" />
      <circle cx="17" cy="39.5" r="2.5" fill={`url(#${id}-warm)`} />
      <line x1="22" y1="38.5" x2="32" y2="38.5" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="22" y1="41" x2="28" y2="41" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function IconKarriarSvar({ className }: IllustrationProps) {
  const id = 'oo-ks'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Stor chat-bubbla */}
      <path
        d="M 12 14 L 44 14 Q 46 14 46 16 L 46 34 Q 46 36 44 36 L 24 36 L 16 42 L 16 36 L 12 36 Q 10 36 10 34 L 10 16 Q 10 14 12 14 Z"
        fill={`url(#${id}-warm)`}
      />
      {/* Avatar */}
      <circle cx="18" cy="22" r="4" fill="white" />
      <circle cx="18" cy="20" r="1.5" fill={`url(#${id}-deep)`} />
      <path d="M 14 26 Q 14 23 18 23 Q 22 23 22 26" fill={`url(#${id}-deep)`} />
      {/* Text-rader */}
      <line x1="26" y1="20" x2="42" y2="20" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="24" x2="40" y2="24" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      {/* Kall-badge */}
      <rect x="14" y="29" width="14" height="4" rx="2" fill="white" />
      <text x="21" y="32" textAnchor="middle" fontSize="3" fontWeight="900" fill="#DC2626">SCB</text>
    </svg>
  )
}

export function IconRekryteringstester({ className }: IllustrationProps) {
  const id = 'oo-rt'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* 3x3 grid */}
      <rect x="14" y="14" width="28" height="28" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="14" y1="23.3" x2="42" y2="23.3" stroke="#FED7AA" strokeWidth="1" />
      <line x1="14" y1="32.6" x2="42" y2="32.6" stroke="#FED7AA" strokeWidth="1" />
      <line x1="23.3" y1="14" x2="23.3" y2="42" stroke="#FED7AA" strokeWidth="1" />
      <line x1="32.6" y1="14" x2="32.6" y2="42" stroke="#FED7AA" strokeWidth="1" />
      {/* Forms (rotation-progression) */}
      <circle cx="18.6" cy="18.6" r="2" fill={`url(#${id}-warm)`} />
      <circle cx="28" cy="18.6" r="2" fill={`url(#${id}-warm)`} opacity="0.7" />
      <circle cx="37.3" cy="18.6" r="2" fill={`url(#${id}-warm)`} opacity="0.4" />
      <rect x="16.5" y="26.5" width="4" height="4" fill={`url(#${id}-deep)`} opacity="0.55" />
      <rect x="26" y="26.5" width="4" height="4" fill={`url(#${id}-deep)`} opacity="0.75" />
      <rect x="35.3" y="26.5" width="4" height="4" fill={`url(#${id}-deep)`} />
      <path d="M 18.6 39 L 16.5 35 L 20.7 35 Z" fill={`url(#${id}-warm)`} opacity="0.7" />
      <path d="M 28 39 L 26 35 L 30 35 Z" fill={`url(#${id}-warm)`} opacity="0.85" />
      <text x="37.3" y="40" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="url(#oo-rt-deep)">?</text>
    </svg>
  )
}

export function IconLinkedin({ className }: IllustrationProps) {
  const id = 'oo-li'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Profil-kort */}
      <rect x="11" y="14" width="34" height="28" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="11" y="14" width="34" height="6" fill={`url(#${id}-warm)`} />
      {/* Avatar */}
      <circle cx="20" cy="25" r="4" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <circle cx="20" cy="24" r="1.4" fill={`url(#${id}-deep)`} />
      <path d="M 17 28.5 Q 17 26.5 20 26.5 Q 23 26.5 23 28.5" fill={`url(#${id}-deep)`} />
      {/* Headline */}
      <line x1="27" y1="24" x2="42" y2="24" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="27" x2="38" y2="27" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      {/* Score-cirkel */}
      <circle cx="38" cy="36" r="4.5" fill="white" stroke="#FED7AA" strokeWidth="1.2" />
      <circle
        cx="38"
        cy="36"
        r="3.5"
        fill="none"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="22"
        strokeDashoffset="3"
        transform="rotate(-90 38 36)"
      />
      <text x="38" y="37.5" textAnchor="middle" fontSize="4" fontWeight="900" fill="#DC2626">87</text>
      {/* Section-rader */}
      <line x1="14" y1="34" x2="30" y2="34" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="37.5" x2="28" y2="37.5" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

// =============================================================
// SVERIGE-IKONER (56x56)
// =============================================================

export function IconSvenskaKallor({ className }: IllustrationProps) {
  const id = 'oo-sk'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Sverige-konturen (forenklad) */}
      <path
        d="M 20 12 Q 18 14 18 18 L 18 26 Q 16 28 16 32 L 16 38 Q 16 42 20 44 L 26 44 L 28 40 L 28 36 L 32 34 L 32 30 L 36 28 L 36 22 L 32 18 L 28 14 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.8"
      />
      {/* Skandinaviskt kors */}
      <line x1="18" y1="27" x2="36" y2="27" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="14" x2="24" y2="42" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" />
      {/* Dokument-overlay */}
      <rect x="36" y="34" width="12" height="14" rx="2" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <line x1="38" y1="38" x2="46" y2="38" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="38" y1="41" x2="44" y2="41" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="38" y1="44" x2="46" y2="44" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function IconGDPR({ className }: IllustrationProps) {
  const id = 'oo-gd'
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
      {/* EU-stjarnor (3 stycken som hint) */}
      <text x="28" y="25" textAnchor="middle" fontSize="6" fill="#DC2626">★</text>
      <text x="22" y="32" textAnchor="middle" fontSize="6" fill="#DC2626">★</text>
      <text x="34" y="32" textAnchor="middle" fontSize="6" fill="#DC2626">★</text>
      {/* Las-symbol nederst */}
      <rect x="24" y="36" width="8" height="6" rx="1" fill={`url(#${id}-deep)`} />
      <path d="M 25.5 36 L 25.5 33 Q 25.5 31 28 31 Q 30.5 31 30.5 33 L 30.5 36" stroke={`url(#${id}-deep)`} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function IconSvenskTon({ className }: IllustrationProps) {
  const id = 'oo-sv'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Pratbubbla med svenskt A med ring */}
      <path
        d="M 12 14 L 44 14 Q 46 14 46 16 L 46 36 Q 46 38 44 38 L 26 38 L 18 44 L 18 38 L 12 38 Q 10 38 10 36 L 10 16 Q 10 14 12 14 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.8"
      />
      {/* A-tecken (stort, med ring ovanfor) */}
      <circle cx="22" cy="20" r="2" fill="none" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <path
        d="M 18 32 L 22 23 L 26 32 M 19.5 28 L 24.5 28"
        stroke={`url(#${id}-warm)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* "ai"-bokstav till hoger */}
      <path
        d="M 30 32 L 32 26 L 34 32 M 31 30 L 33 30"
        stroke={`url(#${id}-deep)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="38" y1="26" x2="38" y2="32" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="23" r="0.8" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

export function IconUppdaterat({ className }: IllustrationProps) {
  const id = 'oo-up'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Cirkular pil */}
      <path
        d="M 28 14 A 14 14 0 0 1 42 28"
        stroke={`url(#${id}-warm)`}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 42 28 L 39 24 L 39 31 Z" fill="#DC2626" />
      <path
        d="M 28 42 A 14 14 0 0 1 14 28"
        stroke={`url(#${id}-deep)`}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 14 28 L 17 32 L 17 25 Z" fill="#BE185D" />
      {/* Mittkalender */}
      <rect x="22" y="22" width="12" height="12" rx="1.5" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="22" y1="25" x2="34" y2="25" stroke={`url(#${id}-warm)`} strokeWidth="1.2" />
      <circle cx="26" cy="29.5" r="0.8" fill={`url(#${id}-warm)`} />
      <circle cx="30" cy="29.5" r="0.8" fill={`url(#${id}-warm)`} />
      <circle cx="26" cy="32" r="0.8" fill={`url(#${id}-warm)`} />
      <circle cx="30" cy="32" r="0.8" fill={`url(#${id}-deep)`} />
    </svg>
  )
}
