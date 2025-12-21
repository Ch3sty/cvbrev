'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon?: React.ElementType;
}

interface CVCreatorProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
}

export default function CVCreatorProgressBar({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}: CVCreatorProgressBarProps) {
  const isStepCompleted = (stepIndex: number) => completedSteps.includes(stepIndex);
  const isStepCurrent = (stepIndex: number) => stepIndex === currentStep;
  const isStepAccessible = (stepIndex: number) =>
    isStepCompleted(stepIndex) || stepIndex <= currentStep;

  return (
    <div className="w-full">
      {/* Mobile: Simple progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-semibold text-gray-900">
            Steg {currentStep + 1} av {steps.length}
          </span>
          <span className="text-sm text-gray-600">
            {steps[currentStep].title}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-pink-600 to-purple-600"
          />
        </div>
      </div>

      {/* Desktop: Full step visualization */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const completed = isStepCompleted(index);
          const current = isStepCurrent(index);
          const accessible = isStepAccessible(index);
          const isLast = index === steps.length - 1;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <motion.button
                  type="button"
                  disabled={!accessible}
                  initial={false}
                  animate={{
                    scale: current ? 1.1 : 1,
                  }}
                  whileHover={accessible ? { scale: 1.15 } : {}}
                  whileTap={accessible ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.2 }}
                  onClick={() => accessible && onStepClick?.(index)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center relative z-10
                    transition-colors duration-300
                    ${completed
                      ? 'bg-purple-500 cursor-pointer hover:bg-purple-600'
                      : current
                        ? 'bg-pink-600'
                        : 'bg-slate-200'}
                    ${accessible && !current ? 'cursor-pointer' : current ? 'cursor-default' : 'cursor-not-allowed'}
                  `}
                >
                  {completed ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : StepIcon ? (
                    <StepIcon className={`w-5 h-5 ${current ? 'text-white' : 'text-slate-500'}`} />
                  ) : (
                    <span className={`text-sm font-semibold ${current ? 'text-white' : 'text-slate-500'}`}>
                      {index + 1}
                    </span>
                  )}
                </motion.button>

                {/* Step Title */}
                <span className={`absolute -bottom-6 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                  current ? 'text-pink-600' : completed ? 'text-purple-600' : 'text-slate-400'
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
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 origin-left"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: Add bottom margin for step titles */}
      <div className="hidden md:block h-6" />
    </div>
  );
}
