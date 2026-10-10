// src/lib/logicTestV7/fragor.server.ts
// =============================================================================
// Serverns enda väg från frågebank till det klienten får se.
//
// - Urvalet (vilka frågor) kommer som förut ur selectQuestions/selectProv,
//   seedat på sessionId.
// - Alternativens ordning kommer ur blanda.ts, seedat på sessionId + frågans
//   id, och bara för sessioner med meta.alternativ_blandade.
// - Klienten får aldrig correctAnswer under testet. Genomgången efter
//   avslutat test får rätt svar som visat index.
// - Svar-rutterna dömer här: visat index in, originalindex lagras.
//
// Importeras bara från serverkod (route handlers, server components,
// getRunData/getResultsData). Banken med facit får inte hamna i klientpaketet;
// testet i __tests__/klientpaket.test.ts vaktar det.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import questionBankV5 from '@/lib/logicTestV5/questionBank.v5.json';
import {
  selectQuestionsForSession,
  selectAvanceradQuestionsForSession,
  selectExpertQuestionsForSession,
  GRUND_POOL,
  AVANCERAD_POOL,
  EXPERT_POOL,
  GRUND_3C,
  AVANCERAD_3C,
  EXPERT_3C,
} from './selectQuestions.v7';
import { selectProvQuestionsForSession } from './selectProv.v7';
import {
  arBlandad,
  BLANDAD_META,
  permutationForSession,
  tillOriginal,
} from './blanda';
import { genomgaFraga, visaFraga } from './visning';
import type { GenomgangsFraga, LayeredQuestion, VisadFraga } from './layered.v7';

export { genomgaFraga, visaFraga };

export type MatrisSlug =
  | 'matrislogik-grund'
  | 'matrislogik-avancerad'
  | 'matrislogik-expert'
  | 'matrislogik-prov';

const URVAL: Record<MatrisSlug, (sessionId: string) => LayeredQuestion[]> = {
  'matrislogik-grund': (id) => selectQuestionsForSession(id),
  'matrislogik-avancerad': (id) => selectAvanceradQuestionsForSession(id),
  'matrislogik-expert': (id) => selectExpertQuestionsForSession(id),
  'matrislogik-prov': (id) => selectProvQuestionsForSession(id),
};

export function arMatrisSlug(slug: string): slug is MatrisSlug {
  return slug in URVAL;
}

/**
 * Sessionens test_type till slug. Grund lagras med kolumnens default
 * 'matrislogik'.
 */
export function slugForTestType(testType: string | null | undefined): MatrisSlug {
  switch (testType) {
    case 'matrislogik-avancerad':
      return 'matrislogik-avancerad';
    case 'matrislogik-expert':
      return 'matrislogik-expert';
    case 'matrislogik-prov':
      return 'matrislogik-prov';
    default:
      return 'matrislogik-grund';
  }
}

/** Testets frågor så som klienten ska visa dem. */
export function visadeFragor(
  slug: MatrisSlug,
  sessionId: string,
  blandade: boolean
): VisadFraga[] {
  return URVAL[slug](sessionId).map((q) => visaFraga(q, sessionId, blandade));
}

/** Genomgångens frågor. Anropas bara för avslutade sessioner. */
export function genomgangsFragor(
  slug: MatrisSlug,
  sessionId: string,
  blandade: boolean
): GenomgangsFraga[] {
  return URVAL[slug](sessionId).map((q) => genomgaFraga(q, sessionId, blandade));
}

/**
 * Allt klienten behöver om en sessionsrad: frågorna i visad ordning, och
 * genomgången (med rätt svar) först när testet är avslutat.
 */
export function matrisInnehall(session: {
  id: string;
  test_type?: string | null;
  meta?: unknown;
  completed_at?: string | null;
}): { fragor: VisadFraga[]; genomgang: GenomgangsFraga[] | null } {
  const slug = slugForTestType(session.test_type);
  const blandade = arBlandad(session.meta);
  return {
    fragor: visadeFragor(slug, session.id, blandade),
    genomgang: session.completed_at ? genomgangsFragor(slug, session.id, blandade) : null,
  };
}

/* ------------------------------ Rättningen ------------------------------ */

type BankFraga = { id: string; correctAnswer: number; options: unknown[] };

const V5 = questionBankV5 as unknown as BankFraga[];
const G = GRUND_POOL as unknown as BankFraga[];
const A = AVANCERAD_POOL as unknown as BankFraga[];
const E = EXPERT_POOL as unknown as BankFraga[];
// Våg 3c: nya frågor rättas i samma rutter som sin nivå, så att passen kan
// dra dem utan att rättningen behöver byggas om.
const G3 = GRUND_3C as unknown as BankFraga[];
const A3 = AVANCERAD_3C as unknown as BankFraga[];
const E3 = EXPERT_3C as unknown as BankFraga[];

/**
 * Bankerna varje svar-rutt slår upp facit i. V5 ligger kvar för sessioner
 * som startades innan V7 (de visas inte längre, men kan rättas).
 */
export const BANK_FOR_RUTT = {
  /** /api/logicTestV4/answer: grund och expert (plus V5). */
  v4: [...V5, ...G, ...E, ...G3, ...E3],
  /** /api/logicTestV6/answer: avancerad. */
  v6: [...A, ...A3],
  /** /api/logicTestProv/answer: alla nivåer. */
  prov: [...V5, ...G, ...A, ...E, ...G3, ...A3, ...E3],
} as const;

export function hittaFraga(
  bank: readonly BankFraga[],
  questionId: string
): BankFraga | undefined {
  return bank.find((q) => q.id === questionId);
}

export interface BedomtSvar {
  /** Originalindex i banken. Det som lagras och rättas. */
  selected: number;
  /** Positionen hon klickade på. */
  visat: number;
  correct: boolean;
}

/**
 * Dömer ett svar. `visat` är positionen klienten skickade; servern räknar
 * om till originalindex med sessionens permutation och jämför mot facit.
 * Null när indexet inte finns bland alternativen.
 */
export function bedomSvar(
  q: BankFraga,
  sessionId: string,
  blandade: boolean,
  visat: unknown
): BedomtSvar | null {
  if (typeof visat !== 'number' || !Number.isInteger(visat)) return null;
  const perm = permutationForSession(sessionId, q, blandade);
  const selected = tillOriginal(perm, visat);
  if (selected < 0) return null;
  return { selected, visat, correct: selected === q.correctAnswer };
}

const FACIT = new Map(BANK_FOR_RUTT.prov.map((q) => [q.id, q.correctAnswer]));

/**
 * Poängen för en matrissession: antal svar vars originalindex (`selected`)
 * är frågans facit. Räknas om mot banken i stället för att lita på svarets
 * `correct`, så att poängen bara beror på vad hon valde. Anroparen skickar
 * redan unika svar (unikaSvar i src/lib/tests/sparaSvar.ts).
 */
export function rattaMatrisSvar(answers: readonly unknown[]): number {
  let ratt = 0;
  for (const rad of answers) {
    const a = (rad ?? {}) as { q_id?: unknown; selected?: unknown };
    if (typeof a.q_id !== 'string' || typeof a.selected !== 'number') continue;
    const facit = FACIT.get(a.q_id);
    if (facit !== undefined && facit === a.selected) ratt++;
  }
  return ratt;
}

/* ---------------------------- Nya sessioner ---------------------------- */

/** PostgREST/Postgres-koderna för en kolumn som inte finns. */
function saknarKolumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    /\bmeta\b/.test(error.message ?? '')
  );
}

/**
 * Skapar en rad med meta.alternativ_blandade satt. Finns inte kolumnen
 * (migreringen 20261010200000_alternativ_blandade ännu inte körd) skapas raden
 * utan flaggan, och testet beter sig som före fixen i stället för att falla.
 */
export async function skapaMedBlandning<T = Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: SupabaseClient<any>,
  table: string,
  row: Record<string, unknown>,
  select = '*'
): Promise<{ data: T | null; error: { code?: string; message?: string } | null }> {
  const forsta = await client
    .from(table)
    .insert({ ...row, meta: BLANDAD_META })
    .select(select)
    .single();
  if (!forsta.error || !saknarKolumn(forsta.error)) {
    return { data: forsta.data as T | null, error: forsta.error };
  }
  console.error(
    `[blandning] ${table}.meta saknas, sessionen skapas oblandad. Kör migreringen alternativ_blandade.`
  );
  const utanMeta = select
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c !== 'meta')
    .join(', ');
  const andra = await client.from(table).insert(row).select(utanMeta).single();
  return { data: andra.data as T | null, error: andra.error };
}
