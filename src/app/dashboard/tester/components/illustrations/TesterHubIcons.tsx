'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="hub-orange-red" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="hub-orange-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient id="hub-amber" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FCD34D" />
      <stop offset="100%" stopColor="#F59E0B" />
    </linearGradient>
    <linearGradient id="hub-indigo-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#6366F1" />
      <stop offset="50%" stopColor="#8B5CF6" />
      <stop offset="100%" stopColor="#EC4899" />
    </linearGradient>
  </defs>
);

/**
 * Hero-illustration: tre kategorier representerade i en harmonisk komposition.
 * - 3×3 mini-matris (matrislogik) i bakgrunden
 * - Bokstavsbubblor "ABC" (verbal) i mitten
 * - Sifferbubblor "123" (numerisk) i förgrunden
 * Alla i vit på orange-bakgrund (för hero-användning).
 */
export function TesterHubIllustration({ className = '' }: IconProps) {
  return (
    <svg
      className={className}
      width="340"
      height="340"
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
    >
      {/* Bakgrund: roterat 3×3-rutnät (matrislogik) */}
      <g transform="rotate(-10 160 110)" opacity="0.7">
        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const x = 90 + col * 50;
          const y = 50 + row * 50;
          // några fyllda celler i ett mönster
          const isFilled = [0, 4, 8].includes(i);
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width="40"
              height="40"
              rx="6"
              fill={isFilled ? 'white' : 'none'}
              fillOpacity={isFilled ? '0.18' : '0'}
              stroke="white"
              strokeWidth="1.8"
              opacity="0.85"
            />
          );
        })}
      </g>

      {/* Mitten: bokstavsbubblor (verbal) */}
      <g transform="rotate(6 100 200)">
        {/* A-bubbla */}
        <circle cx="60" cy="200" r="22" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" opacity="0.9" />
        <text x="60" y="208" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" opacity="0.95">A</text>
        {/* B-bubbla */}
        <circle cx="110" cy="218" r="20" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="2" opacity="0.85" />
        <text x="110" y="225" textAnchor="middle" fontSize="20" fontWeight="800" fill="white" opacity="0.9">B</text>
        {/* C-bubbla */}
        <circle cx="158" cy="200" r="18" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="2" opacity="0.8" />
        <text x="158" y="207" textAnchor="middle" fontSize="18" fontWeight="800" fill="white" opacity="0.85">C</text>
      </g>

      {/* Förgrund: sifferknappar (numerisk) */}
      <g>
        {/* 1 */}
        <rect x="200" y="220" width="32" height="44" rx="6" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" opacity="0.95" />
        <text x="216" y="250" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" opacity="0.95">1</text>
        {/* 2 */}
        <rect x="240" y="208" width="34" height="46" rx="6" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="2" opacity="0.9" />
        <text x="257" y="240" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" opacity="0.92">2</text>
        {/* 3 */}
        <rect x="282" y="220" width="32" height="44" rx="6" fill="white" fillOpacity="0.14" stroke="white" strokeWidth="2" opacity="0.85" />
        <text x="298" y="250" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" opacity="0.88">3</text>
      </g>

      {/* Subtila prickar runtom */}
      <circle cx="20" cy="40" r="2.5" fill="white" opacity="0.35" />
      <circle cx="35" cy="290" r="2" fill="white" opacity="0.3" />
      <circle cx="295" cy="60" r="2.5" fill="white" opacity="0.3" />
      <circle cx="305" cy="290" r="3" fill="white" opacity="0.35" />
      <circle cx="15" cy="180" r="1.5" fill="white" opacity="0.25" />
      <circle cx="200" cy="20" r="1.8" fill="white" opacity="0.3" />
    </svg>
  );
}

/**
 * Premium-version av Brain — gradient-fylld neuralt nätverk för hero-eyebrow.
 */
export function BrainOrbIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* Glow-bas */}
      <circle cx="24" cy="24" r="22" fill="url(#hub-orange-pink)" opacity="0.12" />
      <circle cx="24" cy="24" r="17" fill="url(#hub-orange-pink)" opacity="0.18" />

      {/* Hjärn-form (förenklad, två lober) */}
      <g transform="translate(8 12)">
        <path
          d="M14 4 Q4 4 4 14 Q4 22 8 26 Q10 28 14 28 L16 28 L16 4 Z"
          fill="url(#hub-orange-pink)"
          stroke="white"
          strokeWidth="0.7"
        />
        <path
          d="M18 4 Q28 4 28 14 Q28 22 24 26 Q22 28 18 28 L16 28 L16 4 Z"
          fill="url(#hub-orange-red)"
          stroke="white"
          strokeWidth="0.7"
        />
        {/* Noder + synapser */}
        <circle cx="9" cy="12" r="1.5" fill="white" opacity="0.85" />
        <circle cx="14" cy="18" r="1.2" fill="white" opacity="0.7" />
        <circle cx="22" cy="14" r="1.5" fill="white" opacity="0.85" />
        <circle cx="20" cy="22" r="1.2" fill="white" opacity="0.7" />
        <line x1="9" y1="12" x2="14" y2="18" stroke="white" strokeWidth="0.6" opacity="0.55" />
        <line x1="14" y1="18" x2="20" y2="22" stroke="white" strokeWidth="0.6" opacity="0.55" />
        <line x1="20" y1="22" x2="22" y2="14" stroke="white" strokeWidth="0.6" opacity="0.55" />
      </g>
    </svg>
  );
}

/**
 * Liten 3×3-grid-ikon för matrislogik-kategorin.
 */
export function MatrixCategoryIllustration({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = 4 + col * 11;
        const y = 4 + row * 11;
        const isFilled = [0, 4, 5, 7].includes(i);
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width="9"
            height="9"
            rx="1.5"
            fill={isFilled ? 'url(#hub-orange-red)' : 'none'}
            stroke={isFilled ? 'none' : '#FED7AA'}
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

/**
 * Bokstavsbubblor för verbal-kategorin.
 */
export function VerbalCategoryIllustration({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="11" cy="14" r="7" fill="url(#hub-orange-red)" />
      <text x="11" y="17" textAnchor="middle" fontSize="8" fontWeight="800" fill="white">A</text>
      <circle cx="22" cy="22" r="7" fill="url(#hub-orange-red)" opacity="0.8" />
      <text x="22" y="25" textAnchor="middle" fontSize="8" fontWeight="800" fill="white">B</text>
      <circle cx="32" cy="14" r="6" fill="url(#hub-orange-red)" opacity="0.6" />
      <text x="32" y="17" textAnchor="middle" fontSize="7" fontWeight="800" fill="white">C</text>
    </svg>
  );
}

/**
 * Sifferknappar för numerisk-kategorin.
 */
export function NumericalCategoryIllustration({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <rect x="4" y="10" width="10" height="20" rx="2" fill="url(#hub-orange-red)" />
      <text x="9" y="25" textAnchor="middle" fontSize="11" fontWeight="800" fill="white">1</text>
      <rect x="15" y="6" width="10" height="22" rx="2" fill="url(#hub-orange-red)" opacity="0.85" />
      <text x="20" y="22" textAnchor="middle" fontSize="11" fontWeight="800" fill="white">2</text>
      <rect x="26" y="10" width="10" height="20" rx="2" fill="url(#hub-orange-red)" opacity="0.7" />
      <text x="31" y="25" textAnchor="middle" fontSize="11" fontWeight="800" fill="white">3</text>
    </svg>
  );
}

/**
 * Liten kategori-ikon för personlighetstest — fem cirklar i Big Five-anda.
 */
export function PersonalityCategoryIllustration({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* 5 cirklar = Big Five */}
      <circle cx="8" cy="20" r="4" fill="url(#hub-indigo-pink)" />
      <circle cx="16" cy="13" r="4" fill="url(#hub-indigo-pink)" opacity="0.85" />
      <circle cx="20" cy="26" r="4" fill="url(#hub-indigo-pink)" opacity="0.9" />
      <circle cx="28" cy="14" r="4" fill="url(#hub-indigo-pink)" opacity="0.75" />
      <circle cx="32" cy="24" r="4" fill="url(#hub-indigo-pink)" opacity="0.65" />
      {/* Förbindelselinjer */}
      <path d="M 8 20 L 16 13 L 20 26 L 28 14 L 32 24" stroke="#A5B4FC" strokeWidth="1.2" fill="none" opacity="0.55" />
    </svg>
  );
}

/**
 * Liten test-specifik thumbnail per testkort. Olika ikon per test-slug.
 */
export function TestCardThumbnail({
  className = 'w-12 h-12',
  variant = 'matrix-grund',
}: IconProps & {
  variant?:
    | 'matrix-grund'
    | 'matrix-avancerad'
    | 'verbal-v1'
    | 'verbal-v2'
    | 'numerical-v1'
    | 'numerical-v2'
    | 'personality-grund'
    | 'personality-avancerad';
}) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* Bas-cirkel */}
      <circle cx="24" cy="24" r="22" fill="url(#hub-orange-pink)" opacity="0.12" />
      <circle cx="24" cy="24" r="18" fill="url(#hub-orange-pink)" opacity="0.18" />

      {variant === 'matrix-grund' && (
        // 3×3-grid (3 fyllda celler)
        <g transform="translate(12 12)">
          {Array.from({ length: 9 }).map((_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const x = col * 9;
            const y = row * 9;
            const isFilled = [0, 4, 8].includes(i);
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width="7"
                height="7"
                rx="1"
                fill={isFilled ? 'url(#hub-orange-red)' : 'none'}
                stroke={isFilled ? 'none' : '#FB923C'}
                strokeWidth="1"
              />
            );
          })}
        </g>
      )}

      {variant === 'matrix-avancerad' && (
        // Mer komplex 3×3 — koncentriska element
        <g>
          <circle cx="24" cy="24" r="14" fill="none" stroke="url(#hub-orange-red)" strokeWidth="2" />
          <circle cx="24" cy="24" r="9" fill="none" stroke="url(#hub-orange-red)" strokeWidth="2" />
          <circle cx="24" cy="24" r="4" fill="url(#hub-orange-red)" />
          {/* Satellit */}
          <circle cx="34" cy="14" r="2.5" fill="url(#hub-orange-red)" />
        </g>
      )}

      {variant === 'verbal-v1' && (
        <g>
          <text x="24" y="30" textAnchor="middle" fontSize="20" fontWeight="800" fill="url(#hub-orange-red)">Aa</text>
        </g>
      )}

      {variant === 'verbal-v2' && (
        <g>
          {/* 3 ord-bubblor */}
          <rect x="8" y="14" width="14" height="6" rx="2" fill="url(#hub-orange-red)" />
          <rect x="24" y="14" width="14" height="6" rx="2" fill="url(#hub-orange-red)" opacity="0.75" />
          <rect x="14" y="24" width="20" height="6" rx="2" fill="url(#hub-orange-red)" opacity="0.85" />
          <rect x="10" y="34" width="12" height="6" rx="2" fill="url(#hub-orange-red)" opacity="0.6" />
        </g>
      )}

      {variant === 'numerical-v1' && (
        <g>
          {/* Mini-stapeldiagram för grundnivå */}
          <line x1="9" y1="38" x2="39" y2="38" stroke="#FB923C" strokeWidth="1" />
          <line x1="9" y1="38" x2="9" y2="14" stroke="#FB923C" strokeWidth="1" />
          <rect x="13" y="28" width="5" height="10" rx="1" fill="url(#hub-orange-red)" />
          <rect x="20" y="22" width="5" height="16" rx="1" fill="url(#hub-orange-red)" opacity="0.85" />
          <rect x="27" y="18" width="5" height="20" rx="1" fill="url(#hub-orange-red)" opacity="0.95" />
          <rect x="34" y="24" width="5" height="14" rx="1" fill="url(#hub-orange-red)" opacity="0.75" />
        </g>
      )}

      {variant === 'personality-grund' && (
        <g>
          {/* 5 cirklar = Big Five, blå-rosa gradient */}
          <circle cx="14" cy="24" r="3.5" fill="url(#hub-indigo-pink)" />
          <circle cx="20" cy="17" r="3.5" fill="url(#hub-indigo-pink)" opacity="0.85" />
          <circle cx="24" cy="28" r="3.5" fill="url(#hub-indigo-pink)" opacity="0.9" />
          <circle cx="30" cy="18" r="3.5" fill="url(#hub-indigo-pink)" opacity="0.75" />
          <circle cx="34" cy="26" r="3.5" fill="url(#hub-indigo-pink)" opacity="0.65" />
          <path d="M 14 24 L 20 17 L 24 28 L 30 18 L 34 26" stroke="#A5B4FC" strokeWidth="1" fill="none" opacity="0.55" />
        </g>
      )}

      {variant === 'personality-avancerad' && (
        <g>
          {/* Stiliserad människo-silhuett + cirkel-orbit */}
          <circle cx="24" cy="20" r="6" fill="url(#hub-indigo-pink)" />
          <path d="M 14 36 Q 14 28 24 28 Q 34 28 34 36 Z" fill="url(#hub-indigo-pink)" opacity="0.85" />
          {/* Orbit */}
          <circle cx="24" cy="24" r="16" fill="none" stroke="url(#hub-indigo-pink)" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="40" cy="24" r="2" fill="#EC4899" />
        </g>
      )}

      {variant === 'numerical-v2' && (
        <g>
          {/* Linjediagram för avancerad */}
          <line x1="9" y1="38" x2="39" y2="38" stroke="#FB923C" strokeWidth="1" />
          <line x1="9" y1="38" x2="9" y2="14" stroke="#FB923C" strokeWidth="1" />
          <path
            d="M 11 32 L 17 28 L 23 24 L 29 18 L 35 14"
            stroke="url(#hub-orange-red)"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="11" cy="32" r="1.5" fill="#DC2626" />
          <circle cx="17" cy="28" r="1.5" fill="#DC2626" />
          <circle cx="23" cy="24" r="1.5" fill="#DC2626" />
          <circle cx="29" cy="18" r="1.5" fill="#DC2626" />
          <circle cx="35" cy="14" r="1.5" fill="#DC2626" />
        </g>
      )}
    </svg>
  );
}

/**
 * Empty-state — illustration för "inga tester än".
 */
export function EmptyStateIllustration({ className = 'w-32 h-32' }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* Stiliserad start-knapp / pil */}
      <circle cx="60" cy="60" r="44" fill="url(#hub-orange-pink)" opacity="0.1" />
      <circle cx="60" cy="60" r="34" fill="url(#hub-orange-pink)" opacity="0.18" />
      <circle cx="60" cy="60" r="26" fill="url(#hub-orange-red)" />
      {/* Play-triangel */}
      <path d="M 52 48 L 76 60 L 52 72 Z" fill="white" />

      {/* Subtila prickar runtom */}
      <circle cx="14" cy="14" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="106" cy="14" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="14" cy="106" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="106" cy="106" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="60" cy="8" r="1.5" fill="#FB923C" opacity="0.4" />
      <circle cx="60" cy="112" r="1.5" fill="#FB923C" opacity="0.4" />
    </svg>
  );
}
