// scripts/lib/spatial/brick.mjs
// =============================================================================
// Form A i Spatial förmåga: vriden eller speglad brickfigur
// (brief-tester-steg2-2026-11-09.md avsnitt 2.1, skissens beslut 3).
//
// En figur är en mängd rutor [rad, kolumn] i ett n×n-rutnät, normaliserad så
// att minsta rad och kolumn är 0, och på expert en grå markerad ruta. De åtta
// symmetrioperationerna (fyra vridningar, fyra speglingar) är rena operationer
// på mängden, så facit är deterministiskt.
//
// Spärrarna SP-A1 till SP-A7 ligger i sparrarA() längst ner.
// =============================================================================

import { mulberry32, hashString } from '../serie/slump.mjs';

// ------------------------------------------------------------- figurer

/** Normaliserar: flyttar figuren till (0, 0) och sorterar rutorna. */
export function norm(fig) {
  const r0 = Math.min(...fig.cells.map((c) => c[0]));
  const c0 = Math.min(...fig.cells.map((c) => c[1]));
  const cells = fig.cells.map(([r, c]) => [r - r0, c - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const ut = { cells };
  if (fig.mark) ut.mark = [fig.mark[0] - r0, fig.mark[1] - c0];
  return ut;
}

export const nyckel = (fig) => {
  const f = norm(fig);
  return f.cells.map((c) => c.join(',')).join(' ') + (f.mark ? ` m${f.mark.join(',')}` : '');
};

const map = (fig, f) => norm({ cells: fig.cells.map(f), mark: fig.mark ? f(fig.mark) : undefined });

/** Vridning medurs i 90-gradersteg (skärmkoordinater: rad nedåt, kolumn åt höger). */
export function vrid(fig, grader) {
  let f = fig;
  for (let i = 0; i < ((grader / 90) % 4 + 4) % 4; i++) f = map(f, ([r, c]) => [c, -r]);
  return norm(f);
}

/** Speglingarna: lodrät axel, vågrät axel, diagonal och motdiagonal. */
export const SPEGLINGAR = {
  lodrat: ([r, c]) => [r, -c],
  vagrat: ([r, c]) => [-r, c],
  diagonal: ([r, c]) => [c, r],
  motdiagonal: ([r, c]) => [-c, -r],
};
export const spegla = (fig, axel) => map(fig, SPEGLINGAR[axel]);

export const vridningar = (fig) => [0, 90, 180, 270].map((g) => vrid(fig, g));
export const speglingar = (fig) => Object.keys(SPEGLINGAR).map((a) => spegla(fig, a));
export const attaOperationer = (fig) => [...vridningar(fig), ...speglingar(fig)];

export const storlek = (fig) => {
  const f = norm(fig);
  return [Math.max(...f.cells.map((c) => c[0])) + 1, Math.max(...f.cells.map((c) => c[1])) + 1];
};

export function sammanhangande(cells) {
  const s = new Set(cells.map((c) => c.join(',')));
  const sedd = new Set([cells[0].join(',')]);
  const ko = [cells[0]];
  while (ko.length) {
    const [r, c] = ko.pop();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${r + dr},${c + dc}`;
      if (s.has(k) && !sedd.has(k)) {
        sedd.add(k);
        ko.push([r + dr, c + dc]);
      }
    }
  }
  return sedd.size === cells.length;
}

/**
 * Bästa överlagring (SP-A5, SP-A6): största andelen rutor som stämmer när b
 * förskjuts (och, med vrid = true, vrids) över a. En ruta stämmer när båda
 * har den och den har samma färg (markerad eller bläck).
 */
export function overlapp(a, b, { vrid: medVridning = false } = {}) {
  const A = norm(a);
  const fa = new Map(A.cells.map((c) => [c.join(','), A.mark && c[0] === A.mark[0] && c[1] === A.mark[1] ? 'm' : 'b']));
  let bast = 0;
  for (const B of medVridning ? vridningar(b) : [norm(b)]) {
    const [hb, wb] = storlek(B);
    const [ha, wa] = storlek(A);
    for (let dr = -hb; dr <= ha; dr++) {
      for (let dc = -wb; dc <= wa; dc++) {
        let n = 0;
        for (const [r, c] of B.cells) {
          const farg = B.mark && r === B.mark[0] && c === B.mark[1] ? 'm' : 'b';
          if (fa.get(`${r + dr},${c + dc}`) === farg) n++;
        }
        bast = Math.max(bast, n);
      }
    }
  }
  return bast / A.cells.length;
}

// --------------------------------------------- förbjudna figurer (SP-A7)
// Former som läses som tecken: bokstäverna L, T, U, V, I, kors och pil (i alla
// åtta lägen). Gäller grund, där figurerna är små nog att läsas semantiskt.
const FORBJUDNA_RAA = [
  [[0, 0], [1, 0], [2, 0], [2, 1]], // L
  [[0, 0], [0, 1], [0, 2], [1, 1]], // T
  [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]], // stort T
  [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], // kors
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], // V (vinkel)
  [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]], // U
  [[0, 0], [1, 0], [2, 0]], // I
  [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]], // långt L
  [[0, 1], [1, 0], [1, 1], [1, 2], [2, 0], [2, 2]], // pil
];
const FORBJUDNA = new Set(FORBJUDNA_RAA.flatMap((cells) => attaOperationer({ cells }).map(nyckel)));
export const arForbjuden = (fig) => FORBJUDNA.has(nyckel({ cells: fig.cells }));

// ----------------------------------------------------------- generering

export const NIVAER_A = {
  // Grund: briefen säger 3×3 med 4 till 5 rutor, men i 3×3 finns bara två
  // former som klarar SP-A1, SP-A2 och SP-A7 (P- och F-pentominon); fyra rutor
  // ger bara L, som är förbjudet. Därför får grund också en 4×4-ram med fem
  // rutor (N och Y tillkommer). Figuren är lika liten, bara ramen är större.
  grund: { n: [3, 4], rutor: [5], facit: [90, 180], mark: false },
  avancerad: { n: [4], rutor: [5, 6, 7], facit: [90, 180, 270], mark: false },
  expert: { n: [5], rutor: [7, 8, 9], facit: [90, 180, 270], mark: true },
};

/** En slumpad sammanhängande figur med m rutor som ryms i n×n. */
export function slumpaFigur(rng, n, m, mark) {
  const cells = [[Math.floor(rng() * n), Math.floor(rng() * n)]];
  const s = new Set([cells[0].join(',')]);
  let varv = 0;
  while (cells.length < m && varv++ < 500) {
    const [r, c] = cells[Math.floor(rng() * cells.length)];
    const [dr, dc] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rng() * 4)];
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= n || nc >= n || s.has(`${nr},${nc}`)) continue;
    s.add(`${nr},${nc}`);
    cells.push([nr, nc]);
  }
  if (cells.length < m) return null;
  const fig = { cells };
  if (mark) fig.mark = cells[Math.floor(rng() * cells.length)];
  return norm(fig);
}

/** Facit med en ruta flyttad: en ruta tas bort och läggs till bredvid en annan, figuren hålls sammanhängande. */
export function flyttaRuta(rng, fig, n) {
  for (let f = 0; f < 200; f++) {
    const cells = fig.cells.map((c) => [...c]);
    const i = Math.floor(rng() * cells.length);
    if (fig.mark && cells[i][0] === fig.mark[0] && cells[i][1] === fig.mark[1]) continue;
    cells.splice(i, 1);
    const [r, c] = cells[Math.floor(rng() * cells.length)];
    const [dr, dc] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rng() * 4)];
    const ny = [r + dr, c + dc];
    if (cells.some((x) => x[0] === ny[0] && x[1] === ny[1])) continue;
    if (ny[0] === fig.cells[i][0] && ny[1] === fig.cells[i][1]) continue;
    cells.push(ny);
    if (!sammanhangande(cells)) continue;
    const ut = norm({ cells, mark: fig.mark });
    const [h, w] = storlek(ut);
    if (h > n || w > n) continue;
    return ut;
  }
  return null;
}

const GRADTEXT = { 90: 'vriden 90 grader medurs', 180: 'vriden ett halvt varv', 270: 'vriden 90 grader moturs' };
const AXELTEXT = { lodrat: 'en lodrät linje', vagrat: 'en vågrät linje', diagonal: 'en diagonal', motdiagonal: 'en diagonal' };

/** Misstagstexten för en spegling: vilken axel, och att den inte går att vrida tillbaka. */
function speglingsText(ref, fig) {
  for (const axel of Object.keys(SPEGLINGAR)) {
    for (const g of [0, 90, 180, 270]) {
      if (nyckel(vrid(spegla(ref, axel), g)) === nyckel(fig)) {
        return g === 0
          ? `Spegelvänd. Figuren är speglad i ${AXELTEXT[axel]}, och en spegling går aldrig att vrida tillbaka.`
          : `Spegelvänd och dessutom vriden. En spegling går aldrig att vrida tillbaka till originalet.`;
      }
    }
  }
  return null;
}

/**
 * En uppgift i form A. Null när slumpen inte gav en figur som klarar spärrarna.
 * Alternativen kommer i slumpad ordning; vyn blandar dem dessutom per session.
 */
export function byggUppgiftA({ niva, id, fro }) {
  const N = NIVAER_A[niva];
  const rng = mulberry32(hashString(fro));
  const m = N.rutor[Math.floor(rng() * N.rutor.length)];
  const n = N.n[Math.floor(rng() * N.n.length)];
  const ref = slumpaFigur(rng, n, m, N.mark);
  // en figur som ryms i en mindre ram ritas i den mindre (samma storlek på rutorna i hela banken per ram)
  if (n === 4 && niva === 'grund' && Math.max(...storlek(ref)) < 4) return null;
  if (!ref) return null;
  const grader = N.facit[Math.floor(rng() * N.facit.length)];
  const facit = vrid(ref, grader);
  const dist = [];
  if (niva === 'grund') {
    const sp = spegla(ref, 'lodrat');
    dist.push({ fig: sp, typ: 'spegel' });
    const g2 = [90, 180, 270][Math.floor(rng() * 3)];
    dist.push({ fig: vrid(sp, g2), typ: 'spegel_vriden' });
    const fl = flyttaRuta(rng, facit, n);
    if (!fl) return null;
    dist.push({ fig: fl, typ: 'flyttad' });
  } else {
    const axlar = Object.keys(SPEGLINGAR);
    const bort = Math.floor(rng() * 4);
    for (const [i, axel] of axlar.entries()) if (i !== bort) dist.push({ fig: spegla(ref, axel), typ: 'spegel' });
  }
  const alla = [{ fig: facit, typ: '' }, ...dist];
  for (let i = alla.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [alla[i], alla[j]] = [alla[j], alla[i]];
  }
  const misstag = alla.map((a) => {
    if (!a.typ) return '';
    if (a.typ === 'flyttad') return 'En ruta sitter på fel ställe. Jämför rutorna en i taget, figuren har inte bara vridits.';
    return speglingsText(ref, a.fig) ?? 'Spegelvänd. En spegling går aldrig att vrida tillbaka.';
  });
  return {
    id,
    niva,
    form: 'A',
    fraga: 'Vilken figur är samma som den första, bara vriden?',
    n,
    referens: { kind: 'brick', n, ...ref },
    options: alla.map((a) => ({ kind: 'brick', n, ...a.fig })),
    correctAnswer: alla.findIndex((a) => !a.typ),
    typer: alla.map((a) => a.typ),
    misstag,
    forklaring: `Rätt figur är den första ${GRADTEXT[grader]}.`,
    vridning: grader,
  };
}

// ------------------------------------------------------------- spärrar

/** SP-A1 till SP-A7 på en uppgift. Tom lista: godkänd. */
export function sparrarA(q) {
  const fel = [];
  const id = q.id;
  const N = NIVAER_A[q.niva];
  const fig = (f) => ({ cells: f.cells, mark: f.mark });
  const ref = fig(q.referens);
  const vr = vridningar(ref).map(nyckel);
  const sp = speglingar(ref).map(nyckel);

  if (new Set(vr).size !== 4) fel.push(`${id}: SP-A1 figuren har rotationssymmetri`);
  if (sp.some((k) => vr.includes(k))) fel.push(`${id}: SP-A2 figuren har spegelsymmetri`);

  const alt = q.options.map((o) => nyckel(fig(o)));
  if (new Set(alt).size !== alt.length) fel.push(`${id}: SP-A3 två alternativ är lika`);
  if (alt.includes(vr[0])) fel.push(`${id}: SP-A3 ett alternativ är referensen ovriden`);
  const facit = alt[q.correctAnswer];
  if (!vr.slice(1).includes(facit)) fel.push(`${id}: facit är inte en vridning av referensen`);
  if (q.options.length !== 4) fel.push(`${id}: ${q.options.length} alternativ, ska vara fyra`);
  alt.forEach((k, i) => {
    if (i === q.correctAnswer) return;
    if (vr.includes(k)) fel.push(`${id}: alternativ ${i + 1} är också en vridning av referensen`);
    if (q.typer[i] === 'flyttad' && sp.includes(k)) fel.push(`${id}: SP-A4 den flyttade rutan gav en spegling`);
    if (q.typer[i] === 'spegel' || q.typer[i] === 'spegel_vriden') {
      if (!sp.includes(k)) fel.push(`${id}: alternativ ${i + 1} är märkt spegling men är det inte`);
    }
    if (!q.misstag[i]) fel.push(`${id}: alternativ ${i + 1} saknar misstagstext`);
  });

  if (q.niva === 'grund' && q.vridning === 180) {
    const halv = vrid(ref, 180);
    const lika = Math.round(overlapp(ref, halv) * ref.cells.length);
    if (ref.cells.length - lika < 2) fel.push(`${id}: SP-A5 facit 180 grader men figuren är nära punktsymmetrisk`);
  }
  if (q.niva === 'grund' && !N.facit.includes(q.vridning)) fel.push(`${id}: facit på grund ska vara 90 eller 180 grader`);

  if (q.niva === 'expert') {
    const fa = q.options[q.correctAnswer];
    q.options.forEach((o, i) => {
      if (i === q.correctAnswer) return;
      const p = overlapp(fig(fa), fig(o), { vrid: true });
      if (p < 0.8 || p > 0.95) fel.push(`${id}: SP-A6 alternativ ${i + 1} delar ${Math.round(p * 100)} procent med facit, ska vara 80 till 95`);
    });
    if (!q.referens.mark) fel.push(`${id}: expert saknar den markerade rutan`);
  }
  if (q.niva === 'grund') {
    if ([q.referens, ...q.options].some((o) => arForbjuden(o))) fel.push(`${id}: SP-A7 en figur läses som ett tecken (L, T, U, V, kors, pil)`);
  }

  // struktur: rutnätets storlek, antal rutor, sammanhängande
  for (const o of [q.referens, ...q.options]) {
    const [h, w] = storlek(fig(o));
    if (h > q.n || w > q.n || o.n !== q.n || !N.n.includes(q.n)) fel.push(`${id}: en figur ryms inte i ramen ${q.n}×${q.n}`);
    if (!sammanhangande(o.cells)) fel.push(`${id}: en figur hänger inte ihop`);
  }
  if (!N.rutor.includes(ref.cells.length)) fel.push(`${id}: ${ref.cells.length} rutor, nivån har ${N.rutor.join(' till ')}`);
  return fel;
}
