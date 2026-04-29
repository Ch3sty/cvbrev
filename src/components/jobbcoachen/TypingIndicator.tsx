'use client';

import { motion } from 'framer-motion';
import { Briefcase, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Söker i arbetsmarknadsdata…',
  'Analyserar information…',
  'Sammanställer svar…',
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
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 4px 10px -2px rgba(220, 38, 38, 0.35)',
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.25} />
        </motion.div>
        <div
          className="bg-white border border-orange-200/50 px-5 py-3 rounded-3xl rounded-bl-md relative overflow-hidden"
          style={{ boxShadow: '0 8px 24px -12px rgba(249, 115, 22, 0.18)' }}
        >
          {/* Shimmer effect (orange-tinted) */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.08), transparent)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative z-10">
            {/* Status text */}
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-orange-700 mb-2 font-semibold flex items-center gap-1"
            >
              <Search className="w-3 h-3" strokeWidth={2.5} />
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>

            {/* Typing dots i orange/röd-gradient */}
            <div className="flex items-center gap-1.5">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
