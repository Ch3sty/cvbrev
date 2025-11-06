'use client'

// src/components/dashboard/SetPasswordPrompt.tsx
// ================================================
// Prompt component for trial users to set their password
// Shows as a dismissible banner in dashboard for users with password_set: false

import { useState } from 'react'
import { Lock, X, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SetPasswordPromptProps {
  userId: string
  onDismiss?: () => void
  onPasswordSet?: () => void
}

export default function SetPasswordPrompt({ userId, onDismiss, onPasswordSet }: SetPasswordPromptProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.length < 8) {
      setError('Lösenordet måste vara minst 8 tecken långt')
      return
    }

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte')
      return
    }

    setIsLoading(true)

    try {
      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        throw updateError
      }

      // Update user metadata to mark password as set
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { password_set: true }
      })

      if (metadataError) {
        console.error('Failed to update metadata:', metadataError)
      }

      setSuccess(true)

      // Call success callback
      setTimeout(() => {
        onPasswordSet?.()
      }, 2000)

    } catch (err: any) {
      console.error('Error setting password:', err)
      setError(err.message || 'Kunde inte uppdatera lösenord. Försök igen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    // Store dismissal in localStorage to not show again this session
    localStorage.setItem('password_prompt_dismissed', 'true')
    onDismiss?.()
  }

  if (success) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-6 shadow-lg">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">Lösenord uppdaterat!</p>
            <p className="text-sm text-green-700">Du kan nu logga in med ditt nya lösenord.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-4 mb-6 shadow-lg">
      <div className="flex items-start gap-3">
        <Lock className="w-6 h-6 text-pink-600 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900">Säkra ditt konto</h3>
              <p className="text-sm text-gray-600 mt-1">
                Skapa ett lösenord för att kunna logga in igen i framtiden
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Stäng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="mt-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all text-sm"
            >
              Skapa lösenord nu
            </button>
          ) : (
            <form onSubmit={handleSetPassword} className="mt-4 space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Nytt lösenord
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Minst 8 tecken"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Bekräfta lösenord
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Upprepa lösenordet"
                  required
                  minLength={8}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sparar...' : 'Spara lösenord'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Avbryt
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                💡 Tips: Använd en kombination av bokstäver, siffror och specialtecken för ett starkt lösenord
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
