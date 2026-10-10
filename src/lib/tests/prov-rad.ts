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
import type { GenomgangsFraga } from '@/lib/logicTestV7/layered.v7'
import { permutationForSession, tillVisat } from '@/lib/logicTestV7/blanda'
import { genomgaFraga } from '@/lib/logicTestV7/visning'
import { questionsForToken } from './anon-session'

export interface ProvRad {
  token: string
  answers: number[] | null
  score: number | null
  claimed_by: string | null
  created_at: string
  /** Null när raden är hämtad till ett konto: då är den permanent. */
  expires_at: string | null
  /** meta.alternativ_blandade. Saknas på rader från före blandningen. */
  meta?: unknown
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

// '*' så att raden går att läsa både före och efter migreringen som lägger
// till meta (alternativ_blandade).
const KOLUMNER = '*'

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
  /** Originalindex i banken. */
  selected: number
  /** Positionen hon klickade på i provet. */
  visat: number
  correct: boolean
  time_spent: number
}

export interface ProvGenomgang {
  fragor: GenomgangsFraga[]
  svar: ProvSvar[]
  ratt: number
  totalt: number
}

/**
 * Frågorna ur token (samma urval som provet visade) och svaren i den form
 * MatrixQuestionReview läser. Obesvarade frågor (-1) får inget svar och
 * visas som hoppade. Rättningen görs om här mot facit i frågebanken.
 *
 * `answers` är originalindex (så lagrar test-session-routen dem). Frågorna
 * ritas i provets visade ordning, seedad på token + frågans id när raden har
 * meta.alternativ_blandade, annars i bankens ordning som förut.
 */
export function provGenomgang(
  token: string,
  answers: readonly number[],
  blandade = false
): ProvGenomgang {
  const bank = questionsForToken(token)
  const svar: ProvSvar[] = []
  let ratt = 0
  bank.forEach((q, i) => {
    const valt = answers[i]
    if (typeof valt !== 'number' || !Number.isInteger(valt) || valt < 0 || valt >= q.options.length) return
    const correct = valt === q.correctAnswer
    if (correct) ratt += 1
    const visat = tillVisat(permutationForSession(token, q, blandade), valt)
    svar.push({ q_id: q.id, selected: valt, visat, correct, time_spent: 0 })
  })
  const fragor = bank.map((q) => genomgaFraga(q, token, blandade))
  return { fragor, svar, ratt, totalt: fragor.length }
}

/** Resultatsidan för ett hämtat logiktestprov. */
export const provResultatHref = (token: string) => `/dashboard/tester/prov/${token}`
