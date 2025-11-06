'use client'

// src/components/trial/SignupForm.tsx
// Steg 1: Email + lösenord registrering

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface SignupFormProps {
  onSuccess: (data: { userId: string; email: string; stripeCustomerId: string; password: string }) => void
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password validation
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
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kunde inte skapa konto')
      }

      // Pass data to parent along with password for auto-login later
      onSuccess({
        userId: data.userId,
        email: data.email,
        stripeCustomerId: data.stripeCustomerId,
        password: password
      })

    } catch (error: any) {
      console.error('Signup error:', error)
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Skapa ditt konto
        </h2>
        <p className="text-slate-600">
          Fyll i dina uppgifter för att komma igång
        </p>
      </div>

      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
          E-postadress
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-base"
            placeholder="din@email.se"
            required
          />
        </div>
      </div>

      {/* Password field */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
          Lösenord
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-base"
            placeholder="Minst 8 tecken"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password requirements */}
        {password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            <div className="flex items-center gap-2 text-sm">
              {passwordRequirements.minLength ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-300" />
              )}
              <span className={passwordRequirements.minLength ? 'text-green-600' : 'text-slate-500'}>
                Minst 8 tecken
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {passwordRequirements.hasUpperCase ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-300" />
              )}
              <span className={passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-slate-500'}>
                Minst en stor bokstav
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {passwordRequirements.hasNumber ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-300" />
              )}
              <span className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-slate-500'}>
                Minst en siffra
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Terms checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          className="mt-1 w-5 h-5 border-2 border-slate-300 rounded focus:ring-4 focus:ring-blue-500/10 text-blue-600"
        />
        <label htmlFor="terms" className="text-sm text-slate-600">
          Jag godkänner{' '}
          <a href="/integritetspolicy" target="_blank" className="text-blue-600 hover:underline">
            användarvillkoren
          </a>{' '}
          och{' '}
          <a href="/integritetspolicy" target="_blank" className="text-blue-600 hover:underline">
            integritetspolicyn
          </a>
        </label>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={isFormValid && !isLoading ? { scale: 1.02, y: -2 } : {}}
        whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Skapar konto...
          </span>
        ) : (
          'Skapa konto'
        )}
      </motion.button>

      {/* Login link */}
      <p className="text-center text-sm text-slate-600">
        Har du redan ett konto?{' '}
        <a href="/login" className="text-blue-600 hover:underline font-semibold">
          Logga in här
        </a>
      </p>
    </form>
  )
}
