'use client';

import { motion } from 'framer-motion';
import { Briefcase, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Söker i arbetsmarknadsdata...',
  'Analyserar information...',
  'Sammanställer svar...',
];

export default function TypingIndicator() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
        <motion.div
          className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </motion.div>
        <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm relative overflow-hidden">
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative z-10">
            {/* Status text */}
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-slate-600 mb-2 font-medium"
            >
              <Search className="w-3 h-3 inline mr-1" />
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>

            {/* Typing dots */}
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.15,
                }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
