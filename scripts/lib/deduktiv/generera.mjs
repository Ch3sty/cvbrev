// scripts/lib/deduktiv/generera.mjs
// =============================================================================
// Bygger uppgifterna: D1 ur de handskrivna (d1.mjs), D2 och D3 ur generatorn.
// Generatorn drar en dold lösning, lägger till sanna villkor tills lösningen
// är ensam, stryker överflödiga (DD2), väljer fråga och alternativ och kör
// spärrarna. En kandidat som fälls slängs. Allt seedat: samma seed ger samma
// uppgifter.
// =============================================================================

import { allaTilldelningar, losningar, uppfyllt, brutna, schemaRad, villkorNyckel } from './losare.mjs';
import { forklara } from './forklaring.mjs';
import { TEMAN, villkorText, valjNamn, valjFarger, elementForm, etikett } from './tema.mjs';
import { sparrFel, naraMissar, NAMN_MAX_LANGD } from './sparrar.mjs';

export const P_PRIOR = { D1: 0.75, D2: 0.55, D3: 0.4 };


export const DIFFICULTY = { D1: 1, D2: 2, D3: 3 };
export const NIVA_KOD = { grund: 'g', avancerad: 'a', expert: 'e' };

/** Etiketterna i genomgången (copy-omgang3.md 4.3). */
export const ETIKETT = {
  maste: 'Måste gälla.',
  kanStamma: 'Kan stämma, men villkoren kräver det inte.',
  strider: 'Strider mot villkoren.',
  endaPlatsen: 'Enda platsen som går.',
  bryter: (v) => `Bryter mot ett villkor: ${v}`,
  gaarIhop: 'Går ihop med villkoren.',
  omojlig: (fras) => `Går inte ihop med villkoren när ${fras}.`,
};

export const FRAGA_MASTE = 'Vad måste gälla?';
export const FRAGA_MASTE_SANT = 'Vilket måste vara sant?';

const blanda = (r, a) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};
const valj = (r, a) => a[Math.floor(r() * a.length)];

/** Ordnar alternativen så att facit hamnar på `facitPlats`; resten i blandad ordning. */
function ordna(r, facit, ovriga, facitPlats) {
  const rest = blanda(r, ovriga);
  rest.splice(facitPlats, 0, facit);
  return { lista: rest, correctAnswer: facitPlats };
}

/* ---------------------------------- D1 ----------------------------------- */

export function byggD1(u, id, facitPlats, r) {
  const roller = { nodvandig: ETIKETT.maste, obestamd: ETIKETT.kanStamma, omojlig: ETIKETT.strider };
  const facit = u.alternativ.find((a) => a.roll === 'nodvandig');
  const { lista, correctAnswer } = ordna(r, facit, u.alternativ.filter((a) => a !== facit), facitPlats);
  return {
    id,
    niva: 'grund',
    typ: 'D1',
    family: 'premiss',
    difficulty: DIFFICULTY.D1,
    p_prior: P_PRIOR.D1,
    intro: null,
    villkor: u.premisser.map((p) => p.text),
    fraga: FRAGA_MASTE,
    options: lista.map((a) => a.text),
    correctAnswer,
    etiketter: lista.map((a) => roller[a.roll]),
    misstag: lista.map((a) => (a.roll === 'nodvandig' ? '' : a.misstag)),
    losning: { steg: u.steg.map((x) => ({ markor: x.premisser, villkor: [], foljd: x.text })), schema: null },
    formell: {
      termer: u.termer,
      individer: u.individer,
      premisser: u.premisser.map((p) => p.formell),
      alternativ: lista.map((a) => a.formell),
      roller: lista.map((a) => a.roll),
    },
    fran_version: 1,
  };
}

/* ------------------------------- D2 och D3 -------------------------------- */

const VIKT = { plats: 1, inte_plats: 2, granne: 4, inte_granne: 3, vanster_om: 4, direkt_vanster_om: 4, ordning: 5, samma_grupp: 5 };
const PASTAENDE_TYPER = ['plats', 'granne', 'inte_granne', 'vanster_om', 'direkt_vanster_om', 'ordning', 'samma_grupp'];

/** Högst så många element i en kedja av före-villkor; längre kedjor ger ordningen gratis. */
export const KEDJA_TAK = 4;
const FORE = new Set(['vanster_om', 'direkt_vanster_om', 'ordning']);
export function langstaKedja(n, villkor) {
  const ut = Array.from({ length: n }, () => []);
  for (const c of villkor) if (FORE.has(c.typ)) ut[c.a].push(c.b);
  const minne = new Map();
  const djup = (i) => {
    if (minne.has(i)) return minne.get(i);
    const d = 1 + Math.max(0, ...ut[i].map(djup));
    minne.set(i, d);
    return d;
  };
  return Math.max(...Array.from({ length: n }, (_, i) => djup(i)));
}

/** Alla villkor av temats typer över n element. */
function allaVillkor(tema, n, typer) {
  const ut = [];
  for (const typ of typer) {
    for (let a = 0; a < n; a++) {
      if (typ === 'plats' || typ === 'inte_plats') {
        for (let k = 1; k <= n; k++) ut.push({ typ, a, k });
        continue;
      }
      for (let b = 0; b < n; b++) {
        if (a === b) continue;
        const sym = typ === 'granne' || typ === 'inte_granne' || typ === 'samma_grupp';
        if (sym && b < a) continue;
        ut.push({ typ, a, b });
      }
    }
  }
  return ut;
}

const viktatVal = (r, lista) => {
  const sum = lista.reduce((s, c) => s + VIKT[c.typ], 0);
  let x = r() * sum;
  for (const c of lista) {
    x -= VIKT[c.typ];
    if (x <= 0) return c;
  }
  return lista[lista.length - 1];
};

function foljerAv(n, c, s, g) {
  return allaTilldelningar(n)
    .filter((p) => uppfyllt(c, p, g))
    .every((p) => uppfyllt(s, p, g));
}
function motsagsAv(n, c, s, g) {
  return allaTilldelningar(n)
    .filter((p) => uppfyllt(c, p, g))
    .every((p) => !uppfyllt(s, p, g));
}

/**
 * Försöker bygga en uppgift. spec: { typ: 'D2'|'D3', niva, tema, n, vmin, vmax,
 * form: 'vem'|'maste'|'omojlig', platsTak }. Returnerar uppgiften eller null.
 */
export function forsokSchema(r, spec, id, facitPlats) {
  const T = TEMAN[spec.tema];
  const n = spec.n;
  const g = T.grupper ?? null;
  const namn = T.element === 'farger' ? valjFarger(r, n) : valjNamn(r, n, NAMN_MAX_LANGD[n]);
  const losning = valj(r, allaTilldelningar(n));
  const sannaAlla = allaVillkor(spec.tema, n, T.tillatna).filter((c) => uppfyllt(c, losning, g));

  let antagande = null;
  if (spec.typ === 'D3') {
    const a = Math.floor(r() * n);
    antagande = { typ: 'plats', a, k: losning[a] };
  }
  const sanna = sannaAlla.filter((c) => !(antagande && c.typ === 'plats' && c.a === antagande.a));

  // Lägg till sanna villkor tills lösningen är ensam.
  let villkor = [];
  const med = () => (antagande ? [...villkor, antagande] : villkor);
  for (let i = 0; i < 14; i++) {
    const kandidater = sanna.filter((c) => !villkor.some((v) => villkorNyckel(v) === villkorNyckel(c)));
    villkor.push(viktatVal(r, kandidater));
    if (losningar(n, med(), g).length === 1) break;
  }
  if (losningar(n, med(), g).length !== 1) return null;
  // Stryk överflödiga, i blandad ordning (DD2).
  for (const c of blanda(r, villkor)) {
    const utan = villkor.filter((v) => v !== c);
    if (losningar(n, antagande ? [...utan, antagande] : utan, g).length === 1) villkor = utan;
  }
  if (villkor.length < spec.vmin || villkor.length > spec.vmax) return null;
  if (villkor.filter((c) => c.typ === 'plats').length > spec.platsTak) return null;
  if (antagande && losningar(n, villkor, g).length < 2) return null;
  if (langstaKedja(n, villkor) > KEDJA_TAK) return null;
  villkor = blanda(r, villkor);

  // Frågan och alternativen.
  const F = elementForm(spec.tema, namn);
  const kandidatQ = (alternativ, correctAnswer, fraga) => ({
    typ: spec.typ,
    formell: { tema: spec.tema, namn, villkor, ...(antagande ? { antagande } : {}), fraga, alternativ },
    correctAnswer,
  });
  let fraga;
  let facit;
  let distraktorer;
  if (spec.form === 'vem') {
    const fria = [];
    for (let k = 1; k <= n; k++) if (!villkor.some((c) => c.typ === 'plats' && c.k === k) && !(antagande && antagande.k === k)) fria.push(k);
    if (!fria.length) return null;
    const k = valj(r, fria);
    fraga = { form: 'vem', k };
    facit = schemaRad(losning)[k - 1];
    distraktorer = namn.map((_, i) => i).filter((i) => i !== facit);
  } else if (spec.form === 'maste') {
    fraga = { form: 'maste' };
    const pastaenden = allaVillkor(spec.tema, n, PASTAENDE_TYPER.filter((t) => T.tillatna.includes(t)));
    const sant = pastaenden.filter(
      (s) =>
        uppfyllt(s, losning, g) &&
        !villkor.some((c) => villkorNyckel(c) === villkorNyckel(s) || foljerAv(n, c, s, g)),
    );
    if (!sant.length) return null;
    facit = valj(r, sant);
    distraktorer = pastaenden.filter((s) => !uppfyllt(s, losning, g) && !villkor.some((c) => motsagsAv(n, c, s, g)));
  } else {
    fraga = { form: 'omojlig' };
    const pastaenden = allaVillkor(spec.tema, n, PASTAENDE_TYPER.filter((t) => T.tillatna.includes(t))).filter(
      (s) => !(s.typ === 'plats' && s.a === antagande.a) && !villkor.some((c) => villkorNyckel(c) === villkorNyckel(s)),
    );
    const bas = losningar(n, villkor, g);
    const omojliga = pastaenden.filter(
      (s) =>
        !uppfyllt(s, losning, g) &&
        bas.some((p) => uppfyllt(s, p, g)) &&
        !villkor.some((c) => motsagsAv(n, c, s, g)) &&
        !motsagsAv(n, antagande, s, g),
    );
    if (!omojliga.length) return null;
    facit = valj(r, omojliga);
    distraktorer = pastaenden.filter((s) => uppfyllt(s, losning, g) && !villkor.some((c) => foljerAv(n, c, s, g)) && !foljerAv(n, antagande, s, g));
  }
  if (distraktorer.length < 4) return null;

  // Välj fyra distraktorer: nära missar som tillsammans täcker alla villkor (DD3).
  const nm = naraMissar(kandidatQ([facit, ...distraktorer], 0, fraga));
  const kand = blanda(
    r,
    distraktorer.map((d, i) => ({ d, missar: nm[i + 1] })),
  ).filter((x) => x.missar.length > 0);
  const valda = [];
  const tackta = new Set();
  while (valda.length < 4 && kand.length) {
    kand.sort((x, y) => y.missar.filter((m) => !tackta.has(m)).length - x.missar.filter((m) => !tackta.has(m)).length);
    const x = kand.shift();
    valda.push(x);
    x.missar.forEach((m) => tackta.add(m));
  }
  if (valda.length < 4) return null;
  const { lista, correctAnswer } = ordna(r, facit, valda.map((x) => x.d), facitPlats);
  const q0 = kandidatQ(lista, correctAnswer, fraga);

  const txt = (c) => villkorText(spec.tema, namn, c);
  const antagandeFras = antagande ? `${F[antagande.a].mitt} ${T.verb} på plats ${antagande.k}` : null;
  const fragaText =
    fraga.form === 'vem' ? T.vem(fraga.k) : fraga.form === 'maste' ? FRAGA_MASTE_SANT : `Om ${antagandeFras}, vilket är då omöjligt?`;
  const nmLista = naraMissar(q0);
  const etiketter = lista.map((x, i) => {
    if (i === correctAnswer) {
      if (fraga.form === 'vem') return ETIKETT.endaPlatsen;
      if (fraga.form === 'maste') return ETIKETT.maste;
      return ETIKETT.omojlig(antagandeFras);
    }
    if (fraga.form === 'vem') return nmLista[i].length ? ETIKETT.bryter(txt(villkor[nmLista[i][0]])) : ETIKETT.strider;
    if (fraga.form === 'maste') return ETIKETT.strider;
    return ETIKETT.gaarIhop;
  });

  const lager = losningslager(q0.formell, spec.typ);
  if (!lager) return null;
  if (spec.minSteg && lager.losning.steg.filter((x) => !x.markor.includes('Om')).length < spec.minSteg) return null;
  if (spec.maxVillkorPerSteg && lager.losning.steg.some((x) => x.markor.length > spec.maxVillkorPerSteg)) return null;
  if (spec.platsForst && !(lager.formella[0]?.typ === 'las' && lager.formella[0].villkor.length === 1 && villkor[lager.formella[0].villkor[0]].typ === 'plats'))
    return null;

  const q = {
    id,
    niva: spec.niva,
    typ: spec.typ,
    family: lager.family,
    difficulty: DIFFICULTY[spec.typ],
    p_prior: P_PRIOR[spec.typ],
    intro: T.intro(n),
    villkor: villkor.map(txt),
    fraga: fragaText,
    options: lista.map((x) => (fraga.form === 'vem' ? F[x].fore : txt(x))),
    correctAnswer,
    etiketter,
    misstag: lager.misstag,
    losning: lager.losning,
    formell: q0.formell,
    fran_version: 1,
  };
  return sparrFel(q).length ? null : q;
}

/**
 * Lösningslagret ur pusslets formella form: lösningsgången och remsan
 * (forklaring.mjs), misstaget per alternativ och familjen. Pusslet självt
 * (villkor, fråga, alternativ, facit, etiketter) rörs inte, så lagret kan
 * byggas om på befintliga uppgifter (granskning 01 V3). Null när lösaren
 * inte kan förklara uppgiften.
 *
 * Misstagen (deduktiv-spec 2.3, granskning 01 V2):
 *   vem      "{X} står på plats m. Med {X} på plats k bryts villkor n: ..."
 *   maste    den nära miss som flyttar färst element jämfört med schemat:
 *            "I schemat stämmer det inte. För att få det sant måste minst
 *            ett villkor brytas, till exempel villkor n: ..."
 *   omojlig  "I schemat står X på plats a. Det går ihop med villkoren, så
 *            det är inte svaret."
 */
export function losningslager(formell, typ) {
  const f = formell;
  const T = TEMAN[f.tema];
  const g = T.grupper ?? null;
  const n = f.namn.length;
  const F = elementForm(f.tema, f.namn);
  const txt = (c) => villkorText(f.tema, f.namn, c);
  const alla = f.antagande ? [...f.villkor, f.antagande] : f.villkor;
  const S = losningar(n, alla, g);
  if (S.length !== 1) return null;
  const [losning] = S;
  const fk = forklara({ tema: f.tema, namn: f.namn, villkor: f.villkor, antagande: f.antagande ?? null });
  if (!fk) return null;
  const q0 = { typ, formell: f, correctAnswer: null };
  const nm = naraMissar(q0);
  const facitIdx = f.alternativ.findIndex((x) => {
    if (f.fraga.form === 'vem') return losning[x] === f.fraga.k;
    if (f.fraga.form === 'maste') return uppfyllt(x, losning, g);
    return !uppfyllt(x, losning, g);
  });

  const verb = T.verb;
  const iSchemat = (x) => (x.b != null ? [x.a, x.b] : [x.a]).map((i) => `${F[i].mitt} på plats ${losning[i]}`).join(' och ');
  /** Den nära miss (villkorets index) vars tilldelning flyttar färst element; lika: lägst villkor. */
  const narmast = (x) => {
    let bast = null;
    for (const pos of allaTilldelningar(n)) {
      const b = brutna(pos, f.villkor, g);
      if (b.length !== 1 || !uppfyllt(x, pos, g)) continue;
      const flytt = pos.filter((p, i) => p !== losning[i]).length;
      if (!bast || flytt < bast.flytt || (flytt === bast.flytt && b[0] < bast.k)) bast = { flytt, k: b[0] };
    }
    return bast?.k ?? null;
  };
  const misstag = f.alternativ.map((x, i) => {
    if (i === facitIdx) return '';
    if (f.fraga.form === 'vem') {
      const n0 = nm[i][0];
      const bas = `${F[x].fore} ${verb} på plats ${losning[x]}.`;
      return n0 != null ? `${bas} Med ${F[x].mitt} på plats ${f.fraga.k} bryts villkor ${n0 + 1}: ${txt(f.villkor[n0])}` : `${bas} Plats ${f.fraga.k} går inte.`;
    }
    if (f.fraga.form === 'maste') {
      const k = narmast(x);
      return k != null
        ? `I schemat stämmer det inte. För att få det sant måste minst ett villkor brytas, till exempel villkor ${k + 1}: ${txt(f.villkor[k])}`
        : 'Det strider mot villkoren.';
    }
    return `I schemat ${verb} ${iSchemat(x)}. Det går ihop med villkoren, så det är inte svaret.`;
  });

  // Familjen: villkorstypen som förklaringen citerar flest gånger (lika: den senast citerade).
  const antal = {};
  let senast = null;
  for (const steg of fk.villkorPerSteg)
    for (const k of steg) {
      if (k < 0) continue;
      const t = f.villkor[k].typ;
      antal[t] = (antal[t] ?? 0) + 1;
      senast = t;
    }
  const max = Math.max(0, ...Object.values(antal));
  const family = senast && antal[senast] === max ? senast : Object.keys(antal).find((t) => antal[t] === max) ?? f.villkor[0].typ;

  const facit = f.alternativ[facitIdx];
  return {
    family,
    misstag,
    formella: fk.formella,
    losning: {
      steg: fk.steg,
      schema: {
        namn: schemaRad(losning).map((i) => [etikett(f.tema, f.namn[i])]),
        koppar: f.fraga.form === 'vem' ? f.fraga.k : f.fraga.form === 'maste' && facit?.typ === 'plats' ? facit.k : null,
        antagande: f.antagande ? f.antagande.k : null,
      },
    },
  };
}

/** Strukturnyckel: samma villkorsmönster och fråga, oavsett namn. */
export function strukturNyckel(q) {
  if (q.typ === 'D1') return q.villkor.join('|');
  const f = q.formell;
  return [f.tema, f.namn.length, ...f.villkor.map(villkorNyckel).sort(), f.antagande ? villkorNyckel(f.antagande) : '', JSON.stringify(f.fraga)].join('|');
}

export { brutna };
