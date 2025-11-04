'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface JobSearchLoaderProps {
  isSearching: boolean;
  jobsFound: boolean | null;
  error: string | null;
}

// Floating particle component
const Particle = ({ delay, color, prefersReducedMotion }: { delay: number; color: string; prefersReducedMotion: boolean }) => {
  const startX = Math.random() * 160 - 80; // Start position -80 to 80
  const startY = Math.random() * 160 - 80;
  const randomX = Math.random() * 200 - 100; // Movement range -100 to 100
  const randomY = Math.random() * 200 - 100;
  const size = Math.random() * 8 + 4; // 4-12px

  // Don't render particles if user prefers reduced motion
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: '50%',
        top: '50%',
        opacity: 0
      }}
      initial={{
        x: startX,
        y: startY,
        opacity: 0.4
      }}
      animate={{
        x: [startX, randomX, startX],
        y: [startY, randomY, startY],
        scale: [1, 1.5, 1],
        opacity: [0.4, 0.7, 0.4]
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
};

const mascotStages = [
  {
    image: '/images/maskot/jobbmatchning-1.svg',
    text: 'Analyserar ditt CV',
    color: 'from-blue-500/20 to-indigo-500/20',
    glowColor: 'rgba(59, 130, 246, 0.5)'
  },
  {
    image: '/images/maskot/jobbmatchning-2.svg',
    text: 'Söker i jobbdatabasen',
    color: 'from-violet-500/20 to-purple-500/20',
    glowColor: 'rgba(139, 92, 246, 0.5)'
  },
  {
    image: '/images/maskot/jobbmatchning-3.svg',
    text: 'Matchar mot dina kompetenser',
    color: 'from-fuchsia-500/20 to-pink-500/20',
    glowColor: 'rgba(217, 70, 239, 0.5)'
  },
  {
    image: '/images/maskot/jobbmatchning-4.svg',
    text: 'Rangordnar efter relevans',
    color: 'from-amber-500/20 to-orange-500/20',
    glowColor: 'rgba(251, 146, 60, 0.5)'
  },
  {
    image: '/images/maskot/jobbmatchning-5.svg',
    text: 'Förbereder resultat',
    color: 'from-emerald-500/20 to-green-500/20',
    glowColor: 'rgba(16, 185, 129, 0.6)'
  }
];

export default function JobSearchLoader({
  isSearching,
  jobsFound,
  error
}: JobSearchLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Preload all mascot images
  useEffect(() => {
    const imagePromises = mascotStages.map((stage) => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.src = stage.image;
        img.onload = () => resolve();
        img.onerror = () => reject();
      });
    });

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(() => setImagesLoaded(true)); // Continue even if some images fail
  }, []);

  // Cycle through stages while searching
  useEffect(() => {
    // Wait for images to load before starting animation
    if (!imagesLoaded) {
      return;
    }

    // Stop animation when jobs are found
    if (jobsFound) {
      // Ensure we're at the last stage
      setCurrentStage(mascotStages.length - 1);
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
  }, [jobsFound, imagesLoaded]);

  // Loading images state
  if (!imagesLoaded && !error && !jobsFound) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-10 h-10 text-pink-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Förbereder...</p>
      </div>
    );
  }

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

  // Searching state - Show current stage
  const stage = mascotStages[currentStage];

  // Calculate progress based on current stage (0-100%)
  const progress = ((currentStage + 1) / mascotStages.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-indigo-200 p-8 shadow-xl"
      >
        <div className="text-center">
      {/* SVG Mascot */}
      <div className="w-64 h-64 mx-auto mb-8 relative">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${stage.color} blur-3xl transition-colors duration-700`} />

        {/* Pulsating glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 60px 20px ${stage.glowColor}`
          }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <Particle
              key={`${currentStage}-${i}`}
              delay={i * 0.3}
              color={stage.glowColor}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

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
              initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0, y: -20 }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.3,
                ease: prefersReducedMotion ? "linear" : [0.34, 1.56, 0.64, 1] // Custom bounce easing
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
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: prefersReducedMotion ? 0.15 : 0.3 }}
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
        Detta tar vanligtvis 5-10 sekunder
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

      {/* Enhanced Stage indicators */}
      <div className="flex gap-3 justify-center items-center">
        {mascotStages.map((stageItem, index) => (
          <motion.div
            key={index}
            className="relative"
            initial={false}
            animate={{
              scale: (prefersReducedMotion || index !== currentStage) ? 1 : 1.2
            }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
          >
            {/* Indicator dot */}
            <div
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index === currentStage
                  ? 'ring-2 ring-offset-2'
                  : ''
              }`}
              style={{
                backgroundColor: index <= currentStage ? stageItem.glowColor : 'rgb(229, 231, 235)',
                ...(index === currentStage && {
                  '--tw-ring-color': stageItem.glowColor
                } as React.CSSProperties)
              }}
            />

            {/* Connecting line */}
            {index < mascotStages.length - 1 && (
              <div
                className="absolute top-1/2 -right-3 w-3 h-0.5 -translate-y-1/2 transition-all duration-500"
                style={{
                  backgroundColor: index < currentStage ? stageItem.glowColor : 'rgb(229, 231, 235)',
                  opacity: index < currentStage ? 0.6 : 0.3
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
        </div>
      </motion.div>
    </div>
  );
}
