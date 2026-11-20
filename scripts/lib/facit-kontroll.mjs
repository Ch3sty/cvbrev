// scripts/lib/facit-kontroll.mjs
// =============================================================================
// Kontrollerna för det strukturerade facit i frågebankerna (omgång 3):
//
//   A  numeriskt, fältet `losning` per fråga: steg med uttryck som räknas om,
//      sista stegets värde som ger det rätta alternativet, och `anvander` med
//      rader, kolumner, staplar, sektorer eller punkter som finns i underlaget.
//   B  verbalt, fälten `stod` och `narmast`: meningar eller satser som står
//      ordagrant i texten, en mening per sträng.
//   C  deduktivt, `formell.termnamn` (D1, D4 kvantor) och `formell.atomnamn`
//      (D4 om_sa): korta namn vars ord står i premisserna.
//
// Varje kontroll returnerar en lista med feltexter, tom när allt stämmer.
// Används av vitest-testerna bredvid bankerna. Ingen eval.
// =============================================================================

const MINUS = '−';
const RYMD = /[   ]/;
const UPPHOJT = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };

// ---------------------------------------------------------------------------
// A. Uttrycken
// ---------------------------------------------------------------------------

/**
 * Ett tal i svensk form: decimalkomma, mellanslag (vanligt, hårt eller smalt)
 * som tusentalsavgränsare. Returnerar { varde, decimaler, text } eller null.
 */
const SV_TAL = /^\d{1,3}(?:[   ]\d{3})+(?:,\d+)?(?![\d,])|^\d+(?:,\d+)?(?![\d,])/;

function tokensUttryck(s) {
  const ut = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (RYMD.test(c)) { i++; continue; }
    const m = s.slice(i).match(SV_TAL);
    if (m) {
      const text = m[0];
      const [hel, dec = ''] = text.replace(/[   ]/g, '').split(',');
      ut.push({ tal: Number(`${hel}.${dec || '0'}`), decimaler: dec.length, text });
      i += text.length;
      continue;
    }
    if (c in UPPHOJT) {
      let e = '';
      while (i < s.length && s[i] in UPPHOJT) e += UPPHOJT[s[i++]];
      ut.push({ op: '^', exponent: Number(e) });
      continue;
    }
    if ('+×/()%'.includes(c) || c === MINUS) { ut.push({ op: c }); i++; continue; }
    if (c === '=' || c === '≈') { ut.push({ rel: c }); i++; continue; }
    if (c === '-') throw new Error('bindestreck som minus, använd U+2212');
    if (c === '.' ) throw new Error('punkt i uttrycket, decimalkomma krävs');
    if (c === '*') throw new Error('stjärna som gånger, använd ×');
    throw new Error(`otillåtet tecken "${c}"`);
  }
  return ut;
}

/** Räknar ett segment (tokens utan relationer). % får bara stå sist och är en enhet, inte en faktor. */
function raknaSegment(t, hela) {
  let procent = false;
  if (t.length && t[t.length - 1].op === '%') { procent = true; t = t.slice(0, -1); }
  if (t.some((x) => x.op === '%')) throw new Error(`% får bara stå sist i ett led ("${hela}")`);
  let i = 0;
  const titta = () => t[i];
  const ta = () => t[i++];
  function primar() {
    const x = ta();
    if (!x) throw new Error(`ledet tar slut i "${hela}"`);
    if ('tal' in x) return x.tal;
    if (x.op === '(') {
      const v = summa();
      const s = ta();
      if (!s || s.op !== ')') throw new Error(`parentes saknas i "${hela}"`);
      return v;
    }
    if (x.op === MINUS) return -potens();
    throw new Error(`oväntat "${x.op}" i "${hela}"`);
  }
  function potens() {
    let b = primar();
    while (titta() && titta().op === '^') b = b ** ta().exponent;
    return b;
  }
  function produkt() {
    let v = potens();
    while (titta() && (titta().op === '×' || titta().op === '/')) {
      const op = ta().op;
      const h = potens();
      if (op === '/' && h === 0) throw new Error(`division med noll i "${hela}"`);
      v = op === '×' ? v * h : v / h;
    }
    return v;
  }
  function summa() {
    let v = produkt();
    while (titta() && (titta().op === '+' || titta().op === MINUS)) {
      const op = ta().op;
      const h = produkt();
      v = op === '+' ? v + h : v - h;
    }
    return v;
  }
  const v = summa();
  if (i !== t.length) throw new Error(`överblivet tecken i "${hela}"`);
  if (!Number.isFinite(v)) throw new Error(`"${hela}" ger inget ändligt tal`);
  return { varde: v, procent };
}

/**
 * Räknar ett uttryck som "(14,0 − 6,8) / 6,8 × 100 ≈ 105,9 %".
 * Leden skiljs av = (exakt) och ≈ (högerledet är ett tal, avrundat till sina
 * decimaler). Varje led jämförs med ledet före. Returnerar
 * { fel: string[], led: { varde, procent }[], tal: token[], forstaTal: token[] }.
 */
export function raknaUttryck(uttryck) {
  const fel = [];
  let t;
  try { t = tokensUttryck(String(uttryck)); } catch (e) { return { fel: [`${e.message} i "${uttryck}"`], led: [], tal: [] }; }
  const delar = [[]];
  const rel = [];
  for (const x of t) {
    if (x.rel) { rel.push(x.rel); delar.push([]); } else delar[delar.length - 1].push(x);
  }
  if (!rel.length) fel.push(`"${uttryck}" saknar = eller ≈`);
  const led = [];
  for (const d of delar) {
    if (!d.length) { fel.push(`tomt led i "${uttryck}"`); return { fel, led, tal: [] }; }
    try { led.push(raknaSegment(d, uttryck)); } catch (e) { fel.push(e.message); return { fel, led, tal: [] }; }
  }
  for (let k = 1; k < led.length; k++) {
    const a = led[k - 1].varde;
    const b = led[k].varde;
    if (rel[k - 1] === '=') {
      if (Math.abs(a - b) > 1e-10 * Math.max(1, Math.abs(a), Math.abs(b))) fel.push(`"${uttryck}": led ${k + 1} är inte lika med led ${k} (${+a.toFixed(6)})`);
    } else {
      const d = delar[k];
      const ettTal = d.filter((x) => x.op !== '%');
      const arTal = ettTal.length === 1 && 'tal' in ettTal[0];
      const arNeg = ettTal.length === 2 && ettTal[0].op === MINUS && 'tal' in ettTal[1];
      if (!arTal && !arNeg) { fel.push(`"${uttryck}": efter ≈ ska det stå ett tal`); continue; }
      const dec = ettTal[ettTal.length - 1].decimaler;
      const tol = 0.5 * 10 ** -dec + 1e-9 * Math.max(1, Math.abs(a));
      if (Math.abs(a - b) > tol) fel.push(`"${uttryck}": ${+a.toFixed(6)} avrundas inte till ${ettTal[ettTal.length - 1].text}`);
    }
  }
  if (led.length > 1 && led.slice(0, -1).some((l) => l.procent) && !led[led.length - 1].procent) fel.push(`"${uttryck}": % i ett tidigare led men inte i det sista`);
  return { fel, led, tal: t.filter((x) => 'tal' in x), forstaTal: delar[0].filter((x) => 'tal' in x) };
}

/** Svensk textkontroll för uttryck och etiketter. */
export function textFel(s) {
  const fel = [];
  if (/[—–]/.test(s)) fel.push(`tankstreck i "${s}"`);
  if (/\bpass\b/i.test(s)) fel.push(`ordet "pass" i "${s}"`);
  if (/\d\.\d/.test(s)) fel.push(`punkt som decimaltecken i "${s}"`);
  return fel;
}

// ---------------------------------------------------------------------------
// A. Alternativen och underlaget
// ---------------------------------------------------------------------------

const ALT_TAL = /(^|[^0-9A-Za-zÅÄÖåäö.,])([-−]?)(\d{1,3}(?:[   ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)(?![0-9A-Za-zÅÄÖåäö])/g;
const FAKTOR = [
  [/^\s*(miljarder|miljard|mdkr|md)\b/i, 1e9],
  [/^\s*(miljoner|miljon|mkr|mnkr|msek)\b/i, 1e6],
  [/^\s*(tusen|tkr)\b/i, 1e3],
];

/**
 * Talet i ett svarsalternativ: { varde, enhet, cirka, decimaler, skala } eller
 * null när alternativet inte är ett (enda) tal. "Q4" och "2024 Q1" räknas inte.
 * Enheten för miljoner och liknande räknas inte om; jämförelsen görs i
 * alternativets egna enheter.
 */
export function alternativTal(text) {
  const s = String(text);
  const m = [...s.matchAll(ALT_TAL)];
  if (m.length !== 1) return null;
  const [helt, , tecken, siffror] = m[0];
  const efter = s.slice(m[0].index + helt.length);
  const norm = siffror.replace(/[   ]/g, '').replace(',', '.');
  const varde = (tecken ? -1 : 1) * Number(norm);
  const dec = (norm.split('.')[1] ?? '').length;
  return {
    varde,
    decimaler: dec,
    procent: /^\s*(%|procent(?!enhet))/i.test(efter),
    cirka: /^(\s*)(cirka|ca\.?|ungefär|omkring|runt|knappt|drygt|närmare|nästan)\b/i.test(s),
  };
}

const talIText = (s) =>
  [...String(s).matchAll(/\d{1,3}(?:[   ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?/g)].map((m) => Number(m[0].replace(/[   ]/g, '').replace(',', '.')));

/** Alla tal i underlaget: inledningen, tabellen, diagrammet och frågan. */
export function underlagetsTal(passage, fraga) {
  const delar = [passage.contextText ?? '', fraga?.questionText ?? ''];
  const t = passage.dataTable;
  if (t) delar.push(t.headers.join(' | '), t.caption ?? '', ...t.rows.map((r) => r.map(String).join(' | ')));
  const c = passage.chartData;
  if (c) {
    delar.push(c.title ?? '', c.yAxisLabel ?? '', c.xAxisLabel ?? '');
    for (const d of c.data ?? []) delar.push(`${d.label ?? d.x}`, `${d.value ?? d.y}`);
  }
  return delar.flatMap(talIText);
}

const KONSTANTER = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 24, 52, 60, 100, 365, 1000, 1e6, 1e9]);
const lika = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

/** Posterna i underlaget som `anvander` får peka på. */
export function underlagetsPoster(passage) {
  const p = { rader: [], kolumner: [], staplar: [], sektorer: [], punkter: [] };
  if (passage.dataTable) {
    p.rader = passage.dataTable.rows.map((r) => String(r[0]));
    p.kolumner = passage.dataTable.headers.map(String);
  }
  const c = passage.chartData;
  if (c?.chartType === 'bar') p.staplar = c.data.map((d) => String(d.label));
  if (c?.chartType === 'pie') p.sektorer = c.data.map((d) => String(d.label));
  if (c?.chartType === 'line') p.punkter = c.data.map((d) => String(d.x));
  return p;
}

/**
 * Hela kontrollen av en frågas `losning`. Tom lista när den stämmer eller saknas.
 *  - varje uttryck räknas om och stämmer, i svensk form
 *  - varje tal i ett uttryck finns i underlaget (inledningen, tabellen,
 *    diagrammet, frågan), är ett tidigare leds värde eller en omräkningsfaktor
 *  - sista ledet i sista steget ger det rätta alternativet: närmast av alla
 *    alternativ, och avrundat till alternativets decimaler när alternativet
 *    inte är ungefärligt ("Cirka")
 *  - `anvander` pekar bara på poster som finns, och inte på ovanvant
 *  - finns `berakning` ska sista värdet vara detsamma
 */
export function kollaNumeriskLosning(passage, fraga) {
  const L = fraga.losning;
  if (L === undefined) return [];
  const fel = [];
  if (!L || !Array.isArray(L.steg) || !L.steg.length) return ['losning.steg saknas eller är tomt'];
  const kalla = underlagetsTal(passage, fraga);
  const tidigare = [];
  let sista = null;
  let sistaProcent = false;
  L.steg.forEach((s, i) => {
    if (typeof s.uttryck !== 'string') { fel.push(`steg ${i + 1}: uttryck saknas`); return; }
    for (const k of Object.keys(s)) if (!['uttryck', 'etikett'].includes(k)) fel.push(`steg ${i + 1}: okänt fält ${k}`);
    fel.push(...textFel(s.uttryck).map((x) => `steg ${i + 1}: ${x}`));
    if (s.etikett !== undefined) {
      if (typeof s.etikett !== 'string' || !s.etikett.trim()) fel.push(`steg ${i + 1}: tom etikett`);
      else fel.push(...textFel(s.etikett).map((x) => `steg ${i + 1}: ${x}`));
    }
    const r = raknaUttryck(s.uttryck);
    fel.push(...r.fel.map((x) => `steg ${i + 1}: ${x}`));
    if (r.fel.length) return;
    // Bara första ledets tal: de senare leden är resultat som räknas om.
    for (const x of r.forstaTal) {
      const n = x.tal;
      const ok = KONSTANTER.has(n) || kalla.some((y) => lika(y, n)) || tidigare.some((y) => lika(Math.abs(y), n));
      if (!ok) fel.push(`steg ${i + 1}: talet ${x.text} finns inte i underlaget eller i ett tidigare led`);
    }
    for (const l of r.led) tidigare.push(l.varde);
    sista = r.led[r.led.length - 1].varde;
    sistaProcent = r.led[r.led.length - 1].procent;
  });
  if (fel.length) return fel;

  // Det rätta alternativet
  const opts = fraga.options ?? [];
  const ratt = opts.find((o) => o.id === fraga.correctAnswerId);
  const rt = ratt ? alternativTal(ratt.text) : null;
  if (!rt) return [`det rätta alternativet "${ratt?.text}" är inte ett tal`];
  if (rt.procent !== sistaProcent) fel.push(`sista ledet ${sistaProcent ? 'har' : 'saknar'} %, alternativet "${ratt.text}" ${rt.procent ? 'har' : 'saknar'} det`);
  const alla = opts.map((o) => ({ o, t: alternativTal(o.text) })).filter((x) => x.t);
  const avst = (x) => Math.abs(x.t.varde - sista);
  const narmast = alla.reduce((a, b) => (avst(b) < avst(a) ? b : a), alla[0]);
  const delad = alla.filter((x) => x.o.id !== ratt.id && lika(avst(x), avst({ t: rt })));
  if (narmast.o.id !== ratt.id || delad.length) fel.push(`sista värdet ${+sista.toFixed(6)} ligger inte närmast det rätta alternativet "${ratt.text}"`);
  else if (!rt.cirka && Math.abs(sista - rt.varde) > 0.5 * 10 ** -rt.decimaler + 1e-9 * Math.max(1, Math.abs(sista))) {
    fel.push(`sista värdet ${+sista.toFixed(6)} avrundat är inte "${ratt.text}" (alternativet är inte ungefärligt)`);
  } else if (rt.cirka && Math.abs(sista - rt.varde) > Math.max(0.05 * Math.abs(rt.varde), 0.5 * 10 ** -rt.decimaler)) {
    fel.push(`sista värdet ${+sista.toFixed(6)} ligger mer än 5 procent från "${ratt.text}"`);
  }

  // berakning, när den finns
  const b = fraga.berakning?.steg;
  if (Array.isArray(b) && b.length) {
    const bv = b[b.length - 1].varde;
    const halv = typeof fraga.berakning.precision === 'number' ? 0.5 * 10 ** -fraga.berakning.precision + 1e-9 : 0;
    if (Math.abs(bv - sista) > Math.max(1e-9, 0.005 * Math.abs(bv), halv)) fel.push(`sista värdet ${sista} skiljer sig från berakning (${bv})`);
  }

  // anvander
  if (L.anvander !== undefined) {
    const poster = underlagetsPoster(passage);
    const ov = (passage.ovanvant ?? []).map(String);
    const typ = { rader: 'rad', kolumner: 'kolumn', staplar: 'stapel', sektorer: 'stapel', punkter: 'punkt' };
    for (const [k, v] of Object.entries(L.anvander)) {
      if (!(k in poster)) { fel.push(`anvander.${k} är inget känt fält`); continue; }
      if (!Array.isArray(v) || !v.length) { fel.push(`anvander.${k} är tom`); continue; }
      for (const x of v) {
        if (!poster[k].includes(x)) fel.push(`anvander.${k}: "${x}" finns inte i underlaget`);
        if (ov.includes(`${typ[k]} ${x}`)) fel.push(`anvander.${k}: "${x}" är ovanvant`);
      }
      if (new Set(v).size !== v.length) fel.push(`anvander.${k} har dubbletter`);
    }
  }
  return fel;
}

// ---------------------------------------------------------------------------
// B. Stöd i texten
// ---------------------------------------------------------------------------

const SLUT = /[.!?]["”’)]?$/;
const START_EFTER = /(^|[.!?:;,]["”’)]?\s+)$/;

/**
 * En sträng ur texten: står ordagrant, börjar och slutar vid en menings- eller
 * satsgräns och rymmer högst en mening.
 */
export function kollaCitat(text, s) {
  const fel = [];
  if (typeof s !== 'string' || !s.trim()) return ['tom sträng'];
  if (s !== s.trim()) fel.push(`"${s}" har blanksteg i kanten`);
  const i = text.indexOf(s);
  if (i < 0) return [`"${s}" står inte ordagrant i texten`];
  const fore = text.slice(0, i);
  const efter = text.slice(i + s.length);
  if (!START_EFTER.test(fore)) fel.push(`"${s}" börjar mitt i en sats`);
  if (!SLUT.test(s) && !/^["”’)]?([.!?:;,]|$)/.test(efter)) fel.push(`"${s}" slutar mitt i en sats`);
  const inne = s.replace(SLUT, '');
  if (/[.!?]["”’)]?\s+["„”]?[A-ZÅÄÖ0-9]/.test(inne)) fel.push(`"${s}" är mer än en mening`);
  if (s.split(/\s+/).length < 3) fel.push(`"${s}" är för kort för att vara en sats`);
  return fel;
}

/**
 * Kontrollen av `stod` och `narmast` för ett påstående (verbalt grund och
 * avancerat: facit true, false eller cannot_say) eller en fråga (expert: facit
 * saknas, då krävs bara att stod inte är tomt).
 */
export function kollaStod(text, post, facit) {
  const fel = [];
  if (post.stod === undefined && post.narmast === undefined) return [];
  const stod = post.stod;
  if (!Array.isArray(stod)) return ['stod saknas'];
  if (stod.length > 3) fel.push(`${stod.length} meningar i stod, högst tre`);
  if (new Set(stod).size !== stod.length) fel.push('stod har dubbletter');
  if (facit === 'cannot_say') {
    if (stod.length) fel.push('"går inte att avgöra" ska ha tom stod');
  } else if (!stod.length) fel.push('stod är tom fast facit går att avgöra');
  if (post.narmast !== undefined && facit !== 'cannot_say') fel.push('narmast bara för "går inte att avgöra"');
  for (const s of stod) fel.push(...kollaCitat(text, s));
  if (post.narmast !== undefined) fel.push(...kollaCitat(text, post.narmast));
  for (const s of [...stod, post.narmast ?? '']) if (/[—–]/.test(s)) fel.push(`tankstreck i "${s}"`);
  return fel;
}

// ---------------------------------------------------------------------------
// C. Namnen på leden i deduktiva premisskedjor
// ---------------------------------------------------------------------------

const ordI = (s) => String(s).toLowerCase().match(/[a-zåäöéü0-9]+/g) ?? [];

/** Ett ord i namnet mot ett ord i premisserna: samma ord eller samma stam (böjning). */
export function sammaStam(a, b) {
  if (a === b) return true;
  const n = Math.min(a.length, b.length);
  if (n < 4) return false;
  let k = 0;
  while (k < n && a[k] === b[k]) k++;
  return k >= Math.max(4, n - 2);
}

function kollaNamn(namn, premissOrd, var_) {
  const fel = [];
  if (typeof namn !== 'string' || !namn.trim()) return [`${var_}: tomt namn`];
  const ord = namn.trim().split(/\s+/);
  if (ord.length > 4) fel.push(`${var_}: "${namn}" har ${ord.length} ord, högst fyra`);
  for (const o of ordI(namn)) if (!premissOrd.some((p) => sammaStam(o, p))) fel.push(`${var_}: ordet "${o}" i "${namn}" står inte i premisserna`);
  if (/[—–]/.test(namn)) fel.push(`${var_}: tankstreck`);
  return fel;
}

/** C: termnamn för D1 och D4 kvantor, atomnamn för D4 om_sa. */
export function kollaLedNamn(q) {
  const f = q.formell ?? {};
  const premissOrd = q.villkor.flatMap(ordI);
  const fel = [];
  if (f.termnamn !== undefined) {
    const ids = f.termer ?? [];
    const nycklar = Object.keys(f.termnamn);
    for (const id of ids) if (!(id in f.termnamn)) fel.push(`termnamn saknar ${id}`);
    for (const k of nycklar) if (!ids.includes(k)) fel.push(`termnamn har ${k}, som inte är en term`);
    // En term som inte står i någon premiss (bara i alternativen) namnges med alternativens ord.
    const iPremiss = new Set([...(f.premisser ?? []), ...(Array.isArray(f.villkor) ? f.villkor : [])].flat().flatMap((p) => [p?.x, p?.y]));
    const altOrd = [...premissOrd, ...(q.options ?? []).flatMap(ordI)];
    for (const [k, v] of Object.entries(f.termnamn)) fel.push(...kollaNamn(v, iPremiss.has(k) ? premissOrd : altOrd, k));
    const v = Object.values(f.termnamn).map((x) => String(x).toLowerCase());
    if (new Set(v).size !== v.length) fel.push('två termer har samma namn');
  }
  if (f.atomnamn !== undefined) {
    const n = (f.atomer ?? []).length;
    if (!Array.isArray(f.atomnamn) || f.atomnamn.length !== n) fel.push(`atomnamn ska ha ${n} namn`);
    else {
      f.atomnamn.forEach((v, i) => fel.push(...kollaNamn(v, premissOrd, `atom ${i}`)));
      const v = f.atomnamn.map((x) => String(x).toLowerCase());
      if (new Set(v).size !== v.length) fel.push('två atomer har samma namn');
    }
  }
  return fel;
}

// ---------------------------------------------------------------------------
// D. Tärningarnas misstagstexter (spatial form C med kubdata)
// ---------------------------------------------------------------------------

const kors = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sammaVektor = (a, b) => a.every((x, i) => x === b[i]);
const SYMBOLNAMN = [['fyllda kvadrat', 'fkvadrat'], ['fylld kvadrat', 'fkvadrat'], ['dubbelring', 'dubbelring'], ['kvadrat', 'kvadrat'], ['prick', 'prick'], ['ring', 'ring'], ['kryss', 'kryss'], ['stjärn', 'stjarna'], ['triangel', 'triangel'], ['pil', 'pil']];
const symbolI = (s) => { const t = String(s).toLowerCase(); for (const [k, v] of SYMBOLNAMN) if (t.includes(k)) return v; return null; };
const SIDOR = { ovansidan: 't', 'vänster sida': 'l', 'höger sida': 'r' };

/**
 * Prövar misstagstexterna i en tärningsuppgift mot kubdatan (`kub`):
 * placeringen läses som ovansida × vänster = höger med referensens
 * handenhet. Påståenden som prövas: "måste <sida> visa en X", "X syns redan
 * … kan inte hamna på <sida>", "Spegelvänd" och "bytt plats … spegelbild"
 * (samma tre sidor som den första tärningen, spegelvänd placering), "Rätt
 * sidor, men … pekar åt fel håll" (placeringen möjlig). Riktningen på
 * symbolerna prövas inte. Returnerar feltexter.
 */
export function kollaTarningMisstag(q) {
  if (q.form !== 'C' || q.referens?.kind !== 'kub' || !Array.isArray(q.kub)) return [];
  const fel = [];
  const N = (s) => q.kub.find((f) => f.symbol === s)?.n ?? null;
  const symbolPa = (n) => q.kub.find((f) => sammaVektor(f.n, n))?.symbol;
  const rf = q.referens;
  const handenhet = (v) => {
    const [t, l, r] = ['t', 'l', 'r'].map((k) => N(v[k].symbol));
    if (!t || !l || !r) return 'framande';
    const c = kors(t, l);
    return sammaVektor(c, r) ? 'ok' : sammaVektor(c, r.map((x) => -x)) ? 'spegel' : 'omojlig';
  };
  if (handenhet(rf) !== 'ok') return [`${q.id}: referensen stämmer inte med kubdatan`];
  const kravd = (v, sida) => {
    const [a, b] = ['t', 'l', 'r'].filter((k) => k !== sida);
    const na = N(v[a].symbol);
    const nb = N(v[b].symbol);
    if (!na || !nb) return null;
    return symbolPa(sida === 'l' ? kors(nb, na) : kors(na, nb));
  };
  const tre = (v) => [v.t, v.l, v.r].map((x) => x.symbol).sort().join();
  q.options.forEach((o, i) => {
    const st = handenhet(o);
    const id = `${q.id} alternativ ${'ABCD'[i]}`;
    if (i === q.correctAnswer) { if (st !== 'ok') fel.push(`${id}: facit är ${st}`); return; }
    const m = q.misstag[i];
    let mm;
    if ((mm = m.match(/måste (ovansidan|vänster sida|höger sida) visa en (.+?)(, inte en (.+?))?\./))) {
      const sida = SIDOR[mm[1]];
      const [a, b] = ['t', 'l', 'r'].filter((x) => x !== sida);
      const med = m.match(/Med (.+?) och (.+?) placerade/);
      if (!med || [symbolI(med[1]), symbolI(med[2])].sort().join() !== [o[a].symbol, o[b].symbol].sort().join()) fel.push(`${id}: texten nämner inte sidorna som alternativet visar`);
      if (kravd(o, sida) !== symbolI(mm[2])) fel.push(`${id}: ${mm[1]} måste visa ${kravd(o, sida)}, texten säger ${symbolI(mm[2])}`);
      if (mm[4] && symbolI(mm[4]) !== o[sida].symbol) fel.push(`${id}: "inte en ${mm[4]}" men alternativet visar ${o[sida].symbol}`);
      if (st === 'ok') fel.push(`${id}: alternativet är möjligt`);
    } else if ((mm = m.match(/^(.+?) syns redan på den första tärningen och kan inte hamna på (ovansidan|vänster sida|höger sida) när (.+?) och (.+?) står så här\./))) {
      const x = symbolI(mm[1]);
      const sida = SIDOR[mm[2]];
      if (![rf.t, rf.l, rf.r].some((y) => y.symbol === x)) fel.push(`${id}: ${x} syns inte på den första tärningen`);
      if (o[sida].symbol !== x) fel.push(`${id}: ${mm[2]} visar ${o[sida].symbol}`);
      if (kravd(o, sida) === x) fel.push(`${id}: ${x} kan hamna där`);
    } else if (/^Spegelvänd\./.test(m) || /det är en spegelbild\.$/.test(m)) {
      const rattSvar = q.options[q.correctAnswer];
      const byt = m.match(/(\S+) och (\S+) har bytt plats jämfört med rätt svar/);
      if (byt) {
        // Alternativet är rätt svar med de två namngivna sidorna utbytta, den tredje orörd.
        const sidaFor = (v, s) => ['t', 'l', 'r'].find((k) => v[k].symbol === s);
        const [a, b] = [symbolI(byt[1]), symbolI(byt[2])];
        const [ra, rb] = [sidaFor(rattSvar, a), sidaFor(rattSvar, b)];
        const tredje = ['t', 'l', 'r'].find((k) => k !== ra && k !== rb);
        const ok = ra && rb && o[ra].symbol === b && o[rb].symbol === a && tredje && o[tredje].symbol === rattSvar[tredje].symbol && o[tredje].riktning === rattSvar[tredje].riktning;
        if (!ok) fel.push(`${id}: är inte rätt svar med ${a} och ${b} utbytta`);
      } else if (/Samma tre sidor|bytt plats/.test(m) && tre(o) !== tre(rf)) fel.push(`${id}: inte samma tre sidor som den första tärningen`);
      if (st !== 'spegel') fel.push(`${id}: kallas spegelvänd men placeringen är ${st}`);
    } else if ((mm = m.match(/^Rätt sidor, men (.+?) på (ovansidan|vänster sida|höger sida) pekar åt fel håll/))) {
      if (st !== 'ok') fel.push(`${id}: "rätt sidor" men placeringen är ${st}`);
      if (symbolI(mm[1]) !== o[SIDOR[mm[2]]].symbol) fel.push(`${id}: ${mm[2]} visar ${o[SIDOR[mm[2]]].symbol}`);
    } else fel.push(`${id}: misstagstexten går inte att pröva: ${m}`);
  });
  return fel;
}
