'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkle } from 'lucide-react';

const PERSONAS = [
  {
    role: 'Projektledare → DevOps',
    text: 'Min erfarenhet av att leda agila team och optimera leveransflöden gör mig redo att kliva in i en DevOps-roll där samarbete och automation står i centrum.',
  },
  {
    role: 'Marknadsförare → UX',
    text: 'Att översätta kundinsikter till produkter har varit kärnan i mitt arbete. Nu vill jag ta steget och bygga digitala upplevelser som verkligen löser problem.',
  },
  {
    role: 'Controller → Business Analyst',
    text: 'Min analytiska blick på siffror och affärsprocesser gör skillnad när organisationer behöver förstå vad data faktiskt betyder för besluten framåt.',
  },
];

export default function LiveAIShowcase() {
  const [personaIndex, setPersonaIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const charIndexRef = useRef(0);

  useEffect(() => {
    if (isPaused) return;

    const persona = PERSONAS[personaIndex];
    const fullText = persona.text;

    if (charIndexRef.current < fullText.length) {
      const timeout = setTimeout(() => {
        charIndexRef.current += 1;
        setTypedText(fullText.slice(0, charIndexRef.current));
      }, 22);
      return () => clearTimeout(timeout);
    }

    const pauseTimeout = setTimeout(() => {
      charIndexRef.current = 0;
      setTypedText('');
      setPersonaIndex((prev) => (prev + 1) % PERSONAS.length);
    }, 2400);
    return () => clearTimeout(pauseTimeout);
  }, [typedText, personaIndex, isPaused]);

  const persona = PERSONAS[personaIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 24px 48px -16px rgba(220, 38, 38, 0.45)',
      }}
      aria-label="Live-demo av AI-skrivet personligt brev"
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="ai-showcase-dots"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="12" cy="12" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#ai-showcase-dots)" />
      </svg>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 100% 0%, rgba(0,0,0,0.18) 0%, transparent 55%)',
        }}
        aria-hidden="true"
      />

      <div className="relative p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/15 border border-white/25 mb-5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" aria-hidden="true" />
          Live · AI skriver just nu
        </div>

        <div className="flex items-center gap-2 mb-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider opacity-90">
          <Sparkle className="w-3.5 h-3.5" strokeWidth={2.5} />
          {persona.role}
        </div>

        <div
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 sm:p-6 min-h-[220px] sm:min-h-[260px]"
          aria-live="polite"
          aria-atomic="false"
        >
          <p className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-white">
            {typedText}
            <span
              className="inline-block w-0.5 h-5 sm:h-6 ml-0.5 bg-white align-middle animate-pulse"
              aria-hidden="true"
            />
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between gap-3 text-[11px] sm:text-xs opacity-90">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300"
              aria-hidden="true"
            />
            <span>Anpassat för svenska arbetsmarknaden</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 tabular-nums">
            <span className="font-bold">60s</span>
            <span className="opacity-80">per brev</span>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-6 left-6 w-1.5 h-1.5 rounded-full bg-white/40"
        aria-hidden="true"
      />
      <div
        className="absolute top-8 right-8 w-1 h-1 rounded-full bg-white/35"
        aria-hidden="true"
      />
    </motion.div>
  );
}
