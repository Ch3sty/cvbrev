// scripts/lib/matris/generera-parti06.mjs
// =============================================================================
// Byggarna för matrisparti 06 (docs/fragebank/matris-2026-11-19-omg3.md).
// Nya primitiver och nya regeltyper i stället för nya startlägen:
//
//   klocka       två visare (figurseriernas primitiv) som bär var sin regel:
//                radvis eller kolumnvis vridning, schackmönster, diagonal,
//                latinsk kvadrat. Familjen tva-rorelser.
//   grupp        ett till nio små tecken på tärningens platser. Antalet
//                följer aritmetik över raden eller kolumnen (summa, skillnad,
//                jämna steg), formen och fyllningen egna regler (latinsk
//                kvadrat, schackmönster, diagonal). Familjen antal-andras.
//   streckfigur  åtta möjliga streck i en kvadrat: överlagring (allt, bara
//                det som skiljer, bara det gemensamma, det som blir kvar) och
//                figurer som byggs upp eller plockas isär streck för streck.
//
// Kontraktet är detsamma som i generera.mjs och generera-v3.mjs: (r, p) =>
// { family, title, rule, grid, facit, kandidater } eller null när slumpen gav
// ett ogiltigt rutnät. bygg() i generera.mjs väljer fem distraktorer och kör
// spärrarna.
// =============================================================================

import { stable, mod, PIL8 } from './celler.mjs';

const key = (c) => stable(c);
const sortNum = (a) => [...a].sort((x, y) => x - y);
const valj = (r, arr) => arr[Math.floor(r() * arr.length)];
function blanda(r, arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const ORD = { 1: 'ett', 2: 'två', 3: 'tre', 4: 'fyra' };
const RIKT = (k) => (mod(k, 8) * 2 < 8 ? 'medurs' : 'moturs');
const GRAD = (k) => (mod(k, 8) * 2 < 8 ? mod(k, 8) : 8 - mod(k, 8)) * 45;
const SCHACK = (rr, cc) => (rr + cc) % 2 === 0;
const DIAG = (rr, cc) => rr === cc;
const D_TEXT = 'på diagonalen från övre vänstra hörnet till nedre högra';
const unika = (l) => { const s = new Set(); return l.filter((c) => { const k = key(c); if (s.has(k)) return false; s.add(k); return true; }); };
/**
 * Oberoende (expert, som oberoende() i kontroll.mjs): med facit isatt får
 * ingen av egenskaperna bestämma en annan över de nio rutorna. Byggaren
 * slänger sådana rutnät direkt i stället för att låta generatorn göra det.
 */
function beroende(celler, falt) {
  for (let i = 0; i < falt.length; i++) for (let j = i + 1; j < falt.length; j++) {
    const x = celler.map((c) => String(c[falt[i]])); const y = celler.map((c) => String(c[falt[j]]));
    const komb = new Set(x.map((v, k) => `${v}|${y[k]}`)).size;
    if (komb === new Set(x).size || komb === new Set(y).size) return true;
  }
  return false;
}

/** Ett mönster för en kategorisk egenskap (eller en visare): värdet per ruta. */
function monster(r, regel, varden, s) {
  if (regel === 'konstant') { const a = valj(r, varden); return { f: () => a, a }; }
  const v = blanda(r, varden);
  if (regel === 'schack') return { f: (rr, cc) => (SCHACK(rr, cc) ? v[0] : v[1]), a: v[0], b: v[1] };
  if (regel === 'diagonal') return { f: (rr, cc) => (DIAG(rr, cc) ? v[0] : v[1]), a: v[0], b: v[1] };
  if (regel === 'latin') { const t = v.slice(0, 3); const sk = s ?? 1; return { f: (rr, cc) => t[mod(cc + sk * rr, 3)], varden: t }; }
  throw new Error(`okänt mönster ${regel}`);
}

// =============================================================================
// KLOCKAN: två visare, var sin regel
// =============================================================================
/**
 * p: { lang: spec, kort: spec, family }. spec:
 *   { regel: 'rorelse', axel: 'rad' | 'kolumn', k, d, mall: 'linjar' | 'fri', vaxlar }
 *   { regel: 'schack' | 'diagonal' | 'latin', s }
 * Ingen ruta och inget alternativ har visarna åt samma håll (K1).
 */
export function klockaRegler(r, p) {
  const hand = {};
  for (const h of ['lang', 'kort']) {
    const sp = p[h];
    if (sp.regel === 'rorelse') {
      const kol = sp.axel === 'kolumn';
      let start;
      if (sp.mall === 'fri') { const s = blanda(r, [0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 3); start = (i) => s[i]; }
      else { const s0 = Math.floor(r() * 8); start = (i) => s0 + sp.d * i; }
      const steg = (i) => (sp.vaxlar && i === 1 ? -sp.k : sp.k);
      hand[h] = { ...sp, f: kol ? (rr, cc) => mod(start(cc) + steg(cc) * rr, 8) : (rr, cc) => mod(start(rr) + steg(rr) * cc, 8) };
    } else {
      // Två eller tre lägen som inte ligger ett halvt varv isär (då går
      // mönstret också att läsa som en vridning 180 grader).
      let m; let n = 0;
      do { m = monster(r, sp.regel, [0, 1, 2, 3, 4, 5, 6, 7], sp.s); n++; } while (n < 20 && (m.a !== undefined ? mod(m.a - m.b, 8) === 4 : m.varden.some((x) => m.varden.includes(mod(x + 4, 8)))));
      hand[h] = { ...sp, ...m };
    }
  }
  const cell = (l, k) => ({ kind: 'klocka', lang: mod(l, 8), kort: mod(k, 8) });
  const g = [0, 1, 2].map((rr) => [0, 1, 2].map((cc) => cell(hand.lang.f(rr, cc), hand.kort.f(rr, cc))));
  if (g.flat().some((c) => c.lang === c.kort)) return null;
  if (p.oberoende && beroende(g.flat(), ['lang', 'kort'])) return null;
  const facit = g[2][2]; g[2][2] = null;

  // Fel per visare, de troligaste först.
  const fel = (h) => {
    const H = hand[h]; const R = facit[h];
    if (H.regel === 'rorelse') {
      const kol = H.axel === 'kolumn';
      const fore = kol ? g[1][2][h] : g[2][1][h];
      const k = H.k;
      return [fore, R + k, R - 2 * k, R + 1, R - 1, R + 2, R - 2, R + 4, R + 3, R - 3].map((x) => mod(x, 8));
    }
    const i = H.varden ?? [H.a, H.b];
    return [...i, ...[1, -1, 2, -2, 4].map((j) => mod(R + j, 8))];
  };
  const fl = fel('lang').filter((x) => x !== facit.lang);
  const fk = fel('kort').filter((x) => x !== facit.kort);
  const kand = [];
  for (let i = 0; i < Math.max(fl.length, fk.length); i++) {
    if (fl[i] !== undefined) kand.push(cell(fl[i], facit.kort));
    if (fk[i] !== undefined) kand.push(cell(facit.lang, fk[i]));
  }
  for (const a of fl.slice(0, 5)) for (const b of fk.slice(0, 5)) kand.push(cell(a, b));
  kand.push(cell(facit.kort, facit.lang));
  const kandidater = unika(kand).filter((c) => c.lang !== c.kort);

  const subj = { lang: 'Den långa visaren', kort: 'Den korta visaren' };
  const text = (h) => {
    const H = hand[h];
    if (H.regel === 'rorelse') {
      const g0 = GRAD(H.k); const rk = RIKT(H.k); const ann = rk === 'medurs' ? 'moturs' : 'medurs';
      if (H.axel === 'kolumn') {
        let t = H.vaxlar
          ? `${subj[h]} vrider sig ${g0} grader ${rk} för varje steg nedåt i den första och den tredje kolumnen, och lika mycket ${ann} i mittkolumnen.`
          : `${subj[h]} vrider sig ${g0} grader ${rk} för varje steg nedåt i kolumnen.`;
        if (H.mall === 'fri') t += ' Varje kolumn har sitt eget startläge.';
        else t += ` Varje kolumn börjar ${GRAD(H.d)} grader ${RIKT(H.d)} jämfört med kolumnen till vänster.`;
        return t;
      }
      let t = H.vaxlar
        ? `${subj[h]} vrider sig ${g0} grader ${rk} för varje steg åt höger i den första och den tredje raden, och lika mycket ${ann} i mittraden.`
        : `${subj[h]} vrider sig ${g0} grader ${rk} för varje steg åt höger i raden.`;
      if (H.mall === 'fri') t += ' Varje rad har sitt eget startläge.';
      else t += ` Varje rad börjar ${GRAD(H.d)} grader ${RIKT(H.d)} jämfört med raden ovanför.`;
      return t;
    }
    if (H.regel === 'schack') return `${subj[h]} pekar ${PIL8[H.a]} i hörnen och i mitten och ${PIL8[H.b]} i de andra rutorna, som ett schackmönster.`;
    if (H.regel === 'diagonal') return `${subj[h]} pekar ${PIL8[H.a]} ${D_TEXT} och ${PIL8[H.b]} i de andra rutorna.`;
    const [a, b, c] = H.varden;
    return `${subj[h]} pekar ${PIL8[a]}, ${PIL8[b]} eller ${PIL8[c]}, och varje riktning finns en gång i varje rad och en gång i varje kolumn.`;
  };
  const rorelser = ['lang', 'kort'].filter((h) => hand[h].regel === 'rorelse');
  const title = rorelser.length === 2
    ? (hand.lang.axel === hand.kort.axel ? 'Visarna vrider sig i olika takt' : 'En visare går radvis, den andra kolumnvis')
    : 'Den ena visaren vrider sig, den andra följer rutnätet';
  return { family: p.family ?? 'tva-rorelser', title, rule: `${text('lang')} ${text('kort')}`, grid: g, facit, kandidater };
}

// =============================================================================
// GRUPPEN: antal med aritmetik, form och fyllning med egna regler
// =============================================================================
const FORMER = ['circle', 'square', 'triangle'];
const FORM_PL = { circle: 'cirklar', square: 'kvadrater', triangle: 'trianglar' };
const FYLL_PL = { black: 'svarta', none: 'ofyllda' };

/**
 * p: { antal: { regel: 'summa' | 'differens' | 'aritm', linje: 'rad' | 'kolumn', d, vaxlar },
 *      form: { regel, s }, fyll: { regel }, family }
 * linje 'rad': regeln gäller inom varje rad (tredje rutan ur de två första,
 * eller steg åt höger). 'kolumn': inom varje kolumn, nedåt.
 */
export function gruppRakna(r, p) {
  const A = p.antal;
  // Tre linjer (rader eller kolumner) med tre antal var.
  const linjer = [];
  const sett = new Set();
  for (let i = 0; i < 3; i++) {
    let l; let n = 0;
    do {
      n++;
      if (A.regel === 'summa') { const a = 1 + Math.floor(r() * 7); const b = 1 + Math.floor(r() * (8 - a)); l = [a, b, a + b]; }
      else if (A.regel === 'differens') { const a = 3 + Math.floor(r() * 7); const b = 1 + Math.floor(r() * (a - 1)); l = [a, b, a - b]; }
      else { const d = A.vaxlar && i === 1 ? -A.d : A.d; const s = 1 + Math.floor(r() * 9); l = [s, s + d, s + 2 * d]; }
    } while (n < 50 && (sett.has(l.join()) || l.some((x) => x < 1 || x > 9)));
    if (l.some((x) => x < 1 || x > 9)) return null;
    sett.add(l.join());
    linjer.push(l);
  }
  const antal = (rr, cc) => (A.linje === 'kolumn' ? linjer[cc][rr] : linjer[rr][cc]);
  const form = monster(r, p.form?.regel ?? 'konstant', FORMER, p.form?.s);
  const fyll = monster(r, p.fyll?.regel ?? 'konstant', ['black', 'none']);
  const cell = (n, f, y) => ({ kind: 'grupp', antal: n, form: f, fill: y });
  const g = [0, 1, 2].map((rr) => [0, 1, 2].map((cc) => cell(antal(rr, cc), form.f(rr, cc), fyll.f(rr, cc))));
  if (p.oberoende && beroende(g.flat(), ['antal', 'form', 'fill'].filter((f) => f === 'antal' || (f === 'form' ? p.form : p.fyll)?.regel && (f === 'form' ? p.form : p.fyll).regel !== 'konstant'))) return null;
  const facit = g[2][2]; g[2][2] = null;

  // Fel i antalet, de troligaste först: ett för mycket eller för lite, bara
  // en av de två rutorna, fel räknesätt, rutan före i linjen.
  const R = facit.antal;
  const [a, b] = A.linje === 'kolumn' ? [g[0][2].antal, g[1][2].antal] : [g[2][0].antal, g[2][1].antal];
  const fore = A.linje === 'kolumn' ? g[1][2].antal : g[2][1].antal;
  const tvar = A.linje === 'kolumn' ? g[2][1].antal : g[1][2].antal;
  const felAntal = [R + 1, R - 1, fore, a, b, a + b, a - b, b - a, tvar, R + 2, R - 2, fore - (R - fore)].filter((x) => x >= 1 && x <= 9 && x !== R);
  const iRutnat = (fn, alla) => { const syn = new Set(g.flat().filter(Boolean).map(fn)); return [...alla.filter((x) => syn.has(x)), ...alla.filter((x) => !syn.has(x))]; };
  const felForm = iRutnat((c) => c.form, FORMER.filter((x) => x !== facit.form));
  const felFyll = ['black', 'none'].filter((x) => x !== facit.fill);
  const formVarierar = (p.form?.regel ?? 'konstant') !== 'konstant';
  const fyllVarierar = (p.fyll?.regel ?? 'konstant') !== 'konstant';
  const kand = [];
  const fa = [...new Set(felAntal)];
  for (let i = 0; i < fa.length; i++) {
    kand.push(cell(fa[i], facit.form, facit.fill));
    if (i < felForm.length && formVarierar) kand.push(cell(R, felForm[i], facit.fill));
    if (i < felFyll.length && fyllVarierar) kand.push(cell(R, facit.form, felFyll[i]));
  }
  for (const n of fa.slice(0, 6)) {
    if (formVarierar) for (const f of felForm) kand.push(cell(n, f, facit.fill));
    if (fyllVarierar) for (const y of felFyll) kand.push(cell(n, facit.form, y));
    if (formVarierar && fyllVarierar) for (const f of felForm) for (const y of felFyll) kand.push(cell(n, f, y));
  }
  if (formVarierar && fyllVarierar) for (const f of felForm) for (const y of felFyll) kand.push(cell(R, f, y));
  if (!formVarierar) for (const n of fa.slice(0, 3)) kand.push(cell(n, valj(r, FORMER.filter((x) => x !== facit.form)), facit.fill));

  // Texten
  const i = A.linje === 'kolumn';
  let t;
  if (A.regel === 'summa') t = i ? 'I varje kolumn har den nedersta rutan lika många figurer som de två ovanför tillsammans.' : 'I varje rad har den tredje rutan lika många figurer som de två första tillsammans.';
  else if (A.regel === 'differens') t = i ? 'I varje kolumn har den nedersta rutan lika många figurer som den översta minus den mittersta.' : 'I varje rad har den tredje rutan lika många figurer som den första minus den andra.';
  else {
    const upp = A.d > 0; const n = ORD[Math.abs(A.d)];
    const st = i ? 'för varje steg nedåt' : 'för varje steg åt höger';
    t = A.vaxlar
      ? `Antalet figurer ${upp ? 'ökar' : 'minskar'} med ${n} ${st} i den första och den tredje ${i ? 'kolumnen' : 'raden'}, och ${upp ? 'minskar' : 'ökar'} lika mycket i ${i ? 'mittkolumnen' : 'mittraden'}.`
      : `Antalet figurer ${upp ? 'ökar' : 'minskar'} med ${n} ${st} ${i ? 'i kolumnen' : 'i raden'}.`;
  }
  const delar = [t];
  const fr = p.form?.regel ?? 'konstant'; const yr = p.fyll?.regel ?? 'konstant';
  if (fr === 'latin') delar.push(`Cirklar, kvadrater och trianglar finns en gång var i varje rad och varje kolumn.`);
  if (fr === 'schack') delar.push(`Figurerna är ${FORM_PL[form.a]} i hörnen och i mitten och ${FORM_PL[form.b]} i de andra rutorna, som ett schackmönster.`);
  if (fr === 'diagonal') delar.push(`Figurerna ${D_TEXT} är ${FORM_PL[form.a]}, de andra ${FORM_PL[form.b]}.`);
  if (yr === 'schack') delar.push(`Figurerna är ${FYLL_PL[fyll.a]} i hörnen och i mitten och ${FYLL_PL[fyll.b]} i de andra rutorna, som ett schackmönster.`);
  if (yr === 'diagonal') delar.push(`Figurerna ${D_TEXT} är ${FYLL_PL[fyll.a]}, de andra ${FYLL_PL[fyll.b]}.`);
  if (fr === 'konstant' && yr === 'konstant') delar.push(`Figurerna är alltid ${FYLL_PL[fyll.a]} ${FORM_PL[form.a]}.`);
  else if (fr === 'konstant') delar.push(`Figurerna är alltid ${FORM_PL[form.a]}.`);
  else if (yr === 'konstant') delar.push(`Figurerna är alltid ${FYLL_PL[fyll.a]}.`);
  const TIT = { summa: 'Figurerna läggs ihop', differens: 'Den andra dras från den första', aritm: 'Antalet ändras lika mycket varje steg' };
  const byts = [fr !== 'konstant' ? 'formen' : null, yr !== 'konstant' ? 'fyllningen' : null].filter(Boolean);
  const title = byts.length ? `${TIT[A.regel]}, och ${byts.join(' och ')} byts` : TIT[A.regel];
  return { family: 'antal-andras', title, rule: delar.join(' '), grid: g, facit, kandidater: unika(kand) };
}

// =============================================================================
// STRECKFIGUREN: överlagring och streck som läggs till eller tas bort
// =============================================================================
const ALLA8 = [0, 1, 2, 3, 4, 5, 6, 7];
const sf = (s) => ({ kind: 'streckfigur', streck: sortNum([...new Set(s)]) });
const OPF = {
  union: (a, b) => new Set([...a, ...b]),
  xor: (a, b) => new Set([...a, ...b].filter((x) => a.has(x) !== b.has(x))),
  snitt: (a, b) => new Set([...a].filter((x) => b.has(x))),
  'diff-ab': (a, b) => new Set([...a].filter((x) => !b.has(x))),
};
const slumpMangd = (r, min, max, fran = ALLA8) => blanda(r, fran).slice(0, min + Math.floor(r() * (max - min + 1)));

/**
 * p: { op: 'union' | 'xor' | 'snitt' | 'diff-ab', axel: 'kolumn' | 'rad' }.
 * axel 'kolumn' (som i tolka.mjs): tredje rutan i varje rad ur de två
 * första. 'rad': nedersta rutan i varje kolumn ur de två ovanför.
 */
export function streckOverlagring(r, p) {
  const { op, axel } = p;
  const trip = [];
  for (let i = 0; i < 3; i++) {
    let a; let b; let c; let n = 0; let ok;
    do {
      a = new Set(slumpMangd(r, 2, 4)); b = new Set(slumpMangd(r, 2, 4)); c = OPF[op](a, b);
      const gem = [...a].filter((x) => b.has(x)).length;
      const ba = [...b].filter((x) => !a.has(x)).length;
      const ab = [...a].filter((x) => !b.has(x)).length;
      // Operationen ska synas: något gemensamt och något som skiljer åt båda håll.
      ok = c.size >= 1 && c.size <= 6 && gem >= 1 && ab >= 1 && ba >= 1 && key([...c].sort()) !== key([...a].sort()) && key([...c].sort()) !== key([...b].sort());
      n++;
    } while (!ok && n < 80);
    if (!ok) return null;
    trip.push([a, b, c]);
  }
  const g = axel === 'kolumn' ? trip.map((t) => t.map((s) => sf([...s]))) : [0, 1, 2].map((rr) => trip.map((t) => sf([...t[rr]])));
  const facit = g[2][2]; g[2][2] = null;
  const [A, B] = trip[2];
  const C = OPF[op](A, B);
  const kand = [];
  for (const o of Object.keys(OPF)) if (o !== op) kand.push(sf([...OPF[o](A, B)]));
  kand.push(sf([...OPF['diff-ab'](B, A)]), sf([...A]), sf([...B]));
  for (const x of ALLA8) { const s = new Set(C); if (s.has(x)) s.delete(x); else s.add(x); if (s.size) kand.push(sf([...s])); }
  for (const x of C) for (const y of ALLA8) if (!C.has(y)) { const s = new Set(C); s.delete(x); s.add(y); kand.push(sf([...s])); }
  const [t, a, b] = axel === 'kolumn' ? ['Den tredje rutan i varje rad', 'den första', 'den andra'] : ['Den nedersta rutan i varje kolumn', 'den översta', 'den mittersta'];
  const TEXT = {
    union: `${t} har alla streck som finns i ${a} eller ${b} rutan.`,
    xor: `${t} har de streck som finns i bara en av ${a} och ${b} rutan. Streck som finns i båda försvinner.`,
    snitt: `${t} har bara de streck som finns i både ${a} och ${b} rutan.`,
    'diff-ab': `${t} har de streck från ${a} rutan som inte finns i ${b}.`,
  };
  const TIT = { union: 'Strecken läggs ihop', xor: 'Bara strecken som skiljer', snitt: 'Bara de gemensamma strecken', 'diff-ab': 'Strecken dras ifrån' };
  return { family: 'overlagring', title: TIT[op], rule: TEXT[op], grid: g, facit, kandidater: unika(kand.filter((c) => c.streck.length > 0)) };
}

/**
 * Streck som läggs till eller tas bort, samma streck i varje linje.
 * p: { axel: 'rad' | 'kolumn', steg: [[plus, minus], [plus, minus]] }.
 * Steget från första till andra rutan lägger till plus streck och tar bort
 * minus streck; det andra steget likaså, med andra streck.
 */
export function streckTillagg(r, p) {
  const [[p0, m0], [p1, m1]] = p.steg;
  const fria = blanda(r, ALLA8);
  const P0 = fria.splice(0, p0); const M0 = fria.splice(0, m0); const P1 = fria.splice(0, p1); const M1 = fria.splice(0, m1);
  const rest = fria;
  const ut = [];
  const sett = new Set();
  for (let i = 0; i < 3; i++) {
    let bas; let n = 0; let celler;
    do {
      n++;
      const extra = slumpMangd(r, 1, Math.min(3, rest.length), rest);
      bas = [...M0, ...M1, ...extra];
      const c0 = new Set(bas);
      const c1 = new Set([...c0].filter((x) => !M0.includes(x)).concat(P0));
      const c2 = new Set([...c1].filter((x) => !M1.includes(x)).concat(P1));
      celler = [c0, c1, c2];
    } while (n < 50 && (sett.has(key(sortNum(bas))) || celler.some((c) => c.size < 1 || c.size > 6)));
    if (celler.some((c) => c.size < 1 || c.size > 6) || sett.has(key(sortNum(bas)))) return null;
    sett.add(key(sortNum(bas)));
    ut.push(celler);
  }
  const g = p.axel === 'kolumn' ? [0, 1, 2].map((rr) => ut.map((l) => sf([...l[rr]]))) : ut.map((l) => l.map((s) => sf([...s])));
  const facit = g[2][2]; g[2][2] = null;
  const F = new Set(facit.streck);
  const fore = p.axel === 'kolumn' ? g[1][2] : g[2][1];
  const forst = p.axel === 'kolumn' ? g[0][2] : g[2][0];
  const kand = [fore, forst];
  // fel streck i sista steget, ett streck för mycket eller för lite
  for (const x of P1) for (const y of ALLA8) if (!F.has(y)) { const s = new Set(F); s.delete(x); s.add(y); kand.push(sf([...s])); }
  for (const x of M1) for (const y of F) { const s = new Set(F); s.add(x); s.delete(y); kand.push(sf([...s])); }
  for (const x of ALLA8) { const s = new Set(F); if (s.has(x)) s.delete(x); else s.add(x); if (s.size) kand.push(sf([...s])); }
  for (const x of F) for (const y of ALLA8) if (!F.has(y)) { const s = new Set(F); s.delete(x); s.add(y); kand.push(sf([...s])); }
  const stegText = ([pl, mi], andra) => {
    const a = andra ? (pl && mi ? '' : pl ? (pl === 1 ? 'ett annat streck' : `${ORD[pl]} andra streck`) : (mi === 1 ? 'ett annat streck' : `${ORD[mi]} andra streck`)) : '';
    if (pl && mi) return `läggs ${ORD[pl]} streck till och ${mi === 1 ? 'ett annat' : `${ORD[mi]} andra`} tas bort`;
    if (pl) return `läggs ${a || `${ORD[pl]} streck`} till`;
    return `tas ${a || `${ORD[mi]} streck`} bort`;
  };
  const samma = (s0, s1) => (s0[0] > 0) === (s1[0] > 0) && (s0[1] > 0) === (s1[1] > 0);
  const kol = p.axel === 'kolumn';
  const [x0, x1, x2] = kol ? ['den översta', 'den mittersta', 'den nedersta'] : ['den första', 'den andra', 'den tredje'];
  const rule = `Från ${x0} till ${x1} rutan ${stegText(p.steg[0], false)}, och från ${x1} till ${x2} ${stegText(p.steg[1], samma(p.steg[0], p.steg[1]))}. Det är samma streck i alla tre ${kol ? 'kolumnerna' : 'raderna'}.`;
  const bygg = p0 + p1 > 0 && m0 + m1 === 0; const riv = m0 + m1 > 0 && p0 + p1 === 0;
  const title = bygg ? 'Figuren byggs upp streck för streck' : riv ? 'Figuren plockas isär streck för streck' : 'Streck läggs till och tas bort';
  return { family: 'antal-andras', title, rule, grid: g, facit, kandidater: unika(kand.filter((c) => c.streck.length > 0 && c.streck.length < 8)) };
}
