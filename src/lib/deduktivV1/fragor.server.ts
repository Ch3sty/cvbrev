// src/lib/deduktivV1/fragor.server.ts
// =============================================================================
// Serverns enda väg från deduktivbanken till det klienten får se, och
// rättningen (beställningen omgång 3, B1). Samma mönster som figurserierna.
//
// - Urvalet: 12 ur nivåns pool, seedat på sessionId (select.ts).
// - Alternativens ordning: blanda.ts, seedat på sessionId + uppgiftens id, för
//   sessioner med meta.alternativ_blandade (alla deduktivsessioner).
// - Klienten får aldrig facit, etiketter eller lösningsgång under testet.
//   Genomgången efter avslutat test får rätt svar och etiketterna i visad ordning.
// =============================================================================

import { arBlandad, BLANDAD_META, permutationForSession, tillOriginal, tillVisat } from '@/lib/logicTestV7/blanda';
import { allaFragor, valjFragor, FRAGOR_PER_SESSION, DEDUKTIV_VERSION, TIDSGRANS_S } from './select';
import type { DeduktivFraga, DeduktivNiva, GenomgangDeduktiv, VisadDeduktiv } from './types';

export const DEDUKTIV_TEST_TYPER = ['deduktiv-grund', 'deduktiv-avancerad', 'deduktiv-expert'] as const;
export type DeduktivTestTyp = (typeof DEDUKTIV_TEST_TYPER)[number];

export function arDeduktivTestTyp(t: unknown): t is DeduktivTestTyp {
  return typeof t === 'string' && (DEDUKTIV_TEST_TYPER as readonly string[]).includes(t);
}

export function nivaForTestTyp(t: DeduktivTestTyp): DeduktivNiva {
  return t.slice('deduktiv-'.length) as DeduktivNiva;
}

/** Meta på varje ny deduktivsession. */
export const DEDUKTIV_META = {
  ...BLANDAD_META,
  deduktiv_version: DEDUKTIV_VERSION,
  antal: FRAGOR_PER_SESSION,
  tidsgrans_s: TIDSGRANS_S,
} as const;

const perm = (q: DeduktivFraga, sessionId: string, blandade: boolean) => permutationForSession(sessionId, q, blandade);

export function visaDeduktiv(q: DeduktivFraga, sessionId: string, blandade: boolean): VisadDeduktiv {
  const p = perm(q, sessionId, blandade);
  return { id: q.id, difficulty: q.difficulty, intro: q.intro, villkor: q.villkor, fraga: q.fraga, options: p.map((o) => q.options[o]) };
}

export function genomgaDeduktiv(q: DeduktivFraga, sessionId: string, blandade: boolean): GenomgangDeduktiv {
  const p = perm(q, sessionId, blandade);
  return {
    ...visaDeduktiv(q, sessionId, blandade),
    typ: q.typ,
    family: q.family,
    rattVisat: tillVisat(p, q.correctAnswer),
    etiketter: p.map((o) => q.etiketter[o] ?? ''),
    misstag: p.map((o) => q.misstag[o] ?? ''),
    losning: q.losning,
  };
}

/** Allt klienten behöver om en sessionsrad: uppgifterna, och genomgången när testet är avslutat. */
export function deduktivInnehall(session: {
  id: string;
  test_type?: string | null;
  meta?: unknown;
  completed_at?: string | null;
}): { fragor: VisadDeduktiv[]; genomgang: GenomgangDeduktiv[] | null } {
  if (!arDeduktivTestTyp(session.test_type)) return { fragor: [], genomgang: null };
  const niva = nivaForTestTyp(session.test_type);
  const blandade = arBlandad(session.meta);
  const urval = valjFragor(niva, session.id);
  return {
    fragor: urval.map((q) => visaDeduktiv(q, session.id, blandade)),
    genomgang: session.completed_at ? urval.map((q) => genomgaDeduktiv(q, session.id, blandade)) : null,
  };
}

export function hittaDeduktivFraga(id: string): DeduktivFraga | undefined {
  return allaFragor().find((q) => q.id === id);
}

/** Dömer ett svar: visat index in, originalindex lagras och rättas. Null när indexet inte finns. */
export function bedomDeduktivSvar(q: DeduktivFraga, sessionId: string, blandade: boolean, visat: unknown) {
  if (typeof visat !== 'number' || !Number.isInteger(visat)) return null;
  const selected = tillOriginal(perm(q, sessionId, blandade), visat);
  if (selected < 0) return null;
  return { selected, visat, correct: selected === q.correctAnswer };
}

/** Poängen: svar vars originalindex är uppgiftens facit, räknat om mot banken. */
export function rattaDeduktivSvar(answers: readonly unknown[]): number {
  const facit = new Map(allaFragor().map((q) => [q.id, q.correctAnswer]));
  let ratt = 0;
  for (const rad of answers) {
    const a = (rad ?? {}) as { q_id?: unknown; selected?: unknown };
    if (typeof a.q_id === 'string' && typeof a.selected === 'number' && facit.get(a.q_id) === a.selected) ratt++;
  }
  return ratt;
}

/** Frågestatistiken (kontrakt-kalibrering): en rad per besvarad uppgift, test_kind deduktiv. */
export function deduktivStatistik(answers: readonly { q_id: string; correct: boolean; time_spent?: number; selected: number }[]) {
  return answers.map((a) => ({ fraga_id: a.q_id, test_kind: 'deduktiv', correct: a.correct, tid_s: a.time_spent ?? 0, selected: a.selected, typ: 'klassisk' }));
}
