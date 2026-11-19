// src/lib/spatialV1/ritare.tsx
// =============================================================================
// Ritarna för Spatial förmåga: brick (form A), ark (form B), kub (form C) och,
// från bankversion 5, kropp (form C: kuber på en platta) och brickans
// spegellinjer (form A). De nya ritas bara när figuren har dem (kind 'kropp',
// BrickFigur.axlar); alla äldre figurer ritas exakt som förut.
// Skissens figurritare (docs/design/skiss-tester-steg2-2026-11-09.html) är
// förlagan. Måtten kommer ur geometri.json, som
// scripts/spatial-geometri-check.mjs mäter på samma utdata.
//
// Grafik v3:s färgroller med V7:s hexvärden, så att .matrisyta i globals.css
// mappar dem till tokens i ljust och mörkt läge: bläck (#020617), papper
// (#FFFFFF), grått (#CBD5E1, alltid med bläckkontur) och ram-grått (#64748B,
// bara referens som viklinjen). Aldrig <text>, <use>, filter, mask eller
// clipPath (V12). Allt målat ligger i [14, 86].
// =============================================================================

import React from 'react';
import data from './geometri.json';
import type { ArkStansFigur, ArkUtFigur, ArkVikFigur, BrickFigur, KroppFigur, KubFigur, KubSida, Punkt, SpatialFigur, SpegelAxel } from './types';

export const SPATIAL_GEOMETRI = data;
const G = data;
const F = G.farger;
const r2 = (x: number) => Math.round(x * 100) / 100;

// =============================================================================
// Form A: brick
// =============================================================================

/** Rutornas lägen i viewBox-enheter, figuren centrerad i sin n×n-ram. Delas med mätningen. */
export function brickRutor(fig: BrickFigur) {
  const { yttermatt, start, luft } = G.brick;
  const pitch = yttermatt / fig.n;
  const size = pitch - luft;
  const h = Math.max(...fig.cells.map((c) => c[0])) + 1;
  const w = Math.max(...fig.cells.map((c) => c[1])) + 1;
  const ox = start + luft / 2 + ((fig.n - w) * pitch) / 2;
  const oy = start + luft / 2 + ((fig.n - h) * pitch) / 2;
  return fig.cells.map(([r, c]) => ({
    x: r2(ox + c * pitch),
    y: r2(oy + r * pitch),
    size: r2(size),
    mark: !!fig.mark && fig.mark[0] === r && fig.mark[1] === c,
  }));
}

/** Spegellinjerna i form A (bankversion 5): ändpunkterna i viewBox, genom figurens mitt (50, 50). */
export function brickAxel(a: SpegelAxel): [Punkt, Punkt] {
  const [r0, r1] = G.brickAxel.rak;
  const [d0, d1] = G.brickAxel.diag;
  if (a === 'v') return [[50, r0], [50, r1]];
  if (a === 'h') return [[r0, 50], [r1, 50]];
  if (a === 'd') return [[d0, d0], [d1, d1]];
  return [[d1, d0], [d0, d1]];
}

const Brick: React.FC<{ fig: BrickFigur }> = ({ fig }) => {
  const ins = G.brick.markSw / 2;
  return (
    <>
      {brickRutor(fig).map((r, i) =>
        r.mark ? (
          <rect key={i} x={r2(r.x + ins)} y={r2(r.y + ins)} width={r2(r.size - 2 * ins)} height={r2(r.size - 2 * ins)} rx={G.brick.rx} fill={F.gra} stroke={F.ink} strokeWidth={G.brick.markSw} />
        ) : (
          <rect key={i} x={r.x} y={r.y} width={r.size} height={r.size} rx={G.brick.rx} fill={F.ink} />
        )
      )}
      {fig.axlar?.map((a, i) => {
        const [p, q] = brickAxel(a);
        return <line key={`ax${i}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={F.ram} strokeWidth={G.brickAxel.sw} strokeDasharray={G.brickAxel.streck} strokeLinecap="round" />;
      })}
    </>
  );
};

// =============================================================================
// Form B: ark
// =============================================================================

/** Skala och förskjutning: arkets enheter (en ruta = 1) till viewBox, regionens mitt i 50. */
export function arkTransform(n: number, poly: Punkt[]) {
  const s = G.ark.sida / n;
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return { s, t: (p: Punkt): Punkt => [r2(50 + (p[0] - cx) * s), r2(50 + (p[1] - cy) * s)] };
}

const bana = (pts: Punkt[]) => 'M' + pts.map((p) => `${p[0]} ${p[1]}`).join(' L') + ' Z';

/** Hålets radie för arkets rutnät. */
export const halR = (n: number) => (G.ark.halR as Record<string, number>)[String(n)];

const ArkVik: React.FC<{ fig: ArkVikFigur }> = ({ fig }) => {
  const { t } = arkTransform(fig.n, fig.poly);
  const P = G.ark.pil;
  const [a, b] = fig.pil.map(t);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u: Punkt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const v: Punkt = [-u[1], u[0]];
  const bas: Punkt = [b[0] - u[0] * P.huvudLangd, b[1] - u[1] * P.huvudLangd];
  const huvud: Punkt[] = [b, [r2(bas[0] + v[0] * P.huvudHalv), r2(bas[1] + v[1] * P.huvudHalv)], [r2(bas[0] - v[0] * P.huvudHalv), r2(bas[1] - v[1] * P.huvudHalv)]];
  const [l0, l1] = fig.linje.map(t);
  // Form D, första rutan: det utvikta arket med hål och klipp (konturen som ArkUt), och den grå delen utan hacken.
  const arket = fig.hal || fig.klipp ? arkVikArket(fig) : null;
  return (
    <>
      <path d={bana((arket ? arket.kontur : fig.poly).map(t))} fill={F.papper} stroke={F.ink} strokeWidth={G.kontur.sw} strokeLinejoin="round" />
      <path d={bana((arket ? arket.gra : fig.rorlig).map(t))} fill={F.gra} stroke={F.ink} strokeWidth={G.kontur.sw} strokeLinejoin="round" />
      {arket?.inre.map(([r, c], i) => {
        const [x, y] = t([c, r]);
        return <rect key={`k${i}`} x={x} y={y} width={r2(G.ark.sida / fig.n)} height={r2(G.ark.sida / fig.n)} fill={F.ink} />;
      })}
      {(fig.hal ?? []).map(([r, c], i) => {
        const [x, y] = t([c + 0.5, r + 0.5]);
        return <circle key={`h${i}`} cx={x} cy={y} r={halR(fig.n)} fill={F.ink} />;
      })}
      <line x1={l0[0]} y1={l0[1]} x2={l1[0]} y2={l1[1]} stroke={F.ram} strokeWidth={G.ark.viklinjeSw} strokeDasharray={G.ark.viklinjeStreck} strokeLinecap="round" />
      <line x1={a[0]} y1={a[1]} x2={r2(bas[0] + u[0])} y2={r2(bas[1] + u[1])} stroke={F.ink} strokeWidth={P.sw} strokeLinecap="round" />
      <path d={bana(huvud)} fill={F.ink} stroke={F.ink} strokeWidth={G.kontur.tunn} strokeLinejoin="round" />
    </>
  );
};

/**
 * Form D, första rutan: arkets kontur med hacken, de inre klippen och den grå
 * delen (det som viks först) utan hacken. Arket är helt utvikt, så konturen
 * räknas som för ArkUt. Spärren SP-B2-6 kräver att den grå delen hänger ihop.
 */
export function arkVikArket(fig: ArkVikFigur) {
  const rutorI = (poly: Punkt[]) => {
    const ut: [number, number][] = [];
    for (let r = 0; r < fig.n; r++)
      for (let c = 0; c < fig.n; c++) if ([[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]].every((p) => inomPoly(poly, p as Punkt))) ut.push([r, c]);
    return ut;
  };
  // klipp som når regionens kant (genom andra klipp) blir hack, övriga är inre bläckrutor
  const region = rutorI(fig.poly);
  const iRegion = new Set(region.map((x) => x.join(',')));
  const klippt = new Set((fig.klipp ?? []).map((x) => x.join(',')));
  const grannar = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const ko = (fig.klipp ?? []).filter(([r, c]) => grannar.some(([dr, dc]) => !iRegion.has(`${r + dr},${c + dc}`)));
  const kant = new Set(ko.map((x) => x.join(',')));
  while (ko.length) {
    const [r, c] = ko.pop()!;
    for (const [dr, dc] of grannar) {
      const k = `${r + dr},${c + dc}`;
      if (klippt.has(k) && !kant.has(k)) {
        kant.add(k);
        ko.push([r + dr, c + dc]);
      }
    }
  }
  const inre = (fig.klipp ?? []).filter((x) => !kant.has(x.join(',')));
  const papper = region.filter((x) => !kant.has(x.join(',')));
  const gra = rutorI(fig.rorlig).filter((x) => !kant.has(x.join(',')));
  return { kontur: rutKontur(papper), gra: rutKontur(gra), inre };
}

/**
 * Det vikta arket med klipp: regionen är alltid hela rutor när arket har
 * klipp (expert viker bara längs rutlinjer), så konturen räknas som för det
 * uppvikta arket: regionens rutor minus klippen. Klipp som inte når kanten
 * blir bläckrutor.
 */
export function stansDelar(fig: ArkStansFigur) {
  const klippt = new Set((fig.klipp ?? []).map((k) => k.join(',')));
  const rutor: [number, number][] = [];
  for (let r = 0; r < fig.n; r++)
    for (let c = 0; c < fig.n; c++) {
      const hel = [[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]].every((p) => inomPoly(fig.poly, p as Punkt));
      if (hel) rutor.push([r, c]);
    }
  const iRegion = new Set(rutor.map((x) => x.join(',')));
  const inre = (fig.klipp ?? []).filter(([r, c]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dr, dc]) => iRegion.has(`${r + dr},${c + dc}`) && !klippt.has(`${r + dr},${c + dc}`)));
  const inreS = new Set(inre.map((x) => x.join(',')));
  const kvar = rutor.filter((x) => !klippt.has(x.join(',')) || inreS.has(x.join(',')));
  return { kontur: rutKontur(kvar), inre };
}

function inomPoly(poly: Punkt[], p: Punkt) {
  let tecken = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const k = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    if (Math.abs(k) < 1e-9) continue;
    if (tecken && Math.sign(k) !== tecken) return false;
    tecken = Math.sign(k);
  }
  return true;
}

const ArkStans: React.FC<{ fig: ArkStansFigur }> = ({ fig }) => {
  const { t, s } = arkTransform(fig.n, fig.poly);
  const delar = fig.klipp?.length ? stansDelar(fig) : null;
  return (
    <>
      <path d={bana((delar ? delar.kontur : fig.poly).map(t))} fill={F.gra} stroke={F.ink} strokeWidth={G.kontur.sw} strokeLinejoin="round" />
      {delar?.inre.map(([r, c], i) => {
        const [x, y] = t([c, r]);
        return <rect key={`k${i}`} x={x} y={y} width={r2(s)} height={r2(s)} fill={F.ink} />;
      })}
      {fig.hal.map(([r, c], i) => {
        const [x, y] = t([c + 0.5, r + 0.5]);
        return <circle key={i} cx={x} cy={y} r={halR(fig.n)} fill={F.ink} />;
      })}
    </>
  );
};

/** Det uppvikta arkets kontur: hela arket minus klippta rutor som når kanten (som hack), och de inre klippen som bläckytor. */
export function arkUtDelar(fig: ArkUtFigur) {
  const n = fig.n;
  const klippt = new Set(fig.klipp.map((k) => k.join(',')));
  // klippta rutor som hänger ihop med arkets kant blir hack i konturen
  const kant = new Set<string>();
  const ko = fig.klipp.filter(([r, c]) => r === 0 || c === 0 || r === n - 1 || c === n - 1);
  ko.forEach((k) => kant.add(k.join(',')));
  while (ko.length) {
    const [r, c] = ko.pop()!;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${r + dr},${c + dc}`;
      if (klippt.has(k) && !kant.has(k)) {
        kant.add(k);
        ko.push([r + dr, c + dc]);
      }
    }
  }
  const kvar: [number, number][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!kant.has(`${r},${c}`)) kvar.push([r, c]);
  const inre = fig.klipp.filter((k) => !kant.has(k.join(',')));
  return { kontur: rutKontur(kvar), inre };
}

/** Yttre konturen av en sammanhängande mängd rutor, som punktlista (enheter, x = kolumn, y = rad). */
export function rutKontur(rutor: [number, number][]): Punkt[] {
  const s = new Set(rutor.map((r) => r.join(',')));
  const kanter = new Map<string, Punkt>();
  // riktade kanter medurs runt varje ruta, gemensamma kanter tar ut varandra
  const lagg = (a: Punkt, b: Punkt) => {
    const motsatt = `${b.join(',')}>${a.join(',')}`;
    if (kanter.has(motsatt)) kanter.delete(motsatt);
    else kanter.set(`${a.join(',')}>${b.join(',')}`, b);
  };
  for (const [r, c] of rutor) {
    lagg([c, r], [c + 1, r]);
    lagg([c + 1, r], [c + 1, r + 1]);
    lagg([c + 1, r + 1], [c, r + 1]);
    lagg([c, r + 1], [c, r]);
  }
  void s;
  const fran = new Map<string, Punkt>();
  for (const [k, b] of kanter) fran.set(k.split('>')[0], b);
  // börja i hörnet längst upp till vänster (alltid på yttre konturen)
  const start = [...fran.keys()].map((k) => k.split(',').map(Number) as Punkt).sort((a, b) => a[1] - b[1] || a[0] - b[0])[0];
  const ut: Punkt[] = [start];
  let p = fran.get(start.join(','))!;
  let varv = 0;
  while ((p[0] !== start[0] || p[1] !== start[1]) && varv++ < 1000) {
    ut.push(p);
    p = fran.get(p.join(','))!;
  }
  // ta bort punkter mitt på raka sträckor
  return ut.filter((q, i) => {
    const a = ut[(i + ut.length - 1) % ut.length];
    const b = ut[(i + 1) % ut.length];
    return (q[0] - a[0]) * (b[1] - q[1]) - (q[1] - a[1]) * (b[0] - q[0]) !== 0;
  });
}

const ArkUt: React.FC<{ fig: ArkUtFigur }> = ({ fig }) => {
  const hel: Punkt[] = [
    [0, 0],
    [fig.n, 0],
    [fig.n, fig.n],
    [0, fig.n],
  ];
  const { t, s } = arkTransform(fig.n, hel);
  const { kontur, inre } = arkUtDelar(fig);
  return (
    <>
      <path d={bana(kontur.map(t))} fill={F.papper} stroke={F.ink} strokeWidth={G.kontur.sw} strokeLinejoin="round" />
      {inre.map(([r, c], i) => {
        const [x, y] = t([c, r]);
        return <rect key={`k${i}`} x={x} y={y} width={r2(s)} height={r2(s)} fill={F.ink} />;
      })}
      {fig.hal.map(([r, c], i) => {
        const [x, y] = t([c + 0.5, r + 0.5]);
        return <circle key={i} cx={x} cy={y} r={halR(fig.n)} fill={F.ink} />;
      })}
    </>
  );
};

// =============================================================================
// Form C: kub
// =============================================================================

type Affin = [number, number, number, number, number, number];
const app = (m: Affin, [x, y]: Punkt): Punkt => [r2(m[0] * x + m[2] * y + m[4]), r2(m[1] * x + m[3] * y + m[5])];
const vrid = (p: Punkt, k: number): Punkt => {
  // k kvarts varv medurs i lokala koordinater (y nedåt)
  let [x, y] = p;
  for (let i = 0; i < k; i++) [x, y] = [-y, x];
  return [x, y];
};

/** Ellipsen som en cirkel med radien rho i sidans lokala koordinater blir (affin bild). */
export function ellips(m: Affin, rho: number) {
  // M = [[a c],[b d]] ; M M^T = [[a²+c², ab+cd],[ab+cd, b²+d²]]
  const [a, b, c, d] = m;
  const p = a * a + c * c;
  const q = a * b + c * d;
  const s = b * b + d * d;
  const tr = p + s;
  const disk = Math.sqrt(((p - s) / 2) ** 2 + q * q);
  const l1 = tr / 2 + disk;
  const l2 = tr / 2 - disk;
  const vinkel = (Math.atan2(l1 - p, q) * 180) / Math.PI;
  return { rx: r2(Math.sqrt(l1) * rho), ry: r2(Math.sqrt(l2) * rho), vinkel: r2(q === 0 ? (p >= s ? 0 : 90) : vinkel) };
}

/** Symbolens målade delar på en sida, i viewBox-enheter. Delas med mätningen. */
export function kubSymbol(sida: 't' | 'l' | 'r', s: KubSida, farg: string) {
  const m = G.kub.matris[sida] as Affin;
  const S = G.kub.symbol;
  const sw = G.kub.symbolSw;
  const [cx, cy] = [m[4], m[5]];
  const P = (p: Punkt) => app(m, vrid(p, s.riktning));
  const cirkel = (rho: number, fylld: boolean, key: string) => {
    const e = ellips(m, rho);
    return <ellipse key={key} cx={cx} cy={cy} rx={e.rx} ry={e.ry} transform={`rotate(${e.vinkel} ${cx} ${cy})`} fill={fylld ? farg : 'none'} stroke={fylld ? 'none' : farg} strokeWidth={fylld ? undefined : sw} />;
  };
  const poly = (pts: Punkt[], fylld: boolean, key: string) => (
    <path key={key} d={bana(pts.map(P))} fill={fylld ? farg : 'none'} stroke={fylld ? 'none' : farg} strokeWidth={fylld ? undefined : sw} strokeLinejoin="round" />
  );
  const k = S.kvadrat;
  switch (s.symbol) {
    case 'prick':
      return [cirkel(S.prickR, true, 'p')];
    case 'ring':
      return [cirkel(S.ringR, false, 'r')];
    case 'dubbelring':
      return [cirkel(S.dubbelYttre, false, 'r1'), cirkel(S.dubbelInre, false, 'r2')];
    case 'kvadrat':
      return [poly([[-k, -k], [k, -k], [k, k], [-k, k]], false, 'k')];
    case 'fkvadrat':
      return [poly([[-k, -k], [k, -k], [k, k], [-k, k]], true, 'k')];
    case 'kryss': {
      const x = S.kryss;
      const [a, b, c, d] = [P([-x, -x]), P([x, x]), P([-x, x]), P([x, -x])];
      return [<path key="x" d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} M${c[0]} ${c[1]} L${d[0]} ${d[1]}`} fill="none" stroke={farg} strokeWidth={sw} strokeLinecap="round" />];
    }
    case 'stjarna': {
      // åttaarmad stjärna: fyra streck genom mitten, läses lika i alla lägen och under projektionen
      const r = S.stjarna;
      const d = r / Math.SQRT2;
      const streck = [[[0, -r], [0, r]], [[-r, 0], [r, 0]], [[-d, -d], [d, d]], [[-d, d], [d, -d]]] as [Punkt, Punkt][];
      return [<path key="st" d={streck.map(([a, b]) => { const [u, v] = [P(a), P(b)]; return `M${u[0]} ${u[1]} L${v[0]} ${v[1]}`; }).join(' ')} fill="none" stroke={farg} strokeWidth={sw} strokeLinecap="round" />];
    }
    case 'triangel':
      return [poly(S.triangel as Punkt[], false, 't')];
    case 'pil': {
      const p = S.pil;
      const [s0, s1] = [P([0, p.svans]), P([0, p.spets])];
      const [h0, h1] = [P([-p.huvud, p.spets + p.huvudDjup]), P([p.huvud, p.spets + p.huvudDjup])];
      return [<path key="pil" d={`M${s0[0]} ${s0[1]} L${s1[0]} ${s1[1]} M${h0[0]} ${h0[1]} L${s1[0]} ${s1[1]} L${h1[0]} ${h1[1]}`} fill="none" stroke={farg} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />];
    }
  }
}

const Kub: React.FC<{ fig: KubFigur }> = ({ fig }) => {
  const K = G.kub;
  const mark = fig.markera ?? [];
  const sidor = [
    ['t', K.T, F.papper],
    ['l', K.L, F.gra],
    ['r', K.R, F.papper],
  ] as const;
  return (
    <>
      {sidor.map(([k, pts, fyll]) => {
        const m = mark.includes(k);
        return <path key={k} d={bana(pts as Punkt[])} fill={m ? F.kopparMjuk : fyll} stroke={m ? F.koppar : F.ink} strokeWidth={G.kontur.sw} strokeLinejoin="round" />;
      })}
      {sidor.map(([k]) => (
        <g key={`s${k}`}>{kubSymbol(k, fig[k], mark.includes(k) ? F.kopparInk : F.ink)}</g>
      ))}
      {/* bläckkanterna mot det närmaste hörnet ovanpå fyllningen, så att kanterna är hela även med koppar */}
      <path d={`M${K.T[0][0]} ${K.T[0][1]} L${K.T[1][0]} ${K.T[1][1]} M${K.T[0][0]} ${K.T[0][1]} L${K.T[3][0]} ${K.T[3][1]} M${K.L[1][0]} ${K.L[1][1]} L${K.L[2][0]} ${K.L[2][1]}`} fill="none" stroke={F.ink} strokeWidth={G.kontur.sw} strokeLinecap="round" />
    </>
  );
};

// =============================================================================
// Form C, kroppar (bankversion 5)
// =============================================================================

type Punkt3 = [number, number, number];
/** En synlig sida av en kub; `snitt` är snittlinjen över sidan när snittet går genom den. */
export type KroppYta = { typ: 't' | 'l' | 'r'; pts: Punkt[]; kub: Punkt3; snitt?: [Punkt, Punkt] };

/**
 * Kroppens delar i viewBox-enheter, delas med mätningen. Isometrin är
 * tärningens: x snett nedåt åt höger, y snett nedåt åt vänster, z uppåt.
 * Kuberna målas bakifrån och fram (x + y + z växer), och bara sidor som inte
 * ligger an mot en annan kub ritas. Hela ritningen centreras i rutan.
 */
export function kroppDelar(fig: KroppFigur) {
  const K = G.kropp;
  const N = K.n;
  const c30 = Math.sqrt(3) / 2;
  const proj = ([x, y, z]: Punkt3): Punkt => [(x - y) * c30 * K.kant, ((x + y) / 2 - z) * K.kant];
  const h = (x: number, y: number) => (x >= 0 && y >= 0 && x < N && y < N ? fig.h[y][x] : 0);
  // pilen ligger på plattans nivå utanför plattan och pekar rakt mot sidorna den tittar på
  const pil3: [Punkt3, Punkt3] =
    fig.blick === 'l'
      ? [[N / 2, N + K.pil.fran, 0], [N / 2, N + K.pil.till, 0]]
      : [[N + K.pil.fran, N / 2, 0], [N + K.pil.till, N / 2, 0]];
  const snitt3: [Punkt3, Punkt3] | null =
    fig.snitt === undefined
      ? null
      : fig.blick === 'l'
        ? [[-K.snitt.ut, fig.snitt + 0.5, 0], [N + K.snitt.ut, fig.snitt + 0.5, 0]]
        : [[fig.snitt + 0.5, -K.snitt.ut, 0], [fig.snitt + 0.5, N + K.snitt.ut, 0]];
  const ytor: KroppYta[] = [];
  const kuber: Punkt3[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) for (let z = 0; z < h(x, y); z++) kuber.push([x, y, z]);
  kuber.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]) || a[2] - b[2] || a[0] - b[0]);
  // snittet går genom rad k (y = k + 0,5 för 'l', x = k + 0,5 för 'r'): linjen över ovansidan och den sida som skär planet
  const k = fig.snitt;
  const iRad = (x: number, y: number) => k !== undefined && (fig.blick === 'l' ? y === k : x === k);
  const m = (k ?? 0) + 0.5;
  for (const [x, y, z] of kuber) {
    const rad = iRad(x, y);
    if (h(x, y) === z + 1) {
      const sn: [Punkt3, Punkt3] = fig.blick === 'l' ? [[x, m, z + 1], [x + 1, m, z + 1]] : [[m, y, z + 1], [m, y + 1, z + 1]];
      ytor.push({ typ: 't', kub: [x, y, z], pts: ([[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]] as Punkt3[]).map(proj), ...(rad ? { snitt: sn.map(proj) as [Punkt, Punkt] } : {}) });
    }
    if (h(x, y + 1) <= z) {
      const sn: [Punkt3, Punkt3] = [[m, y + 1, z + 1], [m, y + 1, z]];
      ytor.push({ typ: 'l', kub: [x, y, z], pts: ([[x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z], [x, y + 1, z]] as Punkt3[]).map(proj), ...(rad && fig.blick === 'r' ? { snitt: sn.map(proj) as [Punkt, Punkt] } : {}) });
    }
    if (h(x + 1, y) <= z) {
      const sn: [Punkt3, Punkt3] = [[x + 1, m, z + 1], [x + 1, m, z]];
      ytor.push({ typ: 'r', kub: [x, y, z], pts: ([[x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z], [x + 1, y, z]] as Punkt3[]).map(proj), ...(rad && fig.blick === 'l' ? { snitt: sn.map(proj) as [Punkt, Punkt] } : {}) });
    }
  }
  const platta = ([[0, 0, 0], [N, 0, 0], [N, N, 0], [0, N, 0]] as Punkt3[]).map(proj);
  const natet: [Punkt, Punkt][] = [];
  for (let i = 1; i < N; i++) {
    natet.push([proj([i, 0, 0]), proj([i, N, 0])]);
    natet.push([proj([0, i, 0]), proj([N, i, 0])]);
  }
  const pil = pil3.map(proj) as [Punkt, Punkt];
  const snitt = snitt3 ? (snitt3.map(proj) as [Punkt, Punkt]) : null;
  // centrera allt som ritas: plattan, kuberna, pilen och snittlinjen
  const alla = [...platta, ...ytor.flatMap((y) => y.pts), ...pil, ...(snitt ?? [])];
  const xs = alla.map((p) => p[0]);
  const ys = alla.map((p) => p[1]);
  const dx = 50 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const dy = 50 - (Math.min(...ys) + Math.max(...ys)) / 2;
  const t = (p: Punkt): Punkt => [r2(p[0] + dx), r2(p[1] + dy)];
  return {
    platta: platta.map(t),
    natet: natet.map(([a, b]) => [t(a), t(b)] as [Punkt, Punkt]),
    ytor: ytor.map((y) => ({ ...y, pts: y.pts.map(t), ...(y.snitt ? { snitt: y.snitt.map(t) as [Punkt, Punkt] } : {}) })),
    pil: pil.map(t) as [Punkt, Punkt],
    snitt: snitt ? (snitt.map(t) as [Punkt, Punkt]) : null,
  };
}

const Kropp: React.FC<{ fig: KroppFigur }> = ({ fig }) => {
  const K = G.kropp;
  const d = kroppDelar(fig);
  const P = K.pil;
  const [a, b] = d.pil;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u: Punkt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const v: Punkt = [-u[1], u[0]];
  const bas: Punkt = [b[0] - u[0] * P.huvudLangd, b[1] - u[1] * P.huvudLangd];
  const huvud: Punkt[] = [b, [r2(bas[0] + v[0] * P.huvudHalv), r2(bas[1] + v[1] * P.huvudHalv)], [r2(bas[0] - v[0] * P.huvudHalv), r2(bas[1] - v[1] * P.huvudHalv)]];
  const fyll = { t: F.papper, l: F.gra, r: F.papper };
  return (
    <>
      <path d={bana(d.platta)} fill={F.papper} stroke={F.ram} strokeWidth={K.plattaSw} strokeLinejoin="round" />
      <path d={d.natet.map(([p, q]) => `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`).join(' ')} fill="none" stroke={F.ram} strokeWidth={K.plattaSw} />
      {d.snitt ? <line x1={d.snitt[0][0]} y1={d.snitt[0][1]} x2={d.snitt[1][0]} y2={d.snitt[1][1]} stroke={F.koppar} strokeWidth={K.snitt.sw} strokeDasharray={K.snitt.streck} strokeLinecap="round" /> : null}
      {d.ytor.map((y, i) => (
        <React.Fragment key={i}>
          <path d={bana(y.pts)} fill={fyll[y.typ]} stroke={F.ink} strokeWidth={K.sw} strokeLinejoin="round" />
          {y.snitt ? <line x1={y.snitt[0][0]} y1={y.snitt[0][1]} x2={y.snitt[1][0]} y2={y.snitt[1][1]} stroke={F.koppar} strokeWidth={K.snitt.sw} strokeDasharray={K.snitt.streck} strokeLinecap="round" /> : null}
        </React.Fragment>
      ))}
      <line x1={a[0]} y1={a[1]} x2={r2(bas[0] + u[0])} y2={r2(bas[1] + u[1])} stroke={F.ink} strokeWidth={P.sw} strokeLinecap="round" />
      <path d={bana(huvud)} fill={F.ink} stroke={F.ink} strokeWidth={G.kontur.tunn} strokeLinejoin="round" />
    </>
  );
};

// =============================================================================
// Huvudritaren
// =============================================================================

/** Figurens element, utan svg-skal (som SvgCellV7). */
export const SpatialFigurElement: React.FC<{ fig: SpatialFigur }> = ({ fig }) => {
  switch (fig.kind) {
    case 'brick':
      return <Brick fig={fig} />;
    case 'ark-vik':
      return <ArkVik fig={fig} />;
    case 'ark-stans':
      return <ArkStans fig={fig} />;
    case 'ark-ut':
      return <ArkUt fig={fig} />;
    case 'kub':
      return <Kub fig={fig} />;
    case 'kropp':
      return <Kropp fig={fig} />;
  }
};

/** Figuren i ett eget svg-skal, 0 till 100. */
export const SpatialSvg: React.FC<{ fig: SpatialFigur; className?: string }> = ({ fig, className }) => (
  <svg viewBox="0 0 100 100" shapeRendering="geometricPrecision" aria-hidden="true" className={className}>
    <SpatialFigurElement fig={fig} />
  </svg>
);
