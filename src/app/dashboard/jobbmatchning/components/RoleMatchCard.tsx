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

  const accentByConfidence: Record<typeof confidence, { bar: string; iconText: string; ring: string }> = {
    high: {
      bar: 'bg-emerald-500',
      iconText: 'text-emerald-600',
      ring: 'ring-1 ring-emerald-100',
    },
    medium: {
      bar: 'bg-amber-500',
      iconText: 'text-amber-600',
      ring: 'ring-1 ring-amber-100',
    },
    low: {
      bar: 'bg-neutral-300',
      iconText: 'text-neutral-500',
      ring: '',
    },
  };
  const accent = accentByConfidence[confidence];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`relative bg-white rounded-xl border border-neutral-200 p-4 hover:border-orange-300 transition-all overflow-hidden ${accent.ring}`}
    >
      {/* Tunn accent-stripe pa toppen baserad pa confidence */}
      <div className={`absolute top-0 inset-x-0 h-0.5 ${accent.bar}`} />

      <div className="flex items-start gap-3 mb-3">
        <Briefcase className={`w-5 h-5 flex-shrink-0 mt-0.5 ${accent.iconText}`} strokeWidth={2.25} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-semibold text-neutral-900 leading-tight break-words">
            {normalized}
          </h4>
          {showOriginal && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-neutral-500">
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
        <div className="flex flex-wrap gap-1 pt-3 border-t border-neutral-100">
          {synonyms.map((label, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs font-medium"
            >
              {label}
            </span>
          ))}
          {hiddenSynonyms > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-50 text-neutral-500 text-xs">
              +{hiddenSynonyms}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
