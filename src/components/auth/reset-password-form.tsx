// src/components/auth/reset-password-form.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Check, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

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
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Handle the recovery token from email link
  useEffect(() => {
    // Listen for auth state changes to capture the recovery session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User has clicked the reset link and Supabase has created a session
        console.log('Password recovery session established')
        setSessionReady(true)
        setError(null)
      } else if (event === 'SIGNED_IN' && session) {
        // Session is ready
        console.log('User signed in with recovery token')
        setSessionReady(true)
        setError(null)
      }
    })

    // Also check if we already have a session (in case auth state change already happened)
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Error getting session:', sessionError)
        setError('Ett fel uppstod. Försök begära en ny återställningslänk.')
        return
      }

      if (session) {
        setSessionReady(true)
        setError(null)
      } else {
        // No session yet - wait for onAuthStateChange
        // Only show error after a delay to give Supabase time to process the hash
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
              setError('Ogiltig eller utgången återställningslänk. Begär en ny länk.')
            }
          })
        }, 2000)
      }
    }

    // Wait a moment for Supabase to process the hash fragment from URL
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

    // Validate password
    const validation = validatePassword(password)
    if (validation) {
      setError(validation)
      setLoading(false)
      return
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte')
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)

      // Redirect to login after 2 seconds
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Lösenordet har återställts!
          </h2>

          <p className="text-gray-600 mb-6">
            Ditt lösenord har uppdaterats. Du omdirigeras till inloggningssidan...
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Gå till inloggning
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Skapa nytt lösenord
        </h2>

        <p className="text-gray-600">
          Välj ett starkt lösenord för ditt konto.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          {error.includes('Ogiltig eller utgången') && (
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              Begär ny återställningslänk →
            </Link>
          )}
        </div>
      )}

      {!sessionReady && !error && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">Verifierar återställningslänk...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Nytt lösenord
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              placeholder="Minst 8 tecken"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading || !sessionReady}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {validationError && (
            <p className="mt-2 text-sm text-red-600">{validationError}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Bekräfta lösenord
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Ange lösenordet igen"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading || !sessionReady}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-medium mb-2">Lösenordskrav:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className={password.length >= 8 ? 'text-green-700' : ''}>
              • Minst 8 tecken
            </li>
            <li className={/[A-Z]/.test(password) ? 'text-green-700' : ''}>
              • Minst en stor bokstav
            </li>
            <li className={/[a-z]/.test(password) ? 'text-green-700' : ''}>
              • Minst en liten bokstav
            </li>
            <li className={/[0-9]/.test(password) ? 'text-green-700' : ''}>
              • Minst en siffra
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !!validationError || !password || !confirmPassword || !sessionReady}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Återställer...' : 'Återställ lösenord'}
        </button>
      </form>
    </div>
  )
}
