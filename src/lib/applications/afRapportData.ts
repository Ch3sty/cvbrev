// src/lib/applications/afRapportData.ts
// Månadsrapporten i Arbetsförmedlingens struktur (blankett Af 00331), läst på
// servern. Samma frågor och samma betalvägg som GET /api/applications/report
// hade inne i rutten; flyttade hit så att Sökta tjänsters serverladdare kan
// ge rapportvyn sin första data utan en klientrundtur. Rutten anropar samma
// funktion, så det finns en beskrivning av sanningen.
//
// Bara server (tar en Supabase-klient bunden till användarens session).

import type { SupabaseClient } from '@supabase/supabase-js'

export interface AfRapportRad {
  id: string
  job_title: string
  company: string
  location: string | null
  application_channel: string
  applied_at: string
  current_status: string | null
}

export interface AfRapportIntervju {
  occurred_at: string
  event_type: string
  interview_round: number | null
  job_title: string
  company: string
  location: string | null
}

export interface AfRapport {
  month: string
  advertised: AfRapportRad[]
  unsolicited: AfRapportRad[]
  interviews: AfRapportIntervju[]
  totals: { applications: number; advertised: number; unsolicited: number; interviews: number }
}

/** 'YYYY-MM' ur parametern, annars innevarande månad (serverns klocka, som förut). */
export function rapportManad(param: string | null | undefined, now: Date = new Date()): { year: number; month: number } {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split('-').map(Number)
    if (month >= 1 && month <= 12) return { year, month }
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

/**
 * Rapporten för en månad. `locked` utan Premium: antalen följer alltid med,
 * radlistorna utelämnas här på servern (aldrig en blur i klienten).
 * Kastar vid läsfel på ansökningarna, som rutten gjorde.
 */
export async function hamtaAfRapport(
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  manad: { year: number; month: number },
  harBetalt: boolean
): Promise<{ locked: boolean; data: AfRapport }> {
  const { year, month } = manad
  const mm = String(month).padStart(2, '0')
  const start = `${year}-${mm}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`

  const [appsRes, eventsRes] = await Promise.all([
    supabase
      .from('job_applications')
      .select('id, job_title, company, location, application_channel, applied_at, current_status')
      .eq('user_id', userId)
      .gte('applied_at', start)
      .lte('applied_at', end)
      .order('applied_at', { ascending: true }),
    supabase
      .from('job_application_events')
      .select('id, event_type, interview_round, occurred_at, job_applications!inner(job_title, company, location, user_id)')
      .eq('job_applications.user_id', userId)
      .in('event_type', ['interview_completed', 'trial_work_completed'])
      .gte('occurred_at', start)
      .lte('occurred_at', end)
      .order('occurred_at', { ascending: true }),
  ])

  if (appsRes.error) throw appsRes.error
  if (eventsRes.error) console.error('Rapport: kunde inte hämta intervjuer', eventsRes.error)

  const list = (appsRes.data ?? []) as AfRapportRad[]
  const advertised = list.filter((a) => a.application_channel === 'ad')
  const unsolicited = list.filter((a) => a.application_channel !== 'ad')
  const interviews: AfRapportIntervju[] = ((eventsRes.data ?? []) as any[]).map((event) => {
    const app = event.job_applications as { job_title: string; company: string; location: string | null } | null
    return {
      occurred_at: event.occurred_at,
      event_type: event.event_type,
      interview_round: event.interview_round,
      job_title: app?.job_title ?? '',
      company: app?.company ?? '',
      location: app?.location ?? null,
    }
  })

  const totals = {
    applications: list.length,
    advertised: advertised.length,
    unsolicited: unsolicited.length,
    interviews: interviews.length,
  }
  const monthKey = `${year}-${mm}`
  if (!harBetalt) {
    return { locked: true, data: { month: monthKey, advertised: [], unsolicited: [], interviews: [], totals } }
  }
  return { locked: false, data: { month: monthKey, advertised, unsolicited, interviews, totals } }
}
