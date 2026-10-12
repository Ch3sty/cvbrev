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

/** Skickar svaren till uppdatera_fraga_statistik när sessionen är blandad. Löftet avvisas aldrig; rutten väntar inte. */
export function skickaKlassiskStatistik(args: {
  userId: string;
  meta: unknown;
  answers: readonly unknown[];
  testKind: string;
  etikett: string;
}): Promise<void> {
  if (!arBlandad(args.meta) || args.answers.length === 0) return Promise.resolve();
  return skicka(klassiskStatistik(args.answers, args.meta, args.testKind), args.userId, args.etikett);
}

type StatistikRad = ReturnType<typeof klassiskStatistik>[number];

/* ------------------------- Verbalt och numeriskt ------------------------- */
//
// De klassiska verbala och numeriska testen (grund, avancerad, expert och
// provet) har ett annat svarsformat och blandar inte alternativen, så de
// skriver alltid, med typ klassisk. Fråge-id:t är registrets nyckel
// (src/lib/fragor/register.server.ts):
//   påstående  "<passageId>:<statementIndex>"  (verbalt grund, avancerad, prov)
//   fråga      questionId                      (verbalt expert, numeriskt)
// selected är alternativets plats: Sant 0, Falskt 1, Kan inte avgöra 2 för
// påståendena, a till d som 0 till 3 för frågorna. Obesvarat blir -1 (vet_inte).

/** Testtyperna (logic_test_v4_sessions.test_type) och deras test_kind. */
export const UNDERLAG_TESTTYPER: Readonly<Record<string, 'verbal' | 'numerisk'>> = {
  'verbal-resonemang': 'verbal',
  'verbal-resonemang-v2': 'verbal',
  'verbal-resonemang-expert': 'verbal',
  'verbal-resonemang-prov': 'verbal',
  'numerical-reasoning': 'numerisk',
  'numerical-reasoning-v2': 'numerisk',
  'numerical-reasoning-expert': 'numerisk',
  'numerical-reasoning-prov': 'numerisk',
};

const PASTAENDE_VAL: Readonly<Record<string, number>> = { true: 0, false: 1, cannot_say: 2 };

type UnderlagSvar = {
  passageId?: unknown;
  statementIndex?: unknown;
  questionId?: unknown;
  answer?: unknown;
  selectedAnswerId?: unknown;
  isCorrect?: unknown;
  timeSpent?: unknown;
};

/** Registrets id för ett svar i de verbala och numeriska testen, null när det inte går att avgöra. */
export function underlagFragaId(svar: unknown): string | null {
  if (!svar || typeof svar !== 'object') return null;
  const a = svar as UnderlagSvar;
  if (typeof a.questionId === 'string' && a.questionId) return a.questionId;
  if (
    typeof a.passageId === 'string' &&
    a.passageId &&
    typeof a.statementIndex === 'number' &&
    Number.isInteger(a.statementIndex) &&
    a.statementIndex >= 0
  ) {
    return `${a.passageId}:${a.statementIndex}`;
  }
  return null;
}

function underlagVal(a: UnderlagSvar): number {
  if (typeof a.selectedAnswerId === 'string' && /^[a-z]$/.test(a.selectedAnswerId)) return a.selectedAnswerId.charCodeAt(0) - 97;
  if (typeof a.answer === 'string' && Object.prototype.hasOwnProperty.call(PASTAENDE_VAL, a.answer)) return PASTAENDE_VAL[a.answer];
  return -1;
}

/** Statistikraderna för ett avslutat verbalt eller numeriskt test. Rätt kommer från servern (isCorrect). */
export function underlagStatistik(answers: readonly unknown[], testKind: 'verbal' | 'numerisk'): StatistikRad[] {
  const ut: StatistikRad[] = [];
  const sedda = new Set<string>();
  for (const svar of answers) {
    const id = underlagFragaId(svar);
    if (!id || sedda.has(id)) continue;
    sedda.add(id);
    const a = svar as UnderlagSvar;
    const selected = underlagVal(a);
    ut.push({
      fraga_id: id,
      test_kind: testKind,
      correct: selected >= 0 && a.isCorrect === true,
      tid_s: typeof a.timeSpent === 'number' && Number.isFinite(a.timeSpent) ? Math.max(0, Math.round(a.timeSpent)) : 0,
      selected,
      typ: 'klassisk',
    });
  }
  return ut;
}

/**
 * Skickar ett avslutat verbalt eller numeriskt test till uppdatera_fraga_statistik.
 * Bara första avslutet räknas (redanAvslutad hoppar över). Löftet avvisas
 * aldrig; rutten väntar inte. Undantagna konton räknas bort i databasfunktionen.
 */
export function skickaUnderlagStatistik(args: {
  userId: string;
  testType: unknown;
  answers: unknown;
  redanAvslutad: boolean;
  etikett: string;
}): Promise<void> {
  const kind = typeof args.testType === 'string' ? UNDERLAG_TESTTYPER[args.testType] : undefined;
  if (!kind || args.redanAvslutad || !Array.isArray(args.answers) || args.answers.length === 0) return Promise.resolve();
  return skicka(underlagStatistik(args.answers, kind), args.userId, args.etikett);
}

function skicka(p_svar: StatistikRad[], userId: string, etikett: string): Promise<void> {
  if (p_svar.length === 0) return Promise.resolve();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve((getSupabaseAdmin() as any).rpc('uppdatera_fraga_statistik', { p_svar, p_user: userId }) as Promise<{ error: { message: string } | null }>)
      .then((r) => {
        if (r?.error) console.error(`${etikett}: frågestatistiken`, r.error.message);
      })
      .catch(() => {});
  } catch {
    // Saknad nyckel i miljön: statistiken hoppas över.
    return Promise.resolve();
  }
}
