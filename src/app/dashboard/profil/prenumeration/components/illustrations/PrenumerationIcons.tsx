'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="pn-orange-red" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="pn-orange-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="pn-amber" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FCD34D" />
      <stop offset="100%" stopColor="#F59E0B" />
    </linearGradient>
    <linearGradient id="pn-emerald" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
  </defs>
);

/**
 * Bakgrundsstack för hero — tre dokument med en krona ovanpå mittenbladet.
 * Återanvänder samma DNA som ProfileFormStackBg/BackgroundDocStack men med
 * krona som tydligt premium-element.
 */
export function PrenumerationHeroStack({ className = '' }: IconProps) {
  return (
    <svg
      className={className}
      width="340"
      height="340"
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
    >
      {/* Bakre kort, roterat */}
      <g transform="rotate(-8 150 170)">
        <rect x="80" y="80" width="140" height="180" rx="14" stroke="white" strokeWidth="2" opacity="0.5" />
        <line x1="98" y1="105" x2="190" y2="105" stroke="white" strokeWidth="2" opacity="0.35" />
        <line x1="98" y1="120" x2="170" y2="120" stroke="white" strokeWidth="1.5" opacity="0.3" />
        <line x1="98" y1="145" x2="180" y2="145" stroke="white" strokeWidth="1.5" opacity="0.25" />
      </g>

      {/* Mitten-kort */}
      <g transform="rotate(4 170 160)">
        <rect x="100" y="70" width="140" height="180" rx="14" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="2" opacity="0.7" />
        <line x1="118" y1="100" x2="220" y2="100" stroke="white" strokeWidth="2" opacity="0.45" />
        <line x1="118" y1="115" x2="200" y2="115" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <line x1="118" y1="135" x2="215" y2="135" stroke="white" strokeWidth="1.5" opacity="0.35" />
        <line x1="118" y1="155" x2="190" y2="155" stroke="white" strokeWidth="1.5" opacity="0.3" />
      </g>

      {/* Främre kort med krona */}
      <g>
        <rect x="120" y="60" width="140" height="180" rx="14" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="2" opacity="0.95" />

        {/* Krona ovanpå kortet */}
        <g transform="translate(170 75)">
          <path
            d="M0 12 L4 4 L10 8 L20 0 L30 8 L36 4 L40 12 L40 18 L0 18 Z"
            fill="white"
            fillOpacity="0.35"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="4" cy="4" r="1.75" fill="white" />
          <circle cx="20" cy="0" r="2" fill="white" />
          <circle cx="36" cy="4" r="1.75" fill="white" />
          <line x1="4" y1="22" x2="36" y2="22" stroke="white" strokeWidth="2" opacity="0.8" />
        </g>

        {/* Innehållsrader */}
        <line x1="138" y1="120" x2="240" y2="120" stroke="white" strokeWidth="2" opacity="0.45" />
        <line x1="138" y1="135" x2="220" y2="135" stroke="white" strokeWidth="1.5" opacity="0.35" />
        <line x1="138" y1="155" x2="240" y2="155" stroke="white" strokeWidth="1.5" opacity="0.3" />
        <line x1="138" y1="170" x2="200" y2="170" stroke="white" strokeWidth="1.5" opacity="0.25" />

        {/* Pris-rad */}
        <rect x="138" y="195" width="40" height="14" rx="3" fill="white" fillOpacity="0.25" />
        <line x1="186" y1="201" x2="240" y2="201" stroke="white" strokeWidth="2" opacity="0.4" />
        <line x1="186" y1="208" x2="220" y2="208" stroke="white" strokeWidth="1.5" opacity="0.3" />
      </g>

      {/* Subtila prickar */}
      <circle cx="50" cy="240" r="3" fill="white" opacity="0.3" />
      <circle cx="65" cy="265" r="2" fill="white" opacity="0.25" />
      <circle cx="38" cy="215" r="2" fill="white" opacity="0.2" />
      <circle cx="280" cy="50" r="2.5" fill="white" opacity="0.25" />
      <circle cx="295" cy="80" r="1.5" fill="white" opacity="0.2" />
    </svg>
  );
}

/**
 * Krona med karaktär — gradient-fylld, för hero-badge-användning.
 */
export function CrownBadgeIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Bas-glow */}
      <circle cx="24" cy="24" r="22" fill="url(#pn-orange-pink)" opacity="0.12" />
      <circle cx="24" cy="24" r="17" fill="url(#pn-orange-pink)" opacity="0.18" />

      {/* Krona-form */}
      <g transform="translate(8 12)">
        <path
          d="M0 14 L3 4 L10 10 L16 0 L22 10 L29 4 L32 14 L32 22 L0 22 Z"
          fill="url(#pn-orange-pink)"
          stroke="white"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        {/* Juveler */}
        <circle cx="3" cy="4" r="1.75" fill="url(#pn-amber)" />
        <circle cx="16" cy="0" r="2" fill="url(#pn-amber)" />
        <circle cx="29" cy="4" r="1.75" fill="url(#pn-amber)" />
        {/* Bas-band */}
        <rect x="0" y="22" width="32" height="3" rx="1" fill="url(#pn-orange-red)" />
      </g>
    </svg>
  );
}

/**
 * Trygghets-badge: cirkel med checkmark, för "Ingen bindningstid"-rader.
 */
export function TrustBadgeIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="12" cy="12" r="11" fill="url(#pn-emerald)" opacity="0.15" />
      <circle cx="12" cy="12" r="9" fill="url(#pn-emerald)" />
      <path d="M7.5 12 L10.5 15 L16 9.5" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * "Mest populärt"-badge för pricing-card.
 */
export function PopularBadgeIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 2 L14.5 8.5 L21.5 9 L16 13.5 L18 20.5 L12 16.5 L6 20.5 L8 13.5 L2.5 9 L9.5 8.5 Z"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
