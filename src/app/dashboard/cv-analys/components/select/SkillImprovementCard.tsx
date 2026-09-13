'use client';

import { Award } from 'lucide-react';
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

/**
 * En föreslagen kompetens. Bort: dubbel kant, gröna och orange pillar och
 * den orange rutan bakom motiveringen. Källan ligger nu i en insunken yta.
 */
export default function SkillImprovementCard({
  suggestion,
  selected,
  onToggle,
}: SkillImprovementCardProps) {
  const relevance = suggestion?.relevance || 'medium';

  return (
    <div
      className={`overflow-hidden rounded-xl bg-panel transition-colors ${
        selected ? 'border border-ink-1' : 'border border-kant'
      }`}
    >
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          <RoundCheckbox
            checked={selected}
            onChange={onToggle}
            ariaLabel={selected ? `Avmarkera ${suggestion.skill}` : `Lägg till ${suggestion.skill}`}
          />

          <div className="min-w-0 flex-1">
            {/* Skill-namn + relevans */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Award
                className="h-5 w-5 flex-shrink-0 text-ink-2"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h5 className="text-kort text-ink-1">{suggestion.skill}</h5>
              <span className="inline-flex items-center rounded-md border border-kant bg-insunken px-2 py-0.5 text-meta font-medium text-ink-2">
                {RELEVANCE_LABELS[relevance]}
              </span>
            </div>

            {/* Källa + motivering */}
            <div className="rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
              <p className="text-steg uppercase text-ink-3">Från ditt CV</p>
              <p className="mt-0.5 text-meta text-ink-2">
                {suggestion.source || 'Din tidigare erfarenhet'}
              </p>
              <p className="mt-2 text-meta leading-relaxed text-ink-3">
                {suggestion.reasoning}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
