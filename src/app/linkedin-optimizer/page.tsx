'use client'

import { useState } from 'react'
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Results from './components/Results'

type OptimizationMode = 'stand_out' | 'target_role'

interface LinkedInSections {
  about: string
  experience: string
  education: string
  skills: string
}

interface OptimizationResults {
  sections: {
    about: {
      optimized: string
      score_before: number
      score_after: number
      improvements: string[]
    }
    experience: {
      optimized: string
      score_before: number
      score_after: number
      improvements: string[]
    }
    education?: {
      optimized: string
      score_before: number
      score_after: number
      improvements: string[]
    }
    skills?: {
      optimized: string
      score_before: number
      score_after: number
      improvements: string[]
    }
  }
  overall_score_before: number
  overall_score_after: number
}

export default function LinkedInOptimizerPage() {
  const [sections, setSections] = useState<LinkedInSections>({
    about: '',
    experience: '',
    education: '',
    skills: ''
  })
  const [mode, setMode] = useState<OptimizationMode>('stand_out')
  const [targetRole, setTargetRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<OptimizationResults | null>(null)

  const handleSectionChange = (section: keyof LinkedInSections, value: string) => {
    setSections(prev => ({ ...prev, [section]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!sections.about.trim()) {
      setError('Du måste fylla i "Om mig"-sektionen')
      return
    }
    if (!sections.experience.trim()) {
      setError('Du måste fylla i "Erfarenhet"-sektionen')
      return
    }
    if (mode === 'target_role' && !targetRole.trim()) {
      setError('Du måste ange vilken roll du vill optimera för')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/linkedin/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections,
          mode,
          target_role: mode === 'target_role' ? targetRole : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel')
      }

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel. Försök igen.')
    } finally {
      setIsLoading(false)
    }
  }

  if (results) {
    return (
      <>
        <Results
          originalSections={sections}
          optimizedSections={results.sections}
          overall_score_before={results.overall_score_before}
          overall_score_after={results.overall_score_after}
          onStartOver={() => {
            setResults(null)
            setSections({ about: '', experience: '', education: '', skills: '' })
            setTargetRole('')
          }}
        />
        <ToastContainer />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <span className="text-sm font-semibold text-gray-900">LinkedIn Profiloptimering</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Gör din LinkedIn-profil mer synlig
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Få konkreta förbättringsförslag från AI som hjälper dig sticka ut och nå fler rekryterare.
            </p>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Så här gör du:</h3>
              <ol className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Öppna din LinkedIn-profil i en ny flik</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Kopiera varje sektion och klistra in nedan</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Vi analyserar och ger dig förbättringsförslag</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mode Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vad vill du uppnå?</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-300 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="stand_out"
                    checked={mode === 'stand_out'}
                    onChange={(e) => setMode(e.target.value as OptimizationMode)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Få min profil att sticka ut mer</div>
                    <div className="text-sm text-gray-600">Allmän optimering för att göra din profil mer professionell och attraktiv</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-300 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="target_role"
                    checked={mode === 'target_role'}
                    onChange={(e) => setMode(e.target.value as OptimizationMode)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Optimera för en specifik roll</div>
                    <div className="text-sm text-gray-600 mb-3">Anpassa din profil för att matcha en specifik position</div>
                    {mode === 'target_role' && (
                      <input
                        type="text"
                        placeholder="T.ex. VD, Projektledare, UX Designer..."
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* LinkedIn Sections */}
            <div className="space-y-6">
              {/* Om mig */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📝</span>
                    <span className="text-lg font-semibold text-gray-900">OM MIG</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Kopiera din "Om mig"-sektion från LinkedIn:
                  </p>
                  <textarea
                    value={sections.about}
                    onChange={(e) => handleSectionChange('about', e.target.value)}
                    rows={8}
                    placeholder="Exempel: Med passion och engagemang leder jag..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                </label>
              </div>

              {/* Erfarenhet */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">💼</span>
                    <span className="text-lg font-semibold text-gray-900">ERFARENHET</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Kopiera all din arbetserfarenhet från LinkedIn:
                  </p>
                  <textarea
                    value={sections.experience}
                    onChange={(e) => handleSectionChange('experience', e.target.value)}
                    rows={12}
                    placeholder="Inkludera företag, titlar, datum och beskrivningar"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                </label>
              </div>

              {/* Utbildning */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🎓</span>
                    <span className="text-lg font-semibold text-gray-900">UTBILDNING</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Kopiera din utbildning från LinkedIn:
                  </p>
                  <textarea
                    value={sections.education}
                    onChange={(e) => handleSectionChange('education', e.target.value)}
                    rows={6}
                    placeholder="Inkludera skolor, program och datum"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                </label>
              </div>

              {/* Kompetenser */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔧</span>
                    <span className="text-lg font-semibold text-gray-900">KOMPETENSER</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Kopiera dina kompetenser från LinkedIn:
                  </p>
                  <textarea
                    value={sections.skills}
                    onChange={(e) => handleSectionChange('skills', e.target.value)}
                    rows={5}
                    placeholder='Exempel: "SEO, WordPress, Marknadsföring..."'
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyserar din profil...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analysera & Förbättra min profil
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 flex items-center gap-2">
                🔒 Din data är trygg och raderas efter analys
              </p>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
