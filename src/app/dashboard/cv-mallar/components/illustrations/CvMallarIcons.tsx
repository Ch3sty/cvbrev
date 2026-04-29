'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="cm-orange-red" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="cm-orange-pink" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="cm-emerald" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
  </defs>
);

/**
 * Hero-illustration for /dashboard/cv-mallar.
 * Tva CV-papper i fan-out: bakre (innan) i bleknad slate, framre (efter) i full DNA.
 * Liten penna i orange-gradient antyder transformation.
 */
export function CvDesignSwapIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Bakre CV-papper (innan) - roterat -10°, slate-toner, blekt */}
      <g transform="rotate(-10 22 32)">
        <rect x="10" y="14" width="22" height="32" rx="3" fill="white" stroke="#CBD5E1" strokeWidth="1.5" />
        <rect x="10" y="14" width="22" height="3" rx="3" fill="#E2E8F0" />
        <rect x="13" y="22" width="12" height="1.25" rx="0.625" fill="#E2E8F0" />
        <rect x="13" y="26" width="14" height="1.25" rx="0.625" fill="#E2E8F0" />
        <rect x="13" y="30" width="10" height="1.25" rx="0.625" fill="#E2E8F0" />
        <rect x="13" y="34" width="13" height="1.25" rx="0.625" fill="#E2E8F0" />
      </g>

      {/* Framre CV-papper (efter) - centrerat, full design-DNA */}
      <g transform="rotate(6 36 32)">
        <rect x="26" y="12" width="24" height="38" rx="3" fill="white" stroke="url(#cm-orange-red)" strokeWidth="1.75" />
        <rect x="26" y="12" width="24" height="4" rx="3" fill="url(#cm-orange-pink)" />
        {/* Profilrad: avatar-cirkel + namn-rad */}
        <circle cx="31" cy="22" r="2.5" fill="#FED7AA" />
        <rect x="35" y="20" width="10" height="1.5" rx="0.75" fill="#CBD5E1" />
        <rect x="35" y="23" width="7" height="1" rx="0.5" fill="#E2E8F0" />
        {/* Innehallsrader */}
        <rect x="29" y="29" width="18" height="1.5" rx="0.75" fill="#FB923C" opacity="0.6" />
        <rect x="29" y="33" width="16" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="29" y="36" width="18" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="29" y="39" width="14" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="29" y="43" width="17" height="1" rx="0.5" fill="#E2E8F0" />
      </g>

      {/* Penna i orange-gradient i nedre-hogra hornet, antyder transformation */}
      <g transform="translate(46 44) rotate(40)">
        <rect x="-1.25" y="-2" width="2.5" height="14" rx="1.25" fill="url(#cm-orange-red)" />
        <polygon points="-2,12 0,17 2,12" fill="#1E293B" />
        <rect x="-1.25" y="-4" width="2.5" height="2" fill="#FB923C" />
      </g>

      {/* Subtila prickar for djup */}
      <circle cx="55" cy="14" r="1.25" fill="#FB923C" opacity="0.6" />
      <circle cx="58" cy="20" r="0.9" fill="#FB923C" opacity="0.4" />
      <circle cx="6" cy="50" r="0.9" fill="#FB923C" opacity="0.4" />
      <circle cx="9" cy="56" r="0.7" fill="#FB923C" opacity="0.3" />
    </svg>
  );
}
