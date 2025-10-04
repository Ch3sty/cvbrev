// src/components/cv/analysis/SkillSuggestionCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Award, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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

export default function SkillSuggestionCard({
  suggestion,
  selected,
  onToggle
}: SkillSuggestionCardProps) {
  const relevanceConfig = {
    high: {
      color: 'bg-green-100 text-green-700 border-green-200',
      label: 'Hög relevans'
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      label: 'Medel relevans'
    },
    low: {
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      label: 'Låg relevans'
    }
  };

  const config = relevanceConfig[suggestion?.relevance || 'medium'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-4 transition-all hover:shadow-md ${
        selected ? 'border-2 border-purple-600 bg-purple-50/30' : 'border-gray-200'
      }`}>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-600" />
              <h5 className="font-semibold text-gray-900">{suggestion.skill}</h5>
              <Badge className={config.color}>
                {config.label}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">
                  Källa från din arbetserfarenhet:
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900 font-medium">{suggestion.source || 'Din tidigare erfarenhet'}</p>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">
                  Varför denna kompetens:
                </div>
                <p className="text-sm text-gray-700">{suggestion.reasoning}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
