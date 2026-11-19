// src/lib/tester/v4/steg2-niva.server.ts
// Nivån för talserier, spatial förmåga och ordförråd (A7). Typerna saknar
// en egen Nivåkoll, men deras fasta nivåtest (15 uppgifter) mäts med samma
// skattning som Nivåkollen (matningsNiva i traning/niva.ts): nivån där väntat
// antal rätt är lika med faktiskt antal rätt, ur uppgifternas andel rätt
// (p_prior i bankerna). Punkterna märks kalla 'nivatest' så att vyerna kan
// säga varifrån nivån kommer. Bara servern: bankerna har facit.

import 'server-only';
import { hittaTalserie } from '@/lib/talserierV1/fragor.server';
import { hittaSpatial } from '@/lib/spatialV1/fragor.server';
import { hittaOrd } from '@/lib/ordforradV1/fragor.server';
import { matningsNiva, type NivaSvar } from '@/lib/traning/niva';
import { PRIOR_P } from '@/lib/traning/svarighet';
import type { TestTypId } from './typer';

export type Steg2Typ = 'talserie' | 'spatial' | 'ordforrad';
export const STEG2_TYPER: readonly Steg2Typ[] = ['talserie', 'spatial', 'ordforrad'];

export function arSteg2Typ(t: unknown): t is Steg2Typ {
  return t === 'talserie' || t === 'spatial' || t === 'ordforrad';
}

type BankNiva = 'grund' | 'avancerad' | 'expert';

/** Andelen rätt per banknivå när uppgiften saknar egen p_prior. */
const NIVA_P: Readonly<Record<BankNiva, number>> = { grund: PRIOR_P[2], avancerad: PRIOR_P[3], expert: PRIOR_P[4] };

const SLUG: Readonly<Record<Steg2Typ, string>> = { talserie: 'talserier', spatial: 'spatial', ordforrad: 'ordforrad' };

/** Nivåtestets test_type → typ och banknivå, eller null. */
export function steg2NivatestTyp(testType: string): { typ: Steg2Typ; niva: BankNiva } | null {
  for (const typ of STEG2_TYPER) {
    const m = testType.match(new RegExp(`^${SLUG[typ]}-(grund|avancerad|expert)$`));
    if (m) return { typ, niva: m[1] as BankNiva };
  }
  return null;
}

/** p för en uppgift i en steg 2-typ. */
export function pSteg2(typ: Steg2Typ, id: string, reserv: BankNiva = 'avancerad'): number {
  const q =
    typ === 'talserie' ? (hittaTalserie(id) as { p_prior?: number; niva?: BankNiva } | undefined)
    : typ === 'spatial' ? (hittaSpatial(id) as { p_prior?: number; niva?: BankNiva } | undefined)
    : (hittaOrd(id) as { p_prior?: number; niva?: BankNiva } | undefined);
  if (q && typeof q.p_prior === 'number' && q.p_prior > 0 && q.p_prior < 1) return q.p_prior;
  return NIVA_P[q?.niva ?? reserv];
}

/**
 * Nivån ett slutfört nivåtest visar. Med svar räknas varje uppgifts p; utan
 * sparade svar (äldre rader) räknas poängen mot banknivåns p. Null utan
 * underlag.
 */
export function nivaUrNivatest(rad: { test_type: string; score?: number | null; answers?: unknown; meta?: unknown }): number | null {
  const k = steg2NivatestTyp(rad.test_type);
  if (!k) return null;
  const svar: NivaSvar[] = [];
  if (Array.isArray(rad.answers) && rad.answers.length > 0) {
    for (const a of rad.answers as { q_id?: unknown; correct?: unknown }[]) {
      if (typeof a?.q_id !== 'string') continue;
      svar.push({ p: pSteg2(k.typ, a.q_id, k.niva), correct: a.correct === true });
    }
    // Obesvarade (tiden tog slut) räknas som fel, som i provet.
    const antal = Number((rad.meta as { antal?: unknown } | null)?.antal) || 0;
    for (let i = svar.length; i < antal; i++) svar.push({ p: NIVA_P[k.niva], correct: false });
  } else if (typeof rad.score === 'number') {
    const antal = Number((rad.meta as { antal?: unknown } | null)?.antal) || 15;
    const p = NIVA_P[k.niva];
    for (let i = 0; i < antal; i++) svar.push({ p, correct: i < rad.score });
  }
  if (svar.length === 0) return null;
  return matningsNiva(svar).niva;
}

/** p-funktionen för träningens nivå (nivapunkt.server.ts). */
export function pForTyp(typ: TestTypId): ((id: string) => number) | null {
  return arSteg2Typ(typ) ? (id) => pSteg2(typ, id) : null;
}
