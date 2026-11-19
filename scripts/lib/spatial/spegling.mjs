// scripts/lib/spatial/spegling.mjs
// =============================================================================
// Form A i Spatial förmåga, ny uppgiftstyp från bankversion 5 (omgång 3,
// docs/fragebank/spatial-2026-11-19-omg3.md): spegling i två linjer.
//
// Brickfiguren ritas med två streckade linjer genom sin mitt
// (BrickFigur.axlar, i tur och ordning). Frågan säger ordningen: "Figuren
// speglas först i den lodräta linjen och sedan i den vågräta." Två speglingar
// är tillsammans en vridning, så facit är alltid referensen vriden, men
// distraktorerna är inte bara speglingar: på grund finns ett kvarts varv, på
// avancerad och expert samma två speglingar i omvänd ordning (vridningen åt
// andra hållet). Den som bara letar efter "den som är vriden" hittar två.
//
//   grund      en lodrät och en vågrät linje, i någon ordning: facit ett halvt varv
//   avancerad  en rak och en sned linje, i någon ordning: facit ett kvarts varv
//   expert     som avancerad, större figur med den grå rutan
//
// Figuren får ingen symmetri alls (åtta olika lägen), så att varje alternativ
// är något annat än facit. Speglingarna är brick.mjs:s (rad nedåt, kolumn åt
// höger): lodrät (r, −c), vågrät (−r, c), sned d från övre vänstra hörnet
// (c, r) och sned a från övre högra hörnet (−c, −r).
// =============================================================================

import { mulberry32, hashString } from '../serie/slump.mjs';
import { norm, nyckel, vrid, spegla, attaOperationer, slumpaFigur, storlek, sammanhangande, arForbjuden } from './brick.mjs';

export const AXEL = { v: 'lodrat', h: 'vagrat', d: 'diagonal', a: 'motdiagonal' };
const AXELNAMN = { v: 'lodräta', h: 'vågräta', d: 'sneda', a: 'sneda' };

export const NIVAER_S = {
  grund: { n: [3, 4], rutor: [5, 6], mark: false, par: [['v', 'h'], ['h', 'v']], ordning: ['bara_forsta', 'bara_andra', 'kvarts_varv'] },
  avancerad: { n: [4], rutor: [6, 7], mark: false, par: [['v', 'd'], ['v', 'a'], ['h', 'd'], ['h', 'a'], ['d', 'v'], ['a', 'v'], ['d', 'h'], ['a', 'h']], ordning: ['fel_ordning', 'bara_forsta', 'bara_andra'] },
  expert: { n: [5], rutor: [7, 8], mark: true, par: [['v', 'd'], ['v', 'a'], ['h', 'd'], ['h', 'a'], ['d', 'v'], ['a', 'v'], ['d', 'h'], ['a', 'h']], ordning: ['fel_ordning', 'bara_forsta', 'bara_andra'] },
};

export const TEXT_S = {
  bara_forsta: 'Du speglade bara i den första linjen. Figuren ska speglas en gång till, i den andra.',
  bara_andra: 'Du speglade bara i den andra linjen. Börja med den första.',
  kvarts_varv: 'Det här är figuren vriden ett kvarts varv. En lodrät och en vågrät spegling blir tillsammans ett halvt varv.',
  fel_ordning: 'Du speglade i omvänd ordning. När den ena linjen är sned spelar ordningen roll.',
};

/** Frågan, med linjerna i tur och ordning. */
export const fragaS = ([a, b]) => `Figuren speglas först i den ${AXELNAMN[a]} linjen och sedan i den ${AXELNAMN[b]}. Hur ser den ut efteråt?`;

/** Figuren speglad i linjerna i tur och ordning. */
export const speglaI = (fig, axlar) => axlar.reduce((f, a) => spegla(f, AXEL[a]), norm(fig));

/** Vridningen (grader medurs) som två speglingar blir, ur figuren. */
export function vridningAv(fig, axlar) {
  const ut = nyckel(speglaI(fig, axlar));
  return [90, 180, 270].find((g) => nyckel(vrid(fig, g)) === ut) ?? null;
}

const GRAD = { 90: 'vriden 90 grader medurs', 180: 'vriden ett halvt varv (180 grader)', 270: 'vriden 90 grader moturs' };
export function forklaringS(axlar, grader) {
  if (axlar.every((a) => a === 'v' || a === 'h')) return `En spegling i en lodrät och en i en vågrät linje blir tillsammans ett halvt varv. Rätt figur är den första ${GRAD[grader]}.`;
  return `Två speglingar blir tillsammans en vridning, och när den ena linjen är sned beror riktningen på ordningen. Här blir det den första figuren ${GRAD[grader]}.`;
}

const osymmetrisk = (fig) => new Set(attaOperationer(fig).map(nyckel)).size === 8;

export function byggUppgiftS({ niva, id, fro }) {
  const L = NIVAER_S[niva];
  const rng = mulberry32(hashString(fro));
  const m = L.rutor[Math.floor(rng() * L.rutor.length)];
  const n = L.n[Math.floor(rng() * L.n.length)];
  const ref = slumpaFigur(rng, n, m, L.mark);
  if (!ref) return null;
  if (n === 4 && niva === 'grund' && Math.max(...storlek(ref)) < 4) return null;
  if (!osymmetrisk(ref)) return null;
  // den grå rutan är en hjälp, aldrig den enda asymmetrin (som SP-A2)
  if (ref.mark && !osymmetrisk({ cells: ref.cells })) return null;
  if (niva === 'grund' && arForbjuden(ref)) return null;
  const axlar = L.par[Math.floor(rng() * L.par.length)];
  const facit = speglaI(ref, axlar);
  const grader = vridningAv(ref, axlar);
  const kand = {
    bara_forsta: speglaI(ref, [axlar[0]]),
    bara_andra: speglaI(ref, [axlar[1]]),
    fel_ordning: speglaI(ref, [axlar[1], axlar[0]]),
    kvarts_varv: vrid(ref, rng() < 0.5 ? 90 : 270),
  };
  const valda = L.ordning.map((t) => ({ typ: t, fig: kand[t] }));
  const nycklar = [nyckel(facit), ...valda.map((v) => nyckel(v.fig))];
  if (new Set(nycklar).size !== 4 || nycklar.includes(nyckel(ref))) return null;
  if ([facit, ...valda.map((v) => v.fig)].some((f) => Math.max(...storlek(f)) > n)) return null;
  const alla = [{ typ: '', fig: facit }, ...valda];
  for (let i = alla.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [alla[i], alla[j]] = [alla[j], alla[i]];
  }
  return {
    id,
    niva,
    form: 'A',
    fraga: fragaS(axlar),
    n,
    referens: { kind: 'brick', n, ...ref, axlar: [...axlar] },
    options: alla.map((a) => ({ kind: 'brick', n, ...a.fig })),
    correctAnswer: alla.findIndex((a) => !a.typ),
    typer: alla.map((a) => a.typ),
    misstag: alla.map((a) => (a.typ ? TEXT_S[a.typ] : '')),
    forklaring: forklaringS(axlar, grader),
    vridning: grader,
  };
}

/** SP-S1 till SP-S5 på en speglingsuppgift. Tom lista: godkänd. */
export function sparrarS(q) {
  const fel = [];
  const id = q.id;
  const L = NIVAER_S[q.niva];
  const fig = (f) => ({ cells: f.cells, ...(f.mark ? { mark: f.mark } : {}) });
  const ref = fig(q.referens);
  const axlar = q.referens.axlar ?? [];
  // SP-S1 linjerna: två, nivåns par
  if (!L.par.some((p) => p[0] === axlar[0] && p[1] === axlar[1]) || axlar.length !== 2) fel.push(`${id}: SP-S1 linjerna ${axlar.join(' och ')} passar inte nivån`);
  // SP-S2 figuren saknar symmetri (också utan den grå rutan)
  if (!osymmetrisk(ref)) fel.push(`${id}: SP-S2 figuren har en symmetri`);
  if (ref.mark && !osymmetrisk({ cells: ref.cells })) fel.push(`${id}: SP-S2 formen utan den grå rutan är symmetrisk`);
  if (!!ref.mark !== L.mark) fel.push(`${id}: SP-S2 den grå rutan ska ${L.mark ? '' : 'inte '}finnas på nivån`);
  if (q.niva === 'grund' && [q.referens, ...q.options].some((o) => arForbjuden(o))) fel.push(`${id}: SP-S2 en figur läses som ett tecken`);
  if (fel.length) return fel;
  // SP-S3 exakt ett alternativ är figuren speglad i linjerna i tur och ordning, och det står på facit
  const facit = nyckel(speglaI(ref, axlar));
  const alt = q.options.map((o) => nyckel(fig(o)));
  if (new Set(alt).size !== 4) fel.push(`${id}: SP-S3 två alternativ är lika`);
  const ratt = alt.map((a, i) => (a === facit ? i : -1)).filter((i) => i >= 0);
  if (ratt.length !== 1 || ratt[0] !== q.correctAnswer) fel.push(`${id}: SP-S3 facit stämmer inte med speglingarna`);
  if (alt.includes(nyckel(ref))) fel.push(`${id}: SP-S3 ett alternativ är figuren orörd`);
  // SP-S4 distraktorerna är vad de säger, och minst en är en vridning (ingen genväg via "den som är vriden")
  const kand = { bara_forsta: speglaI(ref, [axlar[0]]), bara_andra: speglaI(ref, [axlar[1]]), fel_ordning: speglaI(ref, [axlar[1], axlar[0]]), kvarts_varv: null };
  q.typer.forEach((t, i) => {
    if (i === q.correctAnswer) return;
    if (t === 'kvarts_varv') {
      if (![90, 270].some((g) => nyckel(vrid(ref, g)) === alt[i])) fel.push(`${id}: SP-S4 alternativ ${i + 1} är inte ett kvarts varv`);
    } else if (!kand[t] || nyckel(kand[t]) !== alt[i]) fel.push(`${id}: SP-S4 alternativ ${i + 1} är inte "${t}"`);
    if (!q.misstag[i]) fel.push(`${id}: alternativ ${i + 1} saknar misstagstext`);
  });
  const vridna = alt.filter((a, i) => i !== q.correctAnswer && [90, 180, 270].some((g) => nyckel(vrid(ref, g)) === a));
  if (vridna.length < 1) fel.push(`${id}: SP-S4 ingen distraktor är en vridning, facit går att hitta utan att spegla`);
  // SP-S5 ram, antal rutor, sammanhängande, texten
  for (const o of [q.referens, ...q.options]) {
    const [h, w] = storlek(fig(o));
    if (h > q.n || w > q.n || o.n !== q.n || !L.n.includes(q.n)) fel.push(`${id}: SP-S5 en figur ryms inte i ramen ${q.n}×${q.n}`);
    if (!sammanhangande(o.cells)) fel.push(`${id}: SP-S5 en figur hänger inte ihop`);
  }
  if (!L.rutor.includes(ref.cells.length)) fel.push(`${id}: SP-S5 ${ref.cells.length} rutor, nivån har ${L.rutor.join(' till ')}`);
  if (q.fraga !== fragaS(axlar)) fel.push(`${id}: SP-S5 frågan nämner inte linjerna i rätt ordning`);
  const g = vridningAv(ref, axlar);
  if (q.vridning !== g || q.forklaring !== forklaringS(axlar, g)) fel.push(`${id}: SP-S5 förklaringen eller vridningen stämmer inte`);
  return fel;
}
