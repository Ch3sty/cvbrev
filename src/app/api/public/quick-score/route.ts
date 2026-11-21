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
import { parseCV, cleanExtractedText, ImageBasedPdfError } from '@/lib/cv-parser'
import { analyzeCvBasic } from '@/lib/openai/cv-analysis'
import { parseCV as parseCVStructure } from '@/lib/cv/cv-parser'
import { poangForRad } from '@/lib/cv/poang'

export const maxDuration = 30

/** Tre analyser per IP och dygn. */
const IP_LIMIT = 3
/** Globalt tak per dygn, samma nivå som brevutkasten. */
const DAILY_BUDGET = 100
const SCOPE = 'quick_score'

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MIN_TEXT_LENGTH = 200

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt']

/** Felkoden när PDF:en är sparad som bild (samma kod som uppladdningen i kontot). */
const BILD_PDF_KOD = 'IMAGE_BASED_PDF'
/** Registreringen med valet CV, som efter kontot landar i CV-starten med uppladdningen. */
const BILD_PDF_REGISTER = '/register?borja=cv'
const BILD_PDF_TEXT =
  'Ditt CV är sparat som bild, så vi kan inte läsa texten här. Skapa ett gratiskonto så läser vi av den, det tar ungefär en halv minut. Har du CV:t som Word-fil kan du ladda upp den här i stället.'

/** 422 för en inskannad PDF: kontot läser av bilden, publikt gör vi det inte. */
function bildPdfSvar() {
  return NextResponse.json(
    { error: BILD_PDF_KOD, code: BILD_PDF_KOD, message: BILD_PDF_TEXT, registerHref: BILD_PDF_REGISTER },
    { status: 422 }
  )
}

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
    let rawText: string
    try {
      rawText = await parseCV(file)
    } catch (err) {
      // En inskannad PDF läses inte här (ingen bildläsning publikt). Förut
      // blev den ett 500 och ett nytt försök lyckades aldrig.
      if (err instanceof ImageBasedPdfError) return bildPdfSvar()
      throw err
    }
    const cvText = cleanExtractedText(rawText)

    if (extension === 'pdf' && (!cvText || cvText.length < MIN_TEXT_LENGTH)) return bildPdfSvar()

    if (!cvText || cvText.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            'Vi kunde inte läsa tillräckligt med text ur filen. Är det en skannad PDF? Prova en textbaserad PDF eller en Word-fil.',
        },
        { status: 422 }
      )
    }

    // Poängen räknas med samma funktion som CV-analysen och den inloggade
    // snabbpoängen (docs/poangmodell-cv-analys.md), på CV:t strukturerat med
    // samma inläsning som uppladdningen. Texterna (sammanfattning och det
    // viktigaste att fixa) kommer från basanalysen; inga tal tas därifrån.
    // Strukturen lever bara i den här funktionen, precis som texten.
    // parseCV maskar själv (namn, kontakt, adresser, länkar) och läser
    // kontaktuppgifterna lokalt ur originalet, som poängen räknas på.
    const [analysis, struktur] = await Promise.all([analyzeCvBasic(cvText), parseCVStructure(cvText)])
    const score = poangForRad({ structured_data: struktur, cv_text: cvText })
    if (score === null) {
      return NextResponse.json(
        { error: 'Vi kunde inte läsa ut avsnitten ur filen. Prova en textbaserad PDF eller en Word-fil.' },
        { status: 422 }
      )
    }

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
