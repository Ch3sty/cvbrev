'use client'

// src/components/trial/SignupForm.tsx
// Steg 1: Email + losenord registrering for trial-flowet.
// Stil: orange/rod-DNA, anvander samma AuthInput/AuthSubmitButton som /register.

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import AuthInput from '@/components/auth/AuthInput'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'

interface SignupFormProps {
  onSuccess: (data: {
    userId: string
    email: string
    stripeCustomerId: string
    password: string
  }) => void
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)
  const isFormValid = email && isPasswordValid && agreeToTerms

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/trial/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kunde inte skapa konto')
      }

      onSuccess({
        userId: data.userId,
        email: data.email,
        stripeCustomerId: data.stripeCustomerId,
        password,
      })
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div
      className="rounded-3xl bg-white border border-orange-100 p-6 sm:p-8"
      style={{
        boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)',
      }}
    >
      <div className="mb-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
          Steg 1 av 2
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1.5 tracking-tight">
          Skapa ditt konto
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Två fält och du är igång. Vi tar betalningsuppgifterna i nästa steg.
        </p>
      </div>

      {error && (
        <div
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-2.5"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          minLength={8}
          autoComplete="new-password"
        />

        {/* Lösenordskrav som checklist (orange/rod) */}
        {password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl bg-orange-50/60 border border-orange-100 p-3 space-y-1.5"
          >
            <Requirement met={passwordRequirements.minLength} label="Minst 8 tecken" />
            <Requirement met={passwordRequirements.hasUpperCase} label="Minst en stor bokstav" />
            <Requirement met={passwordRequirements.hasNumber} label="Minst en siffra" />
          </motion.div>
        )}

        {/* Terms-checkbox */}
        <label className="flex items-start gap-3 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-slate-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-600 leading-relaxed">
            Jag godkänner{' '}
            <Link
              href="/anvandarvillkor"
              target="_blank"
              className="font-bold text-orange-700 hover:text-orange-800"
            >
              användarvillkoren
            </Link>{' '}
            och{' '}
            <Link
              href="/integritetspolicy"
              target="_blank"
              className="font-bold text-orange-700 hover:text-orange-800"
            >
              integritetspolicyn
            </Link>
          </span>
        </label>

        <div className="pt-2">
          <AuthSubmitButton loading={isLoading} loadingText="Skapar konto...">
            Fortsätt till betalning
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
    </div>
  )
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      <CheckCircle2
        className={`w-4 h-4 flex-shrink-0 ${met ? 'text-emerald-600' : 'text-slate-300'}`}
        strokeWidth={2.4}
      />
      <span className={met ? 'text-emerald-700 font-medium' : 'text-slate-500'}>{label}</span>
    </div>
  )
}
