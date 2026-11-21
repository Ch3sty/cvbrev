/**
 * Gemensamt för /api/jobbmatchning/*: sessionen, det aktiva CV:t och
 * sökprofilen, i en läsning. Bara server.
 */
import 'server-only'
import { toJobPreferences, type JobPreferences } from '@/types/user.types'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import { krav, type Session } from '@/lib/jobbsok/rutt'
import { NextResponse } from 'next/server'

export interface Underlag extends Session {
  cv: ActiveCVData | null
  prefs: JobPreferences
}

export async function underlag(): Promise<Underlag | NextResponse> {
  const s = await krav()
  if (s instanceof NextResponse) return s
  const [cvRes, profilRes] = await Promise.all([
    s.supabase.from('active_cv_for_matching').select('*').eq('user_id', s.user.id).maybeSingle(),
    s.supabase.from('profiles').select('job_preferences').eq('id', s.user.id).maybeSingle(),
  ])
  return {
    ...s,
    cv: (cvRes.data ?? null) as ActiveCVData | null,
    prefs: toJobPreferences((profilRes.data as { job_preferences?: unknown } | null)?.job_preferences),
  }
}
