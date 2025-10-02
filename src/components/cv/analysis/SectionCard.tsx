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
  Check,
  Edit3,
  Save
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
  currentText?: string;
  suggestedText: string;
  improvements: Improvements;
  atsImpact?: number;
  onTextEdit?: (newText: string) => void; // Callback när text ändras
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
  atsImpact,
  onTextEdit
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(suggestedText);
  const config = priorityConfig[priority];

  const handleSave = () => {
    if (onTextEdit && editedText !== suggestedText) {
      onTextEdit(editedText);
    }
    setIsEditing(false);
  };

  // Räkna förbättringstyper - SAFE version
  const improvementCount = [
    improvements && !improvements.hasQuantification,
    improvements && (improvements.keywords?.length || 0) > 0,
    improvements && (improvements.grammarIssues?.length || 0) > 0,
    improvements && improvements.atsOptimization
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
          {improvements && !improvements.hasQuantification && (
            <Badge className="bg-blue-50 text-blue-700 border border-blue-300 text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Behöver kvantifiering
            </Badge>
          )}
          {improvements && (improvements.keywords?.length || 0) > 0 && (
            <Badge className="bg-purple-50 text-purple-700 border border-purple-300 text-xs">
              <Key className="w-3 h-3 mr-1" />
              {improvements?.keywords?.length || 0} nyckelord
            </Badge>
          )}
          {improvements && (improvements.grammarIssues?.length || 0) > 0 && (
            <Badge className="bg-orange-50 text-orange-700 border border-orange-300 text-xs">
              <Type className="w-3 h-3 mr-1" />
              {improvements?.grammarIssues?.length || 0} grammatikfel
            </Badge>
          )}
          {improvements && improvements.atsOptimization && (
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
                {!isEditing ? (
                  <>
                    <BeforeAfterComparison
                      beforeText={currentText || ''}
                      afterText={editedText}
                      keywords={improvements?.keywords || []}
                      hasQuantification={improvements ? !improvements.hasQuantification : false}
                    />

                    {/* Edit Button */}
                    {onTextEdit && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Redigera förslag
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Redigera AI-förslag
                        <span className="text-gray-500 font-normal ml-2">
                          (Justera siffror, erfarenheter och detaljer)
                        </span>
                      </label>
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full min-h-[120px] p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Redigera AI:ns förslag här..."
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditedText(suggestedText);
                          setIsEditing(false);
                        }}
                      >
                        Avbryt
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Spara ändringar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Grammar Issues */}
                {!isEditing && (improvements.grammarIssues || []).length > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">
                          Grammatikförbättringar
                        </h5>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {(improvements.grammarIssues || []).map((issue, index) => (
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
