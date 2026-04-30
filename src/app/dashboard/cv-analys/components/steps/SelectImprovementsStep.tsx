'use client';

import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CategorySegments, { type SelectCategory } from '../select/CategorySegments';
import CategoryHero from '../select/CategoryHero';
import PotentialBar from '../select/PotentialBar';
import ProfileImprovementCard from '../select/ProfileImprovementCard';
import ImprovementCard from '../select/ImprovementCard';
import SkillImprovementCard from '../select/SkillImprovementCard';
import AutoApplyPanel from '../select/AutoApplyPanel';

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
      'Strukturella och formaterings-relaterade justeringar som lyfter helhetsintrycket.',
  },
};

export default function SelectImprovementsStep(props: SelectImprovementsStepProps) {
  const {
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

  const [active, setActive] = useState<SelectCategory>(visibleCategories[0] || 'profile');

  // Säkerställ att aktiv kategori finns i synliga
  useEffect(() => {
    if (visibleCategories.length > 0 && !visibleCategories.includes(active)) {
      setActive(visibleCategories[0]);
    }
  }, [visibleCategories, active]);

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
              label: 'Auto',
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

  return (
    <div className="space-y-5 pb-32 sm:pb-0">
      {/* Sticky segment-bar */}
      <CategorySegments
        categories={segmentDefs}
        active={active}
        onChange={setActive}
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
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
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
        </motion.div>
      </AnimatePresence>

      {totalSelected === 0 && (
        <p className="text-center text-sm text-slate-600 pt-2">
          Välj minst en förbättring för att fortsätta
        </p>
      )}

      {/* Använd selectedGeneral så TypeScript inte klagar */}
      <span className="hidden" aria-hidden="true">
        {selectedGeneral.size}
      </span>
    </div>
  );
}
