/**
 * Fil: src/components/dashboard/bugg-feedback/BuggFeedbackForm.tsx
 *
 * Beskrivning:
 * Formulär för att rapportera buggar eller skicka feedback från dashboarden.
 * Skickar email via Resend till support@jobbcoach.ai.
 */
'use client'

import { useState, FormEvent } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import Segment from '@/components/shell/Segment'

const FALT =
  'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1'
const ETIKETT = 'mb-1 block text-sm font-medium text-ink-2'

type ReportType = 'bug' | 'feedback'

interface FormData {
  type: ReportType
  subject: string
  description: string
  urgency?: 'low' | 'medium' | 'high'
  url?: string
}

export default function BuggFeedbackForm() {
  const [reportType, setReportType] = useState<ReportType>('bug')
  const [formData, setFormData] = useState<FormData>({
    type: 'bug',
    subject: '',
    description: '',
    urgency: 'medium',
    url: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleTypeChange = (type: ReportType) => {
    setReportType(type)
    setFormData(prev => ({ ...prev, type }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Validering
      if (!formData.subject || !formData.description) {
        throw new Error('Vänligen fyll i alla obligatoriska fält.')
      }

      // Skicka till API
      const response = await fetch('/api/bugg-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Något gick fel vid skickandet.')
      }

      setSubmitStatus('success')
      // Rensa formulär
      setFormData({
        type: reportType,
        subject: '',
        description: '',
        urgency: 'medium',
        url: ''
      })

      // Återställ success-meddelande efter 5 sekunder
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)

    } catch (error: any) {
      console.error('Fel vid skickande:', error)
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Ett oväntat fel inträffade. Försök igen senare.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Segment
        value={reportType}
        onChange={handleTypeChange}
        label="Vad vill du skicka?"
        options={[
          { value: 'bug', label: 'Rapportera bugg' },
          { value: 'feedback', label: 'Skicka feedback' },
        ]}
      />

      <section className="rounded-xl border border-kant bg-panel p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-4">
            {/* Rubrik */}
            <div>
              <label htmlFor="subject" className={ETIKETT}>
                {reportType === 'bug' ? 'Kort beskrivning av buggen' : 'Vad gäller din feedback?'}
                <span className="ml-1 text-fel">*</span>
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className={FALT}
                placeholder={reportType === 'bug' ? 'T.ex. "CV-generering fastnar vid 50%"' : 'T.ex. "Förslag på mörkt tema"'}
              />
            </div>

            {/* Prioritet/Brådskande (endast för buggar) */}
            {reportType === 'bug' && (
              <div>
                <label htmlFor="urgency" className={ETIKETT}>
                  Hur allvarlig är buggen?
                </label>
                <select
                  name="urgency"
                  id="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className={FALT}
                >
                  <option value="low">Låg - Mindre problem, kan vänta</option>
                  <option value="medium">Medel - Påverkar användningen</option>
                  <option value="high">Hög - Kritisk, blockerar funktioner</option>
                </select>
              </div>
            )}

            {/* URL (valfritt) */}
            <div>
              <label htmlFor="url" className={ETIKETT}>
                URL där problemet uppstod (valfritt)
              </label>
              <input
                type="url"
                name="url"
                id="url"
                value={formData.url}
                onChange={handleInputChange}
                className={FALT}
                placeholder="https://www.jobbcoach.ai/dashboard/..."
              />
            </div>

            {/* Detaljerad beskrivning */}
            <div>
              <label htmlFor="description" className={ETIKETT}>
                {reportType === 'bug' ? 'Detaljerad beskrivning' : 'Din feedback'}
                <span className="ml-1 text-fel">*</span>
              </label>
              <textarea
                name="description"
                id="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleInputChange}
                className={`${FALT} h-auto resize-none py-2.5`}
                placeholder={
                  reportType === 'bug'
                    ? 'Beskriv vad som hände, vilka steg du tog, och vad du förväntade dig skulle hända...'
                    : 'Berätta mer om ditt förslag eller din feedback...'
                }
              />
              <p className="mt-1 block text-meta text-ink-3">
                {reportType === 'bug'
                  ? 'Tips: Inkludera steg för att återskapa buggen och eventuella felmeddelanden.'
                  : 'Vi uppskattar all feedback som hjälper oss att förbättra tjänsten!'}
              </p>
            </div>

            {/* Skicka-knapp */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
              >
                {isSubmitting
                  ? 'Skickar…'
                  : `Skicka ${reportType === 'bug' ? 'buggrapport' : 'feedback'}`}
              </button>

              {/* Success meddelande */}
              {submitStatus === 'success' && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-kant bg-panel p-4">
                  <CheckCircle
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-positiv"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-kort text-ink-1">
                      {reportType === 'bug' ? 'Buggrapporten är skickad' : 'Feedbacken är skickad'}
                    </p>
                    <p className="mt-1 text-meta text-ink-3">
                      Tack för att du hjälper oss att göra Jobbcoach.ai bättre.
                    </p>
                  </div>
                </div>
              )}

              {/* Error meddelande */}
              {submitStatus === 'error' && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-fel-kant bg-fel-mjuk p-4">
                  <AlertTriangle
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-fel"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-kort text-ink-1">Något gick fel</p>
                    <p className="mt-1 text-meta text-ink-3">
                      {errorMessage || 'Försök igen eller kontakta oss direkt på support@jobbcoach.ai'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
