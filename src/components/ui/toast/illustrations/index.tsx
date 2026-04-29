'use client';

import type { FC, SVGProps } from 'react';

export type ToastScenario =
  | 'jobs-found'
  | 'cv-uploaded'
  | 'cv-analyzed'
  | 'cv-template-generated'
  | 'letter-created'
  | 'letter-saved'
  | 'letter-deleted'
  | 'premium-activated'
  | 'profile-updated'
  | 'account-deleted'
  | 'onboarding-complete'
  | 'payment-complete'
  | 'chat-answered'
  | 'info';

const ORANGE = '#F97316';
const RED = '#DC2626';
const PINK = '#BE185D';
const EMERALD = '#10B981';
const SLATE = '#94A3B8';

type IllProps = SVGProps<SVGSVGElement>;

/**
 * Gradient-defs som alla illustrationer delar. Sparar bytes och garanterar
 * att alla anvander samma orange-rod-pink-stack som resten av appen.
 */
const SharedDefs: FC = () => (
  <defs>
    <linearGradient id="toast-orange-red" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={ORANGE} />
      <stop offset="100%" stopColor={RED} />
    </linearGradient>
    <linearGradient id="toast-orange-pink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={ORANGE} />
      <stop offset="50%" stopColor={RED} />
      <stop offset="100%" stopColor={PINK} />
    </linearGradient>
    <linearGradient id="toast-emerald" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#34D399" />
      <stop offset="100%" stopColor={EMERALD} />
    </linearGradient>
  </defs>
);

const wrap = (children: React.ReactNode) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <SharedDefs />
    {children}
  </svg>
);

// 1. jobs-found: stack med 3 jobbkort, översta med grön check-pill
const JobsFound: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <rect x="14" y="20" width="28" height="34" rx="5" fill="#FFFFFF" stroke={SLATE} strokeWidth="1.5" transform="rotate(-8 28 37)" />
      <rect x="18" y="14" width="28" height="34" rx="5" fill="#FFFFFF" stroke="url(#toast-orange-red)" strokeWidth="1.5" />
      <rect x="22" y="18" width="20" height="2" rx="1" fill={ORANGE} />
      <rect x="22" y="23" width="14" height="1.5" rx="0.75" fill={SLATE} opacity="0.6" />
      <rect x="22" y="27" width="16" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <rect x="22" y="31" width="12" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <circle cx="48" cy="14" r="9" fill="url(#toast-emerald)" />
      <path d="M44 14 L47 17 L52 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );

// 2. cv-uploaded: dokument med skann-linje + check
const CvUploaded: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <rect x="16" y="10" width="32" height="44" rx="4" fill="#FFFFFF" stroke="url(#toast-orange-red)" strokeWidth="1.5" />
      <rect x="16" y="10" width="32" height="3" rx="1.5" fill="url(#toast-orange-pink)" />
      <rect x="20" y="18" width="20" height="2" rx="1" fill={SLATE} opacity="0.7" />
      <rect x="20" y="23" width="14" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <rect x="20" y="28" width="22" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <rect x="20" y="33" width="16" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <rect x="14" y="35" width="36" height="1" rx="0.5" fill={ORANGE} opacity="0.8" />
      <circle cx="48" cy="48" r="8" fill="url(#toast-emerald)" />
      <path d="M44 48 L47 51 L52 46" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );

// 3. cv-analyzed: stapeldiagram med uppåt-pil
const CvAnalyzed: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <rect x="10" y="38" width="10" height="16" rx="2" fill={SLATE} opacity="0.4" />
      <rect x="22" y="28" width="10" height="26" rx="2" fill={ORANGE} opacity="0.7" />
      <rect x="34" y="20" width="10" height="34" rx="2" fill="url(#toast-orange-red)" />
      <rect x="46" y="12" width="10" height="42" rx="2" fill="url(#toast-orange-pink)" />
      <path d="M14 30 L26 22 L38 16 L50 8" stroke={EMERALD} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M44 8 L50 8 L50 14" stroke={EMERALD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );

// 4. cv-template-generated: två lager dokument med download-pil
const CvTemplateGenerated: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <rect x="14" y="14" width="26" height="34" rx="3" fill="#FFFFFF" stroke={SLATE} strokeWidth="1.5" opacity="0.6" />
      <rect x="20" y="10" width="26" height="34" rx="3" fill="#FFFFFF" stroke="url(#toast-orange-red)" strokeWidth="1.5" />
      <rect x="20" y="10" width="26" height="3" rx="1.5" fill="url(#toast-orange-pink)" />
      <rect x="24" y="18" width="14" height="1.5" rx="0.75" fill={SLATE} opacity="0.5" />
      <rect x="24" y="22" width="18" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <rect x="24" y="26" width="12" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <circle cx="48" cy="48" r="8" fill="url(#toast-orange-red)" />
      <path d="M48 44 L48 52 M44 48 L48 52 L52 48" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );

// 5. letter-created: penna som ritar på papper
const LetterCreated: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <rect x="10" y="14" width="30" height="40" rx="3" fill="#FFFFFF" stroke={SLATE} strokeWidth="1.5" />
      <rect x="14" y="20" width="18" height="1.5" rx="0.75" fill={SLATE} opacity="0.5" />
      <rect x="14" y="25" width="22" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <rect x="14" y="30" width="16" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <rect x="14" y="35" width="20" height="1.5" rx="0.75" fill={ORANGE} opacity="0.6" />
      <rect x="14" y="40" width="14" height="1.5" rx="0.75" fill={ORANGE} opacity="0.6" />
      {/* Penna */}
      <g transform="rotate(35 44 28)">
        <rect x="40" y="18" width="8" height="22" rx="1.5" fill="url(#toast-orange-red)" />
        <path d="M40 38 L44 44 L48 38 Z" fill={PINK} />
        <rect x="40" y="18" width="8" height="3" rx="1" fill={RED} />
      </g>
    </g>
  );

// 6. letter-saved: mapp med stjärna
const LetterSaved: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <path d="M10 22 L10 50 C10 52 12 54 14 54 L50 54 C52 54 54 52 54 50 L54 26 C54 24 52 22 50 22 L30 22 L26 18 L14 18 C12 18 10 20 10 22 Z" fill="url(#toast-orange-red)" />
      <path d="M12 28 L52 28 L50 50 C50 51 49 52 48 52 L16 52 C15 52 14 51 14 50 L12 28 Z" fill="#FFFFFF" />
      <path d="M32 32 L34.5 37.5 L40 38 L36 42 L37 47.5 L32 45 L27 47.5 L28 42 L24 38 L29.5 37.5 Z" fill="url(#toast-orange-pink)" />
    </g>
  );

// 7. letter-deleted: papperskorg med fallande dokument
const LetterDeleted: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <rect x="22" y="8" width="14" height="18" rx="2" fill="#FFFFFF" stroke={SLATE} strokeWidth="1.5" opacity="0.7" transform="rotate(-15 29 17)" />
      <rect x="14" y="24" width="36" height="6" rx="2" fill="url(#toast-orange-red)" />
      <rect x="18" y="30" width="28" height="24" rx="2" fill="#FFFFFF" stroke="url(#toast-orange-red)" strokeWidth="1.5" />
      <line x1="24" y1="36" x2="24" y2="48" stroke={SLATE} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="32" y1="36" x2="32" y2="48" stroke={SLATE} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="40" y1="36" x2="40" y2="48" stroke={SLATE} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <rect x="26" y="20" width="12" height="6" rx="1.5" fill={ORANGE} opacity="0.4" />
    </g>
  );

// 8. premium-activated: krona med ringar
const PremiumActivated: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <circle cx="32" cy="32" r="28" fill="url(#toast-orange-pink)" opacity="0.1" />
      <circle cx="32" cy="32" r="22" fill="url(#toast-orange-pink)" opacity="0.15" />
      {/* Krona */}
      <path d="M16 30 L22 22 L28 30 L32 18 L36 30 L42 22 L48 30 L46 44 L18 44 Z" fill="url(#toast-orange-pink)" />
      <rect x="16" y="46" width="32" height="4" rx="1" fill="url(#toast-orange-red)" />
      <circle cx="22" cy="22" r="2" fill="#FFFFFF" />
      <circle cx="32" cy="18" r="2" fill="#FFFFFF" />
      <circle cx="42" cy="22" r="2" fill="#FFFFFF" />
    </g>
  );

// 9. profile-updated: profil-cirkel med check-badge
const ProfileUpdated: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <circle cx="28" cy="32" r="20" fill="url(#toast-orange-red)" opacity="0.12" />
      <circle cx="28" cy="32" r="20" fill="none" stroke="url(#toast-orange-red)" strokeWidth="1.5" />
      <circle cx="28" cy="26" r="6" fill="url(#toast-orange-red)" />
      <path d="M16 46 C16 40 22 36 28 36 C34 36 40 40 40 46 L40 48 L16 48 Z" fill="url(#toast-orange-red)" />
      <circle cx="48" cy="48" r="9" fill="url(#toast-emerald)" stroke="white" strokeWidth="2" />
      <path d="M44 48 L47 51 L52 46" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );

// 10. account-deleted: tomt fönster med fade
const AccountDeleted: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <rect x="10" y="14" width="44" height="36" rx="4" fill="#FFFFFF" stroke={SLATE} strokeWidth="1.5" />
      <rect x="10" y="14" width="44" height="6" rx="2" fill={SLATE} opacity="0.3" />
      <circle cx="14" cy="17" r="1" fill={SLATE} opacity="0.6" />
      <circle cx="18" cy="17" r="1" fill={SLATE} opacity="0.6" />
      <circle cx="22" cy="17" r="1" fill={SLATE} opacity="0.6" />
      {/* Diagonal slash */}
      <line x1="18" y1="44" x2="46" y2="22" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill={RED} />
    </g>
  );

// 11. onboarding-complete: dokument-stack med startflagga
const OnboardingComplete: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <rect x="12" y="22" width="22" height="30" rx="3" fill="#FFFFFF" stroke={SLATE} strokeWidth="1.5" opacity="0.6" />
      <rect x="16" y="18" width="22" height="30" rx="3" fill="#FFFFFF" stroke="url(#toast-orange-red)" strokeWidth="1.5" />
      <rect x="16" y="18" width="22" height="3" rx="1.5" fill="url(#toast-orange-pink)" />
      {/* Flagga */}
      <line x1="44" y1="10" x2="44" y2="36" stroke={SLATE} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M44 10 L56 14 L44 18 Z" fill="url(#toast-orange-red)" />
      <circle cx="44" cy="36" r="3" fill="url(#toast-emerald)" />
    </g>
  );

// 12. payment-complete: kvitto med check-stämpel
const PaymentComplete: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <path d="M14 8 L50 8 L50 56 L46 52 L42 56 L38 52 L34 56 L30 52 L26 56 L22 52 L18 56 L14 52 Z" fill="#FFFFFF" stroke="url(#toast-orange-red)" strokeWidth="1.5" />
      <rect x="18" y="14" width="20" height="2" rx="1" fill={SLATE} opacity="0.6" />
      <rect x="18" y="20" width="28" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <rect x="18" y="25" width="20" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      <rect x="18" y="30" width="24" height="1.5" rx="0.75" fill={SLATE} opacity="0.4" />
      {/* Stämpel */}
      <g transform="rotate(-12 40 40)">
        <circle cx="40" cy="40" r="11" fill="none" stroke="url(#toast-emerald)" strokeWidth="2" />
        <path d="M35 40 L39 44 L46 36" stroke="url(#toast-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </g>
  );

// 13. chat-answered: chat-bubbla med checkmark — Jobbcoachen-svar
const ChatAnswered: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      {/* Stor chat-bubbla */}
      <path
        d="M 12 18 Q 12 12, 18 12 L 46 12 Q 52 12, 52 18 L 52 38 Q 52 44, 46 44 L 28 44 L 20 52 L 20 44 L 18 44 Q 12 44, 12 38 Z"
        fill="#FFFFFF"
        stroke="url(#toast-orange-red)"
        strokeWidth="1.75"
      />
      {/* Tre rader text */}
      <line x1="18" y1="22" x2="40" y2="22" stroke={SLATE} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="18" y1="28" x2="46" y2="28" stroke={SLATE} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1="18" y1="34" x2="36" y2="34" stroke={SLATE} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      {/* Checkmark-circle nere höger */}
      <circle cx="48" cy="44" r="9" fill="url(#toast-emerald)" />
      <path d="M 44 44 L 47 47 L 52 41" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );

// Info-fallback (om okand scenario kommer in)
const Info: FC<IllProps> = (props) =>
  wrap(
    <g {...props}>
      <circle cx="32" cy="32" r="22" fill="url(#toast-orange-red)" opacity="0.15" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="url(#toast-orange-red)" strokeWidth="1.5" />
      <circle cx="32" cy="22" r="2.5" fill="url(#toast-orange-red)" />
      <rect x="29.5" y="28" width="5" height="16" rx="1.5" fill="url(#toast-orange-red)" />
    </g>
  );

export const TOAST_ILLUSTRATIONS: Record<ToastScenario, FC<IllProps>> = {
  'jobs-found': JobsFound,
  'cv-uploaded': CvUploaded,
  'cv-analyzed': CvAnalyzed,
  'cv-template-generated': CvTemplateGenerated,
  'letter-created': LetterCreated,
  'letter-saved': LetterSaved,
  'letter-deleted': LetterDeleted,
  'premium-activated': PremiumActivated,
  'profile-updated': ProfileUpdated,
  'account-deleted': AccountDeleted,
  'onboarding-complete': OnboardingComplete,
  'payment-complete': PaymentComplete,
  'chat-answered': ChatAnswered,
  info: Info,
};

/**
 * Mappa gamla maskot-sokvagar till nya scenario-keys for bakatkompabilitet.
 * Anvands i notificationcontext sa gamla callsites fortsatter fungera under
 * migration.
 */
const LEGACY_PATH_MAP: Record<string, ToastScenario> = {
  'success-jobs-found': 'jobs-found',
  'success-cv-uploaded': 'cv-uploaded',
  'success-cv-analysis': 'cv-analyzed',
  'success-cv-created': 'cv-template-generated',
  'success-letter-generated': 'letter-created',
  'success-letter-saved': 'letter-saved',
  'success-letter-deleted': 'letter-deleted',
  'success-premium-activated': 'premium-activated',
  'success-profile-updated': 'profile-updated',
  'success-account-deleted': 'account-deleted',
  'success-onboarding-complete': 'onboarding-complete',
  'success-payment-complete': 'payment-complete',
};

export function resolveToastScenario(input: string | undefined): ToastScenario {
  if (!input) return 'info';
  // Direkt scenario-key
  if (input in TOAST_ILLUSTRATIONS) {
    return input as ToastScenario;
  }
  // Legacy path: extrahera filenamnet utan extension
  const filename = input.split('/').pop()?.replace(/\.(svg|png)$/i, '') || '';
  if (filename in LEGACY_PATH_MAP) {
    return LEGACY_PATH_MAP[filename];
  }
  return 'info';
}
