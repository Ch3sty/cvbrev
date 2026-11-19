// scripts/ordforrad/bygg-v2.mjs
// =============================================================================
// Bankversion 2 av ordförrådet (2026-11-19): handskrivna kandidater i
// src/lib/ordforradV1/kandidater/hand-2026-11-19.json prövas mot Svensk ordbok,
// SAOL, Wiktionary och synonymer.se (scripts/ordforrad/so.mjs) med samma regler
// som bygg-bank.mjs, och läggs SIST i bankfilerna med fran_version 2. Skillnaden
// mot bygg-bank.mjs: inga distraktorer fylls i automatiskt. En kandidat där en
// distraktor faller avvisas hel och skrivs om för hand, så att varje alternativ
// är valt av en människa. Befintliga uppgifter (version 1) rörs aldrig; en
// omkörning ersätter bara tidigare version 2-rader.
//
// Kör: node scripts/ordforrad/bygg-v2.mjs --torr   (bara rapport)
//      node scripts/ordforrad/bygg-v2.mjs          (skriver bankerna)
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { slaUpp, relation, wiktionary, synonymerSe } from './so.mjs';
import { mulberry32, hashString } from '../lib/serie/slump.mjs';

const VERSION = 2;
const KANDIDATER = 'src/lib/ordforradV1/kandidater/hand-2026-11-19.json';
const NIVAER = ['grund', 'avancerad', 'expert'];
const KORT = { grund: 'g', avancerad: 'a', expert: 'e', synonym: 's', antonym: 'm' };
const BAND = { grund: [30000, Infinity], avancerad: [500, Infinity], expert: [50, 300000] };
const GRANSKNING = JSON.parse(readFileSync('src/lib/ordforradV1/kandidater/granskning-2026-11-09.json', 'utf8'));
const torr = process.argv.includes('--torr');

const stor = (t) => t[0].toUpperCase() + t.slice(1);
const fil = (n) => `src/lib/ordforradV1/bank${stor(n)}.json`;
const prefix = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};
const rent = (w) => /^[a-zåäöé]+$/.test(w);
const tankstreck = /[–—]/;

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
function relaterade(A, B, a, b, typ, klass, { breda = true } = {}) {
  const r = relation(iKlass(A, klass), iKlass(B, klass), a, b, typ, klass);
  if (r.length) return r[0].text;
  if (typ === 'synonym' ? wSyn(A, B, a, b) : wAnt(A, B, a, b)) return `Wiktionary ${typ === 'synonym' ? 'synonym' : 'motsats'}`;
  if (breda && (typ === 'synonym' ? sSyn(A, B, a, b) : sAnt(A, B, a, b))) return `synonymer.se ${typ === 'synonym' ? 'synonym' : 'motsats'}`;
  return null;
}

// ------------------------------------------------------------ befintligt
const banker = Object.fromEntries(NIVAER.map((n) => [n, JSON.parse(readFileSync(fil(n), 'utf8')).filter((q) => q.fran_version < VERSION)]));
const uppslag = new Set(NIVAER.flatMap((n) => banker[n].map((q) => q.ord)));
const parSet = new Set(NIVAER.flatMap((n) => banker[n].map((q) => [q.ord, q.options[q.correctAnswer]].sort().join('|'))));
const somAlt = Object.fromEntries(NIVAER.map((n) => [n, new Map()]));
for (const n of NIVAER) for (const q of banker[n]) q.options.forEach((o) => somAlt[n].set(o, (somAlt[n].get(o) ?? 0) + 1));
/** Artikelfigurernas ord får inte bli uppslagsord (scripts/artikel-steg2-check.mjs). */
const artikelOrd = new Set(JSON.parse(readFileSync('src/lib/artikelfigurer/ordforrad.json', 'utf8')).map((q) => q.ord.toLowerCase()));
const artikelPar = new Set(JSON.parse(readFileSync('src/lib/artikelfigurer/ordforrad.json', 'utf8')).map((q) => [q.ord.toLowerCase(), q.options[q.correctAnswer].toLowerCase()].sort().join('|')));

// ------------------------------------------------------------ prövning
async function provaKarna(k) {
  const ord = k.ord;
  const facit = k.facit;
  const klass = k.ordklass;
  if (!rent(ord) || !rent(facit)) return { skal: ['tecken i ord eller facit'] };
  if (facit.length > 16) return { skal: ['facit har fler än 16 bokstäver'] };
  if (ord === facit || prefix(ord, facit) >= 5 || ord.includes(facit) || facit.includes(ord)) return { skal: ['OF5 facit har samma stam som ordet'] };
  if (GRANSKNING.struk[ord]) return { skal: [`granskning 2026-11-09 strök ${ord}`] };
  if (uppslag.has(ord)) return { skal: [`OF7 ${ord} är redan uppslagsord`] };
  if (artikelOrd.has(ord)) return { skal: [`${ord} är ord i artikelfigurerna`] };
  const par = [ord, facit].sort().join('|');
  if (parSet.has(par) || artikelPar.has(par)) return { skal: ['paret finns redan (även spegelvänt eller i artikelfigurerna)'] };
  const O = await info(ord);
  const F = await info(facit);
  const pop = Math.max(0, ...iKlass(O, klass).map((e) => e.pop));
  const [lo, hi] = BAND[k.niva];
  const skal = [];
  if (pop < lo || pop > hi) skal.push(`frekvens ${pop} utanför nivåns band ${lo}..${hi}`);
  for (const [w, I] of [[ord, O], [facit, F]]) {
    if (!finns(I, klass)) skal.push(`OF2 ${w} finns inte som ${klass} i SO eller SAOL`);
    else if (stil(I, klass).length) skal.push(`OF6 ${w} är markerat ${stil(I, klass).join(', ')}`);
  }
  if (skal.length) return { skal };
  const alla = relation(iKlass(O, klass), iKlass(F, klass), ord, facit, k.typ, klass);
  const belagg = alla.filter((b) => b.styrka === 'stark');
  let tvaKallor = false;
  if (!belagg.length && k.typ === 'synonym' && alla.length && wSyn(O, F, ord, facit)) belagg.push(...alla, { text: `Wiktionary: ${ord} och ${facit} listas som synonymer` });
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
  if (!belagg.length) {
    const svagt = [relaterade(O, F, ord, facit, k.typ, klass)].filter(Boolean);
    return { skal: [`OF1 ${facit} är inte belagt som ${k.typ === 'synonym' ? 'synonym' : 'motsats'} till ${ord}${svagt.length ? ` (bara ${svagt[0]})` : ''}`] };
  }
  return { ord, facit, klass, O, F, belagg, tvaKallor, pop };
}

async function provaDistraktor(k, karna, d, typ) {
  const { ord, facit, klass, O, F } = karna;
  if (!rent(d)) return `${d}: tecken`;
  if (d === ord || d === facit) return `${d}: dubblett`;
  if (GRANSKNING.forbjudna_overallt.includes(d) || (GRANSKNING.forbjudna_alternativ[ord] ?? []).includes(d)) return `${d}: förbjuden i granskningen`;
  const D = await info(d);
  if (!finns(D, klass)) return `OF2 ${d} finns inte som ${klass}`;
  if (stil(D, klass).length) return `OF6 ${d} är stilmarkerat`;
  if (!iKlass(D, klass).some((e) => e.definitioner.length)) return `${d} saknar definition (ingen misstagstext)`;
  if (k.niva === 'grund' && k.typ === 'synonym' && relaterade(O, D, ord, d, 'antonym', klass)) return `OF8 ${d} är motsatsen till ${ord} (grund)`;
  const r1 = relaterade(O, D, ord, d, k.typ, klass);
  if (r1) return `OF1 ${d} kan försvaras som rätt (${r1})`;
  if (k.typ === 'antonym' && typ !== 'synonym' && !GRANSKAD_INTE_SYNONYM.has(`${ord}:${d}`)) {
    const r = relaterade(O, D, ord, d, 'synonym', klass, { breda: false });
    if (r) return `OF1 ${d} är synonym till ordet men inte märkt så (${r})`;
  }
  if (k.typ === 'synonym' && typ !== 'antonym') {
    // en omärkt motsats får inte stå utan raden "det är motsatsen"
    const r = relaterade(O, D, ord, d, 'antonym', klass, { breda: false });
    if (r) return `OF8 ${d} är motsatsen men inte märkt så (${r})`;
  }
  const r2 = relaterade(F, D, facit, d, 'synonym', klass);
  if (r2) return `OF3 ${d} och facit är synonymer (${r2})`;
  if (k.typ === 'antonym') {
    const r3 = relaterade(F, D, facit, d, 'antonym', klass, { breda: false });
    if (r3 && typ !== 'synonym') return `OF3 ${d} är motsats till facit (${r3}), alltså nära ordet`;
  }
  if (Math.abs(d.length - facit.length) > 4) return `OF4 ${d} skiljer mer än fyra bokstäver från facit`;
  if (d.includes(ord) || ord.includes(d) || prefix(d, ord) >= 5 || prefix(d, facit) >= 5) return `OF5 ${d} har samma stam`;
  if (d.length > 16) return `${d}: för långt för en rad`;
  if (prefix(d, facit) >= 3 && Math.abs(d.length - facit.length) <= 2 && [...d].filter((c, i) => c !== facit[i]).length <= 2) return `${d} liknar facit i stavningen`;
  return null;
}

/**
 * Betydelsen som passar uppgiften när SO:s första betydelse är en annan
 * (index i SO:s huvudbetydelser). Granskat för hand 2026-11-19.
 */
const BETYDELSE = { möta: 1, kultiverad: 1, införa: 1 };
/**
 * Handskrivna definitioner där SO:s text inte passar exemplet (facit_betyder).
 * Allt annat är SO:s eller SAOL:s egen text.
 */
const HANDSKRIVET = {
  erfordra: 'behöva för att kunna genomföras',
  förtroende: 'tro på att någon är pålitlig och vill väl',
  statisk: 'som präglas av rörelse och förändring',
  // testansvarigs granskning 2026-11-19 (docs/fragebank/ordforrad-2026-11-19-granskning.md)
  stringent: 'logiskt följdriktig och exakt',
  kompensera: 'ge ekonomisk ersättning till',
  skicka: 'låta (något) gå till en mottagare',
  ytlig: '(intellektuellt) inträngande eller grundläggande',
};
/**
 * Testansvarigs granskning 2026-11-19: motsatser till uppslagsordet som källorna
 * inte märker MOTSATS men som granskningen bekräftat. De märks antonym och får
 * "Det är motsatsen" (bara synonymuppgifter från avancerad, OF8).
 */
const GRANSKAD_MOTSATS = new Set(['betona:nedtona', 'förespråka:förkasta', 'efemär:beständig', 'evident:tvivelaktig', 'antagonist:bundsförvant', 'magnifik:torftig']);
/**
 * Distraktorer som SO bara har som "jämför" till uppslagsordet och som
 * granskningen bedömt som inte synonyma (tillträda och anträda: anträda en resa).
 */
const GRANSKAD_INTE_SYNONYM = new Set(['tillträda:anträda']);
/** Misstagstexter som granskningen skrivit eller kompletterat. */
const MISSTAG = {
  'tillträda:anträda': 'Anträda betyder påbörja (en resa eller verksamhet).',
  'beröm:lovord': 'Lovord betyder ungefär detsamma som beröm, inte motsatsen. Den exakta motsatsen till beröm är klander.',
};
const definition = async (w, klass) => {
  const I = await info(w);
  const e = iKlass(I, klass).find((x) => x.kalla === 'SO' && x.definitioner.length) ?? iKlass(I, klass).find((x) => x.definitioner.length);
  return e ? { text: e.definitioner[Math.min(BETYDELSE[w] ?? 0, e.definitioner.length - 1)], flera: e.definitioner.length > 1 } : null;
};
/** facit_betyder: SO:s definition av facit; är den tom eller bara ordet själv används uppslagsordets definition. */
async function facitBetyder(ord, facit, klass) {
  if (HANDSKRIVET[ord]) return HANDSKRIVET[ord];
  const f = (await definition(facit, klass))?.text ?? '';
  const ord1 = f.toLowerCase().match(/[a-zåäöé]+/g) ?? [];
  if (!f || ord1.includes(ord) || ord1.length <= 1) return (await definition(ord, klass))?.text ?? f;
  return f;
}

// ------------------------------------------------------------ körning
const kand = JSON.parse(readFileSync(KANDIDATER, 'utf8'));
const godkanda = [];
const avvisade = [];
const nyaUppslag = new Set();
for (const k of kand) {
  const karna = await provaKarna(k);
  if (karna.skal) {
    avvisade.push({ ...k, skal: karna.skal });
    continue;
  }
  if (nyaUppslag.has(karna.ord)) {
    avvisade.push({ ...k, skal: ['OF7 dubblett bland kandidaterna'] });
    continue;
  }
  const skal = [];
  for (const d of k.distraktorer) {
    if (d.typ === 'antonym' && (k.niva === 'grund' || k.typ === 'antonym')) skal.push(`OF8 ${d.ord} motsats som distraktor på ${k.niva}`);
    if (d.typ === 'synonym' && k.typ !== 'antonym') skal.push(`${d.ord} märkt synonym i en synonymuppgift`);
    const fel = await provaDistraktor(k, karna, d.ord, d.typ);
    if (fel) skal.push(fel);
    const D = await info(d.ord);
    if (GRANSKAD_MOTSATS.has(`${karna.ord}:${d.ord}`) && k.typ === 'synonym' && k.niva !== 'grund') d.typ = 'antonym';
    else if (d.typ === 'antonym' && !relaterade(karna.O, D, karna.ord, d.ord, 'antonym', karna.klass)) d.typ = 'annan';
    if (d.typ === 'synonym' && !relaterade(karna.O, D, karna.ord, d.ord, 'synonym', karna.klass, { breda: false })) skal.push(`${d.ord} är märkt synonym men saknar belägg i SO, SAOL eller Wiktionary`);
  }
  // OF3 mellan distraktorerna
  for (let a = 0; a < 4; a++)
    for (let b = a + 1; b < 4; b++) {
      const x = k.distraktorer[a].ord;
      const y = k.distraktorer[b].ord;
      if (prefix(x, y) >= 5) skal.push(`OF5 ${x} och ${y} har samma stam`);
      else if (relaterade(await info(x), await info(y), x, y, 'synonym', karna.klass, { breda: false })) skal.push(`OF3 ${x} och ${y} är synonymer`);
    }
  // OF7: högst två gånger per nivå
  const anv = somAlt[k.niva];
  for (const w of [karna.facit, ...k.distraktorer.map((d) => d.ord)]) if ((anv.get(w) ?? 0) >= 2) skal.push(`OF7 ${w} är redan alternativ två gånger på ${k.niva}`);
  // texterna
  if (tankstreck.test(k.exempel) || !k.exempel.toLowerCase().includes(karna.ord.slice(0, Math.max(4, karna.ord.length - 2)))) skal.push('exempelmeningen saknar ordet eller har tankstreck');
  if (skal.length) {
    avvisade.push({ ...k, skal });
    continue;
  }
  const misstag = [];
  for (const d of k.distraktorer) {
    const def = await definition(d.ord, karna.klass);
    const bet = def.flera ? 'betyder bland annat' : 'betyder';
    if (MISSTAG[`${karna.ord}:${d.ord}`]) misstag.push(MISSTAG[`${karna.ord}:${d.ord}`]);
    else if (d.typ === 'antonym') misstag.push(`Det är motsatsen. ${stor(d.ord)} ${bet} ${def.text}.`);
    else if (d.typ === 'synonym') misstag.push(`${stor(d.ord)} betyder ungefär detsamma som ${karna.ord}, inte motsatsen.`);
    else misstag.push(`${stor(d.ord)} ${bet} ${def.text}.`);
  }
  if (misstag.some((m) => tankstreck.test(m))) {
    avvisade.push({ ...k, skal: ['tankstreck i SO:s definition'] });
    continue;
  }
  nyaUppslag.add(karna.ord);
  [karna.facit, ...k.distraktorer.map((d) => d.ord)].forEach((w) => anv.set(w, (anv.get(w) ?? 0) + 1));
  const fb = await facitBetyder(karna.ord, karna.facit, karna.klass);
  godkanda.push({
    k,
    karna,
    misstag,
    facit_betyder: fb,
    kalla: {
      verifierad_mot: karna.tvaKallor ? 'Wiktionary och synonymer.se (SO och SAOL saknar uppgiften)' : [...new Set(karna.belagg.map((b) => b.text.split(/[ :]/)[0]))].join(' och '),
      belagg: karna.belagg.map((b) => b.text),
      so_id: iKlass(karna.O, karna.klass).find((e) => e.kalla === 'SO')?.id ?? null,
      hamtad: new Date().toISOString().slice(0, 10),
    },
  });
}

// id, blandning och utskrift
const nya = {};
for (const n of NIVAER) {
  const nr = {};
  for (const q of banker[n]) {
    const t = q.typ;
    nr[t] = Math.max(nr[t] ?? 0, Number(q.id.split('-')[3]));
  }
  nya[n] = [];
  for (const g of godkanda.filter((x) => x.k.niva === n)) {
    const { k, karna } = g;
    const alt = [{ ord: karna.facit, typ: '', misstag: '' }, ...k.distraktorer.map((d, i) => ({ ord: d.ord, typ: d.typ, misstag: g.misstag[i] }))];
    const rng = mulberry32(hashString(`ordforrad-v2:${n}:${karna.ord}`));
    for (let i = alt.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [alt[i], alt[j]] = [alt[j], alt[i]];
    }
    nr[k.typ] = (nr[k.typ] ?? 0) + 1;
    nya[n].push({
      id: `of-${KORT[n]}-${KORT[k.typ]}-${String(nr[k.typ]).padStart(2, '0')}`,
      niva: n,
      typ: k.typ,
      ord: karna.ord,
      ordklass: karna.klass,
      options: alt.map((a) => a.ord),
      correctAnswer: alt.findIndex((a) => a.typ === ''),
      typer: alt.map((a) => a.typ),
      misstag: alt.map((a) => a.misstag),
      facit_betyder: g.facit_betyder,
      exempel: k.exempel,
      kalla: g.kalla,
      popularitet: karna.pop,
      granskning: {
        of2_ordklass: karna.klass,
        of3_parvis: 'inga synonympar i SO, SAOL, Wiktionary eller synonymer.se mot ordet och facit, inga mellan distraktorerna i SO, SAOL eller Wiktionary',
        of6_stil: 'ingen stilmarkering i SO eller SAOL',
        kandidat_fran: k.kalla_kandidat,
        ifyllda_distraktorer: 0,
      },
      fran_version: VERSION,
    });
  }
}

for (const a of avvisade) console.log(`AVVISAD ${a.niva}-${a.typ} ${a.ord}=${a.facit}: ${a.skal.join('; ')}`);
for (const n of NIVAER) console.log(`${n}: ${nya[n].filter((q) => q.typ === 'synonym').length} synonymer, ${nya[n].filter((q) => q.typ === 'antonym').length} motsatsord godkända`);
console.log(`${kand.length} kandidater, ${godkanda.length} godkända, ${avvisade.length} avvisade`);
if (!torr) {
  for (const n of NIVAER) writeFileSync(fil(n), JSON.stringify([...banker[n], ...nya[n]], null, 1) + '\n');
  writeFileSync('src/lib/ordforradV1/kandidater/avvisade-2026-11-19.json', JSON.stringify(avvisade.map(({ niva, typ, ord, facit, skal }) => ({ niva, typ, ord, facit, skal })), null, 1) + '\n');
}
