'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface LinkedInProgressBarProps {
  currentStep: number
  steps: Array<{ id: number; title: string; subtitle?: string }>
  onStepClick?: (stepIndex: number) => void
  completedSteps?: number[]
}

export default function LinkedInProgressBar({ currentStep, steps, onStepClick, completedSteps = [] }: LinkedInProgressBarProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 py-6 px-8 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index)
            const isClickable = onStepClick && (isCompleted || index < currentStep)

            return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: currentStep === index ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                  onClick={() => isClickable && onStepClick(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-all ${
                    currentStep > index
                      ? 'bg-gradient-to-br from-[#0A66C2] to-[#0A66C2]/80 text-white shadow-lg shadow-blue-500/30'
                      : currentStep === index
                      ? 'bg-gradient-to-br from-[#0A66C2] to-[#0A66C2]/80 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-200 text-gray-400'
                  } ${isClickable ? 'cursor-pointer hover:scale-110 hover:shadow-xl' : ''}`}
                >
                  {currentStep > index ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}

                  {/* Enhanced pulsing ring for current step */}
                  {currentStep === index && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-[#0A66C2] bg-[#0A66C2]/10"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.7, 0, 0.7]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </>
                  )}
                </motion.div>

                {/* Step Title */}
                <div className="mt-2 text-center hidden md:block">
                  <div
                    className={`text-xs font-medium ${
                      currentStep >= index ? 'text-[#0A66C2]' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  {step.subtitle && (
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {step.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line with Gradient */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-1 bg-gray-200 rounded-full relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#0A66C2] via-blue-500 to-[#0A66C2] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                      width: currentStep > index ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    {/* Shimmer effect on active line */}
                    {currentStep > index && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      />
                    )}
                  </motion.div>
                </div>
              )}
            </div>
            )
          })}
        </div>

        {/* Mobile: Current Step Title */}
        <div className="md:hidden mt-4 text-center">
          <div className="text-sm font-semibold text-[#0A66C2]">
            {steps[currentStep]?.title}
          </div>
          {steps[currentStep]?.subtitle && (
            <div className="text-xs text-gray-500 mt-1">
              {steps[currentStep].subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
