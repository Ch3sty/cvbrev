/**
 * "Skriv brevet" från en rad under Ska sökas (Att göra nu: Sök före sista
 * dag). En sparad träff (af_ad_id) som fortfarande finns bland de bästa går
 * till Matchade jobb med ?skriv=1, där hela annonstexten finns. Annars (en
 * egen rad, eller en träff som fallit ur listan) fylls Skriv brev i med det
 * som finns (tjänst, arbetsgivare, ort, länk), genom samma förifyllning som
 * Matchade jobb använder (coverLetterPrefill).
 *
 * ?id=<job_saved_ads.id>. Raden läses med sessionen (ägarens läspolicy).
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { SKRIV_BREV_HREF } from '@/lib/letters/lage'
import { jobbHref, SOKTA_HREF } from '@/lib/jobbsok'
import TillSkrivBrev from '@/components/jobb3/sokta/TillSkrivBrev'
import { hamtaBasta } from '@/lib/jobmatching/sammanfattning.server'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import { toJobPreferences } from '@/types/user.types'

export const dynamic = 'force-dynamic'

export default async function SkrivBrevFranSparad({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  const { id } = await searchParams
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) redirect(SKRIV_BREV_HREF)

  const supabase = createServerClient({ cookies: await cookies() })
  const { data } = await supabase
    .from('job_saved_ads')
    .select('job_title, company, location, job_ad_url, af_ad_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()
  const rad = data as { job_title: string; company: string; location: string | null; job_ad_url: string | null; af_ad_id: string | null } | null
  if (!rad) redirect(SOKTA_HREF)
  // En sparad träff som fortfarande finns bland de bästa: Matchade jobb har hela annonstexten.
  if (rad.af_ad_id) {
    const [cvRes, profilRes] = await Promise.all([
      supabase.from('active_cv_for_matching').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('job_preferences').eq('id', user.id).maybeSingle(),
    ])
    const basta = await hamtaBasta(
      supabase as never,
      user.id,
      (cvRes.data ?? null) as ActiveCVData | null,
      toJobPreferences((profilRes.data as { job_preferences?: unknown } | null)?.job_preferences)
    ).catch(() => null)
    if (basta?.ranked.some((r) => String(r.job.id ?? '') === rad.af_ad_id)) redirect(`${jobbHref(rad.af_ad_id)}&skriv=1`)
  }

  const delar = [rad.job_title, `Arbetsgivare: ${rad.company}`]
  if (rad.location) delar.push(`Ort: ${rad.location}`)
  if (rad.job_ad_url) delar.push(`Annonsen: ${rad.job_ad_url}`)
  return (
    <TillSkrivBrev
      prefill={{ cvId: '', jobTitle: rad.job_title, company: rad.company, jobDescription: delar.join('\n\n'), jobAdUrl: rad.job_ad_url ?? undefined }}
      href={SKRIV_BREV_HREF}
    />
  )
}
