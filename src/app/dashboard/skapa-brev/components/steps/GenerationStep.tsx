'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface GenerationStepProps {
  isGenerating: boolean;
  generatedLetter: string | null;
  error: string | null;
}

const mascotStages = [
  {
    image: '/images/maskot/personligt-brev-1.svg',
    text: 'Analyserar ditt CV',
    color: 'from-blue-500/20 to-indigo-500/20',
    glowColor: 'rgba(59, 130, 246, 0.5)'
  },
  {
    image: '/images/maskot/personligt-brev-2.svg',
    text: 'Extraherar nyckelkompetenser',
    color: 'from-violet-500/20 to-purple-500/20',
    glowColor: 'rgba(139, 92, 246, 0.5)'
  },
  {
    image: '/images/maskot/personligt-brev-3.svg',
    text: 'Matchar mot jobbkrav',
    color: 'from-fuchsia-500/20 to-pink-500/20',
    glowColor: 'rgba(217, 70, 239, 0.5)'
  },
  {
    image: '/images/maskot/personligt-brev-4.svg',
    text: 'Genererar personligt brev',
    color: 'from-amber-500/20 to-orange-500/20',
    glowColor: 'rgba(251, 146, 60, 0.5)'
  },
  {
    image: '/images/maskot/personligt-brev-5.svg',
    text: 'Optimerar för ATS',
    color: 'from-emerald-500/20 to-green-500/20',
    glowColor: 'rgba(16, 185, 129, 0.6)'
  }
];

export default function GenerationStep({
  isGenerating,
  generatedLetter,
  error
}: GenerationStepProps) {
  const [currentStage, setCurrentStage] = useState(0);

  // Cycle through stages while generating
  useEffect(() => {
    // Stop animation only when letter is ready
    if (generatedLetter) {
      return;
    }

    // Start interval immediately when component mounts
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        const next = prev + 1;
        // Stop at last stage instead of looping back to 0
        return next >= mascotStages.length ? mascotStages.length - 1 : next;
      });
    }, 2500); // Change stage every 2.5 seconds

    return () => clearInterval(interval);
  }, [generatedLetter]); // Only depend on generatedLetter

  // Error state
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
      </div>
    );
  }

  // Success state
  if (generatedLetter) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ditt brev är klart!</h3>
        <p className="text-gray-600">
          Vi har skapat ett personligt brev optimerat för din ansökan
        </p>
      </div>
    );
  }

  // Generating state - Show current stage
  const stage = mascotStages[currentStage];

  // Calculate progress based on current stage (0-100%)
  const progress = ((currentStage + 1) / mascotStages.length) * 100;

  return (
    <div className="text-center py-12">
      {/* SVG Mascot */}
      <div className="w-64 h-64 mx-auto mb-8 relative">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${stage.color} blur-3xl transition-colors duration-700`} />

        {/* Circular progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r="120"
            stroke="rgba(229, 231, 235, 0.3)"
            strokeWidth="4"
            fill="none"
          />
          {/* Animated progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="120"
            stroke={stage.glowColor}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: `${2 * Math.PI * 120}`,
              strokeDashoffset: `${2 * Math.PI * 120 * (1 - progress / 100)}`,
              transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.7s ease-out'
            }}
          />
        </svg>

        {/* Mascot Image with Framer Motion */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1] // Custom bounce easing
              }}
            >
              <Image
                src={stage.image}
                alt={stage.text}
                width={192}
                height={192}
                unoptimized
                className="w-48 h-48 object-contain drop-shadow-2xl"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Stage text with animation */}
      <AnimatePresence mode="wait">
        <motion.h3
          key={currentStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-semibold text-gray-900 mb-2"
        >
          {stage.text}
        </motion.h3>
      </AnimatePresence>

      {/* Spinner */}
      <div className="flex items-center justify-center mb-4">
        <Loader2 className="w-6 h-6 text-pink-600 animate-spin" />
      </div>

      <p className="text-gray-600 mb-8">
        Detta tar vanligtvis 10-15 sekunder
      </p>

      {/* Enhanced Progress Bar with Shimmer */}
      <div className="w-full max-w-md mx-auto mb-4">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 rounded-full relative transition-all duration-500"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex items-center justify-center w-full max-w-md mx-auto text-sm mb-8">
        <span className="text-gray-600 font-medium">
          {Math.round(progress)}% klart
        </span>
      </div>

      {/* Stage indicators */}
      <div className="flex gap-2 justify-center">
        {mascotStages.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-12 rounded-full transition-all duration-300 ${
              index === currentStage
                ? 'bg-pink-600'
                : index < currentStage
                ? 'bg-pink-300'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
