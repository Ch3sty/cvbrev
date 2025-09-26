'use client';
import { motion } from 'framer-motion';
import { Clock, Sparkles, TrendingUp, Star, PenTool } from 'lucide-react';
import Link from 'next/link';
import FloatingParticles from './FloatingParticles';
import SparkleEffect, { useSparkleOnHover } from './SparkleEffect';
import PremiumInteractions from './PremiumInteractions';

interface WelcomeHeroProps {
  userName?: string;
  currentLevel?: number;
  levelTitle?: string;
  totalLetters?: number;
}

export default function WelcomeHero({
  userName,
  currentLevel = 1,
  levelTitle = 'Novis',
  totalLetters = 0
}: WelcomeHeroProps) {
  const sparkleHover = useSparkleOnHover();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    // 00:00-04:59: God natt
    if (hour >= 0 && hour < 5) return 'God natt';
    // 05:00-09:59: God morgon
    if (hour >= 5 && hour < 10) return 'God morgon';
    // 10:00-16:59: God dag
    if (hour >= 10 && hour < 17) return 'God dag';
    // 17:00-20:59: God kväll
    if (hour >= 17 && hour < 21) return 'God kväll';
    // 21:00-23:59: God kväll/God natt
    return 'God kväll';
  };

  const getDateString = () => {
    return new Date().toLocaleDateString('sv-SE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-slate-700 font-medium text-lg"
      >
        {getDateString()}
      </motion.div>

      {/* Main Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="space-y-4"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent hover:from-pink-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-500">
            {getTimeBasedGreeting()}!
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl">
          Du har gjort fantastiska framsteg i din karriärutveckling!
        </p>

        {/* Level Badge */}
        <SparkleEffect
          trigger={sparkleHover.isTriggered}
          density="medium"
          colors={['#EC4899', '#8B5CF6', '#3B82F6']}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              type: "spring",
              stiffness: 200
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg cursor-pointer"
            {...sparkleHover}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(236, 72, 153, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            Level {currentLevel} - {levelTitle}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Star className="w-3 h-3 ml-1" />
            </motion.div>
          </motion.div>
        </SparkleEffect>
      </motion.div>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/40 shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-pink-600" />
          <span className="font-semibold text-slate-900 text-lg">Din Progress</span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-1">{totalLetters}</div>
            <div className="text-sm text-slate-600">Skapade Brev</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">{currentLevel}</div>
            <div className="text-sm text-slate-600">Nuvarande Level</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="bg-slate-200/60 backdrop-blur-sm rounded-full h-3 overflow-hidden relative border border-slate-200/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `50%` }}
              transition={{
                delay: 0.8,
                duration: 1.5,
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
              className="bg-gradient-to-r from-pink-600 to-purple-600 h-full rounded-full relative overflow-hidden shadow-lg"
            >
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1.5
                }}
              />
            </motion.div>
          </div>
          <div className="text-sm text-slate-600 text-center font-medium">
            50% till nästa level
          </div>
        </div>
      </motion.div>

      {/* Premium CTA Button - Replacing FAB */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Link href="/dashboard/skapa-brev">
          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 40px rgba(236, 72, 153, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex items-center justify-center gap-3 relative z-10">
              <PenTool className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>Skapa Personligt Brev</span>
            </div>

            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 bg-white/10 rounded-xl"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Pulsing glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl opacity-50 blur-lg"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.3, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}