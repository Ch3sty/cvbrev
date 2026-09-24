/**
 * POST /api/public/intervjuprov
 *
 * Intervjuprovet i artiklarna (docs/design/intervjuprov-spec-2026-09-23.md,
 * avsnitt 5). Besökaren skickar sitt svar på en intervjufråga och får en
 * kort bedömning: nivå, mening, det som fungerar och det som saknas.
 *
 * Hela återkopplingen och det omskrivna svaret sparas i
 * anon_interview_samples och lämnar aldrig servern här. De visas först på
 * /dashboard/intervju/[token] för den som gjort anspråk på raden.
 *
 * Kvoter: anonyma besökare ett prov per IP och dygn och 50 per dygn totalt
 * (ägarens beslut 2026-09-23, stramare än specens 3 och 100). Inloggade
 * räknas i quotaService: ett per dygn på gratisnivån, obegränsat med
 * interview_unlimited.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { checkDailyBudget, checkIpRateLimit, getClientIp, hashIp } from '@/lib/rate-limit/ip'
import { checkDailyInterviewQuota, quotaExceededBody } from '@/lib/quota/quotaService'
import { bedomIntervjusvar } from '@/lib/intervju/bedomning'
import { kontrolleraSvarslangd, omskrivetRader } from '@/lib/intervju/validering'
import { trackAIUsage } from '@/lib/ai-cost-tracker'
import { FRAGOR, arFragaId } from '@/components/artiklar/intervjuprov/fragor'
import { TRANINGSPAKET_HREF, provHref } from '@/lib/intervju/lankar'
import { markeraBricka } from '@/lib/onboarding/komigang-server'
import { COPY, MAX_TECKEN, MIN_TECKEN } from '@/components/artiklar/intervjuprov/intervjuprov-copy'

export const maxDuration = 30

/** Ett prov per IP och dygn för besökare utan konto. */
const IP_LIMIT = 1
/** Globalt tak per dygn för besökare utan konto. */
const DAILY_BUDGET = 50
const SCOPE = 'anon_interview'

export async function POST(request: Request) {
  let body: { question?: unknown; answer?: unknown; slug?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // 1. Validering. Klienten stoppar redan för korta svar, men servern litar
  // aldrig på det och klipper aldrig tyst.
  const question = body.question
  if (!arFragaId(question)) {
    return NextResponse.json({ error: 'bad_question' }, { status: 400 })
  }
  const publik = FRAGOR[question].publik
  const answer = typeof body.answer === 'string' ? body.answer.trim() : ''
  const langdFel = kontrolleraSvarslangd(answer, MIN_TECKEN, MAX_TECKEN)
  if (langdFel === 'too_short') {
    return NextResponse.json({ error: 'too_short' }, { status: 400 })
  }
  if (langdFel === 'too_long') {
    return NextResponse.json({ error: 'too_long', message: COPY.fel.langt }, { status: 400 })
  }
  const slug = typeof body.slug === 'string' ? body.slug.slice(0, 120) : null

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const ip = getClientIp(request)

  // 2. Kvot. Inloggad användare räknas mot kontot, anonym mot IP och dygnstak.
  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fem av sju frågor finns bara inloggad (docs/design/rod-trad-prov-spec-2026-09-24.md).
  // Kontrollen står före IP-spärren så att ett avvisat anrop aldrig räknas som ett prov.
  if (!user && !publik) {
    return NextResponse.json(
      { error: 'question_not_public', message: COPY.kvot.intePublik, registerHref: '/register' },
      { status: 400 }
    )
  }

  if (user) {
    // Admin-klienten: tabellen har RLS utan policies (se checkDailyInterviewQuota).
    const quota = await checkDailyInterviewQuota(admin, user.id)
    if (!quota.allowed) {
      return NextResponse.json(
        {
          ...quotaExceededBody('interview_sample', quota, COPY.kvot.inloggad),
          // Köpsteget med Träningspaketet förvalt (beslut 7, 2026-09-24).
          upgradeHref: TRANINGSPAKET_HREF,
        },
        { status: 429 }
      )
    }
  } else {
    // IP-spärren räknar upp vid kontrollen, så ett irrelevant svar räknas som
    // ett prov. Avsiktligt (beslut 9): annars går gränsen att testa gratis.
    const rate = await checkIpRateLimit(admin, ip, SCOPE, IP_LIMIT)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', message: COPY.kvot.ip, registerHref: '/register', resetAt: rate.resetAt },
        { status: 429 }
      )
    }
    const budget = await checkDailyBudget(admin, SCOPE, DAILY_BUDGET)
    if (!budget.allowed) {
      return NextResponse.json(
        { error: 'budget_exceeded', message: COPY.kvot.budget, registerHref: '/register' },
        { status: 503 }
      )
    }
  }

  // 3. Bedömningen.
  let resultat: Awaited<ReturnType<typeof bedomIntervjusvar>>
  try {
    resultat = await bedomIntervjusvar(question, answer)
  } catch (err) {
    console.error('[intervjuprov] Bedömningen misslyckades:', err)
    return NextResponse.json(
      { error: 'assessment_failed', message: COPY.fel.server.text },
      { status: 500 }
    )
  }

  // Kostnaden: inloggade i ai_usage_costs som övriga funktioner. Tabellen
  // kräver user_id, så anonyma anrop loggas i funktionsloggen i stället.
  if (user) {
    void trackAIUsage({
      supabase: admin,
      userId: user.id,
      featureName: 'interview_sample',
      endpoint: '/api/public/intervjuprov',
      model: resultat.model,
      promptTokens: resultat.promptTokens,
      completionTokens: resultat.completionTokens,
      costUsd: resultat.costUsd ?? 0,
      generationTimeMs: resultat.ms,
      metadata: { question, slug, relevant: resultat.svar.relevant },
    })
  } else {
    console.info(
      `[intervjuprov] anonym bedömning ${resultat.model} ${resultat.promptTokens}/${resultat.completionTokens} tokens $${(resultat.costUsd ?? 0).toFixed(5)} ${resultat.ms} ms`
    )
  }

  // 4. Inte ett svar på frågan. För anonyma sparas ingen rad: IP-spärren har
  // redan räknat försöket. Inloggades kvot räknas ur tabellen, så för dem
  // sparas en rad markerad irrelevant (beslut 9: irrelevant text räknas mot
  // kvoten). Den visas aldrig: dashboardsidan ger 404 på den.
  if (!resultat.svar.relevant) {
    if (user) {
      const { error: irrelevantFel } = await admin.from('anon_interview_samples').insert({
        question,
        answer,
        level: 1,
        summary: '',
        works: '',
        missing: '',
        missing_kind: 'exemplet',
        full: { points: [], irrelevant: true },
        improved_answer: '',
        ip_hash: hashIp(ip),
        user_id: user.id,
        claimed_by: user.id,
      })
      if (irrelevantFel) console.error('[intervjuprov] Kunde inte räkna irrelevant försök:', irrelevantFel)
    }
    return NextResponse.json(
      { error: 'irrelevant', message: COPY.fel.irrelevant.text },
      { status: 422 }
    )
  }

  const b = resultat.svar

  // 5. Spara. En inloggad användare äger raden direkt, så hela
  // återkopplingen går att öppna utan omväg via claim.
  const { data, error } = await admin
    .from('anon_interview_samples')
    .insert({
      question,
      answer,
      level: b.level,
      summary: b.summary,
      works: b.works,
      missing: b.missing,
      missing_kind: b.missingKind,
      full: b.full,
      improved_answer: b.improvedAnswer,
      improved_why: b.improvedWhy || null,
      ip_hash: hashIp(ip),
      user_id: user?.id ?? null,
      claimed_by: user?.id ?? null,
      // Inloggad: raden ägs direkt och är permanent (beslut 2, 2026-09-24).
      ...(user ? { expires_at: null } : {}),
    })
    .select('token, expires_at')
    .single()

  if (error || !data) {
    console.error('[intervjuprov] Kunde inte spara svaret:', error)
    return NextResponse.json(
      { error: 'assessment_failed', message: COPY.fel.server.text },
      { status: 500 }
    )
  }

  const row = data as { token: string; expires_at: string | null }

  // Kom igång: brickan Intervjuprovet kvitteras när en inloggad rad sparas.
  if (user) void markeraBricka(user.id, 'intervjuprov')

  // 6. Det synliga svaret. Inget ur full, improvedAnswer eller improvedWhy.
  return NextResponse.json({
    token: row.token,
    level: b.level,
    levelLabel: b.levelLabel,
    summary: b.summary,
    works: b.works,
    missing: b.missing,
    lockedPointCount: b.full.points.length,
    improvedLineCount: omskrivetRader(b.improvedAnswer),
    missingKind: b.missingKind,
    expiresAt: row.expires_at,
    ...(user ? { href: provHref(row.token) } : {}),
  })
}
