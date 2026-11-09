// scripts/ordforrad/bygg-bank.mjs
// =============================================================================
// Ordförrådsbanken (brief-tester-steg2-2026-11-09.md avsnitt 4): Geminis
// kandidater (src/lib/ordforradV1/kandidater/*.json) prövas mot Svensk ordbok
// och SAOL (scripts/ordforrad/so.mjs) och mot spärrarna OF1 till OF8. Bara det
// som klarar allt går till banken; resten skrivs i avvisade-listan med skäl.
//
// Steg:
// 1. Uppslagsord och facit: båda finns i SO eller SAOL i samma ordklass utan
//    stilmarkering (OF2, OF6), och facit är belagt (OF1): SO "SYN" eller
//    "MOTSATS", eller ordet ensamt i SO:s eller SAOL:s definition. Har SO bara
//    "jämför" krävs dessutom Wiktionary. Saknar SO och SAOL uppgiften helt
//    (vanligt för motsatsord) krävs två oberoende källor, Wiktionary och
//    synonymer.se, och raden märks så. Beläggen sparas i fältet `kalla`.
// 2. Varje distraktor prövas för sig: finns i ordklassen utan stilmarkering,
//    ingen källa kallar den synonym (eller motsats) till uppslagsordet eller
//    synonym till facit (OF1, OF3), längd inom ±4 (OF4), ingen gemensam stam
//    (OF5), motsatsen bara från avancerad (OF8).
// 3. Distraktorer som faller ersätts med ord ur poolen: ord från samma nivås
//    kandidater som själva klarat OF2 och OF6, prövade på samma sätt. De får
//    typen "annan" och SO:s definition som misstagstext.
//
// Kör: node scripts/ordforrad/bygg-bank.mjs           (hämtar vid behov, cachat)
//      node scripts/ordforrad/bygg-bank.mjs --torr
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { slaUpp, relation, wiktionary, synonymerSe } from './so.mjs';
import { mulberry32, hashString } from '../lib/serie/slump.mjs';

const NIVAER = ['grund', 'avancerad', 'expert'];
const TYPER = ['synonym', 'antonym'];
const MAX_PER = 60;
const torr = process.argv.includes('--torr');
/** Minsta popularitet i SO för ett ord som fylls i som distraktor, per nivå. */
const POOL_MINST = { grund: 40000, avancerad: 5000, expert: 0 };
/** Testansvarigs granskning (struk, förbjudna alternativ). */
const GRANSKNING = JSON.parse(readFileSync('src/lib/ordforradV1/kandidater/granskning-2026-11-09.json', 'utf8'));
/** Uppslagsordets frekvensband i SO (popularitet): grund vanliga ord, expert inga grundord och inga nästan okända. */
const BAND = { grund: [30000, Infinity], avancerad: [500, Infinity], expert: [50, 300000] };
const KORT = { grund: 'g', avancerad: 'a', expert: 'e', synonym: 's', antonym: 'm' };

const stor = (t) => t[0].toUpperCase() + t.slice(1);
const prefix = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};
const tankstreck = /[–—]/;
const rent = (w) => /^[a-zåäöé]+$/.test(w);

// ---------------------------------------------------------------- uppslag
const cache = new Map();
async function info(w) {
  if (!cache.has(w)) cache.set(w, { so: await slaUpp(w), wikt: await wiktionary(w), synse: await synonymerSe(w) });
  return cache.get(w);
}
const iKlass = (I, klass) => I.so.filter((e) => e.ordklass === klass);
const finns = (I, klass) => iKlass(I, klass).length > 0;
const stil = (I, klass) => [...new Set(iKlass(I, klass).flatMap((e) => e.stil))];
const wSyn = (A, B, a, b) => A.wikt.syn.has(b) || B.wikt.syn.has(a);
const wAnt = (A, B, a, b) => A.wikt.ant.has(b) || B.wikt.ant.has(a);
const sSyn = (A, B, a, b) => A.synse.syn.has(b) || B.synse.syn.has(a);
const sAnt = (A, B, a, b) => A.synse.ant.has(b) || B.synse.ant.has(a);

/** Alla källor: är a och b synonymer (eller motsatser)? `breda` tar med synonymer.se. */
function relaterade(A, B, a, b, typ, klass, { breda = true } = {}) {
  const r = relation(iKlass(A, klass), iKlass(B, klass), a, b, typ, klass);
  if (r.length) return r[0].text;
  if (typ === 'synonym' ? wSyn(A, B, a, b) : wAnt(A, B, a, b)) return `Wiktionary ${typ === 'synonym' ? 'synonym' : 'motsats'}`;
  if (breda && (typ === 'synonym' ? sSyn(A, B, a, b) : sAnt(A, B, a, b))) return `synonymer.se ${typ === 'synonym' ? 'synonym' : 'motsats'}`;
  return null;
}

/** Steg 1: uppslagsord och facit. */
async function provaKarna(k) {
  const ord = k.ord.trim().toLowerCase();
  const facit = k.facit.trim().toLowerCase();
  const klass = k.ordklass;
  if (!rent(ord) || !rent(facit)) return { skal: ['flerordsuttryck eller tecken i ord eller facit'] };
  if (facit.length > 16) return { skal: ['facit har fler än 16 bokstäver (ryms inte på en rad)'] };
  if (ord === facit || prefix(ord, facit) >= 5 || ord.includes(facit) || facit.includes(ord)) return { skal: ['OF5 facit har samma stam som ordet'] };
  if (GRANSKNING.struk[ord]) return { skal: [`granskning: ${GRANSKNING.struk[ord]}`] };
  const O = await info(ord);
  const F = await info(facit);
  const skal = [];
  const pop = Math.max(0, ...iKlass(O, klass).map((e) => e.pop));
  const [lo, hi] = BAND[k.niva];
  if (pop < lo || pop > hi) return { skal: [`frekvens ${pop} utanför nivåns band`] };
  for (const [w, I] of [[ord, O], [facit, F]]) {
    if (!finns(I, klass)) skal.push(`OF2 ${w} finns inte som ${klass} i SO eller SAOL`);
    else if (stil(I, klass).length) skal.push(`OF6 ${w} är markerat ${stil(I, klass).join(', ')}`);
  }
  if (skal.length) return { skal };
  const alla = relation(iKlass(O, klass), iKlass(F, klass), ord, facit, k.typ, klass);
  const belagg = alla.filter((b) => b.styrka === 'stark');
  let tvaKallor = false;
  if (!belagg.length && k.typ === 'synonym' && alla.length && wSyn(O, F, ord, facit)) belagg.push(...alla, { text: `Wiktionary: ${ord} och ${facit} listas som synonymer` });
  // Motsatsord i två steg inom SO och SAOL: en synonym S till ordet har facit som
  // motsats i SO (eller tvärtom). Beläggen namnger S.
  if (!belagg.length && k.typ === 'antonym') {
    const synOf = (I) => new Set(iKlass(I, klass).flatMap((e) => [...e.syn, ...e.def]));
    for (const [A, a, B, b] of [[O, ord, F, facit], [F, facit, O, ord]]) {
      for (const s of synOf(A)) {
        if (!rent(s) || s === b) continue;
        const S = await info(s);
        const m = relation(iKlass(S, klass), iKlass(B, klass), s, b, 'antonym', klass);
        if (m.length) {
          belagg.push({ text: `${iKlass(A, klass)[0].kalla} ${a}: synonym eller förklaring ${s}` }, { text: m[0].text });
          break;
        }
      }
      if (belagg.length) break;
    }
  }
  if (!belagg.length && (k.typ === 'synonym' ? wSyn(O, F, ord, facit) && sSyn(O, F, ord, facit) : wAnt(O, F, ord, facit) && sAnt(O, F, ord, facit))) {
    tvaKallor = true;
    const namn = k.typ === 'synonym' ? 'synonymer' : 'motsatsord';
    belagg.push({ text: `Wiktionary: ${ord} och ${facit} listas som ${namn}` }, { text: `synonymer.se: ${ord} och ${facit} listas som ${namn}` });
  }
  if (!belagg.length) return { skal: [`OF1 ${facit} är inte belagt som ${k.typ === 'synonym' ? 'synonym' : 'motsats'} till ${ord}`] };
  return { ord, facit, klass, O, F, belagg, tvaKallor };
}

/** Steg 2: en distraktor mot uppslagsordet, facit och nivån. Null = godkänd, annars skälet. */
async function provaDistraktor(k, karna, d, typ) {
  const { ord, facit, klass, O, F } = karna;
  if (!rent(d)) return 'tecken';
  if (d === ord || d === facit) return 'dubblett';
  if (GRANSKNING.forbjudna_overallt.includes(d) || (GRANSKNING.forbjudna_alternativ[ord] ?? []).includes(d)) return `granskning: ${d} förbjuden`;
  const D = await info(d);
  if (!finns(D, klass)) return `OF2 ${d} finns inte som ${klass}`;
  if (stil(D, klass).length) return `OF6 ${d} är stilmarkerat`;
  if (!iKlass(D, klass).some((e) => e.definitioner.length)) return `${d} saknar definition i SO och SAOL (ingen misstagstext)`;
  // OF8: på grund får ingen distraktor vara motsatsen, inte ens otypad (granskningen 2026-11-09)
  if (k.niva === 'grund' && k.typ === 'synonym' && relaterade(O, D, ord, d, 'antonym', klass)) return `OF8 ${d} är motsatsen till ${ord}`;
  const r1 = relaterade(O, D, ord, d, k.typ, klass);
  if (r1) return `OF1 ${d} kan försvaras som rätt (${r1})`;
  if (k.typ === 'antonym' && typ !== 'synonym') {
    const r = relaterade(O, D, ord, d, 'synonym', klass, { breda: false });
    if (r) return `OF1 ${d} är synonym till ordet men inte märkt så`;
  }
  const r2 = relaterade(F, D, facit, d, 'synonym', klass);
  if (r2) return `OF3 ${d} och facit är synonymer (${r2})`;
  if (Math.abs(d.length - facit.length) > 4) return `OF4 ${d} skiljer mer än fyra bokstäver från facit`;
  if (d.includes(ord) || ord.includes(d) || prefix(d, ord) >= 5 || prefix(d, facit) >= 5) return `OF5 ${d} har samma stam`;
  if (d.length > 16) return 'för långt för en rad';
  return null;
}

const definition = async (w, klass) => {
  const I = await info(w);
  const e = iKlass(I, klass).find((x) => x.kalla === 'SO' && x.definitioner.length) ?? iKlass(I, klass).find((x) => x.definitioner.length);
  return e?.definitioner[0] ?? null;
};
/** "betyder" eller "betyder bland annat" när SO har flera huvudbetydelser (granskningen: fel betydelse i misstagstexten). */
const betyder = async (w, klass) => {
  const I = await info(w);
  const e = iKlass(I, klass).find((x) => x.kalla === 'SO' && x.definitioner.length) ?? iKlass(I, klass).find((x) => x.definitioner.length);
  return e && e.definitioner.length > 1 ? 'betyder bland annat' : 'betyder';
};

// --------------------------------------------------------------- körning
const kand = [];
for (const n of NIVAER)
  for (const t of TYPER) {
    // Geminis kandidater från första omgången, sedan de handskrivna (ägarens beslut 2026-11-09)
    for (const f of [`src/lib/ordforradV1/kandidater/${n}-${t}.json`, `src/lib/ordforradV1/kandidater/hand-${n}-${t}.json`]) {
      if (existsSync(f)) kand.push(...JSON.parse(readFileSync(f, 'utf8')).map((x) => ({ ...x, niva: n, typ: t })));
    }
  }

// poolen: alla ord i nivåns kandidater, per ordklass, som finns i SO eller SAOL utan stilmarkering
const pool = { grund: new Map(), avancerad: new Map(), expert: new Map() };
for (const k of kand) {
  for (const w of [k.ord, k.facit, ...(k.distraktorer ?? []).map((d) => d.ord)].map((x) => x.trim().toLowerCase())) {
    if (!rent(w)) continue;
    const I = await info(w);
    if (!finns(I, k.ordklass) || stil(I, k.ordklass).length) continue;
    // ifyllda distraktorer ska vara lika vanliga som nivåns ord: grund aldrig ett ovanligt ord
    if (Math.max(0, ...iKlass(I, k.ordklass).map((e) => e.pop)) < POOL_MINST[k.niva]) continue;
    const m = pool[k.niva];
    if (!m.has(k.ordklass)) m.set(k.ordklass, new Set());
    m.get(k.ordklass).add(w);
  }
}

const godkanda = [];
const avvisade = [];
const uppslagsord = new Map();
const somAlt = { grund: new Map(), avancerad: new Map(), expert: new Map() };
const raknare = {};
let ersatta = 0;
for (const k of kand) {
  const nyckel = `${k.niva}:${k.typ}`;
  const karna = await provaKarna(k);
  if (karna.skal) {
    avvisade.push({ niva: k.niva, typ: k.typ, ord: k.ord, facit: k.facit, skal: karna.skal });
    continue;
  }
  if (uppslagsord.has(karna.ord)) {
    avvisade.push({ niva: k.niva, typ: k.typ, ord: k.ord, facit: k.facit, skal: [`OF7 ${karna.ord} är redan uppslagsord`] });
    continue;
  }
  if ((raknare[nyckel] ?? 0) >= MAX_PER) continue;
  const anv = somAlt[k.niva];
  if ((anv.get(karna.facit) ?? 0) >= 2) {
    avvisade.push({ niva: k.niva, typ: k.typ, ord: k.ord, facit: k.facit, skal: ['OF7 facit är redan alternativ i två uppgifter'] });
    continue;
  }

  // steg 2: Geminis distraktorer
  const valda = [];
  const skalD = [];
  for (const d0 of k.distraktorer ?? []) {
    const d = d0.ord.trim().toLowerCase();
    let typ = d0.typ;
    if (typ === 'antonym' && (k.niva === 'grund' || k.typ === 'antonym')) {
      skalD.push(`OF8 ${d} motsats som distraktor på ${k.niva}`);
      continue;
    }
    if (typ === 'synonym' && k.typ !== 'antonym') typ = 'annan';
    const fel = await provaDistraktor(k, karna, d, typ);
    if (fel) {
      skalD.push(fel);
      continue;
    }
    if ((anv.get(d) ?? 0) >= 2) continue;
    // motsatsdistraktor (synonymuppgift) och synonymdistraktor (motsatsuppgift) måste vara belagda
    const D = await info(d);
    if (typ === 'antonym' && !relaterade(karna.O, D, karna.ord, d, 'antonym', karna.klass)) typ = 'annan';
    if (typ === 'synonym' && !relaterade(karna.O, D, karna.ord, d, 'synonym', karna.klass, { breda: false })) typ = 'annan';
    // inga två distraktorer synonymer (OF3), smal kontroll (SO, SAOL, Wiktionary)
    let krock = false;
    for (const v of valda) if (prefix(v.ord, d) >= 5 || relaterade(await info(v.ord), D, v.ord, d, 'synonym', karna.klass, { breda: false })) krock = true;
    if (krock) continue;
    if (valda.length < 4) valda.push({ ord: d, typ, forklaring: d0.forklaring });
  }

  // steg 3: fyll ur poolen
  const rng = mulberry32(hashString(`fyll:${k.niva}:${karna.ord}`));
  const kandidater = [...(pool[k.niva].get(karna.klass) ?? [])].sort().sort(() => rng() - 0.5);
  for (const w of kandidater) {
    if (valda.length >= 4) break;
    if (valda.some((v) => v.ord === w) || (anv.get(w) ?? 0) >= 2) continue;
    if (await provaDistraktor(k, karna, w, 'annan')) continue;
    const W = await info(w);
    let krock = false;
    for (const v of valda) if (prefix(v.ord, w) >= 5 || relaterade(await info(v.ord), W, v.ord, w, 'synonym', karna.klass)) krock = true;
    if (krock) continue;
    valda.push({ ord: w, typ: 'annan', fyllt: true });
    ersatta++;
  }
  if (valda.length < 4) {
    avvisade.push({ niva: k.niva, typ: k.typ, ord: k.ord, facit: k.facit, skal: ['för få giltiga distraktorer', ...skalD] });
    continue;
  }
  // OF4 andra delen redan här: står facit ensamt längst eller kortast byts en
  // distraktor (helst en ur poolen eller av typen annan) mot ett poolord som är
  // minst lika långt (eller högst lika kort) som facit.
  {
    const L = karna.facit.length;
    const behov = valda.every((v) => v.ord.length < L) ? 'langre' : valda.every((v) => v.ord.length > L) ? 'kortare' : null;
    if (behov) {
      const passar = (w) => (behov === 'langre' ? w.length >= L : w.length <= L);
      const byt = [...valda].reverse().find((v) => v.fyllt) ?? [...valda].reverse().find((v) => v.typ === 'annan');
      if (byt) {
        for (const w of kandidater) {
          if (!passar(w) || valda.some((v) => v.ord === w) || (anv.get(w) ?? 0) >= 2) continue;
          if (await provaDistraktor(k, karna, w, 'annan')) continue;
          const W = await info(w);
          let krock = false;
          for (const v of valda) if (v !== byt && (prefix(v.ord, w) >= 5 || relaterade(await info(v.ord), W, v.ord, w, 'synonym', karna.klass))) krock = true;
          if (krock) continue;
          valda[valda.indexOf(byt)] = { ord: w, typ: 'annan', fyllt: true };
          break;
        }
      }
    }
  }

  // misstagstexter ur SO
  const misstag = [];
  for (const d of valda) {
    const def = await definition(d.ord, karna.klass);
    const bet = await betyder(d.ord, karna.klass);
    if (d.typ === 'antonym') misstag.push(`Det är motsatsen. ${stor(d.ord)} ${bet} ${def}.`);
    else if (d.typ === 'synonym') misstag.push(`${stor(d.ord)} betyder ungefär detsamma som ${karna.ord}, inte motsatsen.`);
    else if (d.typ === 'falsk_van') misstag.push(`${stor(d.ord)} liknar ${karna.ord} till ljudet men ${bet} ${def}.`);
    else misstag.push(`${stor(d.ord)} ${bet} ${def}.`);
  }
  const exempel0 = (k.exempel ?? '').trim();
  const exempel = exempel0 ? exempel0[0].toUpperCase() + exempel0.slice(1) : '';
  if (misstag.some((m) => tankstreck.test(m)) || tankstreck.test(exempel) || !exempel.toLowerCase().includes(karna.ord.slice(0, Math.max(4, karna.ord.length - 2)))) {
    avvisade.push({ niva: k.niva, typ: k.typ, ord: k.ord, facit: k.facit, skal: ['exempelmeningen saknar ordet eller texten har tankstreck'] });
    continue;
  }

  uppslagsord.set(karna.ord, nyckel);
  [karna.facit, ...valda.map((v) => v.ord)].forEach((w) => anv.set(w, (anv.get(w) ?? 0) + 1));
  raknare[nyckel] = (raknare[nyckel] ?? 0) + 1;
  godkanda.push({
    niva: k.niva,
    typ: k.typ,
    ord: karna.ord,
    ordklass: karna.klass,
    facit: karna.facit,
    dist: valda,
    misstag,
    exempel,
    kalla: {
      verifierad_mot: karna.tvaKallor ? 'Wiktionary och synonymer.se (SO och SAOL saknar uppgiften)' : [...new Set(karna.belagg.map((b) => b.text.split(/[ :]/)[0]))].join(' och '),
      belagg: karna.belagg.map((b) => b.text),
      so_id: iKlass(karna.O, karna.klass).find((e) => e.kalla === 'SO')?.id ?? null,
      hamtad: new Date().toISOString().slice(0, 10),
    },
    facit_betyder: (await definition(karna.facit, karna.klass)) ?? '',
    popularitet: Math.max(...iKlass(karna.O, karna.klass).map((e) => e.pop)),
    granskning: {
      of2_ordklass: karna.klass,
      of3_parvis: 'inga synonympar i SO, SAOL, Wiktionary eller synonymer.se mot ordet och facit, inga mellan distraktorerna i SO, SAOL eller Wiktionary',
      of6_stil: 'ingen stilmarkering i SO eller SAOL',
      kandidat_fran: k.kalla_kandidat,
      ifyllda_distraktorer: valda.filter((v) => v.fyllt).length,
    },
  });
}

// OF1 (banknivå): ingen distraktor är facit till samma ord i en annan uppgift
const par = new Set(godkanda.map((u) => `${u.typ}:${[u.ord, u.facit].sort().join('|')}`));
// spegelpar (mörk och ljus, ljus och mörk): samma par får bara finnas en gång i hela banken
const settaPar = new Set();
const utanSpegel = godkanda.filter((u) => {
  const n = [u.ord, u.facit].sort().join('|');
  if (settaPar.has(n)) {
    avvisade.push({ niva: u.niva, typ: u.typ, ord: u.ord, facit: u.facit, skal: ['spegelpar: samma ordpar finns redan åt andra hållet'] });
    return false;
  }
  settaPar.add(n);
  return true;
});
const bank = Object.fromEntries(NIVAER.map((n) => [n, utanSpegel.filter((u) => u.niva === n && !u.dist.some((d) => par.has(`${u.typ}:${[u.ord, d.ord].sort().join('|')}`)))]));

// ordning, id och OF4 andra delen (facit ensamt längst eller kortast i högst 25 procent)
const ut = {};
for (const n of NIVAER) {
  const rng = mulberry32(hashString(`ordforrad-v1:${n}`));
  const lista = [];
  const nr = { synonym: 0, antonym: 0 };
  // OF4 andra delen: facit ensamt längst eller kortast i högst 25 procent. Stryk
  // först ur den typ som har flest uppgifter, så att den knappa typen behålls.
  const arExtrem = (u) => {
    const l = [u.facit, ...u.dist.map((d) => d.ord)].map((w) => w.length);
    const ensam = (v) => l.filter((x) => x === v).length === 1 && l[0] === v;
    return ensam(Math.max(...l)) || ensam(Math.min(...l));
  };
  let kvar = [...bank[n]];
  while (kvar.filter(arExtrem).length > 0.25 * kvar.length) {
    const typ = ['synonym', 'antonym'].sort((x, y) => kvar.filter((u) => u.typ === y).length - kvar.filter((u) => u.typ === x).length)[0];
    const bort = [...kvar].reverse().find((u) => u.typ === typ && arExtrem(u)) ?? [...kvar].reverse().find(arExtrem);
    avvisade.push({ niva: n, typ: bort.typ, ord: bort.ord, facit: bort.facit, skal: ['OF4 facit är ensamt längst eller kortast i för många uppgifter'] });
    kvar = kvar.filter((u) => u !== bort);
  }
  for (const u of kvar) {
    const alt = [{ ord: u.facit, typ: '', misstag: '' }, ...u.dist.map((d, i) => ({ ord: d.ord, typ: d.typ, misstag: u.misstag[i] }))];
    for (let i = alt.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [alt[i], alt[j]] = [alt[j], alt[i]];
    }
    nr[u.typ]++;
    lista.push({
      id: `of-${KORT[n]}-${KORT[u.typ]}-${String(nr[u.typ]).padStart(2, '0')}`,
      niva: n,
      typ: u.typ,
      ord: u.ord,
      ordklass: u.ordklass,
      options: alt.map((a) => a.ord),
      correctAnswer: alt.findIndex((a) => a.typ === ''),
      typer: alt.map((a) => a.typ),
      misstag: alt.map((a) => a.misstag),
      facit_betyder: u.facit_betyder,
      exempel: u.exempel,
      kalla: u.kalla,
      popularitet: u.popularitet,
      granskning: u.granskning,
      fran_version: 1,
    });
  }
  ut[n] = lista;
  const pop = lista.map((x) => x.popularitet).sort((a, b) => a - b);
  const tva = lista.filter((x) => x.kalla.verifierad_mot.startsWith('Wiktionary och')).length;
  console.log(`${n}: ${lista.filter((x) => x.typ === 'synonym').length} synonymer, ${lista.filter((x) => x.typ === 'antonym').length} motsatsord, ${tva} verifierade mot två källor i stället för SO, popularitet median ${pop[Math.floor(pop.length / 2)] ?? 0}`);
}
const skal = {};
for (const a of avvisade) {
  const s = a.skal[0].split(' ')[0];
  skal[s] = (skal[s] ?? 0) + 1;
}
console.log(`${kand.length} kandidater, ${avvisade.length} avvisade, ${ersatta} distraktorer ersatta ur poolen`, skal);
if (!torr) {
  for (const n of NIVAER) writeFileSync(`src/lib/ordforradV1/bank${stor(n)}.json`, JSON.stringify(ut[n], null, 1) + '\n');
  writeFileSync('src/lib/ordforradV1/kandidater/avvisade.json', JSON.stringify(avvisade, null, 1) + '\n');
}
