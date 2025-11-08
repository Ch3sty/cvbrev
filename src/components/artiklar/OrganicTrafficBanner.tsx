'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, Check, Award, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const OrganicTrafficBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Check if user has dismissed banner recently
  useEffect(() => {
    const dismissed = localStorage.getItem('organic-banner-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;

    // Show banner again after 2 hours
    if (now - dismissedTime > 2 * hourInMs) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('organic-banner-dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 text-white"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-purple-700/80"></div>
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)`,
            backgroundSize: '100% 100%'
          }}
        />
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-3.5 relative z-10">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Value proposition */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-300" />
              <span className="font-bold text-base md:text-lg">Testa alla verktyg gratis i 7 dagar – betala bara om du vill fortsätta</span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-sm ml-7">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="opacity-90">Obegränsad tillgång till alla funktioner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="opacity-90">Skapa brev, CV och LinkedIn-profiler som sticker ut</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="opacity-90">Avsluta kostnadsfritt innan provperioden går ut</span>
              </div>
            </div>
          </div>

          {/* Center - CTA (more prominent) */}
          <div className="flex items-center gap-3">
            <Link
              href="/trial-signup"
              className="inline-flex items-center px-5 md:px-8 py-2.5 md:py-3 bg-white text-purple-700 font-bold rounded-xl text-sm md:text-base
                       hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600
                       whitespace-nowrap"
            >
              <Clock className="w-4 h-4 mr-2" />
              Testa gratis nu
            </Link>

            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Stäng banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile benefits row */}
        <div className="md:hidden mt-2.5 pt-2.5 border-t border-white/20">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-300" />
              <span className="opacity-90">Alla funktioner</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-300" />
              <span className="opacity-90">Avsluta när du vill</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-300" />
              <span className="opacity-90">Ingen bindningstid</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrganicTrafficBanner;