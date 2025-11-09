// src/components/cv/analysis/steps/SaveProgressStep.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';

interface SaveProgressStepProps {
  progress: number; // 0-100
}

const mascotStages = [
  {
    image: '/images/maskot/save-cv-1.svg',
    text: 'Sparar ditt CV...',
    color: 'from-blue-500/20 to-cyan-500/20',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    particleCount: 10
  },
  {
    image: '/images/maskot/save-cv-2.svg',
    text: 'Genererar din PDF...',
    color: 'from-purple-500/20 to-pink-500/20',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    particleCount: 20
  },
  {
    image: '/images/maskot/save-cv-3.svg',
    text: 'Nästan klart! 🎉',
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

export default function SaveProgressStep({
  progress
}: SaveProgressStepProps) {
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
    if (progress < 40) setActivityIndex(0);
    else if (progress < 80) setActivityIndex(1);
    else setActivityIndex(2);

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
        {!prefersReducedMotion && (
          <motion.div
            animate={{
              boxShadow: [
                `0 0 60px 20px ${currentStage.glowColor}`,
                `0 0 80px 30px ${currentStage.glowColor}`,
                `0 0 60px 20px ${currentStage.glowColor}`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 rounded-full"
          />
        )}

        {/* Floating particles */}
        {!prefersReducedMotion && particles.map((particle) => (
          <Particle key={particle.id} {...particle} />
        ))}

        {/* Confetti celebration */}
        {showConfetti && confettiPieces.map((piece) => (
          <Confetti key={piece.id} delay={piece.delay} />
        ))}

        {/* Mascot image with stage-specific animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activityIndex}
            {...variant}
            transition={{
              duration: 0.6,
              type: 'spring',
              stiffness: 200,
              damping: 15,
              ...(variant.animate.y && {
                y: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse' as const,
                  ease: 'easeInOut'
                }
              })
            }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <Image
              src={currentStage.image}
              alt={currentStage.text}
              width={220}
              height={220}
              priority
              className="drop-shadow-2xl"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Activity text */}
      <motion.div
        key={`text-${activityIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-transparent bg-clip-text mb-2">
          {currentStage.text}
        </h3>
      </motion.div>

      {/* Progress percentage */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <div className="text-6xl font-black bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
          {Math.round(progress)}%
        </div>
        <div className="text-sm text-gray-600 text-center mt-1">klart</div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-md px-4">
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Animated background shimmer */}
          {!prefersReducedMotion && (
            <motion.div
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          )}

          {/* Actual progress */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
