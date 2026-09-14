'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

import CategorySegments, { type SelectCategory } from '../select/CategorySegments';
import {
  categoryProgressText,
  isLastCategory,
  nextCategoryLabel,
  type CategoryFlowStep,
} from '../select/categoryFlow';
import CategoryHero from '../select/CategoryHero';
import PotentialBar from '../select/PotentialBar';
import ProfileImprovementCard from '../select/ProfileImprovementCard';
import ImprovementCard from '../select/ImprovementCard';
import SkillImprovementCard from '../select/SkillImprovementCard';
import AutoApplyPanel from '../select/AutoApplyPanel';
import AnalysisLockedFindings from '@/components/cv/AnalysisLockedFindings';
import type { LockedFinding } from '@/lib/cv/gateAnalysisResult';

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
  /**
   * A9: sätts av servern för konton utan premium. Innehåller antalet fynd
   * totalt och de låsta raderna (kategori och severity, ingen text).
   */
  gated?: { findingsTotal: number; lockedFindings: LockedFinding[] };
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
  /** Callback när en kategori visas (för att markera som besökt i parent) */
  onCategoryVisited?: (id: SelectCategory) => void;
  /** Callback när listan av synliga kategorier ändras */
  onVisibleCategoriesChange?: (categories: SelectCategory[]) => void;
  /**
   * Aktiv kategori. Wizarden äger den så att foten kan stega igenom flikarna
   * i stället för att stå spärrad tills alla är besökta.
   */
  activeCategory?: SelectCategory;
  onActiveCategoryChange?: (id: SelectCategory) => void;
  /** Kategorier användaren redan tittat på. Ritas som bock i fliken. */
  visitedCategories?: Set<string>;
  /** Kategorierna med antal förslag, så wizarden kan sätta fotens etikett. */
  onCategoryStepsChange?: (steps: CategoryFlowStep[]) => void;
  /** Går vidare till nästa kategori, eller till nästa steg om man står sist. */
  onAdvance?: () => void;
}

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

const CATEGORY_META: Record<
  SelectCategory,
  { title: string; description: string }
> = {
  profile: {
    title: 'Vi har omformulerat din inledning',
    description:
      'Personbeskrivningen är det första rekryteraren läser. Vi har skärpt formuleringen för bättre ATS-poäng och starkare första intryck.',
  },
  roles: {
    title: 'Vi har förbättrat dina rollbeskrivningar',
    description:
      'Vi har skärpt formuleringar, lagt till nyckelord och kvantifierat resultat. Välj vilka du vill tillämpa.',
  },
  skills: {
    title: 'Vi föreslår nya färdigheter',
    description:
      'Vi har hittat färdigheter som rekryterare letar efter och som passar din erfarenhet. Välj vilka som ska läggas till.',
  },
  auto: {
    title: 'Allmänna förbättringar',
    description:
      'Ändringar vi alltid gör: stavning, format och struktur. Strukturella och formaterings-relaterade justeringar som lyfter helhetsintrycket.',
  },
};

export default function SelectImprovementsStep(props: SelectImprovementsStepProps) {
  const {
    gated,
    profileSummary,
    selectedProfile,
    selectedRoles,
    selectedSkills,
    selectedGeneral,
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
    onCategoryVisited,
    onVisibleCategoriesChange,
    activeCategory,
    onActiveCategoryChange,
    visitedCategories,
    onCategoryStepsChange,
    onAdvance,
  } = props;

  const safeData = useSafeData(props);

  // Bestäm vilka kategorier som faktiskt ska visas
  const visibleCategories = useMemo(() => {
    const cats: SelectCategory[] = [];
    if (safeData.hasProfile) cats.push('profile');
    if (safeData.roles.length > 0) cats.push('roles');
    if (safeData.skills.length > 0) cats.push('skills');
    if (safeData.general.length > 0) cats.push('auto');
    return cats;
  }, [safeData]);

  /* Wizarden äger normalt aktiv kategori (foten stegar igenom flikarna).
     Den lokala staten är bara fallback när komponenten används utan styrning. */
  const [localActive, setLocalActive] = useState<SelectCategory>(
    visibleCategories[0] || 'profile'
  );
  const active = activeCategory ?? localActive;
  const setActive = useCallback(
    (id: SelectCategory) => {
      setLocalActive(id);
      onActiveCategoryChange?.(id);
    },
    [onActiveCategoryChange]
  );

  // Säkerställ att aktiv kategori finns i synliga
  useEffect(() => {
    if (visibleCategories.length > 0 && !visibleCategories.includes(active)) {
      setActive(visibleCategories[0]);
    }
  }, [visibleCategories, active, setActive]);

  // Notifiera parent när listan av synliga kategorier ändras
  useEffect(() => {
    onVisibleCategoriesChange?.(visibleCategories);
  }, [visibleCategories, onVisibleCategoriesChange]);

  // Notifiera parent när en kategori visas (markera som besökt)
  useEffect(() => {
    onCategoryVisited?.(active);
  }, [active, onCategoryVisited]);

  const totalSelected =
    (selectedProfile ? 1 : 0) + selectedRoles.size + selectedSkills.size;
  const totalAvailable =
    (safeData.hasProfile ? 1 : 0) + safeData.roles.length + safeData.skills.length;

  const segmentDefs = useMemo(
    () => [
      ...(safeData.hasProfile
        ? [
            {
              id: 'profile' as SelectCategory,
              label: 'Profil',
              selectedCount: selectedProfile ? 1 : 0,
              totalCount: 1,
            },
          ]
        : []),
      ...(safeData.roles.length > 0
        ? [
            {
              id: 'roles' as SelectCategory,
              label: 'Roller',
              selectedCount: selectedRoles.size,
              totalCount: safeData.roles.length,
            },
          ]
        : []),
      ...(safeData.skills.length > 0
        ? [
            {
              id: 'skills' as SelectCategory,
              label: 'Skills',
              selectedCount: selectedSkills.size,
              totalCount: safeData.skills.length,
            },
          ]
        : []),
      ...(safeData.general.length > 0
        ? [
            {
              id: 'auto' as SelectCategory,
              label: 'Automatiskt',
              selectedCount: safeData.general.length,
              totalCount: safeData.general.length,
              isAuto: true,
            },
          ]
        : []),
    ],
    [
      safeData,
      selectedProfile,
      selectedRoles.size,
      selectedSkills.size,
    ]
  );

  /* Kategorierna med antal förslag. Wizarden bygger fotens etikett på den här
     listan, så knappen alltid pekar mot nästa flik. */
  const categorySteps = useMemo<CategoryFlowStep[]>(
    () =>
      segmentDefs.map((def) => ({
        id: def.id,
        count: def.totalCount,
      })),
    [segmentDefs]
  );

  useEffect(() => {
    onCategoryStepsChange?.(categorySteps);
  }, [categorySteps, onCategoryStepsChange]);

  const advanceLabel = nextCategoryLabel(categorySteps, active);
  const onLastCategory = isLastCategory(categorySteps, active);

  return (
    <div className="space-y-5">
      {/* Sticky segment-bar */}
      <CategorySegments
        categories={segmentDefs}
        active={active}
        onChange={setActive}
        visited={visitedCategories}
        progressText={categoryProgressText(
          categorySteps,
          active,
          totalSelected,
          totalAvailable
        )}
      />

      {/* Potential-bar */}
      {currentAtsScore > 0 && (
        <PotentialBar
          currentAtsScore={currentAtsScore}
          dynamicPotentialScore={dynamicPotentialScore}
          totalSelected={totalSelected}
          totalAvailable={totalAvailable}
        />
      )}

      {/* Aktiv kategori */}
      <div className="space-y-4">
          {/* Profil */}
          {active === 'profile' && profileSummary && (
            <>
              <CategoryHero
                category="profile"
                title={CATEGORY_META.profile.title}
                description={CATEGORY_META.profile.description}
                selectedCount={selectedProfile ? 1 : 0}
                totalCount={1}
              />
              <ProfileImprovementCard
                currentText={profileSummary.currentText}
                improvedText={profileSummary.improvedText}
                changes={profileSummary.changes}
                atsImpact={profileSummary.atsImpact}
                selected={selectedProfile}
                onToggle={onToggleProfile}
                onEdit={onProfileEdit}
              />
            </>
          )}

          {/* Roller */}
          {active === 'roles' && (
            <>
              <CategoryHero
                category="roles"
                title={CATEGORY_META.roles.title}
                description={CATEGORY_META.roles.description}
                selectedCount={selectedRoles.size}
                totalCount={safeData.roles.length}
                onSelectAll={onSelectAllRoles}
                onDeselectAll={onDeselectAllRoles}
              />
              <div className="space-y-3">
                {safeData.roles.map((role, index) => (
                  <ImprovementCard
                    key={index}
                    title={`${role.roleTitle} - ${role.company}`}
                    period={role.period}
                    priority={role.priority as any}
                    currentText={role.currentText}
                    suggestedText={role.suggestedText}
                    improvements={role.improvements}
                    atsImpact={role.atsImpact}
                    selected={selectedRoles.has(index)}
                    onToggle={() => onToggleRole(index)}
                    onTextEdit={
                      onRoleTextEdit
                        ? (newText) => onRoleTextEdit(index, newText)
                        : undefined
                    }
                  />
                ))}
              </div>
            </>
          )}

          {/* Skills */}
          {active === 'skills' && (
            <>
              <CategoryHero
                category="skills"
                title={CATEGORY_META.skills.title}
                description={CATEGORY_META.skills.description}
                selectedCount={selectedSkills.size}
                totalCount={safeData.skills.length}
                onSelectAll={onSelectAllSkills}
                onDeselectAll={onDeselectAllSkills}
              />
              <div className="space-y-2.5">
                {safeData.skills.map((skill, index) => (
                  <SkillImprovementCard
                    key={index}
                    suggestion={skill}
                    selected={selectedSkills.has(index)}
                    onToggle={() => onToggleSkill(index)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Auto */}
          {active === 'auto' && (
            <>
              <CategoryHero
                category="auto"
                title={CATEGORY_META.auto.title}
                description={CATEGORY_META.auto.description}
                selectedCount={safeData.general.length}
                totalCount={safeData.general.length}
                autoMode
              />
              <AutoApplyPanel improvements={safeData.general} />
            </>
          )}
      </div>

      {/* A9: de fynd gratisnivån inte ser. Texten finns inte på klienten. */}
      {gated && gated.lockedFindings.length > 0 && (
        <AnalysisLockedFindings
          findings={gated.lockedFindings}
          findingsTotal={gated.findingsTotal}
          className="pt-2"
        />
      )}

      {/* Samma handling som i foten, men där ögat är efter en lång lista.
          På sista kategorin räcker foten. */}
      {!onLastCategory && onAdvance && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onAdvance}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken sm:w-auto sm:min-w-[200px]"
          >
            {advanceLabel}
          </button>
        </div>
      )}

      {/* Använd selectedGeneral så TypeScript inte klagar */}
      <span className="hidden" aria-hidden="true">
        {selectedGeneral.size}
      </span>
    </div>
  );
}
