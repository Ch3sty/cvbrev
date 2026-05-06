/**
 * Custom SVG-illustrationer for onboarding-flodet.
 * 8 ikoner i orange/rod-DNA med Defs-pattern (warm/deep/soft).
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
// HERO (160x160) - abstrakt journey: stege/trappa upp till mal
// =============================================================
export function OnboardingHeroIllustration({ className }: IllustrationProps) {
  const id = 'ob-hero'
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <circle cx="80" cy="80" r="72" fill={`url(#${id}-soft)`} opacity="0.7" />

      {/* Tre trapppinnar (steg 1, 2, 3) */}
      <rect x="28" y="108" width="32" height="20" rx="3" fill={`url(#${id}-warm)`} opacity="0.7" />
      <rect x="64" y="84" width="32" height="44" rx="3" fill={`url(#${id}-warm)`} />
      <rect x="100" y="60" width="32" height="68" rx="3" fill={`url(#${id}-deep)`} />

      {/* Bock pa forsta steget */}
      <circle cx="44" cy="118" r="6" fill="white" />
      <path d="M 41 118 L 43 120 L 47 116" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Pulserande prick pa nuvarande steg */}
      <circle cx="80" cy="94" r="6" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <circle cx="80" cy="94" r="11" fill={`url(#${id}-warm)`} opacity="0.2" />

      {/* Mal-flagga pa toppen */}
      <line x1="116" y1="40" x2="116" y2="60" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 116 40 L 132 44 L 116 50 Z" fill={`url(#${id}-warm)`} />
      {/* Pulse runt mal */}
      <circle cx="116" cy="48" r="14" fill="none" stroke="#DC2626" strokeWidth="1" opacity="0.3" />

      {/* Stjarna ovanfor */}
      <path
        d="M 60 30 L 62 36 L 68 36 L 63 40 L 65 46 L 60 42 L 55 46 L 57 40 L 52 36 L 58 36 Z"
        fill={`url(#${id}-warm)`}
        opacity="0.8"
      />
    </svg>
  )
}

// =============================================================
// STEP 1 (96x96) - CV-blad med extraheringspilar
// =============================================================
export function OnboardingStep1Cv({ className }: IllustrationProps) {
  const id = 'ob-s1'
  return (
    <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <circle cx="48" cy="48" r="42" fill={`url(#${id}-soft)`} opacity="0.6" />

      {/* CV-blad */}
      <rect x="22" y="20" width="36" height="56" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <rect x="22" y="20" width="36" height="8" fill={`url(#${id}-warm)`} />

      {/* Avatar */}
      <circle cx="32" cy="38" r="4" fill={`url(#${id}-warm)`} opacity="0.7" />

      {/* Text-rader */}
      <line x1="38" y1="36" x2="54" y2="36" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="38" y1="40" x2="50" y2="40" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="50" x2="54" y2="50" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="54" x2="48" y2="54" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="58" x2="54" y2="58" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="62" x2="46" y2="62" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="66" x2="54" y2="66" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />

      {/* Upload-pil ovanfor */}
      <line x1="68" y1="36" x2="76" y2="28" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 76 28 L 73 30 M 76 28 L 78 31" stroke={`url(#${id}-deep)`} strokeWidth="2.5" strokeLinecap="round" />

      {/* Glow vid hornet */}
      <circle cx="74" cy="30" r="10" fill={`url(#${id}-deep)`} opacity="0.15" />
    </svg>
  )
}

// =============================================================
// STEP 2 (96x96) - Brev som genereras
// =============================================================
export function OnboardingStep2Brev({ className }: IllustrationProps) {
  const id = 'ob-s2'
  return (
    <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <circle cx="48" cy="48" r="42" fill={`url(#${id}-soft)`} opacity="0.6" />

      {/* Brev (lutat) */}
      <g transform="rotate(-4 48 48)">
        <rect x="20" y="22" width="56" height="48" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
        <rect x="20" y="22" width="56" height="6" fill={`url(#${id}-warm)`} />
        {/* Text-rader */}
        <line x1="26" y1="36" x2="48" y2="36" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="26" y1="42" x2="68" y2="42" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="26" y1="47" x2="64" y2="47" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="26" y1="52" x2="68" y2="52" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="26" y1="57" x2="60" y2="57" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="26" y1="62" x2="56" y2="62" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Generations-prickar (motion-streck) */}
      <circle cx="80" cy="22" r="2.5" fill={`url(#${id}-deep)`} />
      <circle cx="86" cy="28" r="2" fill={`url(#${id}-warm)`} opacity="0.7" />
      <circle cx="78" cy="32" r="1.8" fill={`url(#${id}-warm)`} opacity="0.5" />

      {/* Stjarn-spark for "magisk" generering */}
      <path
        d="M 16 30 L 17.5 33 L 21 34 L 17.5 35 L 16 38 L 14.5 35 L 11 34 L 14.5 33 Z"
        fill={`url(#${id}-warm)`}
      />
    </svg>
  )
}

// =============================================================
// STEP 3 (96x96) - CV-analys med score-cirkel
// =============================================================
export function OnboardingStep3Analys({ className }: IllustrationProps) {
  const id = 'ob-s3'
  return (
    <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <circle cx="48" cy="48" r="42" fill={`url(#${id}-soft)`} opacity="0.6" />

      {/* CV-blad i bakgrunden (mindre, lutat) */}
      <g transform="rotate(-8 36 50)">
        <rect x="18" y="24" width="32" height="48" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" opacity="0.85" />
        <rect x="18" y="24" width="32" height="5" fill={`url(#${id}-warm)`} opacity="0.85" />
        <line x1="22" y1="36" x2="44" y2="36" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="40" x2="40" y2="40" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="44" x2="44" y2="44" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="48" x2="38" y2="48" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="52" x2="44" y2="52" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="56" x2="36" y2="56" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Score-cirkel framtill */}
      <circle cx="60" cy="56" r="20" fill="white" stroke="#FED7AA" strokeWidth="2" />
      <circle
        cx="60"
        cy="56"
        r="17"
        fill="none"
        stroke={`url(#${id}-warm)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="107"
        strokeDashoffset="20"
        transform="rotate(-90 60 56)"
      />
      <text x="60" y="60" textAnchor="middle" fontSize="13" fontWeight="900" fill="#DC2626">87</text>

      {/* Sparkles */}
      <circle cx="76" cy="34" r="2" fill={`url(#${id}-deep)`} />
      <circle cx="82" cy="40" r="1.5" fill={`url(#${id}-warm)`} opacity="0.7" />
    </svg>
  )
}

// =============================================================
// TROFE (120x120) - reward
// =============================================================
export function OnboardingTrofe({ className }: IllustrationProps) {
  const id = 'ob-tr'
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <circle cx="60" cy="60" r="54" fill={`url(#${id}-soft)`} opacity="0.7" />

      {/* Trofé-skål */}
      <path
        d="M 36 32 L 84 32 L 80 56 Q 78 70 60 70 Q 42 70 40 56 Z"
        fill={`url(#${id}-warm)`}
      />
      {/* Vänster handtag */}
      <path
        d="M 36 36 Q 24 36 24 48 Q 24 58 36 58"
        stroke={`url(#${id}-deep)`}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Höger handtag */}
      <path
        d="M 84 36 Q 96 36 96 48 Q 96 58 84 58"
        stroke={`url(#${id}-deep)`}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Stjärna i mitten */}
      <path
        d="M 60 42 L 63 50 L 71 50 L 64 55 L 67 63 L 60 58 L 53 63 L 56 55 L 49 50 L 57 50 Z"
        fill="white"
      />

      {/* Stam */}
      <rect x="54" y="70" width="12" height="14" fill={`url(#${id}-deep)`} />
      {/* Bas */}
      <rect x="40" y="84" width="40" height="8" rx="2" fill={`url(#${id}-deep)`} />
      <rect x="36" y="90" width="48" height="6" rx="2" fill={`url(#${id}-warm)`} />

      {/* Sparkles */}
      <path d="M 24 24 L 26 28 L 30 30 L 26 32 L 24 36 L 22 32 L 18 30 L 22 28 Z" fill={`url(#${id}-warm)`} opacity="0.8" />
      <path d="M 96 22 L 98 26 L 102 28 L 98 30 L 96 34 L 94 30 L 90 28 L 94 26 Z" fill={`url(#${id}-deep)`} opacity="0.8" />
      <circle cx="20" cy="60" r="2" fill={`url(#${id}-warm)`} />
      <circle cx="100" cy="68" r="2" fill={`url(#${id}-deep)`} />
    </svg>
  )
}

// =============================================================
// JOBBMATCH (80x80) - dag-2-kort
// =============================================================
export function OnboardingJobbmatch({ className }: IllustrationProps) {
  const id = 'ob-jm'
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="76" height="76" rx="20" fill={`url(#${id}-soft)`} opacity="0.6" />

      {/* Magnet (U-form) */}
      <g transform="translate(20 22)">
        <path d="M 0 0 L 0 18 Q 0 28 10 28 L 14 28 L 14 20 L 10 20 Q 8 20 8 18 L 8 0 Z" fill={`url(#${id}-warm)`} />
        <path d="M 28 0 L 28 18 Q 28 28 18 28 L 14 28 L 14 20 L 18 20 Q 20 20 20 18 L 20 0 Z" fill={`url(#${id}-deep)`} />
        <rect x="0" y="0" width="8" height="4" fill="white" />
        <rect x="20" y="0" width="8" height="4" fill="white" />
      </g>

      {/* Jobb-kort som dras in */}
      <rect x="50" y="22" width="14" height="10" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.4" />
      <line x1="52" y1="26" x2="60" y2="26" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" />
      <circle cx="61" cy="29" r="2" fill={`url(#${id}-warm)`} />
      <text x="61" y="30.5" textAnchor="middle" fontSize="2.5" fontWeight="900" fill="white">94</text>

      {/* Pulse */}
      <circle cx="40" cy="50" r="3" fill={`url(#${id}-warm)`} />
      <circle cx="40" cy="50" r="6" fill="#F97316" opacity="0.2" />
    </svg>
  )
}

// =============================================================
// LINKEDIN (80x80) - dag-2-kort
// =============================================================
export function OnboardingLinkedin({ className }: IllustrationProps) {
  const id = 'ob-li'
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="76" height="76" rx="20" fill={`url(#${id}-soft)`} opacity="0.6" />

      {/* Profilkort */}
      <rect x="14" y="20" width="42" height="40" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <rect x="14" y="20" width="42" height="8" fill={`url(#${id}-warm)`} />
      <circle cx="22" cy="34" r="4" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <line x1="30" y1="34" x2="50" y2="34" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="30" y1="38" x2="46" y2="38" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="46" x2="50" y2="46" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="50" x2="42" y2="50" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="54" x2="48" y2="54" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />

      {/* Score-badge */}
      <circle cx="60" cy="22" r="9" fill="white" stroke={`url(#${id}-deep)`} strokeWidth="2" />
      <text x="60" y="26" textAnchor="middle" fontSize="9" fontWeight="900" fill="#BE185D">87</text>

      {/* Pilar uppåt */}
      <line x1="64" y1="44" x2="64" y2="52" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" />
      <path d="M 61 47 L 64 44 L 67 47" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// =============================================================
// TESTER (80x80) - dag-2-kort
// =============================================================
export function OnboardingTester({ className }: IllustrationProps) {
  const id = 'ob-te'
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="76" height="76" rx="20" fill={`url(#${id}-soft)`} opacity="0.6" />

      {/* 3x3 grid */}
      <rect x="20" y="20" width="40" height="40" rx="4" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <line x1="20" y1="33.3" x2="60" y2="33.3" stroke="#FED7AA" strokeWidth="1" />
      <line x1="20" y1="46.6" x2="60" y2="46.6" stroke="#FED7AA" strokeWidth="1" />
      <line x1="33.3" y1="20" x2="33.3" y2="60" stroke="#FED7AA" strokeWidth="1" />
      <line x1="46.6" y1="20" x2="46.6" y2="60" stroke="#FED7AA" strokeWidth="1" />

      {/* Pilar i rotation */}
      <path d="M 26.5 25 L 26.5 28 M 25.5 27 L 26.5 25 L 27.5 27" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 38 27 L 41 27 M 39.5 26 L 41 27 L 39.5 28" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 53.5 25 L 53.5 28 M 52.5 27 L 53.5 28 L 54.5 27" stroke={`url(#${id}-warm)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      <path d="M 26.5 41 L 26.5 38 M 25.5 39 L 26.5 41 L 27.5 39" stroke={`url(#${id}-deep)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 41 41 L 38 41 M 39.5 40 L 38 41 L 39.5 42" stroke={`url(#${id}-deep)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 53.5 41 L 53.5 38" stroke={`url(#${id}-deep)`} strokeWidth="1.4" strokeLinecap="round" />

      {/* Sista cellen markerad med check */}
      <rect x="46.6" y="46.6" width="13.4" height="13.4" fill={`url(#${id}-warm)`} opacity="0.2" />
      <path d="M 50 53 L 53 56 L 57 51" stroke={`url(#${id}-deep)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
