'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, TrendingUp, CheckCircle, AlertCircle,
  FileText, Sparkles, Award, Clock
} from 'lucide-react'

interface CVScenario {
  role: string
  beforeText: string
  issues: {
    type: 'passive' | 'no-numbers' | 'generic'
    text: string
    position: number
  }[]
  atsScore: number
  scores: {
    structure: number
    language: number
    quantification: number
  }
  improvements: {
    title: string
    description: string
    impact: 'high' | 'medium'
  }[]
}

const scenarios: CVScenario[] = [
  {
    role: 'Projektledare',
    beforeText: `Arbetade med projekt inom IT-sektorn. Ansvarade för team och budget. Samarbetade med olika avdelningar för att leverera projekt i tid.`,
    issues: [
      { type: 'passive', text: 'Arbetade med', position: 0 },
      { type: 'no-numbers', text: 'team och budget', position: 45 },
      { type: 'generic', text: 'olika avdelningar', position: 78 }
    ],
    atsScore: 62,
    scores: {
      structure: 3,
      language: 2,
      quantification: 1
    },
    improvements: [
      {
        title: 'Lägg till kvantifierade resultat',
        description: 'Ändra "team och budget" till "team på 8 utvecklare med budget på 4,2 MSEK"',
        impact: 'high'
      },
      {
        title: 'Använd starkare verb',
        description: 'Byt "Arbetade med" mot "Ledde 12 IT-projekt"',
        impact: 'high'
      },
      {
        title: 'Specificera prestationer',
        description: 'Lägg till "vilket resulterade i 95% leveransprecision"',
        impact: 'medium'
      }
    ]
  },
  {
    role: 'Säljare B2B',
    beforeText: `Sålde produkter till företagskunder. Ansvarig för kundrelationer och hjälpte till att öka försäljningen. Arbetade mot olika branscher.`,
    issues: [
      { type: 'generic', text: 'Sålde produkter', position: 0 },
      { type: 'passive', text: 'hjälpte till att öka', position: 62 },
      { type: 'no-numbers', text: 'olika branscher', position: 98 }
    ],
    atsScore: 58,
    scores: {
      structure: 2,
      language: 2,
      quantification: 1
    },
    improvements: [
      {
        title: 'Kvantifiera försäljningsresultat',
        description: 'Ändra till "Ökade försäljningen med 142% från 2,1 MSEK till 5,1 MSEK på 18 månader"',
        impact: 'high'
      },
      {
        title: 'Specificera produkt och marknad',
        description: 'Byt "produkter till företagskunder" mot "SaaS-lösningar till 45+ företag inom fintech och e-handel"',
        impact: 'high'
      },
      {
        title: 'Visa ledarskap',
        description: 'Lägg till "Byggde och ledde säljteam från 0 till 4 personer"',
        impact: 'medium'
      }
    ]
  },
  {
    role: 'Utvecklare',
    beforeText: `Utvecklade applikationer med olika teknologier. Deltog i teamarbete och hjälpte till med kodgranskning. Arbetade agilt.`,
    issues: [
      { type: 'generic', text: 'olika teknologier', position: 28 },
      { type: 'passive', text: 'Deltog i teamarbete', position: 46 },
      { type: 'no-numbers', text: 'kodgranskning', position: 84 }
    ],
    atsScore: 65,
    scores: {
      structure: 3,
      language: 2,
      quantification: 2
    },
    improvements: [
      {
        title: 'Specificera tech stack',
        description: 'Ändra "olika teknologier" till "React, TypeScript, Node.js och PostgreSQL"',
        impact: 'high'
      },
      {
        title: 'Kvantifiera bidrag',
        description: 'Byt "hjälpte till med kodgranskning" mot "Granskade 200+ pull requests och reducerade bugs med 35%"',
        impact: 'high'
      },
      {
        title: 'Visa konkret impact',
        description: 'Lägg till "Optimerade API-responser från 450ms till 85ms"',
        impact: 'medium'
      }
    ]
  }
]

export default function CVAnalysisDemo() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showScores, setShowScores] = useState(false)
  const [visibleImprovements, setVisibleImprovements] = useState<number[]>([])
  const [highlightedIssues, setHighlightedIssues] = useState<string[]>([])

  const scenario = scenarios[currentScenario]

  // Rotate scenarios
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScenario((prev) => (prev + 1) % scenarios.length)
      setProgress(0)
      setShowScores(false)
      setVisibleImprovements([])
      setHighlightedIssues([])
    }, 18000) // 18 seconds per scenario

    return () => clearInterval(interval)
  }, [])

  // Animation sequence
  useEffect(() => {
    // Start progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    // Highlight issues progressively
    scenario.issues.forEach((issue, idx) => {
      setTimeout(() => {
        setHighlightedIssues(prev => [...prev, issue.type])
      }, 1000 + (idx * 800))
    })

    // Show scores
    setTimeout(() => {
      setShowScores(true)
    }, 3500)

    // Show improvements one by one
    scenario.improvements.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleImprovements(prev => [...prev, idx])
      }, 4500 + (idx * 1000))
    })

    return () => {
      clearInterval(progressInterval)
    }
  }, [currentScenario, scenario.issues, scenario.improvements])

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'passive':
        return 'bg-orange-100 border-orange-300'
      case 'no-numbers':
        return 'bg-red-100 border-red-300'
      case 'generic':
        return 'bg-yellow-100 border-yellow-300'
      default:
        return ''
    }
  }

  const highlightText = (text: string) => {
    let result = text

    scenario.issues.forEach(issue => {
      if (highlightedIssues.includes(issue.type)) {
        const colorClass = getIssueColor(issue.type)
        result = result.replace(
          issue.text,
          `<span class="${colorClass} px-1 py-0.5 rounded border">${issue.text}</span>`
        )
      }
    })

    return result
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: CV Text with Issues */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900">Ditt CV</h3>
          </div>

          {/* Role badge */}
          <div className="mb-4">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
              {scenario.role}
            </span>
          </div>

          {/* CV Text */}
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p
              className="text-sm text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightText(scenario.beforeText) }}
            />
          </div>

          {/* Issue Legend - Fixed height container to prevent layout shift */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 mb-2">Identifierade problem:</p>
            <div className="min-h-[72px]">
              <AnimatePresence>
                {highlightedIssues.includes('passive') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="text-slate-600">Passiva verb</span>
                  </motion.div>
                )}
                {highlightedIssues.includes('no-numbers') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-slate-600">Saknar siffror/resultat</span>
                  </motion.div>
                )}
                {highlightedIssues.includes('generic') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-slate-600">Generiska beskrivningar</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right: AI Feedback */}
        <motion.div
          className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-xl border border-orange-200"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <h3 className="font-bold text-slate-900">Detaljerad feedback</h3>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Analyserar...</span>
              <span className="text-sm font-bold text-orange-600">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* ATS Score */}
          {progress >= 50 && (
            <motion.div
              className="mb-6 p-4 bg-white rounded-xl border border-orange-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">ATS-Poäng</span>
                <motion.span
                  className="text-2xl font-bold text-orange-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {scenario.atsScore}/100
                </motion.span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-400 to-red-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${scenario.atsScore}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Category Scores */}
          {showScores && (
            <motion.div
              className="mb-6 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Struktur</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < scenario.scores.structure ? 'bg-blue-500' : 'bg-slate-200'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-slate-700">Språk</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < scenario.scores.language ? 'bg-purple-500' : 'bg-slate-200'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Kvantifiering</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < scenario.scores.quantification ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Improvements */}
          {visibleImprovements.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Förbättringsförslag:
              </p>
              {/* Fixed height container to prevent layout shift */}
              <div className="min-h-[320px]">
                <AnimatePresence>
                  {scenario.improvements.map((improvement, idx) =>
                    visibleImprovements.includes(idx) ? (
                      <motion.div
                        key={idx}
                        className="p-3 bg-white rounded-lg border border-green-200 mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 mb-1">
                              {improvement.title}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {improvement.description}
                            </p>
                          </div>
                          {improvement.impact === 'high' && (
                            <Award className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          )}
                        </div>
                      </motion.div>
                    ) : null
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Completion */}
          {progress === 100 && visibleImprovements.length === scenario.improvements.length && (
            <motion.div
              className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-700" />
                <span className="text-sm font-medium text-green-800">
                  Analys klar på 60 sekunder!
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scenario indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {scenarios.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentScenario(idx)
              setProgress(0)
              setShowScores(false)
              setVisibleImprovements([])
              setHighlightedIssues([])
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentScenario
                ? 'bg-orange-500 w-6'
                : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
