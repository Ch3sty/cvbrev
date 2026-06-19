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
  </defs>
);

/**
 * Hero-illustration: alla 4 testkategorier i en harmonisk komposition.
 * - 3×3 mini-matris (logik) i bakgrunden, roterad
 * - Bokstavsbubblor "ABC" (verbal)
 * - Sifferknappar "123" (numerisk)
 * - Big Five-orbit med 5 sammanlänkade punkter (personlighet) som "ramar in"
 * Allt i vit på orange-bakgrund (hero-användning).
 */
export function TesterHubIllustration({ className = '' }: IconProps) {
  return (
    <svg
      className={className}
      width="360"
      height="360"
      viewBox="0 0 360 360"
      fill="none"
      aria-hidden="true"
    >
      {/* Big Five-orbit: stora cirklar runtom hela kompositionen */}
      <g opacity="0.55">
        <circle cx="180" cy="180" r="148" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="2 5" opacity="0.5" />
        <circle cx="180" cy="180" r="128" fill="none" stroke="white" strokeWidth="0.8" strokeDasharray="1 4" opacity="0.35" />
      </g>

      {/* Big Five-noder: 5 cirklar längs den yttre orbiten + linjer mellan */}
      <g opacity="0.95">
        {/* 5 punkter spridda jämnt på orbiten (180° = top, 252°, 324°, 36°, 108°) */}
        {[
          { cx: 180, cy: 32, r: 7, op: 1 },     // top
          { cx: 320, cy: 134, r: 6, op: 0.85 }, // upper-right
          { cx: 266, cy: 298, r: 6, op: 0.75 }, // lower-right
          { cx: 94, cy: 298, r: 7, op: 0.9 },   // lower-left
          { cx: 40, cy: 134, r: 6, op: 0.8 },   // upper-left
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.cx} cy={p.cy} r={p.r + 4} fill="white" opacity="0.15" />
            <circle cx={p.cx} cy={p.cy} r={p.r} fill="white" opacity={p.op} />
          </g>
        ))}
        {/* Förbindelselinjer mellan noderna (subtil pentagonal form) */}
        <path
          d="M 180 32 L 320 134 L 266 298 L 94 298 L 40 134 Z"
          fill="none"
          stroke="white"
          strokeWidth="1.4"
          strokeLinejoin="round"
          opacity="0.45"
        />
      </g>

      {/* Bakgrund: roterat 3×3-rutnät (matrislogik) */}
      <g transform="rotate(-12 180 130)" opacity="0.75">
        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const x = 110 + col * 50;
          const y = 70 + row * 50;
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
              fillOpacity={isFilled ? '0.2' : '0'}
              stroke="white"
              strokeWidth="1.8"
              opacity="0.85"
            />
          );
        })}
      </g>

      {/* Mitten-vänster: bokstavsbubblor (verbal) */}
      <g transform="rotate(8 120 230)">
        <circle cx="78" cy="226" r="22" fill="white" fillOpacity="0.28" stroke="white" strokeWidth="2" opacity="0.92" />
        <text x="78" y="234" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" opacity="0.95">A</text>
        <circle cx="128" cy="244" r="20" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" opacity="0.85" />
        <text x="128" y="251" textAnchor="middle" fontSize="20" fontWeight="800" fill="white" opacity="0.9">B</text>
        <circle cx="174" cy="228" r="17" fill="white" fillOpacity="0.14" stroke="white" strokeWidth="2" opacity="0.78" />
        <text x="174" y="234" textAnchor="middle" fontSize="17" fontWeight="800" fill="white" opacity="0.85">C</text>
      </g>

      {/* Höger-mitten: sifferknappar (numerisk) */}
      <g>
        <rect x="218" y="232" width="32" height="44" rx="6" fill="white" fillOpacity="0.24" stroke="white" strokeWidth="2" opacity="0.95" />
        <text x="234" y="262" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" opacity="0.95">1</text>
        <rect x="256" y="220" width="34" height="46" rx="6" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" opacity="0.9" />
        <text x="273" y="252" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" opacity="0.92">2</text>
        <rect x="296" y="232" width="32" height="44" rx="6" fill="white" fillOpacity="0.16" stroke="white" strokeWidth="2" opacity="0.85" />
        <text x="312" y="262" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" opacity="0.88">3</text>
      </g>

      {/* Subtila stjärnprickar runtom */}
      <circle cx="22" cy="42" r="2.5" fill="white" opacity="0.4" />
      <circle cx="38" cy="320" r="2" fill="white" opacity="0.32" />
      <circle cx="330" cy="62" r="2.5" fill="white" opacity="0.32" />
      <circle cx="338" cy="320" r="3" fill="white" opacity="0.38" />
      <circle cx="18" cy="200" r="1.5" fill="white" opacity="0.28" />
      <circle cx="220" cy="22" r="1.8" fill="white" opacity="0.32" />
      <circle cx="345" cy="220" r="1.6" fill="white" opacity="0.3" />
      <circle cx="10" cy="100" r="1.4" fill="white" opacity="0.25" />
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
      {/* 5 cirklar = Big Five, orange-röd gradient */}
      <circle cx="8" cy="20" r="4" fill="url(#hub-orange-pink)" />
      <circle cx="16" cy="13" r="4" fill="url(#hub-orange-pink)" opacity="0.85" />
      <circle cx="20" cy="26" r="4" fill="url(#hub-orange-pink)" opacity="0.9" />
      <circle cx="28" cy="14" r="4" fill="url(#hub-orange-pink)" opacity="0.75" />
      <circle cx="32" cy="24" r="4" fill="url(#hub-orange-pink)" opacity="0.65" />
      {/* Förbindelselinjer */}
      <path d="M 8 20 L 16 13 L 20 26 L 28 14 L 32 24" stroke="#FB923C" strokeWidth="1.2" fill="none" opacity="0.55" />
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
    | 'matrix-expert'
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

      {(variant === 'matrix-avancerad' || variant === 'matrix-expert') && (
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
          {/* 5 cirklar = Big Five */}
          <circle cx="14" cy="24" r="3.5" fill="url(#hub-orange-red)" />
          <circle cx="20" cy="17" r="3.5" fill="url(#hub-orange-red)" opacity="0.85" />
          <circle cx="24" cy="28" r="3.5" fill="url(#hub-orange-red)" opacity="0.9" />
          <circle cx="30" cy="18" r="3.5" fill="url(#hub-orange-red)" opacity="0.75" />
          <circle cx="34" cy="26" r="3.5" fill="url(#hub-orange-red)" opacity="0.65" />
          <path d="M 14 24 L 20 17 L 24 28 L 30 18 L 34 26" stroke="#FB923C" strokeWidth="1" fill="none" opacity="0.55" />
        </g>
      )}

      {variant === 'personality-avancerad' && (
        <g>
          {/* Stiliserad människo-silhuett + cirkel-orbit */}
          <circle cx="24" cy="20" r="6" fill="url(#hub-orange-pink)" />
          <path d="M 14 36 Q 14 28 24 28 Q 34 28 34 36 Z" fill="url(#hub-orange-pink)" opacity="0.85" />
          {/* Orbit */}
          <circle cx="24" cy="24" r="16" fill="none" stroke="url(#hub-orange-pink)" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="40" cy="24" r="2" fill="#DC2626" />
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
/**
 * Illustration för personlighets-resultatkortet: en persona-byst inramad av en
 * Big Five-orbit. Används både i tom-state och som visuell signatur på kortet.
 */
export function PersonalityProfileIllustration({ className = 'w-20 h-20' }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* Mjuk bakgrundscirkel */}
      <circle cx="40" cy="40" r="34" fill="url(#hub-orange-pink)" opacity="0.08" />
      {/* Persona: huvud + axlar */}
      <circle cx="40" cy="33" r="11" fill="url(#hub-orange-red)" />
      <path d="M 23 60 C 23 49 31 45 40 45 C 49 45 57 49 57 60 Z" fill="url(#hub-orange-red)" opacity="0.9" />
      {/* Big Five-orbit: 5 punkter runt personan, sammanlänkade */}
      <g opacity="0.7">
        <circle cx="40" cy="9" r="3" fill="#FB923C" />
        <circle cx="69" cy="30" r="3" fill="#DC2626" />
        <circle cx="58" cy="68" r="3" fill="#BE185D" />
        <circle cx="22" cy="68" r="3" fill="#DC2626" />
        <circle cx="11" cy="30" r="3" fill="#FB923C" />
        <path
          d="M 40 9 L 69 30 L 58 68 L 22 68 L 11 30 Z"
          stroke="#FDBA74"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}

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
