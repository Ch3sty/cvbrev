// scripts/lib/deduktiv/forklaring.mjs
// =============================================================================
// DD5: förklaringen är lösarens gång. Lösaren håller en mängd möjliga platser
// per element och låser platser steg för steg, med villkorens nummer i
// märket och "Det låser ..." som följd (deduktiv-spec.md 2.1). Kräver ett
// steg fler än tre villkor, eller går det inte att pröva sig fram med ett
// element som har två möjliga platser, går uppgiften inte att förklara på en
// rad per steg och generatorn slänger den. Prövningens formulering är vår
// egen och står i ATT-GRANSKA.
// =============================================================================

import { elementI, uppfyllt } from './losare.mjs';
import { TEMAN, elementForm, villkorText } from './tema.mjs';

const tom = (D) => D.some((s) => s.size === 0);

/** Snävar in domänerna med ett villkor. Returnerar true om något ändrades. */
function snavaVillkor(D, c, grupper) {
  const E = elementI(c);
  let andrat = false;
  for (const e of E) {
    for (const v of [...D[e]]) {
      let stod = false;
      if (E.length === 1) {
        const pos = [];
        pos[e] = v;
        stod = uppfyllt(c, pos, grupper);
      } else {
        const o = E[0] === e ? E[1] : E[0];
        for (const w of D[o]) {
          if (w === v) continue;
          const pos = [];
          pos[e] = v;
          pos[o] = w;
          if (uppfyllt(c, pos, grupper)) {
            stod = true;
            break;
          }
        }
      }
      if (!stod) {
        D[e].delete(v);
        andrat = true;
      }
    }
  }
  return andrat;
}

/** Låsta platser tas bort hos de andra, och en plats bara ett element kan ta låses. */
function allaOlika(D, n) {
  let andrat = false;
  for (let i = 0; i < D.length; i++) {
    if (D[i].size !== 1) continue;
    const [p] = D[i];
    for (let j = 0; j < D.length; j++) {
      if (j !== i && D[j].has(p)) {
        D[j].delete(p);
        andrat = true;
      }
    }
  }
  for (let p = 1; p <= n; p++) {
    const kan = [];
    D.forEach((s, i) => s.has(p) && kan.push(i));
    if (kan.length === 1 && D[kan[0]].size > 1) {
      D[kan[0]] = new Set([p]);
      andrat = true;
    }
  }
  return andrat;
}

/** Domänerna ur fakta (låsta platser) och en mängd villkor. Null vid motsägelse. */
export function snava(n, fakta, villkor, grupper) {
  const D = Array.from({ length: n }, () => new Set(Array.from({ length: n }, (_, k) => k + 1)));
  for (const [i, p] of fakta) D[i] = new Set([p]);
  for (let varv = 0; varv < 100; varv++) {
    let andrat = false;
    for (const c of villkor) andrat = snavaVillkor(D, c, grupper) || andrat;
    andrat = allaOlika(D, n) || andrat;
    if (tom(D)) return null;
    if (!andrat) return D;
  }
  return tom(D) ? null : D;
}

/** Delmängder av 0..m-1 med storlek s, i lexikografisk ordning. */
function* delmangder(m, s, start = 0, valda = []) {
  if (valda.length === s) {
    yield valda;
    return;
  }
  for (let k = start; k < m; k++) yield* delmangder(m, s, k + 1, [...valda, k]);
}

/** Minsta mängd villkor (högst `tak`) som ihop med fakta uppfyller testet. */
function minstaSkal(m, tak, test) {
  for (let s = 0; s <= tak; s++) for (const u of delmangder(m, s)) if (test(u)) return u;
  return null;
}

const lista = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} och ${xs[xs.length - 1]}`);

export const MAX_VILLKOR_PER_STEG = 3;
/** Kvar-steget före en prövning får citera fler: det samlar det som snävat in elementet. */
export const MAX_VILLKOR_KVAR = 6;

/**
 * Lösningen till ett pussel (deduktiv-spec.md 2.1, DV1, DV3; granskning 01 V1):
 *   { steg: [{ markor, villkor, foljd }], formella, villkorPerSteg, pos }
 * markor: villkorens nummer (1-indexerade, som i kortet), ['Om'] för
 * antagandet. villkor: villkorens text ordagrant. foljd: "Det låser Bo på
 * plats 3." formella: samma steg i lösarens form, som validatorn räknar om:
 *   { typ: 'antagande', las: [[i, p]] }
 *   { typ: 'las', villkor: [k], las: [[i, p], ...] }
 *   { typ: 'kvar', villkor: [k], element: i, platser: [a, b] }
 *   { typ: 'prova', villkor: [k], element: i, fel, ratt, las: [[i, ratt]] }
 * Null när uppgiften inte går att förklara med högst tre villkor per steg.
 *
 * Ett steg tar först ett ensamt villkor som, med de platser som redan är
 * låsta, låser minst en plats till; platser som då bara kan gå till ett
 * element låses i samma steg. Finns inget sådant villkor tar steget minsta
 * paret eller trion. Fastnar lösaren prövas ett element med två möjliga
 * platser, i två steg: först de villkor som lämnar två platser ("Kvar för
 * Lisa: plats 3 eller 5."), sedan de villkor som inte går ihop med den ena
 * ("Med Lisa på plats 3 går villkor 1, 2 och 4 inte ihop. Alltså står Lisa
 * på plats 5."). Därefter fortsätter den vanliga gången, så att varje lås
 * pekar på de villkor som ger det.
 */
export function forklara({ tema, namn, villkor, antagande = null }) {
  const n = namn.length;
  const T = TEMAN[tema];
  const grupper = T.grupper ?? null;
  const F = elementForm(tema, namn);
  const txt = villkor.map((c) => villkorText(tema, namn, c));
  const steg = [];
  const formella = [];
  const villkorPerSteg = [];
  const fakta = new Map();
  const lasning = (nya) => lista(nya.map(([i, p]) => `${F[i].mitt} på plats ${p}`));
  const nummer = (u) => lista(u.map((k) => String(k + 1)));

  if (antagande) {
    fakta.set(antagande.a, antagande.k);
    steg.push({ markor: ['Om'], villkor: [`Om ${F[antagande.a].mitt} ${T.verb} på plats ${antagande.k}.`], foljd: 'Antagandet i frågan.' });
    formella.push({ typ: 'antagande', las: [[antagande.a, antagande.k]] });
    villkorPerSteg.push([-1]);
  }

  /** Nya låsta platser ur fakta och villkoren u, i platsordning. Null vid motsägelse. */
  const nyaLas = (u) => {
    const D = snava(n, fakta, u.map((k) => villkor[k]), grupper);
    if (!D) return null;
    const ut = [];
    D.forEach((s, i) => {
      if (!fakta.has(i) && s.size === 1) ut.push([i, [...s][0]]);
    });
    return ut.sort((a, b) => a[1] - b[1]);
  };

  for (let varv = 0; varv < 3 * n && fakta.size < n; varv++) {
    if (!snava(n, fakta, villkor, grupper)) return null;
    let valt = null;
    for (let s = 1; s <= MAX_VILLKOR_PER_STEG && !valt; s++) {
      for (const u of delmangder(villkor.length, s)) {
        const nya = nyaLas(u);
        if (nya && nya.length) {
          valt = { u, nya };
          break;
        }
      }
    }
    if (valt) {
      const { u, nya } = valt;
      steg.push({
        markor: u.map((k) => k + 1),
        villkor: u.map((k) => txt[k]),
        foljd: `${u.length === 1 ? 'Det låser' : 'Tillsammans låser de'} ${lasning(nya)}.`,
      });
      formella.push({ typ: 'las', villkor: u, las: nya });
      villkorPerSteg.push(u);
      for (const [i, p] of nya) fakta.set(i, p);
      continue;
    }
    // Fastnat: pröva ett element med två möjliga platser. Av alla sådana
    // prövningar tas den som citerar minst villkor sammanlagt (lika: lägst
    // element, lägsta plats först).
    const D = snava(n, fakta, villkor, grupper);
    let bastProv = null;
    for (let i = 0; i < n; i++) {
      if (fakta.has(i) || D[i].size !== 2) continue;
      const [v1, v2] = [...D[i]].sort((a, b) => a - b);
      // (a) De villkor som lämnar just de två platserna åt elementet.
      const kvar = minstaSkal(villkor.length, MAX_VILLKOR_KVAR, (u) => {
        const X = snava(n, fakta, u.map((k) => villkor[k]), grupper);
        return X != null && X[i].size === 2 && X[i].has(v1) && X[i].has(v2);
      });
      if (!kvar) continue;
      for (const [fel, ratt] of [
        [v1, v2],
        [v2, v1],
      ]) {
        // (b) De villkor som inte går ihop med den ena platsen.
        fakta.set(i, fel);
        const orsak = minstaSkal(villkor.length, MAX_VILLKOR_PER_STEG, (u) => u.length > 0 && snava(n, fakta, u.map((k) => villkor[k]), grupper) == null);
        fakta.delete(i);
        if (!orsak) continue;
        const kostnad = kvar.length + orsak.length;
        if (!bastProv || kostnad < bastProv.kostnad) bastProv = { i, v1, v2, fel, ratt, kvar, orsak, kostnad };
      }
    }
    let provat = false;
    if (bastProv) {
      const { i, v1, v2, fel, ratt, kvar, orsak } = bastProv;
      {
        steg.push({
          markor: kvar.length ? kvar.map((k) => k + 1) : ['Kvar'],
          villkor: kvar.map((k) => txt[k]),
          foljd: `Kvar för ${F[i].mitt}: plats ${v1} eller ${v2}.`,
        });
        formella.push({ typ: 'kvar', villkor: kvar, element: i, platser: [v1, v2] });
        villkorPerSteg.push(kvar);
        steg.push({
          markor: orsak.map((k) => k + 1),
          villkor: orsak.map((k) => txt[k]),
          foljd: `Med ${F[i].mitt} på plats ${fel} går villkor ${nummer(orsak)} inte ihop. Alltså ${T.verb} ${F[i].mitt} på plats ${ratt}.`,
        });
        formella.push({ typ: 'prova', villkor: orsak, element: i, fel, ratt, las: [[i, ratt]] });
        villkorPerSteg.push(orsak);
        fakta.set(i, ratt);
        provat = true;
      }
    }
    if (!provat) return null;
  }
  if (fakta.size < n) return null;
  const pos = Array.from({ length: n }, (_, i) => fakta.get(i));
  if (!villkor.every((c) => uppfyllt(c, pos, grupper))) return null;
  return { steg, formella, villkorPerSteg, pos };
}

/**
 * Granskning 01 V1, spärren: varje lås i ett steg följer ur stegets villkor
 * plus de platser som redan är låsta. Räknas om med lösarens snävning;
 * kvar-steget ska lämna exakt två platser, prövningen ska ge motsägelse på
 * den ena och vila på kvar-steget för samma element. Fel som text.
 */
export function stegFel({ tema, namn, villkor, antagande = null }, formella) {
  const n = namn.length;
  const grupper = TEMAN[tema].grupper ?? null;
  const fakta = new Map();
  const fel = [];
  let kvarFor = null;
  formella.forEach((st, nr) => {
    const u = (st.villkor ?? []).map((k) => villkor[k]);
    if (st.typ === 'antagande') {
      if (!antagande || st.las[0][0] !== antagande.a || st.las[0][1] !== antagande.k) fel.push(`V1: steg ${nr + 1} är inte antagandet`);
      else fakta.set(antagande.a, antagande.k);
      return;
    }
    if (st.typ === 'las') {
      const D = snava(n, fakta, u, grupper);
      for (const [i, p] of st.las) {
        if (!D || D[i].size !== 1 || !D[i].has(p)) fel.push(`V1: steg ${nr + 1} låser plats ${p} utan stöd i sina villkor`);
      }
      for (const [i, p] of st.las) fakta.set(i, p);
      return;
    }
    if (st.typ === 'kvar') {
      const D = snava(n, fakta, u, grupper);
      const [a, b] = st.platser;
      if (!D || D[st.element].size !== 2 || !D[st.element].has(a) || !D[st.element].has(b)) fel.push(`V1: steg ${nr + 1} lämnar inte två platser`);
      kvarFor = st;
      return;
    }
    if (st.typ === 'prova') {
      if (!kvarFor || kvarFor.element !== st.element || !kvarFor.platser.includes(st.fel) || !kvarFor.platser.includes(st.ratt))
        fel.push(`V1: steg ${nr + 1} prövar utan ett kvar-steg före`);
      const X = new Map(fakta);
      X.set(st.element, st.fel);
      if (snava(n, X, u, grupper) != null) fel.push(`V1: steg ${nr + 1} ger ingen motsägelse`);
      fakta.set(st.element, st.ratt);
      kvarFor = null;
      return;
    }
    fel.push(`V1: steg ${nr + 1} har okänd typ`);
  });
  if (fakta.size !== n) fel.push('V1: stegen låser inte alla platser');
  return fel;
}
