/**
 * Custom SVG-illustrationer for /verktyg/linkedin-optimering landningssidan.
 * Hero (120x120) + 3 varfor-ikoner (56x56) + 5 step-ikoner (48x48)
 * + 5 sektion-ikoner (56x56) = 14 ikoner totalt.
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
// HERO (120x120) - LinkedIn-profil-kort med score-cirkel + sokresultat
// =============================================================
export function LinkedinOptimeringHeroIcon({ className }: IllustrationProps) {
  const id = 'lo-hero'
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

      {/* Profilkort */}
      <rect x="22" y="28" width="58" height="62" rx="6" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      {/* Header-band */}
      <rect x="22" y="28" width="58" height="14" fill={`url(#${id}-warm)`} />
      {/* Avatar */}
      <circle cx="40" cy="46" r="8" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <circle cx="40" cy="44" r="3" fill={`url(#${id}-deep)`} />
      <path d="M 33 53 Q 33 49 40 49 Q 47 49 47 53" fill={`url(#${id}-deep)`} />
      {/* Headline-rad */}
      <rect x="52" y="48" width="24" height="3" rx="1.5" fill="#1E293B" />
      <rect x="52" y="54" width="20" height="2" rx="1" fill="#94A3B8" />
      {/* Sektioner */}
      <line x1="28" y1="64" x2="74" y2="64" stroke="#FED7AA" strokeWidth="1" />
      <rect x="28" y="68" width="44" height="2" rx="1" fill="#CBD5E1" />
      <rect x="28" y="73" width="40" height="2" rx="1" fill="#CBD5E1" />
      <rect x="28" y="78" width="44" height="2" rx="1" fill="#CBD5E1" />
      <rect x="28" y="83" width="36" height="2" rx="1" fill="#CBD5E1" />

      {/* Score-cirkel uppe till hoger */}
      <circle cx="92" cy="32" r="14" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
      <circle
        cx="92"
        cy="32"
        r="11"
        fill="none"
        stroke={`url(#${id}-warm)`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="69.1"
        strokeDashoffset="13"
        transform="rotate(-90 92 32)"
      />
      <text x="92" y="35" textAnchor="middle" fontSize="9" fontWeight="900" fill="#DC2626">87</text>

      {/* Sokresultat-pil */}
      <circle cx="20" cy="84" r="6" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <circle cx="20" cy="84" r="2.5" fill="none" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <line x1="22.5" y1="86.5" x2="26" y2="90" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
      {/* Pulse */}
      <circle cx="20" cy="84" r="11" fill="none" stroke="#DC2626" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

// =============================================================
// VARFOR-IKONER (56x56)
// =============================================================

export function IconKeywords({ className }: IllustrationProps) {
  const id = 'lo-kw'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Profilkort */}
      <rect x="11" y="13" width="34" height="30" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="11" y="13" width="34" height="6" fill={`url(#${id}-warm)`} />
      {/* Markerade keywords */}
      <rect x="14" y="22" width="10" height="3" rx="1.5" fill={`url(#${id}-warm)`} />
      <rect x="26" y="22" width="14" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="14" y="28" width="16" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="32" y="28" width="8" height="3" rx="1.5" fill={`url(#${id}-warm)`} />
      <rect x="14" y="34" width="12" height="3" rx="1.5" fill={`url(#${id}-warm)`} />
      <rect x="28" y="34" width="14" height="3" rx="1.5" fill="#CBD5E1" />
      {/* Forstoringsglas */}
      <circle cx="38" cy="40" r="7" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="2" />
      <circle cx="38" cy="40" r="3" fill="none" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <line x1="42.5" y1="44.5" x2="46" y2="48" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconHeadline({ className }: IllustrationProps) {
  const id = 'lo-hl'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tom headline (kort) */}
      <rect x="10" y="14" width="36" height="10" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
      <rect x="13" y="18" width="14" height="2" rx="1" fill="#CBD5E1" />
      <text x="46" y="21" textAnchor="end" fontSize="5" fontWeight="700" fill="#94A3B8">12 / 220</text>
      {/* Pil ner */}
      <line x1="28" y1="26" x2="28" y2="32" stroke={`url(#${id}-warm)`} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 25 30 L 28 33 L 31 30" stroke={`url(#${id}-warm)`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Optimerad headline (lang) */}
      <rect x="10" y="34" width="36" height="14" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="13" y="38" width="30" height="2.2" rx="1" fill={`url(#${id}-warm)`} />
      <rect x="13" y="42" width="26" height="2.2" rx="1" fill={`url(#${id}-warm)`} />
      <text x="46" y="48" textAnchor="end" fontSize="5" fontWeight="700" fill="#DC2626">187 / 220</text>
    </svg>
  )
}

export function IconFullstandighet({ className }: IllustrationProps) {
  const id = 'lo-fu'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Checklist */}
      <rect x="11" y="11" width="34" height="34" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      {/* Item 1 - check */}
      <circle cx="17" cy="19" r="2.5" fill={`url(#${id}-warm)`} />
      <path d="M 15.5 19 L 16.7 20.2 L 18.5 18" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="22" y1="19" x2="40" y2="19" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      {/* Item 2 - check */}
      <circle cx="17" cy="26" r="2.5" fill={`url(#${id}-warm)`} />
      <path d="M 15.5 26 L 16.7 27.2 L 18.5 25" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="22" y1="26" x2="38" y2="26" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      {/* Item 3 - check */}
      <circle cx="17" cy="33" r="2.5" fill={`url(#${id}-warm)`} />
      <path d="M 15.5 33 L 16.7 34.2 L 18.5 32" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="22" y1="33" x2="40" y2="33" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      {/* Item 4 - check */}
      <circle cx="17" cy="40" r="2.5" fill={`url(#${id}-warm)`} />
      <path d="M 15.5 40 L 16.7 41.2 L 18.5 39" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="22" y1="40" x2="36" y2="40" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      {/* All-Star badge */}
      <circle cx="44" cy="48" r="6" fill="url(#lo-fu-deep)" />
      <text x="44" y="50.5" textAnchor="middle" fontSize="6" fontWeight="900" fill="white">★</text>
    </svg>
  )
}

// =============================================================
// STEP-IKONER (48x48) - copy-paste-flode
// =============================================================

export function IconHamta({ className }: IllustrationProps) {
  const id = 'lo-ha'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* LinkedIn-profil */}
      <rect x="9" y="9" width="22" height="22" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="9" y="9" width="22" height="4" fill={`url(#${id}-warm)`} />
      <line x1="12" y1="17" x2="28" y2="17" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="21" x2="26" y2="21" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="25" x2="28" y2="25" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Pil ut till hoger */}
      <line x1="33" y1="20" x2="40" y2="20" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 37 17 L 40 20 L 37 23" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Klippbord */}
      <rect x="28" y="32" width="14" height="10" rx="2" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <line x1="31" y1="36" x2="39" y2="36" stroke="#CBD5E1" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="31" y1="39" x2="37" y2="39" stroke="#CBD5E1" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

export function IconKlistraIn({ className }: IllustrationProps) {
  const id = 'lo-ki'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Klippbord/textarea */}
      <rect x="11" y="9" width="26" height="30" rx="3" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="17" y="6" width="14" height="6" rx="1.5" fill={`url(#${id}-warm)`} />
      {/* Text */}
      <line x1="14" y1="17" x2="34" y2="17" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="21" x2="32" y2="21" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="25" x2="34" y2="25" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="29" x2="30" y2="29" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Plus-cirkel */}
      <circle cx="34" cy="34" r="6" fill={`url(#${id}-deep)`} />
      <line x1="34" y1="31" x2="34" y2="37" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="31" y1="34" x2="37" y2="34" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconOptimera({ className }: IllustrationProps) {
  const id = 'lo-op'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* 5 sektioner som optimeras parallellt */}
      <rect x="9" y="11" width="14" height="4" rx="1" fill={`url(#${id}-warm)`} opacity="0.9" />
      <rect x="25" y="11" width="14" height="4" rx="1" fill={`url(#${id}-warm)`} opacity="0.7" />
      <rect x="9" y="18" width="14" height="4" rx="1" fill={`url(#${id}-warm)`} opacity="0.85" />
      <rect x="25" y="18" width="14" height="4" rx="1" fill={`url(#${id}-deep)`} opacity="0.85" />
      <rect x="17" y="25" width="14" height="4" rx="1" fill={`url(#${id}-deep)`} />
      {/* Pil ner */}
      <line x1="24" y1="32" x2="24" y2="38" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
      <path d="M 21 35 L 24 38 L 27 35" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Slut: optimerad rad */}
      <rect x="9" y="40" width="30" height="4" rx="1" fill={`url(#${id}-warm)`} />
    </svg>
  )
}

export function IconJamfor({ className }: IllustrationProps) {
  const id = 'lo-ja'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Vanster kort - fore */}
      <rect x="6" y="13" width="14" height="22" rx="2" fill="white" stroke="#CBD5E1" strokeWidth="1.4" />
      <rect x="6" y="13" width="14" height="3" fill="#CBD5E1" />
      <line x1="9" y1="20" x2="17" y2="20" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="24" x2="16" y2="24" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="28" x2="17" y2="28" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      {/* Hoger kort - efter */}
      <rect x="28" y="13" width="14" height="22" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="28" y="13" width="14" height="3" fill={`url(#${id}-warm)`} />
      <line x1="31" y1="20" x2="39" y2="20" stroke={`url(#${id}-warm)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="31" y1="24" x2="38" y2="24" stroke={`url(#${id}-warm)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="31" y1="28" x2="40" y2="28" stroke={`url(#${id}-warm)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="31" y1="32" x2="37" y2="32" stroke={`url(#${id}-warm)`} strokeWidth="1.2" strokeLinecap="round" />
      {/* Pilar mellan */}
      <line x1="22" y1="22" x2="26" y2="22" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
      <path d="M 24 20 L 26 22 L 24 24" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Score-deltan */}
      <text x="14" y="42" textAnchor="middle" fontSize="6" fontWeight="900" fill="#94A3B8">41</text>
      <text x="35" y="42" textAnchor="middle" fontSize="6" fontWeight="900" fill="#DC2626">89</text>
    </svg>
  )
}

export function IconKlistraTillbaka({ className }: IllustrationProps) {
  const id = 'lo-kt'
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-soft)`} />
      {/* Klippbord */}
      <rect x="6" y="13" width="14" height="14" rx="2" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <line x1="9" y1="17" x2="17" y2="17" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="20" x2="15" y2="20" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="23" x2="17" y2="23" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      {/* Pil till hoger */}
      <line x1="22" y1="20" x2="28" y2="20" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 25 17 L 28 20 L 25 23" stroke={`url(#${id}-warm)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* LinkedIn-profil med check */}
      <rect x="30" y="13" width="14" height="22" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="30" y="13" width="14" height="4" fill={`url(#${id}-warm)`} />
      <line x1="33" y1="21" x2="41" y2="21" stroke={`url(#${id}-warm)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33" y1="25" x2="40" y2="25" stroke={`url(#${id}-warm)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33" y1="29" x2="41" y2="29" stroke={`url(#${id}-warm)`} strokeWidth="1.2" strokeLinecap="round" />
      {/* Check-cirkel */}
      <circle cx="37" cy="40" r="5" fill="#22C55E" />
      <path d="M 35 40 L 36.5 41.5 L 39 38.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// =============================================================
// SEKTION-IKONER (56x56)
// =============================================================

export function IconRubrik({ className }: IllustrationProps) {
  const id = 'lo-ru'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Stort H */}
      <rect x="14" y="16" width="3" height="24" rx="1" fill={`url(#${id}-warm)`} />
      <rect x="14" y="26" width="14" height="3" rx="1" fill={`url(#${id}-warm)`} />
      <rect x="25" y="16" width="3" height="24" rx="1" fill={`url(#${id}-warm)`} />
      {/* Tre rader bredvid */}
      <rect x="32" y="20" width="14" height="2.5" rx="1.2" fill="#CBD5E1" />
      <rect x="32" y="26" width="12" height="2.5" rx="1.2" fill={`url(#${id}-deep)`} />
      <rect x="32" y="32" width="14" height="2.5" rx="1.2" fill="#CBD5E1" />
      {/* 220-tecken-rakneverk */}
      <text x="28" y="46" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#DC2626">220 tecken</text>
    </svg>
  )
}

export function IconOmMig({ className }: IllustrationProps) {
  const id = 'lo-om'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Pratbubbla */}
      <path
        d="M 12 14 L 44 14 Q 46 14 46 16 L 46 36 Q 46 38 44 38 L 26 38 L 18 44 L 18 38 L 12 38 Q 10 38 10 36 L 10 16 Q 10 14 12 14 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.5"
      />
      {/* Stort I */}
      <circle cx="20" cy="20" r="2" fill={`url(#${id}-warm)`} />
      <rect x="18" y="23" width="4" height="11" rx="1" fill={`url(#${id}-warm)`} />
      {/* Text-rader */}
      <line x1="26" y1="22" x2="42" y2="22" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="27" x2="40" y2="27" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="32" x2="42" y2="32" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconErfarenhet({ className }: IllustrationProps) {
  const id = 'lo-er'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Vaska/portfolio */}
      <path
        d="M 14 22 L 14 40 Q 14 42 16 42 L 40 42 Q 42 42 42 40 L 42 22 Q 42 20 40 20 L 16 20 Q 14 20 14 22 Z"
        fill={`url(#${id}-warm)`}
      />
      {/* Handtag */}
      <path
        d="M 22 20 L 22 16 Q 22 14 24 14 L 32 14 Q 34 14 34 16 L 34 20"
        stroke={`url(#${id}-deep)`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Spann/lapp */}
      <rect x="20" y="26" width="16" height="12" rx="2" fill="white" />
      {/* Tre punkter (STAR-bullets) */}
      <circle cx="23" cy="30" r="1.2" fill={`url(#${id}-deep)`} />
      <line x1="26" y1="30" x2="33" y2="30" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="23" cy="34" r="1.2" fill={`url(#${id}-deep)`} />
      <line x1="26" y1="34" x2="32" y2="34" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function IconUtbildning({ className }: IllustrationProps) {
  const id = 'lo-ut'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Studenthatt */}
      <path d="M 28 14 L 46 22 L 28 30 L 10 22 Z" fill={`url(#${id}-deep)`} />
      <path d="M 28 14 L 46 22 L 28 30 L 10 22 Z" fill={`url(#${id}-warm)`} opacity="0.4" />
      {/* Bok under */}
      <path d="M 16 28 L 16 40 Q 22 38 28 40 Q 34 38 40 40 L 40 28 Q 34 26 28 28 Q 22 26 16 28 Z" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="28" y1="28" x2="28" y2="40" stroke={`url(#${id}-warm)`} strokeWidth="1.2" />
      {/* Tofs */}
      <line x1="40" y1="22" x2="42" y2="32" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <circle cx="42" cy="32" r="2" fill={`url(#${id}-warm)`} />
    </svg>
  )
}

export function IconKompetenser({ className }: IllustrationProps) {
  const id = 'lo-ko'
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tag-cluster */}
      <rect x="11" y="14" width="18" height="8" rx="4" fill={`url(#${id}-warm)`} />
      <rect x="31" y="14" width="14" height="8" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="11" y="24" width="14" height="8" rx="4" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <rect x="27" y="24" width="18" height="8" rx="4" fill={`url(#${id}-deep)`} />
      <rect x="14" y="34" width="16" height="8" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="32" y="34" width="12" height="8" rx="4" fill={`url(#${id}-warm)`} opacity="0.7" />
      {/* Sma prickar */}
      <circle cx="20" cy="18" r="1.2" fill="white" />
      <circle cx="36" cy="28" r="1.2" fill="white" />
    </svg>
  )
}
