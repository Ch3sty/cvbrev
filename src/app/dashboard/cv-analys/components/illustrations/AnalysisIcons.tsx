'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="af-orange-red" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="af-orange-pink" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="af-emerald" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
    <linearGradient id="af-amber" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FB923C" />
      <stop offset="100%" stopColor="#F59E0B" />
    </linearGradient>
  </defs>
);

export function HeroAnalysisIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="8" y="10" width="34" height="44" rx="4" fill="white" stroke="url(#af-orange-red)" strokeWidth="1.75" />
      <rect x="8" y="10" width="34" height="6" rx="4" fill="url(#af-orange-pink)" />
      <rect x="13" y="22" width="14" height="2" rx="1" fill="#CBD5E1" />
      <rect x="13" y="28" width="24" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="13" y="32" width="22" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="13" y="36" width="24" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="13" y="40" width="18" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="13" y="44" width="20" height="1.5" rx="0.75" fill="#E2E8F0" />
      {/* Förstoringsglas i höger del */}
      <circle cx="48" cy="36" r="11" fill="white" stroke="url(#af-orange-red)" strokeWidth="2.25" />
      <line x1="56" y1="44" x2="60" y2="48" stroke="url(#af-orange-red)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Markering inne i förstoringsglaset */}
      <rect x="42" y="32" width="9" height="1.5" rx="0.75" fill="#FB923C" />
      <rect x="42" y="36" width="11" height="1.5" rx="0.75" fill="url(#af-orange-pink)" />
      <rect x="42" y="40" width="7" height="1.5" rx="0.75" fill="#FB923C" />
    </svg>
  );
}

export function ScoreTargetIcon({ className = 'w-16 h-16' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="32" cy="32" r="26" fill="white" stroke="url(#af-orange-red)" strokeWidth="2" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="#FED7AA" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="10" fill="none" stroke="url(#af-orange-pink)" strokeWidth="1.75" />
      <circle cx="32" cy="32" r="4" fill="url(#af-orange-pink)" />
      {/* Pil */}
      <g transform="rotate(-35 32 32)">
        <line x1="14" y1="32" x2="34" y2="32" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <polygon points="32,28 36,32 32,36" fill="#1E293B" />
        <polygon points="14,30 10,32 14,34" fill="#FB923C" />
      </g>
    </svg>
  );
}

export function ImprovementListIcon({ className = 'w-16 h-16' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="10" y="8" width="44" height="48" rx="4" fill="white" stroke="url(#af-orange-red)" strokeWidth="1.75" />
      <rect x="10" y="8" width="44" height="6" rx="4" fill="url(#af-orange-pink)" />
      {/* Checklista */}
      <g transform="translate(15 22)">
        <circle cx="3" cy="3" r="3" fill="url(#af-emerald)" />
        <path d="M1.5 3 L2.5 4 L4.5 2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="9" y="2" width="22" height="2" rx="1" fill="#CBD5E1" />
      </g>
      <g transform="translate(15 32)">
        <circle cx="3" cy="3" r="3" fill="url(#af-emerald)" />
        <path d="M1.5 3 L2.5 4 L4.5 2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="9" y="2" width="26" height="2" rx="1" fill="#CBD5E1" />
      </g>
      <g transform="translate(15 42)">
        <circle cx="3" cy="3" r="3" fill="none" stroke="#FB923C" strokeWidth="1.5" />
        <rect x="9" y="2" width="20" height="2" rx="1" fill="#E2E8F0" />
      </g>
    </svg>
  );
}

export function CompareSplitIcon({ className = 'w-16 h-16' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* Vänster (original) */}
      <rect x="6" y="12" width="22" height="40" rx="3" fill="white" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="6" y="12" width="22" height="4" rx="3" fill="#CBD5E1" />
      <rect x="10" y="20" width="14" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="10" y="24" width="11" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="10" y="28" width="13" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="10" y="32" width="9" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="10" y="36" width="14" height="1.5" rx="0.75" fill="#E2E8F0" />
      {/* Höger (förbättrat) */}
      <rect x="36" y="10" width="22" height="42" rx="3" fill="white" stroke="url(#af-orange-red)" strokeWidth="1.75" />
      <rect x="36" y="10" width="22" height="4" rx="3" fill="url(#af-orange-pink)" />
      <rect x="40" y="18" width="15" height="1.75" rx="0.875" fill="#FB923C" />
      <rect x="40" y="23" width="13" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="40" y="27" width="14" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="40" y="31" width="12" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="40" y="35" width="14" height="1.5" rx="0.75" fill="#E2E8F0" />
      {/* Pil mellan */}
      <g transform="translate(28 30)">
        <line x1="0" y1="2" x2="6" y2="2" stroke="url(#af-orange-red)" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="5,0 8,2 5,4" fill="url(#af-orange-red)" />
      </g>
    </svg>
  );
}

export function TemplateFanIcon({ className = 'w-16 h-16' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <g transform="rotate(-12 22 32)">
        <rect x="12" y="14" width="22" height="32" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
        <rect x="14" y="18" width="10" height="1.25" rx="0.625" fill="#E2E8F0" />
        <rect x="14" y="22" width="14" height="1.25" rx="0.625" fill="#E2E8F0" />
        <rect x="14" y="26" width="12" height="1.25" rx="0.625" fill="#E2E8F0" />
      </g>
      <g transform="rotate(0 32 32)">
        <rect x="22" y="12" width="22" height="36" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.75" />
        <rect x="22" y="12" width="22" height="4" rx="3" fill="url(#af-orange-red)" />
        <rect x="25" y="20" width="14" height="1.5" rx="0.75" fill="#E2E8F0" />
        <rect x="25" y="24" width="16" height="1.5" rx="0.75" fill="#E2E8F0" />
        <rect x="25" y="28" width="13" height="1.5" rx="0.75" fill="#E2E8F0" />
        <rect x="25" y="32" width="15" height="1.5" rx="0.75" fill="#E2E8F0" />
      </g>
      <g transform="rotate(12 42 32)">
        <rect x="32" y="14" width="22" height="32" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
        <rect x="34" y="18" width="12" height="1.25" rx="0.625" fill="#E2E8F0" />
        <rect x="34" y="22" width="14" height="1.25" rx="0.625" fill="#E2E8F0" />
        <rect x="34" y="26" width="11" height="1.25" rx="0.625" fill="#E2E8F0" />
      </g>
    </svg>
  );
}

export function CompletionTrophyIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* Bakgrundsstrålar */}
      <g opacity="0.6">
        <line x1="32" y1="2" x2="32" y2="8" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="8" x2="46" y2="13" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="8" x2="18" y2="13" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="56" y1="22" x2="50" y2="24" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="22" x2="14" y2="24" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* Pokal */}
      <path d="M22 16 L42 16 L40 36 Q40 42 32 42 Q24 42 24 36 Z" fill="url(#af-orange-pink)" />
      <path d="M22 16 L42 16 L42 18 L22 18 Z" fill="white" opacity="0.3" />
      {/* Handtag */}
      <path d="M22 20 Q14 20 14 28 Q14 32 18 32" fill="none" stroke="url(#af-orange-red)" strokeWidth="2" strokeLinecap="round" />
      <path d="M42 20 Q50 20 50 28 Q50 32 46 32" fill="none" stroke="url(#af-orange-red)" strokeWidth="2" strokeLinecap="round" />
      {/* Bas */}
      <rect x="26" y="42" width="12" height="4" fill="url(#af-orange-red)" />
      <rect x="22" y="46" width="20" height="6" rx="1" fill="#1E293B" />
      {/* Stjärna i mitten */}
      <path d="M32 23 L33.5 27 L37.5 27 L34.5 29.5 L36 33.5 L32 31 L28 33.5 L29.5 29.5 L26.5 27 L30.5 27 Z" fill="white" />
    </svg>
  );
}

export function DownloadCloudIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <path d="M16 38 Q8 38 8 30 Q8 22 16 22 Q18 14 28 14 Q40 14 42 24 Q52 24 52 32 Q52 40 44 40" fill="white" stroke="url(#af-orange-red)" strokeWidth="1.75" />
      <line x1="32" y1="32" x2="32" y2="50" stroke="url(#af-orange-red)" strokeWidth="2.5" strokeLinecap="round" />
      <polyline points="24,42 32,50 40,42" fill="none" stroke="url(#af-orange-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SaveDocIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="14" y="10" width="36" height="44" rx="4" fill="white" stroke="url(#af-orange-red)" strokeWidth="1.75" />
      <rect x="14" y="10" width="36" height="6" rx="4" fill="url(#af-orange-pink)" />
      <rect x="20" y="22" width="16" height="2" rx="1" fill="#CBD5E1" />
      <rect x="20" y="28" width="24" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="20" y="32" width="22" height="1.5" rx="0.75" fill="#E2E8F0" />
      {/* Spara-cirkel */}
      <circle cx="46" cy="46" r="10" fill="url(#af-emerald)" />
      <path d="M41 46 L44.5 49.5 L51 43" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
