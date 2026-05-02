// src/components/auth/forgot-password-form.tsx
'use client'

import { useState } from 'react'
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import AuthCvPaper from './AuthCvPaper'
import AuthInput from './AuthInput'
import AuthSubmitButton from './AuthSubmitButton'
import SuccessStamp from './SuccessStamp'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Ett fel uppstod. Försök igen.')
      }
    } catch (err) {
      console.error('Error requesting password reset:', err)
      setError('Ett fel uppstod. Försök igen senare.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthCvPaper
        title="Återställ lösenord"
        subtitle="Klart — kolla din inkorg"
        sectionLabel="Bekräftelse"
      >
        <div className="space-y-5">
          {/* Stämpel + ikon */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                }}
              >
                <Mail className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  Mejl skickat
                </p>
                <p className="text-xs text-slate-600 truncate">
                  Till: <span className="font-semibold text-slate-900">{email}</span>
                </p>
              </div>
            </div>
            <SuccessStamp text="Mottaget" rotation={-6} />
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            Vi har skickat instruktioner för att återställa ditt lösenord.
            Klicka på länken i mejlet för att välja ett nytt.
          </p>

          <div className="rounded-xl border border-orange-100 bg-white px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700 mb-1">
              Tips
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kolla skräppost-mappen om mejlet inte dykt upp inom några
              minuter.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 hover:text-orange-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Tillbaka till inloggning
          </Link>
        </div>
      </AuthCvPaper>
    )
  }

  return (
    <AuthCvPaper
      title="Återställ lösenord"
      subtitle="Vi skickar en länk till din e-post"
      sectionLabel="Kontoåtkomst"
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="email"
          type="email"
          label="E-postadress"
          placeholder="din.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />

        <AuthSubmitButton loading={loading} loadingText="Skickar...">
          Skicka återställningslänk
        </AuthSubmitButton>
      </form>

      <div className="mt-6 pt-5 border-t border-orange-50 text-center">
        <p className="text-sm text-slate-600">
          Kom du ihåg ditt lösenord?{' '}
          <Link
            href="/login"
            className="font-bold text-orange-700 hover:text-orange-800 transition-colors"
          >
            Logga in
          </Link>
        </p>
      </div>
    </AuthCvPaper>
  )
}
