// src/lib/talserierV1/fragor.server.ts
// =============================================================================
// Serverns väg från talseriebanken till det klienten får se, och rättningen.
// Samma mönster som deduktivV1/fragor.server.ts, med en skillnad: alternativen
// blandas aldrig (de står sorterade som en tallinje), så visat index är
// originalindex.
// =============================================================================

import { valjTalserier, allaTalserier, talserieVersion, FRAGOR_PER_SESSION, TALSERIE_VERSION, TIDSGRANS_S } from './select';
import type { GenomgangTalserie, TalserieFraga, TalserieNiva, VisadTalserie } from './types';

export const TALSERIE_TEST_TYPER = ['talserier-grund', 'talserier-avancerad', 'talserier-expert'] as const;
export type TalserieTestTyp = (typeof TALSERIE_TEST_TYPER)[number];

export function arTalserieTestTyp(t: unknown): t is TalserieTestTyp {
  return typeof t === 'string' && (TALSERIE_TEST_TYPER as readonly string[]).includes(t);
}

export function nivaForTalserieTestTyp(t: TalserieTestTyp): TalserieNiva {
  return t.slice('talserier-'.length) as TalserieNiva;
}

/** Meta på varje ny talseriesession. */
export function talserieMeta(niva: TalserieNiva) {
  return { talserie_version: TALSERIE_VERSION, antal: FRAGOR_PER_SESSION, tidsgrans_s: TIDSGRANS_S[niva] } as const;
}

export function visaTalserie(q: TalserieFraga): VisadTalserie {
  return { id: q.id, difficulty: q.difficulty, visade: q.visade, luckor: q.luckor, options: q.options };
}

export function genomgaTalserie(q: TalserieFraga): GenomgangTalserie {
  return { ...visaTalserie(q), family: q.family, regel: q.regel, bagar: q.bagar, rattVisat: q.correctAnswer, misstag: q.misstag };
}

/** Allt klienten behöver om en sessionsrad: uppgifterna, och genomgången när testet är avslutat. */
export function talserieInnehall(session: { id: string; test_type?: string | null; meta?: unknown; completed_at?: string | null }): {
  fragor: VisadTalserie[];
  genomgang: GenomgangTalserie[] | null;
} {
  if (!arTalserieTestTyp(session.test_type)) return { fragor: [], genomgang: null };
  const urval = valjTalserier(nivaForTalserieTestTyp(session.test_type), session.id, FRAGOR_PER_SESSION, talserieVersion(session.meta));
  return { fragor: urval.map(visaTalserie), genomgang: session.completed_at ? urval.map(genomgaTalserie) : null };
}

export function hittaTalserie(id: string): TalserieFraga | undefined {
  return allaTalserier().find((q) => q.id === id);
}

/** Dömer ett svar (index i den sorterade listan). Null när indexet inte finns. */
export function bedomTalserieSvar(q: TalserieFraga, valt: unknown) {
  if (typeof valt !== 'number' || !Number.isInteger(valt) || valt < 0 || valt >= q.options.length) return null;
  return { selected: valt, visat: valt, correct: valt === q.correctAnswer };
}

/** Poängen räknad om mot banken. */
export function rattaTalserieSvar(answers: readonly unknown[]): number {
  const facit = new Map(allaTalserier().map((q) => [q.id, q.correctAnswer]));
  let ratt = 0;
  for (const rad of answers) {
    const a = (rad ?? {}) as { q_id?: unknown; selected?: unknown };
    if (typeof a.q_id === 'string' && typeof a.selected === 'number' && facit.get(a.q_id) === a.selected) ratt++;
  }
  return ratt;
}

/** Frågestatistiken: en rad per besvarad uppgift, test_kind talserie. */
export function talserieStatistik(answers: readonly { q_id: string; correct: boolean; time_spent?: number; selected: number }[]) {
  return answers.map((a) => ({ fraga_id: a.q_id, test_kind: 'talserie', correct: a.correct, tid_s: a.time_spent ?? 0, selected: a.selected, typ: 'klassisk' }));
}
