// scripts/lib/bank-text.mjs
// =============================================================================
// Gemensamma textkontroller för validate-verbal-bank.mjs och
// validate-numerisk-bank.mjs: tankstreck (samma tecken som TANKSTRECK i
// validate-v7-questions.mjs) och engelska gränssnittsord, plus ett litet
// ramverk för fel och varningar per numrerad regel.
// =============================================================================

import { readFileSync } from 'node:fs';

export const TANKSTRECK = /[—–]/;
export const ENGELSKA = /\b(passage|statement|true|false)\b/i;
export const ord = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean);

export function nyRapport() {
  const fel = []; const varningar = [];
  return {
    fel, varningar,
    f: (regel, id, text) => fel.push({ regel, id, text }),
    v: (regel, id, text) => varningar.push({ regel, id, text }),
  };
}

export const rad = (x) => `[regel ${x.regel}] ${x.id}: ${x.text}`;

export function lasBank(fil) {
  const b = JSON.parse(readFileSync(fil, 'utf8'));
  return Array.isArray(b) ? b : Object.values(b).find(Array.isArray) ?? [];
}

/** Id:n i en bank, både på textnivå och frågenivå. */
export function idIBank(fil) {
  const ids = new Set();
  for (const p of lasBank(fil)) {
    if (p.id) ids.add(p.id);
    for (const q of p.questions ?? []) if (q.id) ids.add(q.id);
  }
  return ids;
}

/**
 * Skriver rapporten. Med niva (skarpt läge) är fel fel och ger exit 1; utan
 * niva är allt upplysning och exit 0. Upprepade regler sammanfattas så att
 * en körning över en hel bank går att läsa.
 */
export function skrivRapport(namn, fil, r, skarpt, { max = 6 } = {}) {
  const grupp = (lista) => {
    const per = new Map();
    for (const x of lista) { if (!per.has(x.regel)) per.set(x.regel, []); per.get(x.regel).push(x); }
    return [...per.entries()].sort((a, b) => a[0] - b[0]);
  };
  console.log(`\n${namn}: ${fil}${skarpt ? '' : ' (upplysning, inga krav)'}`);
  const visa = (rubrik, lista) => {
    if (!lista.length) return;
    console.log(`${rubrik} (${lista.length}):`);
    for (const [regel, xs] of grupp(lista)) {
      console.log(`  regel ${regel}: ${xs.length}`);
      xs.slice(0, max).forEach((x) => console.log('    - ' + rad(x)));
      if (xs.length > max) console.log(`    ... och ${xs.length - max} till`);
    }
  };
  if (skarpt) { visa('✗ Fel', r.fel); visa('Varningar', r.varningar); }
  else visa('Upplysning', [...r.fel, ...r.varningar]);
  if (skarpt && r.fel.length === 0) console.log(`✓ Inga fel${r.varningar.length ? `, ${r.varningar.length} varningar` : ''}.`);
  if (!skarpt && !r.fel.length && !r.varningar.length) console.log('✓ Inget att anmärka.');
}
