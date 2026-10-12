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
function snava(n, fakta, villkor, grupper) {
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

/**
 * Lösningen till ett pussel (deduktiv-spec.md 2.1, DV1, DV3):
 *   { steg: [{ markor, villkor, foljd }], villkorPerSteg, pos }
 * markor: villkorens nummer (1-indexerade, som i kortet), eller ['Om'] för
 * antagandet. villkor: villkorens text ordagrant. foljd: "Det låser Bo på
 * plats 3." Null när uppgiften inte går att förklara med högst tre villkor
 * per steg.
 *
 * Ett steg tar först ett ensamt villkor som, med de platser som redan är
 * låsta, låser minst en plats till; platser som då bara kan gå till ett
 * element låses i samma steg. Finns inget sådant villkor tar steget minsta
 * paret eller trion. Fastnar det ändå prövas ett element med två möjliga
 * platser.
 */
export function forklara({ tema, namn, villkor, antagande = null }) {
  const n = namn.length;
  const T = TEMAN[tema];
  const grupper = T.grupper ?? null;
  const F = elementForm(tema, namn);
  const txt = villkor.map((c) => villkorText(tema, namn, c));
  const steg = [];
  const villkorPerSteg = [];
  const fakta = new Map();
  const lasning = (nya) => lista(nya.map(([i, p]) => `${F[i].mitt} på plats ${p}`));

  if (antagande) {
    fakta.set(antagande.a, antagande.k);
    steg.push({ markor: ['Om'], villkor: [`Om ${F[antagande.a].mitt} ${T.verb} på plats ${antagande.k}.`], foljd: 'Antagandet i frågan.' });
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

  for (let varv = 0; varv < n + 2 && fakta.size < n; varv++) {
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
      villkorPerSteg.push(u);
      for (const [i, p] of nya) fakta.set(i, p);
      continue;
    }
    // Fastnat: pröva ett element med två möjliga platser.
    const D = snava(n, fakta, villkor, grupper);
    let provat = false;
    for (let i = 0; i < n && !provat; i++) {
      if (fakta.has(i) || D[i].size !== 2) continue;
      const [v1, v2] = [...D[i]];
      for (const [fel, ratt] of [
        [v1, v2],
        [v2, v1],
      ]) {
        fakta.set(i, fel);
        const orsak = minstaSkal(villkor.length, MAX_VILLKOR_PER_STEG, (u) => u.length > 0 && snava(n, fakta, u.map((k) => villkor[k]), grupper) == null);
        fakta.delete(i);
        if (!orsak) continue;
        fakta.set(i, ratt);
        const nya = [[i, ratt], ...(nyaLas(villkor.map((_, k) => k)) ?? [])].sort((a, b) => a[1] - b[1]);
        steg.push({
          markor: orsak.map((k) => k + 1),
          villkor: orsak.map((k) => txt[k]),
          foljd: `Med ${F[i].mitt} på plats ${fel} går ${orsak.length === 1 ? 'villkoret' : 'de'} inte ihop. Det låser ${lasning(nya)}.`,
        });
        villkorPerSteg.push(orsak);
        for (const [j, p] of nya) fakta.set(j, p);
        provat = true;
        break;
      }
    }
    if (!provat) return null;
  }
  if (fakta.size < n) return null;
  const pos = Array.from({ length: n }, (_, i) => fakta.get(i));
  if (!villkor.every((c) => uppfyllt(c, pos, grupper))) return null;
  return { steg, villkorPerSteg, pos };
}
