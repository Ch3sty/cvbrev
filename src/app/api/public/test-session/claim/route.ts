/**
 * POST /api/public/test-session/claim
 *
 * Kopplar en anonym provsession till det nyss skapade kontot
 * (docs/plan-konvertering.md, C9). Först här får användaren se vilka frågor
 * som var fel och läsa förklaringarna.
 *
 * Vi loggar resultatet som en aktivitet så det syns i dashboarden, men vi
 * skapar ingen test_sessions-rad: provet är fem frågor, inte ett helt test,
 * och ska inte förorena percentilstatistiken.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAnonSession, questionsForToken, roughPercentile } from '@/lib/tests/anon-session'
import { logActivityServer } from '@/lib/activation-tracking'

export async function POST(request: Request) {
  let token: string | undefined
  try {
    const body = await request.json()
    token = typeof body?.token === 'string' ? body.token.trim() : undefined
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }

  if (!token) {
    return NextResponse.json({ error: 'Token saknas' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
  }

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const session = await getAnonSession(admin, token)

  if (!session) {
    return NextResponse.json(
      { error: 'Provet finns inte längre eller har gått ut.' },
      { status: 404 }
    )
  }

  const questions = questionsForToken(token)
  const answers = Array.isArray(session.answers) ? session.answers : []
  const score = session.score ?? 0

  // Idempotent: loggningen får köras om utan att skapa dubbletter av värde,
  // och själva svaret beror bara på sessionen.
  try {
    await logActivityServer(
      user.id,
      'test_completed',
      'Gjorde provet utan konto',
      {
        slug: 'matrislogik-prova',
        score,
        total: questions.length,
        anonymous_origin: true,
      }
    )
  } catch (err) {
    console.error('[test-session/claim] Kunde inte logga aktivitet:', err)
  }

  return NextResponse.json({
    redirect: '/dashboard/tester',
    score,
    total: questions.length,
    percentile: roughPercentile(score, questions.length),
    // Nu är det fritt fram: facit och förklaringar följer med.
    review: questions.map((q, i) => ({
      id: q.id,
      title: q.title,
      rule: q.rule,
      correctAnswer: q.correctAnswer,
      yourAnswer: answers[i] ?? -1,
      correct: answers[i] === q.correctAnswer,
    })),
  })
}
