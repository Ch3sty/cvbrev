'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Check,
  BarChart3,
  Key,
  Target,
  Briefcase,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FrontendRoleImprovement } from '@/lib/cv/role-based-improvements';

// Export FrontendRoleImprovement as RoleImprovement for backward compatibility
export type RoleImprovement = FrontendRoleImprovement;

interface GeneralImprovement {
  id: string;
  title: string;
  description: string;
  category: 'skills' | 'certifications' | 'languages';
  selected: boolean;
  impact: 'high' | 'medium' | 'low';
}

interface RoleBasedSuggestionSelectorProps {
  roleImprovements: RoleImprovement[];
  generalImprovements: GeneralImprovement[];
  onRoleToggle: (roleId: string) => void;
  onGeneralToggle: (improvementId: string) => void;
  onSelectAllRoles: () => void;
  onClearRoleSelection: () => void;
}

const improvementTypeConfig = {
  quantification: {
    icon: BarChart3,
    label: 'Kvantifiering',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  keywords: {
    icon: Key,
    label: 'Nyckelord',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  ats: {
    icon: Target,
    label: 'ATS',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
};

const impactConfig = {
  high: {
    label: 'Hög påverkan',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  medium: {
    label: 'Medel påverkan',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  low: {
    label: 'Låg påverkan',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
};

const generalCategoryConfig = {
  skills: {
    icon: Star,
    label: 'Saknade färdigheter',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  certifications: {
    icon: Briefcase,
    label: 'Certifieringar',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  languages: {
    icon: TrendingUp,
    label: 'Språkkunskaper',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  }
};

export default function RoleBasedSuggestionSelector({
  roleImprovements,
  generalImprovements,
  onRoleToggle,
  onGeneralToggle,
  onSelectAllRoles,
  onClearRoleSelection
}: RoleBasedSuggestionSelectorProps) {
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [expandedGeneral, setExpandedGeneral] = useState(false);

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const selectedRoleCount = roleImprovements.filter(r => r.selected).length;
  const selectedGeneralCount = generalImprovements.filter(g => g.selected).length;
  const totalRoles = roleImprovements.length;

  const renderImprovementTags = (improvements: RoleImprovement['improvements']) => {
    const tags = [];

    if (improvements.quantification) {
      const config = improvementTypeConfig.quantification;
      const Icon = config.icon;
      tags.push(
        <Badge key="quantification" variant="outline" className={`${config.bgColor} ${config.color} border-0 text-xs`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      );
    }

    if (improvements.keywords.length > 0) {
      const config = improvementTypeConfig.keywords;
      const Icon = config.icon;
      tags.push(
        <Badge key="keywords" variant="outline" className={`${config.bgColor} ${config.color} border-0 text-xs`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label} ({improvements.keywords.length})
        </Badge>
      );
    }

    if (improvements.atsOptimization) {
      const config = improvementTypeConfig.ats;
      const Icon = config.icon;
      tags.push(
        <Badge key="ats" variant="outline" className={`${config.bgColor} ${config.color} border-0 text-xs`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      );
    }

    return tags;
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-pink-600/10 to-purple-600/10">
            <Briefcase className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Roll-baserade förbättringar
            </h3>
            <p className="text-sm text-gray-600">
              {selectedRoleCount} av {totalRoles} roller valda
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAllRoles}
            className="bg-white/80 hover:bg-gray-50"
          >
            Välj alla roller
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearRoleSelection}
            className="bg-white/80 hover:bg-gray-50"
          >
            Rensa val
          </Button>
        </div>
      </div>

      {/* Role-based Improvements */}
      <div className="space-y-4">
        {roleImprovements.map((roleImprovement, index) => {
          const isExpanded = expandedRoles.has(roleImprovement.role);
          const impactInfo = impactConfig[roleImprovement.impact];

          return (
            <motion.div
              key={roleImprovement.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`
                transition-all duration-300 overflow-hidden
                ${roleImprovement.selected
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300 shadow-lg shadow-pink-500/10'
                  : 'bg-white/95 border-gray-200 hover:border-gray-300 hover:shadow-md'}
              `}>
                {/* Role Header */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <div className="mt-1">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: roleImprovement.selected ? 1.1 : 1,
                          rotate: roleImprovement.selected ? 360 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        onClick={() => onRoleToggle(roleImprovement.role)}
                        className={`
                          w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer
                          ${roleImprovement.selected
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-600'
                            : 'bg-white border-gray-300 hover:border-gray-400'}
                        `}
                      >
                        {roleImprovement.selected && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </motion.div>
                    </div>

                    {/* Role Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-base">
                            {roleImprovement.role}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {roleImprovement.period}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${impactInfo.bgColor} ${impactInfo.color} border-0`}>
                            {impactInfo.label}
                          </Badge>
                          {roleImprovement.confidence && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                              {Math.round(roleImprovement.confidence * 100)}% säker
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Improvement Tags */}
                      <div className="flex flex-wrap gap-2">
                        {renderImprovementTags(roleImprovement.improvements)}
                      </div>

                      {/* Expand/Collapse Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRoleExpansion(roleImprovement.role)}
                        className="w-full justify-center bg-gray-50/80 hover:bg-gray-100 h-8"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Dölj förhandsvisning
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Visa före/efter förhandsvisning
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expandable Preview */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200/60"
                    >
                      <div className="p-4 space-y-4 bg-gray-50/30">
                        {/* Original Text */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Nuvarande beskrivning
                          </h5>
                          <div className="p-3 bg-white/80 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {roleImprovement.originalText}
                            </p>
                          </div>
                        </div>

                        {/* Suggested Text */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Förbättrat förslag
                          </h5>
                          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-800 leading-relaxed font-medium">
                              {roleImprovement.suggestedText}
                            </p>
                          </div>
                        </div>

                        {/* Keywords if available */}
                        {roleImprovement.improvements.keywords.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              Tillagda nyckelord
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {roleImprovement.improvements.keywords.map((keyword, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* General Improvements Section */}
      {generalImprovements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600/10 to-blue-600/10">
                <Star className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Allmänna förbättringar</h4>
                <p className="text-sm text-gray-600">
                  {selectedGeneralCount} av {generalImprovements.length} valda
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedGeneral(!expandedGeneral)}
            >
              {expandedGeneral ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          <AnimatePresence>
            {expandedGeneral && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {generalImprovements.map((improvement, index) => {
                  const categoryConfig = generalCategoryConfig[improvement.category];
                  const Icon = categoryConfig.icon;
                  const impactInfo = impactConfig[improvement.impact];

                  return (
                    <motion.div
                      key={improvement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        onClick={() => onGeneralToggle(improvement.id)}
                        className={`
                          cursor-pointer transition-all duration-300 p-3
                          ${improvement.selected
                            ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300 shadow-md'
                            : 'bg-white/80 hover:bg-gray-50 border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            initial={false}
                            animate={{
                              scale: improvement.selected ? 1.1 : 1
                            }}
                            transition={{ duration: 0.3 }}
                            className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center
                              ${improvement.selected
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 border-indigo-600'
                                : 'bg-white border-gray-300'}
                            `}
                          >
                            {improvement.selected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </motion.div>

                          <div className={`p-1.5 rounded ${categoryConfig.bgColor}`}>
                            <Icon className={`h-4 w-4 ${categoryConfig.color}`} />
                          </div>

                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">
                              {improvement.title}
                            </h5>
                            <p className="text-xs text-gray-600">
                              {improvement.description}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Badge className={`text-xs ${categoryConfig.bgColor} ${categoryConfig.color} border-0`}>
                              {categoryConfig.label}
                            </Badge>
                            <Badge className={`text-xs ${impactInfo.bgColor} ${impactInfo.color} border-0`}>
                              {impactInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}