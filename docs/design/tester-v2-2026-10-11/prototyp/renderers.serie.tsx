// Prototyp av figurseriernas sammansatta primitiv "duo" (art-director 2026-10-12).
// Inte produktionskod: Opus skriver in motsvarande i renderers.v7.tsx och geometri.json
// enligt docs/design/tester-v2-2026-10-11/figurserier-spec.md.
// Allt som inte är duo renderas med grafik v3:s renderare oförändrad.
import React from 'react';
import G from '../grafik-v3/geometri-v3.json';
import S from './geometri-serie.json';
import { CellV3 } from '../grafik-v3/renderers.v3';

const STROKE = G.farger.stroke;
const INK = G.farger.fillBlack;
const RAM = G.farger.ram;
const SW = G.kontur.sw;

export type Ytter = { typ: 'kant'; lage: number; antal?: number } | { typ: 'orbital'; lage: number };
export type Karna =
  | { typ: 'pil'; vinkel: number }
  | { typ: 'form'; form: 'circle' | 'square' | 'diamond'; fyllning: 'none' | 'black' }
  | { typ: 'symbol'; symbol: 'plus' | 'minus' | 'cross' | 'dot' | 'ring' };
export type DuoCell = { kind: 'duo'; ytter: Ytter; karna: Karna };

const f2 = (x: number) => Math.round(x * 100) / 100;

/** Kantens åtta stopp på kvadraten [23, 77], medurs från klockan 12. */
export const kantStopp = (k: number): [number, number] => {
  const [a, b] = S.duo.kant.ram;
  const m = (a + b) / 2;
  const p: [number, number][] = [[m, a], [b, a], [b, m], [b, b], [m, b], [a, b], [a, m], [a, a]];
  return p[((k % 8) + 8) % 8];
};
/** Orbitalens åtta lägen på banan r 26, medurs från klockan 12. */
export const banLage = (k: number, r: number): [number, number] => {
  const a = ((k * 45 - 90) * Math.PI) / 180;
  return [f2(50 + r * Math.cos(a)), f2(50 + r * Math.sin(a))];
};

const Kant: React.FC<{ y: Extract<Ytter, { typ: 'kant' }> }> = ({ y }) => {
  const n = Math.min(Math.max(y.antal ?? 1, 1), S.duo.kant.maxAntal);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const [x, yy] = kantStopp(y.lage + i);
        return <circle key={i} cx={x} cy={yy} r={S.duo.kant.prickR} fill={INK} />;
      })}
    </>
  );
};

const Orbital: React.FC<{ y: Extract<Ytter, { typ: 'orbital' }> }> = ({ y }) => {
  const o = S.duo.orbital;
  const [x, yy] = banLage(y.lage, o.banaR);
  return (
    <>
      <circle cx="50" cy="50" r={o.banaR} fill="none" stroke={RAM} strokeWidth={o.banaSw} strokeDasharray={o.banaStreck} strokeLinecap="round" />
      <circle cx={x} cy={yy} r={o.satellitR} fill={INK} />
    </>
  );
};

const Pil: React.FC<{ k: Extract<Karna, { typ: 'pil' }> }> = ({ k }) => {
  const p = S.duo.pil;
  return (
    <g transform={`rotate(${k.vinkel}, 50, 50)`} stroke={STROKE} strokeWidth={SW} strokeLinecap="round" fill="none">
      <line x1="50" y1={p.svans} x2="50" y2={p.skaftSlut} />
      <line x1="50" y1={p.spets} x2={50 - p.huvudHalv} y2={p.spets + p.huvudHojd} />
      <line x1="50" y1={p.spets} x2={50 + p.huvudHalv} y2={p.spets + p.huvudHojd} />
    </g>
  );
};

const bana = (p: number[][]) => 'M ' + p.map(([x, y]) => `${x} ${y}`).join(' L ') + ' Z';

const Form: React.FC<{ k: Extract<Karna, { typ: 'form' }> }> = ({ k }) => {
  const F = S.duo.form;
  const svart = k.fyllning === 'black';
  const fill = svart ? INK : 'transparent';
  const stroke = svart ? 'none' : STROKE;
  if (k.form === 'circle') return <circle cx="50" cy="50" r={F.cirkelR} fill={fill} stroke={stroke} strokeWidth={SW} />;
  if (k.form === 'square') return <rect x={F.kvadrat.x} y={F.kvadrat.y} width={F.kvadrat.sida} height={F.kvadrat.sida} rx={F.kvadrat.rx} fill={fill} stroke={stroke} strokeWidth={SW} />;
  return <path d={bana(F.romb)} fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />;
};

const Symbol: React.FC<{ k: Extract<Karna, { typ: 'symbol' }> }> = ({ k }) => {
  const Y = S.duo.symbol;
  const linjer = (l: number[][]) => l.map(([x1, y1, x2, y2], i) => <line key={i} x1={50 + x1} y1={50 + y1} x2={50 + x2} y2={50 + y2} />);
  if (k.symbol === 'dot') return <circle cx="50" cy="50" r={Y.prickR} fill={INK} />;
  if (k.symbol === 'ring') return <circle cx="50" cy="50" r={Y.ringR} fill="none" stroke={STROKE} strokeWidth={SW} />;
  return (
    <g stroke={STROKE} strokeWidth={SW} strokeLinecap="round" fill="none">
      {linjer(k.symbol === 'plus' ? Y.plus : k.symbol === 'minus' ? Y.minus : Y.kryss)}
    </g>
  );
};

/** Duo: ett ytterelement (kant eller orbital) och ett kärnelement (pil, form eller symbol). Zonerna är koncentriska, så avståndet är detsamma i alla lägen. */
export const Duo: React.FC<{ cell: DuoCell }> = ({ cell }) => (
  <>
    {cell.ytter.typ === 'kant' ? <Kant y={cell.ytter} /> : <Orbital y={cell.ytter} />}
    {cell.karna.typ === 'pil' ? <Pil k={cell.karna} /> : cell.karna.typ === 'form' ? <Form k={cell.karna} /> : <Symbol k={cell.karna} />}
  </>
);

export const CellSerie: React.FC<{ cell: any }> = ({ cell }) => (cell.kind === 'duo' ? <Duo cell={cell} /> : <CellV3 cell={cell} />);

/**
 * Zonkontrollen (S1 i specen): målad radie för varje kärna och innerkant för varje ytterelement.
 * Räknas analytiskt ur samma json som renderaren läser, så att kontroll och ritning inte kan glida isär.
 */
export function zonkontroll() {
  const sw = SW / 2;
  const F = S.duo.form, P = S.duo.pil, Y = S.duo.symbol, K = S.duo.kant, O = S.duo.orbital;
  const rundatHorn = (halvsida: number, rx: number) => (halvsida - rx) * Math.SQRT2 + rx;
  const karnor: { namn: string; malad: number }[] = [
    { namn: 'pil (svans 63, spets 37, huvud 8 × 10)', malad: Math.max(P.svans - 50 + sw, 50 - P.spets + sw, Math.hypot(P.huvudHalv, 50 - P.spets - P.huvudHojd) + sw) },
    { namn: 'cirkel r 11, ofylld', malad: F.cirkelR + sw },
    { namn: 'cirkel r 11, svart', malad: F.cirkelR },
    { namn: 'kvadrat 20 rx 3, ofylld', malad: rundatHorn(F.kvadrat.sida / 2 + sw, F.kvadrat.rx + sw) },
    { namn: 'kvadrat 20 rx 3, svart', malad: rundatHorn(F.kvadrat.sida / 2, F.kvadrat.rx) },
    { namn: 'romb spets 13, ofylld (round join)', malad: 13 + sw },
    { namn: 'romb spets 13, svart', malad: 13 },
    { namn: 'plus och minus 20', malad: 10 + sw },
    { namn: 'kryss 20 i diagonal', malad: Math.hypot(7, 7) + sw },
    { namn: 'prick r 5', malad: Y.prickR },
    { namn: 'ring r 7', malad: Y.ringR + sw },
  ];
  const halv = (K.ram[1] - K.ram[0]) / 2;
  const ytter: { namn: string; inner: number; ytterst: number }[] = [
    { namn: 'kantprick i hörn (avstånd 38,2)', inner: halv * Math.SQRT2 - K.prickR, ytterst: halv + K.prickR },
    { namn: 'kantprick på mitten av en sida (avstånd 27)', inner: halv - K.prickR, ytterst: halv + K.prickR },
    { namn: 'orbitalens satellit r 6 på r 26', inner: O.banaR - O.satellitR, ytterst: O.banaR + O.satellitR },
    { namn: 'orbitalens bana 2,5 (referens)', inner: O.banaR - O.banaSw / 2, ytterst: O.banaR + O.banaSw / 2 },
  ];
  const rader: { karna: string; ytter: string; gap: number; gapPx: number }[] = [];
  for (const k of karnor) for (const y of ytter) rader.push({ karna: k.namn, ytter: y.namn, gap: y.inner - k.malad, gapPx: (y.inner - k.malad) * G.skala360.rutnat });
  const maxKarna = Math.max(...karnor.map((k) => k.malad));
  const minYtter = Math.min(...ytter.filter((y) => !y.namn.includes('referens')).map((y) => y.inner));
  // Grannar på kanten: två stopp i rad ligger 27 enheter isär.
  const kantGrannar = halv - 2 * K.prickR;
  // G2: ytterst målat mot [14, 86].
  const g2 = ytter.map((y) => ({ namn: y.namn, marginal: 50 - y.ytterst }));
  return { karnor, ytter, rader, maxKarna, minYtter, minGap: minYtter - maxKarna, kantGrannar, g2, skala: G.skala360.rutnat };
}
