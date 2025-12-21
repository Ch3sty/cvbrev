'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Linkedin, Sparkles, TrendingUp, FileText, Award } from 'lucide-react'

interface AnalysisProgressStepProps {
  isAnalyzing: boolean
}

const ANALYSIS_STEPS = [
  { icon: FileText, label: 'Läser din profil', duration: 2000 },
  { icon: TrendingUp, label: 'Analyserar språk och ton', duration: 2500 },
  { icon: Sparkles, label: 'Identifierar förbättringsområden', duration: 3000 },
  { icon: Award, label: 'Genererar optimerad text', duration: 2500 }
]

export default function AnalysisProgressStep({ isAnalyzing }: AnalysisProgressStepProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) return

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        return prev + 1
      })
    }, 100)

    // Step progression
    const totalDuration = ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0)
    let elapsed = 0

    const stepInterval = setInterval(() => {
      elapsed += 100
      const stepProgress = ANALYSIS_STEPS.reduce((acc, step, index) => {
        if (index < currentStepIndex) return acc + step.duration
        return acc
      }, 0)

      if (elapsed > stepProgress + ANALYSIS_STEPS[currentStepIndex]?.duration) {
        setCurrentStepIndex(prev => Math.min(prev + 1, ANALYSIS_STEPS.length - 1))
      }
    }, 100)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [isAnalyzing, currentStepIndex])

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-5 h-5 text-pink-600" />
          </motion.div>
          <span className="text-sm font-semibold text-pink-600">Vi arbetar</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Optimerar din LinkedIn-profil
        </h1>
        <p className="text-lg text-gray-600">
          Vi analyserar varje sektion och skapar en förbättrad version
        </p>
      </motion.div>

      {/* LinkedIn Logo Animation with enhanced effects */}
      <div className="flex justify-center mb-12 relative">
        {/* Pulsing rings */}
        <motion.div
          className="absolute w-32 h-32"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="w-full h-full border-4 border-pink-500/30 rounded-2xl" />
        </motion.div>
        <motion.div
          className="absolute w-32 h-32"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{
            duration: 2,
            delay: 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="w-full h-full border-4 border-purple-500/30 rounded-2xl" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="relative w-24 h-24 bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-pink-500/30"
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          <Linkedin className="w-14 h-14 text-white relative z-10" />
        </motion.div>
      </div>

      {/* Progress Bar with enhanced design */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Framsteg</span>
          <motion.span
            key={Math.round(progress)}
            initial={{ scale: 1.2, color: '#db2777' }}
            animate={{ scale: 1, color: '#1e293b' }}
            className="text-lg font-bold text-pink-600"
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
        <div className="w-full h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full rounded-full relative"
            style={{
              background: 'linear-gradient(90deg, #db2777 0%, #a855f7 50%, #8b5cf6 100%)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-400/50 to-purple-400/50 blur-sm"
              animate={{
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>
        </div>

        {/* Progress milestones */}
        <div className="flex justify-between mt-2 px-1">
          {[25, 50, 75, 100].map((milestone) => (
            <motion.div
              key={milestone}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: progress >= milestone ? 1 : 0.3,
                scale: progress >= milestone ? 1.1 : 1
              }}
              className={`text-xs font-medium ${
                progress >= milestone ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {milestone}%
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analysis Steps */}
      <div className="space-y-4">
        {ANALYSIS_STEPS.map((step, index) => {
          const StepIcon = step.icon
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 5 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all shadow-sm relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-500 shadow-lg shadow-pink-500/20'
                  : isCompleted
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-[#83941f] shadow-md'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {/* Shimmer effect for active step */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              )}
              {/* Icon */}
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                  isActive
                    ? 'bg-gradient-to-br from-pink-600 to-purple-600 shadow-lg shadow-pink-500/50'
                    : isCompleted
                    ? 'bg-gradient-to-br from-[#83941f] to-[#6b7e1a] shadow-md'
                    : 'bg-gray-300'
                }`}
                animate={
                  isActive
                    ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <StepIcon className="w-6 h-6 text-white" />

                {/* Pulsing ring for active step */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-pink-600"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <div className="flex-1">
                <div
                  className={`font-semibold ${
                    isActive
                      ? 'text-pink-600'
                      : isCompleted
                      ? 'text-[#83941f]'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </div>
              </div>

              {/* Status */}
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-xs font-medium text-pink-600"
                >
                  Pågår...
                </motion.div>
              )}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-medium text-[#83941f]"
                >
                  ✓ Klar
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Fun Facts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <div className="inline-block bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl px-6 py-4 border border-purple-200">
          <p className="text-sm text-gray-700">
            💡 <strong>Visste du?</strong> En optimerad LinkedIn-profil får i genomsnitt{' '}
            <span className="text-pink-600 font-bold">3x fler</span> profilvisningar
          </p>
        </div>
      </motion.div>
    </div>
  )
}
