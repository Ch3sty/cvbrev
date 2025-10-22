// src/components/cv/SkillTreeVisualization.tsx
'use client';

import React, { useMemo } from 'react';
import {
  Code, Database, Server, Globe, GitBranch, Layout,
  Terminal, Cloud, Lock, TestTube, Users, Package,
  CheckCircle2, Circle, ChevronRight, Zap, Star,
  FileText, Briefcase, Gavel, ShoppingCart, BookOpen,
  Award, TrendingUp, Building, HandshakeIcon, Calculator
} from 'lucide-react';

interface SkillNode {
  id: string;
  name: string;
  category: string;
  level: 'foundation' | 'intermediate' | 'advanced';
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  prerequisites?: string[];
  estimatedHours: number;
  description?: string;
  courses?: number;
  icon?: any;
  importance?: 'essential' | 'desirable';
}

interface SkillTreeVisualizationProps {
  skillGaps: any[];
  learningSuggestions?: any[];
  currentSkills?: string[];
  targetRole: string;
}

const SkillTreeVisualization: React.FC<SkillTreeVisualizationProps> = ({
  skillGaps,
  learningSuggestions = [],
  currentSkills = [],
  targetRole
}) => {

  // Choose icons based on skill category or name
  const getSkillIcon = (skillName: string, category?: string) => {
    const name = skillName.toLowerCase();

    // Upphandling/Procurement
    if (name.includes('upphandl') || name.includes('procure')) return Briefcase;
    if (name.includes('lou') || name.includes('luf') || name.includes('direktiv')) return Gavel;
    if (name.includes('avtal') || name.includes('kontrakt')) return FileText;
    if (name.includes('förhandl') || name.includes('negotiat')) return HandshakeIcon;
    if (name.includes('leverantör') || name.includes('supplier')) return Building;
    if (name.includes('sourcing') || name.includes('inköp')) return ShoppingCart;
    if (name.includes('analys') || name.includes('analysis')) return TrendingUp;
    if (name.includes('kalkyl') || name.includes('budget')) return Calculator;

    // Technical skills
    if (name.includes('program') || name.includes('kod')) return Code;
    if (name.includes('data') || name.includes('sql')) return Database;
    if (name.includes('server') || name.includes('backend')) return Server;
    if (name.includes('webb') || name.includes('frontend')) return Layout;
    if (name.includes('cloud') || name.includes('moln')) return Cloud;
    if (name.includes('test')) return TestTube;
    if (name.includes('git') || name.includes('version')) return GitBranch;
    if (name.includes('api')) return Globe;
    if (name.includes('devops') || name.includes('ci/cd')) return Terminal;
    if (name.includes('säker') || name.includes('security')) return Lock;

    // Generic
    if (name.includes('ledar') || name.includes('manage')) return Users;
    if (name.includes('projekt')) return Package;
    if (name.includes('certifi') || name.includes('diplom')) return Award;

    return BookOpen; // Default icon
  };

  // Categorize skills based on complexity and prerequisites
  const categorizeSkill = (skill: string, index: number, total: number): 'foundation' | 'intermediate' | 'advanced' => {
    const name = skill.toLowerCase();

    // Keywords for advanced skills
    const advancedKeywords = ['avancerad', 'expert', 'specialist', 'strategisk', 'ledning', 'chef'];
    if (advancedKeywords.some(k => name.includes(k))) return 'advanced';

    // Keywords for foundation skills
    const foundationKeywords = ['grund', 'introduktion', 'basis', 'översikt', 'förståelse'];
    if (foundationKeywords.some(k => name.includes(k))) return 'foundation';

    // Use position in list as fallback
    const position = index / total;
    if (position < 0.33) return 'foundation';
    if (position < 0.67) return 'intermediate';
    return 'advanced';
  };

  // Generate skill dependencies based on logical connections
  const generatePrerequisites = (skillName: string, allSkills: string[]): string[] => {
    const name = skillName.toLowerCase();
    const prerequisites: string[] = [];

    // Define dependency rules
    const dependencyRules = [
      { if: 'förhandlingsteknik', requires: 'avtalsrätt' },
      { if: 'leverantörsförhandling', requires: 'förhandlingsteknik' },
      { if: 'e-sourcing', requires: 'upphandlingsprocess' },
      { if: 'rfp', requires: 'kravställning' },
      { if: 'utvärdering', requires: 'upphandlingsprocess' },
      { if: 'avancerad', requires: 'grund' },
      { if: 'expert', requires: 'fördjup' },
      { if: 'strategisk', requires: 'operativ' },
    ];

    // Check each rule
    dependencyRules.forEach(rule => {
      if (name.includes(rule.if)) {
        const prereq = allSkills.find(s => s.toLowerCase().includes(rule.requires));
        if (prereq && prereq !== skillName) {
          prerequisites.push(prereq);
        }
      }
    });

    return prerequisites;
  };

  // Generate skill tree from actual data
  const skillTree = useMemo<SkillNode[]>(() => {
    const skills: SkillNode[] = [];
    const processedSkills = new Set<string>();

    // First, collect all unique skills from suggestions
    const allSkillNames: string[] = [];

    // Process from learningSuggestions if available
    if (learningSuggestions && learningSuggestions.length > 0) {
      learningSuggestions.forEach((gap: any) => {
        if (gap.skill && !processedSkills.has(gap.skill)) {
          processedSkills.add(gap.skill);
          allSkillNames.push(gap.skill);
        }
      });
    } else if (skillGaps && skillGaps.length > 0) {
      // Fallback to skillGaps
      skillGaps.forEach((gap: any) => {
        const skillName = typeof gap === 'string' ? gap : gap.skill || gap.name;
        if (skillName && !processedSkills.has(skillName)) {
          processedSkills.add(skillName);
          allSkillNames.push(skillName);
        }
      });
    }

    // Now create skill nodes
    allSkillNames.forEach((skillName, index) => {
      const gap = learningSuggestions?.find((g: any) => g.skill === skillName);
      const courseCount = gap?.suggestions?.length || Math.floor(Math.random() * 5) + 1;
      const estimatedHours = courseCount * 20; // Rough estimate

      const level = categorizeSkill(skillName, index, allSkillNames.length);
      const prerequisites = level !== 'foundation' ? generatePrerequisites(skillName, allSkillNames) : [];

      // Determine status based on current skills and prerequisites
      let status: 'locked' | 'available' | 'completed' = 'available';
      if (currentSkills.some(cs => cs.toLowerCase().includes(skillName.toLowerCase()))) {
        status = 'completed';
      } else if (prerequisites.length > 0) {
        // Check if all prerequisites are completed
        const allPrereqsMet = prerequisites.every(prereq =>
          currentSkills.some(cs => cs.toLowerCase().includes(prereq.toLowerCase()))
        );
        status = allPrereqsMet ? 'available' : 'locked';
      }

      skills.push({
        id: skillName.replace(/\s+/g, '-').toLowerCase(),
        name: skillName,
        category: gap?.importance === 'essential' ? 'Kritisk' : 'Rekommenderad',
        level,
        status,
        prerequisites: prerequisites.map(p => p.replace(/\s+/g, '-').toLowerCase()),
        estimatedHours,
        description: `Utveckla kompetens inom ${skillName.toLowerCase()}`,
        courses: courseCount,
        icon: getSkillIcon(skillName),
        importance: gap?.importance
      });
    });

    // If no skills were found, return placeholder
    if (skills.length === 0) {
      return [
        {
          id: 'no-gaps',
          name: 'Inga kompetensgap identifierade',
          category: 'Info',
          level: 'foundation',
          status: 'completed',
          estimatedHours: 0,
          description: 'Kör en analys för att se dina utvecklingsområden',
          courses: 0,
          icon: CheckCircle2
        }
      ];
    }

    return skills;
  }, [skillGaps, learningSuggestions, currentSkills]);

  // Group skills by level
  const skillsByLevel = useMemo(() => {
    return {
      foundation: skillTree.filter(s => s.level === 'foundation'),
      intermediate: skillTree.filter(s => s.level === 'intermediate'),
      advanced: skillTree.filter(s => s.level === 'advanced')
    };
  }, [skillTree]);

  // Calculate progress
  const progress = useMemo(() => {
    const completed = skillTree.filter(s => s.status === 'completed').length;
    const total = skillTree.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [skillTree]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <div className="w-5 h-5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />;
      case 'available':
        return <Circle className="w-5 h-5 text-blue-500" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-gray-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, importance?: string) => {
    const baseColors = {
      completed: 'border-green-500 bg-green-50',
      'in-progress': 'border-yellow-500 bg-yellow-50 animate-pulse',
      available: importance === 'essential'
        ? 'border-red-500 bg-red-50 hover:bg-red-100'
        : 'border-blue-500 bg-blue-50 hover:bg-blue-100',
      locked: 'border-gray-300 bg-gray-100 opacity-60'
    };

    return baseColors[status as keyof typeof baseColors] || 'border-gray-200 bg-gray-50';
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Progress */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              Kompetensträd - {targetRole}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Visualisering av din lärandebana med beroenden
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{progress}%</div>
            <div className="text-xs text-gray-600">Färdigställt</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Avklarad</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Tillgänglig</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-600">Låst</span>
          </div>
        </div>
      </div>

      {/* Skill Tree Levels */}
      <div className="space-y-6">
        {/* Foundation Level */}
        {skillsByLevel.foundation.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                Grundläggande kompetenser
              </h4>
              <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                Starta här
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {skillsByLevel.foundation.map(skill => {
                const Icon = skill.icon;
                return (
                  <div
                    key={skill.id}
                    className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${getStatusColor(skill.status, skill.importance)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="w-6 h-6 text-gray-600" />
                      {getStatusIcon(skill.status)}
                    </div>
                    <h5 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{skill.name}</h5>
                    <p className="text-xs text-gray-600 mb-2">{skill.category}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{skill.estimatedHours}h</span>
                      <span className="text-blue-600 font-medium">{skill.courses} kurser</span>
                    </div>
                    {skill.status === 'available' && skill.importance === 'essential' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Intermediate Level */}
        {skillsByLevel.intermediate.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Fördjupande kompetenser
              </h4>
              <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                Bygger på grundkunskaper
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillsByLevel.intermediate.map(skill => {
                const Icon = skill.icon;
                return (
                  <div
                    key={skill.id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${getStatusColor(skill.status, skill.importance)}`}
                  >
                    {/* Dependency indicator */}
                    {skill.prerequisites && skill.prerequisites.length > 0 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                          <ChevronRight className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600 font-medium">
                            Kräver: {skill.prerequisites.length}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2 mt-2">
                      <Icon className="w-6 h-6 text-gray-600" />
                      {getStatusIcon(skill.status)}
                    </div>
                    <h5 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{skill.name}</h5>
                    <p className="text-xs text-gray-600 mb-2">{skill.category}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{skill.estimatedHours}h</span>
                      <span className="text-indigo-600 font-medium">{skill.courses} kurser</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Advanced Level */}
        {skillsByLevel.advanced.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                Avancerade kompetenser
              </h4>
              <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                Expert-nivå
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillsByLevel.advanced.map(skill => {
                const Icon = skill.icon;
                return (
                  <div
                    key={skill.id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${getStatusColor(skill.status, skill.importance)}`}
                  >
                    {skill.prerequisites && skill.prerequisites.length > 0 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                          <ChevronRight className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600 font-medium">
                            Kräver: {skill.prerequisites.length}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2 mt-2">
                      <Icon className="w-6 h-6 text-gray-600" />
                      {getStatusIcon(skill.status)}
                    </div>
                    <h5 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{skill.name}</h5>
                    <p className="text-xs text-gray-600 mb-2">{skill.category}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{skill.estimatedHours}h</span>
                      <span className="text-purple-600 font-medium">{skill.courses} kurser</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Next Steps */}
      {skillTree.filter(s => s.status === 'available').length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 shadow-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Rekommenderat nästa steg
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {skillTree
              .filter(s => s.status === 'available')
              .sort((a, b) => {
                // Prioritize essential skills
                if (a.importance === 'essential' && b.importance !== 'essential') return -1;
                if (b.importance === 'essential' && a.importance !== 'essential') return 1;
                // Then by level
                const levelOrder = { foundation: 0, intermediate: 1, advanced: 2 };
                return levelOrder[a.level] - levelOrder[b.level];
              })
              .slice(0, 3)
              .map(skill => (
                <div key={skill.id} className="bg-white rounded-lg p-4 border border-gray-200/50 shadow-sm">
                  <h5 className="font-medium text-gray-900 text-sm mb-1">{skill.name}</h5>
                  <p className="text-xs text-gray-600 mb-2">{skill.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{skill.courses} kurser • {skill.estimatedHours}h</span>
                    <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                      Börja nu <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTreeVisualization;