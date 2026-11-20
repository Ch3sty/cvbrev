// src/lib/tester/v4/nivapunkt.server.ts
// Nivåpunkten typ pass för typerna utanför matrisen (planen 2.2 punkt 7, A4).
// RPC:n slutfor_traningssession skriver bara nivåpunkt för matrisens
// sessioner, så den här skriver med service role efter att RPC:n lyckats:
// upsert på primärnyckeln (user_id, test_kind, dag, typ), idempotent. Ett
// fel loggas och punkten saknas bara den dagen; träningen är redan sparad.

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { pFor } from '@/lib/nivakoll/las.server';
import type { NivakollKind } from '@/lib/nivakoll/niva';
import { nivaEfterTraning, type TraningsSvar } from './niva-lage';
import { pForTyp } from './steg2-niva.server';
import type { TestTypId } from './typer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export interface NivapunktIn {
  userId: string;
  testKind: string;
  dag: Dag;
  typ: 'pass' | 'matning';
  niva: number;
  sessionId: string | null;
}

export async function skrivNivapunkt(admin: Klient, p: NivapunktIn): Promise<boolean> {
  const { error } = await admin.from('test_nivapunkter').upsert(
    { user_id: p.userId, test_kind: p.testKind, dag: p.dag, typ: p.typ, niva: p.niva, session_id: p.sessionId, skapad_at: new Date().toISOString() },
    { onConflict: 'user_id,test_kind,dag,typ' }
  );
  if (error) {
    console.error('[nivapunkt] kunde inte skriva', p.testKind, p.dag, error);
    return false;
  }
  return true;
}

/**
 * Räknar och skriver nivån efter en träning. Nivån före är typens senaste
 * nivåpunkt (nivåkoll eller träning); dagens start är den senaste före i dag.
 * Utan nivå före (ingen Nivåkoll gjord) skrivs inget: en träning sätter
 * aldrig en första nivå. Returnerar nivån efter, eller null.
 */
type NivaEfterArgs = {
  admin: Klient;
  userId: string;
  kind: NivakollKind | Exclude<TestTypId, 'matris'>;
  sessionId: string;
  /** Nivån före när typen saknar nivåpunkt: nivåtestets skattning (talserier, spatial, ordförråd). */
  foreReserv?: number | null;
  svar: readonly { q_id: string; correct: boolean; raknas: boolean }[];
  idag?: Dag;
};

export async function uppdateraNivaEfterTraning(args: NivaEfterArgs): Promise<number | null> {
  return (await uppdateraNivaMedFore(args)).efter;
}

/**
 * Samma som uppdateraNivaEfterTraning, och nivån före (omgång 3, målgången:
 * slutför-svarets niva_fore). Före är dagens start, den senaste nivåpunkten
 * före i dag, samma tal som nivån efter räknas från; null när den saknas.
 */
export async function uppdateraNivaMedFore(args: NivaEfterArgs): Promise<{ fore: number | null; efter: number | null }> {
  const idag = args.idag ?? dagSthlm();
  let foreUt: number | null = null;
  try {
    const { data, error } = await args.admin
      .from('test_nivapunkter')
      .select('dag, niva, skapad_at')
      .eq('user_id', args.userId)
      .eq('test_kind', args.kind)
      .order('dag', { ascending: false })
      .order('skapad_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    const rader = (data ?? []).map((r) => ({ dag: String(r.dag), niva: Number(r.niva) })).filter((r) => Number.isFinite(r.niva) && r.niva > 0);
    const fore = rader[0]?.niva ?? args.foreReserv ?? null;
    foreUt = fore;
    const dagensStart = rader.find((r) => r.dag < idag)?.niva ?? fore;
    const p = pForTyp(args.kind) ?? ((id: string) => pFor(args.kind as NivakollKind, id));
    const svar: TraningsSvar[] = args.svar.map((s) => ({ p: p(s.q_id), correct: s.correct, raknas: s.raknas }));
    const ut = nivaEfterTraning({ fore, svar, dagensStart });
    if (!ut) return { fore, efter: null };
    const ok = await skrivNivapunkt(args.admin, { userId: args.userId, testKind: args.kind, dag: idag, typ: 'pass', niva: ut.niva, sessionId: args.sessionId });
    return { fore, efter: ok ? ut.niva : null };
  } catch (e) {
    console.error('[nivapunkt] nivån efter träningen gick inte att räkna', args.kind, e);
    return { fore: foreUt, efter: null };
  }
}
