// src/lib/ordforradV1/fragor.server.ts
// =============================================================================
// Serverns väg från ordförrådsbanken till klienten, och rättningen. Samma
// mönster som deduktivV1: alternativen blandas per session och uppgift
// (logicTestV7/blanda.ts), lagring och rättning på originalindex, facit och
// misstag först efter avslutat test.
// =============================================================================

import { BLANDAD_META, arBlandad, permutationForSession, tillOriginal, tillVisat } from '@/lib/logicTestV7/blanda';
import { allaOrd, valjOrd, ordVersion, FRAGOR_PER_SESSION, ORD_VERSION, TIDSGRANS_S } from './select';
import type { GenomgangOrd, OrdFraga, OrdNiva, VisadOrd } from './types';

export const ORD_TEST_TYPER = ['ordforrad-grund', 'ordforrad-avancerad', 'ordforrad-expert'] as const;
export type OrdTestTyp = (typeof ORD_TEST_TYPER)[number];

export function arOrdTestTyp(t: unknown): t is OrdTestTyp {
  return typeof t === 'string' && (ORD_TEST_TYPER as readonly string[]).includes(t);
}

export function nivaForOrdTestTyp(t: OrdTestTyp): OrdNiva {
  return t.slice('ordforrad-'.length) as OrdNiva;
}

export function ordMeta(niva: OrdNiva) {
  return { ...BLANDAD_META, ord_version: ORD_VERSION, antal: FRAGOR_PER_SESSION, tidsgrans_s: TIDSGRANS_S[niva] } as const;
}

const perm = (q: OrdFraga, seed: string, blandade: boolean) => permutationForSession(seed, q, blandade);

export function visaOrd(q: OrdFraga, seed: string, blandade = true): VisadOrd {
  const p = perm(q, seed, blandade);
  return { id: q.id, typ: q.typ, ord: q.ord, options: p.map((o) => q.options[o]) };
}

export function genomgaOrd(q: OrdFraga, seed: string, blandade = true): GenomgangOrd {
  const p = perm(q, seed, blandade);
  return {
    ...visaOrd(q, seed, blandade),
    rattVisat: tillVisat(p, q.correctAnswer),
    misstag: p.map((o) => q.misstag[o] ?? ''),
    facit_betyder: q.facit_betyder,
    exempel: q.exempel,
    arMotsats: p.map((o) => q.typ === 'synonym' && q.typer[o] === 'antonym'),
  };
}

export function ordInnehall(session: { id: string; test_type?: string | null; meta?: unknown; completed_at?: string | null }): {
  fragor: VisadOrd[];
  genomgang: GenomgangOrd[] | null;
} {
  if (!arOrdTestTyp(session.test_type)) return { fragor: [], genomgang: null };
  const blandade = arBlandad(session.meta);
  const urval = valjOrd(nivaForOrdTestTyp(session.test_type), session.id, ordVersion(session.meta));
  return {
    fragor: urval.map((q) => visaOrd(q, session.id, blandade)),
    genomgang: session.completed_at ? urval.map((q) => genomgaOrd(q, session.id, blandade)) : null,
  };
}

export function hittaOrd(id: string): OrdFraga | undefined {
  return allaOrd().find((q) => q.id === id);
}

export function bedomOrdSvar(q: OrdFraga, seed: string, blandade: boolean, visat: unknown) {
  if (typeof visat !== 'number' || !Number.isInteger(visat)) return null;
  const selected = tillOriginal(perm(q, seed, blandade), visat);
  if (selected < 0) return null;
  return { selected, visat, correct: selected === q.correctAnswer };
}

export function rattaOrdSvar(answers: readonly unknown[]): number {
  const facit = new Map(allaOrd().map((q) => [q.id, q.correctAnswer]));
  let ratt = 0;
  for (const rad of answers) {
    const a = (rad ?? {}) as { q_id?: unknown; selected?: unknown };
    if (typeof a.q_id === 'string' && typeof a.selected === 'number' && facit.get(a.q_id) === a.selected) ratt++;
  }
  return ratt;
}

/** Frågestatistiken: test_kind ordforrad, typ synonym eller antonym (briefen avsnitt 7). */
export function ordStatistik(answers: readonly { q_id: string; correct: boolean; time_spent?: number; selected: number }[]) {
  const typ = new Map(allaOrd().map((q) => [q.id, q.typ]));
  return answers.map((a) => ({ fraga_id: a.q_id, test_kind: 'ordforrad', correct: a.correct, tid_s: a.time_spent ?? 0, selected: a.selected, typ: typ.get(a.q_id) ?? 'synonym' }));
}
