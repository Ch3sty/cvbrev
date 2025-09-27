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
  component: ReactNode;
  canNavigateNext?: () => boolean;
}

interface WizardContainerProps {
  steps: WizardStep[];
  onComplete: () => void;
  onStepChange?: (step: number) => void;
}

export default function WizardContainer({ steps, onComplete, onStepChange }: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skapa Personligt Brev</h1>
          <p className="text-gray-600">Låt AI hjälpa dig skapa det perfekta personliga brevet</p>
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
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Step Header */}
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center`}
              >
                {React.createElement(steps[currentStep].icon, { className: "w-8 h-8 text-white" })}
              </motion.div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
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
                className="min-h-[400px]"
              >
                {steps[currentStep].component}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Tillbaka
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                Steg {currentStep + 1} av {steps.length}
              </div>

              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center gap-2"
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