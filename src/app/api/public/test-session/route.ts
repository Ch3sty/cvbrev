/**
 * Anonym testsession (docs/plan-konvertering.md, C9).
 *
 * POST utan body startar en session: fem slumpade matrislogikfrågor utan
 * facit. POST med { token, answers } rättar den och returnerar resultatet.
 *
 * Vad som lämnar servern före registrering: antal rätt och en grov percentil.
 * Vilka frågor som var fel, förklaringarna och normjämförelsen gör det inte.
 */

import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { checkIpRateLimit, getClientIp, hashIp } from '@/lib/rate-limit/ip'
import {
  ANON_QUESTION_COUNT,
  getAnonSession,
  questionsForToken,
  roughPercentile,
  toPublicQuestion,
} from '@/lib/tests/anon-session'

/** Tre provsessioner per IP och dygn. */
const IP_LIMIT = 3
const SCOPE = 'anon_test'

export async function POST(request: Request) {
  let body: { token?: unknown; answers?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    // Tom body betyder "starta en ny session".
  }

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>

  const token = typeof body.token === 'string' ? body.token.trim() : undefined
  const hasAnswers = Array.isArray(body.answers)

  // ---- Rätta en pågående session ----
  if (token && hasAnswers) {
    const session = await getAnonSession(admin, token)
    if (!session) {
      return NextResponse.json(
        { error: 'Sessionen finns inte längre eller har gått ut.' },
        { status: 404 }
      )
    }

    const questions = questionsForToken(token)
    const answers = (body.answers as unknown[])
      .slice(0, questions.length)
      .map((a) => (typeof a === 'number' && Number.isInteger(a) ? a : -1))

    let score = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score += 1
    })

    await admin
      .from('anon_test_sessions')
      .update({ answers, score })
      .eq('token', token)

    return NextResponse.json({
      score,
      total: questions.length,
      percentile: roughPercentile(score, questions.length),
      // Inga per-fråga-resultat här: de är låsta tills kontot finns.
    })
  }

  // ---- Starta en ny session ----
  const ip = getClientIp(request)
  const rate = await checkIpRateLimit(admin, ip, SCOPE, IP_LIMIT)
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message:
          'Du har gjort tre prov idag. Skapa ett gratiskonto så tränar du vidare direkt.',
        registerHref: '/register',
        resetAt: rate.resetAt,
      },
      { status: 429 }
    )
  }

  const { data, error } = await admin
    .from('anon_test_sessions')
    .insert({ questions: [], ip_hash: hashIp(ip) })
    .select('token, expires_at')
    .single()

  if (error || !data) {
    console.error('[anon-test] Kunde inte skapa session:', error)
    return NextResponse.json(
      { error: 'Kunde inte starta provet just nu. Försök igen om en stund.' },
      { status: 500 }
    )
  }

  const row = data as { token: string; expires_at: string }

  // Frågorna härleds deterministiskt ur token, så vi sparar bara id:na
  // för spårbarhet. Facit ligger kvar i frågebanken på servern.
  const questions = questionsForToken(row.token)
  await admin
    .from('anon_test_sessions')
    .update({ questions: questions.map((q) => q.id) })
    .eq('token', row.token)

  return NextResponse.json({
    token: row.token,
    questions: questions.map(toPublicQuestion),
    total: ANON_QUESTION_COUNT,
    expiresAt: row.expires_at,
  })
}
