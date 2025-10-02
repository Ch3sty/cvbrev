// src/components/cv/analysis/steps/SelectImprovementsStep.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  Award,
  Target,
  CheckSquare,
  Square
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileSummaryCard from '../ProfileSummaryCard';
import SkillSuggestionCard from '../SkillSuggestionCard';
import SectionCard from '../SectionCard';

interface SelectImprovementsStepProps {
  profileSummary?: {
    currentText: string;
    improvedText: string;
    changes: string[];
    atsImpact: number;
  };
  roleBasedImprovements?: any[];
  skillSuggestions?: any[];
  generalImprovements?: any[];
  selectedProfile: boolean;
  selectedRoles: Set<number>;
  selectedSkills: Set<number>;
  selectedGeneral: Set<number>;
  onToggleProfile: () => void;
  onToggleRole: (index: number) => void;
  onToggleSkill: (index: number) => void;
  onToggleGeneral: (index: number) => void;
  onRoleTextEdit?: (index: number, newText: string) => void;
}

type Category = 'profile' | 'roles' | 'skills' | 'general';

// ============================================================================
//  SAFE DATA VALIDATOR - Runs ONCE at component mount
// ============================================================================
function useSafeData(props: SelectImprovementsStepProps) {
  return useMemo(() => {
    // Validate and sanitize ALL data at component initialization
    const safeRoles = Array.isArray(props.roleBasedImprovements)
      ? props.roleBasedImprovements.map((role, index) => {
          // Return GUARANTEED safe object structure
          return {
            roleTitle: String(role?.roleTitle || `Roll ${index + 1}`),
            company: String(role?.company || 'Företag'),
            period: String(role?.period || ''),
            currentText: String(role?.currentText || ''),
            suggestedText: String(role?.suggestedText || ''),
            priority: role?.priority || 'medium',
            atsImpact: typeof role?.atsImpact === 'number' ? role.atsImpact : 0,
            improvements: {
              hasQuantification: Boolean(role?.improvements?.hasQuantification),
              keywords: Array.isArray(role?.improvements?.keywords)
                ? role.improvements.keywords
                    .filter((k: any) => typeof k === 'string' && k.trim())
                    .map((k: any) => String(k).trim())
                : [],
              grammarIssues: Array.isArray(role?.improvements?.grammarIssues)
                ? role.improvements.grammarIssues
                    .filter((g: any) => typeof g === 'string' && g.trim())
                    .map((g: any) => String(g).trim())
                : [],
              atsOptimization: Boolean(role?.improvements?.atsOptimization)
            }
          };
        })
      : [];

    const safeSkills = Array.isArray(props.skillSuggestions)
      ? props.skillSuggestions
      : [];

    const safeGeneral = Array.isArray(props.generalImprovements)
      ? props.generalImprovements
      : [];

    return {
      roles: safeRoles,
      skills: safeSkills,
      general: safeGeneral,
      hasProfile: Boolean(props.profileSummary)
    };
  }, [props.roleBasedImprovements, props.skillSuggestions, props.generalImprovements, props.profileSummary]);
}

export default function SelectImprovementsStep(props: SelectImprovementsStepProps) {
  const {
    profileSummary,
    selectedProfile,
    selectedRoles,
    selectedSkills,
    selectedGeneral,
    onToggleProfile,
    onToggleRole,
    onToggleSkill,
    onToggleGeneral,
    onRoleTextEdit
  } = props;

  // Get GUARANTEED safe data
  const safeData = useSafeData(props);

  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(
    new Set(['profile', 'roles'])
  );

  const toggleCategory = (category: Category) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const selectAllInCategory = (category: Category) => {
    if (category === 'profile') {
      onToggleProfile();
    } else if (category === 'roles') {
      safeData.roles.forEach((_, index) => {
        if (!selectedRoles.has(index)) onToggleRole(index);
      });
    } else if (category === 'skills') {
      safeData.skills.forEach((_, index) => {
        if (!selectedSkills.has(index)) onToggleSkill(index);
      });
    } else if (category === 'general') {
      safeData.general.forEach((_, index) => {
        if (!selectedGeneral.has(index)) onToggleGeneral(index);
      });
    }
  };

  const deselectAllInCategory = (category: Category) => {
    if (category === 'profile') {
      if (selectedProfile) onToggleProfile();
    } else if (category === 'roles') {
      Array.from(selectedRoles).forEach(index => onToggleRole(index));
    } else if (category === 'skills') {
      Array.from(selectedSkills).forEach(index => onToggleSkill(index));
    } else if (category === 'general') {
      Array.from(selectedGeneral).forEach(index => onToggleGeneral(index));
    }
  };

  const categories = [
    {
      id: 'profile' as Category,
      icon: User,
      title: 'Personbeskrivning',
      color: 'from-pink-600 to-rose-600',
      count: safeData.hasProfile ? 1 : 0,
      selectedCount: selectedProfile ? 1 : 0
    },
    {
      id: 'roles' as Category,
      icon: Briefcase,
      title: 'Rollbaserade förbättringar',
      color: 'from-blue-600 to-cyan-600',
      count: safeData.roles.length,
      selectedCount: selectedRoles.size
    },
    {
      id: 'skills' as Category,
      icon: Award,
      title: 'Kompetenser & färdigheter',
      color: 'from-purple-600 to-pink-600',
      count: safeData.skills.length,
      selectedCount: selectedSkills.size
    },
    {
      id: 'general' as Category,
      icon: Target,
      title: 'Allmänna förbättringar',
      color: 'from-green-600 to-emerald-600',
      count: safeData.general.length,
      selectedCount: selectedGeneral.size
    }
  ];

  const totalSelected =
    (selectedProfile ? 1 : 0) +
    selectedRoles.size +
    selectedSkills.size +
    selectedGeneral.size;

  const totalAvailable =
    (safeData.hasProfile ? 1 : 0) +
    safeData.roles.length +
    safeData.skills.length +
    safeData.general.length;

  return (
    <div className="space-y-6">
      {/* Header with total */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Välj förbättringar
        </h3>
        <p className="text-gray-700 mb-4">
          Granska och välj vilka förbättringar du vill implementera i ditt CV
        </p>
        <div className="flex items-center gap-2">
          <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {totalSelected}
          </div>
          <div className="text-gray-600">
            av {totalAvailable} förbättringar valda
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => {
          if (category.count === 0) return null;

          const isExpanded = expandedCategories.has(category.id);
          const allSelected = category.selectedCount === category.count;

          return (
            <Card key={category.id} className="overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {category.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {category.selectedCount} av {category.count} valda
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {category.count > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (allSelected) {
                          deselectAllInCategory(category.id);
                        } else {
                          selectAllInCategory(category.id);
                        }
                      }}
                      className="text-xs"
                    >
                      {allSelected ? (
                        <>
                          <Square className="w-3 h-3 mr-1" />
                          Avmarkera alla
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-3 h-3 mr-1" />
                          Välj alla
                        </>
                      )}
                    </Button>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-6 space-y-3"
                >
                  {category.id === 'profile' && profileSummary && (
                    <ProfileSummaryCard
                      currentText={profileSummary.currentText}
                      improvedText={profileSummary.improvedText}
                      changes={profileSummary.changes}
                      atsImpact={profileSummary.atsImpact}
                      selected={selectedProfile}
                      onToggle={onToggleProfile}
                    />
                  )}

                  {category.id === 'roles' && safeData.roles.map((role, index) => (
                    <div key={index} className="relative">
                      <input
                        type="checkbox"
                        checked={selectedRoles.has(index)}
                        onChange={() => onToggleRole(index)}
                        className="absolute top-4 left-4 z-10 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-8">
                        <SectionCard
                          sectionName={`${role.roleTitle} - ${role.company}`}
                          sectionType="work_experience"
                          period={role.period}
                          priority={role.priority as any}
                          currentText={role.currentText}
                          suggestedText={role.suggestedText}
                          improvements={role.improvements}
                          atsImpact={role.atsImpact}
                          onTextEdit={onRoleTextEdit ? (newText) => onRoleTextEdit(index, newText) : undefined}
                        />
                      </div>
                    </div>
                  ))}

                  {category.id === 'skills' && safeData.skills.map((skill, index) => (
                    <SkillSuggestionCard
                      key={index}
                      suggestion={skill}
                      selected={selectedSkills.has(index)}
                      onToggle={() => onToggleSkill(index)}
                    />
                  ))}

                  {category.id === 'general' && safeData.general.map((improvement, index) => (
                    <Card
                      key={index}
                      className={`p-4 transition-all ${
                        selectedGeneral.has(index)
                          ? 'border-2 border-green-600 bg-green-50/30'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedGeneral.has(index)}
                          onChange={() => onToggleGeneral(index)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">
                            {improvement.area}
                          </h5>
                          <p className="text-sm text-gray-700 mb-2">
                            {improvement.suggestion}
                          </p>
                          {improvement.example && (
                            <p className="text-xs text-gray-600 italic">
                              Exempel: {improvement.example}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Bottom Info */}
      {totalSelected === 0 && (
        <div className="text-center py-4 text-gray-600">
          Välj minst en förbättring för att fortsätta
        </div>
      )}
    </div>
  );
}
