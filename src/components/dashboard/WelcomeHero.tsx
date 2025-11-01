'use client';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import SparkleEffect, { useSparkleOnHover } from './SparkleEffect';

interface WelcomeHeroProps {
  userName?: string;
  currentLevel?: number;
  levelTitle?: string;
  totalLetters?: number;
  cvCount?: number;
}

export default function WelcomeHero({
  userName,
  currentLevel = 1,
  levelTitle = 'Novis',
  totalLetters = 0,
  cvCount = 0
}: WelcomeHeroProps) {
  const isNewUser = cvCount === 0 && totalLetters === 0;
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
          {isNewUser
            ? 'Välkommen! Låt oss skapa ditt första personliga brev tillsammans.'
            : 'Du har gjort fantastiska framsteg i din karriärutveckling!'
          }
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
    </div>
  );
}