'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="mx-orange-red" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="mx-orange-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
  </defs>
);

/**
 * Hero-illustration: 3×3-matris med fyllda celler i ett mönster och en
 * "?" i tomma cellen. Visualiserar matrislogik på ett självförklarande sätt.
 * Designad för att läggas i högerkanten av hero, opacity 15%.
 */
export function MatrixHeroIllustration({ className = '' }: IconProps) {
  // 3×3-grid: position i (0-8). Mappa ut vilka som ska ha vad.
  // Mönster: rad 1 = 1 prick, rad 2 = 2 prickar, rad 3 = 3 prickar (sista är tom = ?)
  const cellSize = 80;
  const gap = 8;
  const startX = 30;
  const startY = 30;

  const getCellPos = (row: number, col: number) => ({
    x: startX + col * (cellSize + gap),
    y: startY + row * (cellSize + gap),
  });

  return (
    <svg
      className={className}
      width="340"
      height="340"
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
    >
      {/* Bakre roterad matris-stack (för djup) */}
      <g transform="rotate(-6 160 160)" opacity="0.4">
        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const pos = getCellPos(row, col);
          return (
            <rect
              key={`bg-${i}`}
              x={pos.x}
              y={pos.y}
              width={cellSize}
              height={cellSize}
              rx="10"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
            />
          );
        })}
      </g>

      {/* Främre matris med innehåll */}
      <g>
        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const pos = getCellPos(row, col);
          const isEmpty = i === 8; // Sista cellen är tom

          return (
            <g key={i}>
              <rect
                x={pos.x}
                y={pos.y}
                width={cellSize}
                height={cellSize}
                rx="10"
                fill="white"
                fillOpacity={isEmpty ? '0.18' : '0.1'}
                stroke="white"
                strokeWidth="2"
                opacity="0.9"
              />

              {/* Innehåll: prickar baserat på rad-mönster */}
              {!isEmpty && (
                <g>
                  {/* Rad 0: 1 prick, Rad 1: 2 prickar, Rad 2: 3 prickar */}
                  {row === 0 && (
                    <circle cx={pos.x + 40} cy={pos.y + 40} r="6" fill="white" opacity="0.85" />
                  )}
                  {row === 1 && (
                    <>
                      <circle cx={pos.x + 28} cy={pos.y + 40} r="6" fill="white" opacity="0.85" />
                      <circle cx={pos.x + 52} cy={pos.y + 40} r="6" fill="white" opacity="0.85" />
                    </>
                  )}
                  {row === 2 && (
                    <>
                      <circle cx={pos.x + 22} cy={pos.y + 40} r="6" fill="white" opacity="0.85" />
                      <circle cx={pos.x + 40} cy={pos.y + 40} r="6" fill="white" opacity="0.85" />
                      <circle cx={pos.x + 58} cy={pos.y + 40} r="6" fill="white" opacity="0.85" />
                    </>
                  )}
                </g>
              )}

              {/* "?" i tomma cellen */}
              {isEmpty && (
                <text
                  x={pos.x + 40}
                  y={pos.y + 56}
                  textAnchor="middle"
                  fontSize="44"
                  fontWeight="800"
                  fill="white"
                  opacity="0.9"
                >
                  ?
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Subtila prickar runtom */}
      <circle cx="20" cy="60" r="2.5" fill="white" opacity="0.3" />
      <circle cx="35" cy="280" r="2" fill="white" opacity="0.25" />
      <circle cx="290" cy="40" r="2" fill="white" opacity="0.25" />
      <circle cx="300" cy="280" r="3" fill="white" opacity="0.3" />
      <circle cx="15" cy="160" r="1.5" fill="white" opacity="0.2" />
    </svg>
  );
}

/**
 * Hjärn-badge i orange/röd-gradient med inre nod-detaljer.
 * Används som hero-ikon (ersätter standard lucide Brain).
 */
export function BrainBadgeIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* Bas-glow */}
      <circle cx="24" cy="24" r="22" fill="url(#mx-orange-pink)" opacity="0.12" />
      <circle cx="24" cy="24" r="17" fill="url(#mx-orange-pink)" opacity="0.18" />

      {/* Hjärn-form (förenklad, två lober) */}
      <g transform="translate(8 10)">
        {/* Vänster lob */}
        <path
          d="M14 4 Q4 4 4 14 Q4 22 8 26 Q10 28 14 28 L16 28 L16 4 Z"
          fill="url(#mx-orange-pink)"
          stroke="white"
          strokeWidth="0.8"
        />
        {/* Höger lob */}
        <path
          d="M18 4 Q28 4 28 14 Q28 22 24 26 Q22 28 18 28 L16 28 L16 4 Z"
          fill="url(#mx-orange-red)"
          stroke="white"
          strokeWidth="0.8"
        />
        {/* Nod-detaljer */}
        <circle cx="9" cy="12" r="1.5" fill="white" opacity="0.7" />
        <circle cx="14" cy="18" r="1.2" fill="white" opacity="0.6" />
        <circle cx="22" cy="14" r="1.5" fill="white" opacity="0.7" />
        <circle cx="20" cy="22" r="1.2" fill="white" opacity="0.6" />
        {/* Synaps-linjer */}
        <line x1="9" y1="12" x2="14" y2="18" stroke="white" strokeWidth="0.6" opacity="0.5" />
        <line x1="14" y1="18" x2="20" y2="22" stroke="white" strokeWidth="0.6" opacity="0.5" />
        <line x1="20" y1="22" x2="22" y2="14" stroke="white" strokeWidth="0.6" opacity="0.5" />
      </g>
    </svg>
  );
}

/**
 * Liten 3×3-thumbnail för "Tidigare resultat"-rader.
 * Ritar slumpmässigt ifyllda celler baserat på en seed (deterministisk).
 */
export function MatrixCardThumbnail({ className = 'w-10 h-10', seed = 0 }: IconProps & { seed?: number }) {
  // Deterministisk hash för att avgöra vilka celler som är fyllda
  const filled: boolean[] = [];
  for (let i = 0; i < 9; i++) {
    const hash = (seed * 31 + i * 17 + 7) % 13;
    filled.push(hash > 4);
  }

  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = 4 + col * 11;
        const y = 4 + row * 11;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width="9"
            height="9"
            rx="1.5"
            fill={filled[i] ? 'url(#mx-orange-red)' : '#FFEDD5'}
            stroke={filled[i] ? 'none' : '#FED7AA'}
            strokeWidth="0.5"
          />
        );
      })}
    </svg>
  );
}

/**
 * Empty-state: 3×3-matris med några "förväntningsfulla" prickar.
 * Subtilt inbjudande — antydan om att första testet väntar.
 */
export function EmptyMatrixIllustration({ className = 'w-32 h-32' }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}

      {/* 3×3-grid med ljus orange */}
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = 14 + col * 32;
        const y = 14 + row * 32;
        const isHighlight = i === 4; // Mittencellen highlightas

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width="26"
              height="26"
              rx="5"
              fill={isHighlight ? 'url(#mx-orange-red)' : 'white'}
              fillOpacity={isHighlight ? '0.15' : '1'}
              stroke={isHighlight ? '#DC2626' : '#FED7AA'}
              strokeWidth={isHighlight ? '2' : '1.5'}
            />
            {/* Mittencellen får en stjärna */}
            {isHighlight && (
              <path
                d={`M ${x + 13} ${y + 6} L ${x + 15.5} ${y + 11.5} L ${x + 21} ${y + 12} L ${x + 17} ${y + 16} L ${x + 18.5} ${y + 21} L ${x + 13} ${y + 18.5} L ${x + 7.5} ${y + 21} L ${x + 9} ${y + 16} L ${x + 5} ${y + 12} L ${x + 10.5} ${y + 11.5} Z`}
                fill="url(#mx-orange-red)"
                stroke="white"
                strokeWidth="0.5"
              />
            )}
          </g>
        );
      })}

      {/* Subtila prickar */}
      <circle cx="8" cy="8" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="112" cy="112" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="112" cy="20" r="1.5" fill="#FB923C" opacity="0.4" />
      <circle cx="10" cy="100" r="1.5" fill="#FB923C" opacity="0.4" />
    </svg>
  );
}

/**
 * Logik-pattern-ikon: subtila prickade linjer som antyder mönsterigenkänning.
 * För feature-pills i "Om testet"-kortet.
 */
export function LogicPatternIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="6" cy="6" r="2" fill="currentColor" />
      <circle cx="12" cy="6" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="6" cy="12" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="18" cy="12" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="6" cy="18" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="12" cy="18" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}
