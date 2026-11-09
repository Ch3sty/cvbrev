/**
 * Anonym testsession för /verktyg/rekryteringstester/prova
 * (docs/plan-konvertering.md, C9).
 *
 * Återanvänder det befintliga V7-urvalet, så frågorna är exakt samma som i
 * det inloggade grundtestet. Vi lagrar aldrig facit eller förklaringar i
 * klienten: rättningen sker på servern och de låsta delarna lämnar den inte
 * förrän någon registrerat sig.
 *
 * Alternativen blandas som i de inloggade testen (src/lib/logicTestV7/blanda.ts),
 * seedat på token + frågans id, för sessioner med meta.alternativ_blandade.
 * Klienten skickar visade positioner; servern räknar om till originalindex,
 * som lagras i answers och rättas mot facit.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { selectQuestionsForSession, type BankVersion } from '@/lib/logicTestV7/selectQuestions.v7'
import type { LayeredCell, LayeredQuestion } from '@/lib/logicTestV7/layered.v7'
import { permutationForSession, tillOriginal } from '@/lib/logicTestV7/blanda'

/** Fem frågor i provet, enligt planen. */
export const ANON_QUESTION_COUNT = 5

/**
 * Frågan så som den får se ut i klienten: utan correctAnswer, regeltext och
 * titel. Regeln och titeln ("Pricken hoppar tre steg") beskriver mönstret och
 * är i praktiken svaret, så de hör till genomgången som öppnas med kontot
 * (provGenomgang), aldrig till frågan.
 */
export interface PublicQuestion {
  id: string
  grid: (LayeredCell | null)[][]
  options: LayeredCell[]
}

/**
 * Plockar bort facit, regeln och titeln innan frågan skickas till webbläsaren, och
 * lägger alternativen i den ordning provet visar dem.
 */
export function toPublicQuestion(
  q: LayeredQuestion,
  token: string,
  blandade: boolean
): PublicQuestion {
  const perm = permutationForSession(token, q, blandade)
  return {
    id: q.id,
    grid: q.grid,
    options: perm.map((orig) => q.options[orig]),
  }
}

/**
 * Visade positioner från klienten till originalindex. Allt som inte är ett
 * giltigt alternativ blir -1 (obesvarad).
 */
export function tillOriginalSvar(
  questions: LayeredQuestion[],
  token: string,
  blandade: boolean,
  visade: unknown[]
): number[] {
  return questions.map((q, i) => {
    const v = visade[i]
    if (typeof v !== 'number' || !Number.isInteger(v)) return -1
    return tillOriginal(permutationForSession(token, q, blandade), v)
  })
}

/**
 * Fem frågor ur grundpoolen, seedade på sessionstoken. `version` ur radens
 * meta.bank_version (bankVersion): 1 drar ur de 28 frusna som förut, 2 ur
 * alla valbara grundfrågor, aldrig pensionerade (spec-rummen 15).
 */
export function questionsForToken(token: string, version: BankVersion = 1): LayeredQuestion[] {
  return selectQuestionsForSession(token, ANON_QUESTION_COUNT, version)
}

/**
 * Fröet för provets urval och alternativens ordning. Ett prov som startade
 * med uppgift 1 i en artikel (ArtikelProv) har artikelns fasta frö i
 * meta.urval_seed, så att uppgift 1 är den som stod i artikelns HTML. Alla
 * andra prov seedas på token som förut.
 */
export function provSeed(row: { token: string; meta?: unknown }): string {
  const s = (row.meta as { urval_seed?: unknown } | null | undefined)?.urval_seed
  return typeof s === 'string' && s.startsWith('artikel:') ? s : row.token
}

/** Artikelns fasta frö för matrisens prov: samma för alla besökare av artikeln. */
export function artikelSeedMatris(slug: string): string {
  return `artikel:matris:${slug}`
}

/**
 * Index (0 till 4) för frågorna som blev fel eller lämnades obesvarade, i
 * provets ordning. `answers` är originalindex, som routen lagrar dem. Bara
 * positionerna lämnar servern, aldrig vilket alternativ som var rätt.
 */
export function felIndex(questions: readonly LayeredQuestion[], answers: readonly unknown[]): number[] {
  const fel: number[] = []
  questions.forEach((q, i) => {
    if (answers[i] !== q.correctAnswer) fel.push(i)
  })
  return fel
}

export interface AnonSessionRow {
  token: string
  questions: unknown
  answers: number[] | null
  score: number | null
  claimed_by: string | null
  /** Null när provet är hämtat till ett konto (src/lib/tests/prov-rad.ts). */
  expires_at: string | null
  /** meta.alternativ_blandade. Saknas på rader från före blandningen. */
  meta?: unknown
}

/** Hämtar en session om den finns och inte gått ut. */
export async function getAnonSession(
  admin: SupabaseClient<any>,
  token: string
): Promise<AnonSessionRow | null> {
  const { data, error } = await admin
    .from('anon_test_sessions')
    // '*' så att raden går att läsa både före och efter migreringen som
    // lägger till meta.
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (error || !data) return null

  const row = data as unknown as AnonSessionRow
  if (row.expires_at !== null && new Date(row.expires_at).getTime() < Date.now()) return null

  return row
}

/** Städar bort utgångna sessioner. Spår D kan haka in den i cronen. */
export async function cleanupExpiredAnonSessions(
  admin: SupabaseClient<any>
): Promise<number> {
  try {
    const { data, error } = await admin
      .from('anon_test_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('token')

    if (error) {
      console.error('[anon-session] Kunde inte rensa utgångna sessioner:', error)
      return 0
    }
    return (data as unknown[] | null)?.length ?? 0
  } catch (err) {
    console.error('[anon-session] Rensning kraschade:', err)
    return 0
  }
}
