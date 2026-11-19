// scripts/spatial-verifiera.mjs
// =============================================================================
// Oberoende verifierare för Spatial förmåga (frågebanken 2026-11-19). Delar
// ingen kod med generatorn (scripts/lib/spatial/*.mjs) eller spärrarna. Den
// läser bara det som ritas för användaren (referens, sekvens, alternativ) och
// räknar fram rätt svar på egen hand:
//
//   A  brickfigur: referensens fyra vridningar räknas i figurens egen ram. Exakt
//      ett alternativ ska vara en vridning (90, 180 eller 270 grader), och det
//      ska stå på correctAnswer. Ett alternativ som är referensen ovriden, eller
//      en spegling som råkar vara en vridning, fälls.
//   B  pappersvikning, uppvikt: vikningarna läses ur de ritade viklinjerna och
//      pilarna. Varje originalruta följs genom vikningarna; hålen och klippet i
//      det stansade arket ger exakt vilka rutor som får hål. Exakt ett
//      alternativ ska stämma. Ett alternativ som är facit vridet eller
//      spegelvänt ger en varning: arket ligger still under vikningen, så det
//      är fel, men granskningen ska se det.
//   C  tärning: kubens tre synliga sidor och deras "upp" i 3D räknas ur
//      ritarens affina matriser (geometri.json). En kandidat är möjlig om någon
//      av kubens 24 vridningar (byggda genom kvartsvarv, inte tecken-
//      permutationer) visar dess sidor utan att motsäga referensen, och en dold
//      sida aldrig visar en symbol som redan syns. Exakt ett alternativ ska vara
//      möjligt.
//   D  pappersvikning, ihopvikt: arket i första rutan viks längs de ritade
//      linjerna. En ruta har papper om något lager har papper, ett hål eller
//      klipp syns bara genom alla lager. Exakt ett alternativ ska stämma, och
//      ingen distraktor får vara facit vridet i planet.
//
// Kör: node scripts/spatial-verifiera.mjs              (de tre bankerna)
//      node scripts/spatial-verifiera.mjs --version 3  (bara fran_version 3)
//      node scripts/spatial-verifiera.mjs <bank.json>
// Exit 1 vid fel. Varningar stoppar inte.
// =============================================================================

import { readFileSync } from 'node:fs';

const EPS = 1e-6;
const BANKER = ['bankGrund', 'bankAvancerad', 'bankExpert'].map((b) => `src/lib/spatialV1/${b}.json`);
const GEO = JSON.parse(readFileSync('src/lib/spatialV1/geometri.json', 'utf8'));

const k2 = (p) => `${p[0]},${p[1]}`;
const setNyckel = (rutor) => [...new Set((rutor ?? []).map(k2))].sort().join(' ');

// =============================================================================
// A: brickfigur
// =============================================================================

function brickNorm(cells, mark) {
  const r0 = Math.min(...cells.map((c) => c[0]));
  const c0 = Math.min(...cells.map((c) => c[1]));
  const ut = cells.map(([r, c]) => [r - r0, c - c0]);
  return { cells: ut, mark: mark ? [mark[0] - r0, mark[1] - c0] : null };
}
const brickKey = (f) => {
  const n = brickNorm(f.cells, f.mark);
  return setNyckel(n.cells) + (n.mark ? ` m${k2(n.mark)}` : '');
};
/** Ett kvarts varv medurs på skärmen (rad nedåt): (r, c) blir (c, H-1-r). */
function brickVrid(f) {
  const n = brickNorm(f.cells, f.mark);
  const H = Math.max(...n.cells.map((c) => c[0])) + 1;
  const g = ([r, c]) => [c, H - 1 - r];
  return { cells: n.cells.map(g), mark: n.mark ? g(n.mark) : null };
}
function brickSpegla(f) {
  const n = brickNorm(f.cells, f.mark);
  const W = Math.max(...n.cells.map((c) => c[1])) + 1;
  const g = ([r, c]) => [r, W - 1 - c];
  return { cells: n.cells.map(g), mark: n.mark ? g(n.mark) : null };
}
function brickLagen(f) {
  const vr = [f];
  for (let i = 0; i < 3; i++) vr.push(brickVrid(vr[vr.length - 1]));
  return vr;
}

function verifieraA(q) {
  const fel = [];
  const varn = [];
  const ref = { cells: q.referens.cells, mark: q.referens.mark };
  const lagen = brickLagen(ref).map(brickKey); // 0, 90, 180, 270 medurs
  const spegel = brickLagen(brickSpegla(ref)).map(brickKey);
  if (new Set(lagen).size !== 4) fel.push('referensen har vridningssymmetri, flera vridningar ser likadana ut');
  if (spegel.some((s) => lagen.includes(s))) fel.push('referensen är spegelsymmetrisk, en spegling är också en vridning');
  const alt = q.options.map((o) => brickKey({ cells: o.cells, mark: o.mark }));
  if (new Set(alt).size !== alt.length) fel.push('två alternativ är lika');
  const ratt = alt.map((a, i) => (lagen.slice(1).includes(a) ? i : -1)).filter((i) => i >= 0);
  if (ratt.length !== 1) fel.push(`${ratt.length} alternativ är vridningar av referensen, ska vara exakt ett`);
  else if (ratt[0] !== q.correctAnswer) fel.push(`facit står på ${q.correctAnswer + 1} men vridningen är alternativ ${ratt[0] + 1}`);
  alt.forEach((a, i) => {
    if (a === lagen[0]) fel.push(`alternativ ${i + 1} är referensen ovriden`);
  });
  // förklaringen ska nämna rätt vridning
  const g = lagen.indexOf(alt[q.correctAnswer]) * 90;
  const text = { 90: /90 grader medurs/, 180: /180 grader|halvt varv/, 270: /90 grader moturs/ }[g];
  if (text && !text.test(q.forklaring)) fel.push(`förklaringen nämner inte vridningen ${g} grader (${q.forklaring})`);
  // ramen
  for (const o of [q.referens, ...q.options]) {
    const n = brickNorm(o.cells, o.mark);
    const h = Math.max(...n.cells.map((c) => c[0])) + 1;
    const w = Math.max(...n.cells.map((c) => c[1])) + 1;
    if (h > o.n || w > o.n) fel.push(`en figur ryms inte i ${o.n}×${o.n}`);
    if (o.mark && !o.cells.some((c) => c[0] === o.mark[0] && c[1] === o.mark[1])) fel.push('den grå rutan ligger utanför figuren');
  }
  // de spegelvända distraktorerna ska vara speglingar (annars stämmer inte misstagstexten)
  q.options.forEach((o, i) => {
    if (i === q.correctAnswer) return;
    if (/Spegelvänd/.test(q.misstag[i] ?? '') && !spegel.includes(alt[i])) fel.push(`alternativ ${i + 1} kallas spegelvänt men är det inte`);
  });
  return { fel, varn };
}

// =============================================================================
// B och D: vikning
// =============================================================================

/** Vikningen som den är ritad: linjen ger axel och läge, pilen vilken sida som viks. */
function lasVikning(fig) {
  const [[x1, y1], [x2, y2]] = fig.linje;
  let v;
  if (Math.abs(x1 - x2) < EPS) v = { typ: 'v', k: x1 };
  else if (Math.abs(y1 - y2) < EPS) v = { typ: 'h', k: y1 };
  else {
    const lutning = (y2 - y1) / (x2 - x1);
    if (Math.abs(lutning - 1) < EPS) v = { typ: 'd', k: y1 - x1 };
    else if (Math.abs(lutning + 1) < EPS) v = { typ: 'a', k: y1 + x1 };
    else return null;
  }
  const s0 = sidaAv(v, fig.pil[0]);
  const s1 = sidaAv(v, fig.pil[1]);
  if (Math.abs(s0) < EPS || Math.sign(s0) === Math.sign(s1)) return null;
  v.flytt = Math.sign(s0);
  return v;
}
function sidaAv(v, [x, y]) {
  if (v.typ === 'v') return x - v.k;
  if (v.typ === 'h') return y - v.k;
  if (v.typ === 'd') return y - (x + v.k);
  return y - (v.k - x);
}
function spegelAv(v, [x, y]) {
  if (v.typ === 'v') return [2 * v.k - x, y];
  if (v.typ === 'h') return [x, 2 * v.k - y];
  // linjen y = x + k: (x, y) -> (y - k, x + k); linjen y = k - x: (x, y) -> (k - y, k - x)
  if (v.typ === 'd') return [y - v.k, x + v.k];
  return [v.k - y, v.k - x];
}

/**
 * Följer varje originalruta genom vikningarna. Returnerar per ruta dess läge
 * (rad, kolumn) efter varje vikning och om en viklinje gått genom den.
 */
function folj(n, vikningar) {
  const rutor = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) rutor.push({ orig: [r, c], mitt: [c + 0.5, r + 0.5], delad: false, lagen: [] });
  for (const [j, v] of vikningar.entries()) {
    for (const p of rutor) {
      const [x, y] = p.mitt;
      const horn = [[x - 0.5, y - 0.5], [x + 0.5, y - 0.5], [x + 0.5, y + 0.5], [x - 0.5, y + 0.5]].map((h) => sidaAv(v, h));
      if (Math.min(...horn) < -EPS && Math.max(...horn) > EPS) {
        // linjen går genom rutan; rutan vikts mot sig själv och ligger kvar
        if (!p.delad) p.deladVid = j;
        p.delad = true;
      } else if (Math.sign(sidaAv(v, p.mitt)) === v.flytt) {
        p.mitt = spegelAv(v, p.mitt);
      }
      p.lagen.push([Math.round(p.mitt[1] - 0.5), Math.round(p.mitt[0] - 0.5)]);
    }
  }
  return rutor;
}
const lageEfter = (p, j) => (j < 0 ? p.orig : p.lagen[j]);

/** Rutorna inne i en rektangulär eller konvex polygon (hela rutor), som ritaren ser regionen. */
function polyRutor(poly, n) {
  const ut = [];
  const inne = ([px, py]) => {
    let tecken = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const kr = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
      if (Math.abs(kr) < EPS) continue;
      if (tecken && Math.sign(kr) !== tecken) return false;
      tecken = Math.sign(kr);
    }
    return true;
  };
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if ([[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]].every(inne)) ut.push([r, c]);
  return ut;
}

/** Sekvensens vikrutor: läser vikningarna och jämför med q.vikningar och regionen före vikningen. */
function lasSekvens(q, fel) {
  const vik = [];
  const rutor = q.sekvens.filter((f) => f.kind === 'ark-vik');
  rutor.forEach((f, j) => {
    const v = lasVikning(f);
    if (!v) return fel.push(`ruta ${j + 1}: viklinjen eller pilen går inte att läsa`);
    // den grå delen ligger på den sida som viks
    if (f.rorlig.some((p) => sidaAv(v, p) * v.flytt < -EPS)) fel.push(`ruta ${j + 1}: den grå delen ligger inte på den sida pilen viker`);
    const lagrad = q.vikningar?.[j];
    if (lagrad && (lagrad.typ !== v.typ || Math.abs(lagrad.k - v.k) > EPS || lagrad.flytt !== v.flytt)) fel.push(`ruta ${j + 1}: ritad vikning ${JSON.stringify(v)} men uppgiften har ${JSON.stringify(lagrad)}`);
    vik.push(v);
  });
  return vik;
}

/** Regionen (rutor med papper) efter j vikningar enligt följningen. */
const regionEfter = (fold, j) => new Set(fold.filter((p) => !p.delad || p.deladVid > j).map((p) => k2(lageEfter(p, j))));

function kontrolleraRegioner(q, fold, n, fel) {
  q.sekvens.forEach((f, j) => {
    const vantad = regionEfter(fold, f.kind === 'ark-vik' ? j - 1 : fold[0].lagen.length - 1);
    const ritad = new Set(polyRutor(f.poly, n).map(k2));
    if (setNyckel([...vantad].map((s) => s.split(',').map(Number))) !== setNyckel([...ritad].map((s) => s.split(',').map(Number)))) fel.push(`ruta ${j + 1}: arkets läge stämmer inte med vikningarna`);
  });
}

// --- ark-ut (hela arket), varianter i arkets ram
const arkVrid = (rutor, n) => rutor.map(([r, c]) => [c, n - 1 - r]);
const arkSpegel = (rutor, n) => rutor.map(([r, c]) => [r, n - 1 - c]);
const utNyckel = (u) => `${setNyckel(u.hal)}|${setNyckel(u.klipp)}`;

function verifieraB(q) {
  const fel = [];
  const varn = [];
  const n = q.options[0].n;
  const vik = lasSekvens(q, fel);
  if (fel.length) return { fel, varn };
  const fold = folj(n, vik);
  kontrolleraRegioner(q, fold, n, fel);
  const stans = q.sekvens[q.sekvens.length - 1];
  if (stans.kind !== 'ark-stans') return { fel: [...fel, 'sista rutan är inte det stansade arket'], varn };
  const sist = vik.length - 1;
  const lagerVid = (pos) => fold.filter((p) => k2(lageEfter(p, sist)) === k2(pos));
  const genom = (rutor, vad) => {
    const ut = [];
    for (const pos of rutor) {
      const l = lagerVid(pos);
      if (!l.length) fel.push(`${vad} i ${k2(pos)} ligger utanför det vikta arket`);
      if (l.some((p) => p.delad)) fel.push(`${vad} i ${k2(pos)} går genom en ruta som en viklinje delar`);
      ut.push(...l.map((p) => p.orig));
    }
    return ut;
  };
  const facit = { hal: genom(stans.hal, 'hålet'), klipp: genom(stans.klipp ?? [], 'klippet') };
  const fk = utNyckel(facit);
  const alt = q.options.map((o) => utNyckel({ hal: o.hal, klipp: o.klipp ?? [] }));
  const ratt = alt.map((a, i) => (a === fk ? i : -1)).filter((i) => i >= 0);
  if (ratt.length !== 1) fel.push(`${ratt.length} alternativ stämmer med uppvikningen, ska vara exakt ett`);
  else if (ratt[0] !== q.correctAnswer) fel.push(`facit står på ${q.correctAnswer + 1} men uppvikningen ger alternativ ${ratt[0] + 1}`);
  // ingen distraktor är facit vridet (fel) eller spegelvänt (varning)
  let v = facit;
  const vridna = [];
  for (let i = 0; i < 3; i++) {
    v = { hal: arkVrid(v.hal, n), klipp: arkVrid(v.klipp, n) };
    vridna.push(utNyckel(v));
  }
  const speglade = [];
  let s = { hal: arkSpegel(facit.hal, n), klipp: arkSpegel(facit.klipp, n) };
  for (let i = 0; i < 4; i++) {
    speglade.push(utNyckel(s));
    s = { hal: arkVrid(s.hal, n), klipp: arkVrid(s.klipp, n) };
  }
  alt.forEach((a, i) => {
    if (i === q.correctAnswer) return;
    // arket ligger still och viklinjen är ritad, så ett vridet mönster är fel men liknar facit: varning till granskningen
    if (vridna.includes(a)) varn.push(`alternativ ${i + 1} är facit vridet i planet (arket ligger still, så det är fel)`);
    else if (speglade.includes(a)) varn.push(`alternativ ${i + 1} är facit spegelvänt (arket sett från baksidan)`);
  });
  // genomgången slutar i facit
  const sistUpp = q.uppvikning?.at(-1);
  if (sistUpp && utNyckel({ hal: sistUpp.hal, klipp: sistUpp.klipp ?? [] }) !== fk) fel.push('genomgångens uppvikta ark är inte facit');
  return { fel, varn };
}

// --- ark-stans (vikt ark), jämfört i sin egen ram som ritaren centrerar
function stansNorm(fig, n) {
  const reg = polyRutor(fig.poly, n);
  const r0 = Math.min(...reg.map((x) => x[0]));
  const c0 = Math.min(...reg.map((x) => x[1]));
  const H = Math.max(...reg.map((x) => x[0])) - r0 + 1;
  const W = Math.max(...reg.map((x) => x[1])) - c0 + 1;
  const f = ([r, c]) => [r - r0, c - c0];
  return { H, W, hal: fig.hal.map(f), klipp: (fig.klipp ?? []).map(f) };
}
const normNyckel = (m) => `${m.H}x${m.W}|${setNyckel(m.hal)}|${setNyckel(m.klipp)}`;
const normVrid = (m) => ({ H: m.W, W: m.H, hal: m.hal.map(([r, c]) => [c, m.H - 1 - r]), klipp: m.klipp.map(([r, c]) => [c, m.H - 1 - r]) });
const normSpegel = (m) => ({ ...m, hal: m.hal.map(([r, c]) => [r, m.W - 1 - c]), klipp: m.klipp.map(([r, c]) => [r, m.W - 1 - c]) });

function verifieraD(q) {
  const fel = [];
  const varn = [];
  const n = q.sekvens[0].n;
  const vik = lasSekvens(q, fel);
  if (fel.length) return { fel, varn };
  const fold = folj(n, vik);
  kontrolleraRegioner(q, fold, n, fel);
  if (fold.some((p) => p.delad)) fel.push('en viklinje går genom en ruta');
  // arket som det visas i första rutan
  const f0 = q.sekvens[0];
  const hal = new Set((f0.hal ?? []).map(k2));
  const klipp = new Set((f0.klipp ?? []).map(k2));
  if ([...hal].some((h) => klipp.has(h))) fel.push('hål och klipp i samma ruta');
  const tillstand = (p) => (klipp.has(k2(p.orig)) ? 'borta' : hal.has(k2(p.orig)) ? 'hal' : 'hel');
  const sist = vik.length - 1;
  const lagen = new Map();
  for (const p of fold) {
    const k = k2(lageEfter(p, sist));
    if (!lagen.has(k)) lagen.set(k, []);
    lagen.get(k).push(tillstand(p));
  }
  const fHal = [];
  const fKlipp = [];
  for (const [k, l] of lagen) {
    const pos = k.split(',').map(Number);
    if (l.includes('hel')) continue;
    if (l.includes('hal')) fHal.push(pos);
    else fKlipp.push(pos);
  }
  const facit = q.options[q.correctAnswer];
  // exakt läge: facit ska vara det vikta arket där det ligger
  const reg = polyRutor(facit.poly, n);
  if (setNyckel(reg) !== setNyckel([...lagen.keys()].map((s) => s.split(',').map(Number)))) fel.push('facits kontur stämmer inte med det vikta arket');
  if (setNyckel(facit.hal) !== setNyckel(fHal) || setNyckel(facit.klipp ?? []) !== setNyckel(fKlipp)) fel.push(`facit stämmer inte med vikningen (räknat: hål ${setNyckel(fHal)}, klipp ${setNyckel(fKlipp)})`);
  // jämförelse i figurens egen ram (ritaren centrerar regionen)
  const ratt = { H: 0, W: 0, hal: fHal, klipp: fKlipp };
  const rn = (() => {
    const r0 = Math.min(...[...lagen.keys()].map((s) => +s.split(',')[0]));
    const c0 = Math.min(...[...lagen.keys()].map((s) => +s.split(',')[1]));
    const rader = [...lagen.keys()].map((s) => +s.split(',')[0]);
    const kol = [...lagen.keys()].map((s) => +s.split(',')[1]);
    return { H: Math.max(...rader) - r0 + 1, W: Math.max(...kol) - c0 + 1, hal: ratt.hal.map(([r, c]) => [r - r0, c - c0]), klipp: ratt.klipp.map(([r, c]) => [r - r0, c - c0]) };
  })();
  const rk = normNyckel(rn);
  const alt = q.options.map((o) => normNyckel(stansNorm(o, n)));
  const ratta = alt.map((a, i) => (a === rk ? i : -1)).filter((i) => i >= 0);
  if (ratta.length !== 1) fel.push(`${ratta.length} alternativ ser ut som det vikta arket, ska vara exakt ett`);
  else if (ratta[0] !== q.correctAnswer) fel.push(`facit står på ${q.correctAnswer + 1} men vikningen ger alternativ ${ratta[0] + 1}`);
  const vridna = [];
  let v = rn;
  for (let i = 0; i < 3; i++) {
    v = normVrid(v);
    vridna.push(normNyckel(v));
  }
  const speglade = [normNyckel(normSpegel(rn)), normNyckel(normVrid(normVrid(normSpegel(rn))))];
  if (speglade.includes(rk)) fel.push('facit är spegelsymmetriskt, den spegelvända distraktorn blir också rätt');
  alt.forEach((a, i) => {
    if (i !== q.correctAnswer && vridna.includes(a)) fel.push(`alternativ ${i + 1} är facit vridet i planet`);
  });
  // genomgången slutar i facit
  const sistH = q.hopvikning?.at(-1);
  if (sistH && normNyckel(stansNorm(sistH, n)) !== rk) fel.push('genomgångens sista steg är inte facit');
  if (q.hopvikning?.[0] && (setNyckel(q.hopvikning[0].hal) !== setNyckel(f0.hal) || setNyckel(q.hopvikning[0].klipp) !== setNyckel(f0.klipp))) fel.push('genomgångens första steg är inte arket');
  return { fel, varn };
}

// =============================================================================
// C: tärning
// =============================================================================

// 3D-axlar ur ritningen: kubens främre övre hörn är T[0]. Kanterna därifrån går
// till T[1] (axeln A), T[3] (axeln B) och nedåt längs L[1]-L[2] (minus H).
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const O = GEO.kub.T[0];
const SKARM = { A: sub(GEO.kub.T[1], O), B: sub(GEO.kub.T[3], O), H: sub(O, GEO.kub.L[2]) };
const AX = { A: [1, 0, 0], B: [0, 1, 0], H: [0, 0, 1] };
const add3 = (a, b) => a.map((x, i) => x + b[i]);
const mul3 = (a, s) => a.map((x) => x * s);
const eq3 = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < EPS);

/** Skärmvektorn w uttryckt i två av axlarna (sidans plan). */
function iPlanet(w, [p, q]) {
  const [a, b] = [SKARM[p], SKARM[q]];
  const det = a[0] * b[1] - a[1] * b[0];
  const s = (w[0] * b[1] - w[1] * b[0]) / det;
  const t = (a[0] * w[1] - a[1] * w[0]) / det;
  const v = add3(mul3(AX[p], s), mul3(AX[q], t));
  // normera till en enhetsaxel
  return v.map((x) => Math.round(x / Math.max(...v.map(Math.abs))));
}

// Sidorna: ovansidan ligger i A-B-planet, vänster sida i B-H-planet, höger i A-H-planet.
// Utåtnormalen: ovansidan +H; vänster sida är sidan mot T[3]-kanten, alltså bort från A (−A); höger −B.
const SIDA3D = (() => {
  const plan = { t: ['A', 'B'], l: ['B', 'H'], r: ['A', 'H'] };
  const normal = { t: [0, 0, 1], l: [-1, 0, 0], r: [0, -1, 0] };
  const ut = {};
  for (const s of ['t', 'l', 'r']) {
    const m = GEO.kub.matris[s];
    const x = iPlanet([m[0], m[1]], plan[s]); // lokal x (höger)
    const y = iPlanet([m[2], m[3]], plan[s]); // lokal y (nedåt)
    ut[s] = { n: normal[s], x, y };
  }
  return ut;
})();

/** Symbolens upp i 3D: lokal (0, −1) vriden riktning kvarts varv medurs (ritarens vrid: (x, y) -> (−y, x)). */
function upp3D(sida, riktning) {
  let [x, y] = [0, -1];
  for (let i = 0; i < riktning; i++) [x, y] = [-y, x];
  const S = SIDA3D[sida];
  return add3(mul3(S.x, x), mul3(S.y, y));
}

const RIKTADE_C = new Set(['triangel', 'pil']); // symmetriska kring sin egen upp-axel, inget annat
const ROTERAR = new Set(['prick', 'ring', 'dubbelring', 'kvadrat', 'fkvadrat', 'stjarna', 'kryss']); // ser likadana ut efter ett kvarts varv

// De 24 vridningarna, byggda genom kvartsvarv kring axlarna (sluten mängd).
const matMul = (M, N) => M.map((rad) => [0, 1, 2].map((j) => rad[0] * N[0][j] + rad[1] * N[1][j] + rad[2] * N[2][j]));
const matVec = (M, v) => M.map((rad) => rad[0] * v[0] + rad[1] * v[1] + rad[2] * v[2]);
const VRID24 = (() => {
  const gen = [
    [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    [[0, 0, 1], [0, 1, 0], [-1, 0, 0]],
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  ];
  const sedda = new Map([[JSON.stringify([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), [[1, 0, 0], [0, 1, 0], [0, 0, 1]]]]);
  const ko = [...sedda.values()];
  while (ko.length) {
    const M = ko.pop();
    for (const G of gen) {
      const N = matMul(G, M);
      const k = JSON.stringify(N.map((r) => r.map((x) => x + 0)));
      if (!sedda.has(k)) {
        sedda.set(k, N);
        ko.push(N);
      }
    }
  }
  return [...sedda.values()];
})();

/**
 * Kan kandidaten vara referenskuben? Referensen är en kub med kända sidor i
 * riktningarna n(t), n(l), n(r). Kuben vrids med R: kandidatens synliga sida p
 * kommer från kroppens riktning R⁻¹ n(p).
 */
function mojlig(ref, kand) {
  const kanda = ['t', 'l', 'r'].map((s) => ({ n: SIDA3D[s].n, symbol: ref[s].symbol, upp: upp3D(s, ref[s].riktning) }));
  const refSym = new Set(kanda.map((k) => k.symbol));
  for (const R of VRID24) {
    const Rt = [0, 1, 2].map((i) => [0, 1, 2].map((j) => R[j][i]));
    let ok = true;
    for (const p of ['t', 'l', 'r']) {
      const kropp = matVec(Rt, SIDA3D[p].n);
      const kand3 = kand[p];
      const kand_ = kanda.find((k) => eq3(k.n, kropp));
      if (kand_) {
        if (kand_.symbol !== kand3.symbol) ok = false;
        else if (RIKTADE_C.has(kand3.symbol) && !eq3(matVec(Rt, upp3D(p, kand3.riktning)), kand_.upp)) ok = false;
      } else if (refSym.has(kand3.symbol)) ok = false; // dold sida kan inte visa en symbol som redan syns
      if (!ok) break;
    }
    if (ok) return true;
  }
  return false;
}

function verifieraC(q) {
  const fel = [];
  const varn = [];
  const ref = q.referens;
  for (const v of [ref, ...q.options]) {
    const sym = ['t', 'l', 'r'].map((s) => v[s].symbol);
    if (new Set(sym).size !== 3) fel.push('en tärning visar samma symbol två gånger');
    for (const s of ['t', 'l', 'r']) if (!RIKTADE_C.has(v[s].symbol) && !ROTERAR.has(v[s].symbol)) fel.push(`okänd symbol ${v[s].symbol}`);
  }
  const mojliga = q.options.map((o) => mojlig(ref, o));
  const ratt = mojliga.map((m, i) => (m ? i : -1)).filter((i) => i >= 0);
  if (ratt.length !== 1) fel.push(`${ratt.length} alternativ kan vara samma tärning, ska vara exakt ett`);
  else if (ratt[0] !== q.correctAnswer) fel.push(`facit står på ${q.correctAnswer + 1} men tärningen som går ihop är alternativ ${ratt[0] + 1}`);
  // två alternativ som är samma vy
  const vyK = (v) => ['t', 'l', 'r'].map((s) => `${v[s].symbol}${RIKTADE_C.has(v[s].symbol) ? v[s].riktning : ''}`).join('|');
  if (new Set(q.options.map(vyK)).size !== 4) fel.push('två alternativ är lika');
  if (q.options.some((o) => vyK(o) === vyK(ref))) fel.push('ett alternativ är referensen ovriden');
  return { fel, varn };
}

// =============================================================================

const VERIFIERA = { A: verifieraA, B: verifieraB, C: verifieraC, D: verifieraD };

export function verifieraFraga(q) {
  const ut = { fel: [], varn: [] };
  if (q.options?.length !== 4) ut.fel.push(`${q.options?.length} alternativ`);
  if (!(q.correctAnswer >= 0 && q.correctAnswer < 4)) ut.fel.push('facit utanför alternativen');
  const f = VERIFIERA[q.form];
  if (!f) ut.fel.push(`okänd form ${q.form}`);
  else {
    try {
      const r = f(q);
      ut.fel.push(...r.fel);
      ut.varn.push(...r.varn);
    } catch (e) {
      ut.fel.push(`verifieraren kraschade: ${e.message}`);
    }
  }
  return ut;
}

// =============================================================================
// Symmetrikanonisk nyckel: samma uppgift vriden eller speglad ger samma nyckel
// =============================================================================

/** Kvadratens åtta symmetrier som punktavbildningar på arket [0, n]². */
const SYMMETRIER = [
  (x, y, n) => [x, y],
  (x, y, n) => [n - x, y],
  (x, y, n) => [x, n - y],
  (x, y, n) => [n - x, n - y],
  (x, y, n) => [y, x],
  (x, y, n) => [n - y, x],
  (x, y, n) => [y, n - x],
  (x, y, n) => [n - y, n - x],
];
const rutaUnder = (g, [r, c], n) => {
  const [x, y] = g(c + 0.5, r + 0.5, n);
  return [Math.round(y - 0.5), Math.round(x - 0.5)];
};
const punktUnder = (g, [x, y], n) => g(x, y, n);

/** B och D: vikningarna (som de ritas) och hålen och klippen, under alla åtta symmetrier; minsta strängen. */
function vikKanon(q) {
  const n = (q.sekvens[0] ?? q.options[0]).n;
  const vikrutor = q.sekvens.filter((f) => f.kind === 'ark-vik');
  const rutor = q.form === 'B' ? q.sekvens.at(-1) : q.sekvens[0];
  const nycklar = SYMMETRIER.map((g) => {
    const vik = vikrutor.map((f) => {
      const v = lasVikning({ linje: f.linje.map((p) => punktUnder(g, p, n)), pil: f.pil.map((p) => punktUnder(g, p, n)) });
      return v ? `${v.typ}${v.k}${v.flytt > 0 ? '+' : '-'}` : '?';
    });
    const hal = setNyckel((rutor.hal ?? []).map((c) => rutaUnder(g, c, n)));
    const klipp = setNyckel((rutor.klipp ?? []).map((c) => rutaUnder(g, c, n)));
    return `${vik.join('>')}|${hal}|${klipp}`;
  });
  return nycklar.sort()[0];
}

/** A: referensen och facit under samma symmetri (vridning eller spegling av hela uppgiften). */
function brickKanon(q) {
  const ref = { cells: q.referens.cells, mark: q.referens.mark };
  const fac = q.options[q.correctAnswer];
  const fa = { cells: fac.cells, mark: fac.mark };
  const lagen = (f) => [...brickLagen(f), ...brickLagen(brickSpegla(f))];
  const r8 = lagen(ref);
  const f8 = lagen(fa);
  return r8.map((r, i) => `${brickKey(r)}#${brickKey(f8[i])}`).sort()[0];
}

/** C: tärningen ritas alltid från samma hörn, så referensen och facit som de är. */
const vyText = (v) => ['t', 'l', 'r'].map((s) => `${v[s].symbol}${RIKTADE_C.has(v[s].symbol) ? v[s].riktning : ''}`).join('|');
const kubKanon = (q) => `${vyText(q.referens)}#${vyText(q.options[q.correctAnswer])}`;

export function kanoniskNyckel(q) {
  if (q.form === 'A') return `A:${brickKanon(q)}`;
  if (q.form === 'C') return `C:${kubKanon(q)}`;
  return `${q.form}:${vikKanon(q)}`;
}

/**
 * Par av uppgifter på samma nivå som är samma uppgift vriden eller speglad.
 * Fel när en uppgift i paret har fran_version 3 eller senare, varning när båda
 * är äldre. Grund B är undantagen (fel blir varning): formen har bara 32 uppgifter.
 */
export function dubbletter(fragor) {
  const fel = [];
  const varn = [];
  const sedda = new Map();
  for (const q of fragor) {
    const k = `${q.niva}:${kanoniskNyckel(q)}`;
    const forra = sedda.get(k);
    if (!forra) {
      sedda.set(k, q);
      continue;
    }
    const text = `${q.id}: samma uppgift som ${forra.id}, vriden eller speglad`;
    const ny = q.fran_version >= 3 || forra.fran_version >= 3;
    if (ny && !(q.niva === 'grund' && q.form === 'B')) fel.push(text);
    else varn.push(text);
  }
  return { fel, varn };
}

export function verifieraBanker(filer = BANKER, { version } = {}) {
  const res = { antal: 0, fel: [], varn: [] };
  const alla = [];
  for (const fil of filer) {
    for (const q of JSON.parse(readFileSync(fil, 'utf8'))) {
      alla.push(q);
      if (version && q.fran_version !== version) continue;
      res.antal++;
      const r = verifieraFraga(q);
      res.fel.push(...r.fel.map((x) => `${q.id}: ${x}`));
      res.varn.push(...r.varn.map((x) => `${q.id}: ${x}`));
    }
  }
  const d = dubbletter(alla);
  const iUrval = (t) => !version || alla.some((q) => q.fran_version === version && t.startsWith(`${q.id}:`));
  res.fel.push(...d.fel.filter(iUrval));
  res.varn.push(...d.varn.filter(iUrval));
  return res;
}

export { SIDA3D, VRID24 };

if (process.argv[1]?.endsWith('spatial-verifiera.mjs')) {
  const arg = process.argv.slice(2);
  const version = arg.includes('--version') ? Number(arg[arg.indexOf('--version') + 1]) : undefined;
  const filer = arg.filter((a) => a.endsWith('.json'));
  const res = verifieraBanker(filer.length ? filer : BANKER, { version });
  for (const f of res.fel) console.log('FEL', f);
  for (const v of res.varn) console.log('varning', v);
  console.log(`${res.antal} uppgifter, ${res.fel.length} fel, ${res.varn.length} varningar`);
  process.exit(res.fel.length ? 1 : 0);
}
