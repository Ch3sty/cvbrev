'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, Sparkles, Clock, Users, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const OrganicTrafficBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [liveCount, setLiveCount] = useState(156);

  // Update live counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/90 to-purple-600/90"></div>
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)`,
            backgroundSize: '100% 100%'
          }}
        />
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Left side - Value proposition */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="font-bold text-lg">Välkommen till Sveriges #1 AI-karriärcoach!</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="opacity-90">{liveCount} skapar brev nu</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="opacity-90">85% högre svarfrekvens</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-300" />
                <span className="opacity-90">10,000+ nöjda användare</span>
              </div>
            </div>
          </div>

          {/* Right side - CTA & Close */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/create-letter"
                className="inline-flex items-center px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-xl
                         hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
              >
                <Clock className="w-4 h-4 mr-2" />
                Skapa brev på 2 min
              </Link>

              <div className="hidden lg:block text-right">
                <div className="text-xs opacity-80">Gratis att testa</div>
                <div className="text-xs opacity-80">Inget kreditkort krävs</div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Stäng banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile CTA row */}
        <div className="md:hidden mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="opacity-90">{liveCount} aktiva</span>
              <span className="opacity-90">85% bättre svar</span>
            </div>
            <span className="text-xs opacity-75">Gratis test • Inga kort</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrganicTrafficBanner;