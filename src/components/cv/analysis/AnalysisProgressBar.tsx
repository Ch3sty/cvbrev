// src/components/cv/analysis/AnalysisProgressBar.tsx
'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon?: React.ElementType;
}

interface AnalysisProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export default function AnalysisProgressBar({
  steps,
  currentStep,
  completedSteps
}: AnalysisProgressBarProps) {
  const isStepCompleted = (stepIndex: number) => completedSteps.includes(stepIndex);
  const isStepCurrent = (stepIndex: number) => stepIndex === currentStep;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const completed = isStepCompleted(index);
          const current = isStepCurrent(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: current ? 1.1 : 1,
                    backgroundColor: completed
                      ? 'rgb(168, 85, 247)' // purple-500
                      : current
                      ? 'rgb(219, 39, 119)' // pink-600
                      : 'rgb(226, 232, 240)' // slate-200
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
                >
                  {completed ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-semibold ${
                      current ? 'text-white' : 'text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </motion.div>

                {/* Step Title */}
                <span className={`absolute -bottom-6 text-xs font-medium whitespace-nowrap ${
                  current ? 'text-pink-600' : completed ? 'text-purple-600' : 'text-slate-500'
                }`}>
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 relative">
                  <div className="absolute inset-0 bg-slate-200" />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: completed ? 1 : 0
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 origin-left"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
