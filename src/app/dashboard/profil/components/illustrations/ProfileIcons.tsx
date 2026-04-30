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
 * Profil-orb för section-header. Centrerad porträtt-silhouette i en mjuk
 * orange-rosa gradient-cirkel med dubbla glow-ringar. Inga element sticker
 * ut utanför viewBox så den ser lika bra ut i alla storlekar.
 */
export function ProfileHeroOrb({ className = 'w-24 h-24' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Dubbla glow-ringar */}
      <circle cx="32" cy="32" r="28" fill="url(#pf-orange-pink)" opacity="0.1" />
      <circle cx="32" cy="32" r="22" fill="url(#pf-orange-pink)" opacity="0.15" />

      {/* Vit innercirkel med gradient-stroke */}
      <circle cx="32" cy="32" r="22" fill="white" stroke="url(#pf-orange-red)" strokeWidth="1.75" />

      {/* Porträtt-silhouette */}
      <circle cx="32" cy="27" r="6.5" fill="url(#pf-orange-pink)" />
      <path
        d="M20 46 Q20 36 32 36 Q44 36 44 46 L44 54 L20 54 Z"
        fill="url(#pf-orange-pink)"
      />
      {/* Halsbåge för djup */}
      <path d="M27 36 Q32 40 37 36" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Subtila prickar runtom */}
      <circle cx="50" cy="14" r="1.5" fill="#FB923C" opacity="0.7" />
      <circle cx="14" cy="50" r="1.25" fill="#FB923C" opacity="0.55" />
      <circle cx="54" cy="48" r="1" fill="#DC2626" opacity="0.5" />
      <circle cx="12" cy="20" r="1" fill="#FB923C" opacity="0.4" />
    </svg>
  );
}

/**
 * Premium-krona — finare variant inspirerad av toast-illustrationerna.
 * Dubbla glow-ringar, ren krona-form i orange/röd/rosa-gradient och
 * vita prickar ovanpå topparna. Används i premium-badge och PremiumGateModal.
 */
export function PremiumCrownIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Dubbla glow-ringar */}
      <circle cx="32" cy="32" r="28" fill="url(#pf-orange-pink)" opacity="0.1" />
      <circle cx="32" cy="32" r="22" fill="url(#pf-orange-pink)" opacity="0.15" />

      {/* Krona-form */}
      <path
        d="M16 30 L22 22 L28 30 L32 18 L36 30 L42 22 L48 30 L46 44 L18 44 Z"
        fill="url(#pf-orange-pink)"
      />

      {/* Bas-band */}
      <rect x="16" y="46" width="32" height="4" rx="1" fill="url(#pf-orange-red)" />

      {/* Vita prickar på topparna */}
      <circle cx="22" cy="22" r="2" fill="#FFFFFF" />
      <circle cx="32" cy="18" r="2" fill="#FFFFFF" />
      <circle cx="42" cy="22" r="2" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Lås-ikon med orange/röd gradient — toast-DNA. Används som premium-CTA-indikator.
 */
export function LockedFieldIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* Glow */}
      <circle cx="32" cy="32" r="28" fill="url(#pf-orange-pink)" opacity="0.1" />
      <circle cx="32" cy="32" r="22" fill="url(#pf-orange-pink)" opacity="0.15" />

      {/* Lås-bygel */}
      <path
        d="M22 28 L22 22 Q22 14 32 14 Q42 14 42 22 L42 28"
        fill="none"
        stroke="url(#pf-orange-red)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Lås-kropp */}
      <rect x="18" y="28" width="28" height="22" rx="3" fill="url(#pf-orange-pink)" />

      {/* Nyckelhål */}
      <circle cx="32" cy="36" r="2.25" fill="white" />
      <rect x="30.75" y="36" width="2.5" height="7" rx="1.25" fill="white" />
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
   Inspirerade av toast-illustrationerna: dubbla glow-ringar +
   en tydlig central form. ViewBox 64×64, fyller w-10 h-10 cleant.
---------------------------------------------------------------- */

/**
 * Bakgrunds-glow för field-ikoner (dubbla ringar, samma som toast-stilen).
 */
function FieldGlowBg() {
  return (
    <>
      <circle cx="32" cy="32" r="28" fill="url(#pf-orange-pink)" opacity="0.1" />
      <circle cx="32" cy="32" r="22" fill="url(#pf-orange-pink)" opacity="0.15" />
    </>
  );
}

/**
 * E-post: kuvert med flik och liten check-prick.
 */
export function EmailEnvelopeIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <FieldGlowBg />

      {/* Kuvert-bas */}
      <rect x="16" y="22" width="32" height="22" rx="3" fill="url(#pf-orange-pink)" />
      {/* Kuvert-flik (V-form) */}
      <path
        d="M16 24 L32 36 L48 24"
        stroke="white"
        strokeWidth="2.25"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Markör-prick */}
      <circle cx="32" cy="36" r="1.5" fill="white" opacity="0.95" />
    </svg>
  );
}

/**
 * Namn: ID-kort med porträtt och rader.
 */
export function IdentityCardIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <FieldGlowBg />

      {/* Kort */}
      <rect x="14" y="20" width="36" height="24" rx="3" fill="url(#pf-orange-pink)" />
      <rect x="14" y="20" width="36" height="4" rx="3" fill="url(#pf-orange-red)" />

      {/* Porträtt-bubbla */}
      <circle cx="23" cy="32" r="3.5" fill="white" />
      <path d="M17 41 Q17 36 23 36 Q29 36 29 41 Z" fill="white" />

      {/* Text-rader */}
      <rect x="33" y="29" width="14" height="2" rx="1" fill="white" opacity="0.95" />
      <rect x="33" y="34" width="11" height="1.5" rx="0.75" fill="white" opacity="0.7" />
      <rect x="33" y="38" width="13" height="1.5" rx="0.75" fill="white" opacity="0.7" />
    </svg>
  );
}

/**
 * Profilbild: foto-ram med porträtt och kamera-pip.
 */
export function PortraitFrameIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <FieldGlowBg />

      {/* Foto-ram (yttre gradient) */}
      <rect x="16" y="18" width="32" height="32" rx="4" fill="url(#pf-orange-pink)" />
      {/* Innre vit yta */}
      <rect x="19" y="21" width="26" height="26" rx="2" fill="white" />

      {/* Porträtt inuti */}
      <circle cx="32" cy="30" r="4.5" fill="url(#pf-orange-red)" />
      <path d="M22 44 Q22 36 32 36 Q42 36 42 44 Z" fill="url(#pf-orange-red)" />

      {/* Kamera-prick (uppe till höger) */}
      <circle cx="46" cy="20" r="3.5" fill="url(#pf-amber)" stroke="white" strokeWidth="1.25" />
      <circle cx="46" cy="20" r="1.5" fill="white" />
    </svg>
  );
}

/**
 * LinkedIn: orange/röd "in"-bricka.
 */
export function LinkedInBadgeIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <FieldGlowBg />

      {/* "in"-bricka */}
      <rect x="16" y="16" width="32" height="32" rx="5" fill="url(#pf-orange-pink)" />

      {/* Bokstaven "i" */}
      <circle cx="24" cy="24" r="2.25" fill="white" />
      <rect x="22" y="28" width="4" height="12" rx="1" fill="white" />

      {/* Bokstaven "n" */}
      <rect x="29" y="28" width="4" height="12" rx="1" fill="white" />
      <path
        d="M33 33 Q33 28 38 28 Q43 28 43 33 L43 40"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Telefon: lur med signal-vågor.
 */
export function PhoneSignalIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <FieldGlowBg />

      {/* Telefon-lur (renare path, centrerad) */}
      <g transform="translate(32 32) rotate(-30)">
        <path
          d="M-12 -9 Q-12 -14 -7 -14 L-3 -14 Q-1 -14 0 -12 L2 -8 Q3 -6 1 -5 L0 -4 Q1 0 4 3 Q7 6 11 7 L12 6 Q13 4 15 5 L19 7 Q21 8 21 10 L21 14 Q21 19 16 19 Q-1 19 -12 8 Z"
          fill="url(#pf-orange-pink)"
        />
      </g>

      {/* Signal-vågor (uppe till höger) */}
      <path
        d="M44 18 Q49 18 49 23"
        stroke="url(#pf-orange-red)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 13 Q54 13 54 23"
        stroke="url(#pf-orange-red)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Ort: pin med ringad punkt och skugga.
 */
export function LocationPinIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <FieldGlowBg />

      {/* Pin-form */}
      <path
        d="M32 14 Q44 14 44 26 Q44 36 32 50 Q20 36 20 26 Q20 14 32 14 Z"
        fill="url(#pf-orange-pink)"
      />
      {/* Vit cirkel */}
      <circle cx="32" cy="26" r="5.5" fill="white" />
      {/* Inre punkt */}
      <circle cx="32" cy="26" r="2.5" fill="url(#pf-orange-red)" />

      {/* Skugga */}
      <ellipse cx="32" cy="52" rx="6" ry="1.5" fill="#DC2626" opacity="0.2" />
    </svg>
  );
}

/* ----------------------------------------------------------------
   ÖVERSIKT-IKONER för ProfileOverviewCards
   Samma toast-DNA som field-ikonerna fast lite större detaljer.
---------------------------------------------------------------- */

/**
 * Översikt: Personliga uppgifter — porträtt med check-badge.
 */
export function PersonalInfoOverviewIcon({ className = 'w-14 h-14' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="32" cy="32" r="28" fill="url(#pf-orange-pink)" opacity="0.1" />
      <circle cx="32" cy="32" r="22" fill="url(#pf-orange-pink)" opacity="0.15" />

      {/* Porträtt */}
      <circle cx="28" cy="28" r="6" fill="url(#pf-orange-red)" />
      <path d="M16 46 C16 40 22 36 28 36 C34 36 40 40 40 46 L40 48 L16 48 Z" fill="url(#pf-orange-red)" />

      {/* Check-badge (nedre höger) */}
      <circle cx="48" cy="48" r="9" fill="url(#pf-emerald)" stroke="white" strokeWidth="2" />
      <path d="M44 48 L47 51 L52 46" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/**
 * Översikt: Skrivton — våg-symbol.
 */
export function ToneOverviewIcon({ className = 'w-14 h-14' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="32" cy="32" r="28" fill="url(#pf-orange-pink)" opacity="0.1" />
      <circle cx="32" cy="32" r="22" fill="url(#pf-orange-pink)" opacity="0.15" />

      {/* Våg-stång */}
      <rect x="30" y="16" width="4" height="32" rx="1.5" fill="url(#pf-orange-red)" />
      {/* Bas */}
      <rect x="22" y="46" width="20" height="3" rx="1.5" fill="url(#pf-orange-red)" />
      {/* Tvärstång */}
      <rect x="14" y="22" width="36" height="3" rx="1.5" fill="url(#pf-orange-red)" />
      {/* Vänster skål */}
      <path d="M14 24 L10 36 Q14 40 18 36 Z" fill="url(#pf-orange-pink)" />
      {/* Höger skål */}
      <path d="M50 24 L46 36 Q50 40 54 36 Z" fill="url(#pf-orange-pink)" />

      {/* Liten amber-stjärna högst upp */}
      <circle cx="32" cy="14" r="3" fill="url(#pf-amber)" />
    </svg>
  );
}

/**
 * Översikt: Plan & konto — premium-krona som matchar PremiumCrownIcon.
 */
export function PlanOverviewIcon({ className = 'w-14 h-14' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="32" cy="32" r="28" fill="url(#pf-orange-pink)" opacity="0.1" />
      <circle cx="32" cy="32" r="22" fill="url(#pf-orange-pink)" opacity="0.15" />

      {/* Krona */}
      <path
        d="M16 30 L22 22 L28 30 L32 18 L36 30 L42 22 L48 30 L46 44 L18 44 Z"
        fill="url(#pf-orange-pink)"
      />
      <rect x="16" y="46" width="32" height="4" rx="1" fill="url(#pf-orange-red)" />
      <circle cx="22" cy="22" r="2" fill="#FFFFFF" />
      <circle cx="32" cy="18" r="2" fill="#FFFFFF" />
      <circle cx="42" cy="22" r="2" fill="#FFFFFF" />
    </svg>
  );
}
