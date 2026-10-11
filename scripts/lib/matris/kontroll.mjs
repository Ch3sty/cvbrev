// scripts/lib/matris/kontroll.mjs
// =============================================================================
// Kvalitetskontroll av en matrisfråga, samma regler som valideringskedjan
// (validate-v7-questions.mjs, v7-parallel-check.mjs) plus det tolkningen ger:
//
//   - struktur: 3×3, en null sist, sex unika alternativ, giltigt facit
//   - regel 2: inga lika rader eller kolumner, facit inte lika rutan ovanför
//     eller till vänster
//   - regel 1: ingen egenskap med samma sekvens i alla rader eller kolumner
//     (balanslinjens former räknas per form, inte som en klump)
//   - regel 5: ett 3×3-block som vrids har fyra olika lägen; en mängd som
//     vrids saknar rotationssymmetri
//   - regel 6: högst fyra streck, inga två former i samma fack
//   - facit: tolkningen ur de synliga rutorna ger exakt ett alternativ, facit,
//     och ingen annan enkel regel ger ett annat svar
//   - misstag: varje fel alternativ har en förklaring, utan tankstreck
//
// Returnerar en lista med fel (tom = godkänd). `strikt` lägger till regel 1
// per form och regel 5 för mängder; de används på nya frågor och rapporteras
// som upplysning för de gamla.
// =============================================================================

import { stable, tile } from './celler.mjs';
import { tolka, familjFor, POS } from './tolka.mjs';
import { misstagFor } from './misstag.mjs';

const norm = (c) => (c === null ? 'null' : stable(c));
const SYM_RE = /spegl|schack|symmetr|180|motsatt/i;
const SYM_RE_PAR = /spegl|schack|symmetr|180|motsatt|diagonal/i;

function attrVal(cell, key) {
  if (cell === null) return '∅';
  const prims = Array.isArray(cell) ? cell : [cell];
  const vals = prims.map((p) => (key in p ? (Array.isArray(p[key]) ? p[key].map((x) => (typeof x === 'object' ? stable(x) : x)).join('+') : String(p[key])) : null)).filter((v) => v !== null);
  return vals.length ? vals.join(',') : '·';
}

/** Attribut för parallellkontrollen. Balanslinjen delas upp per form. */
function attribut(cell, strikt) {
  if (cell.kind === 'balanceline' && strikt) {
    const out = {};
    for (const shape of ['square', 'circle']) {
      const it = cell.items.find((i) => i.shape === shape);
      out[`${shape}.pos`] = it ? String(it.posX) : '-';
      out[`${shape}.side`] = it ? it.side : '-';
    }
    return out;
  }
  const out = {};
  for (const k of Object.keys(cell)) if (k !== 'kind') out[k] = attrVal(cell, k);
  return out;
}

// ---------------------------------------------------------------- oberoende
// Bandet "svår plus" (beställningen 1.1): reglerna ska vara oberoende av
// varandra. För varje par av dimensioner med icke konstant regel räknas, med
// facit isatt, de olika kombinationerna (x, y) över de nio rutorna. Är
// antalet lika med antalet olika x (eller y) bestämmer x värdet på y (eller
// tvärtom), och då är det en regel, inte två. Två latinska kvadrater av
// ordning 3 ger antingen 3 eller 9 kombinationer.
//
// Dimensioner som tolkningen läser ur samma mängd i en andra vy (ringar som
// mängd av svarta ringar, 2×2 som helt mönster) jämförs inte med varandra.
const SAMMA_MANGD = new Set(['ringantal', 'ringsvart', 'ringgra', 'lat-hel']);

export function oberoende(q, t = tolka(q)) {
  if (!t || !t.ok) return [];
  const full = q.grid.map((r) => r.slice());
  full[2][2] = q.options[q.correctAnswer];
  const aktiva = Object.entries(t.regel).filter(([, r]) => r.regel !== 'konstant').map(([id]) => id);
  const varden = (id) => full.flat().map((c) => stable(t.dimsVy(c).find((d) => d.id === id).varde));
  const fel = [];
  for (let i = 0; i < aktiva.length; i++) for (let j = i + 1; j < aktiva.length; j++) {
    const X = aktiva[i]; const Y = aktiva[j];
    if (SAMMA_MANGD.has(X) && SAMMA_MANGD.has(Y)) continue;
    const vx = varden(X); const vy = varden(Y);
    const komb = new Set(vx.map((x, k) => `${x}|${vy[k]}`)).size;
    const nx = new Set(vx).size; const ny = new Set(vy).size;
    if (komb === nx) fel.push(`${q.id}: ${Y} är en funktion av ${X}`);
    else if (komb === ny) fel.push(`${q.id}: ${X} är en funktion av ${Y}`);
  }
  return fel;
}

// Antal regler att hålla i huvudet. Överlagring med vridning räknas som två
// (operationen och vridningen).
export const KOPPLADE = new Set(['latin', 'diagonal', 'overlagring', 'overlagring-vriden']);
export function antalRegler(t) {
  return Object.values(t.regel).filter((r) => r.regel !== 'konstant').reduce((n, r) => n + (r.regel === 'overlagring-vriden' ? 2 : 1), 0);
}

/**
 * Kraven för bandet "svår plus" utöver oberoendet: minst tre regler varav
 * minst en kopplad över hela rutnätet. Undantag: överlagring med vridning
 * (mekanism 3 i riktlinjerna 2.2) bär sig själv med två regler, eftersom
 * strålar och sektorhjul bara har en dimension och en primitiv per cell
 * gäller (G12).
 */
export function plusKrav(q, t = tolka(q)) {
  if (!t || !t.ok) return [];
  const fel = [];
  const regler = Object.values(t.regel).map((r) => r.regel);
  const n = antalRegler(t);
  const vriden = regler.includes('overlagring-vriden');
  if (n < 3 && !vriden) fel.push(`${q.id}: bara ${n} regler, bandet kräver minst tre`);
  if (!regler.some((r) => KOPPLADE.has(r))) fel.push(`${q.id}: ingen regel är kopplad över hela rutnätet`);
  return fel;
}

export function kontrollera(q, { strikt = true, familj = null } = {}) {
  const fel = [];
  const tag = q.id;
  if (!Array.isArray(q.grid) || q.grid.length !== 3 || q.grid.some((r) => r.length !== 3)) return [`${tag}: grid är inte 3×3`];
  if (q.grid.flat().filter((c) => c === null).length !== 1 || q.grid[2][2] !== null) fel.push(`${tag}: tomrummet ska vara sist`);
  if (!Array.isArray(q.options) || q.options.length !== 6) fel.push(`${tag}: sex alternativ krävs`);
  const keys = q.options.map(norm);
  if (new Set(keys).size !== keys.length) fel.push(`${tag}: identiska alternativ`);
  if (!(q.correctAnswer >= 0 && q.correctAnswer < q.options.length)) fel.push(`${tag}: ogiltigt facit`);
  if (fel.length) return fel;

  const g = q.grid.map((r) => r.slice());
  g[2][2] = q.options[q.correctAnswer];
  const sym = SYM_RE.test(q.rule);
  const rk = g.map((r) => r.map(norm).join('¦'));
  const ck = [0, 1, 2].map((c) => g.map((r) => norm(r[c])).join('¦'));
  if (!sym) {
    for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
      if (rk[a] === rk[b]) fel.push(`${tag}: rad ${a + 1} = rad ${b + 1}`);
      if (ck[a] === ck[b]) fel.push(`${tag}: kolumn ${a + 1} = kolumn ${b + 1}`);
    }
  } else if (strikt) {
    // spegling: kolumnerna i en rad får ändå inte vara lika (då syns ingen spegling)
    for (let r = 0; r < 3; r++) if (new Set(g[r].map(norm)).size < 3) fel.push(`${tag}: två lika rutor i rad ${r + 1}`);
    if (new Set(rk).size < 3) fel.push(`${tag}: två lika rader`);
  }
  if (norm(g[2][2]) === norm(g[1][2])) fel.push(`${tag}: facit = rutan ovanför`);
  if (norm(g[2][2]) === norm(g[2][1])) fel.push(`${tag}: facit = rutan till vänster`);

  // regel 1: parallellitet
  if (!SYM_RE_PAR.test(q.rule)) {
    const A = g.map((r) => r.map((c) => attribut(c, strikt)));
    const nycklar = new Set(A.flat().flatMap((a) => Object.keys(a)));
    for (const k of nycklar) {
      const M = A.map((r) => r.map((a) => a[k] ?? '·'));
      if (new Set(M.flat()).size <= 1) continue;
      const rows = M.map((r) => r.join('>'));
      const cols = [0, 1, 2].map((c) => M.map((r) => r[c]).join('>'));
      if (new Set(rows).size === 1) fel.push(`${tag}: "${k}" har samma sekvens i alla rader`);
      if (new Set(cols).size === 1) fel.push(`${tag}: "${k}" har samma sekvens i alla kolumner`);
    }
  }

  // regel 5 och 6
  const alla = [...g.flat(), ...q.options];
  for (const c of alla) {
    if (c.kind === 'tally' && (c.count > 4 || c.count < 1)) fel.push(`${tag}: tally med ${c.count} streck`);
    if (c.kind === 'balanceline') {
      const platser = c.items.map((i) => `${i.posX}:${i.side}`);
      if (new Set(platser).size !== platser.length) fel.push(`${tag}: två former i samma fack`);
    }
  }
  if (g[0][0].kind === 'tile') {
    const b = g[0][0].pattern;
    const rots = new Set([b, tile.rot(b, 1), tile.rot(b, 2), tile.rot(b, 3)]);
    if (rots.size < 4 && !sym) fel.push(`${tag}: symmetriskt block (${rots.size} lägen)`);
  }

  // facit ur de synliga rutorna
  const t = tolka(q);
  if (!t.ok) fel.push(`${tag}: ingen regel för ${(t.saknar || [t.orsak]).join(', ')}`);
  else {
    if (t.tvetydig.length) fel.push(`${tag}: tvetydig (${t.tvetydig.map((x) => x.dim + ': ' + x.regler.join(' / ')).join('; ')})`);
    if (t.traffar.length !== 1) fel.push(`${tag}: ${t.traffar.length} alternativ stämmer med regeln`);
    else if (t.traffar[0] !== q.correctAnswer) fel.push(`${tag}: regeln pekar på alternativ ${t.traffar[0]}, facit är ${q.correctAnswer}`);
    if (familj) {
      const f = familjFor(q, t);
      if (f !== familj) fel.push(`${tag}: tolkas som ${f}, inte ${familj}`);
    }
    if (strikt) {
      // rotationssymmetri för mängder som vrids: synlig vridning kräver olika lägen
      for (const r of Object.values(t.regel)) {
        if (r.regel === 'rot-steg' && r.dim.mangd) {
          const v0 = t.dimsVy(q.grid[0][0]).find((d) => d.id === r.dim.id).varde;
          const lagen = new Set();
          for (let j = 0; j < r.dim.n; j++) lagen.add(stable(v0.map((s) => (((s + j * r.info.k) % r.dim.n) + r.dim.n) % r.dim.n).sort((x, y) => x - y)));
          if (lagen.size < 3 && v0.length > 0) fel.push(`${tag}: ${r.dim.id} har bara ${lagen.size} synliga lägen`);
        }
      }
    }
  }
  if (strikt && q.band === 'plus' && t.ok) fel.push(...oberoende(q, t), ...plusKrav(q, t));
  if (strikt) {
    const m = misstagFor(q, t);
    m.forEach((x, i) => {
      if (i !== q.correctAnswer && !x) fel.push(`${tag}: alternativ ${i} saknar misstagstext`);
      if (x && /[—–]/.test(x)) fel.push(`${tag}: tankstreck i misstag`);
    });
    if (/[—–]/.test(q.rule + q.title)) fel.push(`${tag}: tankstreck i regel eller titel`);
  }
  return fel;
}

export { POS };
