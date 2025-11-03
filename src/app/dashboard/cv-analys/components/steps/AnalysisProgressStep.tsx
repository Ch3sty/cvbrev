// src/components/cv/analysis/steps/AnalysisProgressStep.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AnalysisProgressStepProps {
  progress: number; // 0-100
  currentActivity: string;
  estimatedTimeRemaining: number; // seconds
}

const mascotStages = [
  { image: '/images/maskot/cv-analys-1.webp', text: 'Tar emot ditt CV' },
  { image: '/images/maskot/cv-analys-2.webp', text: 'AI-analys pågår' },
  { image: '/images/maskot/cv-analys-3.webp', text: 'Bearbetar och optimerar' },
  { image: '/images/maskot/cv-analys-4.webp', text: 'Slutför optimering' },
  { image: '/images/maskot/cv-analys-5.webp', text: 'Nästan klart!' }
];

export default function AnalysisProgressStep({
  progress,
  currentActivity,
  estimatedTimeRemaining
}: AnalysisProgressStepProps) {
  const [activityIndex, setActivityIndex] = useState(0);

  // Cycle through mascot stages based on progress
  useEffect(() => {
    if (progress < 20) setActivityIndex(0);
    else if (progress < 40) setActivityIndex(1);
    else if (progress < 60) setActivityIndex(2);
    else if (progress < 80) setActivityIndex(3);
    else setActivityIndex(4);
  }, [progress]);

  const currentStage = mascotStages[activityIndex];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Animated Mascot */}
      <div className="relative w-48 h-48 mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activityIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -8, 0]
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              y: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
            className="absolute inset-0"
          >
            <Image
              src={currentStage.image}
              alt={currentStage.text}
              width={192}
              height={192}
              priority
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Activity Text */}
      <motion.h3
        key={activityIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-gray-900 mb-2"
      >
        {currentStage.text}
      </motion.h3>

      <p className="text-gray-600 mb-8">
        Detta tar vanligtvis 30-60 sekunder
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-4">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-pink-600 to-purple-600 rounded-full"
          />
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex items-center justify-between w-full max-w-md text-sm">
        <span className="text-gray-600">
          {progress}% klart
        </span>
        {estimatedTimeRemaining > 0 && (
          <span className="text-gray-600">
            ~{estimatedTimeRemaining}s kvar
          </span>
        )}
      </div>

      {/* Activity Indicators */}
      <div className="flex gap-2 mt-8">
        {mascotStages.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${
              index <= activityIndex
                ? 'bg-gradient-to-r from-pink-600 to-purple-600'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
