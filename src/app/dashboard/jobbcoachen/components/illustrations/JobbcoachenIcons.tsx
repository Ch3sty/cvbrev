'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="jc-orange-red" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="jc-orange-pink" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="jc-emerald" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
  </defs>
);

/**
 * Hero-illustration: chat-orb i orange/röd-pink-gradient med stiliserad
 * chat-bubbla i mitten och tre datapunkter runtom (CV, annons, källor)
 * som visar vad coachen analyserar.
 */
export function JobbcoachenChatOrb({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Yttre halo */}
      <circle cx="32" cy="32" r="28" fill="url(#jc-orange-red)" opacity="0.08" />

      {/* Orb-bakgrund (rounded square) */}
      <rect x="14" y="14" width="36" height="36" rx="11" fill="url(#jc-orange-pink)" />

      {/* Subtil glanseffekt */}
      <ellipse cx="22" cy="22" rx="8" ry="4" fill="white" fillOpacity="0.18" />

      {/* Chat-bubbla i mitten */}
      <g transform="translate(20 22)">
        <path
          d="M 2 4 Q 2 0, 6 0 L 18 0 Q 22 0, 22 4 L 22 12 Q 22 16, 18 16 L 12 16 L 8 20 L 8 16 L 6 16 Q 2 16, 2 12 Z"
          fill="white"
          fillOpacity="0.95"
        />
        {/* Tre prickar i bubblan */}
        <circle cx="8" cy="8" r="1.25" fill="#DC2626" />
        <circle cx="12" cy="8" r="1.25" fill="#DC2626" />
        <circle cx="16" cy="8" r="1.25" fill="#DC2626" />
      </g>

      {/* Datapunkter runtom */}
      {/* CV-papper, övre vänster */}
      <g transform="translate(4 8)">
        <rect x="0" y="0" width="9" height="11" rx="1.5" fill="white" stroke="url(#jc-orange-red)" strokeWidth="1" />
        <line x1="2" y1="3" x2="7" y2="3" stroke="#FB923C" strokeWidth="0.8" />
        <line x1="2" y1="5.5" x2="6" y2="5.5" stroke="#E2E8F0" strokeWidth="0.7" />
        <line x1="2" y1="8" x2="7" y2="8" stroke="#E2E8F0" strokeWidth="0.7" />
      </g>

      {/* Annons, övre höger */}
      <g transform="translate(51 6)">
        <rect x="0" y="2" width="10" height="8" rx="1.5" fill="white" stroke="url(#jc-orange-red)" strokeWidth="1" />
        <rect x="3.5" y="0" width="3" height="3" rx="0.5" fill="white" stroke="url(#jc-orange-red)" strokeWidth="0.8" />
        <line x1="2" y1="6" x2="8" y2="6" stroke="#FB923C" strokeWidth="0.8" />
      </g>

      {/* Källa/bok, nedre center */}
      <g transform="translate(28 52)">
        <rect x="0" y="0" width="10" height="8" rx="1" fill="white" stroke="url(#jc-emerald)" strokeWidth="1" />
        <line x1="5" y1="0" x2="5" y2="8" stroke="url(#jc-emerald)" strokeWidth="0.8" />
        <line x1="2" y1="3" x2="3.5" y2="3" stroke="#10B981" strokeWidth="0.7" />
        <line x1="6.5" y1="3" x2="8" y2="3" stroke="#10B981" strokeWidth="0.7" />
      </g>

      {/* Förbindelse-linjer (dashed) */}
      <line x1="13" y1="14" x2="20" y2="22" stroke="white" strokeOpacity="0.45" strokeWidth="0.8" strokeDasharray="1 2" />
      <line x1="51" y1="14" x2="44" y2="22" stroke="white" strokeOpacity="0.45" strokeWidth="0.8" strokeDasharray="1 2" />
      <line x1="33" y1="50" x2="33" y2="44" stroke="white" strokeOpacity="0.45" strokeWidth="0.8" strokeDasharray="1 2" />
    </svg>
  );
}

/**
 * Document-share-illustration: ett CV-papper med en chat-bubbla som "kommer ut"
 * ur det. Vit dokument med orange-gradient toppstreck, chat-bubbla i emerald.
 * Subtila partiklar antyder dataflöde.
 */
export function DocumentShareIcon({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* CV-dokument */}
      <g transform="translate(8 12)">
        <rect x="0" y="0" width="28" height="38" rx="3" fill="white" stroke="url(#jc-orange-red)" strokeWidth="1.75" />
        <rect x="0" y="0" width="28" height="4" rx="3" fill="url(#jc-orange-pink)" />
        {/* Profilrad */}
        <circle cx="6" cy="11" r="2.5" fill="#FED7AA" />
        <rect x="11" y="9" width="11" height="1.5" rx="0.75" fill="#CBD5E1" />
        <rect x="11" y="12" width="8" height="1" rx="0.5" fill="#E2E8F0" />
        {/* Innehållsrader */}
        <rect x="3" y="18" width="22" height="1.25" rx="0.625" fill="#FB923C" opacity="0.6" />
        <rect x="3" y="22" width="20" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="3" y="25" width="22" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="3" y="28" width="18" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="3" y="32" width="20" height="1" rx="0.5" fill="#E2E8F0" />
      </g>

      {/* Chat-bubbla som kommer ut ur dokumentet (höger sida) */}
      <g transform="translate(36 22)">
        {/* Bubbla */}
        <path
          d="M 4 0 L 22 0 Q 26 0, 26 4 L 26 14 Q 26 18, 22 18 L 12 18 L 8 22 L 8 18 L 4 18 Q 0 18, 0 14 L 0 4 Q 0 0, 4 0 Z"
          fill="url(#jc-emerald)"
          stroke="white"
          strokeWidth="1.25"
        />
        {/* Glansighet */}
        <ellipse cx="8" cy="4" rx="5" ry="1.5" fill="white" fillOpacity="0.25" />
        {/* Tre prickar */}
        <circle cx="8" cy="9" r="1.25" fill="white" />
        <circle cx="13" cy="9" r="1.25" fill="white" />
        <circle cx="18" cy="9" r="1.25" fill="white" />
      </g>

      {/* Förbindelselinje från dokument till bubbla */}
      <path
        d="M 32 28 Q 34 26, 36 27"
        stroke="url(#jc-emerald)"
        strokeWidth="1.25"
        fill="none"
        strokeDasharray="1.5 2"
      />

      {/* Partiklar som flyter ut */}
      <circle cx="58" cy="14" r="1.5" fill="#10B981" opacity="0.65" />
      <circle cx="60" cy="22" r="1" fill="#10B981" opacity="0.45" />
      <circle cx="56" cy="48" r="1.25" fill="#FB923C" opacity="0.6" />
      <circle cx="59" cy="52" r="0.85" fill="#FB923C" opacity="0.4" />
      <circle cx="6" cy="54" r="0.9" fill="#FB923C" opacity="0.4" />
      <circle cx="4" cy="6" r="1" fill="#FB923C" opacity="0.5" />
    </svg>
  );
}

/**
 * Liten chat-bubbla-ikon för use-cases-pillarna i ShareDocumentsCard.
 * 24x24-ish, mer kompakt.
 */
export function ChatBubbleSmallIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M 3 6 Q 3 3, 6 3 L 18 3 Q 21 3, 21 6 L 21 14 Q 21 17, 18 17 L 11 17 L 7 21 L 7 17 L 6 17 Q 3 17, 3 14 Z"
        fill="url(#jc-bubble-grad)"
      />
      <defs>
        <linearGradient id="jc-bubble-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
    </svg>
  );
}
