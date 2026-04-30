'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="pf-orange-red" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="pf-orange-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="pf-emerald" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
    <linearGradient id="pf-amber" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FCD34D" />
      <stop offset="100%" stopColor="#F59E0B" />
    </linearGradient>
  </defs>
);

/**
 * Stor profil-orb för plan-status-hero. Gradient-cirkel med subtil
 * porträtt-silhouette inuti och små decorative prickar runtom.
 */
export function ProfileHeroOrb({ className = 'w-24 h-24' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Yttre glow-ring */}
      <circle cx="40" cy="40" r="38" fill="url(#pf-orange-pink)" opacity="0.15" />
      <circle cx="40" cy="40" r="34" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.5" />

      {/* Porträtt-silhouette */}
      <circle cx="40" cy="34" r="9" fill="url(#pf-orange-pink)" />
      <path d="M24 60 Q24 47 40 47 Q56 47 56 60 L56 64 L24 64 Z" fill="url(#pf-orange-pink)" />

      {/* Stjärna i kronan-position */}
      <g transform="translate(60 18)">
        <circle r="6" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.25" />
        <path
          d="M0 -3.5 L1 -1 L3.5 -0.5 L1.5 1 L2 3.5 L0 2 L-2 3.5 L-1.5 1 L-3.5 -0.5 L-1 -1 Z"
          fill="url(#pf-orange-red)"
        />
      </g>

      {/* Decorative prickar */}
      <circle cx="14" cy="26" r="1.5" fill="#FB923C" opacity="0.7" />
      <circle cx="68" cy="50" r="1" fill="#FB923C" opacity="0.6" />
      <circle cx="20" cy="62" r="1" fill="#DC2626" opacity="0.5" />
      <circle cx="56" cy="14" r="1" fill="#FB923C" opacity="0.5" />
    </svg>
  );
}

/**
 * Premium-krona med gradient och glöd. Används i premium-badge på hero
 * eller i PremiumGateModal.
 */
export function PremiumCrownIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Glow-bakgrund */}
      <circle cx="24" cy="24" r="22" fill="url(#pf-amber)" opacity="0.18" />

      {/* Krona */}
      <path
        d="M10 20 L14 28 L20 14 L24 24 L28 14 L34 28 L38 20 L40 36 L8 36 Z"
        fill="url(#pf-amber)"
        stroke="#9A3412"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />

      {/* Bas */}
      <rect x="8" y="36" width="32" height="4" rx="1" fill="#9A3412" />

      {/* Juveler */}
      <circle cx="14" cy="28" r="2" fill="#DC2626" />
      <circle cx="24" cy="24" r="2.5" fill="url(#pf-orange-red)" />
      <circle cx="34" cy="28" r="2" fill="#DC2626" />

      {/* Glitter */}
      <circle cx="20" cy="14" r="1" fill="white" />
      <circle cx="28" cy="14" r="1" fill="white" />
    </svg>
  );
}

/**
 * Lås-ikon med orange/röd gradient. Används som premium-CTA-indikator.
 */
export function LockedFieldIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Bakgrund */}
      <circle cx="24" cy="24" r="22" fill="url(#pf-orange-red)" opacity="0.12" />

      {/* Lås-bygel */}
      <path
        d="M16 22 L16 16 Q16 10 24 10 Q32 10 32 16 L32 22"
        fill="none"
        stroke="url(#pf-orange-red)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Lås-kropp */}
      <rect x="12" y="22" width="24" height="18" rx="3" fill="url(#pf-orange-pink)" />

      {/* Nyckelhål */}
      <circle cx="24" cy="29" r="2" fill="white" />
      <rect x="23" y="29" width="2" height="6" rx="1" fill="white" />

      {/* Sparkles */}
      <circle cx="38" cy="14" r="1.5" fill="#FCD34D" />
      <circle cx="10" cy="38" r="1" fill="#FCD34D" />
    </svg>
  );
}

/**
 * Liten varnings-/info-ikon med shield-form. Används i integritets-info.
 */
export function ShieldGradientIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <path
        d="M24 6 L40 12 L40 24 Q40 36 24 42 Q8 36 8 24 L8 12 Z"
        fill="url(#pf-emerald)"
      />
      <path
        d="M17 24 L22 29 L31 19"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
