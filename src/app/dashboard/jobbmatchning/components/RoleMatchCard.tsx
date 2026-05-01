'use client';

import { motion } from 'framer-motion';
import { Briefcase, ArrowRight } from 'lucide-react';
import ConfidenceMeter from './ConfidenceMeter';

interface RoleMatchCardProps {
  normalized: string;
  original: string;
  alternativeLabels: string[];
  confidence: 'high' | 'medium' | 'low';
  index?: number;
}

/**
 * Yrkesroll-kort med ConfidenceMeter, original-titel som "transformation"-rad
 * och synonymer som mini-pills. Designat for att radas upp i en horisontell
 * grid eller swipe-bar.
 */
export default function RoleMatchCard({
  normalized,
  original,
  alternativeLabels,
  confidence,
  index = 0,
}: RoleMatchCardProps) {
  const showOriginal = original && original !== normalized;
  const synonyms = alternativeLabels.slice(0, 2);
  const hiddenSynonyms = Math.max(0, alternativeLabels.length - 2);

  const accentByConfidence: Record<typeof confidence, { bar: string; iconBg: string; iconText: string; ring: string }> = {
    high: {
      bar: 'linear-gradient(135deg, #10B981, #059669)',
      iconBg: 'bg-emerald-50',
      iconText: 'text-emerald-600',
      ring: 'ring-1 ring-emerald-100',
    },
    medium: {
      bar: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
      iconBg: 'bg-amber-50',
      iconText: 'text-amber-600',
      ring: 'ring-1 ring-amber-100',
    },
    low: {
      bar: 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
      iconBg: 'bg-slate-100',
      iconText: 'text-slate-500',
      ring: '',
    },
  };
  const accent = accentByConfidence[confidence];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`relative bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-orange-300 transition-all overflow-hidden ${accent.ring}`}
    >
      {/* Tunn accent-stripe pa toppen baserad pa confidence */}
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: accent.bar }}
      />

      <div className="flex items-start gap-3 mb-3">
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${accent.iconBg} ${accent.iconText}`}
        >
          <Briefcase className="w-4 h-4" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-tight break-words">
            {normalized}
          </h4>
          {showOriginal && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
              <span className="truncate">{original}</span>
              <ArrowRight className="w-3 h-3 flex-shrink-0 text-orange-400" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>

      {/* Confidence meter */}
      <div className="mb-3">
        <ConfidenceMeter confidence={confidence} />
      </div>

      {/* Synonymer */}
      {synonyms.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-100">
          {synonyms.map((label, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium"
            >
              {label}
            </span>
          ))}
          {hiddenSynonyms > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px]">
              +{hiddenSynonyms}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
