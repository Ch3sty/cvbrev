// src/components/cv/SkillTreeVisualization.tsx
'use client';

import React, { useMemo } from 'react';
import {
  Code, Database, Server, Globe, GitBranch, Layout,
  Terminal, Cloud, Lock, TestTube, Users, Package,
  CheckCircle2, Circle, ChevronRight, Zap, Star
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
}

interface SkillTreeVisualizationProps {
  skillGaps: any[];
  currentSkills?: string[];
  targetRole: string;
}

const SkillTreeVisualization: React.FC<SkillTreeVisualizationProps> = ({
  skillGaps,
  currentSkills = [],
  targetRole
}) => {
  // Define skill tree structure for Systemvetare role
  const skillTree = useMemo<SkillNode[]>(() => {
    const baseSkills: SkillNode[] = [
      // Foundation Level
      {
        id: 'html-css',
        name: 'HTML & CSS',
        category: 'Frontend',
        level: 'foundation',
        status: currentSkills.includes('HTML/CSS') ? 'completed' : 'available',
        estimatedHours: 40,
        description: 'Grundläggande webbstruktur och styling',
        courses: 5,
        icon: Layout
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        category: 'Frontend',
        level: 'foundation',
        status: 'available',
        prerequisites: ['html-css'],
        estimatedHours: 80,
        description: 'Programmering för webben',
        courses: 8,
        icon: Code
      },
      {
        id: 'git',
        name: 'Git & Versionshantering',
        category: 'Verktyg',
        level: 'foundation',
        status: 'available',
        estimatedHours: 20,
        description: 'Kodversionshantering och samarbete',
        courses: 3,
        icon: GitBranch
      },
      {
        id: 'sql-basics',
        name: 'SQL Grunder',
        category: 'Databas',
        level: 'foundation',
        status: 'available',
        estimatedHours: 40,
        description: 'Databasförfrågningar och grundläggande design',
        courses: 4,
        icon: Database
      },

      // Intermediate Level
      {
        id: 'react',
        name: 'React',
        category: 'Frontend',
        level: 'intermediate',
        status: 'locked',
        prerequisites: ['javascript'],
        estimatedHours: 60,
        description: 'Modern komponentbaserad utveckling',
        courses: 6,
        icon: Package
      },
      {
        id: 'nodejs',
        name: 'Node.js',
        category: 'Backend',
        level: 'intermediate',
        status: 'locked',
        prerequisites: ['javascript'],
        estimatedHours: 60,
        description: 'Server-side JavaScript',
        courses: 5,
        icon: Server
      },
      {
        id: 'api-design',
        name: 'API Design',
        category: 'Backend',
        level: 'intermediate',
        status: 'locked',
        prerequisites: ['nodejs', 'sql-basics'],
        estimatedHours: 40,
        description: 'RESTful APIs och GraphQL',
        courses: 4,
        icon: Globe
      },
      {
        id: 'testing',
        name: 'Testing & TDD',
        category: 'Kvalitet',
        level: 'intermediate',
        status: 'locked',
        prerequisites: ['javascript'],
        estimatedHours: 40,
        description: 'Enhetstester och testdriven utveckling',
        courses: 3,
        icon: TestTube
      },
      {
        id: 'agile',
        name: 'Agile & Scrum',
        category: 'Metodik',
        level: 'intermediate',
        status: 'available',
        estimatedHours: 20,
        description: 'Agila arbetsmetoder',
        courses: 2,
        icon: Users
      },

      // Advanced Level
      {
        id: 'cloud',
        name: 'Cloud Services',
        category: 'Infrastruktur',
        level: 'advanced',
        status: 'locked',
        prerequisites: ['nodejs', 'api-design'],
        estimatedHours: 60,
        description: 'AWS, Azure eller Google Cloud',
        courses: 5,
        icon: Cloud
      },
      {
        id: 'devops',
        name: 'DevOps & CI/CD',
        category: 'Infrastruktur',
        level: 'advanced',
        status: 'locked',
        prerequisites: ['git', 'testing', 'cloud'],
        estimatedHours: 50,
        description: 'Automatisering och deployment',
        courses: 4,
        icon: Terminal
      },
      {
        id: 'security',
        name: 'Säkerhet',
        category: 'Kvalitet',
        level: 'advanced',
        status: 'locked',
        prerequisites: ['api-design', 'cloud'],
        estimatedHours: 40,
        description: 'Säker utveckling och OWASP',
        courses: 3,
        icon: Lock
      }
    ];

    // Update status based on prerequisites
    return baseSkills.map(skill => {
      if (skill.prerequisites) {
        const allPrereqsMet = skill.prerequisites.every(prereq => {
          const prereqSkill = baseSkills.find(s => s.id === prereq);
          return prereqSkill?.status === 'completed' || currentSkills.includes(prereqSkill?.name || '');
        });

        if (!allPrereqsMet && skill.status === 'available') {
          skill.status = 'locked';
        } else if (allPrereqsMet && skill.status === 'locked') {
          skill.status = 'available';
        }
      }
      return skill;
    });
  }, [currentSkills]);

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
    return Math.round((completed / total) * 100);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'in-progress':
        return 'border-yellow-500 bg-yellow-500/10 animate-pulse';
      case 'available':
        return 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20';
      case 'locked':
        return 'border-gray-600 bg-gray-800/50 opacity-60';
      default:
        return 'border-gray-700 bg-navy-900/50';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Progress */}
      <div className="bg-navy-800 rounded-xl p-6 border border-navy-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              Kompetensträd - {targetRole}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Visualisering av din lärandebana med beroenden
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{progress}%</div>
            <div className="text-xs text-gray-400">Färdigställt</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-navy-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-gray-400">Avklarad</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-blue-500" />
            <span className="text-gray-400">Tillgänglig</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-400">Låst</span>
          </div>
        </div>
      </div>

      {/* Skill Tree Levels */}
      <div className="space-y-6">
        {/* Foundation Level */}
        <div className="bg-navy-800 rounded-xl p-6 border border-navy-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              Grundläggande färdigheter
            </h4>
            <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
              Starta här
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skillsByLevel.foundation.map(skill => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.id}
                  className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${getStatusColor(skill.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Icon className="w-6 h-6 text-gray-400" />
                    {getStatusIcon(skill.status)}
                  </div>
                  <h5 className="font-medium text-white text-sm mb-1">{skill.name}</h5>
                  <p className="text-xs text-gray-400 mb-2">{skill.category}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{skill.estimatedHours}h</span>
                    <span className="text-blue-400">{skill.courses} kurser</span>
                  </div>
                  {skill.status === 'available' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Intermediate Level */}
        <div className="bg-navy-800 rounded-xl p-6 border border-navy-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Fördjupande färdigheter
            </h4>
            <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">
              Kräver grundkunskaper
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skillsByLevel.intermediate.map(skill => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${getStatusColor(skill.status)}`}
                >
                  {/* Dependency Lines */}
                  {skill.prerequisites && skill.prerequisites.length > 0 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-navy-900 rounded-full border border-navy-700">
                        <ChevronRight className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">
                          Kräver: {skill.prerequisites.length}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-2 mt-2">
                    <Icon className="w-6 h-6 text-gray-400" />
                    {getStatusIcon(skill.status)}
                  </div>
                  <h5 className="font-medium text-white text-sm mb-1">{skill.name}</h5>
                  <p className="text-xs text-gray-400 mb-2">{skill.category}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{skill.estimatedHours}h</span>
                    <span className="text-purple-400">{skill.courses} kurser</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Level */}
        <div className="bg-navy-800 rounded-xl p-6 border border-navy-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-pink-400" />
              Avancerade färdigheter
            </h4>
            <span className="text-xs px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full">
              Expert-nivå
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skillsByLevel.advanced.map(skill => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${getStatusColor(skill.status)}`}
                >
                  {skill.prerequisites && skill.prerequisites.length > 0 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-navy-900 rounded-full border border-navy-700">
                        <ChevronRight className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">
                          Kräver: {skill.prerequisites.length}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-2 mt-2">
                    <Icon className="w-6 h-6 text-gray-400" />
                    {getStatusIcon(skill.status)}
                  </div>
                  <h5 className="font-medium text-white text-sm mb-1">{skill.name}</h5>
                  <p className="text-xs text-gray-400 mb-2">{skill.category}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{skill.estimatedHours}h</span>
                    <span className="text-pink-400">{skill.courses} kurser</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Rekommenderat nästa steg
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {skillTree
            .filter(s => s.status === 'available')
            .slice(0, 3)
            .map(skill => (
              <div key={skill.id} className="bg-navy-800 rounded-lg p-4">
                <h5 className="font-medium text-white text-sm mb-1">{skill.name}</h5>
                <p className="text-xs text-gray-400 mb-2">{skill.description}</p>
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Börja nu <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SkillTreeVisualization;