/**
 * POST /api/public/quick-score
 *
 * Mini-CV-analys utan konto (docs/plan-konvertering.md, C8). Tar emot en
 * PDF eller DOCX, extraherar texten i minnet, kör samma basanalys som den
 * inloggade quick-score och kastar bort allt utom resultatet.
 *
 * Ingenting lagras: varken filen, den extraherade texten eller analysen.
 * Rate-limit-tabellen ser bara en hashad IP, aldrig något om innehållet.
 */

import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { checkDailyBudget, checkIpRateLimit, getClientIp } from '@/lib/rate-limit/ip'
import { parseCV, cleanExtractedText } from '@/lib/cv-parser'
import { analyzeCvBasic } from '@/lib/openai/cv-analysis'

export const maxDuration = 30

/** Tre analyser per IP och dygn. */
const IP_LIMIT = 3
/** Globalt tak per dygn, samma nivå som brevutkasten. */
const DAILY_BUDGET = 100
const SCOPE = 'quick_score'

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MIN_TEXT_LENGTH = 200

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt']

export async function POST(request: Request) {
  let file: File | null = null

  try {
    const formData = await request.formData()
    const candidate = formData.get('file')
    if (candidate instanceof File) file = candidate
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: 'Ingen fil bifogad.' }, { status: 400 })
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: 'Filen är större än 5 MB. Ladda upp en mindre fil.' },
      { status: 400 }
    )
  }

  const extension = file.name.toLowerCase().split('.').pop() ?? ''
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return NextResponse.json(
      { error: 'Filformatet stöds inte. Ladda upp en PDF eller Word-fil.' },
      { status: 400 }
    )
  }

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const ip = getClientIp(request)

  const rate = await checkIpRateLimit(admin, ip, SCOPE, IP_LIMIT)
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message:
          'Du har analyserat tre CV idag. Skapa ett gratiskonto så fortsätter du direkt.',
        registerHref: '/register',
        resetAt: rate.resetAt,
      },
      { status: 429 }
    )
  }

  const budget = await checkDailyBudget(admin, SCOPE, DAILY_BUDGET)
  if (!budget.allowed) {
    return NextResponse.json(
      {
        error: 'budget_exceeded',
        message:
          'Vi har kört klart dagens analyser åt besökare utan konto. Skapa ett gratiskonto så kommer du igång direkt.',
        registerHref: '/register',
      },
      { status: 503 }
    )
  }

  try {
    // Texten lever bara i den här funktionens scope. Den skrivs aldrig till
    // disk, databas eller logg.
    const rawText = await parseCV(file)
    const cvText = cleanExtractedText(rawText)

    if (!cvText || cvText.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            'Vi kunde inte läsa tillräckligt med text ur filen. Är det en skannad PDF? Prova en textbaserad PDF eller en Word-fil.',
        },
        { status: 422 }
      )
    }

    const analysis = await analyzeCvBasic(cvText)

    // Samma härledning av 0-100 som i /api/cv/quick-score, så siffran
    // besökaren ser matchar den de får i produkten.
    const clarity = analysis.scores?.clarityAndStructure?.rating ?? 0
    const verbs = analysis.scores?.strongVerbs?.rating ?? 0
    const score = Math.round(((clarity + verbs) / 2 / 5) * 100)

    const improvements = (analysis.improvementAreas || []).slice(0, 3)

    return NextResponse.json({
      score,
      summary: analysis.summary,
      // Bara den första förbättringen i klartext. De andra två räknas men
      // skickas inte: de är vad kontot låser upp.
      visibleImprovement: improvements[0] ?? null,
      lockedImprovementCount: Math.max(0, improvements.length - 1),
    })
  } catch (err) {
    console.error('[public-quick-score] Analys misslyckades:', err)
    return NextResponse.json(
      { error: 'Kunde inte analysera filen just nu. Försök igen om en stund.' },
      { status: 500 }
    )
  }
}
