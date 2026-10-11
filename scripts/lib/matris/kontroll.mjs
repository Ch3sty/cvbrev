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
//   - med `kandidat` (nya frågor): facit inte rutan uppe till vänster, och
//     inga rena läsordningsrörelser på avancerad och expert (kandidatKrav)
//
// Returnerar en lista med fel (tom = godkänd). `strikt` lägger till regel 1
// per form och regel 5 för mängder; de används på nya frågor och rapporteras
// som upplysning för de gamla.
// =============================================================================

import { stable, tile } from './celler.mjs';
import { tolka, familjFor, POS, LASORDNING } from './tolka.mjs';
import { misstagFor } from './misstag.mjs';
import { lasordningsDimensioner } from './sparrar.mjs';

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
//
// Mönsterrotation (granskningen av parti 01, avsnitt 6, grupp A): när alla
// rutor i ett 2×2-mönster vrider sig lika långt i läsordning är mönstret en
// dimension, inte fyra. Två lat-dimensioner med samma vridning jämförs
// därför inte. Två vandrare med olika steg (två rörelser) jämförs som förut.
const SAMMA_MANGD = new Set(['ringantal', 'ringsvart', 'ringgra', 'lat-hel']);
const sammaMonster = (rx, ry, X, Y) => X.startsWith('lat-') && Y.startsWith('lat-') && ['rot-steg', 'rad-steg'].includes(rx.regel) && ry.regel === rx.regel && rx.info?.k === ry.info?.k && rx.info?.vaxlar === ry.info?.vaxlar;

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
    if (sammaMonster(t.regel[X], t.regel[Y], X, Y)) continue;
    const vx = varden(X); const vy = varden(Y);
    const komb = new Set(vx.map((x, k) => `${x}|${vy[k]}`)).size;
    const nx = new Set(vx).size; const ny = new Set(vy).size;
    if (komb === nx) fel.push(`${q.id}: ${Y} är en funktion av ${X}`);
    else if (komb === ny) fel.push(`${q.id}: ${X} är en funktion av ${Y}`);
  }
  return fel;
}

// ---------------------------------------------------------------- facit och läsordning
// Granskningen av parti 01 (1.2 och 2.6 punkt 7): i 159 av 252 valbara
// frågor i de sex bankerna är facit identiskt med rutan uppe till vänster,
// eftersom rörelser i läsordning går i steg om 45 grader eller i perioder
// som delar 8 och sluter sig efter åtta steg. Det är en genväg som inte
// kräver att man förstår regeln.

/** Facit identiskt med rutan uppe till vänster (kalibreringens flagga facit_ruta0). */
export function facitRuta0(q) {
  if (!Array.isArray(q?.grid) || !Array.isArray(q?.options) || !q.grid[0]?.[0]) return false;
  const f = q.options[q.correctAnswer];
  return f !== undefined && norm(f) === norm(q.grid[0][0]);
}

/** Synliga rutor (1 till 8 i läsordning) som är identiska med facit. */
export function facitKopior(q) {
  const f = norm(q.options[q.correctAnswer]);
  return POS.map(([r, c], i) => (norm(q.grid[r][c]) === f ? i + 1 : null)).filter((x) => x !== null);
}

/** Nivån ur id:t (v7g, v7a, v7e), annars null. */
export function nivaFor(q) {
  const m = /^v7([gae])-/.exec(q?.id ?? '');
  return m ? { g: 'grund', a: 'avancerad', e: 'expert' }[m[1]] : null;
}

// Familjerna som bärs av rörelser i läsordning. Antal som ändras räknas bara
// när regeln är en sekvens, inte en summa per rad.
export const LASORDNINGSFAMILJER = new Set(['vridning', 'vandring', 'monsterrotation', 'rotation-med-byte', 'tva-rorelser', 'antal-andras']);

/**
 * Läsordningscykeln. `slutna`: dimensionerna med en regel i läsordning vars
 * värde i ruta 9 är detsamma som i ruta 1 (rörelsen sluter sig efter åtta
 * steg). `ren`: varje aktiv regel går i läsordning, eller familjen är en
 * läsordningsfamilj utan summa (två rörelser på balanslinjen läses som
 * latinska kvadrater men är vandringar i läsordning).
 */
export function lasordningsCykel(q, t = tolka(q)) {
  if (!t || !t.ok) return { ren: false, slutna: [] };
  const full = q.grid.map((r) => r.slice());
  full[2][2] = q.options[q.correctAnswer];
  const aktiva = Object.entries(t.regel).filter(([, r]) => r.regel !== 'konstant');
  const v = (c, id) => stable(t.dimsVy(c).find((d) => d.id === id)?.varde ?? null);
  const slutna = aktiva.filter(([id, r]) => LASORDNING.includes(r.regel) && v(full[2][2], id) === v(full[0][0], id)).map(([id]) => id);
  const regler = aktiva.map(([, r]) => r.regel);
  const fam = q.family ?? familjFor(q, t);
  const ren = (regler.length > 0 && regler.every((r) => LASORDNING.includes(r))) || (LASORDNINGSFAMILJER.has(fam) && !regler.includes('summa'));
  return { ren, slutna };
}

/**
 * Kraven för nya kandidater (alla nivåer, inte bara plus), granskningen av
 * parti 01, 2.6 punkt 7 och avsnitt 6 punkt 5:
 *   - facit är inte identiskt med rutan uppe till vänster
 *   - facit identiskt med någon annan synlig ruta bara när minst två
 *     distraktorer också är kopior av synliga rutor
 *   - på avancerad och expert inga rena rörelser i läsordning (de sluter sig
 *     efter åtta steg); de genereras bara för grund
 * De skarpa bankerna är frysta och får kraven som upplysning.
 */
export function kandidatKrav(q, t = tolka(q)) {
  const fel = [];
  // Latinska kvadrater med en egenskap har facit lika ruta 0 eller ruta 1
  // av konstruktion (plan-facit-genvag 1.3); där gäller bankkvoten S1b.
  if (facitRuta0(q) && !['latin-antal', 'latin-form'].includes(q.family)) fel.push(`${q.id}: facit är identiskt med rutan uppe till vänster`);
  else {
    const kopior = facitKopior(q);
    if (kopior.length) {
      const synliga = new Set(POS.map(([r, c]) => norm(q.grid[r][c])));
      const dist = q.options.filter((o, i) => i !== q.correctAnswer && synliga.has(norm(o))).length;
      if (dist < 2) fel.push(`${q.id}: facit är identiskt med ruta ${kopior.join(' och ')} men bara ${dist} distraktorer är kopior av synliga rutor (minst två krävs)`);
    }
  }
  const niva = nivaFor(q);
  // Läsordningen avgörs av reglerna (spärren S9), inte av familjen: radvisa
  // rörelser (bank_version 3) bär samma familjenamn som läsordningens.
  if (niva && niva !== 'grund' && lasordningsDimensioner(q, t).length) {
    const { slutna } = lasordningsCykel(q, t);
    fel.push(`${q.id}: ren rörelse i läsordning${slutna.length ? ` som sluter sig efter åtta steg (${slutna.join(', ')})` : ''}, genereras bara för grund`);
  }
  return fel;
}

// Antal regler att hålla i huvudet. Överlagring med vridning räknas som två
// (operationen och vridningen).
export const KOPPLADE = new Set(['latin', 'diagonal', 'overlagring', 'overlagring-vriden']);
// Dubbel överlagring (P8): samma operation både per rad och per kolumn
// räknas som två regler, eftersom luckan ska stämma åt båda hållen.
export const arDubbelOverlagring = (t, id) => {
  const o = (t.allaRegler?.[id] ?? []).filter((f) => f.regel === 'overlagring');
  return o.some((a) => a.info.axel === 'kolumn' && o.some((b) => b.info.axel === 'rad' && b.info.op === a.info.op));
};
export function antalRegler(t) {
  return Object.entries(t.regel).filter(([, r]) => r.regel !== 'konstant').reduce((n, [id, r]) => n + (r.regel === 'overlagring-vriden' || (r.regel === 'overlagring' && arDubbelOverlagring(t, id)) ? 2 : 1), 0);
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
  const vriden = regler.includes('overlagring-vriden') || Object.keys(t.regel).some((id) => t.regel[id].regel === 'overlagring' && arDubbelOverlagring(t, id));
  if (n < 3 && !vriden) fel.push(`${q.id}: bara ${n} regler, bandet kräver minst tre`);
  if (!regler.some((r) => KOPPLADE.has(r))) fel.push(`${q.id}: ingen regel är kopplad över hela rutnätet`);
  return fel;
}

export function kontrollera(q, { strikt = true, familj = null, kandidat = false } = {}) {
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
        if ((r.regel === 'rot-steg' || r.regel === 'rad-steg') && r.dim.mangd) {
          const v0 = t.dimsVy(q.grid[0][0]).find((d) => d.id === r.dim.id).varde;
          const lagen = new Set();
          for (let j = 0; j < r.dim.n; j++) lagen.add(stable(v0.map((s) => (((s + j * r.info.k) % r.dim.n) + r.dim.n) % r.dim.n).sort((x, y) => x - y)));
          if (lagen.size < 3 && v0.length > 0) fel.push(`${tag}: ${r.dim.id} har bara ${lagen.size} synliga lägen`);
        }
      }
    }
  }
  if (strikt && q.band === 'plus' && t.ok) fel.push(...oberoende(q, t), ...plusKrav(q, t));
  if (kandidat && t.ok) fel.push(...kandidatKrav(q, t));
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
