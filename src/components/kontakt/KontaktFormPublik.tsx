/**
 * Fil: src/components/kontakt/KontaktFormPublik.tsx
 *
 * Beskrivning:
 * Kontaktformuläret på den publika sidan (/kontakt). Skickar till
 * /api/contact, som utan inloggning tar den publika vägen (spec-rummen
 * 23.1): honungsfält, tre meddelanden per IP och dygn. Tack visas bara när
 * routen svarat 2xx, samma mönster som KontaktForm i inloggat läge.
 *
 * Varianten dashboard följer Tråden (docs/design/designsystem-v2-utkast.md):
 * panel, insunkna fält, ink-knapp, bekräftelse och fel som rader utan
 * rörelse. Den publika varianten behåller sitt utseende tills den publika
 * omgången tas.
 */
'use client'

import { useState, FormEvent } from 'react'
import { Send, CheckCircle, AlertTriangle } from 'lucide-react'
import { IkonFel } from '@/components/illustrations/Ikoner'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'

interface KontaktFormProps {
  variant?: 'public' | 'dashboard'
  onSubmitSuccess?: () => void
}

const FEL_STANDARD = 'Vi nådde inte fram. Fälten står kvar, tryck Skicka igen, eller maila support@jobbcoach.ai.'
const TACK = 'Tack. Vi läser allt och svarar från support@jobbcoach.ai.'

const PUBLIC = {
  wrap: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl sm:rounded-2xl border border-purple-200 p-4 sm:p-6 shadow-lg relative overflow-hidden',
  label: 'block text-sm font-semibold text-slate-700 mb-2',
  required: 'text-red-500 ml-1',
  field:
    'w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base',
  textarea:
    'w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none touch-manipulation text-sm sm:text-base',
  button: (busy: boolean) =>
    `w-full px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center min-h-[48px] touch-manipulation ${
      busy
        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
    }`,
}

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

export default function KontaktFormPublik({ variant = 'public', onSubmitSuccess }: KontaktFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  // Honungsfältet: osynligt för människor, robotar fyller i det.
  const [webbplats, setWebbplats] = useState('')

  const isDashboard = variant === 'dashboard'
  const s = isDashboard ? DASHBOARD : PUBLIC

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
        body: JSON.stringify({ ...formData, webbplats }),
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
      {!isDashboard ? (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-8 translate-x-8" />
      ) : null}

      <div className="relative z-10">
        {isDashboard ? (
          <h2 className="mb-4 text-kort text-ink-1">Skicka ett meddelande</h2>
        ) : (
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Skicka ett meddelande</h2>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honungsfält: utanför skärmen, utan tabbstopp och dolt för skärmläsare. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="webbplats">Lämna tomt</label>
            <input
              type="text"
              name="webbplats"
              id="webbplats"
              tabIndex={-1}
              autoComplete="off"
              value={webbplats}
              onChange={e => setWebbplats(e.target.value)}
            />
          </div>

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
              placeholder="Fråga om min prenumeration"
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
            <button type="submit" disabled={isSubmitting} className={s.button(isSubmitting)}>
              {isSubmitting ? (
                'Skickar'
              ) : (
                <>
                  Skicka
                  {!isDashboard ? <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-2" /> : null}
                </>
              )}
            </button>

            {/* Bekräftelse */}
            {submitStatus === 'success' ? (
              isDashboard ? (
                <p
                  role="status"
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-positiv"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-positiv" aria-hidden="true" />
                  {TACK}
                </p>
              ) : (
                <div
                  role="status"
                  className="mt-4 flex items-start p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-md"
                >
                  <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="font-semibold text-emerald-900 text-sm sm:text-base">{TACK}</p>
                </div>
              )
            ) : null}

            {/* Fel */}
            {submitStatus === 'error' ? (
              isDashboard ? (
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
              ) : (
                <div
                  role="alert"
                  className="mt-4 flex items-start p-4 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-md"
                >
                  <AlertTriangle className="w-5 h-5 mr-3 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 text-sm sm:text-base">Något gick fel</p>
                    <p className="text-red-700 text-xs sm:text-sm mt-1">
                      {errorMessage || 'Försök igen eller maila oss direkt.'}
                    </p>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}
