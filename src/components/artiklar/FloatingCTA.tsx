'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, PenTool } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGlobalCounters } from '@/contexts/GlobalCountersContext';

const FloatingCTA = () => {
  const { counters } = useGlobalCounters();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;

      // Show after user has scrolled down 1.5 viewport heights
      if (scrolled > windowHeight * 1.5 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check if user dismissed it in this session
    const dismissed = sessionStorage.getItem('floating-cta-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('floating-cta-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.6
          }}
          className="fixed bottom-6 right-6 z-50 max-w-xs"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600
                       hover:bg-gray-100 rounded-lg transition-colors duration-200 z-10"
              aria-label="Stäng"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"></div>

            {/* Content */}
            <div className="relative p-4 pt-8">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600
                            rounded-lg mb-3 shadow-lg">
                <PenTool className="w-5 h-5 text-white" />
              </div>

              {/* Text */}
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Gillar du våra artiklar?
              </h3>
              <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                Skräddarsytt personligt brev. Klart på 2 minuter.
                Över {counters.totalUsers} jobbsökare har redan förbättrat sina ansökningar.
              </p>

              {/* CTA Button */}
              <Link
                href="/create-letter"
                className="group flex items-center justify-center w-full py-2.5 px-3 text-sm
                         bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold
                         rounded-lg hover:from-pink-500 hover:to-purple-500
                         transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Skapa mitt brev - Gratis
                <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              {/* Trust indicators */}
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  2 min • Inga kort krävs
                </p>
              </div>
            </div>

            {/* Animated background elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400/20 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-purple-400/20 rounded-full animate-pulse delay-1000"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;