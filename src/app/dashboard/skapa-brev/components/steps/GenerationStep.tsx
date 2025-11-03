'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle2, Sparkles } from 'lucide-react';

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
    glowColor: 'rgba(59, 130, 246, 0.5)',
    accentColor: '#3B82F6',
    particleCount: 8
  },
  {
    image: '/images/maskot/personligt-brev-2.svg',
    text: 'Extraherar nyckelkompetenser',
    color: 'from-violet-500/20 to-purple-500/20',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    accentColor: '#8B5CF6',
    particleCount: 15
  },
  {
    image: '/images/maskot/personligt-brev-3.svg',
    text: 'Matchar mot jobbkrav',
    color: 'from-fuchsia-500/20 to-pink-500/20',
    glowColor: 'rgba(217, 70, 239, 0.5)',
    accentColor: '#D946EF',
    particleCount: 20
  },
  {
    image: '/images/maskot/personligt-brev-4.svg',
    text: 'Genererar personligt brev',
    color: 'from-amber-500/20 to-orange-500/20',
    glowColor: 'rgba(251, 146, 60, 0.5)',
    accentColor: '#FB923C',
    particleCount: 28
  },
  {
    image: '/images/maskot/personligt-brev-5.svg',
    text: 'Optimerar för ATS-system',
    color: 'from-emerald-500/20 to-green-500/20',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    accentColor: '#10B981',
    particleCount: 35
  }
];

// Particle component for floating effects
const Particle = ({ delay, duration, x, y, type }: {
  delay: number;
  duration: number;
  x: number;
  y: number;
  type: 'document' | 'ink' | 'star';
}) => {
  const getParticleStyle = () => {
    switch (type) {
      case 'document':
        return 'w-3 h-4 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-sm';
      case 'ink':
        return 'w-2 h-2 bg-gradient-to-b from-orange-400 to-amber-600 rounded-full';
      case 'star':
        return 'w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-500';
      default:
        return 'w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x, y }}
      animate={{
        opacity: [0, 1, 0],
        scale: type === 'ink' ? [0, 1.2, 1, 0.5] : [0, 1, 0.5],
        y: [y, y - (type === 'ink' ? 80 : 100)],
        x: [x, x + (Math.random() - 0.5) * 50],
        rotate: type === 'document' ? [0, 360] : 0
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: type === 'ink' ? 'easeOut' : 'easeOut'
      }}
      className={`absolute ${getParticleStyle()}`}
    />
  );
};

// Confetti component for completion
const Confetti = ({ delay }: { delay: number }) => {
  const colors = ['#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#10B981'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const startX = (Math.random() - 0.5) * 200;
  const shape = Math.random() > 0.5 ? 'rounded-sm' : 'rounded-full';

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
      className={`absolute w-3 h-3 ${shape}`}
      style={{ backgroundColor: color }}
    />
  );
};

export default function GenerationStep({
  isGenerating,
  generatedLetter,
  error
}: GenerationStepProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
        console.error('Error preloading letter mascot images:', error);
        setImagesLoaded(true); // Show anyway
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

  // Cycle through mascot stages
  const stageIndexRef = useRef(0);

  useEffect(() => {
    if (!generatedLetter && !error) {
      stageIndexRef.current = 0;
      const stageDuration = 2500; // 2.5 seconds per stage

      const stageInterval = setInterval(() => {
        stageIndexRef.current++;
        if (stageIndexRef.current < mascotStages.length) {
          setCurrentStage(stageIndexRef.current);
        } else {
          clearInterval(stageInterval);
        }
      }, stageDuration);

      return () => {
        clearInterval(stageInterval);
        stageIndexRef.current = 0;
      };
    }
  }, [generatedLetter, error]);

  // Trigger confetti when letter is complete
  useEffect(() => {
    if (generatedLetter && !isGenerating) {
      setCurrentStage(mascotStages.length - 1);
      setShowConfetti(true);
    }
  }, [generatedLetter, isGenerating]);

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
          Vi har skapat ett personligt brev optimerat för din ansökan
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

  // Generate particles based on current stage
  const currentMascotStage = mascotStages[currentStage];

  const particles = useMemo(() => {
    if (prefersReducedMotion) return [];
    const particleType = currentStage <= 1 ? 'document' : currentStage === 3 ? 'ink' : currentStage === 4 ? 'star' : 'document';
    return Array.from({ length: currentMascotStage.particleCount }, (_, i) => ({
      id: `particle-${currentStage}-${i}`,
      delay: i * 0.2,
      duration: 2 + Math.random() * 2,
      x: (Math.random() - 0.5) * 150,
      y: Math.random() * 50,
      type: particleType as 'document' | 'ink' | 'star'
    }));
  }, [currentStage, currentMascotStage.particleCount, prefersReducedMotion]);

  // Confetti pieces
  const confettiPieces = useMemo(() => {
    if (!showConfetti || prefersReducedMotion) return [];
    return Array.from({ length: 50 }, (_, i) => ({
      id: `confetti-${i}`,
      delay: i * 0.03
    }));
  }, [showConfetti, prefersReducedMotion]);

  // Stage-specific animation variants
  const stageVariants = {
    0: {
      initial: { opacity: 0, scale: 0.8, rotate: -10, y: 20 },
      animate: { opacity: 1, scale: 1, rotate: 0, y: [0, -10, 0] },
      exit: { opacity: 0, scale: 0.9, rotate: 10, x: -20, transition: { duration: 0.3 } }
    },
    1: {
      initial: { opacity: 0, scale: 0.8, x: 30 },
      animate: { opacity: 1, scale: [1, 1.05, 1], x: 0, y: [0, -12, 0] },
      exit: { opacity: 0, scale: 0.85, x: -30, transition: { duration: 0.3 } }
    },
    2: {
      initial: { opacity: 0, scale: 0.7, rotate: 15 },
      animate: { opacity: 1, scale: [1, 1.08, 1], rotate: [0, -3, 3, 0], y: [0, -15, 0] },
      exit: { opacity: 0, scale: 0.8, rotate: -15, transition: { duration: 0.3 } }
    },
    3: {
      initial: { opacity: 0, scale: 0.9, y: 30 },
      animate: { opacity: 1, scale: [1, 1.1, 1.05, 1], y: [0, -18, 0] },
      exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.3 } }
    },
    4: {
      initial: { opacity: 0, scale: 0.6, y: 30 },
      animate: { opacity: 1, scale: [1, 1.15, 1.1], rotate: [0, -5, 5, 0], y: [0, -20, 0] },
      exit: { opacity: 0, scale: 1.2, y: -30, transition: { duration: 0.4 } }
    }
  };

  const variant = stageVariants[currentStage as keyof typeof stageVariants];

  return (
    <div className="flex flex-col items-center justify-center py-12 overflow-hidden">
      {/* Main mascot container with glow and particles */}
      <div className="relative w-64 h-64 mb-8">
        {/* Animated gradient background */}
        <motion.div
          key={`bg-${currentStage}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentMascotStage.color} blur-3xl`}
        />

        {/* Dynamic glow effect */}
        <motion.div
          animate={{
            boxShadow: [
              `0 0 40px ${currentMascotStage.glowColor}`,
              `0 0 80px ${currentMascotStage.glowColor}`,
              `0 0 40px ${currentMascotStage.glowColor}`
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-8 rounded-full"
        />

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
              key={currentStage}
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
                  src={currentMascotStage.image}
                  alt={currentMascotStage.text}
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

      {/* Activity Text */}
      <AnimatePresence mode="wait">
        <motion.h3
          key={currentStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold text-gray-900 mb-2"
        >
          {currentMascotStage.text}
        </motion.h3>
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-8"
      >
        Detta tar vanligtvis 10-15 sekunder
      </motion.p>

      {/* Activity Indicators */}
      <div className="flex gap-2 mt-4">
        {mascotStages.map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: index <= currentStage ? 1 : 0.8,
              opacity: 1
            }}
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
            className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
              index < currentStage
                ? 'bg-gradient-to-r from-pink-600 to-purple-600'
                : index === currentStage
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shadow-pink-500/50'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
