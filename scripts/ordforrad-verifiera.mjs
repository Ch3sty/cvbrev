// scripts/ordforrad-verifiera.mjs
// =============================================================================
// Oberoende verifierare för ordförrådsbanken (2026-11-19). Delar ingen kod med
// byggskripten och kompletterar scripts/validate-ordforrad.mjs (OF1 till OF8)
// med det som går att kontrollera maskinellt per uppgift och mellan versioner:
//
//  V1  form: id of-<g|a|e>-<s|m>-<nn> som stämmer med nivå, typ och fil; fem
//      alternativ i gemener, bara bokstäver, högst 16 tecken, inga dubbletter
//  V2  exakt ett rätt svar: correctAnswer pekar på det enda alternativet med
//      tom typ och tom misstagstext; övriga fyra har typ och misstagstext
//  V3  unika id i hela banken, id-numren i följd per nivå och typ
//  V4  inga dubbletter: samma uppslagsord en gång i hela banken, samma ordpar
//      (åt något håll, oavsett typ) en gång, inget facit som är uppslagsordet
//  V5  ordklass: fältet finns, granskningens ordklass är densamma
//  V6  inget alternativ är stavningsvariant av facit (högst två bokstäver
//      skiljer och samma början). Ett alternativ som liknar uppslagsordet
//      (falsk vän, till exempel stänga och städa) är tillåtet men räknas upp
//      som anmärkning
//  V7  versioner: fran_version är ett heltal >= 1, nya versioner ligger sist i
//      filen, och en version högre än ORD_VERSION i select.ts räknas upp som
//      ännu inte aktiverad
//  V8  belägg: kalla.belagg ifyllt, verifierad_mot namnger källan, hamtad är
//      ett datum; motsatsdistraktorn har "Det är motsatsen", synonym-
//      distraktorn (motsatsuppgift) har "betyder ungefär detsamma som"
//  V9  texterna: exempelmeningen innehåller uppslagsordet, slutar med punkt
//      eller frågetecken, inga tankstreck
//
// Med --natet slås varje uppgift från --fran (standard 2) upp igen i SO, SAOL,
// Wiktionary och synonymer.se via scripts/ordforrad/so.mjs (cachat): facit ska
// vara belagt och ingen distraktor får vara synonym (eller motsats i en
// motsatsuppgift) till uppslagsordet enligt SO, SAOL eller Wiktionary.
//
// Kör: node scripts/ordforrad-verifiera.mjs
//      node scripts/ordforrad-verifiera.mjs --natet [--fran 2]
// Exit 1 vid fel.
// =============================================================================

import { readFileSync } from 'node:fs';

const NIVAER = [
  ['grund', 'g', 'src/lib/ordforradV1/bankGrund.json'],
  ['avancerad', 'a', 'src/lib/ordforradV1/bankAvancerad.json'],
  ['expert', 'e', 'src/lib/ordforradV1/bankExpert.json'],
];
const TYP = { synonym: 's', antonym: 'm' };
const ORDKLASSER = new Set(['substantiv', 'verb', 'adjektiv', 'adverb']);
const DISTRAKTORTYPER = new Set(['samma_falt', 'nara', 'antonym', 'synonym', 'falsk_van', 'annan']);

/** Antal bokstäver som skiljer (Levenshtein). */
function avstand(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

export function ordVersionISelect() {
  const m = readFileSync('src/lib/ordforradV1/select.ts', 'utf8').match(/export const ORD_VERSION = (\d+);/);
  return m ? Number(m[1]) : null;
}

export function verifiera(nivaer = NIVAER) {
  const fel = [];
  const info = [];
  const anm = [];
  const ids = new Map();
  const uppslag = new Map();
  const par = new Map();
  const aktiv = ordVersionISelect();
  if (aktiv === null) fel.push('select.ts: ORD_VERSION saknas');
  const perVersion = {};

  for (const [niva, kort, fil] of nivaer) {
    const bank = JSON.parse(readFileSync(fil, 'utf8'));
    const nummer = { synonym: [], antonym: [] };
    let hogsta = 0;
    for (const [rad, q] of bank.entries()) {
      const id = q.id ?? `${fil}[${rad}]`;
      const f = (t) => fel.push(`${id}: ${t}`);
      // V1
      const m = /^of-([gae])-([sm])-(\d{2,})$/.exec(q.id ?? '');
      if (!m) f('id har fel form');
      else {
        if (m[1] !== kort) f(`id säger nivå ${m[1]} men filen är ${niva}`);
        if (m[2] !== TYP[q.typ]) f(`id säger typ ${m[2]} men typ är ${q.typ}`);
        nummer[q.typ]?.push(Number(m[3]));
      }
      if (q.niva !== niva) f(`niva ${q.niva} i filen för ${niva}`);
      if (!(q.typ in TYP)) f(`okänd typ ${q.typ}`);
      if (typeof q.ord !== 'string' || !/^[a-zåäöé]+$/.test(q.ord)) f('uppslagsordet är inte ett ord i gemener');
      if (!Array.isArray(q.options) || q.options.length !== 5) f('ska ha fem alternativ');
      else {
        q.options.forEach((o) => {
          if (typeof o !== 'string' || !/^[a-zåäöé]+$/.test(o)) f(`alternativet "${o}" är inte ett ord i gemener`);
          else if (o.length > 16) f(`alternativet ${o} har fler än 16 bokstäver`);
        });
        if (new Set(q.options).size !== 5) f('två alternativ är lika');
        if (q.options.includes(q.ord)) f('uppslagsordet står bland alternativen');
      }
      // V2
      const ca = q.correctAnswer;
      if (!Number.isInteger(ca) || ca < 0 || ca > 4) f('correctAnswer utanför alternativen');
      else {
        const tomTyp = (q.typer ?? []).map((t, i) => (t === '' ? i : -1)).filter((i) => i >= 0);
        if (tomTyp.length !== 1 || tomTyp[0] !== ca) f(`exakt ett alternativ ska vara facit (tom typ på ${tomTyp.join(',') || 'inget'}, correctAnswer ${ca})`);
        if ((q.misstag ?? [])[ca]) f('facit har en misstagstext');
        (q.typer ?? []).forEach((t, i) => {
          if (i !== ca && !DISTRAKTORTYPER.has(t)) f(`okänd distraktortyp ${t}`);
          if (i !== ca && !(q.misstag ?? [])[i]) f(`distraktorn ${q.options[i]} saknar misstagstext`);
        });
        if ((q.typer ?? []).length !== 5 || (q.misstag ?? []).length !== 5) f('typer och misstag ska ha fem rader');
      }
      // V3
      if (ids.has(q.id)) f(`id finns redan i ${ids.get(q.id)}`);
      ids.set(q.id, niva);
      // V4
      const facit = q.options?.[ca];
      if (uppslag.has(q.ord)) f(`uppslagsordet ${q.ord} finns redan i ${uppslag.get(q.ord)}`);
      uppslag.set(q.ord, q.id);
      const nyckel = [q.ord, facit].sort().join('|');
      if (par.has(nyckel)) f(`ordparet ${q.ord} och ${facit} finns redan i ${par.get(nyckel)}`);
      par.set(nyckel, q.id);
      // V5
      if (!ORDKLASSER.has(q.ordklass)) f(`ordklassen ${q.ordklass} är okänd`);
      if (q.granskning?.of2_ordklass !== q.ordklass) f('granskningens ordklass skiljer sig från ordklassen');
      // V6
      (q.options ?? []).forEach((o, i) => {
        if (i === ca || !facit) return;
        if (avstand(o, facit) <= 2 && o.slice(0, 2) === facit.slice(0, 2)) f(`${o} är nästan samma stavning som facit ${facit}`);
        if (avstand(o, q.ord) <= 2 && o.slice(0, 2) === q.ord.slice(0, 2)) anm.push(`${id}: ${o} liknar uppslagsordet i stavningen (falsk vän)`);
      });
      // V7
      if (!Number.isInteger(q.fran_version) || q.fran_version < 1) f('fran_version saknas eller är inte ett heltal');
      else {
        if (q.fran_version < hogsta) f(`version ${q.fran_version} ligger efter version ${hogsta} i filen (nya uppgifter läggs sist)`);
        hogsta = Math.max(hogsta, q.fran_version);
        const k = `${q.fran_version}`;
        perVersion[k] ??= {};
        perVersion[k][`${niva} ${q.typ}`] = (perVersion[k][`${niva} ${q.typ}`] ?? 0) + 1;
      }
      // V8
      if (!q.kalla?.belagg?.length) f('belägg saknas');
      if (!/^(SO|SAOL|Wiktionary)/.test(q.kalla?.verifierad_mot ?? '')) f('verifierad_mot namnger ingen källa');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(q.kalla?.hamtad ?? '')) f('hamtad är inget datum');
      (q.typer ?? []).forEach((t, i) => {
        if (t === 'antonym' && !/^Det är motsatsen\./.test(q.misstag[i])) f(`motsatsdistraktorn ${q.options[i]} saknar "Det är motsatsen."`);
        if (t === 'synonym' && !/betyder ungefär detsamma som/.test(q.misstag[i])) f(`synonymdistraktorn ${q.options[i]} saknar "betyder ungefär detsamma som"`);
        if (t === 'antonym' && q.typ !== 'synonym') f('motsatsdistraktor i en motsatsuppgift');
        if (t === 'synonym' && q.typ !== 'antonym') f('synonymdistraktor i en synonymuppgift');
      });
      if (!q.facit_betyder) (q.fran_version > 1 ? f : (t) => anm.push(`${id}: ${t}`))('facit_betyder är tomt, genomgången visar ingen definition');
      // V9
      const stam = q.ord.slice(0, Math.max(3, Math.min(q.ord.length, q.ord.length - 2)));
      if (!(q.exempel ?? '').toLowerCase().includes(stam)) f('exempelmeningen saknar uppslagsordet');
      if (!/[.?]$/.test(q.exempel ?? '')) f('exempelmeningen slutar inte med punkt eller frågetecken');
      if ([q.exempel, q.facit_betyder, ...(q.misstag ?? [])].some((t) => /[–—]/.test(t ?? ''))) f('tankstreck i texten');
    }
    for (const [t, nr] of Object.entries(nummer)) {
      const s = [...nr].sort((a, b) => a - b);
      s.forEach((n, i) => {
        if (n !== i + 1) fel.push(`${niva} ${t}: id-numren går inte i följd (väntade ${i + 1}, fann ${n})`);
      });
    }
  }
  for (const [v, antal] of Object.entries(perVersion)) {
    const status = aktiv !== null && Number(v) > aktiv ? `INTE aktiverad (ORD_VERSION är ${aktiv})` : 'aktiv';
    info.push(`version ${v}: ${Object.values(antal).reduce((a, b) => a + b, 0)} uppgifter, ${status}: ${Object.entries(antal).map(([k, n]) => `${k} ${n}`).join(', ')}`);
  }
  return { fel: [...new Set(fel)], info, anm };
}

/** Uppslag i SO, SAOL, Wiktionary och synonymer.se för uppgifterna från version `fran`. */
export async function verifieraNatet(fran = 2, nivaer = NIVAER) {
  const { slaUpp, relation, wiktionary } = await import('./ordforrad/so.mjs');
  const fel = [];
  const uppslag = new Map();
  const hamta = async (w) => {
    if (!uppslag.has(w)) uppslag.set(w, { so: await slaUpp(w), wikt: await wiktionary(w) });
    return uppslag.get(w);
  };
  for (const [, , fil] of nivaer) {
    for (const q of JSON.parse(readFileSync(fil, 'utf8')).filter((x) => x.fran_version >= fran)) {
      const klass = (e) => e.so.filter((x) => x.ordklass === q.ordklass);
      const O = await hamta(q.ord);
      const facit = q.options[q.correctAnswer];
      const F = await hamta(facit);
      if (!klass(O).length) fel.push(`${q.id}: ${q.ord} finns inte som ${q.ordklass} i SO eller SAOL`);
      if (!klass(F).length) fel.push(`${q.id}: ${facit} finns inte som ${q.ordklass} i SO eller SAOL`);
      const wRel = (A, B, a, b, t) => (t === 'synonym' ? A.wikt.syn.has(b) || B.wikt.syn.has(a) : A.wikt.ant.has(b) || B.wikt.ant.has(a));
      let belagt = relation(klass(O), klass(F), q.ord, facit, q.typ, q.ordklass).length > 0 || wRel(O, F, q.ord, facit, q.typ);
      // motsats i två steg: en synonym S till ordet (eller facit) har den andra som motsats i SO
      const steg = q.kalla.belagg.map((b) => /^(?:SO|SAOL) (\S+): synonym eller förklaring (\S+)$/.exec(b)).find(Boolean);
      if (!belagt && steg && q.typ === 'antonym') {
        const [, a, s] = steg;
        const andra = a === q.ord ? facit : q.ord;
        const S = await hamta(s);
        const B = await hamta(andra);
        belagt = relation(klass(S), klass(B), s, andra, 'antonym', q.ordklass).length > 0;
      }
      if (!belagt) fel.push(`${q.id}: ${facit} är inte belagt som ${q.typ} till ${q.ord} i SO, SAOL eller Wiktionary`);
      for (const [i, d] of q.options.entries()) {
        if (i === q.correctAnswer) continue;
        const D = await hamta(d);
        if (!klass(D).length) fel.push(`${q.id}: distraktorn ${d} finns inte som ${q.ordklass}`);
        const sammaTyp = relation(klass(O), klass(D), q.ord, d, q.typ, q.ordklass).filter((r) => r.styrka === 'stark').length > 0 || wRel(O, D, q.ord, d, q.typ);
        if (sammaTyp) fel.push(`${q.id}: distraktorn ${d} är ${q.typ === 'synonym' ? 'synonym' : 'motsats'} till ${q.ord} enligt SO, SAOL eller Wiktionary`);
        if (q.typ === 'antonym' && q.typer[i] !== 'synonym') {
          const syn = relation(klass(O), klass(D), q.ord, d, 'synonym', q.ordklass).filter((r) => r.styrka === 'stark').length > 0 || wRel(O, D, q.ord, d, 'synonym');
          if (syn) fel.push(`${q.id}: distraktorn ${d} är synonym till ${q.ord} men inte märkt så`);
        }
      }
    }
  }
  return fel;
}

if (process.argv[1]?.endsWith('ordforrad-verifiera.mjs')) {
  const { fel, info, anm } = verifiera();
  for (const r of info) console.log(r);
  for (const a of anm) console.log(`anmärkning ${a}`);
  for (const f of fel) console.log(f);
  let natFel = [];
  if (process.argv.includes('--natet')) {
    const i = process.argv.indexOf('--fran');
    const fran = i > 0 ? Number(process.argv[i + 1]) : 2;
    natFel = await verifieraNatet(fran);
    for (const f of natFel) console.log(f);
    console.log(`Uppslag från version ${fran}: ${natFel.length} fel.`);
  }
  const n = fel.length + natFel.length;
  console.log(n ? `${n} fel` : 'Ordförrådsbanken klarar V1 till V9.');
  process.exit(n ? 1 : 0);
}
