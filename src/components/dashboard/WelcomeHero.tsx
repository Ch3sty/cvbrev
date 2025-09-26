'use client';
import { motion } from 'framer-motion';
import { Clock, Sparkles, TrendingUp, Star } from 'lucide-react';
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
    if (hour < 10) return 'God morgon';
    if (hour < 17) return 'God dag';
    if (hour < 21) return 'God kväll';
    return 'God kväll';
  };

  const getMotivationalMessage = () => {
    if (totalLetters === 0) {
      return "Låt oss skapa ditt första imponerande personliga brev tillsammans!";
    }
    if (totalLetters < 5) {
      return "Du bygger en stark grund för din karriär. Fortsätt så här bra!";
    }
    return "Du har gjort fantastiska framsteg i din karriärutveckling!";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="relative bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden p-4 sm:p-6 lg:p-8 mb-8"
    >
      {/* Premium floating particles background */}
      <FloatingParticles
        count={6}
        colors={['bg-pink-400/20', 'bg-purple-400/20', 'bg-blue-400/20']}
        size="md"
        speed="slow"
        className="opacity-60"
      />
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        {/* Välkomsthälsning */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('sv-SE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2"
          >
            {getTimeBasedGreeting()}{userName ? `, ${userName}` : ''}!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base sm:text-lg text-slate-600 mb-4"
          >
            {getMotivationalMessage()}
          </motion.p>

          {/* Enhanced Level Badge with Sparkle Effect */}
          <SparkleEffect
            trigger={sparkleHover.isTriggered}
            density="medium"
            colors={['#EC4899', '#8B5CF6', '#3B82F6']}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5,
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
        </div>

        {/* Enhanced Progress Visualization */}
        <PremiumInteractions
          variant="float"
          className="mt-6 lg:mt-0 lg:ml-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              delay: 0.6,
              duration: 0.7,
              type: "spring",
              stiffness: 150
            }}
          >
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-slate-200/60 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-pink-600" />
              <span className="font-semibold text-slate-900">Din Progress</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-pink-600">{totalLetters}</div>
                <div className="text-xs text-slate-600">Skapade Brev</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{currentLevel}</div>
                <div className="text-xs text-slate-600">Nuvarande Level</div>
              </div>
            </div>

            {/* Enhanced Progress Bar with Glow Effect */}
            <div className="mt-4">
              <div className="bg-slate-200 rounded-full h-3 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalLetters / 10) * 100)}%` }}
                  transition={{
                    delay: 1,
                    duration: 1.5,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100
                  }}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 h-full rounded-full relative overflow-hidden"
                >
                  {/* Animated shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 1.5
                    }}
                  />
                </motion.div>

                {/* Glow effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-full blur-sm"
                  style={{ transform: 'scale(1.1)' }}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="text-xs text-slate-500 mt-2 text-center font-medium"
              >
                {Math.min(100, Math.round((totalLetters / 10) * 100))}% till nästa level
              </motion.div>
            </div>
          </div>
          </motion.div>
        </PremiumInteractions>
      </div>
    </motion.div>
  );
}