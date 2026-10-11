// scripts/lib/raknare.mjs
// =============================================================================
// En liten räknare för facitkontrollen i numeriska underlag
// (validate-numerisk-bank.mjs). Ingen eval: uttrycket delas i tal och
// tecknen + - * / ^ ( ), och räknas med vanlig prioritet (potens först och
// från höger, sedan gånger och delat, sist plus och minus). Tal skrivs med
// punkt eller komma som decimaltecken och får ha mellanslag som
// tusentalsavgränsare ("1 240"). Division med noll och allt annat än de
// tillåtna tecknen ger ett fel.
//
// parsaSvensktTal läser det första talet ur en svensk text ("5,0 %",
// "1 240 tkr", "−3,2 mkr", "Cirka 11 %").
// =============================================================================

const TAL = /^\d{1,3}(?: \d{3})+(?:[.,]\d+)?(?!\d)|^\d+(?:[.,]\d+)?/;

export function tokens(uttryck) {
  const ut = [];
  let s = String(uttryck).replace(/−/g, '-');
  while (s.length) {
    if (/^\s/.test(s)) { s = s.slice(1); continue; }
    const m = s.match(TAL);
    if (m) { ut.push({ tal: Number(m[0].replace(/ /g, '').replace(',', '.')), text: m[0] }); s = s.slice(m[0].length); continue; }
    if ('+-*/^()'.includes(s[0])) { ut.push({ op: s[0] }); s = s.slice(1); continue; }
    throw new Error(`otillåtet tecken "${s[0]}" i "${uttryck}"`);
  }
  return ut;
}

/** Talen i uttrycket, i ordning. */
export function talI(uttryck) {
  return tokens(uttryck).filter((t) => 'tal' in t).map((t) => t);
}

export function rakna(uttryck) {
  const t = tokens(uttryck);
  let i = 0;
  const titta = () => t[i];
  const ta = () => t[i++];
  function primar() {
    const x = ta();
    if (!x) throw new Error(`uttrycket "${uttryck}" tar slut`);
    if ('tal' in x) return x.tal;
    if (x.op === '(') { const v = summa(); const s = ta(); if (!s || s.op !== ')') throw new Error(`parentes saknas i "${uttryck}"`); return v; }
    if (x.op === '-') return -potens();
    if (x.op === '+') return potens();
    throw new Error(`oväntat "${x.op}" i "${uttryck}"`);
  }
  function potens() {
    const bas = primar();
    if (titta()?.op === '^') { ta(); return bas ** potens(); }
    return bas;
  }
  function produkt() {
    let v = potens();
    while (titta() && (titta().op === '*' || titta().op === '/')) {
      const op = ta().op; const h = potens();
      if (op === '/' && h === 0) throw new Error(`division med noll i "${uttryck}"`);
      v = op === '*' ? v * h : v / h;
    }
    return v;
  }
  function summa() {
    let v = produkt();
    while (titta() && (titta().op === '+' || titta().op === '-')) { const op = ta().op; const h = produkt(); v = op === '+' ? v + h : v - h; }
    return v;
  }
  const v = summa();
  if (i !== t.length) throw new Error(`överblivet "${t[i].op ?? t[i].text}" i "${uttryck}"`);
  if (!Number.isFinite(v)) throw new Error(`"${uttryck}" ger inget ändligt tal`);
  return v;
}

const SV_TAL = /[-−]?\d{1,3}(?: \d{3})+(?:,\d+)?(?!\d)|[-−]?\d+(?:[.,]\d+)?/;
export function parsaSvensktTal(text) {
  const m = String(text).match(SV_TAL);
  if (!m) return null;
  return Number(m[0].replace(/−/g, '-').replace(/ /g, '').replace(',', '.'));
}

/** Alla tal i en text, normaliserade (tusentalsmellanslag bort, komma som punkt). */
export function allaTal(text) {
  const re = new RegExp(SV_TAL.source, 'g');
  return [...String(text).matchAll(re)].map((m) => Math.abs(Number(m[0].replace(/−/g, '-').replace(/ /g, '').replace(',', '.'))));
}

export const avrunda = (v, precision) => Math.round(v * 10 ** precision) / 10 ** precision;
