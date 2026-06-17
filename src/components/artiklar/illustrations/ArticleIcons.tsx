/**
 * Custom SVG-ikoner för artikel-sidor.
 *
 * Stil: orange/röd-DNA (#F97316 → #DC2626 → #BE185D), inline SVG, ingen
 * extern asset-fetch. Matchar mönstret från NumericalIcons + MenuIcons.
 */

interface IconProps {
  className?: string;
}

const SW = 2;

// =============================================================
// VERKTYGS-IKONER (för ToolBanner och Sidebar)
// =============================================================

export function CvMallarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="3" width="13" height="16" rx="1.5" stroke="currentColor" strokeWidth={SW} opacity="0.4" />
      <rect x="4" y="5" width="13" height="16" rx="1.5" stroke="currentColor" strokeWidth={SW} fill="white" />
      <line x1="7" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function CvAnalysIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="13" height="16" rx="2" stroke="currentColor" strokeWidth={SW} opacity="0.5" />
      <line x1="6" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.4" />
      <line x1="6" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.4" />
      <circle cx="15" cy="15" r="4.5" stroke="currentColor" strokeWidth={SW} fill="white" />
      <line x1="18.2" y1="18.2" x2="21" y2="21" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
    </svg>
  );
}

export function BrevIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth={SW} />
      <path d="M3 8 L12 13.5 L21 8" stroke="currentColor" strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function JobbmatchningIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth={SW} />
      <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <path d="M8 11 L10 13 L14 9" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RekryteringstestIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Matrislogik-rutnät 2x2 */}
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth={SW} />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth={SW} opacity="0.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth={SW} opacity="0.5" />
      {/* Sista rutan: rätt svar (check) */}
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth={SW} fill="white" />
      <path d="M15.2 17.3 L16.8 18.9 L19.3 15.8" stroke="currentColor" strokeWidth={SW * 0.9} strokeLinecap="round" strokeLinejoin="round" />
      {/* Prick i första rutan för "mönster" */}
      <circle cx="6.75" cy="6.75" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function JobbcoachenIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 5 L20 5 Q21 5 21 6 L21 15 Q21 16 20 16 L11 16 L7 20 L7 16 L4 16 Q3 16 3 15 L3 6 Q3 5 4 5 Z"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" />
      <circle cx="13" cy="10.5" r="1" fill="currentColor" />
      <circle cx="17" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function LinkedinOptimizerIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth={SW} />
      <circle cx="7.5" cy="8" r="1.4" fill="currentColor" />
      <line x1="7.5" y1="11" x2="7.5" y2="17" stroke="currentColor" strokeWidth={SW * 1.4} strokeLinecap="round" />
      <path
        d="M11.5 17 L11.5 11 M11.5 13 Q11.5 11 13.5 11 Q15.5 11 15.5 13.5 L15.5 17"
        stroke="currentColor"
        strokeWidth={SW * 1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// =============================================================
// VERIFIERAD EXPERT — checkmark i orange/röd-gradient (ej grön)
// =============================================================

export function VerifieradExpertCheckmark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="verified-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="0.5" stopColor="#DC2626" />
          <stop offset="1" stopColor="#BE185D" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#verified-grad)" />
      <path d="M7 12 L10.5 15.5 L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// =============================================================
// HERO BACKGROUND PATTERN (subtil, för article hero)
// =============================================================

export function ArticleHeroPattern({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="article-hero-grad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FB923C" stopOpacity="0.08" />
          <stop offset="0.5" stopColor="#DC2626" stopOpacity="0.05" />
          <stop offset="1" stopColor="#BE185D" stopOpacity="0.08" />
        </linearGradient>
        <pattern id="article-hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="16" cy="16" r="1.2" fill="#FB923C" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#article-hero-grad)" />
      <rect width="400" height="400" fill="url(#article-hero-dots)" />
    </svg>
  );
}

// =============================================================
// TRIAL CARD ILLUSTRATION (för sidebar)
// =============================================================

export function TrialCardIllustration({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* CV-pappret */}
      <g transform="translate(20 15) rotate(-6 35 35)">
        <rect x="0" y="0" width="55" height="70" rx="4" fill="white" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
        <rect x="0" y="0" width="55" height="3" fill="#FED7AA" />
        <circle cx="11" cy="13" r="4" fill="#F97316" opacity="0.85" />
        <rect x="20" y="11" width="22" height="2.5" rx="1" fill="#475569" opacity="0.7" />
        <rect x="20" y="16" width="16" height="2" rx="1" fill="#94A3B8" opacity="0.7" />
        <line x1="6" y1="26" x2="49" y2="26" stroke="#FED7AA" />
        <rect x="6" y="32" width="35" height="2" rx="1" fill="#94A3B8" opacity="0.7" />
        <rect x="6" y="38" width="42" height="2" rx="1" fill="#94A3B8" opacity="0.7" />
        <rect x="6" y="44" width="38" height="2" rx="1" fill="#94A3B8" opacity="0.7" />
        <rect x="6" y="52" width="20" height="2.5" rx="1" fill="#1E293B" opacity="0.8" />
        <rect x="6" y="58" width="42" height="2" rx="1" fill="#94A3B8" opacity="0.7" />
        <rect x="6" y="64" width="32" height="2" rx="1" fill="#94A3B8" opacity="0.7" />
      </g>
      {/* Stapeldiagram bakgrund */}
      <g transform="translate(70 35)" opacity="0.85">
        <rect x="0" y="40" width="8" height="20" rx="1.5" fill="white" opacity="0.35" />
        <rect x="11" y="28" width="8" height="32" rx="1.5" fill="white" opacity="0.5" />
        <rect x="22" y="18" width="8" height="42" rx="1.5" fill="white" opacity="0.65" />
        <rect x="33" y="8" width="8" height="52" rx="1.5" fill="white" opacity="0.85" />
      </g>
      {/* Stjärnor */}
      <circle cx="100" cy="20" r="3" fill="#FCD34D" />
      <circle cx="15" cy="85" r="2" fill="#FCD34D" opacity="0.8" />
    </svg>
  );
}

// =============================================================
// MALL-THUMBNAILS (för ArticleTemplateShowcase)
// =============================================================

export function MallThumbnailMinimal({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="100" height="130" rx="4" fill="white" stroke="#FED7AA" strokeWidth="1" />
      <rect x="8" y="10" width="40" height="3" rx="1" fill="#1E293B" />
      <rect x="8" y="16" width="28" height="2" rx="1" fill="#94A3B8" />
      <line x1="8" y1="24" x2="92" y2="24" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="8" y="32" width="20" height="2.5" rx="1" fill="#1E293B" />
      <rect x="8" y="38" width="60" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="42" width="55" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="46" width="58" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="56" width="20" height="2.5" rx="1" fill="#1E293B" />
      <rect x="8" y="62" width="60" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="66" width="55" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="76" width="20" height="2.5" rx="1" fill="#1E293B" />
      <rect x="8" y="82" width="60" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="86" width="58" height="1.5" rx="0.5" fill="#94A3B8" />
    </svg>
  );
}

export function MallThumbnailClassic({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="100" height="130" rx="4" fill="white" stroke="#FED7AA" strokeWidth="1" />
      <rect x="0" y="0" width="100" height="20" fill="#1E293B" />
      <rect x="8" y="6" width="40" height="3" rx="1" fill="white" />
      <rect x="8" y="12" width="28" height="2" rx="1" fill="white" opacity="0.7" />
      <rect x="8" y="28" width="22" height="2.5" rx="1" fill="#1E293B" />
      <line x1="8" y1="32" x2="92" y2="32" stroke="#94A3B8" strokeWidth="0.5" />
      <rect x="8" y="38" width="60" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="42" width="58" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="46" width="55" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="56" width="22" height="2.5" rx="1" fill="#1E293B" />
      <line x1="8" y1="60" x2="92" y2="60" stroke="#94A3B8" strokeWidth="0.5" />
      <rect x="8" y="66" width="60" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="70" width="55" height="1.5" rx="0.5" fill="#94A3B8" />
    </svg>
  );
}

export function MallThumbnailNordic({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="100" height="130" rx="4" fill="white" stroke="#FED7AA" strokeWidth="1" />
      <rect x="0" y="0" width="32" height="130" fill="#1F4E5F" />
      <circle cx="16" cy="22" r="9" fill="white" opacity="0.85" />
      <rect x="4" y="42" width="24" height="2" rx="1" fill="white" opacity="0.85" />
      <rect x="4" y="48" width="20" height="1.5" rx="0.5" fill="white" opacity="0.65" />
      <rect x="4" y="60" width="14" height="2" rx="1" fill="white" opacity="0.85" />
      <rect x="4" y="66" width="22" height="1.5" rx="0.5" fill="white" opacity="0.65" />
      <rect x="4" y="70" width="20" height="1.5" rx="0.5" fill="white" opacity="0.65" />
      {/* Höger sida */}
      <rect x="38" y="10" width="36" height="3" rx="1" fill="#1E293B" />
      <rect x="38" y="16" width="28" height="2" rx="1" fill="#94A3B8" />
      <rect x="38" y="28" width="22" height="2.5" rx="1" fill="#0F766E" />
      <rect x="38" y="34" width="54" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="38" y="38" width="50" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="38" y="42" width="48" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="38" y="52" width="22" height="2.5" rx="1" fill="#0F766E" />
      <rect x="38" y="58" width="54" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="38" y="62" width="48" height="1.5" rx="0.5" fill="#94A3B8" />
    </svg>
  );
}

export function MallThumbnailCreative({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="creative-grad" x1="0" y1="0" x2="100" y2="0">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="130" rx="4" fill="white" stroke="#FED7AA" strokeWidth="1" />
      <path d="M 0 0 L 100 0 L 100 18 L 60 30 L 0 18 Z" fill="url(#creative-grad)" />
      <rect x="8" y="6" width="40" height="3" rx="1" fill="white" />
      <rect x="8" y="12" width="28" height="2" rx="1" fill="white" opacity="0.7" />
      <circle cx="74" cy="36" r="6" fill="#A855F7" opacity="0.3" />
      <rect x="8" y="42" width="20" height="2.5" rx="1" fill="#7C3AED" />
      <rect x="8" y="48" width="60" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="52" width="55" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="62" width="20" height="2.5" rx="1" fill="#7C3AED" />
      <rect x="8" y="68" width="60" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="8" y="72" width="55" height="1.5" rx="0.5" fill="#94A3B8" />
    </svg>
  );
}

// =============================================================
// SHARE-IKONER (matchar share-knappar i orange/röd)
// =============================================================

export function CopyLinkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M10 13 Q 13 16 16 13 L 19 10 Q 22 7 19 4 Q 16 1 13 4 L 12 5"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 11 Q 11 8 8 11 L 5 14 Q 2 17 5 20 Q 8 23 11 20 L 12 19"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
