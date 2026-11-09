// src/lib/nivakoll/las.server.ts
// =============================================================================
// Det passen och Nivåkollen läser om en testtyp utanför matrisen
// (testplanen steg 1, 2026-11-09): uppgifternas andel rätt (p) och den
// senaste nivån ur Nivåkollen. Bara servern: registret läser bankerna.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { register } from '@/lib/fragor/register.server';
import { pForFraga, svarighetPrior, type FragaStatistik } from '@/lib/traning/svarighet';
import { passNivaUrNiva, type NivakollKind } from './niva';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

let priorCache: Map<string, number> | null = null;

/** Bankens p_prior per uppgift (registrets id: samma nyckel som frågestatistiken). */
export function priorFor(kind: NivakollKind, id: string): number | null {
  if (!priorCache) {
    priorCache = new Map();
    for (const r of register()) priorCache.set(`${r.test_kind}:${r.id}`, r.p_prior);
  }
  return priorCache.get(`${kind}:${id}`) ?? null;
}

/** p för en uppgift: uppmätt från 30 svar, annars bankens prior (svarighet.ts). */
export function pFor(kind: NivakollKind, id: string, stat?: FragaStatistik | null): number {
  return pForFraga(svarighetPrior(3), stat ?? null, priorFor(kind, id));
}

/** Grundbankens andelar per typ (registret, de aktiva), för passets nivå. */
export function pGrund(kind: NivakollKind): number[] {
  return register()
    .filter((r) => r.test_kind === kind && r.niva === 'grund' && !r.pensionerad)
    .map((r) => r.p_prior);
}

/** Senaste nivån ur Nivåkollen för typen, null utan Nivåkoll. */
export async function senasteNivakollNiva(admin: Klient, userId: string, kind: NivakollKind): Promise<number | null> {
  const { data, error } = await admin
    .from('test_nivapunkter')
    .select('niva, dag, skapad_at')
    .eq('user_id', userId)
    .eq('test_kind', kind)
    .order('dag', { ascending: false })
    .order('skapad_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  const n = Number((data ?? [])[0]?.niva);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Passets nivå: Nivåkollen bestämmer när den finns (testplanen steg 1), annars
 * det bästa klassiska grundresultatet som förut (reserv).
 */
export function passNivaFor(kind: NivakollKind, nivakoll: number | null, reserv: 'grund' | 'avancerad'): 'grund' | 'avancerad' {
  return nivakoll != null ? passNivaUrNiva(nivakoll, pGrund(kind)) : reserv;
}
