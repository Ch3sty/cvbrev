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
    headline?: string
    about: string
    experience: string
    education?: string
    skills?: string
  }
  optimizedSections: {
    headline: SectionResult
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
  { key: 'headline', title: '💡 Rubrik', icon: '💡' },
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

        {/* Overall Score with Circular Progress */}
        <div className="flex items-center justify-center gap-6">
          {/* Before Score */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - overall_score_before / 100)}`}
                  className="text-red-500"
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - overall_score_before / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-red-600">{overall_score_before}</span>
                <span className="text-xs text-gray-500">före</span>
              </div>
            </div>
          </div>

          <ArrowRight className="w-8 h-8 text-gray-400" />

          {/* After Score */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="url(#greenGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - overall_score_after / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - overall_score_after / 100) }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-green-600">{overall_score_after}</span>
                <span className="text-xs text-gray-500">efter</span>
              </div>
            </div>
          </div>

          {/* Improvement Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 500 }}
            className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 rounded-xl"
          >
            <div className="text-2xl font-bold text-green-700">+{scoreImprovement}</div>
            <div className="text-xs text-green-600">förbättring</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Section Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {availableSections.map((section, index) => (
          <motion.button
            key={section.key}
            onClick={() => setActiveSection(index)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all relative ${
              activeSection === index
                ? 'bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {activeSection === index && (
              <motion.div
                layoutId="activeSection"
                className="absolute inset-0 bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 rounded-lg"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <span className="mr-2">{section.icon}</span>
              {section.title.replace(/[📝💼🎓🔧]\s/, '')}
            </span>
          </motion.button>
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
