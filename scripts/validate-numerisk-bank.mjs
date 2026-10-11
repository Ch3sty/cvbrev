// scripts/validate-numerisk-bank.mjs
// =============================================================================
// Validering av numeriska underlag (beställningen "svarare frågor", 4.2).
// Schema: scripts/schema/numerisk-underlag.schema.json.
//
// Kör: node scripts/validate-numerisk-bank.mjs                       (de tre bankerna, upplysning)
//      node scripts/validate-numerisk-bank.mjs <fil.json>            (upplysning, exit 0)
//      node scripts/validate-numerisk-bank.mjs <fil.json> --niva=avancerad
//      node scripts/validate-numerisk-bank.mjs <fil.json> --niva=grund
//                                                                    (krav, exit 1 vid fel)
//
// Regler (numren står i varje rad):
//   1  struktur, fyra frågor med fyra alternativ, ett rätt som matchar
//      correctAnswerId, id-mönster, unika id mot de tre bankerna
//   2  räknekontroll: varje steg räknas (scripts/lib/raknare.mjs) och stämmer
//      inom 0,5 procent; sista steget avrundat är talet i rätt alternativ
//   3  avrundningsmarginal: sista steget minst 0,1 visningsenheter från en halv
//   4  varje tal med minst två siffror i ett uttryck finns i tabellen,
//      diagrammet, inledningen eller frågan, eller är ett tidigare stegs värde
//      (100 och 1 000 är omräkningsfaktorer och undantas)
//   5  varje fel alternativ har misstag med typ, uttryck och värde som stämmer;
//      alternativen skiljer sig minst 3 procent eller en visningsenhet
//   6  avancerad: två eller tre steg på minst tre av fyra frågor;
//      grund: ett eller två steg, minst två av fyra frågor har två
//   7  ovanvant: minst en rad eller kolumn, och inget tal ur den i något steg
//      (grund: frivilligt, men finns fältet gäller samma kontroll)
//   8  enhetsbyte: fältet finns, båda enheterna nämns
//      (grund: frivilligt, men finns fältet ska båda enheterna nämnas)
//   9  svensk talform: decimalkomma, mellanslag som tusentalsavgränsare och
//      före enhet
//   10 "cirka" bara när svaret är avrundat (varning)
//   11 inga tankstreck, inga engelska ord
//   12 type table eller graph med dataTable respektive chartData
//
// Id-mönster: avancerad na-NN-namn och na-NN-q0N, grund ng-NN-namn och
// ng-NN-q0N.
// =============================================================================

import { TANKSTRECK, ENGELSKA, nyRapport, idIBank, lasBank, skrivRapport } from './lib/bank-text.mjs';
import { rakna, parsaSvensktTal, allaTal, talI, avrunda } from './lib/raknare.mjs';

export const MISSTAG = ['fel_rad', 'fel_kolumn', 'steg_saknas', 'fel_enhet', 'fel_operation', 'avrundning', 'fel_bas'];
export const BANKER = ['src/lib/numericalTest/questionBank.json', 'src/lib/numericalTestV2/questionBank.json', 'src/lib/numericalTestExpert/questionBank.json'];
const FAKTORER = new Set([100, 1000]);
const nara = (a, b, rel = 0.005) => Math.abs(a - b) <= Math.max(Math.abs(b) * rel, 1e-9);
const ENHETER = { procent: ['procent', '%'], antal: ['antal'] };

function kallText(p) {
  const delar = [p.contextText ?? ''];
  if (p.dataTable) delar.push(p.dataTable.headers.join(' | '), ...p.dataTable.rows.map((r) => r.join(' | ')), p.dataTable.caption ?? '');
  if (p.chartData) delar.push(...(p.chartData.data ?? []).map((d) => `${d.label ?? d.x} ${d.value ?? d.y}`));
  return delar.join(' | ');
}

/** Talen i en rad eller kolumn som ovanvant pekar ut. */
function ovanvantTal(p, post) {
  const m = String(post).match(/^(rad|kolumn|stapel|punkt)\s+(.+)$/i);
  if (!m) return null;
  const [, typ, namn] = m;
  if (p.dataTable) {
    const t = p.dataTable;
    if (typ.toLowerCase() === 'rad') { const r = t.rows.find((x) => String(x[0]) === namn); return r ? r.slice(1).flatMap((c) => allaTal(c)) : null; }
    if (typ.toLowerCase() === 'kolumn') { const i = t.headers.indexOf(namn); return i >= 0 ? t.rows.flatMap((r) => allaTal(r[i])) : null; }
  }
  if (p.chartData) {
    const d = (p.chartData.data ?? []).find((x) => String(x.label ?? x.x) === namn);
    return d ? [Math.abs(d.value ?? d.y)] : null;
  }
  return null;
}

/** Talen i underlaget utom den rad, kolumn eller punkt som ovanvant pekar ut. */
function ovrigaTal(p, post) {
  const [typ, ...rest] = String(post).split(/\s+/);
  const namn = rest.join(' ');
  const t = p.dataTable;
  const delar = [p.contextText ?? ''];
  if (t) {
    const iKol = typ.toLowerCase() === 'kolumn' ? t.headers.indexOf(namn) : -1;
    for (const row of t.rows) {
      if (typ.toLowerCase() === 'rad' && String(row[0]) === namn) continue;
      delar.push(...row.filter((_, i) => i !== iKol).map(String));
    }
  }
  if (p.chartData) delar.push(...(p.chartData.data ?? []).filter((d) => String(d.label ?? d.x) !== namn).map((d) => `${d.value ?? d.y}`));
  return allaTal(delar.join(' | '));
}

function svenskForm(text) {
  const s = String(text);
  const fel = [];
  if (/\d\.\d/.test(s)) fel.push('punkt som decimaltecken');
  if (/\d(%|mkr|tkr|kr|kWh|MWh|st|ton)\b/.test(s) || /\d%/.test(s)) fel.push('inget mellanslag före enheten');
  for (const m of s.matchAll(/(?<![\d ,.])\d{4,}(?![\d,.])/g)) {
    const n = Number(m[0]);
    if (m[0].length === 4 && n >= 1900 && n <= 2099) continue; // årtal
    fel.push(`${m[0]} saknar mellanslag som tusentalsavgränsare`);
  }
  return fel;
}

export function validera(underlag, { niva = null, andraIds = new Set() } = {}) {
  const r = nyRapport();
  const sett = new Set();
  const grund = niva === 'grund';
  const pre = grund ? 'ng' : 'na';
  const idMonster = grund ? /^ng-\d{2}-[a-z0-9-]+$/ : /^na-\d{2}-[a-z0-9-]+$/;
  const qIdMonster = grund ? /^ng-\d{2}-q0[1-4]$/ : /^na-\d{2}-q0[1-4]$/;
  for (const p of underlag) {
    const id = p.id ?? '(utan id)';
    // 1
    for (const f of ['id', 'title', 'type', 'topic', 'difficulty', 'contextText', 'questions']) if (p[f] === undefined) r.f(1, id, `fältet ${f} saknas`);
    const qs = Array.isArray(p.questions) ? p.questions : [];
    if (qs.length !== 4) r.f(1, id, `${qs.length} frågor, exakt fyra krävs`);
    for (const x of [id, ...qs.map((q) => q.id)]) {
      if (sett.has(x)) r.f(1, id, `id ${x} finns två gånger i filen`);
      sett.add(x);
      if (andraIds.has(x)) r.f(1, id, `id ${x} finns redan i en annan numerisk bank`);
    }
    if (niva && !idMonster.test(id)) r.f(1, id, `id följer inte mönstret ${pre}-NN-namn`);
    // 12
    if (!['table', 'graph'].includes(p.type)) r.f(12, id, `type ${p.type}, bara table och graph är beställda`);
    if (p.type === 'table' && !p.dataTable) r.f(12, id, 'table kräver dataTable');
    if (p.type === 'graph') {
      const c = p.chartData;
      if (!c) r.f(12, id, 'graph kräver chartData');
      else if (!['bar', 'line', 'pie'].includes(c.chartType) || !Array.isArray(c.data) || !c.data.length) r.f(12, id, 'chartData följer inte ChartData');
      else if (c.chartType === 'line' ? c.data.some((d) => d.x === undefined || typeof d.y !== 'number') : c.data.some((d) => typeof d.label !== 'string' || typeof d.value !== 'number')) r.f(12, id, 'chartData har punkter i fel form');
    }
    const kall = kallText(p);
    const kallTal = allaTal(kall);
    let flerSteg = 0;
    let tvaSteg = 0;
    qs.forEach((q, qi) => {
      const qid = q.id ?? `${id} fråga ${qi + 1}`;
      if (niva && !qIdMonster.test(q.id ?? '')) r.f(1, qid, `id följer inte mönstret ${pre}-NN-q0N`);
      const opts = Array.isArray(q.options) ? q.options : [];
      if (opts.length !== 4) r.f(1, qid, `${opts.length} alternativ, exakt fyra krävs`);
      const ratta = opts.filter((o) => o.isCorrect === true);
      if (ratta.length !== 1) r.f(1, qid, `${ratta.length} rätta alternativ`);
      else if (ratta[0].id !== q.correctAnswerId) r.f(1, qid, 'correctAnswerId pekar inte på det rätta alternativet');
      // 2
      const b = q.berakning;
      const harB = b && Array.isArray(b.steg) && b.steg.length && typeof b.precision === 'number';
      if (!harB) r.f(2, qid, 'berakning med steg och precision saknas');
      const precision = harB ? b.precision : 1;
      const steg = harB ? b.steg : [];
      const tidigare = [];
      let ok = harB;
      for (const [si, s] of steg.entries()) {
        let v;
        try { v = rakna(s.uttryck); } catch (e) { r.f(2, qid, `steg ${si + 1}: ${e.message}`); ok = false; continue; }
        if (typeof s.varde !== 'number' || !nara(v, s.varde)) r.f(2, qid, `steg ${si + 1}: ${s.uttryck} blir ${+v.toFixed(4)}, inte ${s.varde}`);
        // 4
        for (const t of talI(s.uttryck)) {
          const n = Math.abs(t.tal);
          if (t.text.replace(/\D/g, '').length < 2 || FAKTORER.has(n)) continue;
          const finns = kallTal.some((x) => nara(x, n, 1e-9)) || allaTal(q.questionText).some((x) => nara(x, n, 1e-9)) || tidigare.some((x) => nara(Math.abs(x), n));
          if (!finns) r.f(4, qid, `steg ${si + 1}: talet ${t.text} finns inte i underlaget`);
        }
        tidigare.push(s.varde);
      }
      if (steg.length >= 2 && steg.length <= 3) flerSteg++;
      if (steg.length === 2) tvaSteg++;
      if (grund && steg.length > 2) r.f(6, qid, `${steg.length} steg, grund tillåter högst två`);
      const sista = steg[steg.length - 1]?.varde;
      const rattTal = ratta[0] ? parsaSvensktTal(ratta[0].text) : null;
      if (ok && typeof sista === 'number') {
        if (rattTal === null || !nara(avrunda(sista, precision), rattTal, 1e-9)) r.f(2, qid, `sista steget ${sista} avrundat till ${precision} decimaler är inte ${ratta[0]?.text}`);
        // 3
        const frac = Math.abs(sista * 10 ** precision) % 1;
        if (Math.abs(frac - 0.5) < 0.1) r.f(3, qid, `${sista} ligger för nära en halv visningsenhet`);
        // 10
        if (ratta[0] && /cirka/i.test(ratta[0].text) && nara(avrunda(sista, precision), sista, 1e-9)) r.v(10, qid, '"cirka" fast svaret inte är avrundat');
      }
      // 5 (bara när underlaget har berakning; de gamla bankerna saknar misstag)
      const tal = opts.map((o) => parsaSvensktTal(o.text));
      opts.forEach((o, oi) => {
        if (o.isCorrect || !harB) return;
        const m = o.misstag;
        if (!m || !MISSTAG.includes(m.typ) || typeof m.uttryck !== 'string' || typeof m.varde !== 'number') { r.f(5, qid, `alternativ ${o.id}: misstag med typ, uttryck och värde saknas`); return; }
        try { if (!nara(rakna(m.uttryck), m.varde)) r.f(5, qid, `alternativ ${o.id}: ${m.uttryck} blir inte ${m.varde}`); } catch (e) { r.f(5, qid, `alternativ ${o.id}: ${e.message}`); }
        if (tal[oi] === null || !nara(avrunda(m.varde, precision), tal[oi], 1e-9)) r.f(5, qid, `alternativ ${o.id}: ${m.varde} avrundat är inte ${o.text}`);
      });
      const enhet = 10 ** -precision;
      for (let i = 0; i < tal.length; i++) for (let j = i + 1; j < tal.length; j++) {
        if (tal[i] === null || tal[j] === null) continue;
        const d = Math.abs(tal[i] - tal[j]);
        if (d < 1e-9) r.f(5, qid, `alternativ ${opts[i].id} och ${opts[j].id} har samma tal`);
        else if (d / Math.max(Math.abs(tal[i]), Math.abs(tal[j])) < 0.03 && d < enhet - 1e-9) r.f(5, qid, `alternativ ${opts[i].id} och ${opts[j].id} ligger för nära varandra`);
      }
      // 9
      opts.forEach((o) => svenskForm(o.text).forEach((x) => r.f(9, qid, `alternativ ${o.id}: ${x}`)));
      // 11
      const text = [q.questionText, q.explanation, ...opts.map((o) => o.text)].join(' ');
      if (TANKSTRECK.test(text)) r.f(11, qid, 'tankstreck');
      const en = [q.questionText, ...opts.map((o) => o.text)].join(' ').match(ENGELSKA);
      if (en) r.f(11, qid, `engelskt ord "${en[0]}"`);
    });
    // 6
    if (niva === 'avancerad' && flerSteg < 3) r.f(6, id, `${flerSteg} av ${qs.length} frågor har två eller tre steg, minst tre krävs`);
    if (grund && tvaSteg < 2) r.f(6, id, `${tvaSteg} av ${qs.length} frågor har två steg, minst två krävs`);
    // 7
    const ov = Array.isArray(p.ovanvant) ? p.ovanvant : [];
    if (niva && !grund && !ov.length) r.f(7, id, 'ovanvant saknas');
    for (const post of ov) {
      const t = ovanvantTal(p, post);
      if (t === null) { r.f(7, id, `ovanvant "${post}" finns inte i underlaget`); continue; }
      const ovrigt = ovrigaTal(p, post);
      for (const q of qs) for (const s of q.berakning?.steg ?? []) for (const x of talI(s.uttryck)) {
        const n = Math.abs(x.tal);
        if (t.some((y) => nara(y, n, 1e-9)) && !ovrigt.some((y) => nara(y, n, 1e-9))) r.f(7, q.id, `steg använder ${x.text} ur ${post}`);
      }
    }
    // 8
    if (niva && !grund && !p.enhetsbyte) r.f(8, id, 'enhetsbyte saknas');
    if (p.enhetsbyte) {
      const [a, b] = String(p.enhetsbyte).split(/\s+till\s+/);
      const text = [p.contextText, ...qs.map((q) => q.questionText)].join(' ').toLowerCase();
      for (const e of [a, b]) {
        if (!e) { r.f(8, id, `enhetsbyte "${p.enhetsbyte}" ska skrivas "A till B"`); continue; }
        const varianter = ENHETER[e.toLowerCase()] ?? [e.toLowerCase()];
        if (!varianter.some((x) => text.includes(x.toLowerCase()))) r.f(8, id, `enheten ${e} nämns varken i inledningen eller i någon fråga`);
      }
    }
    // 9
    for (const x of svenskForm(p.contextText)) r.f(9, id, `inledningen: ${x}`);
    for (const row of p.dataTable?.rows ?? []) for (const c of row) for (const x of svenskForm(c)) r.f(9, id, `tabellen "${c}": ${x}`);
    // 11
    if (TANKSTRECK.test([p.title, p.contextText, p.dataTable?.caption ?? ''].join(' '))) r.f(11, id, 'tankstreck');
    const en = [p.title, p.contextText].join(' ').match(ENGELSKA);
    if (en) r.f(11, id, `engelskt ord "${en[0]}"`);
  }
  return r;
}

export function andraIdn(fil) {
  const ids = new Set();
  for (const b of BANKER) if (!fil || !fil.replace(/\\/g, '/').endsWith(b)) for (const x of idIBank(b)) ids.add(x);
  return ids;
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/validate-numerisk-bank.mjs')) {
  const args = process.argv.slice(2);
  const niva = args.find((a) => a.startsWith('--niva='))?.slice(7) ?? null;
  const filer = args.filter((a) => !a.startsWith('--'));
  let exit = 0;
  for (const fil of filer.length ? filer : BANKER) {
    const r = validera(lasBank(fil), { niva, andraIds: andraIdn(fil) });
    skrivRapport('Numerisk validering', fil, r, Boolean(niva));
    if (niva && r.fel.length) exit = 1;
  }
  process.exit(exit);
}
