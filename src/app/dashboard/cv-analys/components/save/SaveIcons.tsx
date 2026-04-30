'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="save-orange-red" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="save-orange-pink" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="save-emerald" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
  </defs>
);

/**
 * Spara på Jobbcoach.ai - moln med disk
 */
export function SaveCloudIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Moln */}
      <path
        d="M14 30 Q8 30 8 24 Q8 18 14 18 Q15 12 22 12 Q30 12 32 19 Q40 19 40 25 Q40 31 34 31"
        fill="white"
        stroke="url(#save-orange-red)"
        strokeWidth="1.5"
      />

      {/* Disk i mitten */}
      <g transform="translate(15 24)">
        <rect width="18" height="14" rx="2" fill="url(#save-orange-pink)" />
        {/* Disk-spår */}
        <rect x="3" y="2" width="12" height="3" rx="0.5" fill="white" opacity="0.85" />
        <rect x="3" y="6" width="12" height="6" rx="0.5" fill="white" opacity="0.4" />
        {/* Disk-flik */}
        <rect x="11" y="0" width="4" height="3" fill="#9A3412" />
      </g>
    </svg>
  );
}

/**
 * Ladda ned - moln med pil ner och dokument
 */
export function DownloadCloudIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Moln */}
      <path
        d="M14 22 Q8 22 8 16 Q8 10 14 10 Q15 4 22 4 Q30 4 32 11 Q40 11 40 17 Q40 23 34 23"
        fill="white"
        stroke="url(#save-orange-red)"
        strokeWidth="1.5"
      />

      {/* Pil ner */}
      <g transform="translate(24 26)">
        <line x1="0" y1="0" x2="0" y2="14" stroke="url(#save-orange-red)" strokeWidth="3" strokeLinecap="round" />
        <polyline points="-6,8 0,14 6,8" stroke="url(#save-orange-red)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Dokument-skugga längst ner */}
      <rect x="15" y="40" width="18" height="2" rx="1" fill="url(#save-orange-red)" opacity="0.3" />
    </svg>
  );
}

/**
 * Spara + Ladda ned - kombo
 */
export function SaveDownloadIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Moln */}
      <path
        d="M12 24 Q6 24 6 18 Q6 12 12 12 Q13 6 20 6 Q28 6 30 13 Q38 13 38 19 Q38 25 32 25"
        fill="white"
        stroke="url(#save-orange-red)"
        strokeWidth="1.5"
      />

      {/* Disk */}
      <g transform="translate(13 18)">
        <rect width="14" height="11" rx="1.75" fill="url(#save-orange-pink)" />
        <rect x="2" y="1.5" width="10" height="2.5" rx="0.4" fill="white" opacity="0.85" />
        <rect x="2" y="5" width="10" height="4.5" rx="0.4" fill="white" opacity="0.4" />
        <rect x="9" y="0" width="3" height="2.5" fill="#9A3412" />
      </g>

      {/* Pil ner till höger */}
      <g transform="translate(34 28)">
        <circle r="9" fill="url(#save-emerald)" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <polyline points="-3,1 0,4 3,1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
