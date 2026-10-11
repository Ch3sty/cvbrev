/**
 * Fil: src/components/kontakt/KontaktForm.tsx
 *
 * Beskrivning:
 * Kontaktformuläret i inloggat läge (/dashboard/kontakt).
 * Hanterar state, validering och submission. Skickar till /api/contact,
 * som mejlar supporten; Tack visas bara när routen svarat 2xx.
 *
 * Inloggat (rum-neutral): papper, fält i papper-2, kopparknappen,
 * bekräftelse och fel som rader utan rörelse. Den publika sidan har sin
 * egen fil, KontaktFormPublik, och rörs inte i Rummen.
 */
'use client'

import { useState, FormEvent } from 'react'
import { IkonFel } from '@/components/illustrations/Ikoner'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'

interface KontaktFormProps {
  /** Kvar för anroparna; inloggat har bara en variant. */
  variant?: 'dashboard'
  onSubmitSuccess?: () => void
}

const FEL_STANDARD = 'Vi nådde inte fram. Fälten står kvar, tryck Skicka igen, eller maila support@jobbcoach.ai.'

const DASHBOARD = {
  wrap: 'rounded-xl border border-kant bg-papper p-4 sm:p-5',
  label: 'block text-sm font-medium text-ink-1 mb-1.5',
  required: 'text-ink-3 ml-1',
  field:
    'h-11 w-full rounded-lg border border-kant bg-papper-2 px-3 text-base text-ink-1  placeholder:text-ink-3 focus:border-kant-stark focus:bg-papper focus:outline-none focus:ring-2 focus:ring-koppar-ink',
  textarea:
    'w-full rounded-lg border border-kant bg-papper-2 px-3 py-2.5 text-base text-ink-1  placeholder:text-ink-3 resize-none focus:border-kant-stark focus:bg-papper focus:outline-none focus:ring-2 focus:ring-koppar-ink',
  // Rummen våg 1b: dashboardvarianten har kopparknappen.
  button: () => `${KNAPP_PRIMAR} disabled:cursor-not-allowed sm:w-auto`,
}

export default function KontaktForm({ onSubmitSuccess }: KontaktFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const s = DASHBOARD

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    // Enkel validering före nätverket; routen kontrollerar samma sak.
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSubmitStatus('error')
      setErrorMessage('Fyll i alla fält.')
      setIsSubmitting(false)
      return
    }

    try {
      // /api/contact mejlar supporten via Resend. Tack visas bara på 2xx;
      // allt annat, nätverksfel inräknat, är ett fel och fälten står kvar.
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        let meddelande = ''
        try {
          const json = await response.json()
          meddelande = typeof json?.message === 'string' ? json.message : ''
        } catch {
          meddelande = ''
        }
        throw new Error(meddelande || FEL_STANDARD)
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      onSubmitSuccess?.()
    } catch (error: unknown) {
      setSubmitStatus('error')
      // Ett nätverksfel (TypeError från fetch) får standardtexten, inte webbläsarens.
      const text = error instanceof Error && !(error instanceof TypeError) ? error.message : ''
      setErrorMessage(text || FEL_STANDARD)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={s.wrap}>
      <div>
        <h2 className="mb-4 text-kort text-ink-1">Skicka ett meddelande</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Namn */}
          <div>
            <label htmlFor="name" className={s.label}>
              Ditt namn
              <span className={s.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={s.field}
              placeholder="För- och efternamn"
            />
          </div>

          {/* E-post */}
          <div>
            <label htmlFor="email" className={s.label}>
              Din e-post
              <span className={s.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={s.field}
              placeholder="namn@exempel.se"
            />
          </div>

          {/* Ämne */}
          <div>
            <label htmlFor="subject" className={s.label}>
              Vad gäller ditt ärende?
              <span className={s.required}>*</span>
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              required
              value={formData.subject}
              onChange={handleInputChange}
              className={s.field}
              placeholder="En fråga om din prenumeration"
            />
          </div>

          {/* Meddelande */}
          <div>
            <label htmlFor="message" className={s.label}>
              Ditt meddelande
              <span className={s.required}>*</span>
            </label>
            <textarea
              name="message"
              id="message"
              rows={5}
              required
              value={formData.message}
              onChange={handleInputChange}
              className={s.textarea}
              placeholder="Berätta hur vi kan hjälpa dig"
            />
          </div>

          {/* Skicka-knapp */}
          <div>
            <button type="submit" disabled={isSubmitting} className={s.button()}>
              {isSubmitting ? (
                'Skickar'
              ) : (
                'Skicka'
              )}
            </button>

            {/* Bekräftelse */}
            {submitStatus === 'success' ? (
                <p
                  role="status"
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-positiv"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-positiv" aria-hidden="true" />
                  Tack för ditt meddelande. Vi svarar inom 24 timmar.
                </p>
            ) : null}

            {/* Fel */}
            {submitStatus === 'error' ? (
                <div
                  role="alert"
                  className="mt-3 flex items-start gap-2.5 rounded-lg border border-fel-kant bg-fel-mjuk p-3 text-fel"
                >
                  <IkonFel size={20} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Det gick inte att skicka</p>
                    <p className="mt-0.5 text-sm leading-[22px] text-fel-morker">
                      {errorMessage || 'Försök igen, eller maila oss direkt.'}
                    </p>
                  </div>
                </div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}
