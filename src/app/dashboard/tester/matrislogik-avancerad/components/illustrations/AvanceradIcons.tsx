'use client';

interface IconProps {
  className?: string;
}

const SHARED_DEFS = (
  <defs>
    <linearGradient id="adv-orange-red" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient id="adv-orange-pink" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="50%" stopColor="#DC2626" />
      <stop offset="100%" stopColor="#BE185D" />
    </linearGradient>
  </defs>
);

/**
 * Hero-illustration: 3×3-matris med blandade element (ringar, glyfer, vektorer)
 * som visualiserar avancerade mönster. Mer komplex än grund-versionens
 * jämna prick-rader.
 */
export function AvanceradHeroIllustration({ className = '' }: IconProps) {
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
      {/* Bakre lager */}
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

      {/* Främre lager med blandade element */}
      <g>
        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const pos = getCellPos(row, col);
          const isEmpty = i === 8;
          const cx = pos.x + cellSize / 2;
          const cy = pos.y + cellSize / 2;

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

              {!isEmpty && (
                <g>
                  {/* Olika element per rad för att visa variation */}
                  {row === 0 && (
                    // Rad 1: koncentriska ringar
                    <g>
                      {Array.from({ length: col + 1 }).map((_, ringIdx) => (
                        <circle
                          key={ringIdx}
                          cx={cx}
                          cy={cy}
                          r={26 - ringIdx * 8}
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          opacity={0.85 - ringIdx * 0.15}
                        />
                      ))}
                      {/* Center fylld */}
                      <circle cx={cx} cy={cy} r="6" fill="white" opacity="0.9" />
                    </g>
                  )}

                  {row === 1 && (
                    // Rad 2: orbital med satellit
                    <g>
                      <circle cx={cx} cy={cy} r="22" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.5" />
                      <circle cx={cx} cy={cy} r="5" fill="white" opacity="0.9" />
                      {(() => {
                        const angles = [-90, -45, 0]; // top, top-right, right
                        const a = angles[col] * (Math.PI / 180);
                        const sx = cx + 22 * Math.cos(a);
                        const sy = cy + 22 * Math.sin(a);
                        return <circle cx={sx} cy={sy} r="4" fill="white" opacity="0.95" />;
                      })()}
                    </g>
                  )}

                  {row === 2 && (
                    // Rad 3: vektor-pilar
                    <g>
                      {(() => {
                        const angles = [0, 45, 90];
                        return (
                          <g transform={`rotate(${angles[col]} ${cx} ${cy})`}>
                            <line
                              x1={cx}
                              y1={cy + 24}
                              x2={cx}
                              y2={cy - 18}
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              opacity="0.85"
                            />
                            <path
                              d={`M ${cx} ${cy - 24} L ${cx - 8} ${cy - 16} L ${cx + 8} ${cy - 16} Z`}
                              fill="white"
                              opacity="0.95"
                            />
                          </g>
                        );
                      })()}
                    </g>
                  )}
                </g>
              )}

              {/* "?" i tomma cellen */}
              {isEmpty && (
                <text
                  x={cx}
                  y={cy + 16}
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

      {/* Subtila prickar */}
      <circle cx="20" cy="60" r="2.5" fill="white" opacity="0.3" />
      <circle cx="35" cy="280" r="2" fill="white" opacity="0.25" />
      <circle cx="290" cy="40" r="2" fill="white" opacity="0.25" />
      <circle cx="300" cy="280" r="3" fill="white" opacity="0.3" />
    </svg>
  );
}

/**
 * Layers-badge för hero-rubrik (ersätter Brain — markerar "avancerat").
 */
export function LayersBadgeIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      <circle cx="24" cy="24" r="22" fill="url(#adv-orange-pink)" opacity="0.12" />
      <circle cx="24" cy="24" r="17" fill="url(#adv-orange-pink)" opacity="0.18" />

      {/* Tre lager (diamantformer) staplade */}
      <g transform="translate(8 12)">
        {/* Bottom layer */}
        <path
          d="M 16 24 L 4 18 L 16 12 L 28 18 Z"
          fill="url(#adv-orange-pink)"
          opacity="0.5"
        />
        {/* Middle layer */}
        <path
          d="M 16 18 L 4 12 L 16 6 L 28 12 Z"
          fill="url(#adv-orange-red)"
          opacity="0.75"
        />
        {/* Top layer */}
        <path
          d="M 16 12 L 4 6 L 16 0 L 28 6 Z"
          fill="url(#adv-orange-red)"
          stroke="white"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
}

/**
 * Liten thumbnail för "Tidigare resultat"-rader. Lite mer komplex än grund-versionen.
 */
export function AvanceradCardThumbnail({ className = 'w-10 h-10', seed = 0 }: IconProps & { seed?: number }) {
  const filled: boolean[] = [];
  for (let i = 0; i < 9; i++) {
    const hash = (seed * 37 + i * 19 + 11) % 17;
    filled.push(hash > 8);
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
            fill={filled[i] ? 'url(#adv-orange-pink)' : '#FFEDD5'}
            stroke={filled[i] ? 'none' : '#FED7AA'}
            strokeWidth="0.5"
          />
        );
      })}
    </svg>
  );
}

/**
 * Empty-state — komplexare än grund-versionens.
 */
export function AvanceradEmptyIllustration({ className = 'w-32 h-32' }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {SHARED_DEFS}
      {/* 3 koncentriska ringar i mitten */}
      <circle cx="60" cy="60" r="32" fill="none" stroke="#FED7AA" strokeWidth="2" />
      <circle cx="60" cy="60" r="22" fill="none" stroke="#FB923C" strokeWidth="2" />
      <circle cx="60" cy="60" r="12" fill="url(#adv-orange-red)" opacity="0.7" />
      <circle cx="60" cy="60" r="4" fill="white" />

      {/* Subtila prickar runtom */}
      <circle cx="14" cy="14" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="106" cy="14" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="14" cy="106" r="2" fill="#FB923C" opacity="0.5" />
      <circle cx="106" cy="106" r="2" fill="#FB923C" opacity="0.5" />
    </svg>
  );
}

/**
 * Layers-pattern för feature-pills.
 */
export function LayersPatternIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 12 2 L 22 7 L 12 12 L 2 7 Z" fill="currentColor" opacity="0.4" />
      <path d="M 12 7 L 22 12 L 12 17 L 2 12 Z" fill="currentColor" opacity="0.7" />
      <path d="M 12 12 L 22 17 L 12 22 L 2 17 Z" fill="currentColor" />
    </svg>
  );
}
