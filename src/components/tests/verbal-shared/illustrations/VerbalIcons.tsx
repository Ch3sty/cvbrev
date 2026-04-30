'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="vrb-orange-red" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="vrb-orange-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
  </defs>
);

/**
 * Hero-illustration: en stiliserad bok med text-rader och en penna,
 * representerar verbalt resonemang. Designad för hero-bakgrund (vit på orange).
 */
export function VerbalHeroIllustration({ className = '' }: IconProps) {
  return (
    <svg
      className={className}
      width="340"
      height="340"
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
    >
      {/* Bakgrund: roterad textsida med rader */}
      <g transform="rotate(-6 160 130)" opacity="0.6">
        <rect x="80" y="50" width="160" height="200" rx="10" stroke="white" strokeWidth="2" fill="none" />
        {/* Text-rader */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={i}
            x1={92 + (i % 2 === 0 ? 0 : 8)}
            y1={75 + i * 22}
            x2={228 - (i % 3 === 0 ? 16 : 0)}
            y2={75 + i * 22}
            stroke="white"
            strokeWidth="1.8"
            opacity={0.8 - i * 0.06}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Mitten: framsidan med tydligare text + true/false-bubblor */}
      <g transform="rotate(2 175 165)">
        <rect x="100" y="80" width="170" height="200" rx="12" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="2.4" />
        {/* Citat-rader */}
        <line x1="118" y1="105" x2="252" y2="105" stroke="white" strokeWidth="2" opacity="0.85" strokeLinecap="round" />
        <line x1="118" y1="120" x2="240" y2="120" stroke="white" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
        <line x1="118" y1="135" x2="248" y2="135" stroke="white" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
        <line x1="118" y1="150" x2="220" y2="150" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round" />

        {/* Three answer-bubbles: ✓, ✗, ? */}
        <g transform="translate(118 180)">
          {/* True */}
          <circle cx="14" cy="14" r="14" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" />
          <path d="M 8 14 L 12 18 L 20 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* False */}
          <circle cx="60" cy="14" r="14" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="2" />
          <path d="M 54 8 L 66 20 M 66 8 L 54 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Cannot say */}
          <circle cx="106" cy="14" r="14" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="2" />
          <text x="106" y="19" textAnchor="middle" fontSize="14" fontWeight="800" fill="white">?</text>
        </g>

        {/* Text efter bubblor */}
        <line x1="118" y1="220" x2="244" y2="220" stroke="white" strokeWidth="2" opacity="0.55" strokeLinecap="round" />
        <line x1="118" y1="235" x2="220" y2="235" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      </g>

      {/* Subtila prickar */}
      <circle cx="20" cy="50" r="2.5" fill="white" opacity="0.3" />
      <circle cx="295" cy="50" r="2.5" fill="white" opacity="0.3" />
      <circle cx="40" cy="290" r="2" fill="white" opacity="0.25" />
      <circle cx="295" cy="280" r="3" fill="white" opacity="0.3" />
    </svg>
  );
}

/**
 * BookOpen-orb (premium-version av lucide BookOpen) för hero-eyebrow.
 */
export function BookOrbIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="24" cy="24" r="22" fill="url(#vrb-orange-pink)" opacity="0.12" />
      <circle cx="24" cy="24" r="17" fill="url(#vrb-orange-pink)" opacity="0.18" />

      {/* Öppen bok */}
      <g transform="translate(8 12)">
        {/* Vänstersida */}
        <path
          d="M 0 4 Q 8 2 16 4 L 16 24 Q 8 22 0 24 Z"
          fill="url(#vrb-orange-red)"
          stroke="white"
          strokeWidth="0.7"
        />
        {/* Högersida */}
        <path
          d="M 32 4 Q 24 2 16 4 L 16 24 Q 24 22 32 24 Z"
          fill="url(#vrb-orange-red)"
          stroke="white"
          strokeWidth="0.7"
          opacity="0.85"
        />
        {/* Text-rader vänster */}
        <line x1="3" y1="9" x2="13" y2="9" stroke="white" strokeWidth="0.8" opacity="0.7" />
        <line x1="3" y1="13" x2="13" y2="13" stroke="white" strokeWidth="0.8" opacity="0.55" />
        <line x1="3" y1="17" x2="11" y2="17" stroke="white" strokeWidth="0.8" opacity="0.4" />
        {/* Text-rader höger */}
        <line x1="19" y1="9" x2="29" y2="9" stroke="white" strokeWidth="0.8" opacity="0.7" />
        <line x1="19" y1="13" x2="29" y2="13" stroke="white" strokeWidth="0.8" opacity="0.55" />
        <line x1="19" y1="17" x2="27" y2="17" stroke="white" strokeWidth="0.8" opacity="0.4" />
      </g>
    </svg>
  );
}

/**
 * Stiliserad text-passage thumbnail för previous results-rader.
 */
export function VerbalCardThumbnail({ className = 'w-10 h-10', seed = 0 }: IconProps & { seed?: number }) {
  // Slumpmässiga rad-längder baserat på seed för variation
  const lineLengths: number[] = [];
  for (let i = 0; i < 4; i++) {
    const hash = (seed * 41 + i * 23 + 13) % 9;
    lineLengths.push(20 + hash * 2);
  }

  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="6" y="6" width="28" height="28" rx="3" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="1" />
      {lineLengths.map((len, i) => (
        <rect
          key={i}
          x="9"
          y={11 + i * 5.5}
          width={len * 0.4}
          height="2"
          rx="1"
          fill="url(#vrb-orange-red)"
          opacity={1 - i * 0.18}
        />
      ))}
    </svg>
  );
}

/**
 * Empty-state — illustration för "inga försök än".
 */
export function VerbalEmptyIllustration({ className = 'w-32 h-32' }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* Bok i mitten */}
      <rect x="30" y="30" width="60" height="60" rx="8" fill="url(#vrb-orange-red)" opacity="0.85" />
      <path d="M 30 50 Q 60 44 90 50" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
      {/* Text-rader */}
      <line x1="38" y1="58" x2="82" y2="58" stroke="white" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
      <line x1="38" y1="66" x2="74" y2="66" stroke="white" strokeWidth="2" opacity="0.55" strokeLinecap="round" />
      <line x1="38" y1="74" x2="80" y2="74" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round" />

      {/* Subtila prickar */}
      <circle cx="14" cy="14" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="106" cy="14" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="14" cy="106" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="106" cy="106" r="2" fill="#FB923C" opacity="0.5" />
    </svg>
  );
}
