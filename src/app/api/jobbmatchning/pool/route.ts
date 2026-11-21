/**
 * GET /api/jobbmatchning/pool: de 120 bästa annonserna ur senaste körningen,
 * hela, för klientens filter, "längre bort" och ändrad sökprofil i Matchade
 * jobb. Hämtas först när användaren ber om något av det; sidan själv skickar
 * bara listans rader. Vad som får visas avgörs som förut av /api/jobs/redact.
 * Svar: { jobs, adsRead, korningAt } eller 404 när ingen körning finns.
 */
import { NextResponse } from 'next/server'
import { hamtaPool } from '@/lib/jobmatching/sammanfattning.server'
import { underlag } from '../underlag'

export const dynamic = 'force-dynamic'

export async function GET() {
  const u = await underlag()
  if (u instanceof NextResponse) return u
  const pool = await hamtaPool(u.supabase, u.user.id, u.cv)
  if (!pool) return NextResponse.json({ error: 'Ingen körning', code: 'not_found' }, { status: 404 })
  return NextResponse.json({ success: true, ...pool })
}
