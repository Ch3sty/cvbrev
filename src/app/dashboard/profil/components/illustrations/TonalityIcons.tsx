'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="tn-orange-red" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="tn-orange-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="tn-emerald" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
    <linearGradient id="tn-creative" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FB923C" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#7C3AED" />
    </linearGradient>
    <linearGradient id="tn-amber" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FCD34D" />
      <stop offset="100%" stopColor="#F59E0B" />
    </linearGradient>
  </defs>
);

/**
 * Professionell - skjorta med slips, formell.
 */
export function ProfessionalToneIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#tn-orange-red)" strokeWidth="1.75" />

      {/* Krage */}
      <path d="M30 24 L40 32 L50 24 L52 30 L40 38 L28 30 Z" fill="url(#tn-orange-red)" />
      <path d="M30 24 L40 32 L50 24" stroke="white" strokeWidth="0.8" fill="none" opacity="0.6" />

      {/* Slips */}
      <path d="M38 32 L40 38 L42 32 L44 60 L40 64 L36 60 Z" fill="url(#tn-orange-pink)" />
      <line x1="40" y1="42" x2="40" y2="58" stroke="white" strokeWidth="0.8" opacity="0.5" />

      {/* Skjorta-knappar */}
      <circle cx="40" cy="46" r="1" fill="white" opacity="0.8" />
      <circle cx="40" cy="54" r="1" fill="white" opacity="0.8" />

      {/* Skuldror */}
      <path d="M22 56 Q22 44 30 44 L40 38 L50 44 Q58 44 58 56 L58 64 L22 64 Z" fill="white" stroke="#FED7AA" strokeWidth="0.8" />
      <path d="M38 32 L40 38 L42 32 L44 60 L40 64 L36 60 Z" fill="url(#tn-orange-pink)" />
    </svg>
  );
}

/**
 * Kreativ - palett med pensel + färg-stänk.
 */
export function CreativeToneIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#tn-creative)" strokeWidth="1.75" />

      {/* Palett */}
      <ellipse cx="36" cy="44" rx="22" ry="18" fill="white" stroke="url(#tn-orange-red)" strokeWidth="1.75" />

      {/* Tumhål */}
      <ellipse cx="48" cy="44" rx="4" ry="3" fill="white" stroke="#FED7AA" strokeWidth="0.8" />

      {/* Färg-prickar på paletten */}
      <circle cx="26" cy="38" r="3.5" fill="#F97316" />
      <circle cx="34" cy="34" r="3.5" fill="#DC2626" />
      <circle cx="42" cy="36" r="3" fill="#BE185D" />
      <circle cx="26" cy="50" r="3" fill="#7C3AED" />
      <circle cx="36" cy="54" r="3" fill="#10B981" />

      {/* Pensel */}
      <g transform="rotate(-30 60 22)">
        <rect x="56" y="6" width="3" height="22" rx="1.5" fill="#1E293B" />
        <rect x="55.5" y="2" width="4" height="6" rx="1" fill="#FB923C" />
        <path d="M54 28 L61 28 L60 34 L55 34 Z" fill="url(#tn-orange-pink)" />
      </g>

      {/* Färg-stänk runtom */}
      <circle cx="14" cy="20" r="1.5" fill="#F97316" opacity="0.7" />
      <circle cx="66" cy="62" r="1.5" fill="#7C3AED" opacity="0.6" />
      <circle cx="60" cy="14" r="1" fill="#10B981" opacity="0.6" />
      <circle cx="20" cy="64" r="1.5" fill="#DC2626" opacity="0.6" />
    </svg>
  );
}

/**
 * Självsäker - pokal med stigande linjer.
 */
export function ConfidentToneIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#tn-orange-red)" strokeWidth="1.75" />

      {/* Stigande linjer bakgrund */}
      <g opacity="0.4">
        <line x1="14" y1="60" x2="22" y2="48" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="58" y1="48" x2="66" y2="40" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="48" x2="22" y2="40" stroke="#FB923C" strokeWidth="1.25" strokeLinecap="round" />
      </g>

      {/* Pokal */}
      <path
        d="M28 18 L52 18 L50 38 Q50 44 40 44 Q30 44 30 38 Z"
        fill="url(#tn-orange-pink)"
      />
      <path d="M28 18 L52 18 L52 22 L28 22 Z" fill="white" opacity="0.3" />

      {/* Handtag */}
      <path d="M28 22 Q20 22 20 30 Q20 36 26 36" fill="none" stroke="url(#tn-orange-red)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 22 Q60 22 60 30 Q60 36 54 36" fill="none" stroke="url(#tn-orange-red)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Pokal-stam */}
      <rect x="36" y="44" width="8" height="6" fill="url(#tn-orange-red)" />

      {/* Bas */}
      <rect x="28" y="50" width="24" height="6" rx="1" fill="#1E293B" />
      <rect x="28" y="56" width="24" height="2" fill="#0F172A" />

      {/* Stjärna i mitten */}
      <path
        d="M40 26 L42 30 L46 30.5 L43 33.5 L44 38 L40 36 L36 38 L37 33.5 L34 30.5 L38 30 Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Balanserad - våg med två sidor i orange/emerald.
 */
export function BalancedToneIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#tn-orange-red)" strokeWidth="1.75" />

      {/* Mittstolpe */}
      <rect x="38" y="20" width="4" height="38" fill="#1E293B" />
      <circle cx="40" cy="20" r="3" fill="#1E293B" />

      {/* Bjälke */}
      <rect x="14" y="22" width="52" height="3" rx="1.5" fill="#1E293B" />

      {/* Vänster kedja + skål */}
      <line x1="22" y1="25" x2="22" y2="38" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2,1.5" />
      <path d="M14 38 L30 38 L26 48 L18 48 Z" fill="url(#tn-orange-red)" />
      <ellipse cx="22" cy="38" rx="8" ry="1.5" fill="#FED7AA" />

      {/* Höger kedja + skål */}
      <line x1="58" y1="25" x2="58" y2="38" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2,1.5" />
      <path d="M50 38 L66 38 L62 48 L54 48 Z" fill="url(#tn-emerald)" />
      <ellipse cx="58" cy="38" rx="8" ry="1.5" fill="#A7F3D0" />

      {/* Bas */}
      <rect x="28" y="58" width="24" height="6" rx="1" fill="#1E293B" />
    </svg>
  );
}

/**
 * Smart val (AI/auto) - pulserande orb med konstellations-prickar.
 * Premium-känsla.
 */
export function SmartAutoToneIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#tn-orange-pink)" strokeWidth="1.75" />

      {/* Konstellations-bana (cirklar) */}
      <circle cx="40" cy="40" r="26" fill="none" stroke="url(#tn-orange-pink)" strokeWidth="0.8" opacity="0.3" strokeDasharray="2,2" />
      <circle cx="40" cy="40" r="20" fill="none" stroke="url(#tn-orange-pink)" strokeWidth="0.8" opacity="0.4" />

      {/* Förbindande linjer */}
      <g stroke="url(#tn-orange-red)" strokeWidth="0.8" opacity="0.4" strokeLinecap="round">
        <line x1="40" y1="40" x2="20" y2="28" />
        <line x1="40" y1="40" x2="60" y2="28" />
        <line x1="40" y1="40" x2="22" y2="56" />
        <line x1="40" y1="40" x2="58" y2="58" />
        <line x1="40" y1="40" x2="68" y2="44" />
      </g>

      {/* Kärn-orb */}
      <circle cx="40" cy="40" r="11" fill="url(#tn-orange-pink)" />
      <circle cx="40" cy="40" r="11" fill="url(#tn-orange-pink)" opacity="0.6" />
      <circle cx="40" cy="40" r="6" fill="white" opacity="0.4" />
      <circle cx="38" cy="38" r="2" fill="white" />

      {/* Konstellations-prickar */}
      <circle cx="20" cy="28" r="2.5" fill="url(#tn-orange-red)" />
      <circle cx="60" cy="28" r="2" fill="url(#tn-orange-pink)" />
      <circle cx="22" cy="56" r="2" fill="url(#tn-orange-pink)" />
      <circle cx="58" cy="58" r="2.5" fill="url(#tn-orange-red)" />
      <circle cx="68" cy="44" r="1.5" fill="#FB923C" />
      <circle cx="14" cy="44" r="1.5" fill="#FB923C" />

      {/* Premium-stjärna i hörnet */}
      <g transform="translate(60 16)">
        <circle r="6" fill="url(#tn-amber)" />
        <path
          d="M0 -3 L1 -1 L3 -0.5 L1.5 1 L2 3 L0 1.5 L-2 3 L-1.5 1 L-3 -0.5 L-1 -1 Z"
          fill="white"
        />
      </g>
    </svg>
  );
}
