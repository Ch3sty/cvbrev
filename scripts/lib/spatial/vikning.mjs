// scripts/lib/spatial/vikning.mjs
// =============================================================================
// Form B i Spatial förmåga: pappersvikning med hål, på expert med klipp
// (brief-tester-steg2-2026-11-09.md avsnitt 2.2, skissens beslut 4).
//
// Arket är 4×4 rutor (en ruta = 1 enhet, x = kolumn, y = rad). En vikning är
// en linje och en sida som viks över: lodrät x = k, vågrät y = k, diagonal
// y = x + k eller motdiagonal y = −k + ... (y = −x + k). Allt är heltals-
// geometri, så facit är deterministiskt.
//
// Facit räknas fram baklänges: hålen i det vikta arket speglas över den sista
// viklinjen, sedan den näst sista och så vidare (uppvik). Som kontroll räknas
// samma sak framlänges genom att följa varje rutas lager genom vikningarna
// (lager); spärren SP-B0 kräver att de två ger samma hål.
//
// Briefen säger 6×6 på expert. Med arket 68 enheter blir en ruta i 6×6
// 11,3 enheter, och ett hål (r 4) i en kantruta hamnar 0,2 enheter från
// arkets kontur: det ser ut som ett hack. Expert använder därför 4×4 med tre
// vikningar varav minst en remsa (kvartsvikning), och klippet. Diagonaler
// används på avancerad men inte med klipp: en diagonal delar rutor, och ett
// klipp i en halv ruta går inte att rita entydigt.
// =============================================================================

import { mulberry32, hashString } from '../serie/slump.mjs';

export const N = 4;
const EPS = 1e-9;

// ------------------------------------------------------------ geometri

/** Linjens sidofunktion: tecknet säger vilken sida punkten ligger på. */
export function sida(v, [x, y]) {
  switch (v.typ) {
    case 'v':
      return x - v.k;
    case 'h':
      return y - v.k;
    case 'd':
      return y - x - v.k;
    case 'a':
      return y + x - v.k;
  }
}

/** Spegling av en punkt över vikningens linje. */
export function spegelPunkt(v, [x, y]) {
  switch (v.typ) {
    case 'v':
      return [2 * v.k - x, y];
    case 'h':
      return [x, 2 * v.k - y];
    case 'd':
      return [y - v.k, x + v.k];
    case 'a':
      return [v.k - y, v.k - x];
  }
}

/** Spegling av en ruta [rad, kolumn] (rutans mitt speglas). Null om mitten inte hamnar i en rutmitt. */
export function spegelRuta(v, [r, c]) {
  const [x, y] = spegelPunkt(v, [c + 0.5, r + 0.5]);
  const nc = x - 0.5;
  const nr = y - 0.5;
  if (Math.abs(nc - Math.round(nc)) > EPS || Math.abs(nr - Math.round(nr)) > EPS) return null;
  return [Math.round(nr), Math.round(nc)];
}

/** Skär linjen genom rutans inre? (då delas ett hål där, SP-B1) */
export function delarRuta(v, [r, c]) {
  const hörn = [[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]].map((p) => sida(v, p));
  return Math.min(...hörn) < -EPS && Math.max(...hörn) > EPS;
}

/** Konvex polygon klippt med halvplanet tecken × sida ≤ 0 (Sutherland–Hodgman). */
export function klipp(poly, v, tecken) {
  const ut = [];
  const f = (p) => tecken * sida(v, p);
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = f(a);
    const fb = f(b);
    if (fa <= EPS) ut.push(a);
    if ((fa < -EPS && fb > EPS) || (fa > EPS && fb < -EPS)) {
      const t = fa / (fa - fb);
      ut.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return rensa(ut);
}

const rund = (x) => Math.round(x * 1e6) / 1e6;
function rensa(pts) {
  const p = pts.map(([x, y]) => [rund(x), rund(y)]);
  const ut = p.filter((q, i) => {
    const r = p[(i + p.length - 1) % p.length];
    return Math.abs(q[0] - r[0]) > EPS || Math.abs(q[1] - r[1]) > EPS;
  });
  // ta bort punkter på raka sträckor
  return ut.filter((q, i) => {
    const a = ut[(i + ut.length - 1) % ut.length];
    const b = ut[(i + 1) % ut.length];
    return Math.abs((q[0] - a[0]) * (b[1] - q[1]) - (q[1] - a[1]) * (b[0] - q[0])) > EPS;
  });
}

export const area = (poly) => Math.abs(poly.reduce((s, a, i) => {
  const b = poly[(i + 1) % poly.length];
  return s + a[0] * b[1] - b[0] * a[1];
}, 0)) / 2;

/** Punkt i (eller på randen av) en konvex polygon. */
export function inne(poly, p) {
  let tecken = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const k = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    if (Math.abs(k) < EPS) continue;
    if (tecken && Math.sign(k) !== tecken) return false;
    tecken = Math.sign(k);
  }
  return true;
}

export const helRuta = (poly, [r, c]) => [[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]].every((p) => inne(poly, p));

export const tyngdpunkt = (poly) => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];

/** Linjens sträcka inom polygonen (viklinjen går från kant till kant, SP-B5). */
export function linjeISpolygon(poly, v) {
  const pts = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = sida(v, a);
    const fb = sida(v, b);
    if (Math.abs(fa) < EPS) pts.push(a);
    else if (fa * fb < -EPS * EPS && Math.abs(fb) > EPS) {
      const t = fa / (fa - fb);
      pts.push([rund(a[0] + t * (b[0] - a[0])), rund(a[1] + t * (b[1] - a[1]))]);
    }
  }
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  return [pts[0], pts[pts.length - 1]];
}

// ------------------------------------------------------------- vikning

export const ARK = [[0, 0], [N, 0], [N, N], [0, N]];

/**
 * Tillämpar vikningarna i tur och ordning. En vikning är { typ, k, flytt }
 * där flytt (+1 eller −1) är sidan som viks över. Returnerar regionerna
 * (polygon före och efter varje vikning) eller null om en vikning inte går
 * (ingen yta viks, eller den vikta delen hamnar utanför den som ligger kvar).
 */
export function vik(vikningar) {
  let poly = ARK;
  const steg = [];
  for (const v of vikningar) {
    const rorlig = klipp(poly, v, -v.flytt);
    const kvar = klipp(poly, v, v.flytt);
    if (rorlig.length < 3 || kvar.length < 3 || area(rorlig) < EPS) return null;
    const speglad = rorlig.map((p) => spegelPunkt(v, p));
    if (!speglad.every((p) => inne(kvar, p))) return null;
    steg.push({ v, fore: poly, rorlig, efter: kvar });
    poly = kvar;
  }
  return { steg, slut: poly };
}

/**
 * Framlänges: varje originalruta följs genom vikningarna. En ruta som en
 * viklinje skär är delad och kan aldrig få ett helt hål. Returnerar en karta
 * från läge i det vikta arket till lagren (originalrutor) och de delade rutorna.
 */
export function lager(vikningar) {
  const pos = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) pos.push({ orig: [r, c], nu: [r, c], delad: false });
  for (const v of vikningar) {
    for (const p of pos) {
      if (delarRuta(v, p.nu)) {
        p.delad = true;
        continue;
      }
      const mitt = [p.nu[1] + 0.5, p.nu[0] + 0.5];
      if (Math.sign(sida(v, mitt)) === v.flytt) p.nu = spegelRuta(v, p.nu);
    }
  }
  const karta = new Map();
  for (const p of pos) {
    const k = p.nu.join(',');
    if (!karta.has(k)) karta.set(k, { lager: [], delad: false });
    karta.get(k).lager.push(p.orig);
    if (p.delad) karta.get(k).delad = true;
  }
  return karta;
}

/** Rutor i det vikta arket där ett hål kan stansas: hela, utan delat lager. */
export function stansbara(vikningar) {
  const r = vik(vikningar);
  if (!r) return [];
  const karta = lager(vikningar);
  const ut = [];
  for (const [k, v] of karta) {
    const ruta = k.split(',').map(Number);
    if (!v.delad && helRuta(r.slut, ruta)) ut.push(ruta);
  }
  return ut.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

const nyck = (rutor) => [...new Set(rutor.map((x) => x.join(',')))].sort().join(' ');
const unika = (rutor) => [...new Map(rutor.map((x) => [x.join(','), x])).values()];

/**
 * Baklänges: speglar rutorna över vikningarna från den sista till den första.
 * `vikningar` kan vara fel (en distraktor) men ska då ge rutor inne i arket.
 * Ett hål i läge p efter vikning j finns i lagret som låg kvar (p) och i
 * lagret som vektes över (spegelbilden av p), om det fanns papper där.
 */
export function uppvik(rutor, vikningar, regioner) {
  let H = unika(rutor);
  const steg = [];
  for (let j = vikningar.length - 1; j >= 0; j--) {
    const v = vikningar[j];
    const fore = regioner[j];
    const ny = [];
    for (const p of H) {
      ny.push(p);
      const s = spegelRuta(v, p);
      if (s && helRuta(fore, s)) ny.push(s);
    }
    H = unika(ny);
    steg.push(H);
  }
  return { slut: H, steg };
}

/** Hela arket utan vikningar. */
const helaArket = () => {
  const ut = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) ut.push([r, c]);
  return ut;
};

// ------------------------------------------------------------- generering

/** Fel axel: linjen vinkelrät mot den rätta genom samma mittpunkt i regionen. */
export function felAxel(v, region) {
  const [cx, cy] = tyngdpunktRam(region);
  if (v.typ === 'v') return { typ: 'h', k: cy, flytt: v.flytt };
  if (v.typ === 'h') return { typ: 'v', k: cx, flytt: v.flytt };
  if (v.typ === 'd') return { typ: 'a', k: cx + cy, flytt: v.flytt };
  return { typ: 'd', k: cy - cx, flytt: v.flytt };
}
const tyngdpunktRam = (poly) => {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
};

/** Möjliga vikningar av en region: linjer genom heltal och halvtal, båda sidorna. */
export function kandidater(poly) {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const ut = [];
  for (let k = Math.min(...xs) + 0.5; k < Math.max(...xs); k += 0.5) for (const f of [1, -1]) ut.push({ typ: 'v', k, flytt: f });
  for (let k = Math.min(...ys) + 0.5; k < Math.max(...ys); k += 0.5) for (const f of [1, -1]) ut.push({ typ: 'h', k, flytt: f });
  for (let k = -N; k <= N; k++) for (const f of [1, -1]) ut.push({ typ: 'd', k, flytt: f });
  for (let k = 0; k <= 2 * N; k++) for (const f of [1, -1]) ut.push({ typ: 'a', k, flytt: f });
  return ut.filter((v) => {
    const rorlig = klipp(poly, v, -v.flytt);
    const kvar = klipp(poly, v, v.flytt);
    if (rorlig.length < 3 || kvar.length < 3) return false;
    // sidorna längs diagonal och axel måste gå genom rutornas hörn, så att rutor speglas på rutor
    if ((v.typ === 'v' || v.typ === 'h') && !Number.isInteger(v.k * 2)) return false;
    return rorlig.map((p) => spegelPunkt(v, p)).every((p) => inne(kvar, p));
  });
}

/** Typ av vikning: halv (lika stora delar), remsa (mindre del) eller diagonal. */
export function vikTyp(v, poly) {
  if (v.typ === 'd' || v.typ === 'a') return 'diagonal';
  const a = area(klipp(poly, v, -v.flytt));
  const b = area(klipp(poly, v, v.flytt));
  return Math.abs(a - b) < EPS ? 'halv' : 'remsa';
}

export const NIVAER_B = {
  grund: { vikningar: 1, hal: [1], facit: [2, 2], klipp: false },
  avancerad: { vikningar: 2, hal: [1], facit: [2, 4], klipp: false },
  expert: { vikningar: 3, hal: [1], facit: [4, 8], klipp: true },
};

const TEXT = {
  stansat: 'Du ritade bara hålet som stansades. När arket viks upp får varje lager ett hål.',
  bara_sista: 'Du vek bara upp den sista vikningen. Arket har vikts fler gånger än så.',
  fel_axel: 'Du speglade över fel linje. Hålen speglas över den streckade viklinjen.',
  utelamnad: 'Du hoppade över en av vikningarna när du vek upp.',
  extra: 'Ett hål för mycket. Hålen speglas bara över linjerna där arket vikts.',
  en_fel_plats: 'Rätt antal hål, men ett sitter på fel ställe.',
  fel_ordning: 'Du vek upp i fel ordning. Den sista vikningen öppnas först.',
};
export const DISTRAKTORTYPER_B = Object.keys(TEXT);

/** Det uppvikta arket när vikningarna öppnas, med fel eller rätt. */
function utfall(hal, klippRuta, vikningar, regioner) {
  const h = uppvik(hal, vikningar, regioner).slut;
  const k = klippRuta ? uppvik([klippRuta], vikningar, regioner).slut : [];
  return { hal: h, klipp: k };
}

const arkNyckel = (u) => `${nyck(u.hal)}|${nyck(u.klipp)}`;
const iArket = (u) => [...u.hal, ...u.klipp].every(([r, c]) => r >= 0 && c >= 0 && r < N && c < N);

export function byggUppgiftB({ niva, id, fro }) {
  const L = NIVAER_B[niva];
  const rng = mulberry32(hashString(fro));
  const valj = (a) => a[Math.floor(rng() * a.length)];

  // vikningarna
  const vikningar = [];
  let poly = ARK;
  for (let i = 0; i < L.vikningar; i++) {
    let k = kandidater(poly);
    if (niva === 'grund') k = k.filter((v) => (v.typ === 'v' || v.typ === 'h') && vikTyp(v, poly) === 'halv');
    if (niva === 'avancerad') k = k.filter((v) => vikTyp(v, poly) !== 'remsa' || i === 1);
    if (niva === 'expert') k = k.filter((v) => (v.typ === 'v' || v.typ === 'h') && Number.isInteger(v.k));
    if (!k.length) return null;
    const v = valj(k);
    vikningar.push(v);
    poly = klipp(poly, v, v.flytt);
  }
  const typer = vikningar.map((v, i) => vikTyp(v, i === 0 ? ARK : vik(vikningar.slice(0, i)).slut));
  if (niva === 'expert' && !typer.some((t) => t !== 'halv')) return null;
  if (niva === 'avancerad' && new Set(vikningar.map((v) => v.typ)).size < 2 && typer.every((t) => t === 'halv')) {
    // två halva vikningar längs samma axel ger bara en remsa: tillåtet men sällan
    if (rng() < 0.7) return null;
  }
  const r = vik(vikningar);
  if (!r) return null;
  const regioner = r.steg.map((s) => s.fore);

  // hålet och klippet
  const bara = stansbara(vikningar);
  if (!bara.length) return null;
  const hal = [valj(bara)];
  let klippRuta = null;
  if (L.klipp) {
    const kant = bara.filter((p) => p.join() !== hal[0].join() && oppnaSidor(r.slut, p) >= 1 && kantEllerHorn(r.slut, p));
    if (!kant.length) return null;
    klippRuta = valj(kant);
  }

  const facit = utfall(hal, klippRuta, vikningar, regioner);
  if (facit.hal.length < L.facit[0] || facit.hal.length > L.facit[1]) return null;
  if (!ok(facit)) return null;
  // varje vikning ska ge fler hål (eller klipp) när den viks upp, annars spelar den ingen roll för svaret
  if (!varjeVikningRaknas(hal, klippRuta ? [klippRuta] : [], vikningar, regioner)) return null;

  // distraktorerna, byggda av samma uppvikning med ett steg fel
  const kand = [];
  const lagg = (typ, u) => {
    if (u && iArket(u)) kand.push({ typ, u });
  };
  lagg('stansat', { hal, klipp: klippRuta ? [klippRuta] : [] });
  if (vikningar.length > 1) lagg('bara_sista', utfall(hal, klippRuta, vikningar.slice(-1), regioner.slice(-1)));
  vikningar.forEach((v, j) => {
    const fel = vikningar.map((x, i) => (i === j ? felAxel(x, regioner[j]) : x));
    lagg('fel_axel', utfall(hal, klippRuta, fel, regioner.map((p, i) => (i === j ? helaArketPoly() : p))));
    if (vikningar.length > 1) {
      const utan = vikningar.filter((_, i) => i !== j);
      lagg('utelamnad', utfall(hal, klippRuta, utan, regioner.filter((_, i) => i !== j)));
    }
  });
  if (vikningar.length > 1) {
    const bak = [...vikningar].reverse();
    lagg('fel_ordning', utfall(hal, klippRuta, bak, bak.map(() => helaArketPoly())));
  }
  // ett hål för mycket: ett av facits hål speglat över en mittaxel som inte är vikt
  for (const ax of [{ typ: 'v', k: 2 }, { typ: 'h', k: 2 }, { typ: 'd', k: 0 }, { typ: 'a', k: 4 }]) {
    for (const p of facit.hal) {
      const s = spegelRuta(ax, p);
      if (s && !facit.hal.some((q) => q.join() === s.join()) && !facit.klipp.some((q) => q.join() === s.join())) {
        lagg('extra', { hal: [...facit.hal, s], klipp: facit.klipp });
        lagg('en_fel_plats', { hal: [...facit.hal.filter((q) => q !== p), s], klipp: facit.klipp });
      }
    }
  }

  // välj tre: nivåns förval först, sedan övriga, alla olika och skilda från facit
  const ordning = {
    grund: ['stansat', 'fel_axel', 'extra', 'en_fel_plats'],
    avancerad: ['bara_sista', 'fel_axel', 'en_fel_plats', 'utelamnad', 'stansat', 'fel_ordning', 'extra'],
    expert: ['utelamnad', 'fel_ordning', 'fel_axel', 'bara_sista', 'en_fel_plats'],
  }[niva];
  const sedda = new Set([arkNyckel(facit)]);
  const valda = [];
  const anvandaTyper = new Set();
  for (const pass of [0, 1]) {
    for (const typ of ordning) {
      if (pass === 0 && anvandaTyper.has(typ)) continue;
      for (const c of shuffle(kand.filter((x) => x.typ === typ), rng)) {
        if (valda.length >= 3) break;
        const n = arkNyckel(c.u);
        if (sedda.has(n) || !ok(c.u)) continue;
        if (typ !== 'stansat' && n === arkNyckel({ hal, klipp: klippRuta ? [klippRuta] : [] })) continue;
        if (pass === 0 && anvandaTyper.has(typ)) break;
        sedda.add(n);
        valda.push(c);
        anvandaTyper.add(typ);
      }
    }
  }
  if (valda.length < 3) return null;

  const alla = shuffle([{ typ: '', u: facit }, ...valda], rng);
  const sekvens = r.steg.map((s) => vikFigur(s));
  if (sekvens.some((f) => !f)) return null;
  sekvens.push({ kind: 'ark-stans', n: N, poly: r.slut, hal, ...(klippRuta ? { klipp: [klippRuta] } : {}) });
  // uppvikningen baklänges till genomgången
  const upp = uppvik(hal, vikningar, regioner).steg;
  const uppK = klippRuta ? uppvik([klippRuta], vikningar, regioner).steg : null;
  const uppvikning = upp.map((h, i) => {
    const j = vikningar.length - 1 - i; // regionen före vikning j
    const k = uppK ? uppK[i] : [];
    return j === 0 ? { kind: 'ark-ut', n: N, hal: h, klipp: k } : { kind: 'ark-stans', n: N, poly: regioner[j], hal: h, ...(k.length ? { klipp: k } : {}) };
  });
  const antal = vikningar.length === 1 ? 'en gång' : vikningar.length === 2 ? 'två gånger' : 'tre gånger';
  return {
    id,
    niva,
    form: 'B',
    ...(klippRuta ? { klipp: true } : {}),
    fraga: klippRuta ? 'Arket viks, ett hål stansas och en bit klipps bort. Hur ser arket ut när det viks upp?' : 'Arket viks och ett hål stansas. Hur ser arket ut när det viks upp?',
    sekvens,
    options: alla.map((a) => ({ kind: 'ark-ut', n: N, hal: a.u.hal, klipp: a.u.klipp })),
    correctAnswer: alla.findIndex((a) => !a.typ),
    typer: alla.map((a) => a.typ),
    misstag: alla.map((a) => (a.typ ? TEXT[a.typ] : '')),
    forklaring: `Arket viks ${antal}. Vik upp baklänges, den sista vikningen först, och spegla hålen${klippRuta ? ' och klippet' : ''} över varje viklinje. Det ger ${facit.hal.length} hål.`,
    uppvikning,
    vikningar,
  };
}

const helaArketPoly = () => ARK;
function ok(u) {
  // hål och klipp får inte ligga i samma ruta
  const k = new Set(u.klipp.map((x) => x.join(',')));
  if (!u.hal.every((h) => !k.has(h.join(','))) || !u.hal.length) return false;
  return papperHel(u.klipp);
}
/**
 * Papperet som är kvar efter klippen hänger ihop sida mot sida, och inga
 * klipp möts bara i ett hörn (då får konturen en nypa och en bit hänger i en punkt).
 */
export function papperHel(klippRutor) {
  const k = new Set(klippRutor.map((x) => x.join(',')));
  const kvar = helaArket().filter((x) => !k.has(x.join(',')));
  if (!kvar.length) return false;
  // en hel rad eller kolumn bortklippt läses som ett mindre ark, inte som ett klipp
  for (let i = 0; i < N; i++) {
    if ([0, 1, 2, 3].every((j) => k.has(`${i},${j}`)) || [0, 1, 2, 3].every((j) => k.has(`${j},${i}`))) return false;
  }
  const s = new Set(kvar.map((x) => x.join(',')));
  const sedd = new Set([kvar[0].join(',')]);
  const ko = [kvar[0]];
  while (ko.length) {
    const [r, c] = ko.pop();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = `${r + dr},${c + dc}`;
      if (s.has(n) && !sedd.has(n)) {
        sedd.add(n);
        ko.push([r + dr, c + dc]);
      }
    }
  }
  if (sedd.size !== kvar.length) return false;
  // två kvarvarande rutor som bara möts i ett hörn (båda rutorna emellan klippta) ger en nypa
  for (const [r, c] of kvar) {
    for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const diag = s.has(`${r + dr},${c + dc}`);
      const a = s.has(`${r + dr},${c}`);
      const b = s.has(`${r},${c + dc}`);
      if (diag && !a && !b) return false;
    }
  }
  return true;
}

/** Varje uppvikning ökar antalet hål eller klippta rutor. */
export function varjeVikningRaknas(hal, klippRutor, vikningar, regioner) {
  const h = uppvik(hal, vikningar, regioner).steg;
  const k = klippRutor.length ? uppvik(klippRutor, vikningar, regioner).steg : h.map(() => []);
  let [fh, fk] = [hal.length, klippRutor.length];
  for (let i = 0; i < h.length; i++) {
    if (h[i].length <= fh && k[i].length <= fk) return false;
    [fh, fk] = [h[i].length, k[i].length];
  }
  return true;
}
function shuffle(a, rng) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

/** Antal av rutans sidor som ligger på polygonens rand. */
export function oppnaSidor(poly, [r, c]) {
  const sidor = [[[c, r], [c + 1, r]], [[c + 1, r], [c + 1, r + 1]], [[c, r + 1], [c + 1, r + 1]], [[c, r], [c, r + 1]]];
  return sidor.filter(([a, b]) => paRandSida(poly, a, b)).length;
}

/** Klipp i kant (en sida på randen) eller hörn (två sidor som möts), aldrig en ruta som är öppen åt tre håll. */
export function kantEllerHorn(poly, [r, c]) {
  const sidor = [[[c, r], [c + 1, r]], [[c + 1, r], [c + 1, r + 1]], [[c, r + 1], [c + 1, r + 1]], [[c, r], [c, r + 1]]];
  const o = sidor.map(([a, b]) => paRandSida(poly, a, b));
  const n = o.filter(Boolean).length;
  if (n === 1) return true;
  if (n === 2) return !(o[0] && o[2]) && !(o[1] && o[3]);
  return false;
}

function paRandSida(poly, a, b) {
  return poly.some((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const k = (x) => (q[0] - p[0]) * (x[1] - p[1]) - (q[1] - p[1]) * (x[0] - p[0]);
    const inom = (x) => x[0] >= Math.min(p[0], q[0]) - EPS && x[0] <= Math.max(p[0], q[0]) + EPS && x[1] >= Math.min(p[1], q[1]) - EPS && x[1] <= Math.max(p[1], q[1]) + EPS;
    return Math.abs(k(a)) < EPS && Math.abs(k(b)) < EPS && inom(a) && inom(b);
  });
}

/** Ligger någon av rutans sidor på polygonens rand? (klipp i kant eller hörn, SP-B6) */
export function randRuta(poly, [r, c]) {
  const sidor = [[[c, r], [c + 1, r]], [[c + 1, r], [c + 1, r + 1]], [[c, r + 1], [c + 1, r + 1]], [[c, r], [c, r + 1]]];
  return sidor.some(([a, b]) =>
    poly.some((p, i) => {
      const q = poly[(i + 1) % poly.length];
      const k = (x) => (q[0] - p[0]) * (x[1] - p[1]) - (q[1] - p[1]) * (x[0] - p[0]);
      const inom = (x) => x[0] >= Math.min(p[0], q[0]) - EPS && x[0] <= Math.max(p[0], q[0]) + EPS && x[1] >= Math.min(p[1], q[1]) - EPS && x[1] <= Math.max(p[1], q[1]) + EPS;
      return Math.abs(k(a)) < EPS && Math.abs(k(b)) < EPS && inom(a) && inom(b);
    })
  );
}

/** Rutan i sekvensen: regionen före vikningen, delen som viks, linjen och pilen. */
export function vikFigur({ v, fore, rorlig }) {
  const linje = linjeISpolygon(fore, v);
  const t = tyngdpunkt(rorlig);
  const s = spegelPunkt(v, t);
  // Pilen högst 30 enheter (68/4 = 17 enheter per ruta), centrerad på mitten
  // mellan delarna, och kortas tills spetsen med pilhuvud ryms i [15, 85]
  // (rutan ritas med regionens mitt i 50).
  const E = 17;
  const xs = fore.map((p) => p[0]);
  const ys = fore.map((p) => p[1]);
  const c = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  const vb = (p) => [50 + (p[0] - c[0]) * E, 50 + (p[1] - c[1]) * E];
  const L = Math.hypot(s[0] - t[0], s[1] - t[1]);
  const m = [(t[0] + s[0]) / 2, (t[1] + s[1]) / 2];
  let f = Math.min(1, 30 / E / L);
  let pil = null;
  let ryms = false;
  for (; f > 0.2; f -= 0.05) {
    pil = [
      [rund(m[0] + (t[0] - m[0]) * f), rund(m[1] + (t[1] - m[1]) * f)],
      [rund(m[0] + (s[0] - m[0]) * f), rund(m[1] + (s[1] - m[1]) * f)],
    ];
    const [a, b] = pil.map(vb);
    const u = [(b[0] - a[0]) / Math.hypot(b[0] - a[0], b[1] - a[1]), (b[1] - a[1]) / Math.hypot(b[0] - a[0], b[1] - a[1])];
    const hörn = [a, b, [b[0] - 9 * u[0] - 7 * u[1], b[1] - 9 * u[1] + 7 * u[0]], [b[0] - 9 * u[0] + 7 * u[1], b[1] - 9 * u[1] - 7 * u[0]]];
    if (hörn.every(([x, y]) => x >= 16 && x <= 84 && y >= 16 && y <= 84)) {
      ryms = true;
      break;
    }
  }
  if (!ryms) return null;
  // pilen ska gå att läsa: minst 16 enheter lång (en remsa är 17)
  const [pa, pb] = pil.map(vb);
  if (Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) < 16) return null;
  return { kind: 'ark-vik', n: N, poly: fore, rorlig, linje, pil };
}

export const nyckelB = (q) => `${JSON.stringify(q.vikningar)}|${nyck(q.sekvens[q.sekvens.length - 1].hal)}|${q.sekvens[q.sekvens.length - 1].klipp?.map((x) => x.join()).join() ?? ''}`;

// ------------------------------------------------------------- spärrar

export function sparrarB(q) {
  const fel = [];
  const id = q.id;
  const L = NIVAER_B[q.niva];
  const r = vik(q.vikningar);
  if (!r) return [`${id}: vikningarna går inte att utföra`];
  const regioner = r.steg.map((s) => s.fore);
  const stans = q.sekvens[q.sekvens.length - 1];
  const klippRutor = stans.klipp ?? [];

  // SP-B0 facit baklänges = facit framlänges
  const bak = utfall(stans.hal, klippRutor[0] ?? null, q.vikningar, regioner);
  const karta = lager(q.vikningar);
  const fram = (rutor) => rutor.flatMap((p) => karta.get(p.join(','))?.lager ?? []);
  const facit = q.options[q.correctAnswer];
  if (nyck(bak.hal) !== nyck(facit.hal) || nyck(bak.klipp) !== nyck(facit.klipp)) fel.push(`${id}: facit stämmer inte med uppvikningen baklänges`);
  if (nyck(fram(stans.hal)) !== nyck(facit.hal) || nyck(fram(klippRutor)) !== nyck(facit.klipp)) fel.push(`${id}: SP-B0 framlänges och baklänges ger olika hål`);

  // SP-B1 hålet (och klippet) aldrig i en ruta som en viklinje delar
  const bara = new Set(stansbara(q.vikningar).map((x) => x.join(',')));
  for (const p of [...stans.hal, ...klippRutor]) if (!bara.has(p.join(','))) fel.push(`${id}: SP-B1 ${p.join(',')} ligger på en viklinje eller utanför arket`);

  // SP-B2 antal hål i facit
  if (facit.hal.length < L.facit[0] || facit.hal.length > L.facit[1]) fel.push(`${id}: SP-B2 facit har ${facit.hal.length} hål, nivån ${L.facit.join(' till ')}`);

  // SP-B3 alternativen olika, inget lika med det stansade arket om det inte är avsikten
  const nycklar = q.options.map(arkNyckel);
  if (new Set(nycklar).size !== 4) fel.push(`${id}: SP-B3 två alternativ är lika`);
  const stansNyckel = arkNyckel({ hal: stans.hal, klipp: klippRutor });
  nycklar.forEach((n, i) => {
    if (n === stansNyckel && q.typer[i] !== 'stansat') fel.push(`${id}: SP-B3 alternativ ${i + 1} är det stansade arket`);
    if (i !== q.correctAnswer && !DISTRAKTORTYPER_B.includes(q.typer[i])) fel.push(`${id}: alternativ ${i + 1} saknar feltyp`);
  });

  // SP-B4 facit inte symmetriskt under en mittaxel som inte vikts
  for (const ax of [{ typ: 'v', k: 2 }, { typ: 'h', k: 2 }, { typ: 'd', k: 0 }, { typ: 'a', k: 4 }]) {
    if (q.vikningar.some((v) => v.typ === ax.typ && v.k === ax.k)) continue;
    const sp = (rutor) => rutor.map((p) => spegelRuta(ax, p));
    if (nyck(sp(facit.hal)) === nyck(facit.hal) && nyck(sp(facit.klipp)) === nyck(facit.klipp)) fel.push(`${id}: SP-B4 facit är symmetriskt kring en axel som inte vikts (${ax.typ} ${ax.k})`);
  }

  // SP-B5 pilen från delen som viks mot delen som ligger kvar, viklinjen från kant till kant
  q.sekvens.slice(0, -1).forEach((f, j) => {
    const v = q.vikningar[j];
    if (!v || f.kind !== 'ark-vik') return;
    if (Math.sign(sida(v, f.pil[0])) !== v.flytt || Math.sign(sida(v, f.pil[1])) !== -v.flytt) fel.push(`${id}: SP-B5 pilen i ruta ${j + 1} pekar fel`);
    const rand = (p) => f.poly.some((a, i) => {
      const b = f.poly[(i + 1) % f.poly.length];
      const k = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
      return Math.abs(k) < 1e-6 && p[0] >= Math.min(a[0], b[0]) - 1e-6 && p[0] <= Math.max(a[0], b[0]) + 1e-6 && p[1] >= Math.min(a[1], b[1]) - 1e-6 && p[1] <= Math.max(a[1], b[1]) + 1e-6;
    });
    if (!rand(f.linje[0]) || !rand(f.linje[1])) fel.push(`${id}: SP-B5 viklinjen i ruta ${j + 1} går inte från kant till kant`);
  });

  // SP-B6 klipp: bara på expert, högst ett, i kant eller hörn av det vikta arket
  if (L.klipp) {
    if (klippRutor.length !== 1) fel.push(`${id}: SP-B6 expert ska ha exakt ett klipp`);
    else if (!kantEllerHorn(r.slut, klippRutor[0])) fel.push(`${id}: SP-B6 klippet ligger inte i en kant eller ett hörn`);
    if (q.vikningar.some((v) => !(v.typ === 'v' || v.typ === 'h') || !Number.isInteger(v.k))) fel.push(`${id}: klipp kräver vikningar längs rutlinjer`);
  } else if (klippRutor.length) fel.push(`${id}: klipp på ${q.niva}`);

  // SP-B7 högst fyra rutor i sekvensen
  if (q.sekvens.length > 4) fel.push(`${id}: SP-B7 ${q.sekvens.length} rutor i sekvensen`);
  if (q.vikningar.length !== L.vikningar) fel.push(`${id}: ${q.vikningar.length} vikningar, nivån har ${L.vikningar}`);
  if (q.niva === 'expert' && !q.vikningar.some((v, i) => vikTyp(v, regioner[i]) !== 'halv')) fel.push(`${id}: expert saknar diagonal eller remsa`);
  // varje vikning ger fler hål eller klipp när den viks upp (annars är den bara pynt)
  if (!varjeVikningRaknas(stans.hal, klippRutor, q.vikningar, regioner)) fel.push(`${id}: en vikning ändrar inte svaret`);
  // varje ritat vikt läge med klipp hänger ihop (konturen ritas som en slinga)
  for (const f of [...q.sekvens, ...(q.uppvikning ?? [])]) {
    if (f.kind !== 'ark-stans' || !f.klipp?.length) continue;
    const k = new Set(f.klipp.map((x) => x.join(',')));
    const rutor = helaArket().filter((x) => helRuta(f.poly, x) && !k.has(x.join(',')));
    const set = new Set(rutor.map((x) => x.join(',')));
    const sedd = new Set([rutor[0]?.join(',')]);
    const ko = rutor.slice(0, 1);
    while (ko.length) {
      const [a, b] = ko.pop();
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = `${a + dr},${b + dc}`;
        if (set.has(n) && !sedd.has(n)) {
          sedd.add(n);
          ko.push([a + dr, b + dc]);
        }
      }
    }
    if (sedd.size !== rutor.length) fel.push(`${id}: ett vikt läge med klipp faller isär i två delar`);
  }
  // papperet hänger ihop i varje alternativ (ingen bit som hänger i ett hörn)
  q.options.forEach((o, i) => {
    if (!papperHel(o.klipp)) fel.push(`${id}: alternativ ${i + 1} har en bit som bara hänger i ett hörn`);
  });
  return fel;
}

export { helaArket };
