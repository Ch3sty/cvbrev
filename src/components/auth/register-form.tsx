// src/components/auth/register-form.tsx
'use client'

/**
 * Registrering (docs/plan-konvertering.md, B1, B2 och B3).
 *
 * Tre fält: namn, e-post, lösenord. Ingen verify-email-gren, användaren
 * landar direkt i appen. Efter lyckad signup startas reverse trial via
 * /api/auth/post-signup och eventuella utkast från publika flöden hämtas hem.
 */

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { logUserActivity } from '@/lib/activity-logger'
import { AlertCircle } from 'lucide-react'
import { capture, identifyUser } from '@/lib/analytics/events'
import { getAcquisitionSource, getSignupAnalyticsContext } from '@/lib/analytics/attribution'
import { claimPendingDraft, claimPendingCvStart, claimPendingTestSession } from '@/lib/letters/claim-draft-client'
import AuthCvPaper from './AuthCvPaper'
import AuthInput from './AuthInput'
import AuthSubmitButton from './AuthSubmitButton'
import AtsScoreMeter from './AtsScoreMeter'
import RegisterCvPreview from './RegisterCvPreview'
import GoogleSignInButton, { AuthDivider } from './GoogleSignInButton'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from './TurnstileWidget'

const MIN_PASSWORD_LENGTH = 8

interface RegisterFormProps {
  /** Anropas när formulär-state ändras, så desktop-panelen kan spegla den. */
  onStateChange?: (state: {
    fullName: string
    email: string
    score: number
  }) => void
}

export default function RegisterForm({ onStateChange }: RegisterFormProps = {}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<React.ReactNode | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const loginHref = redirectTo === '/dashboard' ? '/login' : `/login?redirect=${encodeURIComponent(redirectTo)}`
  const supabase = createClient()

  // Tre fält, tre lika stora delar av poängen.
  const score = useMemo(() => {
    let s = 0
    if (fullName.trim().length >= 2) s += 34
    if (email.trim().length > 3 && email.includes('@')) s += 33
    if (password.length >= MIN_PASSWORD_LENGTH) s += 33
    return s
  }, [fullName, email, password])

  useEffect(() => {
    onStateChange?.({ fullName, email, score })
  }, [fullName, email, score, onStateChange])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (fullName.trim().length < 2) {
      setError('Skriv ditt fullständiga namn, minst två tecken.')
      setLoading(false)
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Lösenordet måste vara minst ${MIN_PASSWORD_LENGTH} tecken.`)
      setLoading(false)
      return
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Vänta tills säkerhetskontrollen är klar och försök igen.')
      setLoading(false)
      return
    }

    const analyticsContext = getSignupAnalyticsContext()
    capture('signup_started', { method: 'password', ...analyticsContext })

    try {
      // Botkontroll före kontoskapandet. Saknas nycklarna svarar routen ok.
      if (TURNSTILE_SITE_KEY) {
        const verifyRes = await fetch('/api/auth/verify-turnstile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken }),
        })
        const verifyJson = await verifyRes.json().catch(() => ({}))
        if (!verifyRes.ok || !verifyJson?.success) {
          throw new Error(
            verifyJson?.error || 'Kunde inte bekräfta att du är en människa. Ladda om sidan och försök igen.'
          )
        }
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (signUpError) throw signUpError
      if (!data.user) throw new Error('Registreringen gick igenom men kontot kunde inte läsas.')

      const userId = data.user.id

      // Reverse trial och livscykelmail. Fire and forget: ett fel här får
      // aldrig hindra användaren från att komma in i appen.
      void fetch('/api/auth/post-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          source: 'password',
          acquisition: getAcquisitionSource(),
        }),
      }).catch((err) => console.error('[register] post-signup misslyckades:', err))

      // Bekräftelsemailet skickas i bakgrunden. Vi väntar inte in det.
      void fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.user.email,
          fullName,
          userId,
          isInvitation: false,
        }),
      }).catch((err) => console.error('[register] bekräftelsemail misslyckades:', err))

      void logUserActivity(userId, 'registered', 'Konto skapat med e-post och lösenord')
      void logUserActivity(userId, 'signup_method', 'Kontot skapades med lösenord', {
        method: 'password',
      })

      identifyUser(userId, { signup_method: 'password' })
      capture('signup_completed', { method: 'password', ...analyticsContext })

      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({ event: 'user_registered' })
      }

      // Utkast från de publika flödena hämtas hem och bestämmer landningen.
      let destination: string | null = null
      try {
        destination = (await claimPendingDraft()) || (await claimPendingCvStart()) || (await claimPendingTestSession())
      } catch (claimError) {
        console.error('[register] Kunde inte hämta hem utkast:', claimError)
      }

      router.push(destination || redirectTo)
      router.refresh()
    } catch (err: any) {
      let errorMessage: React.ReactNode = err?.message || 'Något gick fel vid registreringen.'
      if (err?.message?.includes('User already registered')) {
        errorMessage = (
          <>
            Det finns redan ett konto med den adressen.{' '}
            <Link href={loginHref} className="font-semibold underline hover:text-red-900">
              Logga in i stället
            </Link>
          </>
        )
      } else if (err?.message?.includes('Password should be at least')) {
        errorMessage = `Lösenordet måste vara minst ${MIN_PASSWORD_LENGTH} tecken.`
      }
      setError(errorMessage)
      console.error('Registreringsfel:', err)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobil-preview, visas först när användaren börjat fylla i */}
      <div className="lg:hidden">
        <RegisterCvPreview fullName={fullName} email={email} variant="mobile" />
      </div>

      <AuthCvPaper
        title="Skapa konto"
        subtitle="Fem dagar Premium ingår. Inget kort behövs."
        sectionLabel="Personuppgifter"
        topAccessory={<AtsScoreMeter score={score} />}
      >
        {error && (
          <div
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-5 space-y-4">
          <GoogleSignInButton next={redirectTo} label="Fortsätt med Google" />
          <AuthDivider />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <AuthInput
            id="fullName"
            type="text"
            label="Fullständigt namn"
            placeholder="Förnamn Efternamn"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
            autoComplete="name"
          />

          <AuthInput
            id="email"
            type="email"
            label="E-postadress"
            placeholder="din.adress@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <AuthInput
            id="password"
            type="password"
            label="Lösenord"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            hint={
              <>
                <span className="w-1 h-3.5 rounded-sm bg-orange-300 mt-0.5 flex-shrink-0" />
                <span>Minst {MIN_PASSWORD_LENGTH} tecken</span>
              </>
            }
          />

          <TurnstileWidget onToken={setTurnstileToken} className="pt-1" />

          <div className="pt-1">
            <AuthSubmitButton loading={loading} loadingText="Skapar konto...">
              Skapa konto
            </AuthSubmitButton>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-orange-50 text-center">
          <p className="text-sm text-neutral-600">
            Har du redan ett konto?{' '}
            <Link
              href={loginHref}
              className="font-semibold text-orange-700 hover:text-orange-800 transition-colors"
            >
              Logga in
            </Link>
          </p>
        </div>
      </AuthCvPaper>
    </div>
  )
}
