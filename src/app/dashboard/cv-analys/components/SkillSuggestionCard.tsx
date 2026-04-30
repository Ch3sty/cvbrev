'use client';

import { motion } from 'framer-motion';
import { Award, Briefcase, Check } from 'lucide-react';

interface SkillSuggestion {
  skill: string;
  source: string;
  relevance: 'high' | 'medium' | 'low';
  reasoning: string;
}

interface SkillSuggestionCardProps {
  suggestion: SkillSuggestion;
  selected: boolean;
  onToggle: () => void;
}

const RELEVANCE_LABELS = {
  high: 'Hög relevans',
  medium: 'Medel relevans',
  low: 'Låg relevans',
};

export default function SkillSuggestionCard({
  suggestion,
  selected,
  onToggle,
}: SkillSuggestionCardProps) {
  const relevance = suggestion?.relevance || 'medium';
  const relevanceLabel = RELEVANCE_LABELS[relevance];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl bg-white transition-all overflow-hidden ${
        selected ? 'border-2 border-emerald-500' : 'border-2 border-orange-200/60'
      }`}
      style={{
        boxShadow: selected
          ? '0 0 0 4px rgba(16, 185, 129, 0.12), 0 8px 20px -8px rgba(16, 185, 129, 0.25)'
          : '0 2px 8px -4px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* Topp-band */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: selected
            ? 'linear-gradient(90deg, #10B981, #059669)'
            : 'linear-gradient(90deg, #F97316, #DC2626)',
        }}
      />

      <div className="p-4 sm:p-5 pt-5">
        <div className="flex items-start gap-3">
          {/* Custom checkbox */}
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            aria-label={selected ? `Avmarkera ${suggestion.skill}` : `Lägg till ${suggestion.skill}`}
            className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              selected
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-orange-300 bg-white hover:border-orange-500'
            }`}
            style={{
              boxShadow: selected
                ? '0 4px 10px -2px rgba(16, 185, 129, 0.4)'
                : 'none',
            }}
          >
            {selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            {/* Header med skill-namn + relevans */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
              >
                <Award className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                {suggestion.skill}
              </h5>
              <RelevanceBadge relevance={relevance} label={relevanceLabel} />
            </div>

            {/* Källa */}
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Källa från ditt CV
              </div>
              <div
                className="rounded-lg px-3 py-2 inline-flex items-center gap-2"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                }}
              >
                <Briefcase className="w-3.5 h-3.5 text-orange-700 flex-shrink-0" strokeWidth={2.25} />
                <span className="text-sm font-medium text-orange-900">
                  {suggestion.source || 'Din tidigare erfarenhet'}
                </span>
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Varför vi föreslår den
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {suggestion.reasoning}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RelevanceBadge({
  relevance,
  label,
}: {
  relevance: 'high' | 'medium' | 'low';
  label: string;
}) {
  const styles =
    relevance === 'high'
      ? {
          background:
            'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#047857',
        }
      : relevance === 'medium'
      ? {
          background:
            'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
          border: '1px solid rgba(251, 146, 60, 0.35)',
          color: '#C2410C',
        }
      : {
          background: 'rgba(148, 163, 184, 0.12)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          color: '#475569',
        };

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={styles}
    >
      {label}
    </span>
  );
}
