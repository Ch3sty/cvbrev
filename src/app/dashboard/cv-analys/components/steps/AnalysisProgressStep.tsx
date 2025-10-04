// src/components/cv/analysis/steps/AnalysisProgressStep.tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Target, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalysisProgressStepProps {
  progress: number; // 0-100
  currentActivity: string;
  estimatedTimeRemaining: number; // seconds
}

const activities = [
  { icon: Sparkles, text: 'Analyserar ditt CV', color: 'from-pink-600 to-purple-600' },
  { icon: Target, text: 'Identifierar förbättringsmöjligheter', color: 'from-purple-600 to-blue-600' },
  { icon: Zap, text: 'Optimerar för ATS-system', color: 'from-blue-600 to-cyan-600' },
  { icon: CheckCircle2, text: 'Förbereder rekommendationer', color: 'from-cyan-600 to-teal-600' }
];

export default function AnalysisProgressStep({
  progress,
  currentActivity,
  estimatedTimeRemaining
}: AnalysisProgressStepProps) {
  const [activityIndex, setActivityIndex] = useState(0);

  // Cycle through activities based on progress
  useEffect(() => {
    if (progress < 25) setActivityIndex(0);
    else if (progress < 50) setActivityIndex(1);
    else if (progress < 75) setActivityIndex(2);
    else setActivityIndex(3);
  }, [progress]);

  const activity = activities[activityIndex];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Animated Icon */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`w-24 h-24 rounded-full bg-gradient-to-br ${activity.color} flex items-center justify-center mb-8 shadow-lg`}
      >
        <activity.icon className="w-12 h-12 text-white" />
      </motion.div>

      {/* Activity Text */}
      <motion.h3
        key={activityIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-gray-900 mb-2"
      >
        {activity.text}
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
        {activities.map((_, index) => (
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
