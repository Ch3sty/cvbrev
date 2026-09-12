'use client';

import { motion } from 'framer-motion';
import { Award, Briefcase } from 'lucide-react';
import { RoundCheckbox } from './ImprovementCard';

interface SkillSuggestion {
  skill: string;
  source: string;
  relevance: 'high' | 'medium' | 'low';
  reasoning: string;
}

interface SkillImprovementCardProps {
  suggestion: SkillSuggestion;
  selected: boolean;
  onToggle: () => void;
}

const RELEVANCE_LABELS = {
  high: 'Hög relevans',
  medium: 'Medel',
  low: 'Låg',
};

export default function SkillImprovementCard({
  suggestion,
  selected,
  onToggle,
}: SkillImprovementCardProps) {
  const relevance = suggestion?.relevance || 'medium';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-xl bg-white overflow-hidden transition-all ${
        selected ? 'border-2 border-emerald-500' : 'border-2 border-orange-200/60'
      }`}
    >
      <div className="p-3.5 sm:p-4 pt-4">
        <div className="flex items-start gap-3">
          <RoundCheckbox
            checked={selected}
            onChange={onToggle}
            ariaLabel={selected ? `Avmarkera ${suggestion.skill}` : `Lägg till ${suggestion.skill}`}
          />

          <div className="flex-1 min-w-0">
            {/* Skill-namn + relevans */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                <Award className="w-4 h-4 text-neutral-700" strokeWidth={2.25} />
              </div>
              <h5 className="font-bold text-neutral-900 text-sm">{suggestion.skill}</h5>
              <RelevanceBadge relevance={relevance} />
            </div>

            {/* Källa + reasoning kombinerat i ett pedagogiskt block */}
            <div
              className="rounded-lg p-3 text-xs"
              style={{
                background: 'rgba(249, 115, 22, 0.05)',
                border: '1px solid rgba(249, 115, 22, 0.18)',
              }}
            >
              <div className="flex items-start gap-2 mb-2">
                <Briefcase className="w-3.5 h-3.5 text-orange-700 flex-shrink-0 mt-0.5" strokeWidth={2.25} />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700 block mb-0.5">
                    Från ditt CV
                  </span>
                  <span className="text-neutral-700 text-xs">
                    {suggestion.source || 'Din tidigare erfarenhet'}
                  </span>
                </div>
              </div>
              <p className="text-neutral-600 leading-relaxed pl-5">
                {suggestion.reasoning}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RelevanceBadge({ relevance }: { relevance: 'high' | 'medium' | 'low' }) {
  const styles =
    relevance === 'high'
      ? {
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#047857',
        }
      : relevance === 'medium'
      ? {
          background: 'rgba(251, 146, 60, 0.12)',
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
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
      style={styles}
    >
      {RELEVANCE_LABELS[relevance]}
    </span>
  );
}
