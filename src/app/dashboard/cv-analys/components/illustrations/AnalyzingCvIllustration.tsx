'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

interface AnalyzingCvIllustrationProps {
  progress: number; // 0-100
}

const PAPER_WIDTH = 220;
const PAPER_HEIGHT = 290;
const SCAN_TOP = 30;
const SCAN_BOTTOM = PAPER_HEIGHT - 20;

/**
 * Stor hjälte-illustration för CV-analys-steget.
 * Ett pappers-CV som scannas live: horisontell scan-linje glider top-to-bottom
 * och rader lyser upp i sekvens. Particles drivs uppåt och visar att data extraheras.
 *
 * Tar emot progress (0-100) och animationen fortsätter loopa oavsett. Stannar
 * helt vid prefers-reduced-motion.
 */
export default function AnalyzingCvIllustration({ progress }: AnalyzingCvIllustrationProps) {
  const reduceMotion = useReducedMotion();

  // Linjer som ser ut som CV-rader (placering + längd)
  const lines = useMemo(
    () => [
      { y: 50, w: 95, color: '#1E293B', h: 4 }, // Namn
      { y: 62, w: 60, color: '#94A3B8', h: 2.5 }, // Rubrik
      { y: 78, w: 40, color: '#FB923C', h: 3, isLabel: true },
      { y: 88, w: 150, color: '#CBD5E1', h: 2 },
      { y: 95, w: 130, color: '#CBD5E1', h: 2 },
      { y: 102, w: 145, color: '#CBD5E1', h: 2 },
      { y: 118, w: 50, color: '#FB923C', h: 3, isLabel: true },
      { y: 128, w: 160, color: '#1E293B', h: 2.5 },
      { y: 136, w: 110, color: '#94A3B8', h: 2 },
      { y: 144, w: 150, color: '#CBD5E1', h: 2 },
      { y: 151, w: 135, color: '#CBD5E1', h: 2 },
      { y: 158, w: 145, color: '#CBD5E1', h: 2 },
      { y: 174, w: 160, color: '#1E293B', h: 2.5 },
      { y: 182, w: 100, color: '#94A3B8', h: 2 },
      { y: 190, w: 145, color: '#CBD5E1', h: 2 },
      { y: 197, w: 130, color: '#CBD5E1', h: 2 },
      { y: 213, w: 45, color: '#FB923C', h: 3, isLabel: true },
      { y: 223, w: 155, color: '#CBD5E1', h: 2 },
      { y: 230, w: 140, color: '#CBD5E1', h: 2 },
      { y: 246, w: 50, color: '#FB923C', h: 3, isLabel: true },
      { y: 256, w: 160, color: '#CBD5E1', h: 2 },
      { y: 263, w: 130, color: '#CBD5E1', h: 2 },
    ],
    []
  );

  // Particles som "extraheras" från dokumentet och flyger uppåt
  const particles = useMemo(() => {
    if (reduceMotion) return [];
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      startX: 30 + Math.random() * (PAPER_WIDTH - 60),
      delay: i * 0.4,
      duration: 2.4 + Math.random() * 1.2,
      size: 1.5 + Math.random() * 2,
      color: i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#F97316' : '#FB923C',
    }));
  }, [reduceMotion]);

  return (
    <div
      className="relative mx-auto"
      style={{ width: PAPER_WIDTH + 60, height: PAPER_HEIGHT + 40 }}
    >
      {/* Bakgrund-glow */}
      {!reduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, rgba(220, 38, 38, 0.08) 40%, transparent 70%)',
            filter: 'blur(28px)',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Pulserande ring */}
      {!reduceMotion && (
        <motion.div
          className="absolute rounded-full border-2 border-orange-200"
          style={{
            top: '50%',
            left: '50%',
            width: PAPER_WIDTH + 40,
            height: PAPER_WIDTH + 40,
            x: '-50%',
            y: '-50%',
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Particles (extraherad data) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: 30 + p.startX,
            top: PAPER_HEIGHT - 30,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{
            y: [0, -PAPER_HEIGHT - 60],
            x: [0, (Math.random() - 0.5) * 60],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1, 0.4],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Pappers-CV */}
      <div
        className="absolute rounded-2xl bg-white overflow-hidden"
        style={{
          left: '50%',
          top: 20,
          width: PAPER_WIDTH,
          height: PAPER_HEIGHT,
          transform: 'translateX(-50%)',
          boxShadow:
            '0 24px 48px -16px rgba(220, 38, 38, 0.28), 0 8px 20px -8px rgba(15, 23, 42, 0.12)',
        }}
      >
        {/* Topp-band med gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{
            background:
              'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
        />

        {/* SVG-content med pappers-rader */}
        <svg
          width={PAPER_WIDTH}
          height={PAPER_HEIGHT}
          viewBox={`0 0 ${PAPER_WIDTH} ${PAPER_HEIGHT}`}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="acv-line-pulse" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FB923C" stopOpacity="0" />
              <stop offset="50%" stopColor="#DC2626" stopOpacity="1" />
              <stop offset="100%" stopColor="#BE185D" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Profil-cirkel uppe till höger */}
          <circle cx={PAPER_WIDTH - 30} cy={50} r={14} fill="#FED7AA" />
          <circle cx={PAPER_WIDTH - 30} cy={46} r={4} fill="#FB923C" opacity="0.6" />
          <path
            d={`M ${PAPER_WIDTH - 38} 60 Q ${PAPER_WIDTH - 30} 54 ${PAPER_WIDTH - 22} 60`}
            stroke="#FB923C"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />

          {/* CV-rader */}
          {lines.map((line, i) => (
            <CvLine
              key={i}
              y={line.y}
              width={line.w}
              height={line.h}
              color={line.color}
              isLabel={line.isLabel}
              index={i}
              reduceMotion={!!reduceMotion}
            />
          ))}
        </svg>

        {/* Scan-linje (top-to-bottom loop) */}
        {!reduceMotion && (
          <motion.div
            className="absolute left-0 right-0 pointer-events-none"
            style={{ top: 0, height: 28 }}
            animate={{ y: [SCAN_TOP, SCAN_BOTTOM, SCAN_TOP] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Glow-lager */}
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6"
              style={{
                background:
                  'linear-gradient(180deg, transparent 0%, rgba(249, 115, 22, 0.18) 50%, transparent 100%)',
                filter: 'blur(2px)',
              }}
            />
            {/* Skarp linje */}
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px]"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.4) 10%, rgba(220, 38, 38, 1) 50%, rgba(249, 115, 22, 0.4) 90%, transparent 100%)',
                boxShadow: '0 0 12px rgba(220, 38, 38, 0.7)',
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Liten orb i hörnet (data-target) */}
      {!reduceMotion && (
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            top: 0,
            right: 0,
            width: 36,
            height: 36,
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 8px 20px -4px rgba(220, 38, 38, 0.5)',
          }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="relative z-10"
          >
            <path
              d="M9 2 L11 7 L16 8 L12 11.5 L13 16.5 L9 14 L5 16.5 L6 11.5 L2 8 L7 7 Z"
              fill="white"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

/**
 * En enskild CV-rad. Lyser upp i en puls i sekvens med staggered delays.
 * Ger intryck av att raderna analyseras en efter en.
 */
function CvLine({
  y,
  width,
  height,
  color,
  isLabel,
  index,
  reduceMotion,
}: {
  y: number;
  width: number;
  height: number;
  color: string;
  isLabel?: boolean;
  index: number;
  reduceMotion: boolean;
}) {
  const baseColor = color;
  return (
    <g>
      <rect
        x={20}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill={baseColor}
        opacity={isLabel ? 1 : 0.55}
      />
      {!reduceMotion && (
        <motion.rect
          x={20}
          y={y - 1}
          width={width}
          height={height + 2}
          rx={(height + 2) / 2}
          fill="url(#acv-line-pulse)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: (index * 0.35) % 4,
            ease: 'easeOut',
          }}
        />
      )}
    </g>
  );
}
