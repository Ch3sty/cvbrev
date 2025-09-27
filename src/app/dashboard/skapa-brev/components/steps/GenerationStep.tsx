'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, Loader2, Sparkles, Zap, FileText, Target } from 'lucide-react';

interface GenerationStepProps {
  isGenerating: boolean;
  generatedLetter: string | null;
  error: string | null;
}

const aiSteps = [
  { label: 'Analyserar ditt CV...', icon: FileText, delay: 0 },
  { label: 'Extraherar nyckelkompetenser...', icon: Target, delay: 1 },
  { label: 'Matchar mot jobbkrav...', icon: Zap, delay: 2 },
  { label: 'Genererar personligt brev...', icon: Brain, delay: 3 },
  { label: 'Optimerar för ATS-system...', icon: Sparkles, delay: 4 }
];

export default function GenerationStep({
  isGenerating,
  generatedLetter,
  error
}: GenerationStepProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isGenerating) {
      setCompletedSteps([]);
      setCurrentStep(0);

      // Simulate step progression with GUARANTEED timing
      const progressSteps = () => {
        const stepDuration = 2500; // 2.5 seconds per step for visibility

        // Step 0: Start immediately
        setCurrentStep(0);

        // Steps 1-4: Progress through each step
        aiSteps.forEach((_, index) => {
          if (index > 0) {
            setTimeout(() => {
              setCompletedSteps(prev => [...prev, index - 1]);
              setCurrentStep(index);
            }, stepDuration * index);
          }
        });

        // Final completion - only after ALL steps are done
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, aiSteps.length - 1]);
          setCurrentStep(aiSteps.length);
        }, stepDuration * aiSteps.length);
      };

      progressSteps();
    } else if (generatedLetter && !isGenerating) {
      // Only complete when generation is fully done
      setCompletedSteps(aiSteps.map((_, i) => i));
      setCurrentStep(aiSteps.length);
    }
  }, [isGenerating, generatedLetter]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Något gick fel</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button className="text-pink-600 font-medium hover:text-pink-700">
          Försök igen →
        </button>
      </div>
    );
  }

  if (generatedLetter) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ditt brev är klart!</h3>
        <p className="text-gray-600 mb-6">
          AI har skapat ett personligt brev optimerat för din ansökan
        </p>

        {/* Success Animation */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto"
        >
          <p className="text-sm text-green-800">
            💡 Tips: Du kan redigera brevet i nästa steg innan du laddar ner det
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="py-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
        {/* AI Brain Animation */}
        <motion.div
          className="text-center mb-8"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="relative inline-block">
            <Brain className="w-20 h-20 text-blue-600 mx-auto" />

            {/* Animated Rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.8, 0.4, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-purple-400"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.8, 0.4, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5
              }}
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            AI arbetar med ditt brev
          </h3>
          <p className="text-gray-600">
            Analyserar och optimerar för bästa resultat...
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-3 max-w-md mx-auto">
          {aiSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay * 0.3 }}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all
                  ${isCurrent
                    ? 'bg-white shadow-md border-2 border-blue-400'
                    : isCompleted
                    ? 'bg-white/80'
                    : 'bg-white/50'
                  }
                `}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-6 h-6 text-blue-600" />
                    </motion.div>
                  ) : (
                    <step.icon className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <p className={`font-medium ${
                    isCompleted ? 'text-gray-900' : isCurrent ? 'text-blue-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <motion.div
                      className="h-1.5 bg-blue-200 rounded-full mt-2 overflow-hidden"
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.5, ease: 'linear' }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600">
            💡 Visste du att vår AI analyserar över 50 parametrar för att skapa det perfekta brevet?
          </p>
        </motion.div>
      </div>
    </div>
  );
}