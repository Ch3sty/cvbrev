// src/lib/spatialV1/fragor.server.ts
// =============================================================================
// Serverns väg från bankerna för Spatial förmåga till det klienten får se, och
// rättningen. Samma mönster som deduktivV1/fragor.server.ts: alternativen
// blandas per session och uppgift (logicTestV7/blanda.ts), lagring och
// rättning sker på originalindex. Klienten får aldrig facit, misstag eller
// genomgången förrän testet är avslutat.
// =============================================================================

import { BLANDAD_META, permutationForSession, tillOriginal, tillVisat, arBlandad } from '@/lib/logicTestV7/blanda';
import { allaSpatial, valjSpatial, spatialVersion, FRAGOR_PER_SESSION, SPATIAL_VERSION, TIDSGRANS_S } from './select';
import type { GenomgangSpatial, SpatialFraga, SpatialNiva, VisadSpatial } from './types';

export const SPATIAL_TEST_TYPER = ['spatial-grund', 'spatial-avancerad', 'spatial-expert'] as const;
export type SpatialTestTyp = (typeof SPATIAL_TEST_TYPER)[number];

export function arSpatialTestTyp(t: unknown): t is SpatialTestTyp {
  return typeof t === 'string' && (SPATIAL_TEST_TYPER as readonly string[]).includes(t);
}

export function nivaForSpatialTestTyp(t: SpatialTestTyp): SpatialNiva {
  return t.slice('spatial-'.length) as SpatialNiva;
}

/** Meta på varje ny session (briefen: meta.spatial_version). */
export function spatialMeta(niva: SpatialNiva) {
  return { ...BLANDAD_META, spatial_version: SPATIAL_VERSION, antal: FRAGOR_PER_SESSION, tidsgrans_s: TIDSGRANS_S[niva] } as const;
}

const perm = (q: SpatialFraga, seed: string, blandade: boolean) => permutationForSession(seed, q, blandade);

/** Uppgiften som den visas. `seed` är sessions-id (eller passets/provets id). */
export function visaSpatial(q: SpatialFraga, seed: string, blandade = true): VisadSpatial {
  const p = perm(q, seed, blandade);
  return {
    id: q.id,
    form: q.form,
    ...(q.klipp ? { klipp: true } : {}),
    difficulty: q.difficulty,
    fraga: q.fraga,
    ...(q.referens ? { referens: q.referens } : {}),
    ...(q.sekvens ? { sekvens: q.sekvens } : {}),
    options: p.map((o) => q.options[o]),
  };
}

export function genomgaSpatial(q: SpatialFraga, seed: string, blandade = true): GenomgangSpatial {
  const p = perm(q, seed, blandade);
  return {
    ...visaSpatial(q, seed, blandade),
    rattVisat: tillVisat(p, q.correctAnswer),
    misstag: p.map((o) => q.misstag[o] ?? ''),
    forklaring: q.forklaring,
    ...(q.uppvikning ? { uppvikning: q.uppvikning } : {}),
    ...(q.avslojande ? { avslojande: p.map((o) => q.avslojande![o] ?? []) } : {}),
  };
}

/** Allt klienten behöver om en sessionsrad. */
export function spatialInnehall(session: { id: string; test_type?: string | null; meta?: unknown; completed_at?: string | null }): {
  fragor: VisadSpatial[];
  genomgang: GenomgangSpatial[] | null;
} {
  if (!arSpatialTestTyp(session.test_type)) return { fragor: [], genomgang: null };
  const blandade = arBlandad(session.meta);
  const urval = valjSpatial(nivaForSpatialTestTyp(session.test_type), session.id, spatialVersion(session.meta));
  return {
    fragor: urval.map((q) => visaSpatial(q, session.id, blandade)),
    genomgang: session.completed_at ? urval.map((q) => genomgaSpatial(q, session.id, blandade)) : null,
  };
}

export function hittaSpatial(id: string): SpatialFraga | undefined {
  return allaSpatial().find((q) => q.id === id);
}

/** Dömer ett svar: visat index in, originalindex lagras och rättas. */
export function bedomSpatialSvar(q: SpatialFraga, seed: string, blandade: boolean, visat: unknown) {
  if (typeof visat !== 'number' || !Number.isInteger(visat)) return null;
  const selected = tillOriginal(perm(q, seed, blandade), visat);
  if (selected < 0) return null;
  return { selected, visat, correct: selected === q.correctAnswer };
}

export function rattaSpatialSvar(answers: readonly unknown[]): number {
  const facit = new Map(allaSpatial().map((q) => [q.id, q.correctAnswer]));
  let ratt = 0;
  for (const rad of answers) {
    const a = (rad ?? {}) as { q_id?: unknown; selected?: unknown };
    if (typeof a.q_id === 'string' && typeof a.selected === 'number' && facit.get(a.q_id) === a.selected) ratt++;
  }
  return ratt;
}

/** Antal rätt per form, för "Var du tappar" (A, B, C). */
export function spatialPerForm(answers: readonly { q_id: string; correct: boolean }[]) {
  const form = new Map(allaSpatial().map((q) => [q.id, q.form]));
  const ut: Record<'A' | 'B' | 'C', { ratt: number; antal: number }> = { A: { ratt: 0, antal: 0 }, B: { ratt: 0, antal: 0 }, C: { ratt: 0, antal: 0 } };
  for (const a of answers) {
    const f = form.get(a.q_id);
    if (!f) continue;
    ut[f].antal++;
    if (a.correct) ut[f].ratt++;
  }
  return ut;
}

/** Frågestatistiken: test_kind spatial, typ = formen (briefen avsnitt 7). */
export function spatialStatistik(answers: readonly { q_id: string; correct: boolean; time_spent?: number; selected: number }[]) {
  const form = new Map(allaSpatial().map((q) => [q.id, q.form]));
  return answers.map((a) => ({ fraga_id: a.q_id, test_kind: 'spatial', correct: a.correct, tid_s: a.time_spent ?? 0, selected: a.selected, typ: form.get(a.q_id) ?? 'A' }));
}
