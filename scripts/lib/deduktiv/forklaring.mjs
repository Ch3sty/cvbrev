// scripts/lib/deduktiv/forklaring.mjs
// =============================================================================
// DD5: förklaringen är lösarens gång. Lösaren håller en mängd möjliga platser
// per element. Ett steg är en låst plats: av de element som villkoren låser
// tar den det som kräver minst villkor (givet de platser som redan är låsta),
// och skriver de villkoren i steget. Fastnar den prövar den ett element med
// två möjliga platser: går den ena inte ihop med högst tre villkor blir det
// ett steg. Kräver ett steg fler än tre villkor, eller går det inte att
// pröva sig fram på det sättet, går uppgiften inte att förklara på en rad per
// steg och generatorn slänger den.
//
// Mallarna är copywriterns (copy-omgang3.md 4.5). Prövningen är vår egen
// formulering och står i ATT-GRANSKA.
// =============================================================================

import { elementI, uppfyllt } from './losare.mjs';
import { TEMAN, elementForm, villkorText, citat } from './tema.mjs';

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
 * Förklaringen till ett pussel: { steg: string[], villkorPerSteg: number[][], pos }
 * eller null när den inte går att ge med en rad per steg.
 * `antagande` (D3) är ett plats-villkor som gäller från början.
 */
export function forklara({ tema, namn, villkor, antagande = null }) {
  const n = namn.length;
  const T = TEMAN[tema];
  const grupper = T.grupper ?? null;
  const F = elementForm(tema, namn);
  const txt = villkor.map((c) => citat(villkorText(tema, namn, c)));
  const steg = [];
  const villkorPerSteg = [];
  const fakta = new Map();

  if (antagande) {
    fakta.set(antagande.a, antagande.k);
    steg.push(`Utgå från att ${F[antagande.a].mitt} ${T.verb} på plats ${antagande.k}.`);
    villkorPerSteg.push([-1]);
  }

  const lasar = (u, i, p) => {
    const D = snava(n, fakta, u.map((k) => villkor[k]), grupper);
    return D != null && D[i].size === 1 && D[i].has(p);
  };

  for (let varv = 0; varv < n + 2 && fakta.size < n; varv++) {
    const D = snava(n, fakta, villkor, grupper);
    if (!D) return null;
    // Lås det element som kräver minst villkor.
    let bast = null;
    for (let i = 0; i < n; i++) {
      if (fakta.has(i) || D[i].size !== 1) continue;
      const [p] = D[i];
      const u = minstaSkal(villkor.length, MAX_VILLKOR_PER_STEG, (x) => lasar(x, i, p));
      if (!u) continue;
      // Lika många villkor: hellre ett element som villkoren själva nämner.
      const namnd = u.some((k) => elementI(villkor[k]).includes(i));
      if (!bast || u.length < bast.u.length || (u.length === bast.u.length && namnd && !bast.namnd)) bast = { i, p, u, namnd };
    }
    if (bast) {
      const { i, p, u } = bast;
      let rad;
      if (u.length === 0) rad = `Kvar är plats ${p}, så där ${T.verb} ${F[i].mitt}.`;
      else if (u.length === 1) {
        const c = villkor[u[0]];
        const iVillkoret = elementI(c).includes(i);
        const last = elementI(c).find((e) => e !== i && fakta.has(e));
        rad = !iVillkoret
          ? `${txt[u[0]]} går bara ihop om ${F[i].mitt} ${T.verb} på plats ${p}.`
          : last != null
            ? `När ${F[last].mitt} har plats ${fakta.get(last)} lämnar ${txt[u[0]]} bara plats ${p} åt ${F[i].mitt}.`
            : `${txt[u[0]]} ger ${F[i].mitt} plats ${p}.`;
      } else rad = `${lista(u.map((k) => txt[k]))} går bara ihop om ${F[i].mitt} ${T.verb} på plats ${p}.`;
      steg.push(rad);
      villkorPerSteg.push(u);
      fakta.set(i, p);
      continue;
    }
    // Fastnat: pröva ett element med två möjliga platser.
    let provat = false;
    for (let i = 0; i < n && !provat; i++) {
      if (fakta.has(i) || D[i].size !== 2) continue;
      const [v1, v2] = [...D[i]];
      for (const [fel, ratt] of [
        [v1, v2],
        [v2, v1],
      ]) {
        fakta.set(i, fel);
        const orsak = minstaSkal(villkor.length, 3, (u) => u.length > 0 && snava(n, fakta, u.map((k) => villkor[k]), grupper) == null);
        fakta.delete(i);
        if (!orsak) continue;
        steg.push(`Om ${F[i].mitt} ${T.verb} på plats ${fel} går ${lista(orsak.map((k) => txt[k]))} inte ihop. Alltså ${T.verb} ${F[i].mitt} på plats ${ratt}.`);
        villkorPerSteg.push(orsak);
        fakta.set(i, ratt);
        provat = true;
        break;
      }
    }
    if (!provat) return null;
  }
  if (fakta.size < n) return null;
  const pos = Array.from({ length: n }, (_, i) => fakta.get(i));
  // Kontroll: fakta måste vara en lösning.
  if (!villkor.every((c) => uppfyllt(c, pos, grupper))) return null;
  return { steg, villkorPerSteg, pos };
}
