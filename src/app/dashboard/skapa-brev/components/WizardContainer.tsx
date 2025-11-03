'use client';

import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { Button } from '@/components/ui/button';

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
  component: () => ReactNode;
  canNavigateNext?: () => boolean;
}

interface WizardContainerProps {
  steps: WizardStep[];
  onComplete: () => void;
  onStepChange?: (step: number) => void;
  initialStep?: number;
  initialCompletedSteps?: number[];
}

export default function WizardContainer({
  steps,
  onComplete,
  onStepChange,
  initialStep = 0,
  initialCompletedSteps = []
}: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompletedSteps);

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex);
    }
  };

  const handleNext = () => {
    const current = steps[currentStep];
    if (current.canNavigateNext && !current.canNavigateNext()) {
      return;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  const isStepCompleted = (stepIndex: number) => completedSteps.includes(stepIndex);
  const canNavigateToStep = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    return isStepCompleted(stepIndex - 1);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Skapa Personligt Brev</h1>
          <p className="text-sm sm:text-base text-gray-600">Vi hjälper dig skapa det perfekta personliga brevet – professionellt och personligt</p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(index) => {
            if (canNavigateToStep(index)) {
              goToStep(index);
            }
          }}
        />

        {/* Main Content */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
            {/* Step Header */}
            <div className="mb-6 sm:mb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center`}
              >
                {React.createElement(steps[currentStep].icon, { className: "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" })}
              </motion.div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">{steps[currentStep].description}</p>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px]"
              >
                {steps[currentStep].component()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-200 gap-4 sm:gap-0">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 touch-manipulation min-h-[44px] w-full sm:w-auto order-2 sm:order-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Tillbaka
              </Button>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 order-1 sm:order-2">
                Steg {currentStep + 1} av {steps.length}
              </div>

              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center gap-2 touch-manipulation min-h-[44px] w-full sm:w-auto order-3"
              >
                {currentStep === steps.length - 1 ? 'Slutför' : 'Nästa'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}