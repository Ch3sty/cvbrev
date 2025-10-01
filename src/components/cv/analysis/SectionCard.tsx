// src/components/cv/analysis/SectionCard.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  Key,
  Type,
  AlertTriangle,
  Sparkles,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BeforeAfterComparison from './BeforeAfterComparison';

// ============================================================================
//  Type Definitions
// ============================================================================

interface Improvements {
  hasQuantification?: boolean;
  keywords?: string[];
  grammarIssues?: string[];
  atsOptimization?: boolean;
}

interface SectionCardProps {
  sectionName: string;
  sectionType: 'work_experience' | 'profile' | 'skills' | 'education';
  period?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  currentText: string;
  suggestedText: string;
  improvements: Improvements;
  atsImpact: number;
}

// ============================================================================
//  Priority Configuration
// ============================================================================

const priorityConfig = {
  critical: {
    color: 'bg-red-500',
    borderColor: 'border-red-300',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    label: 'Kritisk',
    pulse: true
  },
  high: {
    color: 'bg-orange-500',
    borderColor: 'border-orange-300',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    label: 'Hög prioritet',
    pulse: false
  },
  medium: {
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-300',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    label: 'Mellan',
    pulse: false
  },
  low: {
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    label: 'Låg',
    pulse: false
  }
};

// ============================================================================
//  Component
// ============================================================================

export default function SectionCard({
  sectionName,
  sectionType,
  period,
  priority,
  currentText,
  suggestedText,
  improvements,
  atsImpact
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = priorityConfig[priority];

  // Räkna förbättringstyper
  const improvementCount = [
    !improvements.hasQuantification,
    (improvements.keywords?.length || 0) > 0,
    (improvements.grammarIssues?.length || 0) > 0,
    improvements.atsOptimization
  ].filter(Boolean).length;

  return (
    <Card
      className={`
        bg-white/95 border-2 transition-all duration-300
        ${isExpanded ? 'shadow-xl ' + config.borderColor : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
      `}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Priority Indicator */}
            <div className={`w-3 h-3 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />

            {/* Section Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-base">{sectionName}</h4>
              {period && (
                <p className="text-sm text-gray-600">{period}</p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 text-white">
              +{atsImpact} ATS
            </Badge>
            <Badge className={`${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Improvement Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {!improvements.hasQuantification && (
            <Badge className="bg-blue-50 text-blue-700 border border-blue-300 text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Behöver kvantifiering
            </Badge>
          )}
          {(improvements.keywords?.length || 0) > 0 && (
            <Badge className="bg-purple-50 text-purple-700 border border-purple-300 text-xs">
              <Key className="w-3 h-3 mr-1" />
              {improvements.keywords?.length || 0} nyckelord
            </Badge>
          )}
          {(improvements.grammarIssues?.length || 0) > 0 && (
            <Badge className="bg-orange-50 text-orange-700 border border-orange-300 text-xs">
              <Type className="w-3 h-3 mr-1" />
              {improvements.grammarIssues?.length || 0} grammatikfel
            </Badge>
          )}
          {improvements.atsOptimization && (
            <Badge className="bg-green-50 text-green-700 border border-green-300 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              ATS-optimering
            </Badge>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <div className="p-5">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-700">
            {isExpanded ? 'Dölj förbättring' : 'Visa förbättring'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </Button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4">
                <BeforeAfterComparison
                  beforeText={currentText}
                  afterText={suggestedText}
                  keywords={improvements.keywords || []}
                  hasQuantification={!improvements.hasQuantification}
                />

                {/* Grammar Issues */}
                {(improvements.grammarIssues?.length || 0) > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">
                          Grammatikförbättringar
                        </h5>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {improvements.grammarIssues?.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
