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
// Nya uppgiftstyper från omgång 3 (fran_version 5), läses också ur det som ritas:
//   A med spegellinjer (referens.axlar): referensen speglas i linjerna i tur
//      och ordning. Exakt ett alternativ ska vara resultatet, frågan ska nämna
//      linjerna i den ordningen och förklaringen vridningen de blir.
//   C med kropp (referens.kind 'kropp'): kolumnerna sorteras efter var de
//      hamnar på skärmen sett från pilens sida, och facit är den högsta stapeln
//      per kolumn (vy) eller staplarna i den rad snittlinjen går genom (snitt).
//      Teckningen ska gå att lita på: varje kropp på plattan som ritas likadant
//      (räknat med ett djupbuffer på isometrins triangelnät, inte med
//      ritarens målarordning) ska ge samma facit.
//
// Kopiespärren (dubbletter, längst ned): samma uppgift vriden eller speglad.
// Från omgång 2 (fran_version 4) gäller den mot alla banker och nivåer, och
// tärningar jämförs också med hörnet vridet ett tredjedels varv eller speglat.
//
// Kör: node scripts/spatial-verifiera.mjs              (de tre bankerna)
//      node scripts/spatial-verifiera.mjs --version 4  (bara fran_version 4, eller 5)
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

/** Spegling i en linje genom figurens mitt, i figurens egen ram: lodrät, vågrät, sned från övre vänstra hörnet, sned från övre högra. */
function brickSpeglaI(f, axel) {
  const n = brickNorm(f.cells, f.mark);
  const H = Math.max(...n.cells.map((c) => c[0])) + 1;
  const W = Math.max(...n.cells.map((c) => c[1])) + 1;
  const g = { v: ([r, c]) => [r, W - 1 - c], h: ([r, c]) => [H - 1 - r, c], d: ([r, c]) => [c, r], a: ([r, c]) => [W - 1 - c, H - 1 - r] }[axel];
  return { cells: n.cells.map(g), mark: n.mark ? g(n.mark) : null };
}
const AXELORD = { v: 'lodräta', h: 'vågräta', d: 'sneda', a: 'sneda' };

function verifieraSpegling(q) {
  const fel = [];
  const varn = [];
  const axlar = q.referens.axlar;
  const ref = { cells: q.referens.cells, mark: q.referens.mark };
  if (axlar.length !== 2 || axlar.some((a) => !AXELORD[a])) return { fel: ['spegellinjerna går inte att läsa'], varn };
  const atta = [...brickLagen(ref), ...brickLagen(brickSpegla(ref))].map(brickKey);
  if (new Set(atta).size !== 8) fel.push('referensen har en symmetri, två alternativ kan se likadana ut');
  const facit = brickKey(axlar.reduce((f, a) => brickSpeglaI(f, a), ref));
  const alt = q.options.map((o) => brickKey({ cells: o.cells, mark: o.mark }));
  if (new Set(alt).size !== alt.length) fel.push('två alternativ är lika');
  const ratt = alt.map((a, i) => (a === facit ? i : -1)).filter((i) => i >= 0);
  if (ratt.length !== 1) fel.push(`${ratt.length} alternativ är figuren speglad i linjerna, ska vara exakt ett`);
  else if (ratt[0] !== q.correctAnswer) fel.push(`facit står på ${q.correctAnswer + 1} men speglingen är alternativ ${ratt[0] + 1}`);
  if (alt.includes(brickKey(ref))) fel.push('ett alternativ är referensen orörd');
  // ingen genväg: minst en distraktor är också en vridning
  const lagen = brickLagen(ref).map(brickKey);
  if (alt.filter((a, i) => i !== q.correctAnswer && lagen.slice(1).includes(a)).length < 1) fel.push('ingen distraktor är en vridning, facit går att hitta utan att spegla');
  // frågan nämner linjerna i ordning, förklaringen vridningen
  const fraga = new RegExp(`först i den ${AXELORD[axlar[0]]} linjen och sedan i den ${AXELORD[axlar[1]]}`);
  if (!fraga.test(q.fraga)) fel.push(`frågan nämner inte linjerna i ordningen ${axlar.join(', ')}`);
  if (axlar[0] === axlar[1] || (AXELORD[axlar[0]] === 'sneda' && AXELORD[axlar[1]] === 'sneda')) fel.push('två linjer med samma namn i frågan');
  const g = lagen.indexOf(facit) * 90;
  const text = { 90: /90 grader medurs/, 180: /180 grader|halvt varv/, 270: /90 grader moturs/ }[g];
  if (!text) fel.push('facit är ingen vridning av referensen');
  else if (!text.test(q.forklaring)) fel.push(`förklaringen nämner inte vridningen ${g} grader`);
  for (const o of [q.referens, ...q.options]) {
    const n = brickNorm(o.cells, o.mark);
    if (Math.max(...n.cells.map((c) => c[0])) + 1 > o.n || Math.max(...n.cells.map((c) => c[1])) + 1 > o.n) fel.push(`en figur ryms inte i ${o.n}×${o.n}`);
  }
  if (q.options.some((o) => o.axlar)) fel.push('ett alternativ har spegellinjer');
  return { fel, varn };
}

function verifieraA(q) {
  if (q.referens.axlar) return verifieraSpegling(q);
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

// --- kroppar (omgång 3)
const KN = 3;
const KH = 3;
/** Skärmläget (isometrin, kanten 1): x snett ned åt höger, y snett ned åt vänster, z upp. */
const kSkarm = ([x, y, z]) => [(x - y) * Math.sqrt(3) / 2, (x + y) / 2 - z];
/**
 * Kolumnerna sedda från pilens sida, från vänster till höger på skärmen.
 * Sidorna pilen tittar på: 'l' de grå med normalen +y, 'r' de vita med +x.
 * Varje kolumn är rutorna med samma läge längs sidans bredd.
 */
function kKolumner(blick) {
  const kol = [];
  for (let i = 0; i < KN; i++) {
    const rutor = [];
    for (let j = 0; j < KN; j++) rutor.push(blick === 'l' ? [i, j] : [j, i]); // [x, y]
    // kolumnens läge på skärmen: mitten av dess främre sida
    const fram = blick === 'l' ? [i + 0.5, KN, 0] : [KN, i + 0.5, 0];
    kol.push({ rutor, sx: kSkarm(fram)[0] });
  }
  return kol.sort((a, b) => a.sx - b.sx).map((k) => k.rutor);
}
const kHojd = (h, [x, y]) => h[y][x];
function kFacit(h, blick, snitt) {
  return kKolumner(blick).map((rutor) => {
    if (snitt === undefined) return Math.max(...rutor.map((r) => kHojd(h, r)));
    const rad = rutor.find(([x, y]) => (blick === 'l' ? y : x) === snitt);
    return kHojd(h, rad);
  });
}
/** Ett alternativ (brickfigur) som stapelprofil: höjden per kolumn från botten, null om det inte är staplar. */
function kProfil(o) {
  const n = brickNorm(o.cells, null);
  const H = Math.max(...n.cells.map((c) => c[0])) + 1;
  const W = Math.max(...n.cells.map((c) => c[1])) + 1;
  const p = [];
  for (let c = 0; c < W; c++) {
    const rader = n.cells.filter((x) => x[1] === c).map((x) => x[0]).sort((a, b) => a - b);
    if (!rader.length || rader.at(-1) !== H - 1 || rader.some((r, i) => i && r !== rader[i - 1] + 1)) return null;
    p.push(rader.length);
  }
  return p;
}
/**
 * Bilden med djupbuffer: varje kubsida (och plattans rutor) delas i sina två
 * trianglar på skärmen, och triangeln får den sida vars punkt ligger närmast
 * betraktaren (störst x + y + z i triangelns tyngdpunkt). Sidor mellan två
 * kuber ritas inte (de syns aldrig och ritaren hoppar över dem).
 */
function kBild(h) {
  const buf = new Map();
  const uv = ([x, y, z]) => [x - y, x + y - 2 * z];
  const sida = (horn, typ) => {
    const s = horn.map(uv);
    // diagonalen som är lodrät på skärmen delar romben i två trianglar
    const [i, j] = s[0][0] === s[2][0] ? [0, 2] : [1, 3];
    const andra = [0, 1, 2, 3].filter((k) => k !== i && k !== j);
    const mitt = s.reduce((a, b) => [a[0] + b[0] / 4, a[1] + b[1] / 4], [0, 0]);
    const lab = `${typ}${mitt[0]},${mitt[1]}`;
    for (const k of andra) {
      const t = [i, j, k];
      const c2 = t.reduce((a, q) => [a[0] + s[q][0], a[1] + s[q][1]], [0, 0]);
      const c3 = t.reduce((a, q) => a + horn[q][0] + horn[q][1] + horn[q][2], 0) / 3;
      const nyck = `${c2[0]},${c2[1]}`;
      const f = buf.get(nyck);
      if (!f || f.d < c3 - 1e-9) buf.set(nyck, { d: c3, lab });
    }
  };
  const H = (x, y) => (x >= 0 && y >= 0 && x < KN && y < KN ? h[y][x] : 0);
  for (let y = 0; y < KN; y++)
    for (let x = 0; x < KN; x++) {
      sida([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]], 'golv');
      for (let z = 0; z < h[y][x]; z++) {
        if (z === h[y][x] - 1) sida([[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], 'topp');
        if (H(x, y + 1) <= z) sida([[x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z], [x, y + 1, z]], 'gra');
        if (H(x + 1, y) <= z) sida([[x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z], [x + 1, y, z]], 'vit');
      }
    }
  return [...buf.entries()].map(([k, v]) => `${k}:${v.lab}`).sort().join('|');
}
let K_BILDER = null;
/** Alla kroppar på plattan (staplar 0 till 3) grupperade efter bild. Räknas en gång per körning. */
function kGrupp(h) {
  if (!K_BILDER) {
    K_BILDER = new Map();
    for (let i = 0; i < (KH + 1) ** (KN * KN); i++) {
      const b = [];
      let t = i;
      for (let y = 0; y < KN; y++) {
        b.push([]);
        for (let x = 0; x < KN; x++) {
          b[y].push(t % (KH + 1));
          t = Math.floor(t / (KH + 1));
        }
      }
      const k = kBild(b);
      if (!K_BILDER.has(k)) K_BILDER.set(k, []);
      K_BILDER.get(k).push(b);
    }
  }
  return K_BILDER.get(kBild(h)) ?? [];
}

function verifieraKropp(q) {
  const fel = [];
  const varn = [];
  const ref = q.referens;
  const { h, blick, snitt } = ref;
  if (h?.length !== KN || h.some((r) => r.length !== KN || r.some((x) => !Number.isInteger(x) || x < 0 || x > KH))) return { fel: ['kroppen är inte staplar 0 till 3 på en 3×3-platta'], varn };
  if (blick !== 'l' && blick !== 'r') return { fel: ['pilen går inte att läsa'], varn };
  if (snitt !== undefined && !(Number.isInteger(snitt) && snitt >= 0 && snitt < KN)) return { fel: ['snittet ligger utanför plattan'], varn };
  const facit = kFacit(h, blick, snitt);
  if (facit.some((x) => x < 1)) fel.push('facit har en tom kolumn, brickan tappar sitt läge i sidled');
  // teckningen: varje kropp som ritas likadant ger samma facit
  const grupp = kGrupp(h);
  if (!grupp.some((b) => JSON.stringify(b) === JSON.stringify(h))) fel.push('kroppen finns inte bland sina egna bilder');
  const andra = grupp.filter((b) => kFacit(b, blick, snitt).join() !== facit.join());
  if (andra.length) fel.push(`${andra.length} andra kroppar ritas likadant men ger ett annat facit`);
  const prof = q.options.map(kProfil);
  if (prof.some((p) => !p)) fel.push('ett alternativ är inte staplar från botten');
  const nyck = prof.map((p) => (p ? p.join() : '?'));
  if (new Set(nyck).size !== 4) fel.push('två alternativ är lika');
  const ratt = nyck.map((n, i) => (n === facit.join() ? i : -1)).filter((i) => i >= 0);
  if (ratt.length !== 1) fel.push(`${ratt.length} alternativ stämmer med kroppen, ska vara exakt ett`);
  else if (ratt[0] !== q.correctAnswer) fel.push(`facit står på ${q.correctAnswer + 1} men kroppen ger alternativ ${ratt[0] + 1}`);
  // facit med färre kolumner kan inte placeras i sidled; spegelsymmetriskt facit gör "bakifrån" rätt
  if (prof.some((p) => p && p.length !== KN)) fel.push('ett alternativ är inte tre kolumner brett');
  if (facit.join() === [...facit].reverse().join()) fel.push('facit är spegelsymmetriskt');
  // texten: frågan följer typen, förklaringen nämner facit från vänster
  if (snitt === undefined ? !/från pilens håll/.test(q.fraga) || /snitt/.test(q.fraga) : !/streckade linjen/.test(q.fraga) || !/snittytan/.test(q.fraga)) fel.push('frågan passar inte uppgiften');
  if (!q.forklaring.includes(`${facit[0]}, ${facit[1]} och ${facit[2]}`)) fel.push(`förklaringen nämner inte ${facit.join(', ')}`);
  return { fel, varn };
}

function verifieraC(q) {
  if (q.referens?.kind === 'kropp') return verifieraKropp(q);
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

/**
 * C: tärningen ritas alltid från samma hörn. Hörnet går ändå att vrida i sig
 * självt: ett tredjedels varv runt hörnets diagonal flyttar ovansidan till
 * vänster sida, vänster till höger och höger till ovansidan, och en spegling
 * byter vänster mot höger. En uppgift som bara skiljer sig så (samma tärning,
 * samma vridning, annan startvridning) är en kopia (2026-11-19, omgång 2).
 * Avbildningarna är de sex teckenpermutationer som för de synliga sidornas
 * normaler på varandra; symbolernas upp-vektor följer med i 3D.
 */
const HORN = (() => {
  const ut = [];
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const synliga = ['t', 'l', 'r'];
  for (const p of perms)
    for (let s = 0; s < 8; s++) {
      const M = [0, 1, 2].map((i) => [0, 1, 2].map((j) => (j === p[i] ? (s & (1 << i) ? -1 : 1) : 0)));
      const till = {};
      for (const x of synliga) {
        const bild = matVec(M, SIDA3D[x].n);
        const y = synliga.find((z) => eq3(SIDA3D[z].n, bild));
        if (!y) break;
        till[x] = y;
      }
      if (Object.keys(till).length === 3) ut.push({ M, till });
    }
  return ut;
})();
function hornAvbild({ M, till }, v) {
  const ut = {};
  for (const x of ['t', 'l', 'r']) {
    const { symbol, riktning } = v[x];
    const y = till[x];
    if (!RIKTADE_C.has(symbol)) {
      ut[y] = { symbol, riktning: 0 };
      continue;
    }
    const upp = matVec(M, upp3D(x, riktning));
    const r = [0, 1, 2, 3].find((k) => eq3(upp3D(y, k), upp));
    if (r === undefined) throw new Error('hörnavbildningen gav en riktning utanför sidan');
    ut[y] = { symbol, riktning: r };
  }
  return ut;
}
/** Uppgiften C avbildad med hörnets symmetri h (referens och alternativ). För test och nyckel. */
export function hornUppgift(q, i) {
  const h = HORN[i];
  const fig = (v) => ({ ...v, ...hornAvbild(h, v) });
  return { ...q, referens: fig(q.referens), options: q.options.map(fig) };
}
export const HORN_ANTAL = () => HORN.length;
const vyText = (v) => ['t', 'l', 'r'].map((s) => `${v[s].symbol}${RIKTADE_C.has(v[s].symbol) ? v[s].riktning : ''}`).join('|');
/** Nyckeln före omgång 2: referensen och facit som de är ritade. */
const kubKanonRitad = (q) => `${vyText(q.referens)}#${vyText(q.options[q.correctAnswer])}`;
const kubKanon = (q) => HORN.map((h) => `${vyText(hornAvbild(h, q.referens))}#${vyText(hornAvbild(h, q.options[q.correctAnswer]))}`).sort()[0];

/**
 * C, kroppar: samma uppgift är samma kropp sedd från samma håll relativt
 * kroppen. Kroppen läggs i tittarens ram (kolumn från vänster, djup från
 * pilen), tomma rader längst bort och närmast tas bort, och ramen jämförs
 * också spegelvänd i sidled (hela uppgiften speglad på skärmen: grå och vita
 * sidor byter plats). En kropp vriden ett kvarts varv och sedd från den andra
 * sidan blir alltså samma nyckel. Snittets rad räknas i samma ram.
 */
function kroppKanonV(q) {
  const { h, blick, snitt } = q.referens;
  const kol = kKolumner(blick);
  const djup = (r) => (blick === 'l' ? r[1] : r[0]);
  const V = [];
  for (let d = 0; d < KN; d++) V.push(kol.map((rutor) => kHojd(h, rutor.find((r) => djup(r) === d))));
  const fyllda = V.map((rad, d) => (rad.some(Boolean) ? d : -1)).filter((d) => d >= 0);
  const T = V.slice(fyllda[0], fyllda.at(-1) + 1);
  const s = snitt === undefined ? 'vy' : `snitt${snitt - fyllda[0]}`;
  const a = T.map((r) => r.join('')).join('/');
  const b = T.map((r) => [...r].reverse().join('')).join('/');
  return `K:${s}:${a < b ? a : b}`;
}

export function kanoniskNyckel(q) {
  if (q.form === 'A') return `A:${brickKanon(q)}`;
  if (q.form === 'C' && q.referens?.kind === 'kropp') return `C:${kroppKanonV(q)}`;
  if (q.form === 'C') return `C:${kubKanon(q)}`;
  return `${q.form}:${vikKanon(q)}`;
}
/** Nyckeln som gällde i omgång 1 (C utan hörnets symmetri). Samma som kanoniskNyckel för A, B och D. */
const ritadNyckel = (q) => (q.form === 'C' && q.referens?.kind !== 'kropp' ? `C:${kubKanonRitad(q)}` : kanoniskNyckel(q));

/**
 * Kopior: par av uppgifter som är samma uppgift (samma figur, samma
 * operation) och bara skiljer sig i startvridning eller spegling.
 *
 * Från omgång 2 (fran_version 4) gäller spärren mot alla banker och alla
 * nivåer: ett par där någon uppgift har fran_version 4 eller senare är alltid
 * fel, oavsett nivå och form (grund B är inte undantagen för de nya).
 *
 * Äldre par bedöms som i omgång 1: fel när paret är på samma nivå, samma
 * uppgift enligt omgång 1:s nyckel och någon har fran_version 3 (utom grund B,
 * som bara har 32 uppgifter). Alla andra äldre par, också par på olika nivåer
 * och tärningar som bara skiljer sig i hörnets vridning, ger en varning.
 */
export function dubbletter(fragor) {
  const fel = [];
  const varn = [];
  const grupper = new Map();
  for (const q of fragor) {
    const k = kanoniskNyckel(q);
    if (!grupper.has(k)) grupper.set(k, []);
    const forra = grupper.get(k);
    // en rad per kopia: mot den första som ger fel, annars mot den första i gruppen
    const text = (f) => `${q.id}: samma uppgift som ${f.id}${q.niva === f.niva ? '' : ` (${f.niva})`}, vriden eller speglad`;
    const arFel = (f) => {
      const max = Math.max(q.fran_version, f.fran_version);
      if (max >= 4) return true;
      return max >= 3 && q.niva === f.niva && !(q.niva === 'grund' && q.form === 'B') && ritadNyckel(q) === ritadNyckel(f);
    };
    const f = forra.find(arFel);
    if (f) fel.push(text(f));
    else if (forra.length) varn.push(text(forra[0]));
    forra.push(q);
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

export { SIDA3D, VRID24, upp3D, kFacit, kBild, kGrupp };

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
