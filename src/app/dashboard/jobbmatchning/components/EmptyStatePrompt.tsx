'use client';

import { motion } from 'framer-motion';
import { Briefcase, FileText, Search, Target, ChevronDown } from 'lucide-react';

/**
 * Illustrerat tomt-state-kort som visas nar inget CV ar aktiverat.
 * Forklarar varfor man ska aktivera ett CV och vad som hander dafter.
 *
 * Matchar sidans orange/rod-DNA: vit bakgrund med subtil orange tonad border,
 * gradient ikon-cirkel med pulserande ring, tre numrerade steg, animerad pil
 * nedat som pekar pa CV-listan.
 */
export default function EmptyStatePrompt() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden bg-white rounded-3xl border border-orange-200/50 p-6 sm:p-8"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
    >
      {/* Subtila bakgrundsdots inspirerade av CvHeroStrip */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="empty-state-dots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="16" cy="16" r="1" fill="#FB923C" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#empty-state-dots)" opacity="0.4" />
      </svg>

      <div className="relative">
        {/* Header: gradient-ikon med pulserande ring */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            {/* Yttre pulserande ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
            />
            {/* Mellanring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            />
            {/* Sjalva ikon-cirkeln */}
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                boxShadow: '0 12px 28px -6px rgba(220, 38, 38, 0.45)',
              }}
            >
              <Briefcase className="w-9 h-9" strokeWidth={2} />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Aktivera ett CV för att matcha jobb
          </h3>
          <p className="text-sm sm:text-base text-slate-600 max-w-md">
            Välj vilket av dina CV:n vi ska använda när vi söker jobb åt dig
          </p>
        </div>

        {/* Tre steg som forklarar varfor */}
        <div className="space-y-3 mb-6 max-w-lg mx-auto">
          <Step
            n={1}
            icon={FileText}
            title="Vi extraherar dina yrkesroller och kompetenser"
            body="Algoritmen läser ditt CV och identifierar vad du kan."
          />
          <Step
            n={2}
            icon={Search}
            title="Vi matchar mot tusentals jobb i realtid"
            body="Inte bara senaste titeln — också närliggande roller och dolda möjligheter."
          />
          <Step
            n={3}
            icon={Target}
            title="Du ser hur väl varje jobb matchar dig"
            body="Procentuell relevans + möjlighet att skapa anpassat brev direkt."
          />
        </div>

        {/* Pil nedat mot CV-listan */}
        <div className="flex flex-col items-center gap-1 pt-2">
          <p className="text-sm font-semibold text-orange-700">
            Välj ett av dina CV:n nedan för att börja
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="text-orange-500"
          >
            <ChevronDown className="w-6 h-6" strokeWidth={2.5} />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number;
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-orange-50/40 border border-orange-100">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{
          background: 'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
          boxShadow: '0 2px 6px -1px rgba(220, 38, 38, 0.35)',
        }}
      >
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Icon className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" strokeWidth={2.25} />
          <h4 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-snug">{body}</p>
      </div>
    </div>
  );
}
