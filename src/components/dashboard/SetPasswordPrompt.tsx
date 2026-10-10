'use client'

// src/components/dashboard/SetPasswordPrompt.tsx
// ================================================
// Prompt component for trial users to set their password
// Shows as a dismissible banner in dashboard for users with password_set: false

import { KNAPP_PRIMAR_SMAL } from '@/components/shell/knappar'
import { useState } from 'react'
import { IkonCheck, IkonLas, IkonX } from '@/components/illustrations/RumSymboler'
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
      <div className="mb-6 rounded-xl border border-kant bg-panel p-4">
        <div className="flex items-center gap-3">
          <IkonCheck className="flex-shrink-0 text-positiv" />
          <div className="flex-1">
            <p className="text-kort text-ink-1">Lösenordet är uppdaterat</p>
            <p className="text-meta text-ink-3">Du kan nu logga in med ditt nya lösenord.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border border-kant bg-panel p-4">
      <div className="flex items-start gap-3">
        <IkonLas className="mt-1 flex-shrink-0 text-ink-2" />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-kort text-ink-1">Säkra ditt konto</h3>
              <p className="mt-1 text-meta text-ink-3">
                Skapa ett lösenord för att kunna logga in igen i framtiden
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-ink-3 transition-colors hover:text-ink-1"
              aria-label="Stäng"
            >
              <IkonX size={20} />
            </button>
          </div>

          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className={`${KNAPP_PRIMAR_SMAL} mt-3`}
            >
              Skapa lösenord nu
            </button>
          ) : (
            <form onSubmit={handleSetPassword} className="mt-4 space-y-3">
              {error && (
                <div className="rounded-lg border border-fel-kant bg-fel-mjuk p-3 text-sm text-fel">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-2">
                  Nytt lösenord
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-kant bg-insunken pl-3 pr-16 text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
                    placeholder="Minst 8 tecken"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Dölj lösenordet' : 'Visa lösenordet'}
                    className="absolute right-1 top-1/2 inline-flex h-9 -translate-y-1/2 items-center rounded-lg px-2 text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
                  >
                    {showPassword ? 'Dölj' : 'Visa'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-ink-2">
                  Bekräfta lösenord
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
                  placeholder="Upprepa lösenordet"
                  required
                  minLength={8}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${KNAPP_PRIMAR_SMAL} flex-1`}
                >
                  {isLoading ? 'Sparar...' : 'Spara lösenord'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken"
                >
                  Avbryt
                </button>
              </div>

              <p className="mt-2 text-meta text-ink-3">
                Ett starkt lösenord blandar bokstäver, siffror och specialtecken.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
