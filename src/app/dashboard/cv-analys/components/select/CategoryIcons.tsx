'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="cat-orange-red" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="cat-orange-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="cat-emerald" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
    <linearGradient id="cat-amber" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FB923C" />
      <stop offset="100%" stopColor="#F59E0B" />
    </linearGradient>
  </defs>
);

/**
 * Personbeskrivning - stiliserat porträtt med talande-linjer
 */
export function UserPortraitIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* Bakgrundscirkel */}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#cat-orange-red)" strokeWidth="1.75" />

      {/* Porträtt-silhouette */}
      <circle cx="32" cy="32" r="9" fill="url(#cat-orange-pink)" />
      <path d="M16 56 Q16 42 32 42 Q48 42 48 56" fill="url(#cat-orange-pink)" />

      {/* Talande-linjer (chat-style) som flyter ut */}
      <g opacity="0.9">
        <rect x="50" y="22" width="20" height="3" rx="1.5" fill="#FB923C" />
        <rect x="50" y="28" width="14" height="2.5" rx="1.25" fill="#FED7AA" />
        <rect x="50" y="33" width="16" height="2.5" rx="1.25" fill="#FED7AA" />
      </g>

      {/* Liten sparkle */}
      <circle cx="62" cy="48" r="2" fill="#FB923C" opacity="0.6" />
      <circle cx="68" cy="44" r="1.5" fill="#FB923C" opacity="0.4" />

      {/* Profil-kant skiner */}
      <path d="M16 56 Q16 42 32 42" stroke="white" strokeWidth="0.8" fill="none" opacity="0.5" />
    </svg>
  );
}

/**
 * Roller - tre staplade portföljer i fan-formation
 */
export function BriefcaseStackIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#cat-orange-red)" strokeWidth="1.75" />

      {/* Bakre portfölj (roterad) */}
      <g transform="rotate(-12 30 44)">
        <rect x="20" y="34" width="22" height="20" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
        <rect x="27" y="30" width="8" height="6" rx="1.5" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
        <rect x="22" y="40" width="18" height="2" rx="1" fill="#FED7AA" />
      </g>

      {/* Mellersta (huvud) */}
      <g>
        <rect x="26" y="36" width="28" height="22" rx="3" fill="white" stroke="url(#cat-orange-red)" strokeWidth="1.75" />
        <rect x="34" y="32" width="12" height="6" rx="2" fill="white" stroke="url(#cat-orange-red)" strokeWidth="1.75" />
        <rect x="26" y="42" width="28" height="3" fill="url(#cat-orange-pink)" />
        {/* Lås */}
        <circle cx="40" cy="48" r="2" fill="url(#cat-orange-red)" />
      </g>

      {/* Främre (roterad andra hållet) */}
      <g transform="rotate(10 52 46)">
        <rect x="40" y="38" width="22" height="20" rx="3" fill="white" stroke="url(#cat-orange-pink)" strokeWidth="1.75" />
        <rect x="47" y="34" width="8" height="6" rx="1.5" fill="white" stroke="url(#cat-orange-pink)" strokeWidth="1.75" />
        <rect x="42" y="44" width="18" height="2" rx="1" fill="url(#cat-orange-red)" />
        <rect x="42" y="48" width="14" height="1.5" rx="0.75" fill="#FED7AA" />
      </g>

      {/* Check-prick högst upp */}
      <circle cx="56" cy="22" r="6" fill="url(#cat-emerald)" />
      <path d="M53 22 L55 24 L59 20" stroke="white" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Färdigheter - konstellation av prickar som formar ett pussel
 */
export function SkillsConstellationIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#cat-orange-red)" strokeWidth="1.75" />

      {/* Förbindande linjer */}
      <g stroke="url(#cat-orange-red)" strokeWidth="1.25" opacity="0.4" strokeLinecap="round">
        <line x1="40" y1="22" x2="58" y2="32" />
        <line x1="58" y1="32" x2="58" y2="50" />
        <line x1="58" y1="50" x2="40" y2="58" />
        <line x1="40" y1="58" x2="22" y2="50" />
        <line x1="22" y1="50" x2="22" y2="32" />
        <line x1="22" y1="32" x2="40" y2="22" />
        <line x1="40" y1="22" x2="40" y2="58" />
        <line x1="22" y1="32" x2="58" y2="50" />
        <line x1="58" y1="32" x2="22" y2="50" />
      </g>

      {/* Noder (skill-prickar) */}
      <circle cx="40" cy="22" r="4.5" fill="url(#cat-orange-pink)" />
      <circle cx="58" cy="32" r="4.5" fill="url(#cat-orange-red)" />
      <circle cx="58" cy="50" r="4.5" fill="url(#cat-orange-pink)" />
      <circle cx="40" cy="58" r="5" fill="url(#cat-orange-red)" />
      <circle cx="22" cy="50" r="4.5" fill="url(#cat-orange-pink)" />
      <circle cx="22" cy="32" r="4.5" fill="url(#cat-orange-red)" />

      {/* Kärn-prick */}
      <circle cx="40" cy="40" r="6" fill="white" stroke="url(#cat-orange-pink)" strokeWidth="2" />
      <circle cx="40" cy="40" r="2" fill="url(#cat-orange-pink)" />

      {/* Liten plus uppe i hörnet */}
      <g transform="translate(60 18)">
        <circle r="6" fill="url(#cat-emerald)" />
        <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * Auto - roterande gear med pulserande halo
 */
export function AutoMagicIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#cat-emerald)" strokeWidth="1.75" />

      {/* Halo */}
      <circle cx="40" cy="40" r="24" fill="none" stroke="url(#cat-emerald)" strokeWidth="0.75" opacity="0.3" />
      <circle cx="40" cy="40" r="20" fill="none" stroke="url(#cat-emerald)" strokeWidth="0.75" opacity="0.5" />

      {/* Stjärnformat gear */}
      <g transform="translate(40 40)">
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <rect
              key={i}
              x="-2"
              y="-17"
              width="4"
              height="6"
              rx="1.5"
              fill="url(#cat-emerald)"
              transform={`rotate(${angle})`}
            />
          );
        })}
      </g>

      {/* Inre cirkel */}
      <circle cx="40" cy="40" r="11" fill="white" stroke="url(#cat-emerald)" strokeWidth="2" />

      {/* Center check */}
      <path d="M35 40 L38 43 L45 36" stroke="url(#cat-emerald)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Sparkles runtom */}
      <g opacity="0.7">
        <circle cx="64" cy="22" r="1.5" fill="#10B981" />
        <circle cx="18" cy="18" r="1" fill="#10B981" />
        <circle cx="60" cy="58" r="1.25" fill="#10B981" />
        <circle cx="20" cy="60" r="1.5" fill="#10B981" />
      </g>
    </svg>
  );
}

/**
 * Liten kompakt segment-ikon (24x24 för segment-bar)
 */
export function CategorySegmentIcon({
  type,
  className = 'w-4 h-4',
}: {
  type: 'profile' | 'roles' | 'skills' | 'auto';
  className?: string;
}) {
  if (type === 'profile') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
        <circle cx="8" cy="6" r="2.5" fill="currentColor" />
        <path d="M3 14 Q3 9 8 9 Q13 9 13 14" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'roles') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
        <rect x="2" y="5" width="12" height="9" rx="1.5" fill="currentColor" />
        <rect x="6" y="3" width="4" height="2" rx="0.75" fill="currentColor" />
        <rect x="2" y="8" width="12" height="1.5" fill="white" opacity="0.5" />
      </svg>
    );
  }
  if (type === 'skills') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
        <circle cx="8" cy="3" r="1.5" fill="currentColor" />
        <circle cx="3" cy="8" r="1.5" fill="currentColor" />
        <circle cx="13" cy="8" r="1.5" fill="currentColor" />
        <circle cx="8" cy="13" r="1.5" fill="currentColor" />
        <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      </svg>
    );
  }
  // auto
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <g transform="translate(8 8)">
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 360) / 6;
          return (
            <rect
              key={i}
              x="-1"
              y="-7"
              width="2"
              height="3"
              rx="0.75"
              fill="currentColor"
              transform={`rotate(${angle})`}
            />
          );
        })}
        <circle r="3" fill="white" />
        <path d="M-1.5 0 L0 1.5 L2 -1" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
