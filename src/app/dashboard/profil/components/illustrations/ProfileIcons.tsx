'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="pf-orange-red" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="pf-orange-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="pf-emerald" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
    <linearGradient id="pf-amber" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FCD34D" />
      <stop offset="100%" stopColor="#F59E0B" />
    </linearGradient>
  </defs>
);

/**
 * Stor profil-orb för plan-status-hero. Gradient-cirkel med subtil
 * porträtt-silhouette inuti och små decorative prickar runtom.
 */
export function ProfileHeroOrb({ className = 'w-24 h-24' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Yttre glow-ring */}
      <circle cx="40" cy="40" r="38" fill="url(#pf-orange-pink)" opacity="0.15" />
      <circle cx="40" cy="40" r="34" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.5" />

      {/* Porträtt-silhouette */}
      <circle cx="40" cy="34" r="9" fill="url(#pf-orange-pink)" />
      <path d="M24 60 Q24 47 40 47 Q56 47 56 60 L56 64 L24 64 Z" fill="url(#pf-orange-pink)" />

      {/* Stjärna i kronan-position */}
      <g transform="translate(60 18)">
        <circle r="6" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.25" />
        <path
          d="M0 -3.5 L1 -1 L3.5 -0.5 L1.5 1 L2 3.5 L0 2 L-2 3.5 L-1.5 1 L-3.5 -0.5 L-1 -1 Z"
          fill="url(#pf-orange-red)"
        />
      </g>

      {/* Decorative prickar */}
      <circle cx="14" cy="26" r="1.5" fill="#FB923C" opacity="0.7" />
      <circle cx="68" cy="50" r="1" fill="#FB923C" opacity="0.6" />
      <circle cx="20" cy="62" r="1" fill="#DC2626" opacity="0.5" />
      <circle cx="56" cy="14" r="1" fill="#FB923C" opacity="0.5" />
    </svg>
  );
}

/**
 * Premium-krona med gradient och glöd. Används i premium-badge på hero
 * eller i PremiumGateModal.
 */
export function PremiumCrownIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Glow-bakgrund */}
      <circle cx="24" cy="24" r="22" fill="url(#pf-amber)" opacity="0.18" />

      {/* Krona */}
      <path
        d="M10 20 L14 28 L20 14 L24 24 L28 14 L34 28 L38 20 L40 36 L8 36 Z"
        fill="url(#pf-amber)"
        stroke="#9A3412"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />

      {/* Bas */}
      <rect x="8" y="36" width="32" height="4" rx="1" fill="#9A3412" />

      {/* Juveler */}
      <circle cx="14" cy="28" r="2" fill="#DC2626" />
      <circle cx="24" cy="24" r="2.5" fill="url(#pf-orange-red)" />
      <circle cx="34" cy="28" r="2" fill="#DC2626" />

      {/* Glitter */}
      <circle cx="20" cy="14" r="1" fill="white" />
      <circle cx="28" cy="14" r="1" fill="white" />
    </svg>
  );
}

/**
 * Lås-ikon med orange/röd gradient. Används som premium-CTA-indikator.
 */
export function LockedFieldIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Bakgrund */}
      <circle cx="24" cy="24" r="22" fill="url(#pf-orange-red)" opacity="0.12" />

      {/* Lås-bygel */}
      <path
        d="M16 22 L16 16 Q16 10 24 10 Q32 10 32 16 L32 22"
        fill="none"
        stroke="url(#pf-orange-red)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Lås-kropp */}
      <rect x="12" y="22" width="24" height="18" rx="3" fill="url(#pf-orange-pink)" />

      {/* Nyckelhål */}
      <circle cx="24" cy="29" r="2" fill="white" />
      <rect x="23" y="29" width="2" height="6" rx="1" fill="white" />

      {/* Sparkles */}
      <circle cx="38" cy="14" r="1.5" fill="#FCD34D" />
      <circle cx="10" cy="38" r="1" fill="#FCD34D" />
    </svg>
  );
}

/**
 * Liten varnings-/info-ikon med shield-form. Används i integritets-info.
 */
export function ShieldGradientIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <path
        d="M24 6 L40 12 L40 24 Q40 36 24 42 Q8 36 8 24 L8 12 Z"
        fill="url(#pf-emerald)"
      />
      <path
        d="M17 24 L22 29 L31 19"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ----------------------------------------------------------------
   FIELD-IKONER för PersonalDetailsSection
   Alla i samma stil: cirkel-stroke + ikon i mitten + dekor.
   Default w-10 h-10 — passar i field-label.
---------------------------------------------------------------- */

/**
 * E-post: stiliserat kuvert med liten stjärna i hörn.
 */
export function EmailEnvelopeIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.75" />

      {/* Kuvert-bas */}
      <rect x="22" y="28" width="36" height="24" rx="3" fill="url(#pf-orange-pink)" />
      {/* Kuvert-flik */}
      <path d="M22 30 L40 44 L58 30" stroke="white" strokeWidth="2.25" strokeLinejoin="round" fill="none" />
      {/* Liten ljuspunkt */}
      <circle cx="40" cy="44" r="1.5" fill="white" opacity="0.9" />

      {/* Stjärna i hörn */}
      <g transform="translate(60 18)">
        <circle r="6" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.25" />
        <path
          d="M0 -3.5 L1 -1 L3.5 -0.5 L1.5 1 L2 3.5 L0 2 L-2 3.5 L-1.5 1 L-3.5 -0.5 L-1 -1 Z"
          fill="url(#pf-orange-red)"
        />
      </g>

      {/* Dekorativa prickar */}
      <circle cx="14" cy="56" r="1.25" fill="#FB923C" opacity="0.6" />
      <circle cx="66" cy="60" r="1" fill="#DC2626" opacity="0.5" />
    </svg>
  );
}

/**
 * Namn: ID-kort med porträtt-silhuett och rader.
 */
export function IdentityCardIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.75" />

      {/* Kort-bakgrund */}
      <rect x="18" y="26" width="44" height="28" rx="4" fill="url(#pf-orange-pink)" />

      {/* Porträtt-bubbla */}
      <circle cx="29" cy="36" r="4" fill="white" />
      <path d="M22 50 Q22 44 29 44 Q36 44 36 50 Z" fill="white" />

      {/* Text-rader */}
      <rect x="40" y="34" width="16" height="2.5" rx="1.25" fill="white" opacity="0.9" />
      <rect x="40" y="40" width="12" height="2" rx="1" fill="white" opacity="0.7" />
      <rect x="40" y="45" width="14" height="2" rx="1" fill="white" opacity="0.7" />

      {/* Stjärna i hörn */}
      <g transform="translate(60 18)">
        <circle r="6" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.25" />
        <path
          d="M0 -3.5 L1 -1 L3.5 -0.5 L1.5 1 L2 3.5 L0 2 L-2 3.5 L-1.5 1 L-3.5 -0.5 L-1 -1 Z"
          fill="url(#pf-orange-red)"
        />
      </g>

      {/* Dekorativa prickar */}
      <circle cx="14" cy="60" r="1.25" fill="#FB923C" opacity="0.6" />
      <circle cx="66" cy="62" r="1" fill="#DC2626" opacity="0.5" />
    </svg>
  );
}

/**
 * Profilbild: foto-ram med liten kamera-pip i hörn.
 */
export function PortraitFrameIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.75" />

      {/* Foto-ram */}
      <rect x="20" y="22" width="36" height="36" rx="4" fill="url(#pf-orange-pink)" />
      {/* Innre vitt fält */}
      <rect x="23" y="25" width="30" height="30" rx="2" fill="white" />

      {/* Porträtt inuti ramen */}
      <circle cx="38" cy="36" r="5" fill="url(#pf-orange-red)" />
      <path d="M28 52 Q28 44 38 44 Q48 44 48 52 Z" fill="url(#pf-orange-red)" />

      {/* Liten kamera-prick */}
      <circle cx="58" cy="22" r="5" fill="url(#pf-amber)" stroke="white" strokeWidth="1.5" />
      <circle cx="58" cy="22" r="2" fill="white" />

      {/* Dekor */}
      <circle cx="14" cy="58" r="1.25" fill="#FB923C" opacity="0.6" />
      <circle cx="66" cy="62" r="1" fill="#DC2626" opacity="0.5" />
    </svg>
  );
}

/**
 * LinkedIn: orange/röd "in"-bricka — ersätter både Lucide Linkedin och blå inline-SVG.
 */
export function LinkedInBadgeIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.75" />

      {/* "in"-bricka (rounded square) */}
      <rect x="22" y="22" width="36" height="36" rx="6" fill="url(#pf-orange-pink)" />

      {/* Bokstaven "i" — prick + stapel */}
      <circle cx="30" cy="32" r="2.5" fill="white" />
      <rect x="27.75" y="36" width="4.5" height="14" rx="1" fill="white" />

      {/* Bokstaven "n" */}
      <rect x="36" y="36" width="4.5" height="14" rx="1" fill="white" />
      <path
        d="M40.5 42 Q40.5 36 46 36 Q51.5 36 51.5 42 L51.5 50"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Dekor */}
      <circle cx="14" cy="58" r="1.25" fill="#FB923C" opacity="0.6" />
      <circle cx="66" cy="20" r="1" fill="#DC2626" opacity="0.5" />
    </svg>
  );
}

/**
 * Telefon: lur med signal-vågor.
 */
export function PhoneSignalIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.75" />

      {/* Telefon-lur (rotated) */}
      <g transform="translate(40 40) rotate(-30)">
        <path
          d="M-14 -10 Q-14 -16 -8 -16 L-4 -16 Q-2 -16 -1 -14 L1 -10 Q2 -8 0 -6 L-2 -4 Q-1 0 3 4 Q7 8 11 9 L13 7 Q15 5 17 6 L21 8 Q23 9 23 11 L23 15 Q23 21 17 21 Q-1 21 -14 8 Z"
          fill="url(#pf-orange-pink)"
        />
      </g>

      {/* Signal-vågor */}
      <path d="M52 22 Q56 22 56 28" stroke="url(#pf-orange-red)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M52 16 Q62 16 62 28" stroke="url(#pf-orange-red)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* Liten stjärna */}
      <g transform="translate(20 22)">
        <circle r="3" fill="url(#pf-amber)" />
        <path d="M0 -1.5 L0.5 -0.5 L1.5 0 L0.5 0.5 L0 1.5 L-0.5 0.5 L-1.5 0 L-0.5 -0.5 Z" fill="white" />
      </g>

      <circle cx="66" cy="58" r="1" fill="#DC2626" opacity="0.5" />
    </svg>
  );
}

/**
 * Ort: pin med stjärna ovanpå.
 */
export function LocationPinIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.75" />

      {/* Pin-form */}
      <path
        d="M40 18 Q52 18 52 32 Q52 44 40 58 Q28 44 28 32 Q28 18 40 18 Z"
        fill="url(#pf-orange-pink)"
      />
      {/* Vit cirkel inuti pinnen */}
      <circle cx="40" cy="32" r="6" fill="white" />
      {/* Liten röd punkt */}
      <circle cx="40" cy="32" r="2.5" fill="url(#pf-orange-red)" />

      {/* Stjärna ovanpå */}
      <g transform="translate(56 22)">
        <circle r="6" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.25" />
        <path
          d="M0 -3.5 L1 -1 L3.5 -0.5 L1.5 1 L2 3.5 L0 2 L-2 3.5 L-1.5 1 L-3.5 -0.5 L-1 -1 Z"
          fill="url(#pf-orange-red)"
        />
      </g>

      {/* Skugga under pinnen */}
      <ellipse cx="40" cy="62" rx="6" ry="1.5" fill="#DC2626" opacity="0.18" />

      <circle cx="16" cy="50" r="1.25" fill="#FB923C" opacity="0.6" />
    </svg>
  );
}

/* ----------------------------------------------------------------
   ÖVERSIKT-IKONER för ProfileOverviewCards
---------------------------------------------------------------- */

/**
 * Status-cirkel: visas i översiktskort för "Personliga uppgifter".
 * Större fält-orb med checkmarker.
 */
export function PersonalInfoOverviewIcon({ className = 'w-14 h-14' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="url(#pf-orange-pink)" opacity="0.12" />
      <circle cx="40" cy="40" r="32" fill="white" stroke="url(#pf-orange-red)" strokeWidth="2" />

      {/* Porträtt */}
      <circle cx="40" cy="32" r="8" fill="url(#pf-orange-pink)" />
      <path d="M24 56 Q24 44 40 44 Q56 44 56 56 L56 60 L24 60 Z" fill="url(#pf-orange-pink)" />

      {/* Tre check-prickar runtom (status) */}
      <circle cx="64" cy="20" r="6" fill="url(#pf-emerald)" />
      <path d="M61 20 L63.5 22.5 L67 19" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/**
 * Skrivton-ikon för översikt: stiliserad våg med stjärna.
 */
export function ToneOverviewIcon({ className = 'w-14 h-14' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="url(#pf-orange-pink)" opacity="0.12" />
      <circle cx="40" cy="40" r="32" fill="white" stroke="url(#pf-orange-red)" strokeWidth="2" />

      {/* Våg-stång */}
      <rect x="38" y="22" width="4" height="36" rx="1.5" fill="url(#pf-orange-red)" />
      {/* Tvärstången */}
      <rect x="22" y="28" width="36" height="3" rx="1.5" fill="url(#pf-orange-red)" />
      {/* Vänster skål */}
      <path d="M22 30 L18 42 Q22 46 26 42 Z" fill="url(#pf-orange-pink)" />
      {/* Höger skål */}
      <path d="M58 30 L54 42 Q58 46 62 42 Z" fill="url(#pf-orange-pink)" />

      {/* Stjärna högst upp */}
      <g transform="translate(40 18)">
        <path
          d="M0 -5 L1.5 -1.5 L5 -1 L2.5 1.5 L3 5 L0 3 L-3 5 L-2.5 1.5 L-5 -1 L-1.5 -1.5 Z"
          fill="url(#pf-amber)"
        />
      </g>
    </svg>
  );
}

/**
 * Plan/konto-ikon för översikt: krona på kort.
 */
export function PlanOverviewIcon({ className = 'w-14 h-14' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="40" cy="40" r="36" fill="url(#pf-orange-pink)" opacity="0.12" />
      <circle cx="40" cy="40" r="32" fill="white" stroke="url(#pf-orange-red)" strokeWidth="2" />

      {/* Krona */}
      <path
        d="M22 38 L26 48 L34 28 L40 42 L46 28 L54 48 L58 38 L60 56 L20 56 Z"
        fill="url(#pf-amber)"
        stroke="#9A3412"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <rect x="20" y="56" width="40" height="4" rx="1" fill="#9A3412" />
      <circle cx="26" cy="48" r="1.75" fill="#DC2626" />
      <circle cx="40" cy="44" r="2" fill="url(#pf-orange-red)" />
      <circle cx="54" cy="48" r="1.75" fill="#DC2626" />
    </svg>
  );
}
