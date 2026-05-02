// src/components/auth/register-form.tsx
'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { logUserActivity } from '@/lib/activity-logger'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import AuthCvPaper from './AuthCvPaper'
import AuthInput from './AuthInput'
import AuthSubmitButton from './AuthSubmitButton'
import AtsScoreMeter from './AtsScoreMeter'
import RegisterCvPreview from './RegisterCvPreview'

interface RegisterFormProps {
  /** Anropas när formulär-state ändras — för att kunna spegla i desktop-vänsterpanelen */
  onStateChange?: (state: {
    fullName: string
    email: string
    phone: string
    location: string
    score: number
  }) => void
}

export default function RegisterForm({ onStateChange }: RegisterFormProps = {}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<React.ReactNode | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  // Beräkna CV-poäng (0-100) baserat på ifyllda fält
  const score = useMemo(() => {
    let s = 0
    if (fullName.trim().length >= 2) s += 25
    if (email.trim().length > 3 && email.includes('@')) s += 25
    if (password.length >= 6) s += 20
    if (phone.trim().length >= 6) s += 15
    if (location.trim().length >= 2) s += 15
    return s
  }, [fullName, email, password, phone, location])

  // Skicka state uppåt så vänsterpanelen kan spegla
  useEffect(() => {
    onStateChange?.({ fullName, email, phone, location, score })
  }, [fullName, email, phone, location, score, onStateChange])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (fullName.trim().length < 2) {
      setError('Fullständigt namn måste vara minst 2 tecken långt.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt.')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone.trim() || null,
            location: location.trim() || null,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        await logUserActivity(
          data.user.id,
          'registered',
          'User registered via email/password'
        )
        console.log('Registration activity logged for user:', data.user.id)

        if (typeof window.dataLayer !== 'undefined') {
          window.dataLayer.push({ event: 'user_registered' })
          console.log('Data Layer event pushed: user_registered')
        } else {
          console.warn('Data Layer not available.')
        }

        try {
          const emailResponse = await fetch('/api/auth/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.user.email,
              fullName: fullName,
              userId: data.user.id,
              isInvitation: false,
            }),
          })

          if (!emailResponse.ok) {
            console.error(
              'Failed to send confirmation email:',
              await emailResponse.text()
            )
          } else {
            console.log('Custom confirmation email sent successfully')
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError)
        }

        if (data.session) {
          setMessage(
            'Konto skapat! Kontrollera din e-post för att bekräfta din adress.'
          )
          router.push(redirectTo)
          router.refresh()
        } else {
          setMessage(
            'Konto skapat! Kontrollera din e-post för att bekräfta din adress.'
          )
          router.push('/auth/verify-email')
        }
      } else {
        console.warn(
          'Registrering lyckades men user data saknades för loggning/omdirigering.'
        )
        throw new Error('Okänt fel vid registrering.')
      }
    } catch (err: any) {
      let errorMessage: React.ReactNode =
        err.message || 'Ett fel uppstod vid registrering'
      if (err.message?.includes('User already registered')) {
        errorMessage = (
          <>
            En användare med denna e-postadress finns redan.{' '}
            <Link
              href="/login"
              className="font-bold underline hover:text-red-900"
            >
              Logga in?
            </Link>
          </>
        )
      } else if (
        err.message?.includes('Password should be at least 6 characters')
      ) {
        errorMessage = 'Lösenordet måste vara minst 6 tecken långt.'
      }
      setError(errorMessage)
      console.error('Registreringsfel:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobil-preview (visas bara <lg när användaren börjat fylla i) */}
      <div className="lg:hidden">
        <RegisterCvPreview
          fullName={fullName}
          email={email}
          phone={phone}
          location={location}
          variant="mobile"
        />
      </div>

      <AuthCvPaper
        title="Skapa konto"
        subtitle="Bygg ditt första CV på under en minut."
        sectionLabel="Personuppgifter"
        topAccessory={<AtsScoreMeter score={score} />}
      >
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

        {message && (
          <div
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 flex items-start gap-2.5"
            role="status"
          >
            <CheckCircle2
              className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
              strokeWidth={2.2}
            />
            <p className="text-sm text-emerald-800">{message}</p>
          </div>
        )}

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
            placeholder="din.email@example.com"
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
            minLength={6}
            autoComplete="new-password"
            hint={
              <>
                <span className="w-1 h-3.5 rounded-sm bg-orange-300 mt-0.5 flex-shrink-0" />
                <span>Minst 6 tecken</span>
              </>
            }
          />

          <AuthInput
            id="phone"
            type="tel"
            label="Telefonnummer"
            optional
            placeholder="+46 70 123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            hint={
              <>
                <span className="w-1 h-3.5 rounded-sm bg-orange-300 mt-0.5 flex-shrink-0" />
                <span>Används endast för personliga brev & CV:n</span>
              </>
            }
          />

          <AuthInput
            id="location"
            type="text"
            label="Ort"
            optional
            placeholder="Stockholm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            autoComplete="address-level2"
            hint={
              <>
                <span className="w-1 h-3.5 rounded-sm bg-orange-300 mt-0.5 flex-shrink-0" />
                <span>Används endast för personliga brev & CV:n</span>
              </>
            }
          />

          <div className="pt-1">
            <AuthSubmitButton
              loading={loading}
              loadingText="Skapar konto..."
            >
              Skapa konto
            </AuthSubmitButton>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-orange-50 text-center">
          <p className="text-sm text-slate-600">
            Har du redan ett konto?{' '}
            <Link
              href="/login"
              className="font-bold text-orange-700 hover:text-orange-800 transition-colors"
            >
              Logga in
            </Link>
          </p>
        </div>
      </AuthCvPaper>
    </div>
  )
}
