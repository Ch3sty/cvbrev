// scripts/lib/deduktiv/tema.mjs
// =============================================================================
// Deduktiv slutledning (beställningen omgång 3, B1): namnlistor, teman och
// textmallarna per villkor. All svenska i schemapusslen (D2, D3) kommer härifrån,
// så formuleringen är densamma i varje uppgift. Mallarna är copywriterns
// (docs/design/tester-v2-2026-10-11/copy-omgang3.md 4.3 till 4.6): personer
// står, saker ligger, platserna heter plats 1 till plats n.
//
// DD4: namnen ur en fast lista med korta, vanliga svenska förnamn, aldrig samma
// begynnelsebokstav två gånger i en uppgift; saker ur neutrala listor (färger).
// =============================================================================

/** Korta, vanliga förnamn, två per begynnelsebokstav. */
export const NAMN = [
  'Anna', 'Alva', 'Bea', 'Bo', 'Carl', 'Cilla', 'Dan', 'Disa', 'Eva', 'Erik', 'Frida', 'Filip',
  'Gun', 'Gustav', 'Hanna', 'Hugo', 'Ida', 'Isak', 'Jonas', 'Jenny', 'Karin', 'Kim', 'Lisa', 'Leo',
  'Maja', 'Mats', 'Nils', 'Nora', 'Olle', 'Olga', 'Per', 'Pia', 'Rut', 'Rasmus', 'Sara', 'Sven',
  'Tove', 'Tom', 'Ulf', 'Ulla', 'Vera', 'Viktor', 'Åsa',
];

/** Färger med olika begynnelsebokstav, för pärmarna. */
export const FARGER = ['blå', 'grön', 'lila', 'röd', 'svart', 'vit'];
/** Bestämd form: "den röda pärmen". */
const BESTAMD = { blå: 'blå', grön: 'gröna', lila: 'lila', röd: 'röda', svart: 'svarta', vit: 'vita' };

const ANTAL_ORD = { 4: 'Fyra', 5: 'Fem', 6: 'Sex' };
const stor = (s) => s[0].toUpperCase() + s.slice(1);

// Personer heter sitt namn; en pärm heter "den blå pärmen", med stor bokstav först i meningen.
const personer = (namn) => ({ fore: namn, mitt: namn });
const parm = (farg) => ({ fore: `Den ${BESTAMD[farg]} pärmen`, mitt: `den ${BESTAMD[farg]} pärmen` });

/**
 * Teman. `tillatna` är villkorstyperna temat får använda, `grupper` finns bara
 * där samma_grupp är tillåtet. Textmallarna får elementen som {fore, mitt}.
 */
export const TEMAN = {
  personer: {
    element: 'namn',
    form: personer,
    verb: 'står',
    nmin: 4,
    nmax: 6,
    tillatna: ['plats', 'inte_plats', 'granne', 'inte_granne', 'vanster_om', 'direkt_vanster_om'],
    intro: (n) => `${ANTAL_ORD[n]} kollegor står i en rad på plats 1 till ${n}, räknat från vänster.`,
    vem: (k) => `Vem står på plats ${k}?`,
  },
  saker: {
    element: 'farger',
    form: parm,
    verb: 'ligger',
    nmin: 4,
    nmax: 6,
    tillatna: ['plats', 'inte_plats', 'granne', 'inte_granne', 'vanster_om', 'direkt_vanster_om'],
    intro: (n) => `${ANTAL_ORD[n]} pärmar i olika färger ligger på en hylla, på plats 1 till ${n} räknat från vänster.`,
    vem: (k) => `Vilken pärm ligger på plats ${k}?`,
  },
  turordning: {
    element: 'namn',
    form: personer,
    verb: 'står',
    nmin: 6,
    nmax: 6,
    grupper: [[1, 2, 3], [4, 5, 6]],
    tillatna: ['plats', 'inte_plats', 'ordning', 'samma_grupp'],
    intro: () =>
      'Sex kollegor håller en presentation var, i en turordning med plats 1 till 6. Plats 1 till 3 går på måndagen och plats 4 till 6 på tisdagen.',
    vem: (k) => `Vem står på plats ${k} i turordningen?`,
  },
};

/** Villkorens mallar (copy 4.4). `v` är verbet, a och b elementen som {fore, mitt}. */
const MALL = {
  plats: (v, a, _b, k) => `${a.fore} ${v} på plats ${k}.`,
  inte_plats: (v, a, _b, k) => `${a.fore} ${v} inte på plats ${k}.`,
  granne: (v, a, b) => `${a.fore} ${v} bredvid ${b.mitt}.`,
  inte_granne: (v, a, b) => `${a.fore} ${v} inte bredvid ${b.mitt}.`,
  vanster_om: (v, a, b) => `${a.fore} ${v} någonstans till vänster om ${b.mitt}.`,
  direkt_vanster_om: (v, a, b) => `${a.fore} ${v} direkt till vänster om ${b.mitt}.`,
  // "kommer före" i copyn; "går före" så att greppen på "kommer" blir tom (copy 4.4).
  ordning: (_v, a, b) => `${a.fore} går före ${b.mitt}.`,
  samma_grupp: (_v, a, b) => `${a.fore} och ${b.mitt} går samma dag.`,
};

/** Villkorstyp till familj ("Var du tappade" per villkorstyp, copy 4.6). */
export const FAMILJER = ['premiss', 'plats', 'inte_plats', 'granne', 'inte_granne', 'vanster_om', 'direkt_vanster_om', 'ordning', 'samma_grupp', 'rorelse'];

/** Namnet på remsan: personens namn, pärmens färg med stor bokstav. */
export function etikett(tema, x) {
  return TEMAN[tema].element === 'farger' ? stor(x) : x;
}

export function elementForm(tema, namn) {
  return namn.map((x) => TEMAN[tema].form(x));
}

/** Villkorets text i temat. `namn` är uppgiftens element. */
export function villkorText(tema, namn, c) {
  const T = TEMAN[tema];
  if (!T.tillatna.includes(c.typ)) throw new Error(`temat ${tema} tillåter inte ${c.typ}`);
  const f = elementForm(tema, namn);
  return MALL[c.typ](T.verb, f[c.a], c.b != null ? f[c.b] : null, c.k);
}

/** "Bea står på plats 2" utan punkt, för förklaringen. */
export function platsFras(tema, namn, i, k) {
  const T = TEMAN[tema];
  return `${elementForm(tema, namn)[i].fore} ${T.verb} på plats ${k}`;
}

/** Villkoret utan avslutande punkt, för citat i förklaringen. */
export function citat(text) {
  return `"${text.replace(/\.$/, '')}"`;
}

export { stor };

/** Väljer n namn med olika begynnelsebokstav (DD4), i bokstavsordning. */
export function valjNamn(r, n) {
  const perBokstav = new Map();
  for (const x of NAMN) {
    const b = x[0];
    if (!perBokstav.has(b)) perBokstav.set(b, []);
    perBokstav.get(b).push(x);
  }
  const bokstaver = [...perBokstav.keys()];
  for (let i = bokstaver.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [bokstaver[i], bokstaver[j]] = [bokstaver[j], bokstaver[i]];
  }
  return bokstaver
    .slice(0, n)
    .map((b) => {
      const l = perBokstav.get(b);
      return l[Math.floor(r() * l.length)];
    })
    .sort((x, y) => x.localeCompare(y, 'sv'));
}

export function valjFarger(r, n) {
  const a = [...FARGER];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n).sort((x, y) => x.localeCompare(y, 'sv'));
}

/** DD4 som kontroll: fel som text, tom lista när namnen håller. */
export function namnFel(tema, namn) {
  const fel = [];
  const lista = TEMAN[tema]?.element === 'farger' ? FARGER : NAMN;
  for (const x of namn) if (!lista.includes(x)) fel.push(`DD4: ${x} finns inte i listan`);
  const b = namn.map((x) => x[0].toLowerCase());
  if (new Set(b).size !== b.length) fel.push(`DD4: samma begynnelsebokstav två gånger (${namn.join(', ')})`);
  return fel;
}
