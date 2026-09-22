// src/app/auth/callback/route.ts
// OAuth-callback för Google-inloggning (docs/plan-konvertering.md, B2).
//
// Växlar koden mot en session, säkerställer att profilraden finns, startar
// reverse trial för nyskapade konton och skickar användaren vidare till en
// validerad relativ path.

import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { logActivityServer } from '@/lib/activation-tracking'
import { TRACK_CHOICE_PATH } from '@/lib/onboarding/steps'

/** Bara relativa paths inom appen släpps igenom, aldrig protokoll-relativa. */
function safeNext(raw: string | null): string {
  if (!raw) return '/dashboard'
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/dashboard'
  return raw
}

/** Konton yngre än två minuter räknas som nyskapade via OAuth. */
const NEW_ACCOUNT_WINDOW_MS = 2 * 60 * 1000

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeNext(requestUrl.searchParams.get('next'))
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_no_code`)
  }

  // Samma klient som resten av appen: getAll/setAll, så sessionen från
  // exchangeCodeForSession skrivs tillbaka i ett svep.
  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data?.user) {
    console.error('[auth/callback] exchangeCodeForSession misslyckades:', error)
    return NextResponse.redirect(`${origin}/login?error=oauth_exchange_failed`)
  }

  const user = data.user
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    user.email?.split('@')[0] ||
    'Användare'
  const avatarUrl =
    (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
    (typeof meta.picture === 'string' && meta.picture) ||
    null

  // Attribution ligger i jc_attr-cookien (SameSite=Lax, så den överlever
  // Googles redirect). Vi skickar den vidare till post-signup som acquisition.
  let acquisition: unknown = null
  try {
    const raw = cookieStore.get('jc_attr')?.value
    if (raw) acquisition = JSON.parse(decodeURIComponent(raw))
  } catch {
    /* trasig cookie ska aldrig stoppa inloggningen */
  }

  let isNewAccount = false

  try {
    const admin = getSupabaseAdmin()

    const { data: profile } = await (admin as any)
      .from('profiles')
      .select('id, created_at, full_name, email, profile_photo_url')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      // Triggern på auth.users saknas eller hann inte före oss: skapa raden.
      isNewAccount = true
      const insert: Record<string, unknown> = {
        id: user.id,
        email: user.email,
        full_name: fullName,
      }
      if (avatarUrl) {
        insert.profile_photo_url = avatarUrl
        insert.avatar_source = 'google'
      }
      const { error: insertError } = await (admin as any).from('profiles').insert(insert)
      if (insertError && insertError.code !== '23505') {
        console.error('[auth/callback] Kunde inte skapa profilrad:', insertError)
      }
    } else {
      const createdAt = profile.created_at ? new Date(profile.created_at).getTime() : 0
      isNewAccount = createdAt > 0 && Date.now() - createdAt < NEW_ACCOUNT_WINDOW_MS

      // Fyll luckor som triggern kan ha missat. E-posten kopieras alltid
      // från auth: den är sanningen och profilraden ska aldrig avvika.
      const patch: Record<string, unknown> = {}
      if (!profile.full_name && fullName) patch.full_name = fullName
      if (!profile.email && user.email) patch.email = user.email
      if (!profile.profile_photo_url && avatarUrl) {
        patch.profile_photo_url = avatarUrl
        patch.avatar_source = 'google'
      }
      if (Object.keys(patch).length > 0) {
        await (admin as any).from('profiles').update(patch).eq('id', user.id)
      }
    }
  } catch (profileError) {
    console.error('[auth/callback] Profilkontroll misslyckades:', profileError)
  }

  // Fallback när profilraden inte kunde läsas: använd auth-kontots ålder.
  if (!isNewAccount && user.created_at) {
    const authCreated = new Date(user.created_at).getTime()
    isNewAccount = Date.now() - authCreated < NEW_ACCOUNT_WINDOW_MS
  }

  await logActivityServer(
    user.id,
    isNewAccount ? 'signup_method' : 'login',
    isNewAccount ? 'Konto skapat via Google' : 'Inloggad via Google',
    { method: 'google' }
  )

  if (isNewAccount) {
    // post-signup sparar attributionen och startar livscykelmailen. Ingen
    // trial: reverse trial är borta (ägarens beslut 3).
    // Fire and forget, men vi inväntar den här eftersom redirecten annars
    // kan hinna avbryta requesten i serverless-miljön.
    try {
      await fetch(`${origin}/api/auth/post-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          source: 'google',
          acquisition,
        }),
      })
    } catch (trialError) {
      console.error('[auth/callback] post-signup misslyckades:', trialError)
    }
  }

  // Nytt konto via Google landar på spårvalet, inte på hemskärmen. Samma skäl
  // som i register-form: mätpunkt 1 är spårval till köp i samma session, och
  // steget får inte konkurrera med sju andra element (Fas 2A flöde 1). Bad
  // användaren uttryckligen om en annan sida, alltså ett riktigt next, går
  // hon dit i stället: hon var mitt i något när kontot skapades.
  const destination = isNewAccount && next === '/dashboard' ? TRACK_CHOICE_PATH : next

  return NextResponse.redirect(`${origin}${destination}`)
}
