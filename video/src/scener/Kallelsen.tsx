import React from 'react';
import { landa, mix, ramp, synlig, UT } from '../anim';
import { C, F, LYFT } from '../tokens';

// Scen 1, 0 till 3 s. Kalenderkortet; dagen fylls koppar och sträcks sedan till tidsraden.

const DAGAR = [
  ['Mån', '26'],
  ['Tis', '27'],
  ['Ons', '28'],
  ['Tor', '29'],
  ['Fre', '30'],
  ['Lör', '31'],
  ['Sön', '1'],
];

// Kortets och dagens läge i panelens koordinater (pt).
const KORT = { x: 16, y: 140, b: 380, h: 196 };
const KOLUMN = (KORT.b - 32) / 7;
const DAG_I = 4;
export const DAG_RUTA = {
  x: KORT.x + 16 + KOLUMN * DAG_I + (KOLUMN - 40) / 2,
  y: KORT.y + 85,
  b: 40,
  h: 40,
};
// Tidsradens fyllning när scen 2 börjar.
export const TIDSRAD_START = { x: 0, y: 56, b: 412 * 0.05, h: 4 };

export const Kallelsen: React.FC<{ t: number }> = ({ t }) => {
  const ut = ramp(t, 2.5, 0.4);
  const rad = ramp(t, 0.5, 0.6);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - ut, transform: `translateY(${-40 * ut}px)` }}>
      <div
        style={{
          position: 'absolute',
          left: KORT.x,
          top: KORT.y,
          width: KORT.b,
          height: KORT.h,
          background: C.papper,
          borderRadius: 16,
          border: `1px solid ${C.kant}`,
          boxShadow: LYFT,
          opacity: synlig(t, 0, 99, 0.5),
        }}
      >
        <div style={{ position: 'absolute', left: 16, top: 18, fontFamily: F.display, fontWeight: 700, fontSize: 18, color: C.ink1 }}>
          Oktober
        </div>
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: 58,
            width: KORT.b - 32,
            display: 'flex',
            opacity: rad,
            transform: `translateX(${(1 - rad) * 24}px)`,
          }}
        >
          {DAGAR.map(([namn, nr], i) => (
            <div key={namn} style={{ width: KOLUMN, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontFamily: F.text, fontSize: 12, lineHeight: '15px', fontWeight: 500, color: C.ink3 }}>{namn}</div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: F.text,
                  fontWeight: i === DAG_I ? 700 : 500,
                  fontSize: 17,
                  color: i === DAG_I && t >= 1.0 ? C.kopparText : C.ink2,
                  fontVariantNumeric: 'tabular-nums',
                  borderRadius: 10,
                  background: i === DAG_I && t < 2.5 ? `rgba(224,122,47,${ramp(t, 1.0, 0.2)})` : 'transparent',
                }}
              >
                {nr}
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 148, display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center', ...landa(t, 1.5) }}>
          <div style={{ background: C.papper2, borderRadius: 8, padding: '5px 12px', fontFamily: F.text, fontWeight: 600, fontSize: 14, color: C.ink1 }}>
            Test
          </div>
          <div style={{ fontFamily: F.text, fontSize: 14, color: C.ink3 }}>Kl. 09.00</div>
        </div>
      </div>
    </div>
  );
};

/** Kopparrutan: fylls på 1,0 s och sträcks till tidsraden 2,5 till 3,0 s. Ligger över scenerna. */
export const Kopparrutan: React.FC<{ t: number }> = ({ t }) => {
  if (t < 2.5 || t >= 3.0) return null;
  const p = ramp(t, 2.5, 0.5, UT);
  const x = mix(DAG_RUTA.x, TIDSRAD_START.x, p);
  const y = mix(DAG_RUTA.y, TIDSRAD_START.y, p);
  const b = mix(DAG_RUTA.b, TIDSRAD_START.b, p);
  const h = mix(DAG_RUTA.h, TIDSRAD_START.h, p);
  const r = mix(10, 0, p);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: b,
        height: h,
        borderRadius: r,
        background: C.koppar,
        zIndex: 5,
      }}
    />
  );
};
