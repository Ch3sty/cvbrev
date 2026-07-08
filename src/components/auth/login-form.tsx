// src/components/auth/login-form.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { logUserActivity } from '@/lib/activity-logger'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import AuthCvPaper from './AuthCvPaper'
import AuthInput from './AuthInput'
import AuthSubmitButton from './AuthSubmitButton'

/**
 * Vart användaren ska efter inloggning. Godkända rekryterare skickas till
 * /rekryterare, alla andra (kandidater, väntande/avslagna rekryterare) till
 * kandidat-dashboarden. Fel eller timeout faller alltid tillbaka på /dashboard
 * så en trasig statuskoll aldrig blockerar inloggningen.
 */
async function resolvePostLoginDestination(): Promise<string> {
  try {
    const res = await fetch('/api/recruiter/status', {
      cache: 'no-store',
    })
    if (!res.ok) return '/dashboard'
    const data = (await res.json()) as { status?: string }
    return data?.status === 'approved' ? '/rekryterare' : '/dashboard'
  } catch {
    return '/dashboard'
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const confirmed = searchParams.get('confirmed')
    const reset = searchParams.get('reset')
    if (confirmed === 'true') {
      setSuccessMessage(
        'Din e-post är bekräftad! Du har nu full tillgång till alla funktioner. Logga in nedan.'
      )
    } else if (reset === 'success') {
      setSuccessMessage(
        'Lösenordet har återställts. Logga in med ditt nya lösenord.'
      )
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Felaktig e-postadress eller lösenord.')
        }
        throw signInError
      }

      if (signInData?.user) {
        await logUserActivity(
          signInData.user.id,
          'login',
          'User logged in via email/password'
        )
        console.log('Login activity logged for user:', signInData.user.id)
      } else {
        console.warn(
          'Login successful but user data not immediately available for logging.'
        )
      }

      // Godkända rekryterare hör hemma i rekryterarportalen, inte i
      // kandidat-dashboarden. Återanvänder guard-endpointen (svarar aldrig 403).
      const destination = await resolvePostLoginDestination()
      router.push(destination)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod vid inloggning')
      console.error('Inloggningsfel:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCvPaper
      title="Logga in"
      subtitle="Välkommen tillbaka — fortsätt där du slutade."
      sectionLabel="Kontoåtkomst"
    >
      {successMessage && (
        <div
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 flex items-start gap-2.5"
          role="status"
        >
          <CheckCircle2
            className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
            strokeWidth={2.2}
          />
          <p className="text-sm text-emerald-800">{successMessage}</p>
        </div>
      )}

      {error && (
        <div
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-2.5"
          role="alert"
        >
          <AlertCircle
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            strokeWidth={2.2}
          />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput
          id="email"
          type="email"
          label="E-postadress"
          placeholder="din.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div>
          <AuthInput
            id="password"
            type="password"
            label="Lösenord"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="mt-2 text-right">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-bold text-orange-700 hover:text-orange-800 transition-colors"
            >
              Glömt lösenord?
            </Link>
          </div>
        </div>

        <AuthSubmitButton loading={loading} loadingText="Loggar in...">
          Logga in
        </AuthSubmitButton>
      </form>

      <div className="mt-6 pt-5 border-t border-orange-50 text-center">
        <p className="text-sm text-slate-600">
          Har du inget konto?{' '}
          <Link
            href="/register"
            className="font-bold text-orange-700 hover:text-orange-800 transition-colors"
          >
            Skapa konto
          </Link>
        </p>
      </div>
    </AuthCvPaper>
  )
}
