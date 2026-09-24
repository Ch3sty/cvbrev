'use client'

/**
 * Google-inloggning (docs/plan-konvertering.md, B2, och
 * docs/design/profil-registrering-spec-2026-09-24.md, Del B).
 *
 * Skickar användaren till /auth/callback, som växlar koden mot en session,
 * säkerställer profilraden och skickar vidare. På registreringen är next
 * alltid /dashboard/valkommen: callbacken avgör om kontot är nytt, och
 * valkommen-sidan läser tratten ur cookien jc_signup.
 *
 * Sekundär knapp med kant, inte ink, så att sidan har en enda primär.
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GoogleMark } from '@/components/illustrations/AuthIllustrations'
import { capture } from '@/lib/analytics/events'
import { getSignupAnalyticsContext } from '@/lib/analytics/attribution'
import type { SignupEntry, SignupIntent } from '@/components/registrering/intent'

interface GoogleSignInButtonProps {
  /** Vart användaren ska efter lyckad inloggning. Måste vara en relativ path. */
  next?: string
  label?: string
  busyLabel?: string
  errorText?: string
  /**
   * Registreringen: skjuter signup_started med method google, intent och
   * entry vid tryck. Utelämnas på inloggningen, där trycket inte är en
   * registrering.
   */
  signup?: { intent: SignupIntent | null; entry: SignupEntry }
  /** Körs före hoppet till Google, till exempel för att skriva jc_signup. */
  onBeforeRedirect?: () => void
  className?: string
}

export default function GoogleSignInButton({
  next = '/dashboard',
  label = 'Fortsätt med Google',
  busyLabel = 'Öppnar Google',
  errorText = 'Google-inloggningen gick inte att starta. Försök igen.',
  signup,
  onBeforeRedirect,
  className = '',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    if (signup) {
      capture('signup_started', {
        method: 'google',
        intent: signup.intent,
        entry: signup.entry,
        ...getSignupAnalyticsContext(),
      })
    }
    try {
      onBeforeRedirect?.()
      const supabase = createClient()
      const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })

      if (oauthError) throw oauthError
      // Vid lyckat anrop navigerar webbläsaren bort, så loading står kvar.
    } catch (err) {
      console.error('[GoogleSignInButton] OAuth-fel:', err)
      setError(errorText)
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark size={18} />
        {loading ? busyLabel : label}
      </button>
      {error ? (
        <p className="mt-2 text-meta text-fel" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Avdelaren mellan Google-knappen och e-postformuläret. */
export function AuthDivider({ text = 'eller med e-post' }: { text?: string }) {
  return (
    <div className="mb-1 mt-4 flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-kant" />
      <span className="text-meta text-ink-3">{text}</span>
      <span className="h-px flex-1 bg-kant" />
    </div>
  )
}
