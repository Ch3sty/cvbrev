// src/lib/figurserierV1/fragor.server.ts
// =============================================================================
// Serverns enda väg från figurseriernas bank till det klienten får se, och
// rättningen (beställningen omgång 2, A2). Samma mönster som matrisernas
// src/lib/logicTestV7/fragor.server.ts, men egna pooler: figurserier och
// matriser blandas aldrig.
//
// - Urvalet: 15 ur nivåns pool, seedat på sessionId (select.ts).
// - Alternativens ordning: blanda.ts, seedat på sessionId + frågans id, för
//   sessioner med meta.alternativ_blandade (alla figurseriesessioner).
// - Klienten får aldrig facit, regel eller misstag under testet. Genomgången
//   efter avslutat test får rätt svar och misstagen i visad ordning.
// =============================================================================

import { alternativSeed, arBlandad, BLANDAD_META, blandadPermutation, permutationForSession, tillOriginal, tillVisat } from '@/lib/logicTestV7/blanda';
import { allaFigurFragor, allaFragor, serieVersion, valjFragor, FRAGOR_PER_SESSION, SERIE_VERSION } from './select';
import type { GenomgangSerie, SerieFraga, SerieNiva, VisadSerie } from './types';

export const SERIE_TEST_TYPER = ['figurserier-grund', 'figurserier-avancerad', 'figurserier-expert'] as const;
export type SerieTestTyp = (typeof SERIE_TEST_TYPER)[number];

export function arSerieTestTyp(t: unknown): t is SerieTestTyp {
  return typeof t === 'string' && (SERIE_TEST_TYPER as readonly string[]).includes(t);
}

export function nivaForTestTyp(t: SerieTestTyp): SerieNiva {
  return t.slice('figurserier-'.length) as SerieNiva;
}

/** Meta på varje ny figurseriesession. */
export const SERIE_META = { ...BLANDAD_META, serie_version: SERIE_VERSION, antal: FRAGOR_PER_SESSION } as const;

export function visaSerie(q: SerieFraga, sessionId: string, blandade: boolean): VisadSerie {
  const perm = permutationForSession(sessionId, q, blandade);
  return { id: q.id, difficulty: q.difficulty, rad: q.rad, options: perm.map((o) => q.options[o]) };
}

export function genomgaSerie(q: SerieFraga, sessionId: string, blandade: boolean): GenomgangSerie {
  const perm = permutationForSession(sessionId, q, blandade);
  return {
    ...visaSerie(q, sessionId, blandade),
    title: q.title,
    rule: q.rule,
    family: q.family,
    rattVisat: tillVisat(perm, q.correctAnswer),
    misstag: perm.map((o) => q.misstag[o] ?? ''),
  };
}

/** Allt klienten behöver om en sessionsrad: frågorna, och genomgången när testet är avslutat. */
export function serieInnehall(session: {
  id: string;
  test_type?: string | null;
  meta?: unknown;
  completed_at?: string | null;
}): { fragor: VisadSerie[]; genomgang: GenomgangSerie[] | null } {
  if (!arSerieTestTyp(session.test_type)) return { fragor: [], genomgang: null };
  const niva = nivaForTestTyp(session.test_type);
  const blandade = arBlandad(session.meta);
  const urval = valjFragor(niva, session.id, FRAGOR_PER_SESSION, serieVersion(session.meta));
  return {
    fragor: urval.map((q) => visaSerie(q, session.id, blandade)),
    genomgang: session.completed_at ? urval.map((q) => genomgaSerie(q, session.id, blandade)) : null,
  };
}

export function hittaSerieFraga(id: string): SerieFraga | undefined {
  return allaFragor().find((q) => q.id === id);
}

/** Dömer ett svar: visat index in, originalindex lagras och rättas. Null när indexet inte finns. */
export function bedomSerieSvar(q: SerieFraga, sessionId: string, blandade: boolean, visat: unknown) {
  if (typeof visat !== 'number' || !Number.isInteger(visat)) return null;
  const selected = tillOriginal(permutationForSession(sessionId, q, blandade), visat);
  if (selected < 0) return null;
  return { selected, visat, correct: selected === q.correctAnswer };
}

/** Poängen: svar vars originalindex är frågans facit, räknat om mot banken. */
export function rattaSerieSvar(answers: readonly unknown[]): number {
  const facit = new Map(allaFragor().map((q) => [q.id, q.correctAnswer]));
  let ratt = 0;
  for (const rad of answers) {
    const a = (rad ?? {}) as { q_id?: unknown; selected?: unknown };
    if (typeof a.q_id === 'string' && typeof a.selected === 'number' && facit.get(a.q_id) === a.selected) ratt++;
  }
  return ratt;
}

/** Frågestatistiken (kontrakt-kalibrering): en rad per besvarad fråga, test_kind figurserie. */
export function serieStatistik(answers: readonly { q_id: string; correct: boolean; time_spent?: number; selected: number }[]) {
  return answers.map((a) => ({ fraga_id: a.q_id, test_kind: 'figurserie', correct: a.correct, tid_s: a.time_spent ?? 0, selected: a.selected, typ: 'klassisk' }));
}

/* -------------------- Figurpasset och övningsprovet (omgång 3) -------------------- */

const FIGUR_PER_ID = new Map(allaFigurFragor().map((q) => [q.id, q]));

export function hittaFigurFraga(id: string): SerieFraga | undefined {
  return FIGUR_PER_ID.get(id);
}

/**
 * Permutationen för en fråga i pass och prov, alltid blandad: härnäst blandar
 * alternativen, bryter mönstret blandar de sex figurerna (A1, "de sex blandas
 * seedat på sessionId"). permutation[visat] = original.
 */
export function figurPermutation(q: SerieFraga, sessionId: string): number[] {
  return blandadPermutation(alternativSeed(sessionId, q.id), q.form === 'bryter' ? q.rad.length : q.options.length);
}

/** Uppgiften som klienten ser: utan facit, regel och misstag. */
export function visaFigur(q: SerieFraga, sessionId: string): VisadSerie {
  const perm = figurPermutation(q, sessionId);
  if (q.form === 'bryter') return { id: q.id, form: 'bryter', difficulty: q.difficulty, rad: perm.map((o) => q.rad[o]), options: [] };
  return { id: q.id, form: 'harnast', difficulty: q.difficulty, rad: q.rad, options: perm.map((o) => q.options[o]) };
}

/** Genomgången: facit, regeln och misstagen i visad ordning. */
export function genomgaFigur(q: SerieFraga, sessionId: string): GenomgangSerie {
  const perm = figurPermutation(q, sessionId);
  return {
    ...visaFigur(q, sessionId),
    title: q.title,
    rule: q.rule,
    family: q.family,
    rattVisat: tillVisat(perm, q.correctAnswer),
    misstag: perm.map((o) => q.misstag[o] ?? ''),
  };
}

/** Dömer ett svar i pass och prov. Visat index in; null för "Vet inte" ger selected -1. */
export function bedomFigur(q: SerieFraga, sessionId: string, visat: unknown): { selected: number; visat: number | null; correct: boolean } | null {
  if (visat === null) return { selected: -1, visat: null, correct: false };
  if (typeof visat !== 'number' || !Number.isInteger(visat)) return null;
  const selected = tillOriginal(figurPermutation(q, sessionId), visat);
  if (selected < 0) return null;
  return { selected, visat, correct: selected === q.correctAnswer };
}
