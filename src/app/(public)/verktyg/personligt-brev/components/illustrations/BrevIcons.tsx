/**
 * Custom SVG-illustrationer för /verktyg/personligt-brev landningssida.
 * Stil: orange/röd/magenta-DNA med Defs-pattern (warm/deep/soft gradienter).
 * Hero-motiv är större (120×120), step-ikoner 48×48, tips-ikoner 32×32,
 * mall-thumbnails 60×80.
 */

interface IllustrationProps {
  className?: string;
}

const Defs = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F97316" />
      <stop offset="1" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id={`${id}-deep`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#DC2626" />
      <stop offset="1" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id={`${id}-soft`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFEDD5" />
      <stop offset="1" stopColor="#FED7AA" />
    </linearGradient>
  </defs>
);

// =============================================================
// HERO — kuvert med brev som glider ut + pulserande nyckelord-prickar
// =============================================================
export function BrevHeroIcon({ className }: IllustrationProps) {
  const id = 'brev-hero';
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      {/* Soft bakgrunds-blob */}
      <circle cx="60" cy="60" r="52" fill={`url(#${id}-soft)`} opacity="0.8" />

      {/* Kuvert (botten) */}
      <g transform="translate(20 56)">
        <rect
          x="0"
          y="0"
          width="80"
          height="48"
          rx="4"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1.5"
        />
        {/* Kuvert-flap (öppnad) */}
        <path
          d="M0 0 L40 22 L80 0"
          stroke="#FB923C"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
      </g>

      {/* Brev som glider upp ur kuvertet */}
      <g transform="translate(28 24)">
        <rect
          x="0"
          y="0"
          width="64"
          height="68"
          rx="6"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1.5"
        />
        {/* Topplist gradient */}
        <rect x="0" y="0" width="64" height="5" fill={`url(#${id}-warm)`} />

        {/* Avsändare-rad */}
        <line
          x1="8"
          y1="14"
          x2="28"
          y2="14"
          stroke="#1E293B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="20"
          x2="22"
          y2="20"
          stroke="#94A3B8"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Mottagare-rad (höger justerad) */}
        <line
          x1="38"
          y1="14"
          x2="56"
          y2="14"
          stroke="#94A3B8"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Brevtext rader */}
        <line
          x1="8"
          y1="30"
          x2="56"
          y2="30"
          stroke="#CBD5E1"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Highlightad nyckelord-rad */}
        <rect
          x="8"
          y="35"
          width="32"
          height="3"
          rx="1.5"
          fill={`url(#${id}-warm)`}
          opacity="0.85"
        />
        <line
          x1="42"
          y1="36.5"
          x2="56"
          y2="36.5"
          stroke="#CBD5E1"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="44"
          x2="50"
          y2="44"
          stroke="#CBD5E1"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="50"
          x2="56"
          y2="50"
          stroke="#CBD5E1"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="56"
          x2="40"
          y2="56"
          stroke="#CBD5E1"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>

      {/* Pulserande nyckelord-prickar runt brevet */}
      <circle cx="22" cy="28" r="4" fill={`url(#${id}-warm)`} />
      <circle cx="22" cy="28" r="7" fill="#F97316" opacity="0.18" />

      <circle cx="100" cy="36" r="3" fill={`url(#${id}-deep)`} />
      <circle cx="100" cy="36" r="5.5" fill="#BE185D" opacity="0.18" />

      <circle cx="98" cy="84" r="3.5" fill={`url(#${id}-warm)`} />
      <circle cx="98" cy="84" r="6" fill="#DC2626" opacity="0.18" />

      <circle cx="18" cy="80" r="2.5" fill={`url(#${id}-warm)`} />
    </svg>
  );
}

// =============================================================
// STEP-IKONER — för "Så funkar det" (48×48)
// =============================================================

export function IconCV({ className }: IllustrationProps) {
  const id = 'icon-cv';
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <rect x="4" y="4" width="40" height="40" rx="10" fill={`url(#${id}-soft)`} />
      <rect
        x="13"
        y="11"
        width="22"
        height="28"
        rx="3"
        fill="white"
        stroke="#FB923C"
        strokeWidth="1.4"
      />
      <rect x="13" y="11" width="22" height="3" fill={`url(#${id}-warm)`} />
      <circle cx="19" cy="22" r="2.5" fill={`url(#${id}-warm)`} opacity="0.4" />
      <line x1="24" y1="20" x2="32" y2="20" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="24" y1="24" x2="30" y2="24" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="29" x2="32" y2="29" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="33" x2="28" y2="33" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="36" cy="38" r="5" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.6" />
      <path d="M33.5 38 L35 39.5 L38.5 36" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconAnnons({ className }: IllustrationProps) {
  const id = 'icon-annons';
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <rect x="4" y="4" width="40" height="40" rx="10" fill={`url(#${id}-soft)`} />
      <rect
        x="10"
        y="12"
        width="28"
        height="24"
        rx="3"
        fill="white"
        stroke="#FB923C"
        strokeWidth="1.4"
      />
      {/* Rubrik */}
      <rect x="14" y="16" width="14" height="3" rx="1.5" fill={`url(#${id}-deep)`} />
      {/* Highlightade nyckelord */}
      <rect x="14" y="22" width="8" height="3" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.9" />
      <rect x="24" y="22" width="6" height="3" rx="1.5" fill={`url(#${id}-warm)`} opacity="0.9" />
      <line x1="14" y1="28" x2="32" y2="28" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="31.5" x2="28" y2="31.5" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Förstoringsglas */}
      <circle cx="34" cy="34" r="5" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.8" />
      <line x1="38" y1="38" x2="41" y2="41" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconMall({ className }: IllustrationProps) {
  const id = 'icon-mall';
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <rect x="4" y="4" width="40" height="40" rx="10" fill={`url(#${id}-soft)`} />
      {/* Tre staplade brev-mockups */}
      <rect x="9" y="14" width="14" height="20" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.2" transform="rotate(-6 16 24)" />
      <rect x="17" y="11" width="14" height="22" rx="2" fill="white" stroke="#FB923C" strokeWidth="1.4" />
      <rect x="17" y="11" width="14" height="2.5" fill={`url(#${id}-warm)`} />
      <line x1="20" y1="17" x2="28" y2="17" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="20" y1="21" x2="28" y2="21" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="24" x2="26" y2="24" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="27" x2="28" y2="27" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="30" x2="25" y2="30" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <rect x="25" y="14" width="14" height="22" rx="2" fill="white" stroke="#FED7AA" strokeWidth="1.2" transform="rotate(6 32 25)" />
      {/* Penna-accent */}
      <circle cx="36" cy="36" r="5" fill={`url(#${id}-deep)`} />
      <path d="M34 36 L36 38 L38.5 35" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconKlart({ className }: IllustrationProps) {
  const id = 'icon-klart';
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <rect x="4" y="4" width="40" height="40" rx="10" fill={`url(#${id}-soft)`} />
      <rect
        x="13"
        y="10"
        width="22"
        height="28"
        rx="3"
        fill="white"
        stroke="#FB923C"
        strokeWidth="1.4"
      />
      <rect x="13" y="10" width="22" height="3" fill={`url(#${id}-warm)`} />
      <line x1="16" y1="18" x2="32" y2="18" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="22" x2="29" y2="22" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="26" x2="32" y2="26" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="30" x2="26" y2="30" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Download arrow */}
      <circle cx="35" cy="36" r="7" fill={`url(#${id}-warm)`} />
      <path d="M35 32.5 L35 38.5 M32 35.5 L35 38.5 L38 35.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// =============================================================
// TIPS-IKONER (32×32)
// =============================================================

export function IconNyckelord({ className }: IllustrationProps) {
  const id = 'tip-key';
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      <circle cx="11" cy="16" r="5" fill="none" stroke={`url(#${id}-warm)`} strokeWidth="2" />
      <line x1="15" y1="16" x2="25" y2="16" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="16" x2="22" y2="20" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="16" x2="25" y2="19" stroke={`url(#${id}-warm)`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSiffra({ className }: IllustrationProps) {
  const id = 'tip-num';
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      {/* Stigande staplar */}
      <rect x="7" y="20" width="4" height="6" rx="1" fill={`url(#${id}-warm)`} opacity="0.5" />
      <rect x="13" y="16" width="4" height="10" rx="1" fill={`url(#${id}-warm)`} opacity="0.7" />
      <rect x="19" y="11" width="4" height="15" rx="1" fill={`url(#${id}-warm)`} />
      {/* Pil upp */}
      <path d="M9 12 L23 7" stroke={`url(#${id}-deep)`} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 7 L23 7 L23 11" stroke={`url(#${id}-deep)`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLangd({ className }: IllustrationProps) {
  const id = 'tip-len';
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      {/* Linjal-stil */}
      <rect x="7" y="13" width="18" height="6" rx="1.5" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="10" y1="13" x2="10" y2="16" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <line x1="13" y1="13" x2="13" y2="17" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <line x1="16" y1="13" x2="16" y2="16" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <line x1="19" y1="13" x2="19" y2="17" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
      <line x1="22" y1="13" x2="22" y2="16" stroke={`url(#${id}-warm)`} strokeWidth="1.4" />
    </svg>
  );
}

export function IconTon({ className }: IllustrationProps) {
  const id = 'tip-tone';
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      {/* Pratbubbla */}
      <path
        d="M8 12 Q8 8 12 8 L21 8 Q25 8 25 12 L25 17 Q25 21 21 21 L15 21 L11 24 L11 21 Q8 21 8 17 Z"
        fill="white"
        stroke={`url(#${id}-warm)`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="14.5" r="1.2" fill={`url(#${id}-warm)`} />
      <circle cx="16.5" cy="14.5" r="1.2" fill={`url(#${id}-warm)`} />
      <circle cx="20" cy="14.5" r="1.2" fill={`url(#${id}-warm)`} />
    </svg>
  );
}

export function IconStruktur({ className }: IllustrationProps) {
  const id = 'tip-str';
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-soft)`} />
      <rect x="9" y="7" width="14" height="18" rx="2" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="12" y1="11" x2="20" y2="11" stroke={`url(#${id}-deep)`} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="15" x2="19" y2="15" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="20" y2="18" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="21" x2="17" y2="21" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// =============================================================
// MALL-THUMBNAILS (60×80) — abstraherade representationer
// =============================================================

interface ThumbProps {
  className?: string;
}

export function ThumbKlassisk({ className }: ThumbProps) {
  const id = 'th-klassisk';
  return (
    <svg className={className} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="0" y="0" width="60" height="80" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1" />
      {/* Header centrerad */}
      <rect x="14" y="8" width="32" height="3" rx="1" fill="#1E293B" />
      <rect x="18" y="14" width="24" height="2" rx="1" fill="#94A3B8" />
      {/* Body rader */}
      <line x1="8" y1="26" x2="52" y2="26" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="8" y1="32" x2="48" y2="32" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="8" y1="38" x2="52" y2="38" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="8" y1="44" x2="44" y2="44" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="8" y1="50" x2="50" y2="50" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="8" y1="56" x2="46" y2="56" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="8" y1="62" x2="40" y2="62" stroke="#CBD5E1" strokeWidth="1" />
      {/* Signatur */}
      <rect x="8" y="70" width="20" height="2" rx="1" fill="#1E293B" />
    </svg>
  );
}

export function ThumbMinimalist({ className }: ThumbProps) {
  const id = 'th-min';
  return (
    <svg className={className} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="0" y="0" width="60" height="80" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1" />
      {/* Generösa marginaler, tunn linje under header */}
      <rect x="12" y="10" width="22" height="3" rx="1" fill="#1E293B" />
      <line x1="12" y1="18" x2="48" y2="18" stroke="#E2E8F0" strokeWidth="0.8" />
      <line x1="12" y1="30" x2="46" y2="30" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="12" y1="36" x2="42" y2="36" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="12" y1="42" x2="48" y2="42" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="12" y1="48" x2="40" y2="48" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="12" y1="54" x2="44" y2="54" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="12" y1="66" x2="48" y2="66" stroke="#E2E8F0" strokeWidth="0.8" />
      <rect x="12" y="70" width="16" height="2" rx="1" fill="#1E293B" />
    </svg>
  );
}

export function ThumbKompakt({ className }: ThumbProps) {
  const id = 'th-kompakt';
  return (
    <svg className={className} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="0" y="0" width="60" height="80" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1" />
      {/* Inline kontaktlinje */}
      <line x1="6" y1="9" x2="54" y2="9" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="6" y1="13" x2="54" y2="13" stroke="#E2E8F0" strokeWidth="0.8" />
      {/* Hög body-densitet */}
      <line x1="6" y1="22" x2="52" y2="22" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="27" x2="50" y2="27" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="32" x2="52" y2="32" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="37" x2="46" y2="37" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="42" x2="52" y2="42" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="47" x2="48" y2="47" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="52" x2="50" y2="52" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="57" x2="44" y2="57" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="62" x2="50" y2="62" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="6" y="70" width="18" height="2" rx="1" fill="#1E293B" />
    </svg>
  );
}

export function ThumbModern({ className }: ThumbProps) {
  const id = 'th-modern';
  return (
    <svg className={className} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="0" y="0" width="60" height="80" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1" />
      {/* Vänster-accent */}
      <rect x="6" y="8" width="2" height="14" rx="1" fill={`url(#${id}-warm)`} />
      <rect x="11" y="9" width="22" height="3" rx="1" fill="#1E293B" />
      <rect x="11" y="14" width="18" height="2" rx="1" fill="#94A3B8" />
      <rect x="11" y="18" width="22" height="2" rx="1" fill="#94A3B8" />
      {/* Mottagare-block */}
      <rect x="6" y="28" width="36" height="10" rx="2" fill={`url(#${id}-soft)`} opacity="0.5" />
      <rect x="9" y="30" width="14" height="2" rx="1" fill="#1E293B" />
      <rect x="9" y="34" width="20" height="2" rx="1" fill="#94A3B8" />
      {/* Body */}
      <line x1="6" y1="46" x2="50" y2="46" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="51" x2="46" y2="51" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="56" x2="50" y2="56" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="61" x2="44" y2="61" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="6" y="70" width="18" height="2" rx="1" fill="#1E293B" />
    </svg>
  );
}

export function ThumbExecutive({ className }: ThumbProps) {
  const id = 'th-exec';
  return (
    <svg className={className} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="0" y="0" width="60" height="80" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1" />
      {/* Sidebar vänster */}
      <line x1="20" y1="8" x2="20" y2="64" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <rect x="6" y="10" width="12" height="2.5" rx="1" fill="#1E293B" />
      <rect x="6" y="18" width="10" height="1.5" rx="0.7" fill="#94A3B8" />
      <rect x="6" y="22" width="12" height="1.5" rx="0.7" fill="#94A3B8" />
      <rect x="6" y="26" width="11" height="1.5" rx="0.7" fill="#94A3B8" />
      {/* Main body */}
      <rect x="24" y="10" width="14" height="2" rx="1" fill="#1E293B" />
      <line x1="24" y1="20" x2="52" y2="20" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="24" y1="26" x2="48" y2="26" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="24" y1="32" x2="52" y2="32" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="24" y1="38" x2="46" y2="38" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="24" y1="44" x2="50" y2="44" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="24" y1="50" x2="44" y2="50" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="24" y1="56" x2="48" y2="56" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="24" y="68" width="16" height="2" rx="1" fill="#1E293B" />
    </svg>
  );
}

export function ThumbKreativ({ className }: ThumbProps) {
  const id = 'th-krea';
  return (
    <svg className={className} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="0" y="0" width="60" height="80" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1" />
      {/* Stor färgad header-block */}
      <rect x="4" y="6" width="52" height="18" rx="3" fill={`url(#${id}-warm)`} />
      <rect x="8" y="10" width="22" height="3" rx="1" fill="white" />
      <rect x="8" y="16" width="16" height="2" rx="1" fill="white" opacity="0.8" />
      <rect x="8" y="20" width="20" height="2" rx="1" fill="white" opacity="0.8" />
      {/* Vänster-accent på recipient */}
      <line x1="6" y1="30" x2="6" y2="40" stroke={`url(#${id}-deep)`} strokeWidth="1.5" />
      <rect x="10" y="31" width="14" height="2" rx="1" fill="#1E293B" />
      <rect x="10" y="36" width="18" height="1.5" rx="0.7" fill="#94A3B8" />
      <line x1="6" y1="46" x2="52" y2="46" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="51" x2="48" y2="51" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="56" x2="50" y2="56" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="61" x2="46" y2="61" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="4" y1="68" x2="56" y2="68" stroke="#FED7AA" strokeWidth="1" />
      <rect x="6" y="71" width="18" height="2" rx="1" fill={`url(#${id}-deep)`} />
    </svg>
  );
}

export function ThumbTraditionell({ className }: ThumbProps) {
  const id = 'th-trad';
  return (
    <svg className={className} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="0" y="0" width="60" height="80" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1" />
      {/* Centrerad versal header */}
      <rect x="14" y="9" width="32" height="2.5" rx="0.5" fill="#1E293B" />
      <rect x="20" y="14" width="20" height="1.5" rx="0.5" fill="#94A3B8" />
      <rect x="22" y="18" width="16" height="1.5" rx="0.5" fill="#94A3B8" />
      {/* Höger-justerat datum */}
      <rect x="38" y="28" width="14" height="1.8" rx="0.5" fill="#94A3B8" />
      {/* Body justerad */}
      <line x1="6" y1="38" x2="54" y2="38" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="43" x2="54" y2="43" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="48" x2="54" y2="48" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="53" x2="50" y2="53" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="58" x2="54" y2="58" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="6" y1="63" x2="48" y2="63" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="6" y="71" width="20" height="2" rx="1" fill="#1E293B" />
    </svg>
  );
}
