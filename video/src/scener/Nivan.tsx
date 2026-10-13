import React from 'react';
import { landa, ramp, synlig, UT } from '../anim';
import { Cell, Orbital } from '../figurer';
import { C, F, LYFT, VAGG_TONING } from '../tokens';
import { Alternativ, AltLage, Eyebrow, Knapp, Kryss } from '../ui';

// Scen 4a, 18 till 22 s: hemvyn med nivån, kurvan fram till provdagen och dagens pass.
// Scen 4b, 22 till 24 s: övningsprovet mot klockan.

const B = 412;
const KANT = 16;
const INRE = B - 2 * KANT;

// Kurvan: 16 okt till 30 okt (prov). Mätningen 16 okt 5,0, sedan 5,2, 5,4, 5,6 i dag 19 okt.
const DAGAR = 15;
const KURVA = { b: INRE, h: 118, vanster: 22, topp: 10, botten: 12 };
const kx = (dag: number) => KURVA.vanster + (dag / (DAGAR - 1)) * (KURVA.b - KURVA.vanster - 8);
const ky = (niva: number) => KURVA.topp + ((7.3 - niva) / (7.3 - 4.7)) * (KURVA.h - KURVA.topp - KURVA.botten);
const PUNKTER: [number, number][] = [
  [0, 5.0],
  [1, 5.2],
  [2, 5.4],
  [3, 5.6],
];

const Kurva: React.FC<{ t: number }> = ({ t }) => {
  const rita = ramp(t, 18.2, 0.7, UT);
  const yta = ramp(t, 18.5, 0.5);
  const ny = ramp(t, 18.9, 0.24);
  const mal = ramp(t, 19.0, 0.3);
  const d = PUNKTER.map(([dag, n], i) => `${i === 0 ? 'M' : 'L'} ${kx(dag)} ${ky(n)}`).join(' ');
  const langd = 260;
  return (
    <svg width={KURVA.b} height={KURVA.h} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="kurvyta" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={C.koppar} stopOpacity={0.38} />
          <stop offset="1" stopColor={C.koppar} stopOpacity={0} />
        </linearGradient>
        <clipPath id="kurvklipp">
          <rect x={0} y={0} width={kx(3) + 12} height={KURVA.h} />
        </clipPath>
      </defs>
      {[5, 6, 7].map((n) => (
        <g key={n}>
          <line x1={KURVA.vanster} x2={KURVA.b} y1={ky(n)} y2={ky(n)} stroke={C.vaggKant} strokeWidth={1} />
          <text x={0} y={ky(n) + 4} fill={C.vaggMjuk} fontFamily="Inter" fontSize={11.5}>{n}</text>
        </g>
      ))}
      {/* Siktebandet och provlinjen */}
      <g opacity={mal}>
        <line x1={KURVA.vanster} x2={kx(DAGAR - 1)} y1={ky(6.5)} y2={ky(6.5)} stroke={C.ljus} strokeWidth={1.6} strokeDasharray="5 4" />
        <text x={kx(DAGAR - 1) - 46} y={ky(6.5) - 8} fill={C.ljus} fontFamily="Inter" fontWeight={500} fontSize={12} textAnchor="end">Mål 6,5</text>
        <line x1={kx(DAGAR - 1)} x2={kx(DAGAR - 1)} y1={2} y2={KURVA.h} stroke={C.vaggMjuk} strokeWidth={1.5} />
        <text x={kx(DAGAR - 1) - 6} y={ky(6.5) - 8} fill={C.vaggInk} fontFamily="Inter" fontWeight={500} fontSize={12} textAnchor="end">Prov</text>
      </g>
      <path d={`${d} L ${kx(3)} ${KURVA.h} L ${kx(0)} ${KURVA.h} Z`} fill="url(#kurvyta)" opacity={yta} clipPath="url(#kurvklipp)" />
      <path d={d} fill="none" stroke={C.koppar} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={langd} strokeDashoffset={langd * (1 - rita)} />
      {/* Mätningen som start */}
      <circle cx={kx(0)} cy={ky(5.0)} r={6} fill={C.koppar} stroke={C.kopparLjus} strokeWidth={2} opacity={rita > 0 ? 1 : 0} />
      <text x={kx(0) + 2} y={ky(5.0) + 22} fill={C.vaggMjuk} fontFamily="Inter" fontSize={11.5} opacity={rita > 0 ? 1 : 0}>start</text>
      {[1, 2].map((i) => (
        <circle key={i} cx={kx(PUNKTER[i][0])} cy={ky(PUNKTER[i][1])} r={3.2} fill={C.koppar} opacity={rita > i / 3 ? 1 : 0} />
      ))}
      <circle cx={kx(3)} cy={ky(5.6)} r={14} fill={C.koppar} opacity={0.18 * ny} />
      <circle cx={kx(3)} cy={ky(5.6)} r={5.5} fill={C.koppar} stroke={C.vagg} strokeWidth={2} opacity={ny} />
    </svg>
  );
};

/** Planraden: gjorda dagar fyllda, i dag streckad, kommande ihåliga, nivåkoller tjockare, övningsprovet som kvadrat. */
const Planrad: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg width={KURVA.b} height={14} style={{ display: 'block', opacity }}>
    {Array.from({ length: DAGAR - 1 }).map((_, dag) => {
      const x = kx(dag);
      if (dag <= 3) return <circle key={dag} cx={x} cy={7} r={dag === 0 ? 5 : 3.6} fill={C.koppar} />;
      if (dag === 4) return <circle key={dag} cx={x} cy={7} r={4.5} fill="none" stroke={C.koppar} strokeWidth={1.6} strokeDasharray="2 2" />;
      if (dag === 12) return <rect key={dag} x={x - 4} y={3} width={8} height={8} rx={1.5} fill="none" stroke={C.vaggMjuk} strokeWidth={1.6} />;
      const koll = dag === 7 || dag === 11;
      return <circle key={dag} cx={x} cy={7} r={koll ? 5 : 3.6} fill="none" stroke={koll ? C.vaggMjuk : C.vaggSvag} strokeWidth={koll ? 2 : 1.5} />;
    })}
  </svg>
);

const FORSKJUT = 142; // rullningen 20,0 s: rubrik och lägesrad går ur bild ovanför

export const Hemvyn: React.FC<{ t: number }> = ({ t }) => {
  const rull = ramp(t, 20.0, 0.6);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: B, transform: `translateY(${-FORSKJUT * rull}px)` }}>
        <div style={{ position: 'relative', height: 440, background: VAGG_TONING, borderRadius: '0 0 28px 28px', clipPath: `inset(0 0 ${(1 - ramp(t, 18.0, 0.3)) * 100}% 0 round 0 0 28px 28px)` }}>
          {/* Lägesraden */}
          <div style={{ position: 'absolute', left: KANT, top: 14, right: KANT, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', background: C.glas, border: `1px solid ${C.vaggKant}`, borderRadius: 22, padding: 3 }}>
              <div style={{ background: C.papper, color: C.ink1, borderRadius: 19, padding: '8px 18px', fontFamily: F.text, fontWeight: 600, fontSize: 14 }}>Min plan</div>
              <div style={{ color: C.vaggInk, borderRadius: 19, padding: '8px 18px', fontFamily: F.text, fontWeight: 600, fontSize: 14 }}>Alla tester</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 19, border: `1px solid ${C.vaggKant}`, background: C.glas, color: C.vaggInk, fontFamily: F.text, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              S
            </div>
          </div>
          <div style={{ position: 'absolute', left: KANT, top: 70, ...landa(t, 18.0, 8, 0.26) }}>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 31, letterSpacing: '-0.025em', color: C.vaggInk, lineHeight: '34px' }}>14 dagar till provet</div>
            <div style={{ fontFamily: F.text, fontSize: 14, color: C.vaggMjuk, marginTop: 6 }}>Fyra dagar i rad. Dagens pass är kvar.</div>
          </div>
          {/* Dagsraden */}
          <div
            style={{
              position: 'absolute',
              left: KANT,
              top: 150,
              width: INRE,
              boxSizing: 'border-box',
              height: 58,
              borderRadius: 16,
              background: C.glas,
              border: `1px solid ${C.vaggKant}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '0 14px',
              ...landa(t, 18.25, 8, 0.26),
            }}
          >
            <svg width={34} height={34} viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="14" fill="none" stroke={C.koppar} strokeWidth={2.4} strokeDasharray="3 4" />
              <circle cx="17" cy="17" r="4" fill="none" stroke={C.koppar} strokeWidth={2} />
            </svg>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 23, color: C.vaggInk }}>5,6</div>
            <div style={{ fontFamily: F.text, fontSize: 13, color: C.vaggMjuk }}>din nivå, började på 5,0</div>
          </div>
          <div style={{ position: 'absolute', left: KANT, top: 226, width: INRE, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: synlig(t, 18.0, 99) }}>
            <Eyebrow farg={C.vaggMjuk}>Din nivå, dag för dag</Eyebrow>
            <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 13.5, color: C.vaggInk, borderBottom: `1.5px solid ${C.vaggInk}` }}>Hela kurvan</div>
          </div>
          <div style={{ position: 'absolute', left: KANT, top: 250 }}>
            <Kurva t={t} />
          </div>
          <div style={{ position: 'absolute', left: KANT, top: 376 }}>
            <Planrad opacity={ramp(t, 19.0, 0.3)} />
            <div style={{ position: 'relative', height: 16, marginTop: 6, fontFamily: F.text, fontSize: 11.5, color: C.vaggMjuk, opacity: ramp(t, 19.0, 0.3) }}>
              <span style={{ position: 'absolute', left: kx(0) - 10 }}>16 okt</span>
              <span style={{ position: 'absolute', left: kx(3) - 14, color: C.kopparLjus, fontWeight: 600 }}>i dag</span>
              <span style={{ position: 'absolute', left: kx(DAGAR - 1) - 30 }}>30 okt</span>
            </div>
          </div>
        </div>
        {/* Dagens pass, det lyfta kortet över väggens kant */}
        <div
          style={{
            position: 'absolute',
            left: KANT,
            top: 418,
            width: INRE,
            boxSizing: 'border-box',
            background: C.papper,
            borderRadius: 18,
            border: `1px solid ${C.kant}`,
            boxShadow: LYFT,
            padding: '16px 16px 16px',
            ...landa(t, 20.0, 40, 0.6),
          }}
        >
          <Eyebrow farg={C.kopparInk}>Dagens pass</Eyebrow>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 21, color: C.ink1, marginTop: 5 }}>Figuren vrider sig</div>
          <div style={{ fontFamily: F.text, fontSize: 13.5, lineHeight: '19px', color: C.ink2, marginTop: 5 }}>
            Nio uppgifter på din nivå, cirka tio minuter. Vi förklarar varje svar.
          </div>
          <Knapp style={{ marginTop: 14 }}>Starta dagens pass</Knapp>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Övningsprovet (Klocka, Segmentstapel, v7g-q6-orbital-walk)

const Klockring: React.FC<{ minuter: number; andel: number; koppar?: boolean }> = ({ minuter, andel, koppar }) => {
  const r = 15;
  const omkrets = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 38, height: 38 }}>
      <svg width={38} height={38} viewBox="0 0 38 38">
        <circle cx="19" cy="19" r={r} fill="none" stroke={C.kant} strokeWidth={3} />
        <circle cx="19" cy="19" r={r} fill="none" stroke={koppar ? C.koppar : C.ink2} strokeWidth={3} strokeDasharray={omkrets} strokeDashoffset={omkrets * (1 - andel)} transform="rotate(-90 19 19)" strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 14, color: C.ink1 }}>
        {minuter}
      </div>
    </div>
  );
};

// Pricken vandrar 90 grader medurs per ruta: 12, 3, 6 / 9, 12, 3 / 6, 9, ?
const PROV_POS = [0, 2, 4, 6, 0, 2, 4, 6];
const PROV_ALT: { bokstav: string; pos: number | null; fylld?: boolean }[] = [
  { bokstav: 'A', pos: 2 },
  { bokstav: 'B', pos: 4 },
  { bokstav: 'C', pos: 0 },
  { bokstav: 'D', pos: 0, fylld: false },
  { bokstav: 'E', pos: 6 },
  { bokstav: 'F', pos: null },
];

export const Provet: React.FC<{ t: number; klocka?: { minuter: number; andel: number; koppar?: boolean } }> = ({ t, klocka }) => {
  const byte = ramp(t, 23.0, 0.2);
  const andel = klocka ? klocka.andel : 5 / 25 - (1 / 25) * byte;
  const cellH = 56;
  const cellB = (INRE - 2) / 3;
  const altB = (INRE - 16) / 3;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.golv }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', background: C.papper, borderBottom: `1px solid ${C.kant}` }}>
        <Kryss />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 15, color: C.ink1 }}>Övningsprov</div>
          <div style={{ fontFamily: F.text, fontSize: 12.5, color: C.ink3 }}>Vårt format</div>
        </div>
        <Klockring minuter={klocka ? klocka.minuter : byte >= 0.5 ? 4 : 5} andel={andel} koppar={klocka?.koppar} />
      </div>
      <div style={{ padding: '10px 16px 0' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < 17 ? C.tonInk : C.ink1, opacity: i < 17 ? 0.55 : 1 }} />
          ))}
        </div>
        <div style={{ fontFamily: F.text, fontSize: 12, color: C.ink3, marginTop: 6 }}>uppgift 18</div>
      </div>
      <div style={{ position: 'absolute', left: KANT, top: 104, width: INRE, height: cellH * 3 + 12, background: C.papper, borderRadius: 16, border: `1px solid ${C.kant}`, boxShadow: LYFT, boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', left: 0, top: 6, width: INRE - 2, height: cellH * 3 }}>
          {[1, 2].map((k) => (
            <div key={`v${k}`} style={{ position: 'absolute', left: cellB * k, top: 0, width: 1, height: cellH * 3, background: C.kant }} />
          ))}
          {[1, 2].map((k) => (
            <div key={`h${k}`} style={{ position: 'absolute', top: cellH * k, left: 0, height: 1, width: INRE - 2, background: C.kant }} />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: (i % 3) * cellB, top: Math.floor(i / 3) * cellH, width: cellB, height: cellH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i === 8 && <div style={{ position: 'absolute', inset: 4, borderRadius: 8, background: C.papper2 }} />}
              <Cell storlek={cellH - 4}>
                {i < 8 ? <Orbital pos={PROV_POS[i]} /> : (
                  <g>
                    <rect x="16" y="16" width="68" height="68" rx="8" fill="none" stroke={C.figurRam} strokeWidth={2} strokeDasharray="5 4" />
                    <path d="M 38 40 A 12 12 0 1 1 55 51 Q 50 55 50 62" fill="none" stroke={C.figurRam} strokeWidth={5} strokeLinecap="round" />
                    <circle cx="50" cy="73" r="3.2" fill={C.figurRam} />
                  </g>
                )}
              </Cell>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: KANT, top: 296, width: INRE, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {PROV_ALT.map((a) => {
          const lage: AltLage = a.bokstav === 'C' ? 'valt' : 'neutral';
          return (
            <Alternativ key={a.bokstav} bokstav={a.bokstav} lage={lage} bredd={altB} hojd={48}>
              <Cell storlek={44}>
                <Orbital pos={a.pos} fylld={a.fylld !== false} />
              </Cell>
            </Alternativ>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 410, height: 62, background: C.papper, borderTop: `1px solid ${C.kant}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 14.5, color: C.ink1, borderBottom: `1.5px solid ${C.ink1}` }}>Föregående</div>
        <Knapp style={{ width: 170, height: 44 }}>Lämna in</Knapp>
      </div>
    </div>
  );
};
