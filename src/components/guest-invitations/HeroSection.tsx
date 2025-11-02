'use client';

import { motion } from 'framer-motion';
import { Users, Gift, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  earnedDays?: number;
  onCTAClick: () => void;
}

export default function HeroSection({ earnedDays = 0, onCTAClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50" />

      {/* Floating elements animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-200/30 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-pink-200/30 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>

      <div className="relative z-10 text-center py-12 sm:py-16 md:py-20 px-4">
        {/* Animated icon group */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            bounce: 0.5,
            duration: 0.8
          }}
          className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <motion.div
            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
          >
            <Gift className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
        >
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Tjäna gratis Premium – bjud in en vän
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Få upp till <strong className="text-purple-600 font-bold">35 dagars extra Premium</strong> varje månad
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base text-slate-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Varje vecka får du 5 nya inbjudningar. När dina vänner blir betalande premiumanvändare
          får du en hel vecka extra Premium. Gratis. Inga krångliga villkor.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Button
            size="lg"
            onClick={onCTAClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base sm:text-lg px-8 py-6 sm:py-7 shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Skicka första inbjudan
          </Button>
        </motion.div>

        {/* Earned badge */}
        {earnedDays > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", bounce: 0.4 }}
            className="inline-flex items-center space-x-2 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-purple-200/50"
          >
            <Crown className="w-5 h-5 text-purple-600" />
            <span className="text-sm sm:text-base font-medium text-slate-700">
              Du har tjänat <strong className="text-purple-600">{earnedDays} dagar</strong> denna månaden
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
