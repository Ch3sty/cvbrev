// Validering av V7-frågor (primitiv- eller lager-celler).
// Struktur + anti-trivialitet, generiskt över alla V7-celltyper.
//
// Kör: node scripts/validate-v7-questions.mjs <fil.json>

import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { alternativSeed, blandadPermutation } from './lib/blanda-alternativ.mjs';

const path = process.argv[2];
const bank = JSON.parse(readFileSync(path, 'utf8'));
const FAMILJER = new Set(
  JSON.parse(readFileSync(new URL('../src/lib/logicTestV7/familjer.json', import.meta.url), 'utf8')).map((f) => f.id)
);

// Kanonisk nyckel för en cell (primitiv ELLER array av primitiver).
// Stabil, djup serialisering (hanterar arrayer av objekt, t.ex. balanceline.items)
const stable = (v) => {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => `${k}:${stable(v[k])}`).join(',') + '}';
  }
  return String(v);
};
const norm = (cell) => (cell === null ? 'null' : stable(cell));

// Rotationssymmetri: en regelbunden n-hörning ser identisk ut efter rotation
// med 360/n grader (hexagon 60°, oktagon 45°, pentagon 72°). Normalisera
// poly-rotationen modulo symmetriperioden så att celler som ser likadana ut
// trots olika rotationsvärden får samma nyckel.
const normalizePoly = (p) => {
  if (!p || p.kind !== 'poly' || typeof p.sides !== 'number') return p;
  const period = 360 / p.sides;
  const rotation = (((p.rotation ?? 0) % period) + period) % period;
  return { ...p, rotation };
};
const symNorm = (cell) => {
  if (cell === null) return 'null';
  if (Array.isArray(cell)) return stable(cell.map(normalizePoly));
  return stable(normalizePoly(cell));
};

const errors = [];
const seen = new Set();

// Pensionerade frågor (spec-rummen avsnitt 15) ligger kvar i filen för gamla
// sessioner men väljs aldrig till något nytt. De hoppas över i kontrollerna
// av dubbletter, tankstreck och parallellitet; struktur och facit gäller dem
// fortfarande.
const TANKSTRECK = /[—–]/;
const pensionerade = bank.filter((q) => q.pensionerad === true).length;

for (const q of bank) {
  const tag = `[${q.id}]`;
  const aktiv = q.pensionerad !== true;
  if (q.pensionerad !== undefined && q.pensionerad !== true) errors.push(`${tag} pensionerad ska vara true eller saknas`);
  if (!q.id) errors.push(`${tag} saknar id`);
  else if (seen.has(q.id)) errors.push(`${tag} duplicerat id`);
  else seen.add(q.id);

  // Tankstreck i titel och regel är ett fel för alla ej pensionerade frågor
  // (spec-rummen 15.5). Misstag kontrolleras nedan.
  if (aktiv && TANKSTRECK.test(`${q.title ?? ''}${q.rule ?? ''}`)) errors.push(`${tag} tankstreck i titel eller regel`);

  // Orbital (spec-rummen 15.8): pricken bara på de åtta kompasspunkterna
  // (index 0 till 7, aldrig 30 grader), ramen alltid den streckade cirkeln
  // med fylld eller ofylld mittpunkt. Inga andra fält.
  for (const cell of [...(q.grid ?? []).flat().filter(Boolean), ...(q.options ?? [])]) {
    for (const p of Array.isArray(cell) ? cell : [cell]) {
      if (p?.kind !== 'orbital') continue;
      const okLage = p.satellite === null || (Number.isInteger(p.satellite) && p.satellite >= 0 && p.satellite <= 7);
      const okRam = p.center === 'filled' || p.center === 'open';
      const okFalt = Object.keys(p).every((k) => ['kind', 'center', 'satellite'].includes(k));
      if (!okLage || !okRam || !okFalt) errors.push(`${tag} orbital utanför regeln (åtta kompasspunkter, streckad ram, fylld eller ofylld mitt)`);
    }
  }

  // grid 3x3, exakt en null sist
  if (!Array.isArray(q.grid) || q.grid.length !== 3 || q.grid.some((r) => r.length !== 3)) {
    errors.push(`${tag} grid är inte 3x3`);
  } else {
    const flat = q.grid.flat();
    if (flat.filter((c) => c === null).length !== 1) errors.push(`${tag} ska ha exakt 1 null-cell`);
    if (q.grid[2][2] !== null) errors.push(`${tag} null-cellen ska vara sist (grid[2][2])`);
  }

  // läsbarhet: vissa värden renderar otydligt i det lilla cellformatet och
  // ska inte användas på grundnivå. Skanna både grid och options.
  const allCells = [...q.grid.flat().filter(Boolean), ...(q.options ?? [])];
  for (const cell of allCells) {
    const prims = Array.isArray(cell) ? cell : [cell];
    for (const p of prims) {
      // tally=5 ritas som "buntat femtal" med diagonalstreck → svårläst litet
      if (p.kind === 'tally' && p.count === 5) {
        errors.push(`${tag} tally med 5 pinnar (buntat femtal) är svårläst — använd max 4`);
      }
    }
  }

  // options = 6, unika, correctAnswer giltig
  if (!Array.isArray(q.options) || q.options.length !== 6) {
    errors.push(`${tag} options ska vara 6 (är ${q.options?.length})`);
  } else {
    const keys = q.options.map(norm);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length && aktiv) errors.push(`${tag} identiska svarsalternativ`);
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 5) {
      errors.push(`${tag} correctAnswer ogiltigt`);
    } else {
      const ck = keys[q.correctAnswer];
      if (keys.filter((k, i) => i !== q.correctAnswer && k === ck).length) {
        errors.push(`${tag} rätt svar identiskt med distraktor → två rätta`);
      }
    }
  }

  // Fälten testmotorn läser (spec-rummen 6, våg 3a/3c): family ur
  // familjer.json, difficulty 1-4 som prior, misstag en post per alternativ
  // på originalindex, tom för facit. En distraktor utan text måste stå i
  // misstagGranskas (manuell granskning), annars är det ett fel.
  if (!FAMILJER.has(q.family)) errors.push(`${tag} family saknas eller finns inte i familjer.json (${q.family})`);
  if (!Number.isInteger(q.difficulty) || q.difficulty < 1 || q.difficulty > 4) errors.push(`${tag} difficulty ska vara 1-4 (är ${q.difficulty})`);
  // p_prior (spec-rummen 14.1 punkt 4): frivilligt, andel rätt i [0,05, 0,95].
  if (q.p_prior !== undefined && (typeof q.p_prior !== 'number' || !(q.p_prior >= 0.05 && q.p_prior <= 0.95))) {
    errors.push(`${tag} p_prior ska vara ett tal i [0,05, 0,95] (är ${q.p_prior})`);
  }
  // Bandet "svår plus" (beställningen "svarare frågor", 1.1): band bara
  // "plus", mekanism en sträng. Båda frivilliga.
  if (q.band !== undefined && q.band !== 'plus') errors.push(`${tag} band får bara vara "plus" (är ${q.band})`);
  if (q.mekanism !== undefined && (typeof q.mekanism !== 'string' || !q.mekanism)) errors.push(`${tag} mekanism ska vara en sträng`);
  if (!Array.isArray(q.misstag) || q.misstag.length !== q.options?.length) {
    errors.push(`${tag} misstag ska ha en post per alternativ`);
  } else {
    const granskas = new Set(q.misstagGranskas ?? []);
    q.misstag.forEach((m, i) => {
      if (typeof m !== 'string') errors.push(`${tag} misstag ${i + 1} är inte en sträng`);
      else if (i === q.correctAnswer && m !== '') errors.push(`${tag} misstag för rätt svar ska vara tomt`);
      else if (i !== q.correctAnswer && m === '' && !granskas.has(i)) errors.push(`${tag} alternativ ${i + 1} saknar misstag och står inte i misstagGranskas`);
      else if (granskas.has(i) && m !== '') errors.push(`${tag} alternativ ${i + 1} står i misstagGranskas men har text`);
      if (aktiv && typeof m === 'string' && TANKSTRECK.test(m)) errors.push(`${tag} tankstreck i misstag ${i + 1}`);
    });
    if (granskas.has(q.correctAnswer)) errors.push(`${tag} rätt svar står i misstagGranskas`);
  }

  // anti-trivialitet (facit isatt)
  if (Array.isArray(q.grid) && q.grid.length === 3 && typeof q.correctAnswer === 'number') {
    const g = q.grid.map((r) => r.slice());
    g[2][2] = q.options[q.correctAnswer];
    const isSym = /spegl|schack|symmetr|180|motsatt/i.test(q.rule);
    const rk = g.map((r) => r.map(norm).join('¦'));
    const ck = [0, 1, 2].map((c) => g.map((r) => norm(r[c])).join('¦'));
    if (!isSym) {
      for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
        if (rk[a] === rk[b]) errors.push(`${tag} rad ${a + 1} = rad ${b + 1} (trivial)`);
        if (ck[a] === ck[b]) errors.push(`${tag} kolumn ${a + 1} = kolumn ${b + 1} (trivial)`);
      }
    }
    if (norm(g[2][2]) === norm(g[1][2])) errors.push(`${tag} facit = cellen ovanför (trivial)`);
    if (norm(g[2][2]) === norm(g[2][1])) errors.push(`${tag} facit = cellen till vänster (trivial)`);
  }

  // rotationssymmetri för polygoner: kör om dubblettkontrollerna med
  // symmetri-normaliserade nycklar. Rapportera bara kollisioner som INTE
  // redan fångats som exakta dubbletter ovan (norm-nycklarna skiljer sig,
  // men cellerna ser identiska ut efter normalisering).
  if (aktiv && Array.isArray(q.options) && q.options.length === 6) {
    const keys = q.options.map(norm);
    const skeys = q.options.map(symNorm);
    const symDupe = (a, b) => skeys[a] === skeys[b] && keys[a] !== keys[b];
    for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) {
      if (symDupe(a, b)) {
        errors.push(`${tag} alternativ ${a + 1} och ${b + 1} ser identiska ut efter rotationsnormalisering (polygon-symmetri)`);
      }
    }
    if (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 5) {
      for (let i = 0; i < 6; i++) {
        if (i !== q.correctAnswer && symDupe(i, q.correctAnswer)) {
          errors.push(`${tag} rätt svar ser identiskt ut som distraktor efter rotationsnormalisering → två rätta`);
        }
      }
    }

    if (Array.isArray(q.grid) && q.grid.length === 3 && !q.grid.some((r) => r.length !== 3)
        && typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 5) {
      const g = q.grid.map((r) => r.slice());
      g[2][2] = q.options[q.correctAnswer];
      const isSym = /spegl|schack|symmetr|180|motsatt/i.test(q.rule);
      const rk = g.map((r) => r.map(norm).join('¦'));
      const ck = [0, 1, 2].map((c) => g.map((r) => norm(r[c])).join('¦'));
      const srk = g.map((r) => r.map(symNorm).join('¦'));
      const sck = [0, 1, 2].map((c) => g.map((r) => symNorm(r[c])).join('¦'));
      if (!isSym) {
        for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
          if (srk[a] === srk[b] && rk[a] !== rk[b]) errors.push(`${tag} rad ${a + 1} = rad ${b + 1} efter rotationsnormalisering (trivial)`);
          if (sck[a] === sck[b] && ck[a] !== ck[b]) errors.push(`${tag} kolumn ${a + 1} = kolumn ${b + 1} efter rotationsnormalisering (trivial)`);
        }
      }
      if (symNorm(g[2][2]) === symNorm(g[1][2]) && norm(g[2][2]) !== norm(g[1][2])) errors.push(`${tag} facit ser ut som cellen ovanför efter rotationsnormalisering (trivial)`);
      if (symNorm(g[2][2]) === symNorm(g[2][1]) && norm(g[2][2]) !== norm(g[2][1])) errors.push(`${tag} facit ser ut som cellen till vänster efter rotationsnormalisering (trivial)`);
    }
  }
}

// Rätt svars position efter blandningen (src/lib/logicTestV7/blanda.ts).
// Banken får ha rätt svar var som helst; det som visas ska ändå fördela sig
// jämnt. 1 000 slumpade sessioner, varje position ska hamna inom en sjättedel
// ± 2 procentenheter. Bankens egen fördelning skrivs ut som upplysning.
{
  const SESSIONER = 1000;
  const n = 6;
  const ra = Array(n).fill(0);
  bank.forEach((q) => {
    if (Number.isInteger(q.correctAnswer) && q.correctAnswer < n) ra[q.correctAnswer] += 1;
  });
  const pos = Array(n).fill(0);
  let total = 0;
  for (let s = 0; s < SESSIONER; s++) {
    const id = randomUUID();
    for (const q of bank) {
      if (!Array.isArray(q.options) || q.options.length !== n) continue;
      const perm = blandadPermutation(alternativSeed(id, q.id), n);
      pos[perm.indexOf(q.correctAnswer)] += 1;
      total += 1;
    }
  }
  const andel = pos.map((p) => p / Math.max(total, 1));
  console.log(`\nRätt svar i banken per position (A-F): ${ra.join(' / ')}`);
  console.log(
    `Efter blandning, ${SESSIONER} sessioner: ${andel.map((a) => (a * 100).toFixed(1) + ' %').join(' / ')}`
  );
  andel.forEach((a, i) => {
    if (Math.abs(a - 1 / n) > 0.02) {
      errors.push(
        `rätt svar hamnar på ${String.fromCharCode(65 + i)} i ${(a * 100).toFixed(1)} % efter blandning (ska vara ~16,7 %)`
      );
    }
  });
}

console.log(`\nV7-validering: ${bank.length} frågor i ${path}${pensionerade ? ` (${pensionerade} pensionerade, ${bank.length - pensionerade} valbara)` : ''}\n`);
if (errors.length === 0) {
  console.log('✓ ALLA passerade. Struktur ok, inga dubbletter, inga triviala frågor.');
  process.exit(0);
} else {
  console.log(`✗ ${errors.length} problem:\n`);
  errors.forEach((e) => console.log('  - ' + e));
  process.exit(1);
}
