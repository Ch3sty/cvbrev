import React from 'react';
import { mix } from '../anim';
import { Cell, Orbital, Pil } from '../figurer';
import { C, F, LYFT } from '../tokens';

// Flygningen före dropen: gränssnittsbitar ur testerna svävar i ett rum och rusar
// mot kameran. Allt är ritat ur produkten; inga dekorer som inte finns i appen.

type Bit = { x: number; y: number; z: number; typ: number; vrid: number };

// Bestämd slump så att varje rendering blir lika.
let fro = 42;
const slump = () => {
  fro = (fro * 1664525 + 1013904223) >>> 0;
  return fro / 4294967296;
};

const BITAR: Bit[] = Array.from({ length: 64 }).map((_, i) => {
  // Lämna en kanal i mitten fri så att kameran har något att flyga genom.
  const vinkel = slump() * Math.PI * 2;
  const radie = 300 + slump() * 700;
  return {
    x: Math.cos(vinkel) * radie * 1.4,
    y: Math.sin(vinkel) * radie * 0.8,
    z: -300 - (i / 64) * 4200 - slump() * 200,
    typ: i % 8,
    vrid: (slump() - 0.5) * 30,
  };
});

const Kort: React.FC<{ children: React.ReactNode; b: number; h: number }> = ({ children, b, h }) => (
  <div
    style={{
      width: b,
      height: h,
      background: C.papper,
      borderRadius: 18,
      boxShadow: LYFT,
      border: `1px solid ${C.kant}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

const Fragment: React.FC<{ typ: number }> = ({ typ }) => {
  switch (typ) {
    case 0:
      return (
        <Kort b={240} h={240}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 70px)', gap: 0 }}>
            {[0, 45, 90, 135, 180, 225, 270, 315, null].map((v, i) => (
              <div key={i} style={{ width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: i % 3 < 2 ? `1px solid ${C.kant}` : 'none', borderBottom: i < 6 ? `1px solid ${C.kant}` : 'none' }}>
                {v !== null && (
                  <Cell storlek={56}>
                    <Pil vinkel={v} />
                  </Cell>
                )}
              </div>
            ))}
          </div>
        </Kort>
      );
    case 1:
      return (
        <Kort b={130} h={130}>
          <Cell storlek={100}>
            <Pil vinkel={0} farg={C.kopparInk} />
          </Cell>
        </Kort>
      );
    case 2:
      return (
        <Kort b={300} h={120}>
          <div style={{ fontFamily: F.text, fontSize: 22, color: C.ink1, fontVariantNumeric: 'tabular-nums', lineHeight: '34px' }}>
            <div>Sport&nbsp;&nbsp;4,3&nbsp;&nbsp;4,5&nbsp;&nbsp;<b>26,0</b></div>
            <div>Totalt&nbsp;31,8&nbsp;<b>170,0</b></div>
          </div>
        </Kort>
      );
    case 3:
      return (
        <div style={{ height: 76, padding: '0 36px', borderRadius: 999, background: C.koppar, color: C.kopparText, fontFamily: F.text, fontWeight: 700, fontSize: 28, display: 'flex', alignItems: 'center' }}>
          Falskt
        </div>
      );
    case 4:
      return (
        <Kort b={150} h={150}>
          <svg width={110} height={110} viewBox="0 0 38 38">
            <circle cx="19" cy="19" r="15" fill="none" stroke={C.kant} strokeWidth={3} />
            <circle cx="19" cy="19" r="15" fill="none" stroke={C.koppar} strokeWidth={3} strokeDasharray={94} strokeDashoffset={30} transform="rotate(-90 19 19)" strokeLinecap="round" />
            <text x="19" y="23.5" textAnchor="middle" fontFamily="Schibsted Grotesk" fontWeight={700} fontSize={12} fill={C.ink1}>
              4
            </text>
          </svg>
        </Kort>
      );
    case 5:
      return (
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 120, color: C.kopparLjus, letterSpacing: '-0.04em' }}>5,6</div>
      );
    case 6:
      return (
        <Kort b={130} h={130}>
          <Cell storlek={100}>
            <Orbital pos={2} />
          </Cell>
        </Kort>
      );
    default:
      return (
        <Kort b={320} h={90}>
          <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: 13, border: `3px solid ${C.ink1}`, background: i === 3 ? C.koppar : C.papper, borderColor: i === 3 ? C.koppar : C.ink1 }} />
            ))}
          </div>
        </Kort>
      );
  }
};

/** `resa` 0 till 1: hur långt kameran har flugit genom rummet. */
export const Rymd: React.FC<{ resa: number; b: number; h: number; opacity: number }> = ({ resa, b, h, opacity }) => {
  const kameraZ = resa * 4700;
  return (
    <div style={{ position: 'absolute', inset: 0, perspective: 1000, perspectiveOrigin: '50% 50%', opacity, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: b / 2, top: h / 2, transformStyle: 'preserve-3d' }}>
        {BITAR.map((bit, i) => {
          const z = bit.z + kameraZ;
          if (z > 900 || z < -4700) return null;
          // Skärpedjup: skarpt kring z -900, oskarpt nära kameran och långt bort.
          const oskarpa = Math.min(10, Math.abs(z + 700) / 320);
          const synlig = Math.min(1, (z + 4700) / 900) * (1 - Math.max(0, (z - 500) / 400));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                transform: `translate3d(${bit.x}px, ${bit.y}px, ${z}px) translate(-50%, -50%) rotate(${bit.vrid}deg) scale(1.5)`,
                filter: `blur(${oskarpa}px)`,
                opacity: synlig,
              }}
            >
              <Fragment typ={bit.typ} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const resaKurva = (p: number) => mix(0, 1, p * p * (1.6 - 0.6 * p));
