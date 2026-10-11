// scripts/lib/matris/tolka.mjs
// =============================================================================
// Tolkar en matrisfråga ur de åtta synliga rutorna, utan att titta på facit.
//
// För varje dimension (celler.mjs) prövas alla enkla regler vi använder:
// konstant, vridning i läsordning (fast eller växande steg), period,
// latinsk kvadrat, rad, kolumn, diagonal, överlagring (union, XOR, snitt,
// differens) per rad eller kolumn, överlagring följd av en vridning i
// 45-gradessteg (strålar och sektorer, bandet "svår plus"), spegling i två
// steg, summa av antal.
// Varje regel som stämmer på de synliga rutorna ger en förutsägelse för
// tomrummet. Ger två regler olika svar är frågan tvetydig.
//
// Resultatet används till tre saker:
//   1. facitkontrollen: förutsägelsen ska vara exakt ett alternativ, facit
//   2. familjen ur vilka regler som bär frågan
//   3. misstagstexten: vilken dimension ett fel alternativ har fel i
// =============================================================================

import { dimsFor, rotera, spegelbilder, element, vKey, mod, tile, LAT_MEDURS } from './celler.mjs';

const ORDNING = ['konstant', 'spegling', 'overlagring', 'overlagring-vriden', 'rot-steg', 'rot-kumulativ', 'rad-steg', 'latin', 'rad', 'kolumn', 'diagonal', 'summa', 'rad-aritm', 'antal-steg', 'periodisk'];
const LASORDNING = ['rot-steg', 'rot-kumulativ', 'periodisk', 'antal-steg'];

// Ringar kan läsas på två sätt: antal + innersta + yttre, eller som en
// mängd svarta ringar (för XOR per ring). Tolkningen prövar båda.
function dimsVy(cell, vy) {
  if (cell.kind === 'ring' && vy === 1) {
    return [
      { id: 'ringantal', typ: 'kat', antal: true, varde: cell.rings.length, namn: 'antalet ringar' },
      { id: 'ringsvart', typ: 'mangd', varde: cell.rings.map((f, i) => (f === 'black' ? i : -1)).filter((i) => i >= 0), namn: 'de svarta ringarna', element: ['svart ring', 'svarta ringar'], subj: 'Ringarna', ringar: cell.rings.length },
      { id: 'ringgra', typ: 'kat', varde: cell.rings.includes('gray'), namn: 'den grå ringen' },
    ];
  }
  if (cell.kind === 'lattice' && vy === 1) {
    return [{ id: 'lat-hel', typ: 'rot', latHel: true, n: 4, varde: [...cell.cells], namn: 'mönstret', subj: 'Mönstret', verb: 'vridit sig', grad: 90 }];
  }
  return dimsFor(cell);
}

const POS = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1]];

// ---------------------------------------------------------------- mängdoperationer
function somMangd(dim, v) {
  if (dim.tile) return new Set(element(dim, v));
  if (Array.isArray(v)) return new Set(v.map(String));
  return null;
}
function franMangd(dim, s) {
  if (dim.tile) { let m = 0; for (const x of s) m |= 1 << Number(x); return m; }
  return [...s].map(Number).sort((a, b) => a - b);
}
export const OPS = {
  union: (a, b) => new Set([...a, ...b]),
  xor: (a, b) => new Set([...a, ...b].filter((x) => a.has(x) !== b.has(x))),
  snitt: (a, b) => new Set([...a].filter((x) => b.has(x))),
  'diff-ab': (a, b) => new Set([...a].filter((x) => !b.has(x))),
  'diff-ba': (a, b) => new Set([...b].filter((x) => !a.has(x))),
};
const lika = (a, b) => vKey(a) === vKey(b);

// ---------------------------------------------------------------- regler per dimension
function reglerFor(dim, V, seq, kind) {
  const fynd = [];
  const alla = seq;
  const add = (regel, pred, info = {}) => fynd.push({ regel, pred, info });

  // konstant
  if (alla.every((v) => lika(v, alla[0]))) { add('konstant', alla[0]); return fynd; }

  const harNull = alla.some((v) => v === null || v === undefined);

  // läsordning: vridning
  if (dim.typ === 'rot' && !harNull) {
    for (let k = 1; k < dim.n; k++) {
      let ok = true;
      for (let i = 0; i < 7 && ok; i++) ok = lika(rotera(dim, seq[i], k), seq[i + 1]);
      if (ok) add('rot-steg', rotera(dim, seq[7], k), { k });
    }
    if (!fynd.some((f) => f.regel === 'rot-steg')) {
      for (let a = 0; a < dim.n; a++) for (let b = 1; b < dim.n; b++) {
        let ok = true;
        for (let i = 0; i < 7 && ok; i++) ok = lika(rotera(dim, seq[i], a + b * i), seq[i + 1]);
        if (ok) add('rot-kumulativ', rotera(dim, seq[7], a + b * 7), { a, b });
      }
    }
  }
  // radvis rörelse (bank_version 3, mallarna M1 till M4): inom varje rad tar
  // dimensionen k steg per kolumn, och raden börjar var som helst. Samma sak
  // kolumnvis (transponerat rutnät, info.axel = 'kolumn'). Med egen riktning
  // per rad (M4, info.vaxlar) går rad 1 och 3 k steg och rad 2 lika många åt
  // andra hållet. Läsordningen är specialfallet där varje rad börjar 3k
  // längre fram; då väljs rot-steg ovan (ORDNING), och förutsägelsen är
  // densamma, så ingen fryst fråga blir tvetydig.
  if (dim.typ === 'rot' && !harNull) {
    for (const axel of ['rad', 'kolumn']) {
      const at = (i, j) => (axel === 'rad' ? V[i][j] : V[j][i]);
      const linje = (i, kk, n) => lika(rotera(dim, at(i, 0), kk), at(i, 1)) && (n === 2 || lika(rotera(dim, at(i, 1), kk), at(i, 2)));
      for (let k = 1; k < dim.n; k++) {
        for (const vaxlar of [false, true]) {
          const k1 = vaxlar ? mod(-k, dim.n) : k;
          if (vaxlar && k1 === k) continue;
          if (linje(0, k, 3) && linje(1, k1, 3) && linje(2, k, 2)) add('rad-steg', rotera(dim, at(2, 1), k), { k, axel, vaxlar });
        }
      }
    }
  }
  // radvis räkning (bank_version 3): antalet ändras lika mycket för varje
  // steg åt höger i raden; rad 1 och 3 med d, rad 2 med d eller med -d
  // (egen riktning per rad).
  if (dim.antal && !harNull && alla.every((v) => typeof v === 'number')) {
    for (const axel of ['rad', 'kolumn']) {
      const at = (i, j) => (axel === 'rad' ? V[i][j] : V[j][i]);
      const d = at(0, 1) - at(0, 0);
      if (d === 0) continue;
      const linje = (i, dd, n) => at(i, 1) - at(i, 0) === dd && (n === 2 || at(i, 2) - at(i, 1) === dd);
      for (const vaxlar of [false, true]) {
        if (linje(0, d, 3) && linje(1, vaxlar ? -d : d, 3) && linje(2, d, 2)) add('rad-aritm', at(2, 1) + d, { d, axel, vaxlar });
      }
    }
  }

  // läsordning: period 2-4
  for (let p = 2; p <= 4; p++) {
    let ok = true;
    for (let i = 0; i + p <= 7 && ok; i++) ok = lika(seq[i], seq[i + p]);
    if (ok) { add('periodisk', seq[8 - p], { p }); break; }
  }
  // läsordning: antal som ökar eller minskar jämnt
  if (dim.antal && seq.every((v) => typeof v === 'number')) {
    const d = seq[1] - seq[0];
    if (d !== 0 && seq.every((v, i) => i === 0 || v - seq[i - 1] === d)) add('antal-steg', seq[7] + d, { d });
  }

  // rutnät: latinsk kvadrat
  {
    const keys = V.map((r) => r.map((v) => (v === undefined ? undefined : vKey(v))));
    const distinct = new Set(keys.flat().filter((x) => x !== undefined));
    const rowOk = (r, n) => new Set(keys[r].slice(0, n)).size === n;
    const colOk = (c, n) => new Set([keys[0][c], keys[1][c], ...(n === 3 ? [keys[2][c]] : [])]).size === n;
    if (distinct.size === 3 && rowOk(0, 3) && rowOk(1, 3) && rowOk(2, 2) && colOk(0, 3) && colOk(1, 3) && colOk(2, 2)) {
      const all = [...distinct];
      const missRow = all.find((x) => !keys[2].slice(0, 2).includes(x));
      const missCol = all.find((x) => x !== keys[0][2] && x !== keys[1][2]);
      if (missRow === missCol) {
        const v = alla.find((x) => vKey(x) === missRow);
        add('latin', v);
      }
    }
    // rad: konstant längs varje rad, olika mellan rader
    const radKonst = [0, 1, 2].every((r) => keys[r].filter((x) => x !== undefined).every((x) => x === keys[r][0]));
    if (radKonst && new Set([keys[0][0], keys[1][0], keys[2][0]]).size > 1) add('rad', V[2][0]);
    const kolKonst = [0, 1, 2].every((c) => [keys[0][c], keys[1][c], keys[2][c]].filter((x) => x !== undefined).every((x) => x === keys[0][c]));
    if (kolKonst && new Set(keys[0]).size > 1) add('kolumn', V[0][2]);
    // diagonal (övre vänster till nedre höger) mot resten
    const diagV = [keys[0][0], keys[1][1]];
    const ovr = [keys[0][1], keys[0][2], keys[1][0], keys[1][2], keys[2][0], keys[2][1]];
    if (diagV[0] === diagV[1] && ovr.every((x) => x === ovr[0]) && ovr[0] !== diagV[0]) add('diagonal', V[0][0]);
  }

  // överlagring per rad (kolumn 3 = op(kolumn 1, kolumn 2)) eller per kolumn
  if ((dim.mangd || dim.tile || dim.typ === 'mangd') && !harNull) {
    for (const axel of ['kolumn', 'rad']) {
      for (const [op, f] of Object.entries(OPS)) {
        const trip = axel === 'kolumn'
          ? [[V[0][0], V[0][1], V[0][2]], [V[1][0], V[1][1], V[1][2]]]
          : [[V[0][0], V[1][0], V[2][0]], [V[0][1], V[1][1], V[2][1]]];
        const ok = trip.every(([a, b, c]) => lika(franMangd(dim, f(somMangd(dim, a), somMangd(dim, b))), c));
        if (ok) {
          const [a, b] = axel === 'kolumn' ? [V[2][0], V[2][1]] : [V[0][2], V[1][2]];
          add('overlagring', franMangd(dim, f(somMangd(dim, a), somMangd(dim, b))), { op, axel });
        }
      }
    }
  }

  // överlagring följd av vridning (bandet "svår plus"): tredje rutan är
  // op(första, andra) vriden k steg om 45 grader. Bara mängder på åtta lägen
  // (strålar, sektorer); 2×2 och 3×3 vrids inte här. Operationen ska göra
  // något: blir resultatet bara den ena rutan är det en vridning av den, och
  // då är det en annan familj. Regeln läggs till sist och tas bort igen om en
  // annan regel redan förklarar dimensionen (se nedan), så att de frysta
  // bankernas vridningar och speglingar läses som förut.
  if (dim.mangd && dim.n === 8 && !harNull) {
    for (const axel of ['kolumn', 'rad']) {
      const trip = axel === 'kolumn'
        ? [[V[0][0], V[0][1], V[0][2]], [V[1][0], V[1][1], V[1][2]]]
        : [[V[0][0], V[1][0], V[2][0]], [V[0][1], V[1][1], V[2][1]]];
      const [a3, b3] = axel === 'kolumn' ? [V[2][0], V[2][1]] : [V[0][2], V[1][2]];
      for (const [op, f] of Object.entries(OPS)) {
        for (let k = 1; k < 8; k++) {
          const ok = trip.every(([a, b, c]) => {
            const o = franMangd(dim, f(somMangd(dim, a), somMangd(dim, b)));
            return !lika(o, a) && !lika(o, b) && lika(rotera(dim, o, k), c);
          });
          if (ok) add('overlagring-vriden', rotera(dim, franMangd(dim, f(somMangd(dim, a3), somMangd(dim, b3))), k), { op, axel, k });
        }
      }
    }
  }

  // spegling i två steg: kolumn 2 = M1(kolumn 1), kolumn 3 = M2(kolumn 2), eller per kolumn nedåt
  if ((dim.tile || dim.latHel || (dim.mangd && dim.typ === 'rot')) && !harNull) {
    const T = [];
    spegelbilder(dim, dim.tile ? 1 : dim.latHel ? ['empty', 'empty', 'empty', 'empty'] : [0]).forEach((_, i) => T.push({ namn: 'spegel' + i, f: (v) => spegelbilder(dim, v)[i], spegel: true }));
    for (let k = 1; k < dim.n; k++) T.push({ namn: 'rot' + k, f: (v) => rotera(dim, v, k), spegel: false });
    for (const axel of ['kolumn', 'rad']) {
      const at = (i, j) => (axel === 'kolumn' ? V[i][j] : V[j][i]);
      for (const m1 of T) {
        if (![0, 1, 2].every((i) => lika(m1.f(at(i, 0)), at(i, 1)))) continue;
        for (const m2 of T) {
          if (!m1.spegel && !m2.spegel) continue;
          if (![0, 1].every((i) => lika(m2.f(at(i, 1)), at(i, 2)))) continue;
          add('spegling', m2.f(at(2, 1)), { axel, m1: m1.namn, m2: m2.namn });
        }
      }
    }
  }

  // summa av antal per rad
  if (dim.antal && !harNull) {
    if ([0, 1].every((r) => V[r][0] + V[r][1] === V[r][2])) add('summa', V[2][0] + V[2][1], { axel: 'kolumn' });
    if ([0, 1].every((c) => V[0][c] + V[1][c] === V[2][c])) add('summa', V[0][2] + V[1][2], { axel: 'rad' });
  }

  // Överlagring med vridning räknas bara när ingen enklare regel förklarar
  // de synliga rutorna. En vridning i läsordning är till exempel alltid också
  // "det som finns i den första men inte i den andra, vridet två steg" när
  // rutorna inte överlappar.
  if (fynd.some((f) => f.regel !== 'overlagring-vriden')) return fynd.filter((f) => f.regel !== 'overlagring-vriden');
  return fynd;
}

/**
 * Tolka en fråga. Returnerar:
 *   ok        alla dimensioner har minst en regel
 *   tvetydig  dimensioner där regler ger olika svar
 *   pred      förutsagda värden per dimension
 *   regel     vald regel per dimension (den första i ORDNING)
 *   facit     index för alternativet som stämmer (eller -1), antalTraffar
 */
export function tolka(q) {
  const g = q.grid;
  const forsta = g[0][0];
  if (!forsta || Array.isArray(forsta)) return { ok: false, orsak: 'lagrade celler stöds inte' };
  const kind = forsta.kind;
  if (POS.some(([r, c]) => !g[r][c] || Array.isArray(g[r][c]) || g[r][c].kind !== kind)) return { ok: false, orsak: 'blandade celltyper' };
  if (q.options.some((o) => Array.isArray(o) || o.kind !== kind)) return { ok: false, orsak: 'alternativ av annan typ' };

  const vyer = kind === 'ring' || kind === 'lattice' ? [0, 1] : [0];
  let basta = null;
  for (const vy of vyer) {
    const res = tolkaVy(q, kind, vy);
    if (res.ok && (!basta || !basta.ok || (basta.tvetydig.length && !res.tvetydig.length))) basta = res;
    else if (!basta) basta = res;
  }
  return basta;
}

export function tolkaVy(q, kind, vy) {
  const g = q.grid;
  const dimsMall = dimsVy(g[0][0], vy);
  const regel = {};
  const pred = {};
  const allaRegler = {};
  const tvetydig = [];
  const saknar = [];
  for (const dim of dimsMall) {
    const V = [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? undefined : dimsVy(g[r][c], vy).find((d) => d.id === dim.id).varde)));
    const seq = POS.map(([r, c]) => V[r][c]);
    const fynd = reglerFor(dim, V, seq, kind);
    allaRegler[dim.id] = fynd;
    if (!fynd.length) { saknar.push(dim.id); continue; }
    const preds = new Set(fynd.map((f) => vKey(f.pred)));
    if (preds.size > 1) tvetydig.push({ dim: dim.id, regler: fynd.map((f) => `${f.regel}${f.info.op ? ':' + f.info.op : ''}${f.info.k ? ':k' + f.info.k : ''}${f.info.p ? ':p' + f.info.p : ''}=${vKey(f.pred)}`) });
    const vald = [...fynd].sort((a, b) => ORDNING.indexOf(a.regel) - ORDNING.indexOf(b.regel))[0];
    regel[dim.id] = { ...vald, dim };
    pred[dim.id] = vald.pred;
  }
  const ok = saknar.length === 0;
  const traffar = [];
  if (ok) {
    q.options.forEach((o, i) => {
      const d = dimsVy(o, vy);
      if (d.every((x) => lika(x.varde, pred[x.id]))) traffar.push(i);
    });
  }
  return { ok, vy, kind, saknar, tvetydig, regel, pred, allaRegler, traffar, dimsVy: (c) => dimsVy(c, vy) };
}

// ---------------------------------------------------------------- familj
const RORELSE_REGLER = new Set(['rot-steg', 'rot-kumulativ', 'rad-steg']);

/**
 * Familjen för en fråga som bärs av radvis rörelse (bank_version 3). Två
 * element som rör sig med olika steg: två rörelser. Flera fyllningar i 2×2
 * som vrids lika: mönsterrotation. En växling i schackmönster bredvid
 * rörelsen: rotation med byte. Annars efter primitiven, som i läsordningen.
 */
function familjRadvis(q, t, aktiva) {
  const rs = aktiva.filter((r) => r.regel === 'rad-steg');
  const ovr = aktiva.filter((r) => r.regel !== 'rad-steg');
  const sammaSteg = rs.every((r) => r.info.k === rs[0].info.k && r.info.vaxlar === rs[0].info.vaxlar);
  if (t.kind === 'lattice' && rs.length >= 2 && sammaSteg) return 'monsterrotation';
  if (rs.length >= 2) return 'tva-rorelser';
  if (ovr.some((r) => r.regel === 'periodisk')) return 'rotation-med-byte';
  if (t.kind === 'vector' || t.kind === 'ray' || t.kind === 'poly') return 'vridning';
  if (t.kind === 'orbital') return 'vandring';
  if (t.kind === 'lattice' || t.kind === 'tile') {
    const v = t.dimsVy(q.grid[0][0]).find((d) => d.id === rs[0].dim.id).varde;
    return (rs[0].dim.tile ? tile.antal(v) : v.length) === 1 ? 'vandring' : 'monsterrotation';
  }
  return 'monsterrotation';
}

export function familjFor(q, t = tolka(q)) {
  if (!t.ok) return null;
  const aktiva = Object.values(t.regel).filter((r) => r.regel !== 'konstant');
  const regler = new Set(aktiva.map((r) => r.regel));
  if (regler.has('spegling')) return 'spegling';
  if (regler.has('overlagring') || regler.has('overlagring-vriden')) return 'overlagring';
  if (regler.has('summa') || regler.has('rad-aritm')) return 'antal-andras';
  if (t.kind === 'balanceline') return 'tva-rorelser';
  if (regler.has('rad-steg')) return familjRadvis(q, t, aktiva);
  // Minst två regler varav en latinsk kvadrat, och de övriga är latinska
  // kvadrater, diagonaler eller växlingar i läsordning (schackmönster):
  // latin-flera (bandet "svår plus", P1 till P3).
  if (aktiva.length >= 2 && regler.has('latin') && aktiva.every((r) => ['latin', 'diagonal', 'periodisk'].includes(r.regel))) return 'latin-flera';
  const lasordning = aktiva.filter((r) => LASORDNING.includes(r.regel));
  if (lasordning.length) {
    // antal som ändras: räknedimension, eller en mängd som byter storlek
    const antalAndras = lasordning.some((r) => {
      if (r.dim.antal) return true;
      if (r.dim.mangd || r.dim.tile) {
        const storlekar = new Set(POS.map(([rr, cc]) => {
          const v = t.dimsVy(q.grid[rr][cc]).find((d) => d.id === r.dim.id).varde;
          return r.dim.tile ? tile.antal(v) : v.length;
        }));
        return storlekar.size > 1;
      }
      return false;
    });
    if (antalAndras) return 'antal-andras';
    const rorelse = aktiva.filter((r) => RORELSE_REGLER.has(r.regel) || (r.regel === 'periodisk' && r.dim.typ === 'rot'));
    // 2×2 där flera fyllnadstyper vrids lika långt: ett mönster som roterar
    if (t.kind === 'lattice' && aktiva.length >= 2 && aktiva.every((r) => r.regel === 'rot-steg' && r.info.k === aktiva[0].info.k)) return 'monsterrotation';
    if (aktiva.length >= 2) return rorelse.length >= 2 ? 'tva-rorelser' : 'rotation-med-byte';
    const r = aktiva[0];
    if (t.kind === 'vector' || t.kind === 'ray' || t.kind === 'poly') return 'vridning';
    if (t.kind === 'orbital') return 'vandring';
    if (t.kind === 'lattice' || t.kind === 'tile') {
      const v = t.dimsVy(q.grid[0][0]).find((d) => d.id === r.dim.id).varde;
      const storlek = r.dim.tile ? tile.antal(v) : v.length;
      return storlek === 1 ? 'vandring' : 'monsterrotation';
    }
    return 'monsterrotation';
  }
  // bara rutnätsregler
  if (aktiva.length === 1) {
    const d = aktiva[0].dim;
    const antalLik = d.antal || ((d.mangd || d.typ === 'mangd') && new Set(POS.map(([rr, cc]) => t.dimsVy(q.grid[rr][cc]).find((x) => x.id === d.id).varde.length)).size > 1);
    return antalLik ? 'latin-antal' : 'latin-form';
  }
  return 'latin-flera';
}

export { POS, LASORDNING, LAT_MEDURS, mod };
