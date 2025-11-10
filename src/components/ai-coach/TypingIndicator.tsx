'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 px-5 py-3 rounded-2xl rounded-tl-sm shadow-lg">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 bg-slate-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="w-2 h-2 bg-slate-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />
            <motion.div
              className="w-2 h-2 bg-slate-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
