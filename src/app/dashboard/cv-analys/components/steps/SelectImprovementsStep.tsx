'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  Award,
  Target,
  CheckSquare,
  Square,
  TrendingUp,
} from 'lucide-react';
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
  currentAtsScore?: number;
  dynamicPotentialScore?: number;
  onToggleProfile: () => void;
  onToggleRole: (index: number) => void;
  onToggleSkill: (index: number) => void;
  onToggleGeneral: (index: number) => void;
  onSelectAllRoles?: () => void;
  onDeselectAllRoles?: () => void;
  onSelectAllSkills?: () => void;
  onDeselectAllSkills?: () => void;
  onSelectAllGeneral?: () => void;
  onDeselectAllGeneral?: () => void;
  onRoleTextEdit?: (index: number, newText: string) => void;
  onProfileEdit?: (newText: string) => void;
}

type Category = 'profile' | 'roles' | 'skills' | 'general';

function useSafeData(props: SelectImprovementsStepProps) {
  return useMemo(() => {
    const safeRoles = Array.isArray(props.roleBasedImprovements)
      ? props.roleBasedImprovements.map((role, index) => ({
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
            atsOptimization: Boolean(role?.improvements?.atsOptimization),
          },
        }))
      : [];

    const safeSkills = Array.isArray(props.skillSuggestions) ? props.skillSuggestions : [];
    const safeGeneral = Array.isArray(props.generalImprovements) ? props.generalImprovements : [];

    return {
      roles: safeRoles,
      skills: safeSkills,
      general: safeGeneral,
      hasProfile: Boolean(props.profileSummary),
    };
  }, [
    props.roleBasedImprovements,
    props.skillSuggestions,
    props.generalImprovements,
    props.profileSummary,
  ]);
}

export default function SelectImprovementsStep(props: SelectImprovementsStepProps) {
  const {
    profileSummary,
    selectedProfile,
    selectedRoles,
    selectedSkills,
    currentAtsScore = 0,
    dynamicPotentialScore = 0,
    onToggleProfile,
    onToggleRole,
    onToggleSkill,
    onSelectAllRoles,
    onDeselectAllRoles,
    onSelectAllSkills,
    onDeselectAllSkills,
    onRoleTextEdit,
    onProfileEdit,
  } = props;

  const safeData = useSafeData(props);

  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(
    new Set(['profile', 'roles'])
  );

  const toggleCategory = (category: Category) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) newSet.delete(category);
    else newSet.add(category);
    setExpandedCategories(newSet);
  };

  const selectAllInCategory = (category: Category) => {
    if (category === 'profile') {
      if (!selectedProfile) onToggleProfile();
    } else if (category === 'roles' && onSelectAllRoles) {
      onSelectAllRoles();
    } else if (category === 'skills' && onSelectAllSkills) {
      onSelectAllSkills();
    }
  };

  const deselectAllInCategory = (category: Category) => {
    if (category === 'profile') {
      if (selectedProfile) onToggleProfile();
    } else if (category === 'roles' && onDeselectAllRoles) {
      onDeselectAllRoles();
    } else if (category === 'skills' && onDeselectAllSkills) {
      onDeselectAllSkills();
    }
  };

  const categories: Array<{
    id: Category;
    icon: typeof User;
    title: string;
    count: number;
    selectedCount: number;
  }> = [
    {
      id: 'profile',
      icon: User,
      title: 'Personbeskrivning',
      count: safeData.hasProfile ? 1 : 0,
      selectedCount: selectedProfile ? 1 : 0,
    },
    {
      id: 'roles',
      icon: Briefcase,
      title: 'Rollbaserade förbättringar',
      count: safeData.roles.length,
      selectedCount: selectedRoles.size,
    },
    {
      id: 'skills',
      icon: Award,
      title: 'Kompetenser & färdigheter',
      count: safeData.skills.length,
      selectedCount: selectedSkills.size,
    },
    {
      id: 'general',
      icon: Target,
      title: 'Automatiska förbättringar',
      count: safeData.general.length,
      selectedCount: safeData.general.length,
    },
  ];

  const totalSelected =
    (selectedProfile ? 1 : 0) + selectedRoles.size + selectedSkills.size;
  const totalAvailable =
    (safeData.hasProfile ? 1 : 0) + safeData.roles.length + safeData.skills.length;
  const atsIncrease = Math.round(dynamicPotentialScore - currentAtsScore);

  return (
    <div className="space-y-5">
      {/* Sticky potential-bar */}
      {currentAtsScore > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:sticky md:top-16 z-20"
        >
          <div
            className="rounded-2xl p-4 sm:p-5 text-white"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 28px -12px rgba(220, 38, 38, 0.45)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
                    Potential med dina val
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {totalSelected} av {totalAvailable} valda
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-2xl font-bold tabular-nums">
                    {currentAtsScore}
                  </span>
                  <span className="opacity-70">→</span>
                  <span className="text-xl sm:text-2xl font-bold tabular-nums">
                    {Math.round(dynamicPotentialScore)}
                  </span>
                </div>
                <div className="text-[11px] mt-0.5">
                  {atsIncrease > 0 ? (
                    <span className="font-semibold text-emerald-200">+{atsIncrease} poäng</span>
                  ) : (
                    <span className="opacity-80">Välj förbättringar</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Kategorier */}
      <div className="space-y-3">
        {categories.map((category) => {
          if (category.count === 0) return null;
          const isExpanded = expandedCategories.has(category.id);
          const allSelected =
            category.id !== 'general' && category.selectedCount === category.count;
          const isAuto = category.id === 'general';

          return (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-orange-200/50 overflow-hidden"
              style={{ boxShadow: '0 2px 8px -4px rgba(15, 23, 42, 0.06)' }}
            >
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-orange-50/30 transition-colors text-left min-h-[68px]"
              >
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
                  style={{
                    background: isAuto
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: isAuto
                      ? '0 4px 12px -3px rgba(16, 185, 129, 0.35)'
                      : '0 4px 12px -3px rgba(220, 38, 38, 0.35)',
                  }}
                >
                  <category.icon className="w-5 h-5" strokeWidth={2.25} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {category.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {isAuto ? (
                      <span className="text-emerald-700 font-semibold">
                        {category.count} tillämpas automatiskt
                      </span>
                    ) : (
                      <>
                        {category.selectedCount} av {category.count} valda
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {category.count > 1 && !isAuto && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (allSelected) deselectAllInCategory(category.id);
                        else selectAllInCategory(category.id);
                      }}
                      className="text-[11px] sm:text-xs font-semibold px-3 py-2 rounded-lg border border-orange-200 text-orange-700 bg-white hover:bg-orange-50 transition-colors min-h-[36px] hidden sm:inline-flex items-center gap-1.5"
                    >
                      {allSelected ? (
                        <>
                          <Square className="w-3 h-3" />
                          Avmarkera
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-3 h-3" />
                          Välj alla
                        </>
                      )}
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 space-y-3">
                      {/* Mobil select-all */}
                      {category.count > 1 && !isAuto && (
                        <button
                          type="button"
                          onClick={() => {
                            if (allSelected) deselectAllInCategory(category.id);
                            else selectAllInCategory(category.id);
                          }}
                          className="sm:hidden w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-orange-200 text-orange-700 bg-white hover:bg-orange-50 transition-colors min-h-[40px] inline-flex items-center justify-center gap-1.5"
                        >
                          {allSelected ? (
                            <>
                              <Square className="w-3.5 h-3.5" />
                              Avmarkera alla
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-3.5 h-3.5" />
                              Välj alla
                            </>
                          )}
                        </button>
                      )}

                      {category.id === 'profile' && profileSummary && (
                        <ProfileSummaryCard
                          currentText={profileSummary.currentText}
                          improvedText={profileSummary.improvedText}
                          changes={profileSummary.changes}
                          atsImpact={profileSummary.atsImpact}
                          selected={selectedProfile}
                          onToggle={onToggleProfile}
                          onEdit={onProfileEdit}
                        />
                      )}

                      {category.id === 'roles' &&
                        safeData.roles.map((role, index) => (
                          <div key={index} className="relative">
                            <input
                              type="checkbox"
                              checked={selectedRoles.has(index)}
                              onChange={() => onToggleRole(index)}
                              className="absolute top-4 left-4 z-10 w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
                            />
                            <div className="ml-9">
                              <SectionCard
                                sectionName={`${role.roleTitle} - ${role.company}`}
                                sectionType="work_experience"
                                period={role.period}
                                priority={role.priority as any}
                                currentText={role.currentText}
                                suggestedText={role.suggestedText}
                                improvements={role.improvements}
                                atsImpact={role.atsImpact}
                                onTextEdit={
                                  onRoleTextEdit
                                    ? (newText) => onRoleTextEdit(index, newText)
                                    : undefined
                                }
                              />
                            </div>
                          </div>
                        ))}

                      {category.id === 'skills' &&
                        safeData.skills.map((skill, index) => (
                          <SkillSuggestionCard
                            key={index}
                            suggestion={skill}
                            selected={selectedSkills.has(index)}
                            onToggle={() => onToggleSkill(index)}
                          />
                        ))}

                      {category.id === 'general' && (
                        <div
                          className="rounded-xl p-4"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                          }}
                        >
                          <p className="text-sm text-emerald-900 mb-3 font-medium">
                            Vi tillämpar dessa automatiskt när du går vidare. Du behöver inte göra något här.
                          </p>

                          <div className="space-y-2">
                            {safeData.general.map((improvement, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2.5 bg-white rounded-lg p-3 border border-emerald-100"
                              >
                                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                                     style={{
                                       background: 'linear-gradient(135deg, #10B981, #059669)',
                                     }}>
                                  <CheckSquare className="w-3 h-3 text-white" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h6 className="font-semibold text-slate-900 text-sm">
                                    {improvement.area || improvement.title || 'Förbättring'}
                                  </h6>
                                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                    {improvement.suggestion ||
                                      improvement.description ||
                                      'Ingen beskrivning tillgänglig'}
                                  </p>
                                  {(improvement.example || improvement.category) && (
                                    <p className="text-xs text-slate-500 italic mt-1">
                                      {improvement.example
                                        ? `Exempel: ${improvement.example}`
                                        : `Kategori: ${improvement.category}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {totalSelected === 0 && (
        <div className="text-center py-2">
          <p className="text-sm text-slate-600">
            Välj minst en förbättring för att fortsätta
          </p>
        </div>
      )}
    </div>
  );
}
