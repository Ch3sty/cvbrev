'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Linkedin, Check, ArrowRight, Sparkles,
  FileText, Target, Award, TrendingUp
} from 'lucide-react'

/**
 * Animated demo showcasing LinkedIn optimization process
 * Similar to AILiveWriting but for LinkedIn profile optimization
 */

const DEMO_STEPS = [
  {
    id: 1,
    title: 'Kopierar din profil',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    content: {
      before: 'Projektledare på TechCorp AB',
      type: 'headline'
    }
  },
  {
    id: 2,
    title: 'Analyserar keywords',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    keywords: ['Agile', 'Scrum', 'Stakeholder Management', 'Digital Transformation', 'B2B SaaS']
  },
  {
    id: 3,
    title: 'Genererar optimerad version',
    icon: Sparkles,
    color: 'from-green-500 to-emerald-500',
    content: {
      after: 'Projektledare | Agil transformation & digitalisering | Stakeholder management inom fintech',
      type: 'headline'
    }
  },
  {
    id: 4,
    title: 'Klart att kopiera!',
    icon: Award,
    color: 'from-orange-500 to-red-500',
    stats: {
      before: 45,
      after: 92,
      improvement: '+47 poäng'
    }
  }
]

export default function LinkedInOptimizationDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (!isAnimating) return

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= DEMO_STEPS.length - 1) {
          // Reset after completing all steps
          return 0
        }
        return prev + 1
      })
    }, 3000) // 3 seconds per step

    return () => clearInterval(timer)
  }, [isAnimating])

  const step = DEMO_STEPS[currentStep]
  const StepIcon = step.icon

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main demo card */}
      <motion.div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Progress indicator */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">LinkedIn-optimering</span>
            </div>
            <span className="text-xs text-slate-500">
              Steg {currentStep + 1} av {DEMO_STEPS.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${step.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / DEMO_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content area */}
        <div className="p-8 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col"
            >
              {/* Step header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                  <StepIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-500">Optimerar din profil...</p>
                </div>
              </div>

              {/* Step-specific content */}
              {currentStep === 0 && (
                <div className="space-y-4 flex-1">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500 mb-2">Nuvarande Headline:</p>
                    <p className="text-slate-900 font-medium">{step.content?.before}</p>
                  </div>
                  <motion.div
                    className="flex items-center gap-2 text-sm text-blue-600"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    Läser din profiltext...
                  </motion.div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4 flex-1">
                  <p className="text-slate-600 mb-4">
                    Identifierade viktiga keywords för din bransch:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {step.keywords?.map((keyword, idx) => (
                      <motion.span
                        key={keyword}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                  <motion.div
                    className="flex items-center gap-2 text-sm text-purple-600 mt-4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                    Analyserar söktermer...
                  </motion.div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 flex-1">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-700 mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Optimerad Headline:
                    </p>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {step.content?.after}
                    </p>
                  </div>
                  <motion.div
                    className="bg-white rounded-xl p-4 border-2 border-green-200"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Innehåller nyckelord:</span>
                      <span className="text-sm font-bold text-green-600">6/6 ✓</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-slate-600">Längd:</span>
                      <span className="text-sm font-bold text-green-600">98 tecken ✓</span>
                    </div>
                  </motion.div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                      <p className="text-sm text-slate-600 mb-2">Före</p>
                      <p className="text-4xl font-bold text-red-600">{step.stats?.before}</p>
                      <p className="text-xs text-slate-500 mt-1">Matchningspoäng</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-sm text-slate-600 mb-2">Efter</p>
                      <p className="text-4xl font-bold text-green-600">{step.stats?.after}</p>
                      <p className="text-xs text-slate-500 mt-1">Matchningspoäng</p>
                    </div>
                  </div>

                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 text-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-bold text-lg">{step.stats?.improvement}</span>
                    </div>
                    <p className="text-sm opacity-90">Förbättring i synlighet</p>
                  </motion.div>

                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Klart att kopiera till LinkedIn!</span>
                  </div>
                </div>
              )}

              {/* Next step indicator */}
              {currentStep < DEMO_STEPS.length - 1 && (
                <motion.div
                  className="mt-6 flex items-center justify-end gap-2 text-sm text-slate-400"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span>Nästa steg</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step indicators */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex items-center justify-center gap-2">
            {DEMO_STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-8 bg-blue-600'
                    : idx < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.div
        className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Optimerad
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-4 -left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        5 min
      </motion.div>
    </div>
  )
}
