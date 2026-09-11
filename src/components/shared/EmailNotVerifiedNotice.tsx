'use client'

/**
 * Inline-meddelande när export stoppas av obekräftad e-post (B1 i
 * docs/plan-konvertering.md). Servern svarar 403 { error: 'email_not_verified' }
 * på brevnedladdning och CV-export.
 *
 * Litet och lugnt: det här är inget fel användaren gjort, bara ett steg kvar.
 */

import { useState } from 'react'
import { useProfile } from '@/hooks/use-profile'

interface EmailNotVerifiedNoticeProps {
  /** E-postadressen servern skickade med, om den finns. */
  email?: string | null
  className?: string
}

export default function EmailNotVerifiedNotice({
  email,
  className,
}: EmailNotVerifiedNoticeProps) {
  const { profile } = useProfile()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const address = email ?? profile?.email ?? null

  const resend = async () => {
    if (state === 'sending' || state === 'sent') return
    setState('sending')
    try {
      const res = await fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: address,
          fullName: profile?.full_name || address || 'Användare',
          userId: profile?.id,
          isInvitation: false,
        }),
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white px-4 py-3 ${className ?? ''}`}
      role="status"
    >
      <p className="text-sm text-neutral-700 leading-relaxed">
        Bekräfta din e-post för att ladda ner. Vi skickade en länk till{' '}
        <span className="font-medium text-neutral-900">{address ?? 'din adress'}</span>.
      </p>
      <div className="mt-2 flex items-center gap-3">
        {state === 'sent' ? (
          <span className="text-sm font-medium text-neutral-700 inline-flex items-center gap-1.5">
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="#1F7A4D"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3.5 8.5l3 3 6-6" />
            </svg>
            Länken är skickad
          </span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={state === 'sending'}
            className="text-sm font-medium text-orange-700 hover:text-orange-900 underline-offset-4 hover:underline disabled:opacity-60"
          >
            {state === 'sending' ? 'Skickar…' : 'Skicka igen'}
          </button>
        )}
      </div>
      {state === 'error' ? (
        <p className="text-sm text-red-700 mt-2">Kunde inte skicka länken. Försök igen.</p>
      ) : null}
    </div>
  )
}
