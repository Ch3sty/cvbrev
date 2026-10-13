import React from 'react';
import { C } from './tokens';

// Figurerna ritas som renderers.v7.tsx med måtten i geometri.json:
// viewBox 0 till 100 per cell, kontur 3, tunn kontur 2,5, figuren med 10 % luft.

type PilProps = {
  vinkel: number;
  lang?: boolean;
  oppenSpets?: boolean;
  farg?: string;
};

export const Pil: React.FC<PilProps> = ({ vinkel, lang = true, oppenSpets = false, farg = C.figur }) => {
  const spets = lang ? 24 : 32;
  const svans = lang ? 76 : 68;
  const h = 9;
  return (
    <g transform={`rotate(${vinkel}, 50, 50)`}>
      <line x1="50" y1={svans} x2="50" y2={spets + 2} stroke={farg} strokeWidth={3} strokeLinecap="round" />
      {oppenSpets ? (
        <g stroke={farg} strokeWidth={3} strokeLinecap="round" fill="none">
          <line x1="50" y1={spets} x2={50 - h} y2={spets + h + 2} />
          <line x1="50" y1={spets} x2={50 + h} y2={spets + h + 2} />
        </g>
      ) : (
        <path
          d={`M 50 ${spets} L ${50 - h} ${spets + h + 2} L ${50 + h} ${spets + h + 2} Z`}
          fill={farg}
          stroke={farg}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}
    </g>
  );
};

/** Pricken som vandrar runt cirkeln. Position 0 = klockan 12, medurs i steg om 45 grader. */
export const Orbital: React.FC<{ pos: number | null; fylld?: boolean; farg?: string }> = ({
  pos,
  fylld = true,
  farg = C.figur,
}) => {
  const a = pos === null ? 0 : (pos * 45 - 90) * (Math.PI / 180);
  return (
    <g>
      <circle cx="50" cy="50" r={26} fill="none" stroke={C.figurRam} strokeWidth={2.5} strokeDasharray="0 4.54" strokeLinecap="round" />
      <circle cx="50" cy="50" r={5} fill={fylld ? farg : 'none'} stroke={fylld ? 'none' : farg} strokeWidth={3} />
      {pos !== null && <circle cx={50 + 26 * Math.cos(a)} cy={50 + 26 * Math.sin(a)} r={6} fill={farg} />}
    </g>
  );
};

/** Luckan: insjunken ruta med streckad ram och frågetecken (geometri.json lucka). */
export const Lucka: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x="16" y="16" width="68" height="68" rx="8" fill="none" stroke={C.figurRam} strokeWidth={2} strokeDasharray="5 4" />
    <path d="M 38 40 A 12 12 0 1 1 55 51 Q 50 55 50 62" fill="none" stroke={C.figurRam} strokeWidth={5} strokeLinecap="round" />
    <circle cx="50" cy="73" r="3.2" fill={C.figurRam} />
  </g>
);

/** En cell med 10 % luft runt figuren, som FIGUR_LUFT i layered.v7. */
export const Cell: React.FC<{ storlek: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  storlek,
  children,
  style,
}) => (
  <svg width={storlek} height={storlek} viewBox="-12.5 -12.5 125 125" style={{ display: 'block', overflow: 'visible', position: 'relative', ...style }}>
    {children}
  </svg>
);
