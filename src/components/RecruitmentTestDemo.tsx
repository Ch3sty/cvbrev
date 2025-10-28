'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid3x3, BookOpen, Calculator, CheckCircle, Clock,
  TrendingUp, Brain, Sparkles
} from 'lucide-react'

interface TestScenario {
  id: string
  type: 'matrislogik' | 'verbal' | 'numerisk'
  name: string
  description: string
  icon: typeof Grid3x3
  color: string
  gradient: string
  questions: number
  time: string
  difficulty: 'Grund' | 'Avancerad'
  example: {
    question: string
    answer: string
    explanation: string
  }
}

const scenarios: TestScenario[] = [
  {
    id: 'matrislogik',
    type: 'matrislogik',
    name: 'Matrislogik',
    description: 'Identifiera mönster i 3×3 matriser',
    icon: Grid3x3,
    color: 'purple',
    gradient: 'from-purple-600 to-indigo-600',
    questions: 15,
    time: '25 min',
    difficulty: 'Grund',
    example: {
      question: 'Vilken figur passar in?',
      answer: 'Rotation 90° medurs',
      explanation: 'Mönstret roterar figurerna stegvis i varje rad'
    }
  },
  {
    id: 'verbal',
    type: 'verbal',
    name: 'Verbalt Resonemang',
    description: 'Läsförståelse och kritiskt tänkande',
    icon: BookOpen,
    color: 'green',
    gradient: 'from-green-600 to-emerald-600',
    questions: 12,
    time: '25 min',
    difficulty: 'Grund',
    example: {
      question: 'Bedöm påståendet utifrån texten',
      answer: 'Sant / Falskt / Kan ej avgöra',
      explanation: 'Basera ditt svar endast på given information'
    }
  },
  {
    id: 'numerisk',
    type: 'numerisk',
    name: 'Numeriskt Resonemang',
    description: 'Affärsanalys och grafläsning',
    icon: Calculator,
    color: 'blue',
    gradient: 'from-blue-600 to-cyan-600',
    questions: 20,
    time: '20 min',
    difficulty: 'Grund',
    example: {
      question: 'Tolka diagrammet och beräkna',
      answer: '45% ökning sedan Q1',
      explanation: 'Jämför värdena och beräkna procentförändring'
    }
  }
]

const trainingSteps = [
  { icon: Brain, label: 'Välj testtyp', detail: '3 olika tester' },
  { icon: Sparkles, label: 'Träna', detail: 'Realistiska frågor' },
  { icon: CheckCircle, label: 'Se lösningar', detail: 'Steg-för-steg' },
  { icon: TrendingUp, label: 'Förbättra', detail: 'Spåra framsteg' }
]

export default function RecruitmentTestDemo() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [progress, setProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [showExample, setShowExample] = useState(false)

  const scenario = scenarios[currentScenario]
  const Icon = scenario.icon

  // Rotation logic: change scenario every 10 seconds
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setCurrentScenario((prev) => (prev + 1) % scenarios.length)
      setProgress(0)
      setActiveStep(0)
      setShowExample(false)
    }, 10000)

    return () => clearInterval(rotationInterval)
  }, [])

  // Progress bar animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / 100 // 10 seconds = 100 * 100ms
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
        if (prev < trainingSteps.length - 1) {
          return prev + 1
        } else {
          setShowExample(true)
          return prev
        }
      })
    }, stepDuration)

    return () => clearInterval(stepInterval)
  }, [currentScenario])

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-50 to-white rounded-3xl border-2 border-slate-200 p-8 shadow-xl overflow-hidden">
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${scenario.gradient} opacity-10 rounded-full blur-3xl`} />

      <div className="relative z-10">
        {/* Test type header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scenario.gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Tränar på:</p>
              <h3 className="text-xl font-bold text-slate-900">{scenario.name}</h3>
            </div>
          </div>

          {/* Scenario indicators */}
          <div className="flex gap-2">
            {scenarios.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentScenario
                    ? `w-8 bg-gradient-to-r ${scenario.gradient}`
                    : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Description and stats */}
        <div className="mb-6">
          <p className="text-slate-700 mb-4">{scenario.description}</p>
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1.5 bg-${scenario.color}-50 text-${scenario.color}-700 text-sm rounded-lg border border-${scenario.color}-200 font-medium`}>
              {scenario.questions} frågor
            </span>
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg border border-slate-200 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {scenario.time}
            </span>
            <span className={`px-3 py-1.5 bg-gradient-to-r ${scenario.gradient} text-white text-sm rounded-lg font-medium`}>
              {scenario.difficulty}
            </span>
          </div>
        </div>

        {/* Training steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {trainingSteps.map((step, idx) => {
              const StepIcon = step.icon
              const isActive = idx === activeStep
              const isCompleted = idx < activeStep

              return (
                <div key={idx} className="flex flex-col items-center relative flex-1">
                  {/* Connecting line */}
                  {idx < trainingSteps.length - 1 && (
                    <div className={`absolute top-5 left-1/2 w-full h-0.5 transition-all duration-500 ${
                      isCompleted ? `bg-gradient-to-r ${scenario.gradient}` : 'bg-slate-200'
                    }`} />
                  )}

                  {/* Step circle */}
                  <motion.div
                    animate={{
                      scale: isActive ? [1, 1.15, 1] : 1,
                    }}
                    transition={{
                      duration: 1,
                      repeat: isActive ? Infinity : 0,
                    }}
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive || isCompleted
                        ? `bg-gradient-to-br ${scenario.gradient} text-white shadow-lg`
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </motion.div>

                  {/* Step label */}
                  <div className="text-center mt-2">
                    <p className={`text-xs font-semibold transition-colors ${
                      isActive || isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500">{step.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Example question card */}
        <AnimatePresence mode="wait">
          {showExample && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl border-2 border-slate-200 p-5 shadow-md"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${scenario.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 mb-1">Exempelfråga:</p>
                  <p className="text-sm text-slate-700">{scenario.example.question}</p>
                </div>
              </div>

              <div className="pl-11 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-900">Korrekt svar:</p>
                    <p className="text-sm text-slate-700">{scenario.example.answer}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Brain className={`w-4 h-4 text-${scenario.color}-600 mt-0.5 flex-shrink-0`} />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Förklaring:</p>
                    <p className="text-sm text-slate-600">{scenario.example.explanation}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${scenario.gradient}`}
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
