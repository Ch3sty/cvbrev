// src/app/api/auth/post-signup/route.ts
// ======================================
// Efter registreringen: sparar var kontot kom ifrån och startar
// livscykelmailen. Anropas direkt efter lyckad signUp och från
// Google-callbacken. Anropas ALDRIG från invite-flödet.
//
// Rutten delade tidigare ut fem dygn Premium utan kort. Reverse trial är
// borta (docs/plan-paket-och-onboarding.md, ägarens beslut 3): sextio av 61
// trialhändelser skedde på dag noll, alltså tog trialen bort betalväggen
// under exakt de timmar användaren var här. Nya konton börjar på gratisnivån.

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { onUserSignup } from '@/lib/email/lifecycle/hooks'
import type { Attribution } from '@/lib/analytics/attribution'

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
      .select('id')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilen finns inte' }, { status: 404 })
    }

    // Ingen premium delas ut här längre. Kvar är bara varifrån kontot kom,
    // och den skrivs bara när klientdatan är rimlig till storleken, så att
    // jsonb-kolumnen inte kan fyllas med skräp.
    if (acquisition && typeof acquisition === 'object' && JSON.stringify(acquisition).length <= 2000) {
      const { error: updateError } = await admin
        .from('profiles')
        .update({ acquisition_source: acquisition })
        .eq('id', userId)
      if (updateError) {
        // Attributionen är mätdata, inte ett krav för att kontot ska fungera.
        console.error('[POST SIGNUP] Kunde inte spara acquisition_source:', updateError.message)
      }
    }

    // Livscykelmailen ska aldrig kunna fälla registreringen.
    try {
      await onUserSignup(admin, userId)
    } catch (hookError) {
      console.error('[POST SIGNUP] onUserSignup misslyckades:', hookError)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[POST SIGNUP] Error:', error)
    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 })
  }
}
