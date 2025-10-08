'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Target, TrendingUp, Sparkles } from 'lucide-react';

interface Step {
  icon: typeof Search;
  label: string;
  description: string;
  color: string;
}

const STEPS: Step[] = [
  {
    icon: Brain,
    label: 'Analyserar CV',
    description: 'Extraherar dina kompetenser och erfarenheter',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: Search,
    label: 'Söker i jobbdatabasen',
    description: 'Genomsöker 1000-tals aktiva jobbannonser',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Target,
    label: 'Matchar kompetenser',
    description: 'Jämför dina kvalifikationer med jobbkrav',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: TrendingUp,
    label: 'Rangordnar resultat',
    description: 'Sorterar jobb efter relevans för dig',
    color: 'from-rose-500 to-rose-600'
  }
];

const TIPS = [
  'Vi söker bland 1000-tals arbeten per sekund',
  'Matchningen inkluderar närliggande yrkesroller',
  'Geografisk prioritering baseras på din plats',
  'Vi hittar dolda möjligheter du annars skulle missa'
];

export default function JobSearchLoader() {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    // Progress animation over 12 seconds
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;

        // Progress speeds: faster at start, slower at end
        if (prev < 25) return prev + 2.5; // Fast (0-25%: ~2.5s)
        if (prev < 50) return prev + 1.5; // Medium (25-50%: ~4.2s)
        if (prev < 75) return prev + 1.2; // Slower (50-75%: ~5.2s)
        return prev + 0.8; // Slowest (75-100%: total ~12s)
      });
    }, 250);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Update step based on progress
    if (progress < 25) setCurrentStepIndex(0);
    else if (progress < 50) setCurrentStepIndex(1);
    else if (progress < 75) setCurrentStepIndex(2);
    else setCurrentStepIndex(3);
  }, [progress]);

  useEffect(() => {
    // Rotate tips every 3 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, []);

  const estimatedSecondsLeft = Math.max(0, Math.ceil((100 - progress) * 0.12));

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-indigo-200 p-8 shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Söker matchande jobb
          </h2>
          <p className="text-sm text-gray-600">
            {estimatedSecondsLeft > 0 ? `Cirka ${estimatedSecondsLeft} sekunder kvar` : 'Nästan klart...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-sm font-semibold text-indigo-600">{Math.round(progress)}%</span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-indigo-300 bg-indigo-50/50 shadow-md'
                    : isCompleted
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-gray-200 bg-gray-50/30'
                }`}
              >
                {/* Icon */}
                <div className={`p-2.5 rounded-xl shadow-md shrink-0 ${
                  isActive || isCompleted
                    ? `bg-gradient-to-br ${step.color}`
                    : 'bg-gray-300'
                }`}>
                  <StepIcon className={`w-5 h-5 ${
                    isActive || isCompleted ? 'text-white' : 'text-gray-500'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm font-semibold ${
                      isActive ? 'text-indigo-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </h3>
                    {isActive && (
                      <div className="flex gap-1">
                        <motion.div
                          className="w-1.5 h-1.5 bg-indigo-600 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-indigo-600 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-indigo-600 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    )}
                    {isCompleted && (
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Rotating Tips */}
        <motion.div
          key={currentTip}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-indigo-900">Visste du?</span> {TIPS[currentTip]}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
