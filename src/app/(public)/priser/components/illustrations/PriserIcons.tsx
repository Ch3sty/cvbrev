/**
 * Custom SVG-illustrationer för /priser landningssida.
 * 8 funktion-ikoner (56x56) for "Vad ingår", krona-decoration for Premium-kort,
 * + check-ikon for trust-rader. Stil: orange/röd/magenta-DNA med Defs-pattern.
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
// FUNKTION-IKONER (56x56) for "Vad ingar i Premium"
// =============================================================

export function IconCV({ className }: IllustrationProps) {
  const id = 'p-cv';
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      <rect x="14" y="11" width="28" height="34" rx="4" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="14" y="11" width="28" height="4" fill={`url(#${id}-warm)`} />
      <circle cx="22" cy="24" r="3.2" fill={`url(#${id}-warm)`} opacity="0.5" />
      <line x1="28" y1="22" x2="38" y2="22" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="27" x2="36" y2="27" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="34" x2="38" y2="34" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="38" x2="34" y2="38" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="42" x2="36" y2="42" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconAnalys({ className }: IllustrationProps) {
  const id = 'p-anal';
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      <rect x="11" y="13" width="22" height="30" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.4" />
      <rect x="11" y="13" width="22" height="3" fill={`url(#${id}-warm)`} />
      <line x1="14" y1="21" x2="29" y2="21" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="26" x2="26" y2="26" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="31" x2="29" y2="31" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Cirkel-progress (ATS-poang) */}
      <circle cx="40" cy="40" r="9" fill="white" stroke="#FED7AA" strokeWidth="2" />
      <path d="M 40 31 A 9 9 0 1 1 33.6 36.5" stroke={`url(#${id}-warm)`} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <text x="40" y="43" textAnchor="middle" fontSize="8" fontWeight="700" fill="#DC2626">94</text>
    </svg>
  );
}

export function IconBrev({ className }: IllustrationProps) {
  const id = 'p-brev';
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Bakre brev */}
      <rect x="11" y="14" width="26" height="30" rx="3" fill="white" stroke="#FED7AA" strokeWidth="1.2" transform="rotate(-5 24 29)" />
      {/* Framre brev */}
      <rect x="17" y="16" width="26" height="30" rx="3" fill="white" stroke="#FB923C" strokeWidth="1.5" transform="rotate(4 30 31)" />
      <rect x="17" y="16" width="26" height="3" fill={`url(#${id}-deep)`} transform="rotate(4 30 31)" />
      <g transform="rotate(4 30 31)">
        <line x1="20" y1="24" x2="32" y2="24" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="20" y="29" width="14" height="2.5" rx="1" fill={`url(#${id}-warm)`} opacity="0.85" />
        <line x1="20" y1="35" x2="38" y2="35" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="20" y1="39" x2="34" y2="39" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function IconLinkedIn({ className }: IllustrationProps) {
  const id = 'p-lin';
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      <rect x="13" y="13" width="30" height="30" rx="5" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      {/* Profil-avatar */}
      <circle cx="22" cy="23" r="4" fill={`url(#${id}-warm)`} />
      <path d="M 16 33 Q 22 28 28 33" stroke={`url(#${id}-warm)`} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Stigande staplar */}
      <rect x="32" y="29" width="3" height="6" rx="1" fill={`url(#${id}-deep)`} opacity="0.5" />
      <rect x="36" y="25" width="3" height="10" rx="1" fill={`url(#${id}-deep)`} opacity="0.7" />
      <rect x="40" y="20" width="3" height="15" rx="1" fill={`url(#${id}-deep)`} />
    </svg>
  );
}

export function IconJobbmatch({ className }: IllustrationProps) {
  const id = 'p-match';
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Vanster cirkel (CV) */}
      <circle cx="22" cy="28" r="9" fill={`url(#${id}-warm)`} opacity="0.85" />
      {/* Hoger cirkel (Jobb) */}
      <circle cx="34" cy="28" r="9" fill={`url(#${id}-deep)`} opacity="0.85" />
      {/* Overlap (matchning) */}
      <path d="M 28 20 A 9 9 0 0 1 28 36 A 9 9 0 0 1 28 20 Z" fill="white" />
      <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="900" fill={`url(#${id}-deep)`}>%</text>
    </svg>
  );
}

export function IconTester({ className }: IllustrationProps) {
  const id = 'p-test';
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      <rect x="11" y="11" width="34" height="34" rx="5" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      {/* Checkbox-rader */}
      <rect x="15" y="17" width="4" height="4" rx="1" fill={`url(#${id}-warm)`} />
      <path d="M16 19 L17 20 L18.5 18.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="22" y1="19" x2="40" y2="19" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="15" y="25" width="4" height="4" rx="1" fill={`url(#${id}-warm)`} />
      <path d="M16 27 L17 28 L18.5 26.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="22" y1="27" x2="38" y2="27" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="15" y="33" width="4" height="4" rx="1" fill="white" stroke={`url(#${id}-warm)`} strokeWidth="1.5" />
      <line x1="22" y1="35" x2="36" y2="35" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconCoach({ className }: IllustrationProps) {
  const id = 'p-coach';
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Pratbubbla 1 */}
      <path
        d="M11 18 Q11 13 16 13 L30 13 Q35 13 35 18 L35 25 Q35 30 30 30 L20 30 L15 35 L15 30 Q11 30 11 25 Z"
        fill="white"
        stroke="#FB923C"
        strokeWidth="1.5"
      />
      <circle cx="18" cy="22" r="1.4" fill={`url(#${id}-warm)`} />
      <circle cx="23" cy="22" r="1.4" fill={`url(#${id}-warm)`} />
      <circle cx="28" cy="22" r="1.4" fill={`url(#${id}-warm)`} />
      {/* Pratbubbla 2 (svar) */}
      <path
        d="M45 30 Q45 26 41 26 L29 26 Q25 26 25 30 L25 36 Q25 40 29 40 L37 40 L41 44 L41 40 Q45 40 45 36 Z"
        fill={`url(#${id}-warm)`}
      />
      <line x1="29" y1="32" x2="40" y2="32" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="29" y1="36" x2="38" y2="36" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconMallar({ className }: IllustrationProps) {
  const id = 'p-mall';
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${id}-soft)`} />
      {/* Tre staplade brev */}
      <rect x="9" y="16" width="16" height="22" rx="2.5" fill="white" stroke="#FED7AA" strokeWidth="1.2" transform="rotate(-7 17 27)" />
      <rect x="20" y="13" width="16" height="24" rx="2.5" fill="white" stroke="#FB923C" strokeWidth="1.5" />
      <rect x="20" y="13" width="16" height="3" fill={`url(#${id}-warm)`} />
      <line x1="23" y1="20" x2="33" y2="20" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="23" y1="24" x2="32" y2="24" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="23" y1="27" x2="33" y2="27" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="23" y1="30" x2="31" y2="30" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="23" y1="33" x2="33" y2="33" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <rect x="31" y="16" width="16" height="22" rx="2.5" fill="white" stroke="#FED7AA" strokeWidth="1.2" transform="rotate(7 39 27)" />
      {/* Premium-mark */}
      <circle cx="42" cy="42" r="6" fill={`url(#${id}-deep)`} />
      <path d="M40 42 L42 44 L45 41" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// =============================================================
// PREMIUM-KRONA (decoration for Premium-pris-kort, 32x32)
// =============================================================
export function PremiumCrown({ className }: IllustrationProps) {
  const id = 'p-crown';
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <path
        d="M5 22 L7 11 L13 16 L16 8 L19 16 L25 11 L27 22 Z"
        fill="white"
        stroke="white"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <rect x="5" y="22" width="22" height="3" rx="1" fill="white" />
      <circle cx="16" cy="8" r="1.5" fill="#FBBF24" />
      <circle cx="7" cy="11" r="1" fill="#FBBF24" />
      <circle cx="25" cy="11" r="1" fill="#FBBF24" />
    </svg>
  );
}

// =============================================================
// CHECK-IKON (24x24, fyrkantig orange/rod)
// =============================================================
export function CheckPriser({ className }: IllustrationProps) {
  const id = 'p-chk';
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <Defs id={id} />
      <circle cx="12" cy="12" r="10" fill={`url(#${id}-warm)`} />
      <path d="M7.5 12 L10.5 15 L16.5 9" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// =============================================================
// LASS-IKON (for free-tier "detta ar last", 24x24)
// =============================================================
export function LockPriser({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.4" />
      <path d="M8 11 V8 A4 4 0 0 1 16 8 V11" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="15.5" r="1.4" fill="#94A3B8" />
    </svg>
  );
}
