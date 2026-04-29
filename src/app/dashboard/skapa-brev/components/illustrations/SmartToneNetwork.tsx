'use client';

import { motion } from 'framer-motion';

/**
 * Subtilt nätverk: tre noder (CV, Annons, Brev) kopplade med kurvor.
 * Ligger i bakgrunden av Smart-anpassad-bannern och visualiserar visuellt
 * vad funktionen gör — analyserar tre datakällor och knyter ihop dem.
 *
 * Varje nod pulserar i tur och ordning för att antyda flödet.
 * Kurvorna har en mjuk dash-animation som "matar" linjen mellan noderna.
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
        <linearGradient id="smart-line" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#DC2626" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#BE185D" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="smart-node-glow">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Kurvor som binder ihop noderna */}
      <motion.path
        d="M 90 120 Q 220 50, 300 120 T 510 120"
        stroke="url(#smart-line)"
        strokeWidth="1.5"
        strokeDasharray="4 8"
        fill="none"
        opacity="0.55"
        animate={{ strokeDashoffset: [0, -24] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
      />
      <motion.path
        d="M 90 120 Q 220 190, 300 120 T 510 120"
        stroke="url(#smart-line)"
        strokeWidth="1"
        strokeDasharray="2 6"
        fill="none"
        opacity="0.35"
        animate={{ strokeDashoffset: [0, 16] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Nod 1: CV (vänster) */}
      <NetworkNode cx={90} cy={120} delay={0} icon="cv" />
      {/* Nod 2: Annons (mitten) */}
      <NetworkNode cx={300} cy={120} delay={0.6} icon="job" />
      {/* Nod 3: Brev (höger) */}
      <NetworkNode cx={510} cy={120} delay={1.2} icon="letter" />

      {/* Subtila prickar runtomkring */}
      <circle cx="170" cy="60" r="2" fill="white" opacity="0.25" />
      <circle cx="380" cy="50" r="1.5" fill="white" opacity="0.2" />
      <circle cx="220" cy="195" r="1.5" fill="white" opacity="0.2" />
      <circle cx="450" cy="190" r="2" fill="white" opacity="0.25" />
      <circle cx="40" cy="180" r="1" fill="white" opacity="0.2" />
      <circle cx="565" cy="60" r="1" fill="white" opacity="0.2" />
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
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, delay, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Solid bakgrundscirkel */}
      <circle cx={cx} cy={cy} r="22" fill="white" fillOpacity="0.12" />
      <circle
        cx={cx}
        cy={cy}
        r="22"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.55"
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
      <g transform={`translate(${x} ${y})`} opacity="0.85">
        <rect x="0" y="0" width="16" height="18" rx="2" fill="white" fillOpacity="0.85" />
        <line x1="3" y1="5" x2="13" y2="5" stroke="#DC2626" strokeWidth="1.2" />
        <line x1="3" y1="9" x2="11" y2="9" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
        <line x1="3" y1="13" x2="13" y2="13" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
      </g>
    );
  }
  if (variant === 'job') {
    return (
      <g transform={`translate(${x} ${y})`} opacity="0.85">
        <rect x="0" y="3" width="16" height="13" rx="2" fill="white" fillOpacity="0.85" />
        <rect x="5" y="0" width="6" height="4" rx="1" fill="white" fillOpacity="0.85" />
        <line x1="3" y1="9" x2="13" y2="9" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
        <line x1="3" y1="12" x2="10" y2="12" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
      </g>
    );
  }
  // letter
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.85">
      <rect x="0" y="2" width="16" height="14" rx="2" fill="white" fillOpacity="0.85" />
      <path d="M 0 4 L 8 11 L 16 4" stroke="#DC2626" strokeWidth="1.2" fill="none" />
    </g>
  );
}
