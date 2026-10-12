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

import { arBlandad, BLANDAD_META, permutationForSession, tillOriginal, tillVisat } from '@/lib/logicTestV7/blanda';
import { allaFragor, valjFragor, FRAGOR_PER_SESSION, SERIE_VERSION } from './select';
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
  const urval = valjFragor(niva, session.id);
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
