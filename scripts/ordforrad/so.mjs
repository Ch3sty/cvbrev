// scripts/ordforrad/so.mjs
// =============================================================================
// Uppslag i Svensk ordbok (SO) och SAOL via svenska.se:s öppna sök-API (GET,
// samma anrop som webbplatsen själv gör). Svaren cachas utanför git, i
// katalogen SO_CACHE (standard: jobbcoach-so-cache i systemets temp), så
// att en omkörning inte frågar igen.
//
// Varje uppslag ger, per ordklass: synonymer (SO "SYN"), motsatser (SO
// "MOTSATS"), jämför-ord (SO "JFR", svagt), definitionsord (SO:s och SAOL:s
// definitioner, ordformer inräknade), stilmarkeringar och SO:s
// popularitetstal (används för nivåns frekvensband).
// =============================================================================

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CACHE = process.env.SO_CACHE ?? path.join(os.tmpdir(), 'jobbcoach-so-cache');
const vanta = (ms) => new Promise((r) => setTimeout(r, ms));
let senast = 0;

async function hamta(ordbok, ord) {
  mkdirSync(CACHE, { recursive: true });
  const fil = path.join(CACHE, `${ordbok}-${encodeURIComponent(ord)}.json`);
  if (existsSync(fil)) return JSON.parse(readFileSync(fil, 'utf8'));
  const vant = 250 - (Date.now() - senast);
  if (vant > 0) await vanta(vant);
  senast = Date.now();
  const url = `https://svenska.se/api/search/${ordbok}?q=${encodeURIComponent(ord)}&size=10&exactMatch=true`;
  for (let forsok = 0; forsok < 3; forsok++) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/json' } });
      if (r.ok) {
        const j = await r.json();
        writeFileSync(fil, JSON.stringify(j));
        return j;
      }
    } catch {
      /* försök igen */
    }
    await vanta(1000 * (forsok + 1));
  }
  throw new Error(`svenska.se svarade inte för ${ordbok} ${ord}`);
}

const ren = (html) => (html ?? '').replace(/<[^>]+>/g, '').replace(/\d/g, '').trim().toLowerCase();
const ord = (text) => (text ?? '').toLowerCase().replace(/<[^>]+>/g, ' ').match(/[a-zåäöéü]+/g) ?? [];

function samla(o, ut) {
  if (Array.isArray(o)) o.forEach((x) => samla(x, ut));
  else if (o && typeof o === 'object') {
    if (o.typ && o.hänvisning) {
      const w = ren(o.hänvisning);
      if (o.typ.startsWith('SYN')) ut.syn.add(w);
      else if (o.typ.startsWith('MOTS')) ut.mots.add(w);
      else if (o.typ.startsWith('JFR')) ut.jfr.add(w);
    }
    // Synonymlistor i definitionerna: en definition (eller del mellan komman och
    // semikolon) som bara är ett eller två ord, som SAOL:s "omsorgsfull; riktig,
    // exakt" eller SO:s "välvillig, tolerant" (ett ord per del). Längre delar beskriver
    // ordet med överordnade ord ("tala tyst ...") och räknas inte.
    if (typeof o.definition === 'string') {
      for (const del of ren(o.definition).replace(/\([^)]*\)/g, ' ').split(/[,;]| el\. | eller /)) {
        const w = ord(del);
        if (w.length === 1 && w[0].length > 2) ut.def.add(w[0]);
      }
    }
    for (const v of Object.values(o)) if (typeof v === 'object') samla(v, ut);
  }
}

// Stilmarkering på ordets huvudbetydelse (SO:s bruklighetskommentar eller en
// markering först i definitionen). Markeringar på enstaka underbetydelser och
// fasta uttryck räknas inte: ordet är ändå neutralt i sin vanliga betydelse.
const STIL = /vard|dial|slang|åld|ålderdom|skämts|nedsätt|svordom|föråldr/;
const stilFor = (s) => {
  const forsta = (s.huvudbetydelser ?? [])[0] ?? {};
  const kom = [forsta.bruklighetskommentar, forsta.stilvärde, forsta.stil, (forsta.definition ?? '').slice(0, 12)].filter((x) => typeof x === 'string').join(' ');
  return STIL.test(kom) ? [kom.match(STIL)[0]] : [];
};

/** Allt vi behöver om ett ord, per ordklass. Tom lista: ordet finns inte i SO eller SAOL. */
export async function slaUpp(lemma) {
  const so = await hamta('so', lemma);
  const saol = await hamta('saol', lemma);
  const ut = [];
  for (const h of so?.hits?.hits ?? []) {
    const s = h._source;
    if ((s.ortografi ?? '').toLowerCase() !== lemma) continue;
    const e = { kalla: 'SO', id: s.l_nr, ordklass: s.ordklass, syn: new Set(), mots: new Set(), jfr: new Set(), def: new Set(), stil: [], pop: s.popularity_count ?? 0, definitioner: (s.huvudbetydelser ?? []).map((b) => ren(b.definition)).filter(Boolean) };
    samla(s.huvudbetydelser, e);
    e.stil = stilFor(s);
    ut.push(e);
  }
  for (const h of saol?.hits?.hits ?? []) {
    const s = h._source;
    if ((s.ortografi ?? '').toLowerCase() !== lemma) continue;
    const e = { kalla: 'SAOL', id: s.id, ordklass: s.ordklass, syn: new Set(), mots: new Set(), jfr: new Set(), def: new Set(), stil: [], pop: s.popularity_count ?? 0, definitioner: (s.huvudbetydelser ?? []).map((b) => ren(b.definition)).filter(Boolean) };
    samla(s.huvudbetydelser, e);
    e.stil = stilFor(s);
    ut.push(e);
  }
  return ut;
}

/** Ordformer: ett definitionsord räknas som ordet om det är ordet eller en böjning (högst två bokstäver till). */
const traff = (mangd, lemma) => [...mangd].some((w) => w === lemma || (lemma.length >= 4 && w.startsWith(lemma) && w.length - lemma.length <= 2));

/**
 * Belägg för att b är synonym (eller motsats) till a, åt båda hållen.
 * Starka belägg: SO SYN, SO MOTSATS, ordet i SO:s eller SAOL:s definition.
 * Svagt: SO JFR (samordnat ord). Returnerar listan med belägg som text.
 */
export function relation(A, B, a, b, typ, ordklass) {
  const ut = [];
  const iKlass = (lista) => lista.filter((e) => !ordklass || e.ordklass === ordklass);
  for (const [X, x, y, omvant] of [[A, a, b, false], [B, b, a, true]]) {
    for (const e of iKlass(X)) {
      const pil = omvant ? `${e.kalla} ${x}` : `${e.kalla} ${x}`;
      if (typ === 'synonym') {
        if (e.syn.has(y)) ut.push({ styrka: 'stark', text: `${pil}: synonym ${y}` });
        if (traff(e.def, y)) ut.push({ styrka: 'stark', text: `${pil}: förklaras med ${y} ("${e.definitioner.find((d) => ord(d).some((w) => w === y || (y.length >= 4 && w.startsWith(y)))) ?? ''}")` });
        if (e.jfr.has(y)) ut.push({ styrka: 'svag', text: `${pil}: jämför ${y}` });
      } else {
        if (e.mots.has(y)) ut.push({ styrka: 'stark', text: `${pil}: motsats ${y}` });
      }
    }
  }
  return ut;
}

// ------------------------------------------------------------ Wiktionary
// Andra, oberoende källa (svenska Wiktionary, wikitext via action=raw):
// {{synonymer|...}} och {{antonymer|...}} under rubriken Svenska. Används för
// att bekräfta ett facit som SO bara har som "jämför", och för att fälla
// distraktorer som någon källa kallar synonym eller motsats.
export async function wiktionary(lemma) {
  mkdirSync(CACHE, { recursive: true });
  const fil = path.join(CACHE, `wikt-${encodeURIComponent(lemma)}.txt`);
  let text;
  if (existsSync(fil)) text = readFileSync(fil, 'utf8');
  else {
    const vant = 250 - (Date.now() - senast);
    if (vant > 0) await vanta(vant);
    senast = Date.now();
    try {
      const r = await fetch(`https://sv.wiktionary.org/w/index.php?title=${encodeURIComponent(lemma)}&action=raw`, { headers: { 'user-agent': 'jobbcoach-ordforrad/1.0 (kontroll av ordbank)' } });
      text = r.ok ? await r.text() : '';
    } catch {
      text = '';
    }
    writeFileSync(fil, text);
  }
  const sv = text.split(/\n==(?!=)/).find((d) => d.startsWith('Svenska==') || d.startsWith('Svenska ==')) ?? (text.startsWith('==Svenska==') ? text.split(/\n==(?!=)/)[0] : '');
  const MALL = { synonymer: /\{\{synonymer\|([^}]*)\}\}/g, antonymer: /\{\{antonymer\|([^}]*)\}\}/g };
  const lista = (mall) => new Set([...sv.matchAll(MALL[mall])].flatMap((m) => [...m[1].matchAll(/\[\[([^\]|#]+)/g)].map((x) => x[1].trim().toLowerCase())));
  return { syn: lista('synonymer'), ant: lista('antonymer') };
}

// ------------------------------------------------------------ synonymer.se
// Tredje källan: synonymer.se (synonymlistor per betydelse och rubriken
// "motsatsord"). Används som den andra oberoende källan, tillsammans med
// Wiktionary, när SO och SAOL saknar uppgiften (motsatsord saknas i SO för de
// flesta mindre vanliga ord), och för att fälla distraktorer.
export async function synonymerSe(lemma) {
  mkdirSync(CACHE, { recursive: true });
  const fil = path.join(CACHE, `synse-${encodeURIComponent(lemma)}.html`);
  let html;
  if (existsSync(fil)) html = readFileSync(fil, 'utf8');
  else {
    const vant = 250 - (Date.now() - senast);
    if (vant > 0) await vanta(vant);
    senast = Date.now();
    try {
      const r = await fetch(`https://www.synonymer.se/sv-syn/${encodeURIComponent(lemma)}`, { headers: { 'user-agent': 'jobbcoach-ordforrad/1.0 (kontroll av ordbank)' } });
      html = r.ok ? await r.text() : '';
    } catch {
      html = '';
    }
    writeFileSync(fil, html);
  }
  const syn = new Set();
  const ant = new Set();
  // varje betydelse är ett block med synonymlistan och ibland en motsatsordslista
  for (const block of html.split('class="py-3 border-b').slice(1)) {
    const [fore, efter] = block.split('>motsatsord</h2>');
    const lankar = (t) => [...(t ?? '').matchAll(/<a href="\/sv-syn\/[^"]*">([^<]+)<\/a>/g)].map((m) => m[1].trim().toLowerCase());
    lankar(fore.split('<!--/qv-->')[0]).forEach((w) => syn.add(w));
    if (efter) lankar(efter.split('</ol>')[0]).forEach((w) => ant.add(w));
  }
  return { syn, ant };
}
