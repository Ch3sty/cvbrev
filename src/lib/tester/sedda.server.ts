// src/lib/tester/sedda.server.ts
// =============================================================================
// Vilka texter och underlag hon har haft, och när, i verbalt och numeriskt
// (beställning omgång 2, B2): över text- och sifferpassen, de riktade
// passen, de klassiska testen, provet och övningsprovet. Passen använder
// listan för karensen på 30 dagar, övningsprovet för att välja det hon inte
// haft först.
//
// Klassiska test och provet sparar inte sitt urval: det räknas om ur
// sessionens id och underlagsversion, samma urval som testvyn visade.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { selectPassagesForSession as verbalGrund } from '@/lib/verbalTestV1/selectPassages.v1';
import { selectPassagesForSession as verbalAvancerad } from '@/lib/verbalTestV2/selectPassages.v2';
import { selectProvPassagesForSession as verbalProv } from '@/lib/verbalTestProv/selectProv';
import { selectPassagesForSession as numGrund } from '@/lib/numericalTest/selectPassages';
import { selectPassagesForSession as numAvancerad } from '@/lib/numericalTestV2/selectPassages';
import { selectProvPassagesForSession as numProv } from '@/lib/numericalTestProv/selectProv';
import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { underlagsVersion, type UnderlagVersion } from './underlagVersion';
import type { VnKind } from './pass-typer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

type Valj = (id: string, v: UnderlagVersion) => { id: string }[];

/** test_type till urvalet för sessioner som inte sparar sitt urval. */
const KLASSISKA: Record<VnKind, Record<string, Valj>> = {
  verbal: {
    'verbal-resonemang': (id, v) => verbalGrund(id, undefined, v),
    'verbal-reasoning': (id, v) => verbalGrund(id, undefined, v),
    'verbal-resonemang-v2': (id, v) => verbalAvancerad(id, undefined, v),
    'verbal-reasoning-v2': (id, v) => verbalAvancerad(id, undefined, v),
    'verbal-resonemang-prov': (id, v) => verbalProv(id, v),
  },
  numerisk: {
    'numerical-reasoning': (id, v) => numGrund(id, undefined, v),
    'numeriskt-test': (id, v) => numGrund(id, undefined, v),
    'numerical-reasoning-v2': (id, v) => numAvancerad(id, undefined, v),
    'numeriskt-test-v2': (id, v) => numAvancerad(id, undefined, v),
    'numerical-reasoning-prov': (id, v) => numProv(id, v),
  },
};

/** Typerna som sparar sitt urval i meta: övningsprovet (delar) och passen (underlag_id). */
const MED_META: Record<VnKind, string[]> = {
  verbal: ['verbal-general', 'verbal-pass', 'verbal-riktat'],
  numerisk: ['numerisk-general', 'numerisk-pass', 'numerisk-riktat'],
};

export function seddaTestTyper(kind: VnKind): string[] {
  return [...Object.keys(KLASSISKA[kind]), ...MED_META[kind]];
}

export interface SeddRad {
  id: string;
  test_type: string | null;
  meta: unknown;
  created_at: string;
}

/** Underlagen en session visade. Ren, för tester. */
export function underlagForSession(kind: VnKind, rad: SeddRad): string[] {
  const t = rad.test_type ?? '';
  const valj = KLASSISKA[kind][t];
  if (valj) {
    try {
      return valj(rad.id, underlagsVersion(rad.meta)).map((p) => p.id);
    } catch {
      return [];
    }
  }
  const m = (rad.meta ?? {}) as { delar?: unknown; underlag_id?: unknown };
  if (Array.isArray(m.delar)) return m.delar.filter((d): d is string => typeof d === 'string');
  if (typeof m.underlag_id === 'string') return [m.underlag_id];
  return [];
}

/** Senast sedd dag per underlag, ur raderna. Ren, för tester. */
export function seddaUrRader(kind: VnKind, rader: readonly SeddRad[]): Map<string, Dag> {
  const ut = new Map<string, Dag>();
  for (const r of rader) {
    const dag = dagSthlm(r.created_at);
    for (const id of underlagForSession(kind, r)) {
      const forra = ut.get(id);
      if (!forra || forra < dag) ut.set(id, dag);
    }
  }
  return ut;
}

/** Läser hennes sessioner av slaget (de senaste 300) och räknar fram de sedda underlagen. */
export async function lasSeddaUnderlag(admin: Klient, userId: string, kind: VnKind): Promise<{ sedda: Map<string, Dag>; rader: SeddRad[] }> {
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select('id, test_type, meta, created_at')
    .eq('user_id', userId)
    .in('test_type', seddaTestTyper(kind))
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  const rader = (data ?? []) as SeddRad[];
  return { sedda: seddaUrRader(kind, rader), rader };
}
