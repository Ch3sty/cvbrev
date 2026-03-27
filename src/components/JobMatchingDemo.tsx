'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Search, Target, CheckCircle,
  Sparkles, TrendingUp, MapPin, Briefcase
} from 'lucide-react'

interface MatchScenario {
  id: string
  persona: string
  role: string
  cvHighlights: string[]
  searchQuery: string
  jobs: Array<{
    title: string
    company: string
    location: string
    match: number
  }>
}

const scenarios: MatchScenario[] = [
  {
    id: 'it-developer',
    persona: 'Sofia',
    role: 'Fullstack-utvecklare',
    cvHighlights: ['React', 'Node.js', '5 års erfarenhet', 'Stockholm'],
    searchQuery: 'Söker React-utvecklare...',
    jobs: [
      { title: 'Senior React Developer', company: 'Tech AB', location: 'Stockholm', match: 94 },
      { title: 'Fullstack Developer', company: 'Startup Inc', location: 'Stockholm', match: 87 },
      { title: 'Frontend Lead', company: 'Digital Agency', location: 'Stockholm', match: 82 }
    ]
  },
  {
    id: 'economist',
    persona: 'Marcus',
    role: 'Redovisningsekonom',
    cvHighlights: ['Redovisning', 'Excel', '3 års erfarenhet', 'Göteborg'],
    searchQuery: 'Söker redovisningsekonom...',
    jobs: [
      { title: 'Redovisningsekonom', company: 'Revision AB', location: 'Göteborg', match: 91 },
      { title: 'Controller', company: 'Finance Group', location: 'Göteborg', match: 78 },
      { title: 'Ekonomiassistent', company: 'SME Consulting', location: 'Göteborg', match: 73 }
    ]
  },
  {
    id: 'graduate',
    persona: 'Emma',
    role: 'Civilekonom',
    cvHighlights: ['Civilekonom', 'Praktik 6 mån', 'Excel, PowerBI', 'Malmö'],
    searchQuery: 'Söker ekonomijobb...',
    jobs: [
      { title: 'Junior Analytiker', company: 'Konsult AB', location: 'Malmö', match: 85 },
      { title: 'Trainee Program', company: 'Big Corp', location: 'Malmö', match: 81 },
      { title: 'Ekonomiassistent', company: 'Local Business', location: 'Malmö', match: 76 }
    ]
  },
  {
    id: 'project-manager',
    persona: 'Anders',
    role: 'Projektledare',
    cvHighlights: ['Agile', 'Scrum Master', '7 års erfarenhet', 'Uppsala'],
    searchQuery: 'Söker projektledare...',
    jobs: [
      { title: 'Senior Projektledare', company: 'Consulting Group', location: 'Uppsala', match: 92 },
      { title: 'Agile Coach', company: 'Tech Startup', location: 'Uppsala', match: 84 },
      { title: 'Product Owner', company: 'SaaS Company', location: 'Uppsala', match: 79 }
    ]
  }
]

const processSteps = [
  {
    icon: Upload,
    title: 'Ladda upp CV',
    subtitle: 'En fil på sekunder',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    icon: Sparkles,
    title: 'Extraherar kompetens',
    subtitle: 'Läser och tolkar jobbannonsen',
    color: 'from-purple-600 to-pink-600'
  },
  {
    icon: Search,
    title: 'Söker i databas',
    subtitle: 'Arbetsförmedlingen API',
    color: 'from-orange-600 to-red-600'
  },
  {
    icon: Target,
    title: 'Beräknar matchning',
    subtitle: 'Relevanspoäng 0-100%',
    color: 'from-green-600 to-emerald-600'
  },
  {
    icon: CheckCircle,
    title: 'Klart!',
    subtitle: 'Se matchade jobb',
    color: 'from-indigo-600 to-purple-600'
  }
]

export default function JobMatchingDemo() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [progress, setProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [showJobs, setShowJobs] = useState(false)

  const scenario = scenarios[currentScenario]

  // Rotation logic: change scenario every 12 seconds
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setCurrentScenario((prev) => (prev + 1) % scenarios.length)
      setProgress(0)
      setActiveStep(0)
      setShowJobs(false)
    }, 12000)

    return () => clearInterval(rotationInterval)
  }, [])

  // Progress bar animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / 120 // 12 seconds = 120 * 100ms
        return next >= 100 ? 0 : next
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [currentScenario])

  // Step progression
  useEffect(() => {
    const stepDuration = 2000 // 2 seconds per step
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < processSteps.length - 1) {
          return prev + 1
        } else {
          setShowJobs(true)
          return prev
        }
      })
    }, stepDuration)

    return () => clearInterval(stepInterval)
  }, [currentScenario])

  const getMatchColor = (match: number) => {
    if (match >= 80) return 'from-green-500 to-emerald-500'
    if (match >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-gray-400 to-gray-500'
  }

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-50 to-white rounded-3xl border-2 border-slate-200 p-8 shadow-xl overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header with persona */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              {scenario.persona[0]}
            </div>
            <div>
              <p className="text-sm text-slate-600">Användare: {scenario.persona}</p>
              <p className="font-semibold text-slate-900">{scenario.role}</p>
            </div>
          </div>

          {/* Scenario indicators */}
          <div className="flex gap-2">
            {scenarios.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentScenario
                    ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CV Highlights */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-2">CV-innehåll:</p>
          <div className="flex flex-wrap gap-2">
            {scenario.cvHighlights.map((highlight, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {processSteps.map((step, idx) => {
              const StepIcon = step.icon
              const isActive = idx === activeStep
              const isCompleted = idx < activeStep

              return (
                <div key={idx} className="flex flex-col items-center relative">
                  {/* Connecting line */}
                  {idx < processSteps.length - 1 && (
                    <div className={`absolute top-6 left-1/2 w-full h-0.5 transition-all duration-500 ${
                      isCompleted ? 'bg-gradient-to-r ' + step.color : 'bg-slate-200'
                    }`} style={{ transform: 'translateX(50%)' }} />
                  )}

                  {/* Step circle */}
                  <motion.div
                    animate={{
                      scale: isActive ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      duration: 1,
                      repeat: isActive ? Infinity : 0,
                    }}
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive || isCompleted
                        ? 'bg-gradient-to-br ' + step.color + ' text-white shadow-lg'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </motion.div>

                  {/* Step label */}
                  <div className="text-center mt-2 w-20">
                    <p className={`text-xs font-medium transition-colors ${
                      isActive || isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Search Query Animation */}
          <AnimatePresence mode="wait">
            {activeStep >= 2 && activeStep < 4 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3"
              >
                <Search className="w-4 h-4 text-slate-400 animate-pulse" />
                <span className="text-sm text-slate-600">{scenario.searchQuery}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Job Results - Fixed height container to prevent layout shift */}
        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            {showJobs && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {scenario.jobs.length} matchade jobb
                  </p>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>

                {scenario.jobs.map((job, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{job.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {job.company}
                          </span>
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        </div>
                      </div>

                      {/* Match badge */}
                      <div className={`px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${getMatchColor(job.match)}`}>
                        {job.match}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
