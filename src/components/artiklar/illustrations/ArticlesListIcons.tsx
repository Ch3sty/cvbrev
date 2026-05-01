/**
 * Custom SVGs för artikel-listsidan /artiklar.
 *
 * Stil: orange/röd-DNA, inline SVG. Matchar mönstret från ArticleIcons +
 * NumericalIcons.
 */

interface IconProps {
  className?: string;
}

// =============================================================
// HERO ILLUSTRATION (för listsidans hero, höger sida)
// =============================================================
export function ArticlesHeroIllustration({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="alist-strip" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FB923C" />
          <stop offset="0.5" stopColor="#DC2626" />
          <stop offset="1" stopColor="#BE185D" />
        </linearGradient>
        <linearGradient id="alist-card-bg" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FB923C" stopOpacity="0.15" />
          <stop offset="1" stopColor="#FB923C" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Bakgrundsartikel (snett) */}
      <g transform="translate(160 30) rotate(8 90 110)" opacity="0.55">
        <rect x="0" y="0" width="160" height="200" rx="14" fill="white" stroke="#FED7AA" strokeWidth="1" />
        <rect x="0" y="0" width="160" height="6" rx="3" fill="#FB923C" opacity="0.8" />
        <rect x="14" y="22" width="80" height="50" rx="6" fill="url(#alist-card-bg)" />
        <rect x="14" y="82" width="50" height="3" rx="1" fill="#FB923C" opacity="0.6" />
        <rect x="14" y="92" width="120" height="4" rx="1" fill="#1E293B" opacity="0.7" />
        <rect x="14" y="102" width="100" height="4" rx="1" fill="#1E293B" opacity="0.7" />
        <rect x="14" y="120" width="130" height="2" rx="1" fill="#94A3B8" />
        <rect x="14" y="128" width="120" height="2" rx="1" fill="#94A3B8" />
        <rect x="14" y="136" width="90" height="2" rx="1" fill="#94A3B8" />
      </g>

      {/* Mellanartikel */}
      <g transform="translate(80 30) rotate(-3 90 110)" opacity="0.85">
        <rect x="0" y="0" width="160" height="200" rx="14" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
        <rect x="0" y="0" width="160" height="7" rx="3" fill="url(#alist-strip)" />
        <rect x="14" y="22" width="132" height="60" rx="6" fill="#FED7AA" opacity="0.45" />
        <circle cx="46" cy="52" r="14" fill="#FB923C" opacity="0.4" />
        <rect x="14" y="92" width="48" height="3" rx="1" fill="#DC2626" opacity="0.7" />
        <rect x="14" y="102" width="120" height="5" rx="1.5" fill="#1E293B" opacity="0.85" />
        <rect x="14" y="112" width="100" height="5" rx="1.5" fill="#1E293B" opacity="0.85" />
        <rect x="14" y="128" width="130" height="2.5" rx="1" fill="#94A3B8" />
        <rect x="14" y="136" width="120" height="2.5" rx="1" fill="#94A3B8" />
        <rect x="14" y="144" width="90" height="2.5" rx="1" fill="#94A3B8" />
        {/* Tags */}
        <rect x="14" y="160" width="34" height="12" rx="6" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="0.5" />
        <rect x="52" y="160" width="34" height="12" rx="6" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="0.5" />
      </g>

      {/* Topparticle (förgrund) */}
      <g transform="translate(20 70) rotate(4 90 90)">
        {/* Skugga */}
        <rect x="6" y="14" width="160" height="180" rx="14" fill="rgba(0,0,0,0.18)" filter="blur(4px)" />
        <rect x="0" y="0" width="160" height="180" rx="14" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
        <rect x="0" y="0" width="160" height="8" rx="3" fill="url(#alist-strip)" />
        <rect x="14" y="22" width="132" height="56" rx="6" fill="#FED7AA" opacity="0.55" />
        {/* Avatar */}
        <circle cx="44" cy="50" r="12" fill="url(#alist-strip)" />
        {/* Tags-rad */}
        <rect x="14" y="88" width="40" height="3" rx="1" fill="#DC2626" />
        <rect x="58" y="88" width="32" height="3" rx="1" fill="#DC2626" opacity="0.6" />
        {/* Title */}
        <rect x="14" y="100" width="120" height="6" rx="1.5" fill="#1E293B" />
        <rect x="14" y="110" width="100" height="6" rx="1.5" fill="#1E293B" />
        {/* Body */}
        <rect x="14" y="124" width="130" height="2.5" rx="1" fill="#94A3B8" />
        <rect x="14" y="132" width="124" height="2.5" rx="1" fill="#94A3B8" />
        <rect x="14" y="140" width="80" height="2.5" rx="1" fill="#94A3B8" />
        {/* Footer-pillar */}
        <rect x="14" y="156" width="32" height="10" rx="5" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="0.5" />
        <rect x="50" y="156" width="32" height="10" rx="5" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="0.5" />
      </g>

      {/* Decor-prickar */}
      <circle cx="20" cy="50" r="3" fill="#FB923C" opacity="0.6" />
      <circle cx="300" cy="240" r="4" fill="#DC2626" opacity="0.5" />
      <circle cx="280" cy="60" r="3" fill="#BE185D" opacity="0.4" />
    </svg>
  );
}

// =============================================================
// EMPTY-STATE illustration (när filter ger 0 träffar)
// =============================================================
export function ArticlesEmptyIllustration({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aempty-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="74" fill="#FFF7ED" />
      <circle cx="80" cy="80" r="74" stroke="#FED7AA" strokeWidth="1.5" strokeDasharray="3 4" />
      {/* Tom artikel-stack */}
      <rect x="42" y="44" width="76" height="76" rx="8" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
      <rect x="42" y="44" width="76" height="4" rx="2" fill="url(#aempty-bar)" />
      <line x1="54" y1="64" x2="100" y2="64" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="74" x2="92" y2="74" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="84" x2="100" y2="84" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="94" x2="84" y2="94" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      {/* Lupp */}
      <circle cx="106" cy="106" r="14" fill="white" stroke="#FB923C" strokeWidth="2.5" />
      <line x1="116" y1="116" x2="124" y2="124" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      <text x="106" y="111" fontSize="14" fontWeight="900" fill="#DC2626" textAnchor="middle">?</text>
    </svg>
  );
}

// =============================================================
// FEATURED-ICON (för "Utvalda artiklar"-rubrik)
// =============================================================
export function FeaturedStarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 2 L14.5 8.5 L21.5 9 L16 13.5 L18 20.5 L12 16.5 L6 20.5 L8 13.5 L2.5 9 L9.5 8.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

// =============================================================
// FEED-CTA-ILLUSTRATION (för InlineFeedCTA, kompakt)
// =============================================================
export function FeedCTAIllustration({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Stapeldiagram */}
      <line x1="14" y1="64" x2="86" y2="64" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <rect x="20" y="46" width="10" height="18" rx="2" fill="white" opacity="0.4" />
      <rect x="34" y="32" width="10" height="32" rx="2" fill="white" opacity="0.6" />
      <rect x="48" y="22" width="10" height="42" rx="2" fill="white" opacity="0.8" />
      <rect x="62" y="14" width="10" height="50" rx="2" fill="white" />
      {/* Pil upp */}
      <path
        d="M 18 32 L 30 22 L 44 26 L 56 14 L 70 8"
        stroke="#FCD34D"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="70" cy="8" r="3" fill="#FCD34D" />
    </svg>
  );
}
