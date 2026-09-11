/**
 * POST /api/public/letter-draft
 *
 * Genererar ett brevutkast åt en besökare utan konto
 * (docs/plan-konvertering.md, C6). Två spärrar: tre utkast per IP och dygn,
 * och ett globalt dygnstak så en enskild dag inte kan springa iväg i kostnad.
 *
 * Svaret innehåller bara förhandsstycket. Resten av brevet lämnar servern
 * först när någon registrerat sig och gjort anspråk på utkastet.
 */

import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { checkDailyBudget, checkIpRateLimit, getClientIp, hashIp } from '@/lib/rate-limit/ip'
import { createPublicLetterDraft } from '@/lib/letters/public-draft'

/** Tre utkast per IP och dygn. */
const IP_LIMIT = 3
/** Globalt tak per dygn, enligt planen. */
const DAILY_BUDGET = 100
const SCOPE = 'letter_draft'

const MIN_EXPERIENCE_LENGTH = 200
const MAX_FIELD_LENGTH = 4000

export async function POST(request: Request) {
  let body: {
    role?: unknown
    employer?: unknown
    experience?: unknown
    jobAd?: unknown
    yrkeSlug?: unknown
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }

  const role = typeof body.role === 'string' ? body.role.trim() : ''
  const employer = typeof body.employer === 'string' ? body.employer.trim() : ''
  const experience = typeof body.experience === 'string' ? body.experience.trim() : ''
  const jobAd = typeof body.jobAd === 'string' ? body.jobAd.trim().slice(0, 8000) : undefined
  const yrkeSlug = typeof body.yrkeSlug === 'string' ? body.yrkeSlug.slice(0, 100) : undefined

  if (!role || !employer) {
    return NextResponse.json(
      { error: 'Fyll i både tjänst och arbetsgivare.' },
      { status: 400 }
    )
  }

  if (experience.length < MIN_EXPERIENCE_LENGTH) {
    return NextResponse.json(
      {
        error: `Beskriv din erfarenhet lite utförligare, minst ${MIN_EXPERIENCE_LENGTH} tecken.`,
      },
      { status: 400 }
    )
  }

  if (
    role.length > MAX_FIELD_LENGTH ||
    employer.length > MAX_FIELD_LENGTH ||
    experience.length > MAX_FIELD_LENGTH * 2
  ) {
    return NextResponse.json({ error: 'Texten är för lång.' }, { status: 400 })
  }

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const ip = getClientIp(request)

  const rate = await checkIpRateLimit(admin, ip, SCOPE, IP_LIMIT)
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message:
          'Du har skapat tre brev idag. Skapa ett gratiskonto så skriver du fler direkt.',
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
          'Vi har skrivit klart dagens brev åt besökare utan konto. Skapa ett gratiskonto så kommer du igång direkt.',
        registerHref: '/register',
      },
      { status: 503 }
    )
  }

  try {
    const draft = await createPublicLetterDraft(
      admin,
      { role, employer, experience, jobAd, yrkeSlug },
      hashIp(ip)
    )

    return NextResponse.json(draft)
  } catch (err) {
    console.error('[letter-draft] Generering misslyckades:', err)
    return NextResponse.json(
      { error: 'Kunde inte skriva brevet just nu. Försök igen om en stund.' },
      { status: 500 }
    )
  }
}
