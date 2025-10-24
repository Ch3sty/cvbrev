'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, ArrowRight, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'

interface SectionResult {
  optimized: string
  score_before: number
  score_after: number
  improvements: string[]
}

interface ResultsStepProps {
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
  onNext: () => void
  onBack: () => void
}

const SECTIONS = [
  { key: 'about', title: '📝 Om mig', icon: '📝' },
  { key: 'experience', title: '💼 Erfarenhet', icon: '💼' },
  { key: 'education', title: '🎓 Utbildning', icon: '🎓', optional: true },
  { key: 'skills', title: '🔧 Kompetenser', icon: '🔧', optional: true }
]

export default function ResultsStep({
  originalSections,
  optimizedSections,
  overall_score_before,
  overall_score_after,
  onNext,
  onBack
}: ResultsStepProps) {
  const [activeSection, setActiveSection] = useState(0)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)

  const currentSectionKey = SECTIONS[activeSection].key as keyof typeof optimizedSections
  const currentSection = optimizedSections[currentSectionKey]
  const currentOriginal = originalSections[currentSectionKey]

  // Skip optional sections if not present
  const availableSections = SECTIONS.filter(s =>
    !s.optional || optimizedSections[s.key as keyof typeof optimizedSections]
  )

  const handleCopy = async (text: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(sectionName)
      setTimeout(() => setCopiedSection(null), 2000)
      toast.success('✓ Kopierat!', {
        position: 'bottom-right',
        autoClose: 2000
      })
    } catch (error) {
      toast.error('Kunde inte kopiera', { position: 'bottom-right' })
    }
  }

  const scoreImprovement = overall_score_after - overall_score_before
  const sectionImprovement = currentSection ? currentSection.score_after - currentSection.score_before : 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-sm font-semibold text-gray-900">Analys klar!</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Din profil är mycket starkare!
        </h1>

        {/* Overall Score */}
        <div className="flex items-center justify-center gap-4 text-lg">
          <span className="text-gray-600">Profilstyrka:</span>
          <span className="font-bold text-red-600">{overall_score_before}/100</span>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <span className="font-bold text-green-600">{overall_score_after}/100</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
            +{scoreImprovement}
          </span>
        </div>
      </motion.div>

      {/* Section Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {availableSections.map((section, index) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(index)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeSection === index
                ? 'bg-[#0A66C2] text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.title.replace(/[📝💼🎓🔧]\s/, '')}
          </button>
        ))}
      </div>

      {/* Section Score */}
      {currentSection && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-sm text-gray-600">{SECTIONS[activeSection].title}:</span>
          <span className="font-semibold text-gray-700">{currentSection.score_before}</span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <span className="font-bold text-green-600">{currentSection.score_after}</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            +{sectionImprovement}
          </span>
        </div>
      )}

      {/* Main Content */}
      {currentSection && (
        <motion.div
          key={currentSectionKey}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden"
        >
          {/* Toggle View */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {showOriginal ? 'Din ursprungliga version' : 'Optimerad version'}
            </h3>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded-lg transition-all"
            >
              {showOriginal ? (
                <>
                  <Eye className="w-4 h-4" />
                  Visa optimerad
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Visa original
                </>
              )}
            </button>
          </div>

          {/* Text Content */}
          <div className={`p-6 ${showOriginal ? 'bg-white' : 'bg-gradient-to-br from-blue-50/50 to-white'}`}>
            <div className="prose max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {showOriginal ? currentOriginal : currentSection.optimized}
              </p>
            </div>

            {!showOriginal && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Vad har vi förbättrat?
                </h4>
                <ul className="space-y-2">
                  {currentSection.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => handleCopy(currentSection.optimized, currentSectionKey)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {copiedSection === currentSectionKey ? (
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
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Tillbaka</span>
        </button>

        <div className="flex items-center gap-3">
          {activeSection < availableSections.length - 1 && (
            <button
              onClick={() => setActiveSection(activeSection + 1)}
              className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <span>Nästa sektion</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>Fortsätt till export</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
