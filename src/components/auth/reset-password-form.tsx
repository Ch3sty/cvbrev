// src/components/auth/reset-password-form.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import AuthCvPaper from './AuthCvPaper'
import AuthInput from './AuthInput'
import AuthSubmitButton from './AuthSubmitButton'
import SuccessStamp from './SuccessStamp'

export default function ResetPasswordForm() {
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
              setError(
                'Ogiltig eller utgången återställningslänk. Begär en ny länk.'
              )
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
    if (pwd.length < 8) {
      return 'Lösenordet måste vara minst 8 tecken långt'
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
      setError(err.message || 'Ett fel uppstod. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthCvPaper
        title="Lösenord uppdaterat"
        subtitle="Du omdirigeras till inloggningssidan..."
        sectionLabel="Bekräftelse"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-sm font-bold text-slate-900">
                Klart — du kan logga in
              </p>
            </div>
            <SuccessStamp text="Godkänt" rotation={-6} />
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            Ditt lösenord har uppdaterats. Spara det säkert och logga in
            med det nya lösenordet.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full min-h-[44px] gap-2 px-4 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all"
          >
            Gå till inloggning
          </Link>
        </div>
      </AuthCvPaper>
    )
  }

  // Validerings-checklist
  const checks = [
    { ok: password.length >= 8, label: 'Minst 8 tecken' },
    { ok: /[A-Z]/.test(password), label: 'Minst en stor bokstav' },
    { ok: /[a-z]/.test(password), label: 'Minst en liten bokstav' },
    { ok: /[0-9]/.test(password), label: 'Minst en siffra' },
  ]

  const isInvalidLink = error?.includes('Ogiltig eller utgången')

  return (
    <AuthCvPaper
      title="Skapa nytt lösenord"
      subtitle="Välj något du kommer ihåg — minst 8 tecken med blandade typer."
      sectionLabel="Kontoåtkomst"
    >
      {error && (
        <div
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5"
          role="alert"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              strokeWidth={2.2}
            />
            <p className="text-sm text-red-800">{error}</p>
          </div>
          {isInvalidLink && (
            <Link
              href="/auth/forgot-password"
              className="ml-7 mt-1.5 inline-block text-sm font-bold text-orange-700 hover:text-orange-800 transition-colors"
            >
              Begär ny återställningslänk →
            </Link>
          )}
        </div>
      )}

      {!sessionReady && !error && (
        <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50/60 p-3.5 flex items-center gap-2.5">
          <Loader2
            className="w-5 h-5 text-orange-600 flex-shrink-0 animate-spin"
            strokeWidth={2.2}
          />
          <p className="text-sm text-orange-900">
            Verifierar återställningslänk...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          label="Nytt lösenord"
          placeholder="Minst 8 tecken"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          required
          disabled={loading || !sessionReady}
          autoComplete="new-password"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-slate-400 hover:text-orange-600 transition-colors"
              tabIndex={-1}
              aria-label={
                showPassword ? 'Dölj lösenord' : 'Visa lösenord'
              }
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" strokeWidth={2} />
              ) : (
                <Eye className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
          }
          hint={
            validationError ? (
              <span className="text-red-600">{validationError}</span>
            ) : undefined
          }
        />

        <AuthInput
          id="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          label="Bekräfta lösenord"
          placeholder="Ange lösenordet igen"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading || !sessionReady}
          autoComplete="new-password"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="p-1 text-slate-400 hover:text-orange-600 transition-colors"
              tabIndex={-1}
              aria-label={
                showConfirmPassword ? 'Dölj lösenord' : 'Visa lösenord'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" strokeWidth={2} />
              ) : (
                <Eye className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
          }
        />

        {/* Krav-checklist (CV-stil) */}
        <div className="rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700 mb-2.5">
            Lösenordskrav
          </p>
          <ul className="space-y-1.5">
            {checks.map((check) => (
              <li
                key={check.label}
                className="flex items-center gap-2 text-sm transition-colors"
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    check.ok
                      ? 'bg-emerald-500'
                      : 'bg-white border border-slate-300'
                  }`}
                >
                  {check.ok && (
                    <Check
                      className="w-3 h-3 text-white"
                      strokeWidth={3}
                    />
                  )}
                </span>
                <span
                  className={
                    check.ok
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-600'
                  }
                >
                  {check.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <AuthSubmitButton
          loading={loading}
          loadingText="Återställer..."
          disabled={
            !!validationError ||
            !password ||
            !confirmPassword ||
            !sessionReady
          }
        >
          Återställ lösenord
        </AuthSubmitButton>
      </form>
    </AuthCvPaper>
  )
}
