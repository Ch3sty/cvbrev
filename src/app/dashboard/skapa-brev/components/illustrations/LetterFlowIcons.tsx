'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="lf-orange-red" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="lf-orange-pink" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="lf-emerald" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
  </defs>
);

export function CvDocumentIcon({ className = 'w-16 h-16' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="14" y="10" width="32" height="44" rx="4" fill="white" stroke="url(#lf-orange-red)" strokeWidth="1.75" />
      <rect x="14" y="10" width="32" height="6" rx="4" fill="url(#lf-orange-pink)" />
      <circle cx="22" cy="26" r="3.5" fill="#FED7AA" />
      <rect x="29" y="23" width="13" height="2" rx="1" fill="#CBD5E1" />
      <rect x="29" y="27" width="9" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="18" y="34" width="24" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="18" y="38" width="20" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="18" y="42" width="22" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="18" y="46" width="16" height="1.5" rx="0.75" fill="#E2E8F0" />
      <circle cx="48" cy="48" r="9" fill="url(#lf-emerald)" />
      <path d="M44 48 L47 51 L52 45" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function JobPostingIcon({ className = 'w-16 h-16' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="10" y="14" width="44" height="36" rx="5" fill="white" stroke="url(#lf-orange-red)" strokeWidth="1.75" />
      <rect x="10" y="14" width="44" height="6" rx="5" fill="url(#lf-orange-pink)" />
      <circle cx="14" cy="17" r="0.9" fill="white" />
      <circle cx="17.5" cy="17" r="0.9" fill="white" />
      <circle cx="21" cy="17" r="0.9" fill="white" />
      <rect x="15" y="26" width="24" height="2.5" rx="1.25" fill="#FB923C" />
      <rect x="15" y="31" width="34" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="15" y="35" width="30" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="15" y="39" width="32" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="15" y="43" width="20" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="42" y="42" width="9" height="5" rx="2.5" fill="url(#lf-orange-red)" />
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
        <rect x="22" y="12" width="22" height="4" rx="3" fill="url(#lf-orange-red)" />
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

export function ToneIcon({ className = 'w-16 h-16' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="10" y="14" width="44" height="36" rx="5" fill="white" stroke="url(#lf-orange-red)" strokeWidth="1.75" />
      <g transform="translate(16 24)">
        <rect x="0" y="6" width="3" height="14" rx="1.5" fill="#FB923C" />
        <rect x="6" y="2" width="3" height="18" rx="1.5" fill="url(#lf-orange-red)" />
        <rect x="12" y="9" width="3" height="11" rx="1.5" fill="#FB923C" />
        <rect x="18" y="0" width="3" height="20" rx="1.5" fill="url(#lf-orange-pink)" />
        <rect x="24" y="5" width="3" height="15" rx="1.5" fill="url(#lf-orange-red)" />
        <rect x="30" y="10" width="3" height="10" rx="1.5" fill="#FB923C" />
      </g>
      <circle cx="48" cy="22" r="5" fill="url(#lf-orange-pink)" />
      <text x="48" y="25" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white" fontFamily="system-ui">A</text>
    </svg>
  );
}

export function PreviewIcon({ className = 'w-16 h-16' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="12" y="10" width="34" height="44" rx="4" fill="white" stroke="url(#lf-orange-red)" strokeWidth="1.75" />
      <rect x="12" y="10" width="34" height="5" rx="4" fill="url(#lf-orange-pink)" />
      <rect x="16" y="20" width="20" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="16" y="24" width="26" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="16" y="28" width="24" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="16" y="32" width="22" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="16" y="36" width="20" height="1.5" rx="0.75" fill="#E2E8F0" />
      <circle cx="46" cy="46" r="11" fill="white" stroke="url(#lf-orange-red)" strokeWidth="2.25" />
      <path d="M40 46 Q46 40 52 46 Q46 52 40 46 Z" fill="none" stroke="url(#lf-orange-red)" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="46" cy="46" r="2.25" fill="url(#lf-orange-red)" />
    </svg>
  );
}

export function HeroLetterIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="10" y="12" width="36" height="44" rx="4" fill="white" stroke="url(#lf-orange-red)" strokeWidth="1.75" />
      <rect x="10" y="12" width="36" height="6" rx="4" fill="url(#lf-orange-pink)" />
      <rect x="15" y="24" width="14" height="2" rx="1" fill="#CBD5E1" />
      <rect x="15" y="30" width="26" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="15" y="34" width="24" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="15" y="38" width="26" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="15" y="42" width="20" height="1.5" rx="0.75" fill="#E2E8F0" />
      <rect x="15" y="46" width="22" height="1.5" rx="0.75" fill="#E2E8F0" />
      <g transform="translate(38 30) rotate(35)">
        <rect x="-1.5" y="0" width="3" height="22" rx="1.5" fill="url(#lf-orange-red)" />
        <polygon points="-2.5,22 0,28 2.5,22" fill="#1E293B" />
        <rect x="-1.5" y="-3" width="3" height="3" fill="#FB923C" />
      </g>
      <circle cx="50" cy="16" r="2" fill="#FB923C" opacity="0.7" />
      <circle cx="55" cy="22" r="1.5" fill="#FB923C" opacity="0.5" />
      <circle cx="52" cy="28" r="1" fill="#FB923C" opacity="0.4" />
    </svg>
  );
}

export function PrefillSparkleIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="14" y="12" width="28" height="40" rx="4" fill="white" stroke="url(#lf-orange-red)" strokeWidth="1.75" />
      <rect x="14" y="12" width="28" height="5" rx="4" fill="url(#lf-orange-pink)" />
      <rect x="18" y="22" width="14" height="1.5" rx="0.75" fill="#FED7AA" />
      <rect x="18" y="26" width="20" height="1.25" rx="0.625" fill="#E2E8F0" />
      <rect x="18" y="30" width="18" height="1.25" rx="0.625" fill="#E2E8F0" />
      <rect x="18" y="34" width="20" height="1.25" rx="0.625" fill="#E2E8F0" />
      <rect x="18" y="38" width="14" height="1.25" rx="0.625" fill="#E2E8F0" />
      <g transform="translate(46 14)">
        <path d="M5 0 L6.5 3.5 L10 5 L6.5 6.5 L5 10 L3.5 6.5 L0 5 L3.5 3.5 Z" fill="url(#lf-orange-pink)" />
      </g>
      <g transform="translate(48 38)">
        <path d="M3 0 L4 2 L6 3 L4 4 L3 6 L2 4 L0 3 L2 2 Z" fill="url(#lf-orange-red)" />
      </g>
    </svg>
  );
}
