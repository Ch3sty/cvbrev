/**
 * Fil: src/components/dashboard/bugg-feedback/BuggFeedbackForm.tsx
 *
 * Beskrivning:
 * Formulär för att rapportera buggar eller skicka feedback från dashboarden.
 * Skickar email via Resend till support@jobbcoach.ai.
 */
'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, MessageSquare, Send, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

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
    <div className="max-w-4xl">
      {/* Typ-väljare */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Vad vill du rapportera?</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Bugg-knapp */}
          <button
            type="button"
            onClick={() => handleTypeChange('bug')}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-200
              ${reportType === 'bug'
                ? 'border-red-500 bg-red-50 shadow-lg'
                : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/50'
              }
            `}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-3
                ${reportType === 'bug' ? 'bg-red-500' : 'bg-slate-200'}
              `}>
                <Bug className={`w-6 h-6 ${reportType === 'bug' ? 'text-white' : 'text-slate-600'}`} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Rapportera bugg</h3>
              <p className="text-sm text-slate-600">Något fungerar inte som det ska</p>
            </div>
            {reportType === 'bug' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </button>

          {/* Feedback-knapp */}
          <button
            type="button"
            onClick={() => handleTypeChange('feedback')}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-200
              ${reportType === 'feedback'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
              }
            `}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-3
                ${reportType === 'feedback' ? 'bg-blue-500' : 'bg-slate-200'}
              `}>
                <MessageSquare className={`w-6 h-6 ${reportType === 'feedback' ? 'text-white' : 'text-slate-600'}`} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Skicka feedback</h3>
              <p className="text-sm text-slate-600">Förslag och förbättringsidéer</p>
            </div>
            {reportType === 'feedback' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </button>
        </div>
      </div>

      {/* Formulär */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={reportType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Rubrik */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                {reportType === 'bug' ? 'Kort beskrivning av buggen' : 'Vad gäller din feedback?'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder={reportType === 'bug' ? 'T.ex. "CV-generering fastnar vid 50%"' : 'T.ex. "Förslag på mörkt tema"'}
              />
            </div>

            {/* Prioritet/Brådskande (endast för buggar) */}
            {reportType === 'bug' && (
              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-slate-700 mb-2">
                  Hur allvarlig är buggen?
                </label>
                <select
                  name="urgency"
                  id="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="low">Låg - Mindre problem, kan vänta</option>
                  <option value="medium">Medel - Påverkar användningen</option>
                  <option value="high">Hög - Kritisk, blockerar funktioner</option>
                </select>
              </div>
            )}

            {/* URL (valfritt) */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
                URL där problemet uppstod (valfritt)
              </label>
              <input
                type="url"
                name="url"
                id="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="https://jobbcoach.ai/dashboard/..."
              />
            </div>

            {/* Detaljerad beskrivning */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                {reportType === 'bug' ? 'Detaljerad beskrivning' : 'Din feedback'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                id="description"
                rows={6}
                required
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder={
                  reportType === 'bug'
                    ? 'Beskriv vad som hände, vilka steg du tog, och vad du förväntade dig skulle hända...'
                    : 'Berätta mer om ditt förslag eller din feedback...'
                }
              />
              <p className="text-xs text-slate-500 mt-2">
                {reportType === 'bug'
                  ? 'Tips: Inkludera steg för att återskapa buggen, felmeddelanden, eller skärmdumpar om möjligt.'
                  : 'Vi uppskattar all feedback som hjälper oss att förbättra tjänsten!'}
              </p>
            </div>

            {/* Skicka-knapp */}
            <div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full px-6 py-4 text-base font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center
                  ${isSubmitting
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                    : reportType === 'bug'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-xl hover:shadow-red-500/25'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-500/25'
                  }
                `}
                whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Skickar...
                  </>
                ) : (
                  <>
                    Skicka {reportType === 'bug' ? 'buggrapport' : 'feedback'}
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </motion.button>

              {/* Success meddelande */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 text-sm">
                      {reportType === 'bug' ? 'Buggrapport skickad!' : 'Feedback skickad!'}
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Tack för att du hjälper oss förbättra Jobbcoach.ai! Vi återkommer så snart som möjligt.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Error meddelande */}
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 mr-3 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 text-sm">Något gick fel</p>
                    <p className="text-red-700 text-sm mt-1">
                      {errorMessage || 'Försök igen eller kontakta oss direkt på support@jobbcoach.ai'}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </form>
    </div>
  )
}
