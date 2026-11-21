/**
 * GET /api/jobbmatchning/annons?id=<annons-id>: en annons ur de bästa
 * träffarna, i sin helhet, när användaren öppnar den i Matchade jobb.
 * Sidan skickar bara listans rader och den valda annonsen; resten hämtas här.
 *
 * Gratisnivån får bara de öppna annonserna (FREE_TIER_JOB_LIMIT), samma
 * regel och behörighet som /api/jobs/redact. Svar: { job } eller 404.
 */
import { NextResponse } from 'next/server'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { hamtaBasta } from '@/lib/jobmatching/sammanfattning.server'
import { underlag } from '../underlag'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const u = await underlag()
  if (u instanceof NextResponse) return u
  const id = new URL(request.url).searchParams.get('id')
  if (!id || id.length > 100) return NextResponse.json({ error: 'Annonsen saknas', code: 'invalid_field' }, { status: 400 })
  const [basta, premium] = await Promise.all([
    // Samma källa som sidan (läget 'hel'), så att de öppna annonserna är
    // desamma som listan visar. Sidan har skrivit sammanfattningen efter sitt
    // svar, så hela körningen läses här bara när den skrivningen föll.
    hamtaBasta(u.supabase, u.user.id, u.cv, u.prefs, 'hel'),
    userHasAccess(u.supabase, u.user.id, 'job_matches_all').catch(() => false),
  ])
  const tillatna = premium ? basta?.ranked ?? [] : (basta?.ranked ?? []).slice(0, FREE_TIER_JOB_LIMIT)
  const traff = tillatna.find((r) => String(r.job.id) === id)
  if (!traff) return NextResponse.json({ error: 'Annonsen finns inte i dina träffar', code: 'not_found' }, { status: 404 })
  return NextResponse.json({ success: true, job: traff.job })
}
