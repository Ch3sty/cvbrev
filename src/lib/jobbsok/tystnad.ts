/**
 * Tystnaden för en sökt tjänst, för läsare utanför vyerna (notisen i appen och
 * veckobrevet). Räknas med motorns regler (tjanstLage i lage.ts): senaste
 * aktivitet är senaste händelsens occurred_at eller senaste skickade
 * uppföljningens sent_at, aldrig status_updated_at (som triggern sätter även
 * när bara intervjutiden ändras). En loggad uppföljning flyttar alltså fram
 * nästa påminnelse till nastaPaminnelse(sent_at).
 *
 * Frågan som läser raderna bäddar in händelserna och uppföljningarna i samma
 * anrop (HISTORIK_SELECT), så ingen extra fråga och inget per rad.
 *
 * Klientsäker och ren.
 */
import { tjanstLage } from './lage'
import type { Dag, Handelse, JobApplication, TjanstMedHistorik, Uppfoljning, UppfoljningsTyp } from './typer'

/** Inbäddningen i en select mot job_applications: bara kolumnerna motorn läser. */
export const HISTORIK_SELECT =
  'job_application_events(id, event_type, occurred_at, created_at, interview_at, interview_place), job_application_followups(sent_at)'

type HandelseRad = Pick<Handelse, 'id' | 'event_type' | 'occurred_at' | 'created_at'> & {
  interview_at?: string | null
  interview_place?: string | null
}

/** En rad ur job_applications med HISTORIK_SELECT inbäddad. */
export interface RadMedHistorik {
  id?: string
  job_title: string
  company: string
  applied_at?: string | null
  current_status: JobApplication['current_status']
  status_updated_at: string | null
  created_at: string
  job_application_events?: HandelseRad[] | null
  job_application_followups?: Array<{ sent_at: Dag | null }> | null
}

export interface Tystnad {
  /** Tyst enligt motorn (foljUppTyp och tystGransFor: tolv dagar efter ansökan, sju efter intervju eller provjobb). */
  tyst: boolean
  /** Dagar sedan senaste aktivitet, svensk tid. */
  dagarTyst: number
  /** Dagen då tjänsten blir (eller blev) tyst: senaste aktivitet plus gränsen. */
  tystSedan: Dag
  /** Tjänstens foljUppTyp: 'ansokan', 'intervju', 'provjobb', eller null (kallad, erbjudande, avslutad). */
  typ: UppfoljningsTyp | null
  /** Intervjudagen (lage.intervju?.dag), null utanför intervjusteget. */
  momentDag: Dag | null
}

/** Har raden historiken inbäddad? Annars ska läsaren falla tillbaka till sitt gamla sätt. */
export function harHistorik(rad: RadMedHistorik): boolean {
  return Array.isArray(rad.job_application_events)
}

/** Tystnaden med motorns regler. Kräver att HISTORIK_SELECT är inbäddad. */
export function tystnadFor(rad: RadMedHistorik, nu: Date = new Date()): Tystnad {
  const { job_application_events, job_application_followups, ...ansokan } = rad
  const t: TjanstMedHistorik = {
    ansokan: { id: '', ...ansokan } as unknown as JobApplication,
    handelser: (job_application_events ?? []).map((h) => ({
      ...h,
      interview_at: h.interview_at ?? null,
      interview_place: h.interview_place ?? null,
    })) as Handelse[],
    // Bara skickade räknas (utkast har sent_at null); motorn läser sent_at och body.
    uppfoljningar: (job_application_followups ?? [])
      .filter((u) => !!u.sent_at)
      .map((u) => ({ sent_at: u.sent_at, body: null }) as unknown as Uppfoljning),
  }
  const lage = tjanstLage(t, nu)
  return {
    tyst: lage.tyst,
    dagarTyst: lage.dagarTyst,
    tystSedan: lage.tystSedan,
    typ: lage.foljUppTyp,
    momentDag: lage.intervju?.dag ?? null,
  }
}
