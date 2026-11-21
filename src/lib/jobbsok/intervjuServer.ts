/**
 * Intervjuns tid på servern (F6): senaste kallelsen och skrivningen av
 * interview_at och interview_place. Händelserna skrivs med användarens
 * session, som dagens händelserutter (befintliga policyer gäller).
 *
 * Bara server.
 */
import 'server-only'
import { captureServer } from '@/lib/analytics/server'
import { dagFor, dagarMellan, idagSv, klockslag } from './datum'
import { senasteKallelse } from './lage'
import { arSchemaFel } from './schema'
import type { Klient } from './server'
import type { Intervjutid } from './validering'
import type { Handelse } from './typer'

export async function lasKallelse(supabase: Klient, applicationId: string): Promise<{ kallelse: Handelse | null; error: { code?: string } | null }> {
  const { data, error } = await supabase
    .from('job_application_events')
    .select('*')
    .eq('application_id', applicationId)
    .eq('event_type', 'interview_invited')
  return { kallelse: senasteKallelse((data ?? []) as Handelse[]), error }
}

export type IntervjuKalla = 'kallelse' | 'andra_tid' | 'flyttad' | 'intervju-hubb'

/**
 * Skriver tid och plats på en kallelse. Returnerar den uppdaterade raden,
 * 'saknas' när kolumnerna inte finns (migreringen ej körd), eller null vid fel.
 */
export async function skrivIntervjutid(
  supabase: Klient,
  userId: string,
  kallelse: Handelse,
  andring: Partial<Intervjutid>,
  kalla: IntervjuKalla
): Promise<Handelse | 'saknas' | null> {
  if (Object.keys(andring).length === 0) return kallelse
  const { data, error } = await supabase
    .from('job_application_events')
    .update(andring)
    .eq('id', kallelse.id)
    .eq('application_id', kallelse.application_id)
    .select()
    .single()
  if (error || !data) {
    if (arSchemaFel(error)) return 'saknas'
    console.error('[intervju] Kunde inte spara tiden:', error)
    return null
  }
  matIntervjutid(userId, kallelse, data as Handelse, kalla)
  return data as Handelse
}

/** intervjutid_satt: ny, ändrad eller borttagen. */
export function matIntervjutid(userId: string, fore: Pick<Handelse, 'interview_at'> | null, efter: Handelse, kalla: IntervjuKalla): void {
  const forut = fore?.interview_at ?? null
  const nu = efter.interview_at ?? null
  if (forut === nu && kalla !== 'kallelse') return
  if (!forut && !nu) return
  const dag = dagFor(nu)
  captureServer('intervjutid_satt', userId, {
    andring: !nu ? 'borttagen' : forut ? 'andrad' : 'ny',
    har_klockslag: klockslag(nu) !== null,
    har_plats: !!efter.interview_place,
    dagar_kvar: dag ? dagarMellan(idagSv(), dag) : null,
    kalla,
  })
}
