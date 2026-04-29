'use client';

import { motion } from 'framer-motion';

/**
 * Subtilt nätverk: tre noder (CV, Annons, Brev) kopplade med kurvor.
 * Visualiserar vad Smart-anpassad gör — analyserar tre datakällor
 * och knyter ihop dem.
 *
 * Layout: noderna är CSS-positionerade med procent så de följer
 * bannerns dimensioner exakt på alla skärmstorlekar (cirklar förblir
 * runda — slipper SVG aspect-ratio-problem). Kurvorna ritas i en
 * separat SVG som sträcks med preserveAspectRatio="none" eftersom
 * dash-strokes tål stretching utan att se konstiga ut.
 *
 * Triangulär komposition runt textens läs-zon:
 * - Nod 1: övre-vänster (~10%, ~18%)
 * - Nod 2: övre-höger (~90%, ~18%)
 * - Nod 3: nedre-center (~50%, ~85%)
 */
export default function SmartToneNetwork() {
  const positions = [
    { x: 10, y: 18, icon: 'cv' as const, delay: 0 },
    { x: 90, y: 18, icon: 'job' as const, delay: 0.6 },
    { x: 50, y: 85, icon: 'letter' as const, delay: 1.2 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Kurvor som SVG, stretchas över hela bannern */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="smart-line" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Toppkurva: vänster → höger, böjer svagt nedåt */}
        <motion.path
          d="M 10 18 Q 50 8, 90 18"
          stroke="url(#smart-line)"
          strokeWidth="0.3"
          strokeDasharray="1 2"
          fill="none"
          opacity="0.55"
          vectorEffect="non-scaling-stroke"
          animate={{ strokeDashoffset: [0, -6] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
        />
        {/* Vänster diagonal: övre-vänster → nedre-center */}
        <motion.path
          d="M 10 18 Q 22 60, 50 85"
          stroke="url(#smart-line)"
          strokeWidth="0.3"
          strokeDasharray="1 2"
          fill="none"
          opacity="0.5"
          vectorEffect="non-scaling-stroke"
          animate={{ strokeDashoffset: [0, -6] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'linear', delay: 0.4 }}
        />
        {/* Höger diagonal: övre-höger → nedre-center */}
        <motion.path
          d="M 90 18 Q 78 60, 50 85"
          stroke="url(#smart-line)"
          strokeWidth="0.3"
          strokeDasharray="1 2"
          fill="none"
          opacity="0.5"
          vectorEffect="non-scaling-stroke"
          animate={{ strokeDashoffset: [0, -6] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'linear', delay: 0.8 }}
        />

        {/* Spridda mikro-prickar för djup */}
        <circle cx="30" cy="40" r="0.4" fill="white" opacity="0.3" vectorEffect="non-scaling-stroke" />
        <circle cx="70" cy="38" r="0.3" fill="white" opacity="0.25" vectorEffect="non-scaling-stroke" />
        <circle cx="28" cy="70" r="0.3" fill="white" opacity="0.22" vectorEffect="non-scaling-stroke" />
        <circle cx="72" cy="70" r="0.4" fill="white" opacity="0.28" vectorEffect="non-scaling-stroke" />
        <circle cx="20" cy="55" r="0.3" fill="white" opacity="0.2" vectorEffect="non-scaling-stroke" />
        <circle cx="80" cy="55" r="0.3" fill="white" opacity="0.2" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Noderna som absolut-positionerade DOM-element så cirklarna förblir runda */}
      {positions.map((pos) => (
        <NetworkNode
          key={pos.icon}
          xPercent={pos.x}
          yPercent={pos.y}
          delay={pos.delay}
          icon={pos.icon}
        />
      ))}
    </div>
  );
}

function NetworkNode({
  xPercent,
  yPercent,
  delay,
  icon,
}: {
  xPercent: number;
  yPercent: number;
  delay: number;
  icon: 'cv' | 'job' | 'letter';
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
        {/* Yttre pulserande glow */}
        <motion.div
          className="absolute inset-[-50%] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)',
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2.6, repeat: Infinity, delay, ease: 'easeOut' }}
        />
        {/* Mellanring */}
        <motion.div
          className="absolute inset-[-15%] rounded-full border border-white/55"
          animate={{ scale: [1, 1.2, 1], opacity: [0.55, 0.15, 0.55] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: delay + 0.3, ease: 'easeOut' }}
        />
        {/* Solid bakgrundscirkel */}
        <div className="absolute inset-0 rounded-full bg-white/15 border border-white/60" />
        {/* Mini-ikon i mitten */}
        <NodeIcon variant={icon} />
      </div>
    </div>
  );
}

function NodeIcon({ variant }: { variant: 'cv' | 'job' | 'letter' }) {
  if (variant === 'cv') {
    return (
      <svg
        className="relative w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 16 18"
        fill="none"
        aria-hidden="true"
      >
        <rect x="0" y="0" width="16" height="18" rx="2" fill="white" fillOpacity="0.85" />
        <line x1="3" y1="5" x2="13" y2="5" stroke="#DC2626" strokeWidth="1.2" />
        <line x1="3" y1="9" x2="11" y2="9" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
        <line x1="3" y1="13" x2="13" y2="13" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
      </svg>
    );
  }
  if (variant === 'job') {
    return (
      <svg
        className="relative w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect x="0" y="3" width="16" height="13" rx="2" fill="white" fillOpacity="0.85" />
        <rect x="5" y="0" width="6" height="4" rx="1" fill="white" fillOpacity="0.85" />
        <line x1="3" y1="9" x2="13" y2="9" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
        <line x1="3" y1="12" x2="10" y2="12" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
      </svg>
    );
  }
  return (
    <svg
      className="relative w-5 h-5 sm:w-6 sm:h-6"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="0" y="2" width="16" height="14" rx="2" fill="white" fillOpacity="0.85" />
      <path d="M 0 4 L 8 11 L 16 4" stroke="#DC2626" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
