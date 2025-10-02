// src/components/cv/analysis/BeforeAfterComparison.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Sparkles, BarChart3, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ============================================================================
//  Type Definitions
// ============================================================================

interface BeforeAfterComparisonProps {
  beforeText: string;
  afterText: string;
  keywords?: string[];
  hasQuantification?: boolean;
}

// ============================================================================
//  Highlighting Helper
// ============================================================================

/**
 * Highlights keywords and numbers in text
 */
const highlightText = (text: string, keywords: string[] = []): React.ReactNode => {
  // SAFE: Ensure keywords is an array
  const safeKeywords = Array.isArray(keywords) ? keywords : [];

  if (!safeKeywords.length && !text.match(/\d+/)) {
    return text;
  }

  // Create regex patterns for keywords and numbers
  const keywordPattern = safeKeywords.length > 0
    ? new RegExp(`\\b(${safeKeywords.join('|')})\\b`, 'gi')
    : null;
  const numberPattern = /\b\d+([,.]\d+)?(%|MSEK|SEK|kr|st|personer|anställda|medlemmar)?\b/g;

  const result = text;
  const highlights: Array<{ start: number; end: number; type: 'keyword' | 'number' }> = [];

  // Find keyword matches
  if (keywordPattern) {
    let match;
    while ((match = keywordPattern.exec(text)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'keyword'
      });
    }
  }

  // Find number matches
  let match;
  while ((match = numberPattern.exec(text)) !== null) {
    // Check if this number overlaps with a keyword
    const overlaps = highlights.some(h =>
      (match!.index >= h.start && match!.index < h.end) ||
      (match!.index + match![0].length > h.start && match!.index + match![0].length <= h.end)
    );
    if (!overlaps) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'number'
      });
    }
  }

  // Sort highlights by position
  highlights.sort((a, b) => a.start - b.start);

  // Build the highlighted text
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  highlights.forEach((highlight, index) => {
    // Add text before highlight
    if (highlight.start > lastIndex) {
      parts.push(text.substring(lastIndex, highlight.start));
    }

    // Add highlighted text
    const highlightedText = text.substring(highlight.start, highlight.end);
    parts.push(
      <span
        key={`highlight-${index}`}
        className={
          highlight.type === 'keyword'
            ? 'bg-purple-200 text-purple-900 px-1 rounded font-medium'
            : 'bg-blue-200 text-blue-900 px-1 rounded font-medium'
        }
      >
        {highlightedText}
      </span>
    );

    lastIndex = highlight.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

// ============================================================================
//  Component
// ============================================================================

export default function BeforeAfterComparison({
  beforeText,
  afterText,
  keywords = [],
  hasQuantification = false
}: BeforeAfterComparisonProps) {
  return (
    <div className="space-y-3">
      {/* Before */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-gray-400 rounded-full" />
          <span className="text-xs font-semibold text-gray-600 uppercase">
            Nuvarande text
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {beforeText}
        </p>
      </motion.div>

      {/* Arrow Indicator */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ willChange: 'transform' }}
          transition={{ delay: 0.2, type: "spring" as const, stiffness: 200 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-2"
        >
          <ArrowDown className="w-4 h-4 text-white" />
        </motion.div>
      </div>

      {/* After */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
          <span className="text-xs font-semibold text-gray-600 uppercase">
            AI-förbättrad text
          </span>
          <Sparkles className="w-3 h-3 text-green-600" />
        </div>
        <p className="text-sm text-gray-900 leading-relaxed font-medium">
          {highlightText(afterText, keywords)}
        </p>

        {/* Improvement Tags */}
        <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-green-200">
          {hasQuantification && (
            <Badge className="bg-blue-600 text-white text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Kvantifierat
            </Badge>
          )}
          {keywords.length > 0 && (
            <Badge className="bg-purple-600 text-white text-xs">
              <Key className="w-3 h-3 mr-1" />
              {keywords.length} nyckelord tillagda
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Legend */}
      {(keywords.length > 0 || hasQuantification) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4 text-xs text-gray-600 pt-2"
        >
          {keywords.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded">Nyckelord</span>
            </div>
          )}
          {hasQuantification && (
            <div className="flex items-center gap-1">
              <span className="bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded">Siffror</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
