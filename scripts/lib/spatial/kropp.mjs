// scripts/lib/spatial/kropp.mjs
// =============================================================================
// Form C i Spatial förmåga, nya uppgiftstyper från bankversion 5 (omgång 3,
// docs/fragebank/spatial-2026-11-19-omg3.md): kroppar av kuber på en 3×3-platta,
// ritade snett ovanifrån i tärningens isometri (ritare.tsx, KroppFigur).
//
//   vy     Hur ser kroppen ut från pilens håll? Facit är den högsta stapeln i
//          varje kolumn tvärs över pilen.
//   snitt  Kroppen sågas itu längs den streckade linjen tvärs över pilen. Hur
//          ser snittytan ut från pilens håll? Facit är staplarna i den raden.
//
// Alternativen är brickfigurer (form A:s ritare) i en 3×3-ram, alltid tre
// kolumner breda och minst en kub hög i varje kolumn, så att figurens läge i
// sidled aldrig tappas när brickan centreras.
//
// Koordinater: h[y][x] kuber i rutan. x går snett nedåt åt höger (de vita
// sidorna åt höger vetter dit), y snett nedåt åt vänster (de grå sidorna).
// blick 'l' tittar rakt mot de grå sidorna (längs −y): kolumnerna är x från
// vänster till höger, djupet är y (0 längst bort). blick 'r' tittar rakt mot
// de vita sidorna till höger (längs −x): kolumnerna är y från N−1 till 0 från
// vänster till höger, djupet är x. Se tittarram().
//
// Entydigheten: en isometrisk teckning kan visa samma bild för flera kroppar
// (en låg stapel bakom en högre syns inte alls). Spärren SP-K2 målar varje
// möjlig kropp på plattan (4^9) på isometrins triangelnät, bakifrån och fram
// som ritaren, och kräver att varje kropp som ger samma bild också ger samma
// facit. Kuber som inte syns får alltså finnas, men bara där de inte ändrar svaret.
// =============================================================================

import { mulberry32, hashString } from '../serie/slump.mjs';

export const N = 3;
export const HMAX = 3;

// ------------------------------------------------------------- tittarramen

/** Kroppen i tittarens ram: V[djup][kolumn], djup 0 längst bort, kolumn 0 till vänster. */
export function tittarram(h, blick) {
  const V = [];
  for (let d = 0; d < N; d++) {
    V.push([]);
    for (let i = 0; i < N; i++) V[d].push(blick === 'l' ? h[d][i] : h[N - 1 - i][d]);
  }
  return V;
}

/** Profilen från pilens håll: högsta stapeln per kolumn. */
export const vyProfil = (h, blick) => {
  const V = tittarram(h, blick);
  return [0, 1, 2].map((i) => Math.max(...V.map((rad) => rad[i])));
};
/** Snittets profil: staplarna i raden på djupet k. */
export const snittProfil = (h, blick, k) => tittarram(h, blick)[k];
/** Det främsta man ser per kolumn: stapeln i den närmaste rutan som inte är tom. */
export const framreProfil = (h, blick) => {
  const V = tittarram(h, blick);
  return [0, 1, 2].map((i) => {
    for (let d = N - 1; d >= 0; d--) if (V[d][i] > 0) return V[d][i];
    return 0;
  });
};
const andra = (blick) => (blick === 'l' ? 'r' : 'l');

/** Profilen som brickfigur: kolumn i, rader uppifrån. */
export function profilBrick(p) {
  const H = Math.max(...p);
  const cells = [];
  for (let r = 0; r < H; r++) for (let i = 0; i < p.length; i++) if (p[i] >= H - r) cells.push([r, i]);
  return { kind: 'brick', n: 3, cells };
}
export const profilNyckel = (p) => p.join(',');

// -------------------------------------------------------------- entydighet

/**
 * Bilden på isometrins triangelnät. En triangel har en lodrät kant vid u från
 * v till v + 2 och spetsen åt sidan s (+1 eller −1), där u = x − y och
 * v = x + y − 2z. Varje triangel får sidan som målas sist där (typ och vilken
 * romb på skärmen), golvet (plattan) är egen typ. Målas som ritaren: plattan
 * först, sedan kubernas fria sidor bakifrån och fram.
 */
export function bild(h) {
  const tri = new Map();
  const romb = (x, y, Z, lab) => {
    const u = x - y;
    const v = x + y - 2 * Z;
    tri.set(`${u},${v},1`, `${lab}${u},${v}`);
    tri.set(`${u},${v},-1`, `${lab}${u},${v}`);
  };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) romb(x, y, 0, 'f');
  const H = (x, y) => (x >= 0 && y >= 0 && x < N && y < N ? h[y][x] : 0);
  const kuber = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) for (let z = 0; z < h[y][x]; z++) kuber.push([x, y, z]);
  kuber.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  for (const [x, y, z] of kuber) {
    const a = x - y;
    const b = x + y - 2 * z;
    if (H(x, y) === z + 1) romb(x, y, z + 1, 't');
    if (H(x, y + 1) <= z) {
      tri.set(`${a - 1},${b - 1},1`, `l${a},${b}`);
      tri.set(`${a},${b},-1`, `l${a},${b}`);
    }
    if (H(x + 1, y) <= z) {
      tri.set(`${a + 1},${b - 1},-1`, `r${a},${b}`);
      tri.set(`${a},${b},1`, `r${a},${b}`);
    }
  }
  return [...tri.entries()].sort((p, q) => (p[0] < q[0] ? -1 : 1)).map((e) => e.join('=')).join(';');
}

const avkoda = (i) => {
  const h = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let c = 0; c < N * N; c++) {
    h[Math.floor(c / N)][c % N] = i % (HMAX + 1);
    i = Math.floor(i / (HMAX + 1));
  }
  return h;
};
let TABELL = null;
/** Kropparna (som tal) per bild, för alla 4^9 kroppar på plattan (räknas en gång, några sekunder). */
function tabell() {
  if (TABELL) return TABELL;
  TABELL = new Map();
  for (let i = 0; i < (HMAX + 1) ** (N * N); i++) {
    const b = bild(avkoda(i));
    if (!TABELL.has(b)) TABELL.set(b, []);
    TABELL.get(b).push(i);
  }
  return TABELL;
}
/** Alla kroppar som ger samma bild som h (h själv inräknad). */
export const sammaBild = (h) => tabell().get(bild(h)).map(avkoda);
/** Ingen annan kropp ger samma bild. */
export const entydig = (h) => tabell().get(bild(h)).length === 1;
/** SP-K2: varje kropp med samma bild ger samma facit. */
export const entydigtFacit = (typ, h, blick, k) => {
  const f = facitK(typ, h, blick, k).join(',');
  return sammaBild(h).every((b) => facitK(typ, b, blick, k).join(',') === f);
};

// ------------------------------------------------------------- kanon

/** Kroppen under plattans åtta symmetrier och förskjutning: samma kropp oavsett läge (taket "samma kropp"). */
export function kroppKanon(h) {
  const lagen = [];
  const g = [
    (x, y) => [x, y], (x, y) => [N - 1 - x, y], (x, y) => [x, N - 1 - y], (x, y) => [N - 1 - x, N - 1 - y],
    (x, y) => [y, x], (x, y) => [N - 1 - y, x], (x, y) => [y, N - 1 - x], (x, y) => [N - 1 - y, N - 1 - x],
  ];
  for (const f of g) {
    const ut = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const [x2, y2] = f(x, y);
      ut[y2][x2] = h[y][x];
    }
    // förskjut till hörnet
    const rader = ut.map((r, i) => (r.some(Boolean) ? i : -1)).filter((i) => i >= 0);
    const kol = [0, 1, 2].filter((i) => ut.some((r) => r[i]));
    const fl = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (ut[y][x]) fl[y - rader[0]][x - kol[0]] = ut[y][x];
    lagen.push(fl.map((r) => r.join('')).join('/'));
  }
  return lagen.sort()[0];
}

// ------------------------------------------------------------- nivåerna

export const NIVAER_K = {
  grund: {
    vy: { kuber: [4, 7], hmax: 2, tom: 0.5, ordning: ['andra_sidan', 'bakifran', 'en_for_mycket', 'en_for_lite'] },
    snitt: { kuber: [6, 11], hmax: 3, tom: 0.3, ordning: ['vyn', 'rad_framfor', 'rad_bakom', 'bakifran'], synlig: true },
  },
  avancerad: {
    vy: { kuber: [7, 12], hmax: 3, tom: 0.4, ordning: ['framre_raden', 'bakifran', 'andra_sidan', 'en_for_lite'], dold: 1 },
    snitt: { kuber: [8, 14], hmax: 3, tom: 0.35, ordning: ['vyn', 'rad_bakom', 'rad_framfor', 'bakifran'] },
  },
  expert: {
    vy: { kuber: [10, 17], hmax: 3, tom: 0.2, ordning: ['framre_raden', 'bakifran', 'andra_sidan', 'en_for_lite'], dold: 2 },
    snitt: { kuber: [11, 18], hmax: 3, tom: 0.2, ordning: ['vyn', 'rad_bakom', 'rad_framfor', 'bakifran'], skymd: true },
  },
};

export const TEXT_K = {
  andra_sidan: 'Så ser kroppen ut från den andra sidan. Pilen visar varifrån du tittar.',
  bakifran: 'Spegelvänd. Så ser kroppen ut bakifrån, inte från pilens håll.',
  framre_raden: 'Du räknade bara staplarna längst fram. En högre stapel längre bak sticker upp ovanför dem.',
  en_for_mycket: 'En kub för mycket. Räkna den högsta stapeln i varje kolumn.',
  en_for_lite: 'En kub för lite. Räkna den högsta stapeln i varje kolumn, också de som står längre bak.',
  vyn: 'Så ser hela kroppen ut från pilens håll. Snittytan visar bara raden som sågas itu.',
  rad_bakom: 'Det här är raden bakom snittet, längre från pilen. Snittet går där den streckade linjen ligger.',
  rad_framfor: 'Det här är raden framför snittet, närmare pilen. Snittet går där den streckade linjen ligger.',
  bakifran_snitt: 'Spegelvänd. Snittytan ska ses från pilens håll, inte från andra sidan.',
};
export const FRAGA_K = {
  vy: 'Hur ser kroppen ut från pilens håll?',
  snitt: 'Kroppen sågas itu längs den streckade linjen. Hur ser snittytan ut från pilens håll?',
};

const tal = (p) => `${p[0]}, ${p[1]} och ${p[2]}`;

/** Förklaringen räknas ur kroppen. */
export function forklaringK(typ, p) {
  if (typ === 'vy') return `Från pilens håll syns den högsta stapeln i varje kolumn, också de som står längre bak. Räknat från vänster är höjderna ${tal(p)}.`;
  return `Snittet går genom raden där den streckade linjen ligger, och bara den raden syns i snittytan. Sett från pilen är höjderna där ${tal(p)}, räknat från vänster.`;
}

// ------------------------------------------------------------- byggaren

const fullBredd = (p) => p.length === 3 && p.every((x) => x >= 1 && x <= HMAX);
const spegel = (p) => [...p].reverse();

/** Distraktorerna för en uppgift, per typ (en eller flera kandidater). */
function kandidaterK(typ, h, blick, k) {
  const ut = [];
  const lagg = (t, p) => ut.push({ typ: t, p });
  if (typ === 'vy') {
    const f = vyProfil(h, blick);
    lagg('andra_sidan', vyProfil(h, andra(blick)));
    lagg('bakifran', spegel(f));
    lagg('framre_raden', framreProfil(h, blick));
    for (let i = 0; i < 3; i++) {
      lagg('en_for_mycket', f.map((x, j) => (j === i ? x + 1 : x)));
      lagg('en_for_lite', f.map((x, j) => (j === i ? x - 1 : x)));
    }
  } else {
    const f = snittProfil(h, blick, k);
    lagg('vyn', vyProfil(h, blick));
    if (k > 0) lagg('rad_bakom', snittProfil(h, blick, k - 1));
    if (k < N - 1) lagg('rad_framfor', snittProfil(h, blick, k + 1));
    lagg('bakifran', spegel(f));
  }
  return ut;
}

/** Facit för uppgiften. */
export const facitK = (typ, h, blick, k) => (typ === 'vy' ? vyProfil(h, blick) : snittProfil(h, blick, k));

/** Står en högre stapel framför snittets rad i någon kolumn (sett från pilen)? */
export function skymd(h, blick, k) {
  const V = tittarram(h, blick);
  return [0, 1, 2].some((i) => V.slice(k + 1).some((rad) => rad[i] > V[k][i]));
}

function slumpaKropp(rng, L) {
  const h = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) h[y][x] = rng() < L.tom ? 0 : 1 + Math.floor(rng() * L.hmax);
  const kuber = h.flat().reduce((s, x) => s + x, 0);
  if (kuber < L.kuber[0] || kuber > L.kuber[1]) return null;
  return h;
}

/**
 * En uppgift av typen 'vy' eller 'snitt' i form C. Null när slumpen inte gav
 * en kropp som klarar spärrarna.
 */
export function byggUppgiftK({ niva, id, fro, typ }) {
  const L = NIVAER_K[niva][typ];
  const rng = mulberry32(hashString(fro));
  const h = slumpaKropp(rng, L);
  if (!h) return null;
  const blick = rng() < 0.5 ? 'l' : 'r';
  const k = typ === 'snitt' ? (niva === 'expert' ? 1 : Math.floor(rng() * N)) : undefined;
  const facit = facitK(typ, h, blick, k);
  if (!fullBredd(facit)) return null;
  if (profilNyckel(facit) === profilNyckel(spegel(facit))) return null;
  // avancerad och expert: minst så många kolumner där en högre stapel står bakom en lägre (vy)
  if (L.dold) {
    const fr = framreProfil(h, blick);
    if (facit.filter((x, i) => x > fr[i]).length < L.dold) return null;
  }
  // expert snitt: raden är skymd från pilens håll (en högre stapel framför den i någon kolumn)
  if (L.skymd && !skymd(h, blick, k)) return null;
  if (L.synlig && skymd(h, blick, k)) return null;
  if (!entydigtFacit(typ, h, blick, k)) return null;

  const sedda = new Set([profilNyckel(facit)]);
  const valda = [];
  const kand = kandidaterK(typ, h, blick, k);
  for (const t of L.ordning) {
    if (valda.length >= 3) break;
    const c = kand.filter((x) => x.typ === t);
    for (const x of c.sort(() => rng() - 0.5)) {
      if (!fullBredd(x.p) || sedda.has(profilNyckel(x.p))) continue;
      sedda.add(profilNyckel(x.p));
      valda.push(x);
      break;
    }
  }
  if (valda.length < 3) return null;
  // grund vy: "en för mycket" och "en för lite" inte båda, så att två alternativ inte bara skiljer en kub åt
  if (valda.filter((x) => x.typ.startsWith('en_for')).length > 1) return null;

  const alla = [{ typ: '', p: facit }, ...valda];
  for (let i = alla.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [alla[i], alla[j]] = [alla[j], alla[i]];
  }
  const text = (t) => (t === 'bakifran' && typ === 'snitt' ? TEXT_K.bakifran_snitt : TEXT_K[t]);
  return {
    id,
    niva,
    form: 'C',
    fraga: FRAGA_K[typ],
    referens: { kind: 'kropp', h: h.map((r) => [...r]), blick, ...(typ === 'snitt' ? { snitt: k } : {}) },
    options: alla.map((a) => profilBrick(a.p)),
    correctAnswer: alla.findIndex((a) => !a.typ),
    typer: alla.map((a) => a.typ),
    misstag: alla.map((a) => (a.typ ? text(a.typ) : '')),
    forklaring: forklaringK(typ, facit),
  };
}

// ------------------------------------------------------------- spärrar

/** Profilen ur en brickfigur i alternativen (kolumnhöjder), null om den inte är en profil. */
function brickProfil(o) {
  const H = Math.max(...o.cells.map((c) => c[0])) + 1;
  const W = Math.max(...o.cells.map((c) => c[1])) + 1;
  const p = [];
  for (let i = 0; i < W; i++) p.push(o.cells.filter((c) => c[1] === i).length);
  // varje kolumn är en stapel från botten
  const ok = o.cells.every(([r, c]) => r >= H - p[c]);
  return ok ? p : null;
}

/** SP-K1 till SP-K6 på en kroppsuppgift. Tom lista: godkänd. */
export function sparrarK(q) {
  const fel = [];
  const id = q.id;
  const ref = q.referens;
  const typ = ref.snitt === undefined ? 'vy' : 'snitt';
  const L = NIVAER_K[q.niva]?.[typ];
  if (!L) return [`${id}: okänd nivå`];
  // SP-K1 kroppen: 3×3, staplar 0 till nivåns högsta, antal kuber
  if (ref.h.length !== N || ref.h.some((r) => r.length !== N || r.some((x) => !Number.isInteger(x) || x < 0 || x > L.hmax))) fel.push(`${id}: SP-K1 staplarna ska vara 0 till ${L.hmax} på en 3×3-platta`);
  const kuber = ref.h.flat().reduce((s, x) => s + x, 0);
  if (kuber < L.kuber[0] || kuber > L.kuber[1]) fel.push(`${id}: SP-K1 ${kuber} kuber, nivån ${L.kuber.join(' till ')}`);
  if (!['l', 'r'].includes(ref.blick)) fel.push(`${id}: SP-K1 okänd blick`);
  if (fel.length) return fel;
  // SP-K2 facit går att läsa ur bilden: varje kropp som ger samma bild ger samma facit
  if (!entydigtFacit(typ, ref.h, ref.blick, ref.snitt)) fel.push(`${id}: SP-K2 en annan kropp ger samma bild men ett annat facit`);
  // SP-K3 alternativen: profiler i full bredd, olika, exakt ett är facit
  const f = facitK(typ, ref.h, ref.blick, ref.snitt);
  const prof = q.options.map(brickProfil);
  if (prof.some((p) => !p || !fullBredd(p))) fel.push(`${id}: SP-K3 ett alternativ är inte en stapelprofil i full bredd`);
  if (q.options.some((o) => o.kind !== 'brick' || o.n !== 3)) fel.push(`${id}: SP-K3 alternativen ska vara brickor i 3×3`);
  const nyck = prof.map((p) => (p ? profilNyckel(p) : '?'));
  if (new Set(nyck).size !== 4) fel.push(`${id}: SP-K3 två alternativ är lika`);
  const ratt = nyck.map((n, i) => (n === profilNyckel(f) ? i : -1)).filter((i) => i >= 0);
  if (ratt.length !== 1 || ratt[0] !== q.correctAnswer) fel.push(`${id}: SP-K3 facit stämmer inte med kroppen`);
  // SP-K4 facit är inte symmetriskt (då är "bakifrån" också rätt)
  if (profilNyckel(f) === profilNyckel(spegel(f))) fel.push(`${id}: SP-K4 facit är symmetriskt`);
  // SP-K5 feltyperna stämmer med det de påstår
  const kand = kandidaterK(typ, ref.h, ref.blick, ref.snitt);
  q.typer.forEach((t, i) => {
    if (i === q.correctAnswer) return;
    if (!kand.some((c) => c.typ === t && prof[i] && profilNyckel(c.p) === nyck[i])) fel.push(`${id}: SP-K5 alternativ ${i + 1} är inte "${t}"`);
    if (!q.misstag[i]) fel.push(`${id}: alternativ ${i + 1} saknar misstagstext`);
  });
  // SP-K6 snittet: raden finns, och texten följer typen
  if (typ === 'snitt' && !(ref.snitt >= 0 && ref.snitt < N)) fel.push(`${id}: SP-K6 snittet ligger utanför plattan`);
  else if (typ === 'snitt' && L.synlig && skymd(ref.h, ref.blick, ref.snitt)) fel.push(`${id}: SP-K6 på grund är snittets rad inte skymd`);
  else if (typ === 'snitt' && L.skymd && !skymd(ref.h, ref.blick, ref.snitt)) fel.push(`${id}: SP-K6 på expert är snittets rad skymd av en högre stapel`);
  if (q.fraga !== FRAGA_K[typ]) fel.push(`${id}: SP-K6 frågan passar inte typen`);
  if (q.forklaring !== forklaringK(typ, f)) fel.push(`${id}: SP-K6 förklaringen stämmer inte med facit`);
  return fel;
}

/** Generatorns nyckel (artiklarnas och bankernas dubblettkoll). */
export const nyckelK = (q) => `kropp:${q.referens.snitt ?? 'vy'}:${q.referens.blick}:${q.referens.h.map((r) => r.join('')).join('/')}`;
