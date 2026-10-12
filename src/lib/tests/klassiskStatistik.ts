// src/lib/tests/klassiskStatistik.ts
// Frågestatistiken för de klassiska matristesten (nivåtesten och provet).
//
// Kontraktet (docs/design/tester-v2-2026-10-11/kontrakt-kalibrering.md): för
// frågor utan kalibreringssvar ska fraga_kalibrering_vy och fraga_statistik
// räkna samma svar. Vyn läser alla blandade, avslutade sessioner, så de
// klassiska testen skriver också till fraga_statistik, med samma typ som vyn
// sätter (meta.typ, annars klassisk). Undantagna konton räknas bort i
// databasfunktionen. Statistiken får aldrig fälla svaret till användaren.
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { arBlandad } from '@/lib/logicTestV7/blanda';

type Svar = { q_id?: unknown; correct?: unknown; time_spent?: unknown; selected?: unknown };

export function klassiskStatistik(
  answers: readonly unknown[],
  meta: unknown,
  testKind: string,
): { fraga_id: string; test_kind: string; correct: boolean; tid_s: number; selected: number; typ: string }[] {
  const m = (meta && typeof meta === 'object' ? meta : {}) as { typ?: unknown; upprepade?: unknown };
  const typ = typeof m.typ === 'string' && m.typ ? m.typ : 'klassisk';
  const upprepade = new Set(Array.isArray(m.upprepade) ? m.upprepade.filter((x): x is string => typeof x === 'string') : []);
  return (answers.filter((a) => !!a && typeof a === 'object') as Svar[])
    .filter((a) => typeof a.q_id === 'string' && a.q_id !== '' && !upprepade.has(a.q_id))
    .map((a) => ({
      fraga_id: a.q_id as string,
      test_kind: testKind,
      correct: a.correct === true,
      tid_s: typeof a.time_spent === 'number' ? a.time_spent : 0,
      selected: typeof a.selected === 'number' ? a.selected : -1,
      typ,
    }));
}

/** Skickar svaren till uppdatera_fraga_statistik när sessionen är blandad. Väntar aldrig. */
export function skickaKlassiskStatistik(args: {
  userId: string;
  meta: unknown;
  answers: readonly unknown[];
  testKind: string;
  etikett: string;
}): void {
  if (!arBlandad(args.meta) || args.answers.length === 0) return;
  const p_svar = klassiskStatistik(args.answers, args.meta, args.testKind);
  if (p_svar.length === 0) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void Promise.resolve((getSupabaseAdmin() as any).rpc('uppdatera_fraga_statistik', { p_svar, p_user: args.userId }) as Promise<{ error: { message: string } | null }>)
      .then((r) => {
        if (r?.error) console.error(`${args.etikett}: frågestatistiken`, r.error.message);
      })
      .catch(() => {});
  } catch {
    // Saknad nyckel i miljön: statistiken hoppas över.
  }
}
