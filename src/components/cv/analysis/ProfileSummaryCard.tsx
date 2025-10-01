// src/components/cv/analysis/ProfileSummaryCard.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileSummaryCardProps {
  currentText: string;
  improvedText: string;
  changes: string[];
  atsImpact: number;
  selected: boolean;
  onToggle: () => void;
}

export default function ProfileSummaryCard({
  currentText,
  improvedText,
  changes,
  atsImpact,
  selected,
  onToggle
}: ProfileSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`p-6 transition-all ${
      selected ? 'border-2 border-pink-600 bg-pink-50/30' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-pink-600" />
            <h4 className="font-semibold text-gray-900">Personbeskrivning</h4>
            <Badge className="bg-pink-100 text-pink-700 border-pink-200">
              <Sparkles className="w-3 h-3 mr-1" />
              +{atsImpact} ATS-poäng
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Din inledning har optimerats för ATS och engagemang
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Changes Summary (Always Visible) */}
      {!isExpanded && changes.length > 0 && (
        <div className="ml-9 text-sm text-gray-600">
          <span className="font-medium">{changes.length} förbättringar:</span> {changes[0]}
          {changes.length > 1 && `, +${changes.length - 1} till...`}
        </div>
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="ml-9 space-y-4"
          >
            {/* Before */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Nuvarande version
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 italic">{currentText}</p>
              </div>
            </div>

            {/* After */}
            <div>
              <div className="text-xs font-semibold text-green-700 uppercase mb-2">
                Förbättrad version
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 font-medium">{improvedText}</p>
              </div>
            </div>

            {/* Changes List */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Förbättringar
              </div>
              <ul className="space-y-2">
                {changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
