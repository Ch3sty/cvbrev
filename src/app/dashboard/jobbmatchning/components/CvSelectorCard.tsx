'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar, ArrowRight } from 'lucide-react';

interface CvSelectorCardProps {
  cv: {
    id: string;
    file_name: string;
    created_at: string;
  };
  onActivate: (cvId: string) => void;
  isActivating: boolean;
}

/**
 * Modern CV-valj-kort som ersatter InactiveCVCard.
 * - Orange/rod gradient ikon (matchar CvHeroStrip)
 * - Subtilt dokument-monster i header-bakgrunden
 * - Hover-lyft med orange-glow shadow
 * - Tydlig "Aktivera detta CV ->" CTA
 * - PulsingDots overlay vid aktivering
 */
export default function CvSelectorCard({ cv, onActivate, isActivating }: CvSelectorCardProps) {
  return (
    <motion.button
      onClick={() => onActivate(cv.id)}
      disabled={isActivating}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group relative w-full text-left bg-white rounded-2xl border border-slate-200 hover:border-orange-300 transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-300/50 disabled:cursor-wait"
      style={{
        boxShadow:
          '0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: '0 12px 32px -8px rgba(249, 115, 22, 0.25)',
          borderRadius: 'inherit',
        }}
      />

      {/* Header med subtilt dokument-monster i bakgrunden */}
      <div className="relative p-5 overflow-hidden">
        <DocumentPatternBg />

        <div className="relative flex items-start gap-3">
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
            }}
          >
            <FileText className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {cv.file_name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Uppladdat {new Date(cv.created_at).toLocaleDateString('sv-SE')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA-rad */}
      <div className="px-5 py-3 bg-orange-50/40 border-t border-slate-100 flex items-center justify-between text-sm font-semibold">
        {isActivating ? (
          <div className="flex items-center gap-2 text-orange-700">
            <PulsingDots />
            <span>Aktiverar...</span>
          </div>
        ) : (
          <>
            <span className="text-orange-700">Aktivera detta CV</span>
            <ArrowRight
              className="w-4 h-4 text-orange-600 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.5}
            />
          </>
        )}
      </div>
    </motion.button>
  );
}

/**
 * Subtilt dokument-monster i kortets header. Tre stiliserade rader
 * som antyder text pa ett papper. Mycket diskret (opacity 5-8%).
 */
function DocumentPatternBg() {
  return (
    <svg
      className="absolute -right-4 -bottom-4 opacity-[0.07] pointer-events-none"
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="20"
        y="15"
        width="80"
        height="100"
        rx="8"
        stroke="#DC2626"
        strokeWidth="2"
      />
      <line x1="32" y1="35" x2="80" y2="35" stroke="#DC2626" strokeWidth="2" />
      <line x1="32" y1="50" x2="72" y2="50" stroke="#DC2626" strokeWidth="2" />
      <line x1="32" y1="70" x2="80" y2="70" stroke="#DC2626" strokeWidth="2" />
      <line x1="32" y1="85" x2="64" y2="85" stroke="#DC2626" strokeWidth="2" />
    </svg>
  );
}

function PulsingDots() {
  return (
    <div className="flex gap-1">
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-orange-600"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay }}
        />
      ))}
    </div>
  );
}
