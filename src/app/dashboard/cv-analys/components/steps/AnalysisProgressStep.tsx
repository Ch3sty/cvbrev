// src/components/cv/analysis/steps/AnalysisProgressStep.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, useMemo, useRef } from 'react';

interface AnalysisProgressStepProps {
  progress: number; // 0-100
  currentActivity: string;
  estimatedTimeRemaining: number; // seconds
}

const mascotStages = [
  {
    image: '/images/maskot/cv-analys-1.svg',
    text: 'Tar emot ditt CV',
    color: 'from-blue-500/20 to-cyan-500/20',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    particleCount: 5
  },
  {
    image: '/images/maskot/cv-analys-2.svg',
    text: 'AI-analys pågår',
    color: 'from-purple-500/20 to-pink-500/20',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    particleCount: 15
  },
  {
    image: '/images/maskot/cv-analys-3.svg',
    text: 'Bearbetar och optimerar',
    color: 'from-pink-500/20 to-rose-500/20',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    particleCount: 20
  },
  {
    image: '/images/maskot/cv-analys-4.svg',
    text: 'Slutför optimering',
    color: 'from-orange-500/20 to-amber-500/20',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    particleCount: 25
  },
  {
    image: '/images/maskot/cv-analys-5.svg',
    text: 'Nästan klart!',
    color: 'from-green-500/20 to-emerald-500/20',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    particleCount: 30
  }
];

// Particle component for floating effects
const Particle = ({ delay, duration, x, y }: { delay: number; duration: number; x: number; y: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x, y }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0.5],
      y: [y, y - 100],
      x: [x, x + (Math.random() - 0.5) * 50]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeOut'
    }}
    className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
  />
);

// Confetti component for completion
const Confetti = ({ delay }: { delay: number }) => {
  const colors = ['#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const startX = (Math.random() - 0.5) * 200;

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, x: startX, y: -50, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, 300],
        x: [startX, startX + (Math.random() - 0.5) * 100],
        rotate: [0, Math.random() * 720 - 360]
      }}
      transition={{
        duration: 2,
        delay,
        ease: 'easeIn'
      }}
      className="absolute w-3 h-3 rounded-sm"
      style={{ backgroundColor: color }}
    />
  );
};

export default function AnalysisProgressStep({
  progress,
  currentActivity,
  estimatedTimeRemaining
}: AnalysisProgressStepProps) {
  const [activityIndex, setActivityIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload all SVG images immediately
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = mascotStages.map((stage) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.src = stage.image;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        // Set loaded anyway to show the component
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Cycle through mascot stages based on progress
  useEffect(() => {
    if (progress < 20) setActivityIndex(0);
    else if (progress < 40) setActivityIndex(1);
    else if (progress < 60) setActivityIndex(2);
    else if (progress < 80) setActivityIndex(3);
    else setActivityIndex(4);

    // Trigger confetti at completion
    if (progress >= 100 && !showConfetti) {
      setShowConfetti(true);
    }
  }, [progress, showConfetti]);

  const currentStage = mascotStages[activityIndex];

  // Generate particles based on current stage
  const particles = useMemo(() => {
    if (prefersReducedMotion) return [];
    return Array.from({ length: currentStage.particleCount }, (_, i) => ({
      id: `particle-${activityIndex}-${i}`,
      delay: i * 0.2,
      duration: 2 + Math.random() * 2,
      x: (Math.random() - 0.5) * 150,
      y: Math.random() * 50
    }));
  }, [activityIndex, currentStage.particleCount, prefersReducedMotion]);

  // Confetti pieces
  const confettiPieces = useMemo(() => {
    if (!showConfetti || prefersReducedMotion) return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: `confetti-${i}`,
      delay: i * 0.05
    }));
  }, [showConfetti, prefersReducedMotion]);

  // Stage-specific animation variants
  const stageVariants = {
    0: {
      initial: { opacity: 0, scale: 0.8, rotate: -15, y: 20 },
      animate: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        y: [0, -10, 0]
      },
      exit: { opacity: 0, scale: 0.9, rotate: 10, x: -20, transition: { duration: 0.3 } }
    },
    1: {
      initial: { opacity: 0, scale: 0.8, x: 30 },
      animate: {
        opacity: 1,
        scale: [1, 1.05, 1],
        x: 0,
        y: [0, -12, 0]
      },
      exit: { opacity: 0, scale: 0.85, x: -30, transition: { duration: 0.3 } }
    },
    2: {
      initial: { opacity: 0, scale: 0.7, rotate: 15 },
      animate: {
        opacity: 1,
        scale: [1, 1.08, 1],
        rotate: [0, -3, 3, 0],
        y: [0, -15, 0]
      },
      exit: { opacity: 0, scale: 0.8, rotate: -15, transition: { duration: 0.3 } }
    },
    3: {
      initial: { opacity: 0, scale: 0.9, y: 30 },
      animate: {
        opacity: 1,
        scale: [1, 1.1, 1.05, 1],
        y: [0, -18, 0]
      },
      exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.3 } }
    },
    4: {
      initial: { opacity: 0, scale: 0.6, y: 30 },
      animate: {
        opacity: 1,
        scale: [1, 1.15, 1.1],
        rotate: [0, -5, 5, 0],
        y: [0, -20, 0]
      },
      exit: { opacity: 0, scale: 1.2, y: -30, transition: { duration: 0.4 } }
    }
  };

  const variant = stageVariants[activityIndex as keyof typeof stageVariants];

  return (
    <div className="flex flex-col items-center justify-center py-12 overflow-hidden">
      {/* Main mascot container with glow and particles */}
      <div className="relative w-64 h-64 mb-8">
        {/* Animated gradient background */}
        <motion.div
          key={`bg-${activityIndex}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentStage.color} blur-3xl`}
        />

        {/* Dynamic glow effect */}
        <motion.div
          animate={{
            boxShadow: [
              `0 0 40px ${currentStage.glowColor}`,
              `0 0 80px ${currentStage.glowColor}`,
              `0 0 40px ${currentStage.glowColor}`
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-8 rounded-full"
        />

        {/* Circular progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="120"
            stroke="rgba(229, 231, 235, 0.3)"
            strokeWidth="4"
            fill="none"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="120"
            stroke={currentStage.glowColor}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              pathLength: progress / 100,
              strokeDasharray: '1 1'
            }}
          />
        </svg>

        {/* Particles */}
        {!prefersReducedMotion && particles.map(particle => (
          <Particle key={particle.id} {...particle} />
        ))}

        {/* Confetti */}
        {!prefersReducedMotion && confettiPieces.map(piece => (
          <Confetti key={piece.id} delay={piece.delay} />
        ))}

        {/* Animated Mascot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activityIndex}
              initial={variant.initial}
              animate={variant.animate}
              exit={variant.exit}
              transition={{
                opacity: { duration: 0.2 },
                scale: { duration: 0.3 },
                rotate: { duration: 0.3 },
                x: { duration: 0.3 },
                y: {
                  duration: prefersReducedMotion ? 0 : 2.5,
                  repeat: prefersReducedMotion ? 0 : Infinity,
                  ease: 'easeInOut'
                }
              }}
              className="relative w-48 h-48"
            >
              {imagesLoaded ? (
                <Image
                  src={currentStage.image}
                  alt={currentStage.text}
                  width={192}
                  height={192}
                  unoptimized
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Activity Text with typewriter effect */}
      <AnimatePresence mode="wait">
        <motion.h3
          key={activityIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold text-gray-900 mb-2"
        >
          {currentStage.text}
        </motion.h3>
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-8"
      >
        Detta tar vanligtvis 30-60 sekunder
      </motion.p>

      {/* Enhanced Progress Bar */}
      <div className="w-full max-w-md mb-4 relative">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 rounded-full relative"
            style={{
              backgroundSize: '200% 100%'
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </div>

      {/* Progress Percentage with counter animation */}
      <div className="flex items-center justify-between w-full max-w-md text-sm">
        <motion.span
          key={Math.floor(progress / 5)}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-gray-600 font-medium"
        >
          {progress}% klart
        </motion.span>
        {estimatedTimeRemaining > 0 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600"
          >
            ~{estimatedTimeRemaining}s kvar
          </motion.span>
        )}
      </div>

      {/* Activity Indicators with stagger */}
      <div className="flex gap-2 mt-8">
        {mascotStages.map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: index <= activityIndex ? 1 : 0.8,
              opacity: 1
            }}
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
            className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
              index < activityIndex
                ? 'bg-gradient-to-r from-pink-600 to-purple-600'
                : index === activityIndex
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shadow-pink-500/50'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
