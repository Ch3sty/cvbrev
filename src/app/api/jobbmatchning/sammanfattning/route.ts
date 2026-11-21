/**
 * POST /api/jobbmatchning/sammanfattning: klienten skickar de bästa
 * annonserna direkt efter en sökning som gav träffar, så att Översikt,
 * sidomenyn och nästa sidladdning har dem även när match-jobs inte hann
 * spara körningen (tidsgränsen vid 3 MB jsonb, se byggnoterna).
 *
 * Servern räknar själv om de bästa med kontots aktiva CV och sökprofil;
 * klientens ordning litar vi inte på. Kropp: { jobs (högst 60), adsRead }.
 * Svar: { success, antal } eller { success: false } när tabellen saknas.
 */
import { NextResponse } from 'next/server'
import { bastaTraffar, prefsNyckel } from '@/lib/jobmatching/basta'
import { skrivSammanfattning } from '@/lib/jobmatching/sammanfattning.server'
import { underlag } from '../underlag'

export const dynamic = 'force-dynamic'

const MAX_JOBB = 60
const MAX_BYTE = 2_500_000

export async function POST(request: Request) {
  const u = await underlag()
  if (u instanceof NextResponse) return u
  if (!u.cv) return NextResponse.json({ error: 'Inget inläst CV', code: 'invalid_field' }, { status: 400 })
  const text = await request.text()
  if (text.length > MAX_BYTE) return NextResponse.json({ error: 'För stor', code: 'invalid_field' }, { status: 413 })
  let kropp: { jobs?: unknown; adsRead?: unknown }
  try {
    kropp = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Ogiltig kropp', code: 'invalid_field' }, { status: 400 })
  }
  const jobs = Array.isArray(kropp.jobs) ? (kropp.jobs as unknown[]).filter((j): j is Record<string, any> => !!j && typeof j === 'object' && 'id' in (j as object)).slice(0, MAX_JOBB) : []
  if (jobs.length === 0) return NextResponse.json({ error: 'Inga annonser', code: 'invalid_field' }, { status: 400 })
  const adsRead = typeof kropp.adsRead === 'number' && Number.isFinite(kropp.adsRead) ? Math.min(Math.max(0, kropp.adsRead), 5000) : jobs.length
  const ranked = bastaTraffar(jobs, u.cv, u.prefs)
  const ok = await skrivSammanfattning(u.user.id, { cvId: u.cv.cv_id, prefsNyckel: prefsNyckel(u.prefs, u.cv), korningAt: Date.now(), adsRead, ranked })
  return NextResponse.json({ success: ok, antal: ranked.length })
}
