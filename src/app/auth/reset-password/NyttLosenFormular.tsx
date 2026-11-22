'use client'

/**
 * Välj nytt lösenord i kontokortet (publikt omgång 3, skissnoten inloggning
 * punkt 2: rubrik, två fält, en knapp). Logiken är ResetPasswordForm
 * ordagrant (src/components/auth/reset-password-form.tsx): samma lyssnare på
 * återställningssessionen, samma validering, samma anrop och samma texter.
 * Bara formen är ny. Den gamla komponenten står kvar tills städningen (P5).
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthRad } from '../_delar/AuthKortSkal'
import { LOSENORD_FEL, LOSENORD_HJALP, MIN_LOSENORD, arSvagtLosenord } from '@/lib/auth/losenord'

function Oga({ oppet }: { oppet: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
      {oppet ? null : <path d="M4 4l16 16" />}
    </svg>
  )
}

function Bock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6.5 12.5l3.8 3.8 7.4-8.3" />
    </svg>
  )
}

export default function NyttLosenFormular() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery session established')
        setSessionReady(true)
        setError(null)
      } else if (event === 'SIGNED_IN' && session) {
        console.log('User signed in with recovery token')
        setSessionReady(true)
        setError(null)
      }
    })

    const checkSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Error getting session:', sessionError)
        setError('Ett fel uppstod. Försök begära en ny återställningslänk.')
        return
      }

      if (session) {
        setSessionReady(true)
        setError(null)
      } else {
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s) {
              setError('Ogiltig eller utgången återställningslänk. Begär en ny länk.')
            }
          })
        }, 2000)
      }
    }

    const timer = setTimeout(checkSession, 500)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [supabase.auth])

  const validatePassword = (pwd: string) => {
    if (pwd.length < MIN_LOSENORD) {
      return LOSENORD_FEL
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Lösenordet måste innehålla minst en stor bokstav'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Lösenordet måste innehålla minst en liten bokstav'
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Lösenordet måste innehålla minst en siffra'
    }
    return null
  }

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd)
    const validation = validatePassword(pwd)
    setValidationError(validation)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const validation = validatePassword(password)
    if (validation) {
      setError(validation)
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte')
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 2000)
    } catch (err: any) {
      console.error('Error resetting password:', err)
      // Supabases engelska svar visas aldrig rått (svep 4, 2026-11-22).
      setError(
        arSvagtLosenord(err)
          ? LOSENORD_FEL
          : err?.code === 'same_password'
            ? 'Det nya lösenordet måste skilja sig från det gamla.'
            : 'Ett fel uppstod. Försök igen.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <h1 className="rg-h1">Lösenord uppdaterat</h1>
        <p className="rg-under">Du omdirigeras till inloggningssidan...</p>
        <AuthRad ton="bra">
          <p>
            <b>Klart, du kan logga in</b>
          </p>
        </AuthRad>
        <p className="rg-text">Ditt lösenord har uppdaterats. Spara det säkert och logga in med det nya lösenordet.</p>
        <Link href="/login" className="p3-knapp p3-knapp-vit p3-knapp-bred">
          Gå till inloggning
        </Link>
      </>
    )
  }

  const checks = [
    { ok: password.length >= MIN_LOSENORD, label: LOSENORD_HJALP },
    { ok: /[A-Z]/.test(password), label: 'Minst en stor bokstav' },
    { ok: /[a-z]/.test(password), label: 'Minst en liten bokstav' },
    { ok: /[0-9]/.test(password), label: 'Minst en siffra' },
  ]

  const isInvalidLink = error?.includes('Ogiltig eller utgången')

  return (
    <>
      <h1 className="rg-h1">Skapa nytt lösenord</h1>
      <p className="rg-under">Välj något du kommer ihåg, minst 8 tecken med blandade typer.</p>

      {error ? (
        <AuthRad ton="fel">
          <p>{error}</p>
          {isInvalidLink ? (
            <Link href="/auth/forgot-password" className="rg-lank">
              Begär ny återställningslänk →
            </Link>
          ) : null}
        </AuthRad>
      ) : null}

      {!sessionReady && !error ? (
        <AuthRad ton="vanta">
          <p>Verifierar återställningslänk...</p>
        </AuthRad>
      ) : null}

      <form onSubmit={handleSubmit} className="rg-form">
        <div className="rg-falt">
          <label htmlFor="password">Nytt lösenord</label>
          <div className="rg-falt-rad">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={LOSENORD_HJALP}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              disabled={loading || !sessionReady}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="rg-falt-visa"
              tabIndex={-1}
              aria-label={showPassword ? 'Dölj lösenord' : 'Visa lösenord'}
            >
              <Oga oppet={!showPassword} />
            </button>
          </div>
          {validationError ? <p className="rg-falt-not rg-fel-text">{validationError}</p> : null}
        </div>

        <div className="rg-falt">
          <label htmlFor="confirmPassword">Bekräfta lösenord</label>
          <div className="rg-falt-rad">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Ange lösenordet igen"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || !sessionReady}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="rg-falt-visa"
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Dölj lösenord' : 'Visa lösenord'}
            >
              <Oga oppet={!showConfirmPassword} />
            </button>
          </div>
        </div>

        <div className="rg-krav">
          <p className="rg-ey">Lösenordskrav</p>
          <ul>
            {checks.map((check) => (
              <li key={check.label} className={check.ok ? 'rg-ok' : undefined}>
                <i aria-hidden="true">{check.ok ? <Bock /> : null}</i>
                <span>{check.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !!validationError || !password || !confirmPassword || !sessionReady}
          className="p3-knapp p3-knapp-bred"
        >
          {loading ? 'Återställer...' : 'Återställ lösenord'}
        </button>
      </form>
    </>
  )
}
