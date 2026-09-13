'use client';


import { useMemo } from 'react';

interface CVThumbnailIllustrationProps {
  seed?: string;
  /** Vilka sektioner som har edit-prickar */
  editedSections?: {
    profile?: boolean;
    roleIndices?: number[]; // vilka roller (0-baserat)
    skills?: boolean;
  };
  className?: string;
  /** Klickbar prick - scrolla till motsvarande change-log item */
  onDotClick?: (sectionId: string) => void;
}

/**
 * Stiliserad SVG-CV med deterministiska linjer (seed-baserad hash).
 * Edit-prickar pulserar på sektioner som ändrats.
 */
export default function CVThumbnailIllustration({
  seed = 'default',
  editedSections,
  className = '',
  onDotClick,
}: CVThumbnailIllustrationProps) {
  // Deterministisk hash från seed
  const hash = useMemo(() => {
    return seed.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  }, [seed]);

  const lineLen = (i: number) => 56 + (Math.abs((hash >> (i % 8)) + i * 11) % 28);

  const profile = editedSections?.profile;
  const roleIndices = editedSections?.roleIndices || [];
  const skills = editedSections?.skills;

  // Y-koordinater för sektioner (för att placera prickar)
  const PROFILE_Y = 38;
  const ROLES_START_Y = 78;
  const ROLES_GAP = 32;
  const SKILLS_Y = 200;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 260"
        fill="none"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Pappersyta */}
        <rect
          x="2"
          y="2"
          width="196"
          height="256"
          rx="8"
          fill="#FFFFFF"
          stroke="#E5E5E5"
          strokeWidth="1"
        />

        {/* Profil-cirkel */}
        <circle cx="170" cy="28" r="11" fill="#F5F5F5" />

        {/* Namn + titel */}
        <rect x="14" y="20" width="80" height="6" rx="1.5" fill="#1E293B" />
        <rect x="14" y="29" width="60" height="3" rx="1" fill="#94A3B8" />

        {/* SAMMANFATTNING-rubrik */}
        <rect x="14" y={PROFILE_Y - 4} width="44" height="3.5" rx="1.5" fill="#171717" />

        {/* SAMMANFATTNING-rader (4 stycken, deterministiska längder) */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={`p-${i}`}
            x="14"
            y={PROFILE_Y + 4 + i * 5}
            width={lineLen(i) * 1.6}
            height="2"
            rx="1"
            fill="#CBD5E1"
          />
        ))}

        {/* ERFARENHETER-rubrik */}
        <rect x="14" y="68" width="50" height="3.5" rx="1.5" fill="#171717" />

        {/* ERFARENHETER - 3 roller */}
        {[0, 1, 2].map((roleIdx) => {
          const baseY = ROLES_START_Y + roleIdx * ROLES_GAP;
          return (
            <g key={`role-${roleIdx}`}>
              {/* Rubrik (jobbtitel) */}
              <rect x="14" y={baseY} width={lineLen(roleIdx + 5) * 1.4} height="3" rx="1" fill="#1E293B" />
              {/* Företag/period */}
              <rect x="14" y={baseY + 6} width={lineLen(roleIdx + 7) * 1.0} height="2.5" rx="1" fill="#94A3B8" />
              {/* Brödtext-rader */}
              {[0, 1, 2].map((i) => (
                <rect
                  key={i}
                  x="14"
                  y={baseY + 12 + i * 5}
                  width={lineLen(roleIdx * 3 + i) * 1.8}
                  height="2"
                  rx="1"
                  fill="#CBD5E1"
                />
              ))}
            </g>
          );
        })}

        {/* FÄRDIGHETER-rubrik */}
        <rect x="14" y={SKILLS_Y - 4} width="44" height="3.5" rx="1.5" fill="#171717" />

        {/* Skill-chips */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 14 + (i % 3) * 60;
          const y = SKILLS_Y + 4 + Math.floor(i / 3) * 10;
          const w = 36 + (Math.abs((hash >> i) % 18));
          return (
            <rect
              key={`skill-${i}`}
              x={x}
              y={y}
              width={w}
              height="6"
              rx="3"
              fill="#F5F5F5"
              stroke="#E5E5E5"
              strokeWidth="0.6"
            />
          );
        })}

        {/* UTBILDNING-rubrik */}
        <rect x="14" y={SKILLS_Y + 32} width="44" height="3.5" rx="1.5" fill="#171717" />
        <rect x="14" y={SKILLS_Y + 38} width="100" height="2.5" rx="1" fill="#1E293B" />
        <rect x="14" y={SKILLS_Y + 43} width="80" height="2" rx="1" fill="#CBD5E1" />
      </svg>

      {/* Edit-prickar overlay (positionerade i procent) */}
      {profile && (
        <EditDot
          left="6%"
          top="14%"
          label="Personbeskrivning ändrad"
          onClick={() => onDotClick?.('profile')}
        />
      )}

      {roleIndices.map((roleIdx) => {
        if (roleIdx > 2) return null; // bara visa de 3 första
        const topPct = 30 + roleIdx * 12.3;
        return (
          <EditDot
            key={`dot-role-${roleIdx}`}
            left="6%"
            top={`${topPct}%`}
            label={`Roll ${roleIdx + 1} ändrad`}
            onClick={() => onDotClick?.(`role-${roleIdx}`)}
          />
        );
      })}

      {skills && (
        <EditDot
          left="6%"
          top="76%"
          label="Färdigheter tillagda"
          onClick={() => onDotClick?.('skills')}
        />
      )}
    </div>
  );
}

function EditDot({
  left,
  top,
  label,
  onClick,
}: {
  left: string;
  top: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute focus:outline-none"
      style={{ left, top, transform: 'translate(-50%, -50%)' }}
    >
      <span className="block h-3 w-3 rounded-full border-2 border-panel bg-ink-1" />
    </button>
  );
}
