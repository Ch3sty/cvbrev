// scripts/lib/spatial/hopvikning.mjs
// =============================================================================
// Form D i Spatial förmåga: pappersvikning i I-provets riktning (ägarens
// beslut 2026-11-10). Man ser ett utvikt ark med hål och klipp och de
// streckade viklinjerna, och väljer hur arket ser ut ihopvikt. Form B går
// åt andra hållet (vikt och stansat ark, välj hur det ser ut uppvikt) och är
// kvar för I-provets "pappersvikning med klipp", som har den riktningen.
//
// Källorna (logiktester.se/i-provet, testttalent.se/i-prov-monstring,
// rustadsoldat.se/artiklar/monstring-test) beskriver deltestet pappersvikning
// som "ett utvikt papper med streckade vikningslinjer, välj hur det ser ut
// ihopvikt". Inga uppgifter från Plikt- och prövningsverket är återgivna:
// allt här genereras.
//
// Samma rutnät och vikningsmotor som form B (vikning.mjs): 4×4 rutor, en
// vikning är { typ: 'v' | 'h', k, flytt } längs en rutlinje. Arket har hål
// (bläckskivor i rutans mitt) och klipp (bortklippta rutor). Regeln för hur
// det ihopvikta arket ser ut, och som står i uppgiften:
//
//   en ruta i det vikta arket har papper om något lager har papper där. Ett
//   hål eller ett klipp syns bara där det går genom alla lager.
//
// Klippen når alltid arkets kant (hack). Ett klipp mitt på en viklinje, som
// skulle bli ett inre hål i det utvikta arket, genereras inte: viklinjen
// skulle ritas genom luften (spärren linjeGenomKlipp).
//
// Facit räknas framlänges (varje ruta följs genom vikningarna, lager()) och
// baklänges (varje ruta i det vikta arket vecklas upp till sina lager,
// uppvik()); SP-B2-1 kräver att de ger samma figur som facit.
// =============================================================================

import { mulberry32, hashString } from '../serie/slump.mjs';
import { N, ARK, vik, lager, uppvik, helRuta, kandidater, klipp as klippPoly, vikTyp, vikFigur, papperHel, sida, linjeISpolygon } from './vikning.mjs';

const nyck = (p) => p.join(',');
const sorterade = (rutor) => [...rutor].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const GRANNAR = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export const NIVAER_D = {
  // vikningar, synliga hål i facit, dolda hål (går inte genom alla lager), synliga klipp, högst så många hål i arket
  // (expert högst 8 och minst 4: tre vikningar ger upp till åtta lager, granskat läsligt på 360 px 2026-11-10)
  grund: { vikningar: [1], synliga: [1, 2], dolda: [1, 1], klipp: 0, maxArkHal: 5 },
  avancerad: { vikningar: [2], synliga: [1, 2], dolda: [1, 2], klipp: 1, maxArkHal: 7 },
  // expert: tre vikningar (testansvarig 2026-11-10, Ä3), minst fyra hål i arket och ett dolt hål i det som viks sist
  expert: { vikningar: [3], synliga: [1, 2], dolda: [1, 2], klipp: 1, maxArkHal: 8, minArkHal: 4 },
};

export const TEXT_D = {
  spegelvand: 'Spegelvänd. Du vek fel del över linjen, eller ser arket från baksidan. Den grå delen viks över den vita, och arket ligger kvar med samma sida upp.',
  fel_linje: 'Du vek längs fel linje. Följ den streckade viklinjen och pilen i varje ruta.',
  hal_extra: 'Ett hål för mycket. Hålet går bara genom ett av lagren, och papperet i de andra lagren täcker det.',
  hal_saknas: 'Ett hål för lite. Där hålen hamnar på varandra i alla lager syns hålet.',
  klipp_fel_kant: 'Klippet sitter på fel kant. Följ den bortklippta rutan genom varje vikning.',
};
export const DISTRAKTORTYPER_D = Object.keys(TEXT_D);

// ------------------------------------------------------------- motorn

/** Rutorna inne i en region (hela rutor). */
export const regionRutor = (poly) => {
  const ut = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (helRuta(poly, [r, c])) ut.push([r, c]);
  return ut;
};

/** Rutans tillstånd i det utvikta arket. */
function tillstand(ark) {
  const h = new Set(ark.hal.map(nyck));
  const k = new Set(ark.klipp.map(nyck));
  return (c) => (k.has(nyck(c)) ? 'borta' : h.has(nyck(c)) ? 'hal' : 'hel');
}

/** Vad som syns i en ruta av det vikta arket, givet lagrens tillstånd. */
function synligt(lagren) {
  if (lagren.includes('hel')) return 'hel';
  if (lagren.includes('hal')) return 'hal';
  return 'borta';
}

/**
 * Framlänges: varje originalruta följs genom vikningarna (lager i vikning.mjs).
 * Ger det vikta arket som figur och de dolda hålen och klippen (de som inte
 * går genom alla lager).
 */
export function hopvik(ark, vikningar) {
  const r = vik(vikningar);
  if (!r) return null;
  const karta = lager(vikningar);
  const st = tillstand(ark);
  const hal = [];
  const klipp = [];
  const dolda = [];
  for (const c of regionRutor(r.slut)) {
    const v = karta.get(nyck(c));
    if (!v || v.delad) return null;
    const lagren = v.lager.map(st);
    const s = synligt(lagren);
    if (s === 'hal') hal.push(c);
    else if (s === 'borta') klipp.push(c);
    else if (lagren.some((x) => x !== 'hel')) dolda.push({ ruta: c, lager: v.lager.length, typ: lagren.includes('hal') ? 'hal' : 'klipp' });
  }
  return { poly: r.slut, hal: sorterade(hal), klipp: sorterade(klipp), dolda, steg: r.steg, karta };
}

/** Baklänges: varje ruta i det vikta arket vecklas upp till sina lager (uppvik i vikning.mjs). */
export function hopvikBaklanges(ark, vikningar) {
  const r = vik(vikningar);
  if (!r) return null;
  const regioner = r.steg.map((s) => s.fore);
  const st = tillstand(ark);
  const hal = [];
  const klipp = [];
  for (const c of regionRutor(r.slut)) {
    const s = synligt(uppvik([c], vikningar, regioner).slut.map(st));
    if (s === 'hal') hal.push(c);
    else if (s === 'borta') klipp.push(c);
  }
  return { poly: r.slut, hal: sorterade(hal), klipp: sorterade(klipp) };
}

export const stansFigur = (u) => ({ kind: 'ark-stans', n: N, poly: u.poly, hal: u.hal, ...(u.klipp.length ? { klipp: u.klipp } : {}) });

// -------------------------------------------------- figurernas jämförelse

/** Figuren som rutor relativt sin ram (ritaren centrerar regionen, så läget syns inte). */
function normal(fig) {
  const rutor = regionRutor(fig.poly);
  const r0 = Math.min(...rutor.map((x) => x[0]));
  const c0 = Math.min(...rutor.map((x) => x[1]));
  const H = Math.max(...rutor.map((x) => x[0])) - r0 + 1;
  const W = Math.max(...rutor.map((x) => x[1])) - c0 + 1;
  const f = (x) => [x[0] - r0, x[1] - c0];
  return { H, W, hal: fig.hal.map(f), klipp: (fig.klipp ?? []).map(f) };
}
const normalNyckel = (n) => `${n.H}x${n.W}|${sorterade(n.hal).map(nyck).join(' ')}|${sorterade(n.klipp).map(nyck).join(' ')}`;
export const figurNyckel = (fig) => normalNyckel(normal(fig));

const vrid90 = (n) => ({ H: n.W, W: n.H, hal: n.hal.map(([r, c]) => [c, n.H - 1 - r]), klipp: n.klipp.map(([r, c]) => [c, n.H - 1 - r]) });
const speglaLR = (n) => ({ ...n, hal: n.hal.map(([r, c]) => [r, n.W - 1 - c]), klipp: n.klipp.map(([r, c]) => [r, n.W - 1 - c]) });
const speglaUN = (n) => ({ ...n, hal: n.hal.map(([r, c]) => [n.H - 1 - r, c]), klipp: n.klipp.map(([r, c]) => [n.H - 1 - r, c]) });

/** Nycklarna för figuren vriden 90, 180 och 270 grader. */
export function vridnaNycklar(fig) {
  let n = normal(fig);
  const ut = [];
  for (let i = 0; i < 3; i++) {
    n = vrid90(n);
    ut.push(normalNyckel(n));
  }
  return ut;
}

/** Figuren spegelvänd i sin egen ram (vänster-höger eller upp-ned). */
function spegelFigur(fig, axel) {
  const rutor = regionRutor(fig.poly);
  const [r0, r1] = [Math.min(...rutor.map((x) => x[0])), Math.max(...rutor.map((x) => x[0]))];
  const [c0, c1] = [Math.min(...rutor.map((x) => x[1])), Math.max(...rutor.map((x) => x[1]))];
  const f = axel === 'lr' ? ([r, c]) => [r, c0 + c1 - c] : ([r, c]) => [r0 + r1 - r, c];
  return { ...fig, hal: sorterade(fig.hal.map(f)), ...(fig.klipp?.length ? { klipp: sorterade(fig.klipp.map(f)) } : {}) };
}
export const spegelNycklar = (fig) => [normalNyckel(speglaLR(normal(fig))), normalNyckel(speglaUN(normal(fig)))];

// ---------------------------------------------------------- ritbarhet

function helYta(rutor) {
  if (!rutor.length) return false;
  const s = new Set(rutor.map(nyck));
  const sedd = new Set([nyck(rutor[0])]);
  const ko = [rutor[0]];
  while (ko.length) {
    const [r, c] = ko.pop();
    for (const [dr, dc] of GRANNAR) {
      const k = `${r + dr},${c + dc}`;
      if (s.has(k) && !sedd.has(k)) {
        sedd.add(k);
        ko.push([r + dr, c + dc]);
      }
    }
  }
  if (sedd.size !== rutor.length) return false;
  for (const [r, c] of rutor) {
    for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      if (s.has(`${r + dr},${c + dc}`) && !s.has(`${r + dr},${c}`) && !s.has(`${r},${c + dc}`)) return false;
    }
  }
  return true;
}

/**
 * Går det vikta arket att rita med ritarens ArkStans (stansDelar)? Ett klipp
 * som inte når regionens kant ritas bara som bläckruta om det är en ensam
 * ruta; ett större inre klipp skulle försvinna ur konturen. Papperet som är
 * kvar måste hänga ihop sida mot sida.
 */
export function stansRitbar(fig) {
  const region = regionRutor(fig.poly);
  const iRegion = new Set(region.map(nyck));
  const k = new Set((fig.klipp ?? []).map(nyck));
  const inre = (fig.klipp ?? []).filter(([r, c]) => GRANNAR.every(([dr, dc]) => iRegion.has(`${r + dr},${c + dc}`) && !k.has(`${r + dr},${c + dc}`)));
  const inreS = new Set(inre.map(nyck));
  const ovriga = (fig.klipp ?? []).filter((x) => !inreS.has(nyck(x)));
  // varje klipp som inte är en ensam inre ruta ska nå regionens kant genom andra klipp
  const vidKant = (x) => GRANNAR.some(([dr, dc]) => !iRegion.has(`${x[0] + dr},${x[1] + dc}`));
  const nar = new Set(ovriga.filter(vidKant).map(nyck));
  const ko = ovriga.filter(vidKant);
  while (ko.length) {
    const [r, c] = ko.pop();
    for (const [dr, dc] of GRANNAR) {
      const n = `${r + dr},${c + dc}`;
      if (k.has(n) && !inreS.has(n) && !nar.has(n)) {
        nar.add(n);
        ko.push([r + dr, c + dc]);
      }
    }
  }
  if (ovriga.some((x) => !nar.has(nyck(x)))) return false;
  const kvar = region.filter((x) => !k.has(nyck(x)) || inreS.has(nyck(x)));
  return helYta(kvar);
}

/**
 * Klippen som når regionens kant (hack i konturen), som ritarens arkVikDelar
 * räknar dem. Utan poly är regionen hela arket.
 */
export function kantKlipp(klipp, poly = ARK) {
  const iRegion = new Set(regionRutor(poly).map(nyck));
  const k = new Set(klipp.map(nyck));
  const kant = new Set();
  const ko = klipp.filter(([r, c]) => GRANNAR.some(([dr, dc]) => !iRegion.has(`${r + dr},${c + dc}`)));
  ko.forEach((x) => kant.add(nyck(x)));
  while (ko.length) {
    const [r, c] = ko.pop();
    for (const [dr, dc] of GRANNAR) {
      const n = `${r + dr},${c + dc}`;
      if (k.has(n) && !kant.has(n)) {
        kant.add(n);
        ko.push([r + dr, c + dc]);
      }
    }
  }
  return kant;
}

/** Den grå delen i en vikruta (det som viks) minus hacken: ska hänga ihop för att ritas som en yta. */
export function forstaGra(rorlig, klipp, poly = ARK) {
  const kant = kantKlipp(klipp, poly);
  return regionRutor(rorlig).filter((x) => !kant.has(nyck(x)));
}

/** Papperet i en vikruta: regionen minus hacken. */
export const vikPapper = (poly, klipp) => {
  const kant = kantKlipp(klipp, poly);
  return regionRutor(poly).filter((x) => !kant.has(nyck(x)));
};

/**
 * Viklinjen går bara över papper: där klipp på båda sidor om linjen når
 * kanten (ett hack som linjen går genom) kortas linjen, så att den inte ritas
 * genom luften.
 */
export function trimLinje(v, linje, klipp, poly = ARK) {
  const kant = kantKlipp(klipp, poly);
  const borta = (t) => (v.typ === 'v' ? [[t, v.k - 1], [t, v.k]] : [[v.k - 1, t], [v.k, t]]).every((c) => kant.has(nyck(c)));
  let [a, b] = v.typ === 'v' ? [linje[0][1], linje[1][1]] : [linje[0][0], linje[1][0]];
  while (a < b && borta(a)) a++;
  while (b > a && borta(b - 1)) b--;
  return v.typ === 'v' ? [[v.k, a], [v.k, b]] : [[a, v.k], [b, v.k]];
}

/** Går första viklinjen genom luft, alltså ett klipp på båda sidor mitt på linjen? */
export function linjeGenomKlipp(v, linje, klipp) {
  const k = new Set(klipp.map(nyck));
  const [a, b] = v.typ === 'v' ? [linje[0][1], linje[1][1]] : [linje[0][0], linje[1][0]];
  for (let t = a; t < b; t++) {
    if ((v.typ === 'v' ? [[t, v.k - 1], [t, v.k]] : [[v.k - 1, t], [v.k, t]]).every((c) => k.has(nyck(c)))) return true;
  }
  return false;
}

// ----------------------------------------------------------- pilen

/** Pilens skaft och huvud i arkets enheter, som ritaren ritar dem (ritare.tsx ArkVik). */
export function pilGeometri(pil) {
  const E = 17; // 68 / 4 enheter per ruta
  const [a, b] = pil;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const v = [-u[1], u[0]];
  const huvudLangd = 9 / E;
  const huvudHalv = 7 / E;
  const bas = [b[0] - u[0] * huvudLangd, b[1] - u[1] * huvudLangd];
  return { a, b, bas, huvud: [b, [bas[0] + v[0] * huvudHalv, bas[1] + v[1] * huvudHalv], [bas[0] - v[0] * huvudHalv, bas[1] - v[1] * huvudHalv]] };
}

function avstandSegment(p, a, b) {
  const ab = [b[0] - a[0], b[1] - a[1]];
  const l2 = ab[0] ** 2 + ab[1] ** 2;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - t * ab[0], p[1] - a[1] - t * ab[1]);
}

/**
 * Minsta fria avståndet (i arkets enheter, en ruta = 1) mellan pilen och ett
 * hål eller en klippt ruta i första rutan. Hålets radie 4,5 och pilens
 * halva streck 1,5 av 17 är inräknade.
 */
export function pilFritt(pil, hal, klipp) {
  const g = pilGeometri(pil);
  const segment = [[g.a, g.bas], [g.huvud[0], g.huvud[1]], [g.huvud[1], g.huvud[2]], [g.huvud[2], g.huvud[0]]];
  let min = Infinity;
  for (const [r, c] of hal) {
    const p = [c + 0.5, r + 0.5];
    const d = Math.min(...segment.map(([a, b]) => avstandSegment(p, a, b)));
    min = Math.min(min, d - 4.5 / 17 - 1.5 / 17);
  }
  for (const [r, c] of klipp) {
    // avståndet till rutans fyra kanter (pilen får inte ligga över ett klipp)
    const kanter = [[[c, r], [c + 1, r]], [[c + 1, r], [c + 1, r + 1]], [[c + 1, r + 1], [c, r + 1]], [[c, r + 1], [c, r]]];
    const inne = (p) => p[0] > c && p[0] < c + 1 && p[1] > r && p[1] < r + 1;
    if ([g.a, g.b, g.bas].some(inne)) return -1;
    for (const [a, b] of segment) {
      for (const [p, q] of kanter) {
        // segment mot segment: minsta av ändpunkternas avstånd (skär de varandra blir det 0)
        const korsar = (sida2(a, b, p) * sida2(a, b, q) < 0) && (sida2(p, q, a) * sida2(p, q, b) < 0);
        const d = korsar ? 0 : Math.min(avstandSegment(a, p, q), avstandSegment(b, p, q), avstandSegment(p, a, b), avstandSegment(q, a, b));
        min = Math.min(min, d - 1.5 / 17);
      }
    }
  }
  return min;
}
const sida2 = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);

// ----------------------------------------------------------- generering

/** Samma ram (höjd och bredd i rutor) som en annan figur. */
export const samRam = (a, b) => {
  const [x, y] = [normal(a), normal(b)];
  return x.H === y.H && x.W === y.W;
};

/** Ligger minst ett dolt hål i den del som flyttas av sista vikningen? (expert, Ä3) */
export function doltISista(ark, vikningar, u) {
  const sista = new Set(flyttadePerVikning(vikningar).at(-1).map(nyck));
  const halS = new Set(ark.hal.map(nyck));
  return u.dolda.some((d) => d.typ === 'hal' && u.karta.get(nyck(d.ruta)).lager.some((c) => halS.has(nyck(c)) && sista.has(nyck(c))));
}

function shuffle(a, rng) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

/** Vikningar längs rutlinjer som nivån tillåter. */
function nivansKandidater(niva, poly, i) {
  let k = kandidater(poly).filter((v) => (v.typ === 'v' || v.typ === 'h') && Number.isInteger(v.k));
  if (niva === 'grund' || (niva === 'avancerad' && i === 0)) k = k.filter((v) => vikTyp(v, poly) === 'halv');
  return k;
}

/** Originalrutor som ligger på den sida som viks vid varje vikning (för SP-B2-5). */
export function flyttadePerVikning(vikningar) {
  const pos = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) pos.push({ orig: [r, c], nu: [r, c] });
  const ut = [];
  for (const v of vikningar) {
    const flyttade = [];
    for (const p of pos) {
      const mitt = [p.nu[1] + 0.5, p.nu[0] + 0.5];
      if (Math.sign(sida(v, mitt)) === v.flytt) {
        flyttade.push(p.orig);
        const [x, y] = v.typ === 'v' ? [2 * v.k - mitt[0], mitt[1]] : [mitt[0], 2 * v.k - mitt[1]];
        p.nu = [y - 0.5, x - 0.5];
      }
    }
    ut.push(flyttade);
  }
  return ut;
}

/** Kantrutor i en rektangulär region: rutor med minst en sida mot regionens rand. */
const kantRutor = (poly) => {
  const reg = regionRutor(poly);
  const s = new Set(reg.map(nyck));
  return reg.filter(([r, c]) => GRANNAR.some(([dr, dc]) => !s.has(`${r + dr},${c + dc}`)));
};

export function byggUppgiftD({ niva, id, fro }) {
  const L = NIVAER_D[niva];
  const rng = mulberry32(hashString(fro));
  const valj = (a) => a[Math.floor(rng() * a.length)];
  const mellan = ([a, b]) => a + Math.floor(rng() * (b - a + 1));

  // vikningarna
  const antal = valj(L.vikningar);
  const vikningar = [];
  let poly = ARK;
  for (let i = 0; i < antal; i++) {
    const k = nivansKandidater(niva, poly, i);
    if (!k.length) return null;
    const v = valj(k);
    vikningar.push(v);
    poly = klippPoly(poly, v, v.flytt);
  }
  const r = vik(vikningar);
  if (!r) return null;
  const typer = r.steg.map((s) => vikTyp(s.v, s.fore));
  if (niva === 'expert' && !typer.includes('remsa')) return null;
  const karta = lager(vikningar);
  const lagerAv = (c) => karta.get(nyck(c))?.lager ?? [];

  // arket: synliga hål (alla lager), dolda hål (inte alla lager) och ett synligt klipp
  const region = shuffle(regionRutor(r.slut), rng);
  const anvanda = new Set();
  const hal = [];
  const klipp = [];
  const ta = (c) => anvanda.add(nyck(c));
  let klippPos = null;
  if (L.klipp) {
    const kant = shuffle(kantRutor(r.slut), rng);
    // expert: klippet går genom minst två lager, så att det blir två eller fler hack i arket
    const val = niva === 'expert' ? kant.find((c) => lagerAv(c).length >= 2) : kant[0];
    if (!val) return null;
    klippPos = val;
    ta(val);
    klipp.push(...lagerAv(val));
  }
  const nSynliga = mellan(L.synliga);
  let synliga = 0;
  for (const c of region) {
    if (synliga >= nSynliga) break;
    if (anvanda.has(nyck(c))) continue;
    ta(c);
    hal.push(...lagerAv(c));
    synliga++;
  }
  const nDolda = mellan(L.dolda);
  let dolda = 0;
  for (const c of region) {
    if (dolda >= nDolda) break;
    if (anvanda.has(nyck(c))) continue;
    const lagren = lagerAv(c);
    if (lagren.length < 2) continue;
    ta(c);
    // ett hål genom en del av lagren, oftast bara ett
    const n = rng() < 0.75 ? 1 : lagren.length - 1;
    hal.push(...shuffle(lagren, rng).slice(0, n));
    dolda++;
  }
  if (dolda < L.dolda[0]) return null;
  if (hal.length > L.maxArkHal || hal.length < (L.minArkHal ?? 0)) return null;
  const ark = { hal: sorterade(hal), klipp: sorterade(klipp) };
  if (!papperHel(ark.klipp)) return null;

  const facitU = hopvik(ark, vikningar);
  if (!facitU) return null;
  if (niva === 'expert' && !doltISista(ark, vikningar, facitU)) return null;
  const facit = stansFigur(facitU);
  if (facit.hal.length < L.synliga[0] || facit.hal.length > L.synliga[1]) return null;
  if (!stansRitbar(facit)) return null;

  // sekvensen: första rutan är arket med hål och klipp och första viklinjen
  const sekvens = r.steg.map((s) => vikFigur(s));
  if (sekvens.some((f) => !f)) return null;
  sekvens[0] = { ...sekvens[0], linje: trimLinje(vikningar[0], sekvens[0].linje, ark.klipp), hal: ark.hal, ...(ark.klipp.length ? { klipp: ark.klipp } : {}) };
  if (pilFritt(sekvens[0].pil, ark.hal, ark.klipp) < 1 / 17) return null;
  if (linjeGenomKlipp(vikningar[0], sekvens[0].linje, ark.klipp)) return null;
  if (!helYta(forstaGra(r.steg[0].rorlig, ark.klipp))) return null;
  // rutorna efter den första: det vikta arkets kontur med de hack som syns, utan hål
  for (let j = 1; j < sekvens.length; j++) {
    const u = hopvik(ark, vikningar.slice(0, j));
    const kant = kantKlipp(u.klipp, r.steg[j].fore);
    const hack = u.klipp.filter((x) => kant.has(nyck(x)));
    if (!hack.length) continue;
    sekvens[j] = { ...sekvens[j], linje: trimLinje(vikningar[j], sekvens[j].linje, hack, r.steg[j].fore), klipp: hack };
    if (linjeGenomKlipp(vikningar[j], sekvens[j].linje, hack)) return null;
    if (!helYta(vikPapper(r.steg[j].fore, hack)) || !helYta(forstaGra(r.steg[j].rorlig, hack, r.steg[j].fore))) return null;
    if (pilFritt(sekvens[j].pil, [], hack) < 1 / 17) return null;
  }

  // distraktorerna, byggda av samma motor med ett steg fel eller ett hål fel
  const kand = [];
  const lagg = (typ, fig) => {
    if (fig && stansRitbar(fig)) kand.push({ typ, fig });
  };
  for (const axel of shuffle(['lr', 'un'], rng)) lagg('spegelvand', spegelFigur(facit, axel));
  vikningar.forEach((v, j) => {
    const fore = r.steg[j].fore;
    for (const alt of shuffle(nivansKandidater(niva === 'grund' ? 'grund' : 'expert', fore, j), rng)) {
      if (alt.typ === v.typ && alt.k === v.k) continue;
      const fel = vikningar.map((x, i) => (i === j ? alt : x));
      const u = hopvik(ark, fel);
      // avancerad och expert: fel linje ska ge samma ram som facit, annars faller den på formen (Ä2, SP-B2-10)
      if (u && (niva === 'grund' || samRam(stansFigur(u), facit))) lagg('fel_linje', stansFigur(u));
    }
  });
  for (const d of shuffle(facitU.dolda.filter((x) => x.typ === 'hal'), rng)) lagg('hal_extra', { ...facit, hal: sorterade([...facit.hal, d.ruta]) });
  for (const h of shuffle(facit.hal, rng)) lagg('hal_saknas', { ...facit, hal: facit.hal.filter((x) => x !== h) });
  if (klippPos && facit.klipp?.length === 1) {
    const upptagna = new Set([...facit.hal, ...facitU.dolda.map((d) => d.ruta)].map(nyck));
    for (const c of shuffle(kantRutor(r.slut), rng)) {
      if (nyck(c) === nyck(facit.klipp[0]) || upptagna.has(nyck(c))) continue;
      lagg('klipp_fel_kant', { ...facit, klipp: [c] });
    }
  }

  // distraktortyperna i slumpad ordning per uppgift (Ä1), så att ingen typ eller typuppsättning dominerar banken
  let ordning = shuffle(niva === 'grund' ? ['spegelvand', 'fel_linje', 'hal_extra', 'hal_saknas'] : ['spegelvand', 'fel_linje', 'hal_extra', 'hal_saknas', 'klipp_fel_kant'], rng);
  // det dolda hålet finns i varje uppgift och blir annars den vanligaste distraktorn: läggs sist i en fjärdedel (grund) eller fyra av tio (avancerad, expert) av uppgifterna
  if (rng() < (niva === 'grund' ? 0.25 : 0.4)) ordning = [...ordning.filter((t) => t !== 'hal_extra'), 'hal_extra'];
  const forbjudna = new Set([figurNyckel(facit), ...vridnaNycklar(facit)]);
  const sedda = new Set();
  const valda = [];
  const anvandaTyper = new Set();
  for (const pass of [0, 1]) {
    for (const typ of ordning) {
      if (pass === 0 && anvandaTyper.has(typ)) continue;
      for (const c of kand.filter((x) => x.typ === typ)) {
        if (valda.length >= 3) break;
        const n = figurNyckel(c.fig);
        if (forbjudna.has(n) || sedda.has(n)) continue;
        sedda.add(n);
        valda.push(c);
        anvandaTyper.add(typ);
        if (pass === 0) break;
      }
    }
  }
  if (valda.length < 3) return null;
  // minst två distraktorer ska ha samma ram som facit, annars räcker det att titta på formen
  if (valda.filter((c) => samRam(c.fig, facit)).length < 2) return null;

  const alla = shuffle([{ typ: '', fig: facit }, ...valda], rng);

  // genomgången: arket och varje vikt läge med det som syns
  const hopvikning = [{ kind: 'ark-ut', n: N, hal: ark.hal, klipp: ark.klipp }];
  for (let i = 1; i <= vikningar.length; i++) {
    const u = hopvik(ark, vikningar.slice(0, i));
    const f = stansFigur(u);
    if (!stansRitbar(f)) return null;
    hopvikning.push(f);
  }

  const gånger = antal === 1 ? 'en gång' : antal === 2 ? 'två gånger' : 'tre gånger';
  const s = facit.hal.length;
  const d = facitU.dolda.filter((x) => x.typ === 'hal').length;
  const forklaring =
    `Arket viks ${gånger}. Följ hålen genom vikningarna. Där hål hamnar på varandra i alla lager syns de, och det ger ${TAL[s]} hål i det vikta arket.` +
    (d ? ` ${d === 1 ? 'Ett hål' : 'Två hål'} går bara genom en del av lagren och täcks av papperet.` : '') +
    (facit.klipp?.length ? ' Klippet går genom alla lager och syns i kanten.' : '');
  return {
    id,
    niva,
    form: 'D',
    fraga: antal === 1 ? 'Arket viks längs den streckade linjen. Hur ser det ut ihopvikt?' : 'Arket viks längs de streckade linjerna, i tur och ordning. Hur ser det ut ihopvikt?',
    sekvens,
    options: alla.map((a) => a.fig),
    correctAnswer: alla.findIndex((a) => !a.typ),
    typer: alla.map((a) => a.typ),
    misstag: alla.map((a) => (a.typ ? TEXT_D[a.typ] : '')),
    forklaring,
    hopvikning,
    vikningar,
    ark,
  };
}

const TAL = ['inget', 'ett', 'två', 'tre', 'fyra'];
export const nyckelD = (q) => `${JSON.stringify(q.vikningar)}|${q.ark.hal.map(nyck).join(' ')}|${q.ark.klipp.map(nyck).join(' ')}`;

// ------------------------------------------------------------- spärrar

/**
 * SP-B2-1 till SP-B2-9. Geometrin i riktig SVG (hålens storlek, papper mot
 * kanten, pilen fri från hål och klipp) mäts dessutom av svgMatt.tsx.
 */
export function sparrarD(q) {
  const fel = [];
  const id = q.id;
  const L = NIVAER_D[q.niva];
  if (!L) return [`${id}: okänd nivå ${q.niva}`];
  const r = vik(q.vikningar ?? []);
  if (!r) return [`${id}: vikningarna går inte att utföra`];
  const ark = q.ark;
  const facit = q.options[q.correctAnswer];

  // SP-B2-1 facit framlänges = facit baklänges = alternativet som är facit
  const fram = hopvik(ark, q.vikningar);
  const bak = hopvikBaklanges(ark, q.vikningar);
  if (!fram || !bak) return [`${id}: SP-B2-1 vikningen går inte att följa ruta för ruta`];
  const fNyck = figurNyckel(stansFigur(fram));
  if (fNyck !== figurNyckel(stansFigur(bak))) fel.push(`${id}: SP-B2-1 framlänges och baklänges ger olika figurer`);
  if (!facit || facit.kind !== 'ark-stans' || fNyck !== figurNyckel(facit) || JSON.stringify(facit.poly) !== JSON.stringify(fram.poly)) fel.push(`${id}: SP-B2-1 facit stämmer inte med vikningen`);

  // SP-B2-2 fyra olika alternativ, och ingen distraktor är facit vriden
  const nycklar = q.options.map(figurNyckel);
  if (new Set(nycklar).size !== 4) fel.push(`${id}: SP-B2-2 två alternativ är lika`);
  const vridna = new Set(vridnaNycklar(facit));
  nycklar.forEach((n, i) => {
    if (i === q.correctAnswer) return;
    if (vridna.has(n)) fel.push(`${id}: SP-B2-2 alternativ ${i + 1} är facit vridet`);
    if (!DISTRAKTORTYPER_D.includes(q.typer[i]) || !q.misstag[i]) fel.push(`${id}: SP-B2-2 alternativ ${i + 1} saknar feltyp eller misstagstext`);
  });

  // SP-B2-3 facit är inte spegelsymmetriskt, så att den spegelvända distraktorn alltid är fel
  if (facit?.poly && spegelNycklar(facit).includes(figurNyckel(facit))) fel.push(`${id}: SP-B2-3 facit är spegelsymmetriskt`);

  // SP-B2-4 antal: synliga hål, dolda hål, hål i arket
  if (facit.hal.length < L.synliga[0] || facit.hal.length > L.synliga[1]) fel.push(`${id}: SP-B2-4 facit har ${facit.hal.length} synliga hål, nivån ${L.synliga.join(' till ')}`);
  const dolda = fram.dolda.filter((d) => d.typ === 'hal').length;
  if (dolda < L.dolda[0] || dolda > L.dolda[1]) fel.push(`${id}: SP-B2-4 ${dolda} dolda hål, nivån ${L.dolda.join(' till ')}`);
  if (ark.hal.length > L.maxArkHal) fel.push(`${id}: SP-B2-4 ${ark.hal.length} hål i arket, högst ${L.maxArkHal}`);
  const arkS = new Set(ark.hal.map(nyck));
  if (ark.klipp.some((k) => arkS.has(nyck(k)))) fel.push(`${id}: SP-B2-4 hål och klipp i samma ruta`);

  // SP-B2-5 varje vikning flyttar minst ett hål eller klipp (annars spelar den ingen roll)
  const drag = new Set([...ark.hal, ...ark.klipp].map(nyck));
  flyttadePerVikning(q.vikningar).forEach((f, j) => {
    if (!f.some((c) => drag.has(nyck(c)))) fel.push(`${id}: SP-B2-5 vikning ${j + 1} flyttar inget hål eller klipp`);
  });

  // SP-B2-6 klipp och ritbarhet
  const synligaKlipp = facit.klipp?.length ?? 0;
  if (!L.klipp && ark.klipp.length) fel.push(`${id}: SP-B2-6 klipp på ${q.niva}`);
  if (L.klipp && synligaKlipp !== 1) fel.push(`${id}: SP-B2-6 facit ska ha exakt ett synligt klipp, har ${synligaKlipp}`);
  if (!papperHel(ark.klipp)) fel.push(`${id}: SP-B2-6 arket hänger inte ihop efter klippen`);
  for (const [i, o] of q.options.entries()) if (o.kind !== 'ark-stans' || !stansRitbar(o)) fel.push(`${id}: SP-B2-6 alternativ ${i + 1} går inte att rita som vikt ark`);
  for (const [i, f] of (q.hopvikning ?? []).entries()) if (f.kind === 'ark-stans' && !stansRitbar(f)) fel.push(`${id}: SP-B2-6 genomgångens steg ${i + 1} går inte att rita`);
  if (q.sekvens[0]?.linje && linjeGenomKlipp(q.vikningar[0], q.sekvens[0].linje, ark.klipp)) fel.push(`${id}: SP-B2-6 första viklinjen går genom ett klipp`);
  if (!helYta(forstaGra(r.steg[0].rorlig, ark.klipp))) fel.push(`${id}: SP-B2-6 den grå delen i första rutan faller isär`);

  // SP-B2-7 sekvensen: nivåns vikningar, längs rutlinjer, pilen och viklinjen
  if (!L.vikningar.includes(q.vikningar.length)) fel.push(`${id}: SP-B2-7 ${q.vikningar.length} vikningar på ${q.niva}`);
  if (q.vikningar.some((v) => !(v.typ === 'v' || v.typ === 'h') || !Number.isInteger(v.k))) fel.push(`${id}: SP-B2-7 vikning utanför rutlinjerna`);
  if (q.niva === 'expert' && !r.steg.some((s) => vikTyp(s.v, s.fore) === 'remsa')) fel.push(`${id}: SP-B2-7 expert saknar remsa`);
  if (q.sekvens.length !== q.vikningar.length || q.sekvens.length > 4) fel.push(`${id}: SP-B2-7 sekvensen har ${q.sekvens.length} rutor för ${q.vikningar.length} vikningar`);
  q.sekvens.forEach((f, j) => {
    const v = q.vikningar[j];
    if (!v || f.kind !== 'ark-vik') return fel.push(`${id}: SP-B2-7 ruta ${j + 1} är inte en vikning`);
    if (JSON.stringify(f.poly) !== JSON.stringify(r.steg[j].fore)) fel.push(`${id}: SP-B2-7 ruta ${j + 1} visar fel läge`);
    if (Math.sign(sida(v, f.pil[0])) !== v.flytt || Math.sign(sida(v, f.pil[1])) !== -v.flytt) fel.push(`${id}: SP-B2-7 pilen i ruta ${j + 1} pekar fel`);
    const hackJ = j === 0 ? ark.klipp : (() => {
      const u = hopvik(ark, q.vikningar.slice(0, j));
      const kant = kantKlipp(u.klipp, f.poly);
      return u.klipp.filter((x) => kant.has(nyck(x)));
    })();
    const vantad = trimLinje(v, linjeISpolygon(f.poly, v), hackJ, f.poly);
    if (j > 0 && nyckel2(f.klipp) !== nyckel2(hackJ)) fel.push(`${id}: SP-B2-7 ruta ${j + 1} visar inte det vikta arkets hack`);
    if (j > 0 && hackJ.length && (!helYta(vikPapper(f.poly, hackJ)) || !helYta(forstaGra(f.rorlig, hackJ, f.poly)))) fel.push(`${id}: SP-B2-6 ruta ${j + 1} går inte att rita`);
    if (JSON.stringify(vantad) !== JSON.stringify(f.linje)) fel.push(`${id}: SP-B2-7 viklinjen i ruta ${j + 1} går inte från kant till kant över papperet`);
    if (j > 0 && f.hal?.length) fel.push(`${id}: SP-B2-7 ruta ${j + 1} visar hål (bara första rutan visar hålen)`);
  });
  const f0 = q.sekvens[0];
  if (nyckel2(f0?.hal) !== nyckel2(ark.hal) || nyckel2(f0?.klipp) !== nyckel2(ark.klipp)) fel.push(`${id}: SP-B2-7 första rutan visar inte arkets hål och klipp`);

  // SP-B2-8 pilen ligger aldrig över ett hål eller ett klipp i första rutan
  if (f0?.pil && pilFritt(f0.pil, ark.hal, ark.klipp) < 1 / 17) fel.push(`${id}: SP-B2-8 pilen täcker ett hål eller klipp i första rutan`);

  // SP-B2-10 avancerad och expert: fel linje har samma ram som facit, och minst två distraktorer har samma ram
  if (facit?.poly) {
    q.options.forEach((o, i) => {
      if (q.typer[i] === 'fel_linje' && q.niva !== 'grund' && !samRam(o, facit)) fel.push(`${id}: SP-B2-10 fel linje i alternativ ${i + 1} har en annan ram än facit`);
    });
    if (q.options.filter((o, i) => i !== q.correctAnswer && samRam(o, facit)).length < 2) fel.push(`${id}: SP-B2-10 färre än två distraktorer har samma ram som facit`);
  }
  if (L.minArkHal && ark.hal.length < L.minArkHal) fel.push(`${id}: SP-B2-4 ${ark.hal.length} hål i arket, minst ${L.minArkHal}`);
  if (q.niva === 'expert' && !doltISista(ark, q.vikningar, fram)) fel.push(`${id}: SP-B2-4 inget dolt hål i det som viks sist`);

  // SP-B2-9 genomgången: arket och ett vikt läge per vikning, sista är facit
  const hv = q.hopvikning ?? [];
  if (hv.length !== q.vikningar.length + 1) fel.push(`${id}: SP-B2-9 genomgången har ${hv.length} steg`);
  else if (figurNyckel(hv[hv.length - 1]) !== fNyck) fel.push(`${id}: SP-B2-9 genomgångens sista steg är inte facit`);
  if (/[—–]/.test(q.forklaring) || q.misstag.some((m) => /[—–]/.test(m))) fel.push(`${id}: tankstreck i texten`);
  return fel;
}
const nyckel2 = (rutor) => sorterade(rutor ?? []).map(nyck).join(' ');
