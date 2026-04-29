'use client';

import { motion } from 'framer-motion';

/**
 * Subtilt nätverk: tre noder (CV, Annons, Brev) kopplade med kurvor.
 * Visualiserar vad Smart-anpassad gör — analyserar tre datakällor
 * och knyter ihop dem.
 *
 * Layout: triangulär komposition runt textens läs-zon (x=80..480, y=60..180):
 * - Nod 1: övre-vänster (50, 40)
 * - Nod 2: övre-höger (550, 40)
 * - Nod 3: nedre-center (300, 210)
 *
 * Tre kurvor binder ihop noderna och ramar visuellt in textblocket.
 * Varje nod pulserar i tur och ordning, kurvor har animerad dash-stroke.
 */
export default function SmartToneNetwork() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 600 240"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="smart-line" x1="0" y1="0" x2="600" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="smart-node-glow">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Triangel-kurvor som binder ihop noderna runt texten */}
      {/* Toppkurva: vänster → höger, böjer svagt nedåt */}
      <motion.path
        d="M 50 40 Q 300 18, 550 40"
        stroke="url(#smart-line)"
        strokeWidth="1.25"
        strokeDasharray="4 8"
        fill="none"
        opacity="0.55"
        animate={{ strokeDashoffset: [0, -24] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Vänster diagonal: övre-vänster → nedre-center */}
      <motion.path
        d="M 50 40 Q 130 150, 300 210"
        stroke="url(#smart-line)"
        strokeWidth="1.25"
        strokeDasharray="4 8"
        fill="none"
        opacity="0.5"
        animate={{ strokeDashoffset: [0, -24] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear', delay: 0.4 }}
      />
      {/* Höger diagonal: övre-höger → nedre-center */}
      <motion.path
        d="M 550 40 Q 470 150, 300 210"
        stroke="url(#smart-line)"
        strokeWidth="1.25"
        strokeDasharray="4 8"
        fill="none"
        opacity="0.5"
        animate={{ strokeDashoffset: [0, -24] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'linear', delay: 0.8 }}
      />

      {/* Tre noder med ikoner inne */}
      <NetworkNode cx={50} cy={40} delay={0} icon="cv" />
      <NetworkNode cx={550} cy={40} delay={0.6} icon="job" />
      <NetworkNode cx={300} cy={210} delay={1.2} icon="letter" />

      {/* Spridda mikro-prickar för djup */}
      <circle cx="180" cy="80" r="1.5" fill="white" opacity="0.3" />
      <circle cx="420" cy="75" r="1.25" fill="white" opacity="0.25" />
      <circle cx="150" cy="180" r="1" fill="white" opacity="0.22" />
      <circle cx="450" cy="185" r="1.5" fill="white" opacity="0.28" />
      <circle cx="100" cy="120" r="1" fill="white" opacity="0.2" />
      <circle cx="500" cy="125" r="1" fill="white" opacity="0.2" />
    </svg>
  );
}

function NetworkNode({
  cx,
  cy,
  delay,
  icon,
}: {
  cx: number;
  cy: number;
  delay: number;
  icon: 'cv' | 'job' | 'letter';
}) {
  return (
    <g>
      {/* Yttre pulserande glow */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="32"
        fill="url(#smart-node-glow)"
        animate={{ scale: [1, 1.4, 1], opacity: [0.55, 0, 0.55] }}
        transition={{ duration: 2.6, repeat: Infinity, delay, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Mellanring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="24"
        fill="none"
        stroke="white"
        strokeWidth="1"
        animate={{ scale: [1, 1.2, 1], opacity: [0.55, 0.15, 0.55] }}
        transition={{ duration: 2.6, repeat: Infinity, delay: delay + 0.3, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Solid bakgrundscirkel */}
      <circle cx={cx} cy={cy} r="22" fill="white" fillOpacity="0.14" />
      <circle
        cx={cx}
        cy={cy}
        r="22"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      {/* Mini-ikon i mitten av noden */}
      <NodeIcon variant={icon} cx={cx} cy={cy} />
    </g>
  );
}

function NodeIcon({
  variant,
  cx,
  cy,
}: {
  variant: 'cv' | 'job' | 'letter';
  cx: number;
  cy: number;
}) {
  const x = cx - 8;
  const y = cy - 9;

  if (variant === 'cv') {
    return (
      <g transform={`translate(${x} ${y})`} opacity="0.9">
        <rect x="0" y="0" width="16" height="18" rx="2" fill="white" fillOpacity="0.85" />
        <line x1="3" y1="5" x2="13" y2="5" stroke="#DC2626" strokeWidth="1.2" />
        <line x1="3" y1="9" x2="11" y2="9" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
        <line x1="3" y1="13" x2="13" y2="13" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
      </g>
    );
  }
  if (variant === 'job') {
    return (
      <g transform={`translate(${x} ${y})`} opacity="0.9">
        <rect x="0" y="3" width="16" height="13" rx="2" fill="white" fillOpacity="0.85" />
        <rect x="5" y="0" width="6" height="4" rx="1" fill="white" fillOpacity="0.85" />
        <line x1="3" y1="9" x2="13" y2="9" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
        <line x1="3" y1="12" x2="10" y2="12" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
      </g>
    );
  }
  // letter
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.9">
      <rect x="0" y="2" width="16" height="14" rx="2" fill="white" fillOpacity="0.85" />
      <path d="M 0 4 L 8 11 L 16 4" stroke="#DC2626" strokeWidth="1.2" fill="none" />
    </g>
  );
}
