/**
 * GET /api/cv/forsta-traff?titel=&ort=
 *
 * Första jobbet som matchar CV:t, för finalen efter nedladdningen
 * (plan-mallar villkor b): räknas ur titel och ort medan filen skapas, eftersom
 * ett nytt konto saknar sparade jobbpreferenser. Samma källa som
 * jobbmatchningen (Arbetsförmedlingens öppna JobSearch-API), ett anrop med
 * en sekunds tak. Finns ingen träff svarar rutten { traff: null } och finalen
 * gör brevet till nästa steg.
 *
 * Kräver inloggning (finalen visas först när kontot finns).
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

interface Annons {
  id?: string
  headline?: string
  employer?: { name?: string }
  workplace_address?: { municipality?: string; city?: string }
  description?: { text?: string }
  webpage_url?: string
  application_details?: { url?: string }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const titel = (url.searchParams.get('titel') ?? '').trim().slice(0, 80)
  const ort = (url.searchParams.get('ort') ?? '').trim().slice(0, 60)
  if (titel.length < 2) return NextResponse.json({ traff: null })

  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ traff: null }, { status: 401 })

  const q = [titel, ort].filter(Boolean).join(' ')
  try {
    const r = await fetch(`https://jobsearch.api.jobtechdev.se/search?q=${encodeURIComponent(q)}&limit=1`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(1000),
      cache: 'no-store',
    })
    if (!r.ok) return NextResponse.json({ traff: null })
    const j = (await r.json()) as { hits?: Annons[] }
    const a = j.hits?.[0]
    if (!a?.headline) return NextResponse.json({ traff: null })
    return NextResponse.json({
      traff: {
        id: a.id ?? null,
        rubrik: a.headline,
        arbetsgivare: a.employer?.name ?? '',
        ort: a.workplace_address?.municipality ?? a.workplace_address?.city ?? '',
        url: a.webpage_url ?? a.application_details?.url ?? null,
        beskrivning: (a.description?.text ?? '').slice(0, 6000),
      },
    })
  } catch {
    return NextResponse.json({ traff: null })
  }
}
