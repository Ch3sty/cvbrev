/**
 * Läsning och anspråk på logiktestprovets rader (anon_test_sessions), för
 * landningen efter registreringen (docs/qa/qa-slutflode-2026-09-24.md, K1).
 *
 * Samma mönster som src/lib/intervju/rad.ts och
 * src/lib/personlighet/smakprov-rad.ts: claim-rutten och resultatsidan gör
 * samma anspråk, så en registrering som inte går genom hämtkedjan landar
 * rätt ändå. En hämtad rad är permanent (expires_at null, ägarens beslut 2).
 *
 * Server: tabellen har RLS utan policies och läses bara med admin-klienten.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { LayeredQuestion } from '@/lib/logicTestV7/layered.v7'
import { questionsForToken } from './anon-session'

export interface ProvRad {
  token: string
  answers: number[] | null
  score: number | null
  claimed_by: string | null
  created_at: string
  /** Null när raden är hämtad till ett konto: då är den permanent. */
  expires_at: string | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function arProvToken(v: unknown): v is string {
  return typeof v === 'string' && UUID.test(v)
}

type Tillgangsrad = Pick<ProvRad, 'answers' | 'claimed_by' | 'expires_at'>

/**
 * Får den här användaren se provet (eller göra anspråk på det)? Ren funktion,
 * delas av sidan och proxyns 404-kontroll. Ett prov utan svar har inget att
 * visa och räknas som saknat.
 */
export function arProvTillgangligt(rad: Tillgangsrad, userId: string, nu: number = Date.now()): boolean {
  if (rad.expires_at !== null && new Date(rad.expires_at).getTime() <= nu) return false
  if (!Array.isArray(rad.answers)) return false
  if (rad.claimed_by) return rad.claimed_by === userId
  return true
}

const KOLUMNER = 'token, answers, score, claimed_by, created_at, expires_at'

/** Proxyns kontroll för /dashboard/tester/prov/[token]. */
export async function provFinns(admin: SupabaseClient<any>, token: string, userId: string): Promise<boolean> {
  if (!arProvToken(token)) return false
  const { data, error } = await admin
    .from('anon_test_sessions')
    .select('answers, claimed_by, expires_at')
    .eq('token', token)
    .maybeSingle()
  if (error || !data) return false
  return arProvTillgangligt(data as unknown as Tillgangsrad, userId)
}

/**
 * Provet för den här användaren, med anspråk om det är ohämtat. Null när det
 * inte finns, har gått ut, saknar svar eller tillhör någon annan.
 */
export async function hamtaEllerGorAnsprakProv(
  admin: SupabaseClient<any>,
  token: string,
  userId: string
): Promise<ProvRad | null> {
  if (!arProvToken(token)) return null

  const { data, error } = await admin.from('anon_test_sessions').select(KOLUMNER).eq('token', token).maybeSingle()
  if (error || !data) return null
  const rad = data as unknown as ProvRad

  if (!arProvTillgangligt(rad, userId)) return null
  if (rad.claimed_by === userId) return rad

  // Villkorad uppdatering: två samtidiga anspråk kan inte båda vinna.
  const { data: uppdaterad, error: uppdateringsFel } = await admin
    .from('anon_test_sessions')
    .update({ claimed_by: userId, claimed_at: new Date().toISOString(), expires_at: null })
    .eq('token', token)
    .is('claimed_by', null)
    .select('token')
    .maybeSingle()

  if (uppdateringsFel || !uppdaterad) return null
  return { ...rad, claimed_by: userId, expires_at: null }
}

/** Ett sparat svar i samma form som testernas genomgång läser. */
export interface ProvSvar {
  q_id: string
  selected: number
  correct: boolean
  time_spent: number
}

export interface ProvGenomgang {
  fragor: LayeredQuestion[]
  svar: ProvSvar[]
  ratt: number
  totalt: number
}

/**
 * Frågorna ur token (samma urval som provet visade) och svaren i den form
 * MatrixQuestionReview läser. Obesvarade frågor (-1) får inget svar och
 * visas som hoppade. Rättningen görs om här mot facit i frågebanken.
 */
export function provGenomgang(token: string, answers: readonly number[]): ProvGenomgang {
  const fragor = questionsForToken(token)
  const svar: ProvSvar[] = []
  let ratt = 0
  fragor.forEach((q, i) => {
    const valt = answers[i]
    if (typeof valt !== 'number' || !Number.isInteger(valt) || valt < 0 || valt >= q.options.length) return
    const correct = valt === q.correctAnswer
    if (correct) ratt += 1
    svar.push({ q_id: q.id, selected: valt, correct, time_spent: 0 })
  })
  return { fragor, svar, ratt, totalt: fragor.length }
}

/** Resultatsidan för ett hämtat logiktestprov. */
export const provResultatHref = (token: string) => `/dashboard/tester/prov/${token}`
