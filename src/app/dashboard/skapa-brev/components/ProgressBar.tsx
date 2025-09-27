'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: any;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (index: number) => void;
}

export default function ProgressBar({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}: ProgressBarProps) {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="relative">
      {/* Progress Line Background */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />

      {/* Animated Progress Line */}
      <motion.div
        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isPast = index < currentStep;

          return (
            <motion.button
              key={step.id}
              onClick={() => onStepClick(index)}
              className="group flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Step Circle */}
              <motion.div
                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 cursor-pointer
                  ${isCurrent
                    ? 'bg-gradient-to-br from-pink-600 to-purple-600 text-white shadow-lg'
                    : isCompleted || isPast
                    ? 'bg-green-500 text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-pink-400'
                  }
                `}
                animate={isCurrent ? {
                  scale: [1, 1.1, 1],
                  boxShadow: ['0px 0px 0px rgba(236, 72, 153, 0)', '0px 0px 20px rgba(236, 72, 153, 0.4)', '0px 0px 0px rgba(236, 72, 153, 0)']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isCompleted || isPast ? (
                  <Check className="w-5 h-5" />
                ) : (
                  React.createElement(step.icon, { className: "w-5 h-5" })
                )}
              </motion.div>

              {/* Step Label */}
              <span className={`
                mt-2 text-xs font-medium transition-colors
                ${isCurrent ? 'text-gray-900' : 'text-gray-600'}
                hidden sm:block
              `}>
                {step.title}
              </span>

              {/* Mobile Step Number */}
              <span className={`
                mt-2 text-xs font-medium
                ${isCurrent ? 'text-gray-900' : 'text-gray-600'}
                sm:hidden
              `}>
                {index + 1}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}