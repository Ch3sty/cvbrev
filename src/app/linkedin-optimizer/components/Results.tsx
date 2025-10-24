'use client'

import { useState } from 'react'
import { Check, Copy, Download, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { createCVFromLinkedIn } from '@/lib/linkedin/linkedin-to-cv-converter'

interface SectionResult {
  optimized: string
  score_before: number
  score_after: number
  improvements: string[]
}

interface ResultsProps {
  originalSections: {
    about: string
    experience: string
    education?: string
    skills?: string
  }
  optimizedSections: {
    about: SectionResult
    experience: SectionResult
    education?: SectionResult
    skills?: SectionResult
  }
  overall_score_before: number
  overall_score_after: number
  onStartOver: () => void
}

export default function Results({
  originalSections,
  optimizedSections,
  overall_score_before,
  overall_score_after,
  onStartOver
}: ResultsProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [isSavingCV, setIsSavingCV] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const router = useRouter()

  const copyToClipboard = async (text: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(sectionName)
      setTimeout(() => setCopiedSection(null), 2000)
      toast.success('✓ Kopierat! Klistra nu in på LinkedIn', {
        position: 'bottom-right',
        autoClose: 3000
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Kunde inte kopiera text', {
        position: 'bottom-right'
      })
    }
  }

  const handleSaveAsCV = async () => {
    setIsSavingCV(true)
    setSaveError(null)

    try {
      // Get current user
      const response = await fetch('/api/auth/user')
      if (!response.ok) {
        throw new Error('Du måste vara inloggad')
      }

      const { user } = await response.json()

      // Create CV from LinkedIn data
      const cvId = await createCVFromLinkedIn(
        user.id,
        optimizedSections,
        user.email,
        user.user_metadata?.full_name
      )

      // Show success and redirect to CV builder/editor
      toast.success('✓ CV sparat! Omdirigerar till CV-redigeraren...', {
        position: 'bottom-right',
        autoClose: 2000
      })

      setTimeout(() => {
        router.push(`/dashboard/cv-mallar?cv=${cvId}`)
      }, 2000)
    } catch (error) {
      console.error('Error saving CV:', error)
      const errorMessage = error instanceof Error ? error.message : 'Kunde inte spara som CV'
      setSaveError(errorMessage)
      toast.error(errorMessage, {
        position: 'bottom-right'
      })
    } finally {
      setIsSavingCV(false)
    }
  }

  const copyAllForLinkedIn = async () => {
    const allText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OM MIG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${optimizedSections.about.optimized}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERFARENHET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${optimizedSections.experience.optimized}

${optimizedSections.education ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UTBILDNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${optimizedSections.education.optimized}

` : ''}${optimizedSections.skills ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KOMPETENSER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${optimizedSections.skills.optimized}` : ''}`

    await copyToClipboard(allText, 'all')
  }

  const scoreImprovement = overall_score_after - overall_score_before

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">Analys klar!</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Din profil är nu mycket starkare!
            </h1>
            <div className="flex items-center justify-center gap-4 text-lg">
              <span className="text-gray-600">Vi har förbättrat din profil från</span>
              <span className="font-bold text-red-600">{overall_score_before}/100</span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <span className="font-bold text-green-600">{overall_score_after}/100</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                +{scoreImprovement}
              </span>
            </div>
          </div>

          {/* Action Buttons at Top */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={copyAllForLinkedIn}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Copy className="w-5 h-5" />
              {copiedSection === 'all' ? '✓ Kopierat!' : 'Kopiera allt för LinkedIn'}
            </button>
            <button
              onClick={handleSaveAsCV}
              disabled={isSavingCV}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-pink-500 hover:text-pink-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingCV ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sparar...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Spara som CV i Jobbcoach.ai
                </>
              )}
            </button>
          </div>

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-8">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{saveError}</p>
            </div>
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8" />

          {/* Om mig Section */}
          <SectionComparison
            title="📝 OM MIG"
            originalText={originalSections.about}
            optimizedText={optimizedSections.about.optimized}
            scoreBefore={optimizedSections.about.score_before}
            scoreAfter={optimizedSections.about.score_after}
            improvements={optimizedSections.about.improvements}
            onCopy={() => copyToClipboard(optimizedSections.about.optimized, 'about')}
            isCopied={copiedSection === 'about'}
          />

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8" />

          {/* Erfarenhet Section */}
          <SectionComparison
            title="💼 ERFARENHET"
            originalText={originalSections.experience}
            optimizedText={optimizedSections.experience.optimized}
            scoreBefore={optimizedSections.experience.score_before}
            scoreAfter={optimizedSections.experience.score_after}
            improvements={optimizedSections.experience.improvements}
            onCopy={() => copyToClipboard(optimizedSections.experience.optimized, 'experience')}
            isCopied={copiedSection === 'experience'}
          />

          {/* Utbildning Section (if present) */}
          {optimizedSections.education && originalSections.education && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8" />
              <SectionComparison
                title="🎓 UTBILDNING"
                originalText={originalSections.education}
                optimizedText={optimizedSections.education.optimized}
                scoreBefore={optimizedSections.education.score_before}
                scoreAfter={optimizedSections.education.score_after}
                improvements={optimizedSections.education.improvements}
                onCopy={() => copyToClipboard(optimizedSections.education?.optimized ?? '', 'education')}
                isCopied={copiedSection === 'education'}
              />
            </>
          )}

          {/* Kompetenser Section (if present) */}
          {optimizedSections.skills && originalSections.skills && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8" />
              <SectionComparison
                title="🔧 KOMPETENSER"
                originalText={originalSections.skills}
                optimizedText={optimizedSections.skills.optimized}
                scoreBefore={optimizedSections.skills.score_before}
                scoreAfter={optimizedSections.skills.score_after}
                improvements={optimizedSections.skills.improvements}
                onCopy={() => copyToClipboard(optimizedSections.skills?.optimized ?? '', 'skills')}
                isCopied={copiedSection === 'skills'}
              />
            </>
          )}

          {/* Bottom Actions */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <button
              onClick={onStartOver}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
            >
              Analysera en ny profil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SectionComparisonProps {
  title: string
  originalText: string
  optimizedText: string
  scoreBefore: number
  scoreAfter: number
  improvements: string[]
  onCopy: () => void
  isCopied: boolean
}

function SectionComparison({
  title,
  originalText,
  optimizedText,
  scoreBefore,
  scoreAfter,
  improvements,
  onCopy,
  isCopied
}: SectionComparisonProps) {
  const scoreImprovement = scoreAfter - scoreBefore

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">{scoreBefore}</span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <span className="font-bold text-green-600">{scoreAfter}</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            +{scoreImprovement}
          </span>
        </div>
      </div>

      {/* Comparison Box */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Original Version */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2 uppercase tracking-wide text-sm">
            Din Version
          </h3>
          <div className="w-full h-px bg-gray-200 mb-3" />
          <p className="text-gray-700 whitespace-pre-wrap">{originalText}</p>
        </div>

        {/* Optimized Version */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✨</span>
            <h3 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">
              Förbättrad Version
            </h3>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-pink-200 to-purple-200 mb-3" />
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{optimizedText}</p>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={onCopy}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Kopierat!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Kopiera text
                </>
              )}
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-pink-500 hover:text-pink-600 transition-all">
              Använd denna version
            </button>
          </div>
        </div>

        {/* Improvements List */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Vad har vi förbättrat?</h4>
          <ul className="space-y-2">
            {improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
