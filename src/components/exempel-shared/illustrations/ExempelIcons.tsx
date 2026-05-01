/**
 * Custom SVGs för brev/CV-exempel-sidor.
 *
 * - RelateradeThumb: Mini-thumbnail för relaterade-yrken-grid
 *   Två varianter: 'letter' (brev) och 'cv'
 */

interface RelateradeThumbProps {
  variant: 'letter' | 'cv';
  className?: string;
}

export function RelateradeThumb({ variant, className }: RelateradeThumbProps) {
  if (variant === 'letter') {
    return (
      <svg
        width="80"
        height="100"
        viewBox="0 0 80 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rel-letter-strip" x1="0" y1="0" x2="80" y2="0">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
        </defs>
        {/* Skugga */}
        <rect x="3" y="5" width="74" height="92" rx="6" fill="rgba(220, 38, 38, 0.12)" />
        {/* Papper */}
        <rect x="2" y="2" width="74" height="92" rx="6" fill="white" stroke="#FED7AA" strokeWidth="1" />
        {/* Strip */}
        <rect x="2" y="2" width="74" height="3" rx="1.5" fill="url(#rel-letter-strip)" />
        {/* Header-rad (namn) */}
        <rect x="10" y="14" width="34" height="4" rx="1" fill="#DC2626" opacity="0.7" />
        {/* Datum */}
        <rect x="56" y="14" width="14" height="2.5" rx="1" fill="#CBD5E1" />
        {/* Hälsning */}
        <rect x="10" y="26" width="22" height="2.5" rx="1" fill="#475569" />
        {/* Paragrafer */}
        {[34, 40, 46, 52, 58, 64, 70, 76, 82].map((y, i) => {
          const widths = [60, 56, 58, 50, 60, 54, 58, 48, 26];
          return (
            <rect
              key={i}
              x="10"
              y={y}
              width={widths[i]}
              height="2"
              rx="1"
              fill="#94A3B8"
              opacity={0.7}
            />
          );
        })}
      </svg>
    );
  }

  return (
    <svg
      width="80"
      height="100"
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rel-cv-strip" x1="0" y1="0" x2="80" y2="0">
          <stop offset="0" stopColor="#FB923C" />
          <stop offset="0.5" stopColor="#DC2626" />
          <stop offset="1" stopColor="#BE185D" />
        </linearGradient>
        <linearGradient id="rel-cv-avatar" x1="0" y1="0" x2="14" y2="14">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      {/* Skugga */}
      <rect x="3" y="5" width="74" height="92" rx="6" fill="rgba(220, 38, 38, 0.12)" />
      {/* Papper */}
      <rect x="2" y="2" width="74" height="92" rx="6" fill="white" stroke="#FED7AA" strokeWidth="1" />
      {/* Strip */}
      <rect x="2" y="2" width="74" height="3" rx="1.5" fill="url(#rel-cv-strip)" />
      {/* Avatar */}
      <circle cx="16" cy="18" r="6" fill="url(#rel-cv-avatar)" />
      {/* Namn-rad */}
      <rect x="26" y="14" width="36" height="3.5" rx="1" fill="#DC2626" opacity="0.8" />
      {/* Titel */}
      <rect x="26" y="20" width="28" height="2.5" rx="1" fill="#94A3B8" />
      {/* Divider */}
      <line x1="10" y1="32" x2="70" y2="32" stroke="#FED7AA" strokeWidth="1" />
      {/* Sektion 1 rubrik */}
      <rect x="10" y="38" width="20" height="3" rx="1" fill="#1E293B" />
      {/* Item-rader */}
      <rect x="10" y="46" width="42" height="2.5" rx="1" fill="#475569" />
      <rect x="10" y="51" width="32" height="2" rx="1" fill="#94A3B8" />
      <rect x="10" y="58" width="60" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="10" y="62" width="50" height="1.5" rx="0.75" fill="#CBD5E1" />
      {/* Divider */}
      <line x1="10" y1="70" x2="70" y2="70" stroke="#FED7AA" strokeWidth="1" />
      {/* Pills */}
      <rect x="10" y="76" width="14" height="6" rx="3" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="0.5" />
      <rect x="26" y="76" width="18" height="6" rx="3" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="0.5" />
      <rect x="46" y="76" width="14" height="6" rx="3" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="0.5" />
    </svg>
  );
}
