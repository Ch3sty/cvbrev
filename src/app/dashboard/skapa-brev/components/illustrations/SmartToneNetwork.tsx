'use client';

import { motion } from 'framer-motion';

/**
 * Subtilt nätverk: tre noder (CV, Annons, Brev) kopplade med kurvor.
 * Ligger som dekorativ bakgrund i Smart-anpassad-bannern och visualiserar
 * vad funktionen gör — analyserar tre datakällor och knyter ihop dem.
 *
 * Designprinciper:
 * - Ligger i kortets över- och nederkant så texten i mitten är fri
 * - Noderna är små (12px) — antydan, inte fokus
 * - Kurvorna är tunna med mjuk dash-animation
 * - Allt med låg opacity för att inte konkurrera med innehållet
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
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Topp-kurva: tre noder högst upp i kortet */}
      <motion.path
        d="M 60 26 Q 200 8, 300 26 T 540 26"
        stroke="url(#smart-line)"
        strokeWidth="1"
        strokeDasharray="3 6"
        fill="none"
        opacity="0.5"
        animate={{ strokeDashoffset: [0, -18] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <NetworkNode cx={60} cy={26} delay={0} />
      <NetworkNode cx={300} cy={26} delay={0.5} />
      <NetworkNode cx={540} cy={26} delay={1} />

      {/* Botten-kurva: spegelbild för balans */}
      <motion.path
        d="M 80 215 Q 220 232, 300 215 T 520 215"
        stroke="url(#smart-line)"
        strokeWidth="1"
        strokeDasharray="3 6"
        fill="none"
        opacity="0.4"
        animate={{ strokeDashoffset: [0, 18] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
      />
      <NetworkNode cx={80} cy={215} delay={0.3} small />
      <NetworkNode cx={300} cy={215} delay={0.8} small />
      <NetworkNode cx={520} cy={215} delay={1.3} small />

      {/* Sidostreck som binder topp + botten */}
      <motion.line
        x1="40"
        y1="26"
        x2="40"
        y2="215"
        stroke="white"
        strokeWidth="0.75"
        strokeDasharray="2 5"
        opacity="0.18"
        animate={{ strokeDashoffset: [0, 14] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      <motion.line
        x1="560"
        y1="26"
        x2="560"
        y2="215"
        stroke="white"
        strokeWidth="0.75"
        strokeDasharray="2 5"
        opacity="0.18"
        animate={{ strokeDashoffset: [0, -14] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Spridda mikro-prickar för djup */}
      <circle cx="160" cy="55" r="1" fill="white" opacity="0.3" />
      <circle cx="240" cy="190" r="1" fill="white" opacity="0.25" />
      <circle cx="380" cy="60" r="1.25" fill="white" opacity="0.3" />
      <circle cx="450" cy="185" r="1" fill="white" opacity="0.22" />
      <circle cx="120" cy="180" r="0.75" fill="white" opacity="0.2" />
      <circle cx="500" cy="50" r="0.75" fill="white" opacity="0.2" />
    </svg>
  );
}

function NetworkNode({
  cx,
  cy,
  delay,
  small,
}: {
  cx: number;
  cy: number;
  delay: number;
  small?: boolean;
}) {
  const r = small ? 2.5 : 3.5;
  const ringR = small ? 7 : 9;
  return (
    <g>
      {/* Yttre pulserande ring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={ringR}
        stroke="white"
        strokeWidth="0.75"
        fill="none"
        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, delay, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Solid prick */}
      <circle cx={cx} cy={cy} r={r} fill="white" fillOpacity="0.85" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="0.5" />
    </g>
  );
}
