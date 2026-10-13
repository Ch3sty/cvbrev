import React from 'react';
import { IN_UT, landa, mix, ramp, synlig, UT } from '../anim';
import { Cell, Lucka, Pil } from '../figurer';
import { C, F, LYFT } from '../tokens';
import { Alternativ, AltLage, Eyebrow, Tidsrad, Topprad } from '../ui';

// Scen 2, 3 till 13 s: tre uppgifter som i dagens pass (PassShell, PassFraga).

const B = 412;
const KANT = 16;
const INRE = B - 2 * KANT;

/** Nästa fråga: innehållet glider upp och ut, det nya glider upp och in. */
export const vaxling = (t: number, inTid: number, utTid: number) => {
  // Det gamla går ut på 220 ms, det nya kommer 120 ms senare så att de aldrig ligger på varandra.
  const pIn = ramp(t, inTid + 0.12, 0.4);
  const pUt = ramp(t, utTid, 0.22);
  return {
    opacity: Math.min(ramp(t, inTid + 0.12, 0.25), 1 - pUt),
    transform: `translateY(${(1 - pIn) * 24 - pUt * 40}px)`,
  };
};

// ---------------------------------------------------------------------------
// Topprad och tidsrad, gemensamma för de tre uppgifterna

const FRAGOR = [
  { fran: 3.0, till: 7.0, titel: 'Figuren vrider sig', hoger: '4 / 9', tid0: 0.05, tid1: 0.56, stopp: 6.0, sek0: 22, provet: '1:08', provetSek: 68 },
  { fran: 7.0, till: 10.0, titel: 'Sommaranställningar', hoger: '5 / 9', tid0: 0.0, tid1: 0.4, stopp: 8.75, sek0: 17, provet: '1:00', provetSek: 60 },
  { fran: 10.0, till: 13.0, titel: 'Försäljning per kategori', hoger: '6 / 9', tid0: 0.0, tid1: 0.57, stopp: 12.25, sek0: 41, provet: '1:15', provetSek: 75 },
];

export const PassRam: React.FC<{ t: number }> = ({ t }) => {
  const aktiv = FRAGOR.find((f) => t >= f.fran && t < f.till) ?? FRAGOR[0];
  // Tidsraden fylls från tid0 mot tid1 och stannar när svaret syns.
  const p = ramp(t, aktiv.fran, aktiv.stopp - aktiv.fran, (x) => x);
  const andel = mix(aktiv.tid0, aktiv.tid1, p);
  // Talet räknar uppåt i hela sekunder, på slagen.
  const sek = aktiv.sek0 + Math.floor(Math.max(0, Math.min(t, aktiv.stopp) - aktiv.fran));
  const tid = `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, '0')}`;
  const ramIn = ramp(t, 2.6, 0.4, (x) => x);
  const ramUt = 1 - ramp(t, 13.0, 0.24, (x) => x);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: B, opacity: Math.min(ramIn, ramUt), zIndex: 3 }}>
      <div style={{ position: 'relative' }}>
        {FRAGOR.map((f) => (
          <div
            key={f.titel}
            style={{
              position: f === FRAGOR[0] ? 'relative' : 'absolute',
              inset: f === FRAGOR[0] ? undefined : 0,
              opacity: synlig(t, f.fran === 3.0 ? 2.6 : f.fran + 0.14, f.till === 13.0 ? 99 : f.till, 0.14),
            }}
          >
            <Topprad titel={f.titel} under="Dagens pass, nivå 5" hoger={f.hoger} />
          </div>
        ))}
      </div>
      <div style={{ background: C.golv }}>
        <Tidsrad andel={andel} tid={tid} provetsTid={aktiv.provet} opacity={t >= 3.0 ? 1 : 0} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2a Logiktest: pilen vrider sig 45 grader medurs för varje ruta (v7g-q3-vector-rotation)

const CELL_B = INRE / 3; // 126,7
const CELL_H = 76;
const MATRIS_Y = 92;
const ALT_Y = MATRIS_Y + CELL_H * 3 + 16 + 10;
const ALT_B = (INRE - 16) / 3;
const ALT_H = 56;

const cellPos = (i: number) => ({ x: (i % 3) * CELL_B, y: Math.floor(i / 3) * CELL_H });

type AltPil = { bokstav: string; vinkel: number; lang?: boolean; oppen?: boolean; ratt?: boolean };
export const ALT_2A: AltPil[] = [
  { bokstav: 'A', vinkel: 45 },
  { bokstav: 'B', vinkel: 0, lang: false },
  { bokstav: 'C', vinkel: 180 },
  { bokstav: 'D', vinkel: 0, oppen: true },
  { bokstav: 'E', vinkel: 0, ratt: true },
  { bokstav: 'F', vinkel: 315 },
];

/** Rutnätet 3 × 3 med hårlinjer; `rita` 0 till 1 drar upp linjerna. */
const Rutnat: React.FC<{ b: number; h: number; rita?: number }> = ({ b, h, rita = 1 }) => (
  <>
    {[1, 2].map((k) => (
      <div key={`v${k}`} style={{ position: 'absolute', left: (b / 3) * k, top: 0, width: 1, height: h * rita, background: C.kant }} />
    ))}
    {[1, 2].map((k) => (
      <div key={`h${k}`} style={{ position: 'absolute', top: (h / 3) * k, left: 0, height: 1, width: b * rita, background: C.kant }} />
    ))}
  </>
);

export const Logiktest: React.FC<{ t: number }> = ({ t }) => {
  const rita = ramp(t, 3.0, 0.5);
  const svar = t >= 6.0;
  const luckaFyll = ramp(t, 6.0, 0.15);
  return (
    <div style={{ position: 'absolute', inset: 0, ...vaxling(t, 3.0, 7.0) }}>
      <div
        style={{
          position: 'absolute',
          left: KANT,
          top: MATRIS_Y,
          width: INRE,
          height: CELL_H * 3 + 16,
          background: C.papper,
          borderRadius: 16,
          boxShadow: LYFT,
          border: `1px solid ${C.kant}`,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 8, width: INRE - 2, height: CELL_H * 3 }}>
          <Rutnat b={INRE - 2} h={CELL_H * 3} rita={rita} />
          {/* Luckan */}
          <div style={{ position: 'absolute', left: cellPos(8).x, top: cellPos(8).y, width: CELL_B, height: CELL_H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 4, borderRadius: 8, background: C.papper2, opacity: 1 - luckaFyll }} />
            <Cell storlek={CELL_H - 6}>
              <Lucka opacity={(1 - luckaFyll) * rita} />
              {svar && (
                <g opacity={luckaFyll}>
                  <Pil vinkel={0} farg={C.kopparInk} />
                </g>
              )}
            </Cell>
          </div>
          {/* Pilen föds i ruta 1 och hoppar en ruta per åttondel, 45 grader i varje hopp */}
          {Array.from({ length: 8 }).map((_, i) => {
            const start = 3.5 + 0.25 * i;
            if (t < start) return null;
            const fran = cellPos(Math.max(0, i - 1));
            const till = cellPos(i);
            const flytt = i === 0 ? 1 : ramp(t, start, 0.2, UT);
            const vrid = i === 0 ? 1 : ramp(t, start, 0.18, IN_UT);
            const x = mix(fran.x, till.x, flytt);
            const y = mix(fran.y, till.y, flytt);
            const vinkel = mix(Math.max(0, i - 1) * 45, i * 45, vrid);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: CELL_B,
                  height: CELL_H,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: i === 0 ? ramp(t, start, 0.15) : 1,
                }}
              >
                <Cell storlek={CELL_H - 6}>
                  <Pil vinkel={vinkel} />
                </Cell>
              </div>
            );
          })}
        </div>
      </div>
      {/* Sex alternativ, ett per sextondel */}
      <div style={{ position: 'absolute', left: KANT, top: ALT_Y, width: INRE, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALT_2A.map((a, k) => {
          const lage: AltLage = !svar ? 'neutral' : a.ratt ? 'ratt' : 'nedtonad';
          return (
            <div key={a.bokstav} style={landa(t, 5.25 + 0.125 * k, 12)}>
              <Alternativ bokstav={a.bokstav} lage={lage} bredd={ALT_B} hojd={ALT_H}>
                <Cell storlek={ALT_H - 6}>
                  <Pil vinkel={a.vinkel} lang={a.lang !== false} oppenSpets={a.oppen} />
                </Cell>
              </Alternativ>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2b Verbalt resonemang (v1-p01-summer-employment, påstående 2)

export const Verbalt: React.FC<{ t: number }> = ({ t }) => {
  const svar = t >= 8.75;
  const knappar = ['Sant', 'Falskt', 'Går inte att avgöra'];
  const rader = [
    'Många företag tycker att det är förmånligt att anställa studenter över sommaren.',
    'Den ordinarie personalen vill ofta ta ut semester under denna period. [...]',
    'Företagen betalar studenterna utifrån en fast skala utan de vanliga rättigheterna, såsom betald semester och sjuklön.',
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, ...vaxling(t, 7.0, 10.0) }}>
      <div
        style={{
          position: 'absolute',
          left: KANT,
          top: 92,
          width: INRE,
          boxSizing: 'border-box',
          background: C.papper,
          border: `1px solid ${C.kant}`,
          borderRadius: 16,
          padding: '12px 16px 13px',
        }}
      >
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 15.5, color: C.ink1, marginBottom: 4 }}>Sommaranställningar</div>
        {rader.map((r, i) => (
          <span key={i} style={{ fontFamily: F.text, fontSize: 13, lineHeight: '19px', color: C.ink2, opacity: ramp(t, 7.0 + 0.08 * i, 0.3) }}>
            {r}{' '}
          </span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: KANT, top: 276, width: INRE, ...landa(t, 7.75) }}>
        <Eyebrow>Påstående 2 av 4</Eyebrow>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18.5, lineHeight: '24px', color: C.ink1, marginTop: 8 }}>
          Studenter har samma rätt till betald semester som den ordinarie personalen när de sommarjobbar.
        </div>
      </div>
      <div style={{ position: 'absolute', left: KANT, top: 392, width: INRE, display: 'flex', gap: 8 }}>
        {knappar.map((k, i) => {
          const ratt = k === 'Falskt';
          const lage: AltLage = !svar ? 'neutral' : ratt ? 'ratt' : 'nedtonad';
          return (
            <div key={k} style={{ flex: 1, ...landa(t, 8.0 + 0.125 * i, 12) }}>
              <Alternativ bokstav="" lage={lage} bredd={(INRE - 16) / 3} hojd={60}>
                <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 14.5, lineHeight: '18px', color: C.ink1, textAlign: 'center', padding: '0 10px' }}>
                  {k}
                </div>
              </Alternativ>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2c Numeriskt test (num-p01, fråga 4)

const TABELL = [
  ['Elektronik', '12,5', '15,2', '18,8', '22,1', '68,6'],
  ['Hushåll', '8,2', '9,5', '9,8', '9,8', '37,3'],
  ['Kläder', '6,8', '8,4', '8,9', '14,0', '38,1'],
  ['Sport', '4,3', '4,5', '6,3', '10,9', '26,0'],
  ['Totalt', '31,8', '37,6', '43,8', '56,8', '170,0'],
];

export const Numeriskt: React.FC<{ t: number }> = ({ t }) => {
  const svar = t >= 12.25;
  const mjuk = ramp(t, 11.5, 0.2);
  const kol = [104, 48, 48, 48, 48, 52];
  const alternativ = ['Cirka 12 %', 'Cirka 15 %', 'Cirka 18 %', 'Cirka 22 %'];
  return (
    <div style={{ position: 'absolute', inset: 0, ...vaxling(t, 10.0, 13.0) }}>
      <div
        style={{
          position: 'absolute',
          left: KANT,
          top: 88,
          width: INRE,
          boxSizing: 'border-box',
          background: C.papper,
          border: `1px solid ${C.kant}`,
          borderRadius: 16,
          padding: '12px 14px 8px',
        }}
      >
        <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 13.5, color: C.ink1, marginBottom: 6 }}>Försäljning 2024 per kategori (MSEK)</div>
        <div style={{ display: 'flex', fontFamily: F.text, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: C.ink3, height: 20, alignItems: 'center', borderBottom: `1px solid ${C.kant}` }}>
          {['KATEGORI', 'Q1', 'Q2', 'Q3', 'Q4', 'TOTALT'].map((h, i) => (
            <div key={h} style={{ width: kol[i], textAlign: i === 0 ? 'left' : 'right' }}>{h}</div>
          ))}
        </div>
        {TABELL.map((rad, r) => {
          const sista = r === TABELL.length - 1;
          const p = ramp(t, 10.0 + 0.07 * (r + 1), 0.3);
          return (
            <div
              key={rad[0]}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 21,
                fontFamily: F.text,
                fontSize: 13,
                fontVariantNumeric: 'tabular-nums',
                color: C.ink1,
                fontWeight: sista ? 600 : 400,
                borderTop: sista ? `1.5px solid ${C.kantStark}` : r > 0 ? `1px solid ${C.kant}` : 'none',
                opacity: p,
                transform: `translateX(${(1 - p) * -12}px)`,
              }}
            >
              {rad.map((v, i) => {
                const sokt = i === 5 && (rad[0] === 'Sport' || rad[0] === 'Totalt');
                return (
                  <div key={i} style={{ width: kol[i], textAlign: i === 0 ? 'left' : 'right', fontWeight: i === 0 ? 500 : undefined, position: 'relative' }}>
                    {sokt && (
                      <div style={{ position: 'absolute', right: -5, left: 2, top: -2, bottom: -2, borderRadius: 5, background: C.ton, opacity: mjuk }} />
                    )}
                    <span style={{ position: 'relative' }}>{v}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: KANT, top: 266, width: INRE, ...landa(t, 10.5) }}>
        <Eyebrow>Fråga 4 av 4</Eyebrow>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18.5, lineHeight: '24px', color: C.ink1, marginTop: 6 }}>
          Hur stor andel utgjorde Sport av total årsförsäljning?
        </div>
      </div>
      <div style={{ position: 'absolute', left: KANT, top: 342, width: INRE, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {alternativ.map((a, i) => {
          const ratt = i === 1;
          const lage: AltLage = !svar ? 'neutral' : ratt ? 'ratt' : 'nedtonad';
          return (
            <div key={a} style={landa(t, 10.75 + 0.125 * i, 12)}>
              <Alternativ bokstav="" lage={lage} bredd={INRE} hojd={26} radie={10}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '0 14px', fontFamily: F.text, fontSize: 14, color: C.ink1 }}>
                  <span style={{ fontWeight: 600, fontSize: 12, color: ratt && svar ? C.kopparInk : C.ink3, width: 10 }}>{'ABCD'[i]}</span>
                  <span style={{ fontWeight: 500 }}>{a}</span>
                </div>
              </Alternativ>
            </div>
          );
        })}
      </div>
    </div>
  );
};
