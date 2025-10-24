'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface LinkedInProgressBarProps {
  currentStep: number
  steps: Array<{ id: number; title: string; subtitle?: string }>
}

export default function LinkedInProgressBar({ currentStep, steps }: LinkedInProgressBarProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 py-6 px-8 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: currentStep === index ? 1.1 : 1,
                    backgroundColor:
                      currentStep > index
                        ? '#0A66C2'
                        : currentStep === index
                        ? '#0A66C2'
                        : '#E5E7EB'
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                    currentStep >= index
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}
                >
                  {currentStep > index ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}

                  {/* Pulsing ring for current step */}
                  {currentStep === index && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#0A66C2]"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
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

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 bg-gray-200 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-[#0A66C2]"
                    initial={{ width: '0%' }}
                    animate={{
                      width: currentStep > index ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          ))}
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
