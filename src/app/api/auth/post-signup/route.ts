// src/app/api/auth/post-signup/route.ts
// ======================================
// Reverse trial: varje nytt konto får fem dygn full Premium utan kort
// (A4 i docs/plan-konvertering.md). Anropas direkt efter lyckad signUp och
// från Google-callbacken. Anropas ALDRIG från invite-flödet, gäster har
// egen premium och idempotensspärren nedan skyddar dem ändå.

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { nextMidnightStockholm } from '@/lib/quota/quotaService'
import { onUserSignup } from '@/lib/email/lifecycle/hooks'
import type { Attribution } from '@/lib/analytics/attribution'

const TRIAL_DAYS = 5
/** Så långt efter midnatt trialen faktiskt tar slut, så mail dag 4 hinner före. */
const TRIAL_GRACE_HOURS = 7

/**
 * premium_until = nästa midnatt svensk tid efter (nu + 5 dygn), plus 7 timmar.
 * Det lägger utgången kl 07:00 morgonen efter dag fem, vilket ger både
 * dag 4-mailet och nedgraderingscronen rätt ordning.
 */
function trialEndsAt(now: Date = new Date()): string {
  const fiveDaysOut = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
  const midnight = nextMidnightStockholm(fiveDaysOut)
  return new Date(midnight.getTime() + TRIAL_GRACE_HOURS * 60 * 60 * 1000).toISOString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { userId, source, acquisition } = body as {
      userId?: unknown
      source?: unknown
      acquisition?: Attribution
    }

    if (typeof userId !== 'string' || !userId) {
      return NextResponse.json({ error: 'Saknar userId' }, { status: 400 })
    }
    if (source !== 'password' && source !== 'google') {
      return NextResponse.json({ error: 'Ogiltig källa' }, { status: 400 })
    }

    const admin = getSupabaseAdmin() as any

    // Hämta kontot via admin-API:t: vi behöver created_at för att veta att
    // det här verkligen är ett nyss skapat konto.
    const { data: authUser, error: authError } = await admin.auth.admin.getUserById(userId)
    if (authError || !authUser?.user) {
      return NextResponse.json({ error: 'Kontot finns inte' }, { status: 404 })
    }

    const createdAt = new Date(authUser.user.created_at)
    const ageMs = Date.now() - createdAt.getTime()

    // Kontot måste vara yngre än tio minuter. Rutten är inte en väg att ge
    // sig själv premium i efterhand.
    if (ageMs > 10 * 60 * 1000) {
      return NextResponse.json({ error: 'Kontot är inte nyskapat' }, { status: 403 })
    }

    // Anroparen ska antingen ha session som samma användare, eller så är
    // kontot så nytt (under 60 s) att sessionen ännu inte hunnit sättas.
    // Det senare är fallet direkt efter signUp och i OAuth-callbacken.
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const { data: { user: sessionUser } } = await supabase.auth.getUser()

    const sessionMatches = sessionUser?.id === userId
    const veryFresh = ageMs <= 60 * 1000
    if (!sessionMatches && !veryFresh) {
      return NextResponse.json({ error: 'Ej behörig' }, { status: 403 })
    }

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('premium_source, premium_until, subscription_status, subscription_tier')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilen finns inte' }, { status: 404 })
    }

    // Idempotens: avbryt om kontot redan fått premium från något håll.
    const hasSource = Boolean(profile.premium_source)
    const hasLiveSubscription = ['active', 'trialing'].includes(profile.subscription_status ?? '')
    const hasFuturePremium =
      Boolean(profile.premium_until) && new Date(profile.premium_until) > new Date()

    if (hasSource || hasLiveSubscription || hasFuturePremium) {
      return NextResponse.json({ granted: false, reason: 'already_premium' })
    }

    const update: Record<string, unknown> = {
      subscription_tier: 'premium',
      premium_until: trialEndsAt(),
      premium_source: source === 'google' ? 'oauth_signup_trial' : 'signup_trial',
      subscription_status: null,
    }
    // Klientdata: begränsa storleken så jsonb-kolumnen inte kan fyllas med skräp.
    if (acquisition && typeof acquisition === 'object' && JSON.stringify(acquisition).length <= 2000) {
      update.acquisition_source = acquisition
    }

    const { error: updateError } = await admin.from('profiles').update(update).eq('id', userId)
    if (updateError) {
      console.error('[POST SIGNUP] Kunde inte sätta trial:', updateError.message)
      return NextResponse.json({ error: 'Kunde inte aktivera Premium' }, { status: 500 })
    }

    // Livscykelmailen ska aldrig kunna fälla registreringen.
    try {
      await onUserSignup(admin, userId)
    } catch (hookError) {
      console.error('[POST SIGNUP] onUserSignup misslyckades:', hookError)
    }

    return NextResponse.json({ granted: true, premiumUntil: update.premium_until })
  } catch (error) {
    console.error('[POST SIGNUP] Error:', error)
    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 })
  }
}
