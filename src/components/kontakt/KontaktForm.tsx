/**
 * Fil: src/components/kontakt/KontaktForm.tsx
 *
 * Beskrivning:
 * Återanvändbart kontaktformulär för den publika sidan och dashboarden.
 * Hanterar state, validering och submission.
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

interface KontaktFormProps {
  variant?: 'public' | 'dashboard'
  onSubmitSuccess?: () => void
}

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
  wrap: 'rounded-xl border border-kant bg-panel p-4 sm:p-5',
  label: 'block text-sm font-medium text-ink-1 mb-1.5',
  required: 'text-ink-3 ml-1',
  field:
    'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-kant-stark focus:bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
  textarea:
    'w-full rounded-lg border border-kant bg-insunken px-3 py-2.5 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 resize-none focus:border-kant-stark focus:bg-panel focus:outline-none focus:ring-2 focus:ring-accent',
  button: () =>
    'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto',
}

export default function KontaktForm({ variant = 'public', onSubmitSuccess }: KontaktFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

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

    try {
      console.log("Skickar formulär:", formData)
      // Simulera API-anrop
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Enkel validering
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        throw new Error("Alla fält måste fyllas i.")
      }

      // -- HÄR SKICKAS DATAN TILL DIN BACKEND --
      // const response = await fetch('/api/contact', { method: 'POST', ... });
      // if (!response.ok) throw new Error('Något gick fel.');

      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      onSubmitSuccess?.()
    } catch (error: any) {
      console.error("Fel vid skickande:", error)
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Ett oväntat fel inträffade. Försök igen senare.')
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
              placeholder="Till exempel en fråga om Premium"
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
                  Tack för ditt meddelande. Vi svarar inom 24 timmar.
                </p>
              ) : (
                <div className="mt-4 flex items-start p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-md">
                  <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm sm:text-base">Tack för ditt meddelande!</p>
                    <p className="text-emerald-700 text-xs sm:text-sm mt-1">Vi svarar inom 24 timmar.</p>
                  </div>
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
                <div className="mt-4 flex items-start p-4 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-md">
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
