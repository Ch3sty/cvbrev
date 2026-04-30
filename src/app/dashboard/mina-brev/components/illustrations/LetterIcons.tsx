'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="lt-orange-red" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="lt-orange-pink" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="lt-paper" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="100%" stopColor="#FFF7ED" />
    </linearGradient>
  </defs>
);

/**
 * Hero-illustration: tre staplade brev som tippar ut ur en orange/röd-pink-gradient
 * orb. Det främsta brevet är komplett (rubrik, två rader, signatur) — antydan
 * om "personliga brev redo att skicka". Subtila orange partiklar runtom.
 */
export function LetterStackOrb({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Yttre halo */}
      <circle cx="32" cy="32" r="28" fill="url(#lt-orange-red)" opacity="0.08" />

      {/* Orb-bakgrund (rounded square) */}
      <rect x="14" y="14" width="36" height="36" rx="11" fill="url(#lt-orange-pink)" />

      {/* Subtil glanseffekt */}
      <ellipse cx="22" cy="22" rx="8" ry="4" fill="white" fillOpacity="0.18" />

      {/* Bakre brev (svagast, mest roterat) */}
      <g transform="translate(18 19) rotate(-10 12 16)">
        <rect x="0" y="0" width="22" height="28" rx="2" fill="url(#lt-paper)" stroke="white" strokeOpacity="0.35" strokeWidth="0.6" />
      </g>

      {/* Mellanbrev */}
      <g transform="translate(20 18) rotate(-3 12 16)">
        <rect x="0" y="0" width="22" height="28" rx="2" fill="white" stroke="white" strokeOpacity="0.55" strokeWidth="0.6" />
        <line x1="3" y1="6" x2="14" y2="6" stroke="#FB923C" strokeOpacity="0.45" strokeWidth="0.7" />
        <line x1="3" y1="9.5" x2="18" y2="9.5" stroke="#E2E8F0" strokeWidth="0.6" />
      </g>

      {/* Främre brev (störst tonvikt) */}
      <g transform="translate(22 21) rotate(4 12 14)">
        <rect x="0" y="0" width="22" height="26" rx="2" fill="white" />
        {/* Topprubrik (orange-band) */}
        <rect x="0" y="0" width="22" height="2.2" rx="2" fill="url(#lt-orange-red)" />
        {/* Adress/datum-linjer */}
        <line x1="3" y1="5.5" x2="11" y2="5.5" stroke="#FB923C" strokeWidth="0.7" />
        {/* Brödtext-linjer */}
        <line x1="3" y1="9" x2="19" y2="9" stroke="#CBD5E1" strokeWidth="0.6" />
        <line x1="3" y1="11.5" x2="17" y2="11.5" stroke="#E2E8F0" strokeWidth="0.6" />
        <line x1="3" y1="14" x2="18.5" y2="14" stroke="#E2E8F0" strokeWidth="0.6" />
        <line x1="3" y1="16.5" x2="15" y2="16.5" stroke="#E2E8F0" strokeWidth="0.6" />
        {/* Signatur */}
        <path d="M 3 21 q 2 -1.5 4 0 t 4 0" stroke="#DC2626" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </g>

      {/* Subtila partiklar */}
      <circle cx="9" cy="20" r="1" fill="#FB923C" opacity="0.5" />
      <circle cx="6" cy="32" r="0.85" fill="#FB923C" opacity="0.4" />
      <circle cx="55" cy="22" r="1" fill="#FB923C" opacity="0.5" />
      <circle cx="58" cy="40" r="0.85" fill="#FB923C" opacity="0.4" />
      <circle cx="48" cy="56" r="0.9" fill="#10B981" opacity="0.4" />
    </svg>
  );
}

/**
 * Liten brev-ikon för list-kort. Fyrkant med orange topp-band, två linjer och signatur.
 * Återger samma DNA som LetterStackOrb men i kompakt rounded-square med gradient-bakgrund.
 */
export function LetterDocIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="ldi-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* Bakgrund */}
      <rect x="0" y="0" width="40" height="40" rx="11" fill="url(#ldi-bg)" />

      {/* Glanseffekt */}
      <ellipse cx="14" cy="14" rx="6" ry="3" fill="white" fillOpacity="0.18" />

      {/* Brevet inuti */}
      <g transform="translate(11 9)">
        <rect x="0" y="0" width="18" height="22" rx="2" fill="white" />
        {/* Topprubrik */}
        <rect x="0" y="0" width="18" height="2" rx="2" fill="#FED7AA" />
        {/* Linjer */}
        <line x1="2.5" y1="6" x2="9" y2="6" stroke="#FB923C" strokeWidth="0.7" />
        <line x1="2.5" y1="9" x2="15.5" y2="9" stroke="#E2E8F0" strokeWidth="0.6" />
        <line x1="2.5" y1="11.5" x2="14" y2="11.5" stroke="#E2E8F0" strokeWidth="0.6" />
        <line x1="2.5" y1="14" x2="15" y2="14" stroke="#E2E8F0" strokeWidth="0.6" />
        {/* Signatur */}
        <path d="M 2.5 18 q 1.5 -1 3 0 t 3 0" stroke="#DC2626" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * Empty-state-illustration: ett tomt brev som svävar med en penna intill,
 * antyder "skapa ditt första brev". Subtil och glad, inte sorgsen.
 */
export function EmptyLetterIllustration({ className = 'w-32 h-32' }: IconProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="el-orange" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="el-paper" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF7ED" />
        </linearGradient>
      </defs>

      {/* Bakre halo */}
      <circle cx="48" cy="48" r="36" fill="url(#el-orange)" opacity="0.06" />

      {/* Brevet */}
      <g transform="translate(20 18)">
        <rect x="0" y="0" width="48" height="60" rx="4" fill="url(#el-paper)" stroke="#FED7AA" strokeWidth="1" />
        {/* Topprubrik */}
        <rect x="0" y="0" width="48" height="5" rx="4" fill="url(#el-orange)" />
        {/* Tomma linjer */}
        <line x1="6" y1="14" x2="20" y2="14" stroke="#FB923C" strokeOpacity="0.4" strokeWidth="1.2" />
        <line x1="6" y1="22" x2="42" y2="22" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="6" y1="28" x2="38" y2="28" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="6" y1="34" x2="40" y2="34" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="6" y1="40" x2="36" y2="40" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="6" y1="46" x2="42" y2="46" stroke="#E2E8F0" strokeWidth="1" />
      </g>

      {/* Penna roterad bredvid */}
      <g transform="translate(62 50) rotate(35 8 24)">
        <rect x="0" y="0" width="6" height="32" rx="1" fill="url(#el-orange)" />
        <rect x="0" y="2" width="6" height="3" fill="#BE185D" />
        <polygon points="0,32 3,38 6,32" fill="#1E293B" />
        <polygon points="2.2,35 3,36.5 3.8,35" fill="#FFF7ED" />
      </g>

      {/* Subtila partiklar */}
      <circle cx="14" cy="24" r="1.5" fill="#FB923C" opacity="0.5" />
      <circle cx="80" cy="32" r="1.2" fill="#FB923C" opacity="0.45" />
      <circle cx="18" cy="78" r="1.2" fill="#FB923C" opacity="0.4" />
      <circle cx="82" cy="80" r="1.4" fill="#10B981" opacity="0.4" />
    </svg>
  );
}
