'use client'

/**
 * Google-inloggning (docs/plan-konvertering.md, B2).
 *
 * Skickar användaren till /auth/callback, som växlar koden mot en session,
 * säkerställer profilraden och startar reverse trial för nya konton.
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GoogleMark } from '@/components/illustrations/AuthIllustrations'

interface GoogleSignInButtonProps {
  /** Vart användaren ska efter lyckad inloggning. Måste vara en relativ path. */
  next?: string
  label?: string
}

export default function GoogleSignInButton({
  next = '/dashboard',
  label = 'Fortsätt med Google',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
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
      setError('Kunde inte starta Google-inloggningen. Försök igen.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-3 h-11 px-4 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <GoogleMark size={20} />
        {loading ? 'Öppnar Google…' : label}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}

/** Avdelaren mellan Google-knappen och e-postformuläret. */
export function AuthDivider({ text = 'eller med e-post' }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 py-1" aria-hidden="true">
      <span className="h-px flex-1 bg-neutral-200" />
      <span className="text-xs text-neutral-500">{text}</span>
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  )
}
