/**
 * Fil: src/components/kontakt/KontaktFormPublik.tsx
 *
 * Beskrivning:
 * Kontaktformuläret på den publika sidan (/kontakt). Skickar till
 * /api/contact, som utan inloggning tar den publika vägen (spec-rummen
 * 23.1): honungsfält, tre meddelanden per IP och dygn. Tack visas bara när
 * routen svarat 2xx, samma mönster som KontaktForm i inloggat läge.
 *
 * Publikt v2 (spec-publikt-v2-del-b avsnitt 3.8): ett lyft kort över
 * väggens kant med en h2, fälten och knappen ur publikt.css och
 * foretag.css. Dashboarden har sitt eget formulär (KontaktForm).
 */
'use client'

import { useState, FormEvent } from 'react'

interface KontaktFormProps {
  /** Bara den publika varianten finns; dashboarden använder KontaktForm. */
  variant?: 'public'
  onSubmitSuccess?: () => void
}

const FEL_STANDARD = 'Vi nådde inte fram. Fälten står kvar, tryck Skicka igen, eller maila support@jobbcoach.ai.'
const TACK = 'Tack. Vi läser allt och svarar från support@jobbcoach.ai.'

export default function KontaktFormPublik({ onSubmitSuccess }: KontaktFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  // Honungsfältet: osynligt för människor, robotar fyller i det.
  const [webbplats, setWebbplats] = useState('')

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
    <div className="pub-kort if-form-kort">
      <h2 className="pub-h3">Skicka ett meddelande</h2>
      <form onSubmit={handleSubmit} className="if-form">
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
        <div className="if-tva-falt">
          <div className="if-falt">
            <label htmlFor="name">Ditt namn</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="För- och efternamn"
            />
          </div>
          <div className="if-falt">
            <label htmlFor="email">Din e-post</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="namn@exempel.se"
            />
          </div>
        </div>
        <div className="if-falt">
          <label htmlFor="subject">Vad gäller ditt ärende?</label>
          <input
            type="text"
            name="subject"
            id="subject"
            required
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Fråga om min prenumeration"
          />
        </div>
        <div className="if-falt">
          <label htmlFor="message">Ditt meddelande</label>
          <textarea
            name="message"
            id="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Berätta hur vi kan hjälpa dig"
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="pub-knapp">
          {isSubmitting ? 'Skickar' : 'Skicka'}
        </button>
        {submitStatus === 'success' ? (
          <p role="status" className="if-svar if-svar-ok">
            {TACK}
          </p>
        ) : null}
        {submitStatus === 'error' ? (
          <div role="alert" className="if-svar if-svar-fel">
            <div>
              <b>Det gick inte att skicka</b>
              {errorMessage || 'Försök igen, eller maila oss direkt.'}
            </div>
          </div>
        ) : null}
      </form>
    </div>
  )
}
