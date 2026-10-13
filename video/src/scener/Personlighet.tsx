import React from 'react';
import { landa, mix, ramp } from '../anim';
import { C, F, LYFT } from '../tokens';
import { Eyebrow } from '../ui';

// Scen 5, 24 till 27 s: ett påstående på skalan, sedan profilen. Inga tal, ingen
// stapel som ser bättre ut, ingen koppar i profilen.

const B = 412;
const KANT = 16;
const INRE = B - 2 * KANT;

const KORT_Y0 = 138;
const KORT_Y1 = 60;
const SKALA_Y = 128; // i kortet
const skalaX = (i: number) => 34 + i * ((INRE - 68) / 4);

const DIMENSIONER = [
  { namn: 'Öppenhet', andel: 0.62, stopp: 26.5 },
  { namn: 'Samvetsgrannhet', andel: 0.78, stopp: 26.75 },
  { namn: 'Utåtriktning', andel: 0.45, stopp: 26.375 },
  { namn: 'Vänlighet', andel: 0.7, stopp: 26.625 },
  { namn: 'Känslomässig särbarhet', andel: 0.38, stopp: 26.25 },
];
const RAD_Y0 = 54; // i kortet
const RAD_H = 50;
const STAPEL_X = 16;
const STAPEL_B = INRE - 32;

export const Personlighet: React.FC<{ t: number }> = ({ t }) => {
  const fylld = ramp(t, 25.0, 0.16);
  const morf = ramp(t, 25.25, 0.75);
  const fraga = 1 - ramp(t, 25.25, 0.35);
  const profil = ramp(t, 25.55, 0.45);
  const kortH = mix(196, 318, morf);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.golv }}>
      <div
        style={{
          position: 'absolute',
          left: KANT,
          top: mix(KORT_Y0, KORT_Y1, morf),
          width: INRE,
          height: kortH,
          boxSizing: 'border-box',
          background: C.papper,
          borderRadius: 18,
          border: `1px solid ${C.kant}`,
          boxShadow: LYFT,
          ...landa(t, 24.0, 16, 0.4),
        }}
      >
        {/* Påståendet */}
        <div style={{ position: 'absolute', left: 18, top: 18, right: 18, opacity: fraga }}>
          <Eyebrow>Personlighetstest</Eyebrow>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 21, color: C.ink1, marginTop: 8 }}>Jag är noggrann med detaljer.</div>
        </div>
        <div style={{ position: 'absolute', left: 18, top: 18, opacity: profil }}>
          <Eyebrow>Din profil</Eyebrow>
        </div>
        {/* Skalans linje och ändetiketter */}
        <div style={{ position: 'absolute', left: skalaX(0), width: skalaX(4) - skalaX(0), top: SKALA_Y - 1, height: 2, background: C.kantStark, opacity: fraga }} />
        <div style={{ position: 'absolute', left: 14, top: SKALA_Y + 22, fontFamily: F.text, fontSize: 12, color: C.ink3, opacity: fraga }}>Stämmer inte alls</div>
        <div style={{ position: 'absolute', right: 14, top: SKALA_Y + 22, fontFamily: F.text, fontSize: 12, color: C.ink3, opacity: fraga }}>Stämmer perfekt</div>
        {/* Profilens rader */}
        {DIMENSIONER.map((d, i) => {
          const y = RAD_Y0 + i * RAD_H;
          const vaxt = d.andel * ramp(t, 26.0, d.stopp - 26.0);
          return (
            <div key={d.namn} style={{ position: 'absolute', left: STAPEL_X, top: y, width: STAPEL_B, opacity: profil }}>
              <div style={{ fontFamily: F.text, fontSize: 13.5, fontWeight: 500, color: C.ink2 }}>{d.namn}</div>
              <div style={{ position: 'relative', height: 10, borderRadius: 5, background: C.papper2, marginTop: 7 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: 10, borderRadius: 5, width: `${vaxt * 100}%`, background: C.ink2 }} />
              </div>
            </div>
          );
        })}
        {/* De fem punkterna glider till staplarnas startpunkter */}
        {Array.from({ length: 5 }).map((_, i) => {
          const fran = { x: skalaX(i), y: SKALA_Y };
          const till = { x: STAPEL_X + 5, y: RAD_Y0 + i * RAD_H + 29 };
          const x = mix(fran.x, till.x, morf);
          const y = mix(fran.y, till.y, morf);
          const vald = i === 3;
          const r = mix(vald ? mix(9, 12, fylld) : 9, 5, morf);
          const kopparOpacitet = vald ? fylld * (1 - morf) : 0;
          return (
            <div key={i} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: 1 - ramp(t, 25.85, 0.15) }}>
              <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`} style={{ overflow: 'visible' }}>
                <circle cx={r} cy={r} r={r - 1.25} fill={C.papper} stroke={mix(1, 0, morf) > 0.5 ? C.ink1 : C.ink2} strokeWidth={2.5} />
                <circle cx={r} cy={r} r={r} fill={C.koppar} opacity={kopparOpacitet} />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};
