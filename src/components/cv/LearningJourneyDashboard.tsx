// src/components/cv/LearningJourneyDashboard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Target, TrendingUp, Clock, DollarSign, Award, BookOpen,
  ChevronRight, Sparkles, Zap, Map, Filter, BarChart3,
  Calendar, Users, Trophy, Brain, Rocket, CheckCircle2
} from 'lucide-react';

interface LearningSuggestion {
  skill: string;
  importance: 'essential' | 'desirable';
  reasoning: string;
  suggestions: Course[];
}

interface Course {
  type: 'course' | 'certification' | 'degree';
  title: string;
  provider: string;
  direct_url?: string;
  duration?: string;
  cost?: string;
  description?: string;
  skillsCovered?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  format?: string;
}

interface LearningJourneyDashboardProps {
  matchScore: number;
  skillGaps: any[];
  learningSuggestions: any[];
  targetRole: string;
}

type LearningPath = 'quick' | 'balanced' | 'comprehensive';
type TimeCommitment = '5h' | '10h' | '20h';

const LearningJourneyDashboard: React.FC<LearningJourneyDashboardProps> = ({
  matchScore,
  skillGaps,
  learningSuggestions,
  targetRole
}) => {
  const [selectedPath, setSelectedPath] = useState<LearningPath>('balanced');
  const [timeCommitment, setTimeCommitment] = useState<TimeCommitment>('10h');
  const [budgetLimit, setBudgetLimit] = useState<number>(5000);
  const [showOnlyFree, setShowOnlyFree] = useState(false);

  // Group skills into learning phases
  const learningPhases = useMemo(() => {
    const essential = learningSuggestions.filter(s => s.importance === 'essential');
    const desirable = learningSuggestions.filter(s => s.importance === 'desirable');

    return {
      foundation: {
        title: 'Grundläggande färdigheter',
        description: 'Börja här för att bygga en stark bas',
        skills: essential.slice(0, Math.ceil(essential.length / 3)),
        duration: '1-3 månader',
        icon: BookOpen,
        color: 'from-blue-500 to-blue-600'
      },
      intermediate: {
        title: 'Fördjupning',
        description: 'Bygg vidare på dina grundkunskaper',
        skills: essential.slice(Math.ceil(essential.length / 3), Math.ceil(essential.length * 2 / 3)),
        duration: '3-6 månader',
        icon: TrendingUp,
        color: 'from-purple-500 to-purple-600'
      },
      advanced: {
        title: 'Specialisering',
        description: 'Bli expert inom ditt område',
        skills: [...essential.slice(Math.ceil(essential.length * 2 / 3)), ...desirable],
        duration: '6-9 månader',
        icon: Trophy,
        color: 'from-pink-500 to-pink-600'
      }
    };
  }, [learningSuggestions]);

  // Calculate optimized course recommendations
  const optimizedCourses = useMemo(() => {
    const allCourses: Course[] = [];
    const courseSkillMap: { [key: string]: string[] } = {};

    learningSuggestions.forEach((gap: any) => {
      gap.suggestions?.forEach((course: any) => {
        const courseKey = course.title + course.provider;
        if (!courseSkillMap[courseKey]) {
          courseSkillMap[courseKey] = [];
          allCourses.push(course);
        }
        if (!courseSkillMap[courseKey].includes(gap.skill)) {
          courseSkillMap[courseKey].push(gap.skill);
        }
      });
    });

    // Enrich courses with skills covered count
    return allCourses.map(course => ({
      ...course,
      skillsCovered: courseSkillMap[course.title + course.provider] || [],
      efficiency: courseSkillMap[course.title + course.provider]?.length || 1
    })).sort((a, b) => b.efficiency - a.efficiency);
  }, [learningSuggestions]);

  // Calculate time to goal
  const estimatedTimeToGoal = useMemo(() => {
    const hoursPerWeek = parseInt(timeCommitment);
    const totalGaps = skillGaps.length;
    const weeksPerGap = selectedPath === 'quick' ? 2 : selectedPath === 'balanced' ? 3 : 4;
    const totalWeeks = totalGaps * weeksPerGap * (10 / hoursPerWeek);
    const months = Math.ceil(totalWeeks / 4.3);
    return months;
  }, [timeCommitment, skillGaps.length, selectedPath]);

  // Path configurations
  const pathConfigs = {
    quick: {
      title: 'Snabbspår',
      description: 'Fokusera på essentiella färdigheter',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      time: `${Math.ceil(estimatedTimeToGoal * 0.7)} månader`,
      focus: 'Minimalt viable kompetens'
    },
    balanced: {
      title: 'Balanserad',
      description: 'Grundlig utbildning med god balans',
      icon: BarChart3,
      color: 'from-blue-500 to-purple-500',
      time: `${estimatedTimeToGoal} månader`,
      focus: 'Komplett kompetensprofil'
    },
    comprehensive: {
      title: 'Omfattande',
      description: 'Djupgående expertkunskap',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      time: `${Math.ceil(estimatedTimeToGoal * 1.3)} månader`,
      focus: 'Expert-niveau'
    }
  };

  const currentPath = pathConfigs[selectedPath];

  return (
    <div className="w-full space-y-6">
      {/* Hero Section - Your Learning Journey */}
      <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl p-8 border border-navy-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Map className="w-8 h-8 text-blue-400" />
                Din läranderesa mot {targetRole}
              </h2>
              <p className="text-gray-300">
                En personlig utvecklingsplan baserad på din nuvarande kompetens
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{matchScore}%</div>
              <div className="text-sm text-gray-400">Nuvarande matchning</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-navy-900/50 rounded-lg p-4">
              <Target className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white">{skillGaps.length}</div>
              <div className="text-xs text-gray-400">Kompetensgap</div>
            </div>
            <div className="bg-navy-900/50 rounded-lg p-4">
              <BookOpen className="w-5 h-5 text-purple-400 mb-2" />
              <div className="text-2xl font-bold text-white">{optimizedCourses.length}</div>
              <div className="text-xs text-gray-400">Kurser tillgängliga</div>
            </div>
            <div className="bg-navy-900/50 rounded-lg p-4">
              <Clock className="w-5 h-5 text-green-400 mb-2" />
              <div className="text-2xl font-bold text-white">~{estimatedTimeToGoal}</div>
              <div className="text-xs text-gray-400">Månader till mål</div>
            </div>
            <div className="bg-navy-900/50 rounded-lg p-4">
              <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-white">85%</div>
              <div className="text-xs text-gray-400">Målmatchning</div>
            </div>
          </div>

          {/* Motivational Progress Bar */}
          <div className="bg-navy-900/50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Din resa</span>
              <span className="text-white font-medium">Mål: Junior {targetRole}</span>
            </div>
            <div className="relative h-3 bg-navy-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${matchScore}%` }}
              />
              <div className="absolute inset-y-0 left-0 w-full flex items-center justify-between px-2">
                <div className="text-[10px] text-white font-bold">{matchScore}%</div>
                <div className="text-[10px] text-gray-400">85%</div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Start</span>
              <span>50% - Praktikplats möjlig</span>
              <span>85% - Anställningsbar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path Selector */}
      <div className="bg-navy-800 rounded-xl p-6 border border-navy-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-pink-400" />
          Välj din lärandestrategi
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(pathConfigs).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedPath(key as LearningPath)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPath === key
                    ? 'border-pink-500 bg-navy-700'
                    : 'border-navy-600 bg-navy-900/50 hover:border-navy-500'
                }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} inline-block mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1">{config.title}</h4>
                <p className="text-xs text-gray-400 mb-2">{config.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-400">{config.time}</span>
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Time Commitment Selector */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tid per vecka
            </label>
            <div className="flex gap-2">
              {(['5h', '10h', '20h'] as TimeCommitment[]).map(time => (
                <button
                  key={time}
                  onClick={() => setTimeCommitment(time)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeCommitment === time
                      ? 'bg-blue-500 text-white'
                      : 'bg-navy-900 text-gray-400 hover:bg-navy-700'
                  }`}
                >
                  {time}/vecka
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Budget per månad
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-medium min-w-[80px]">
                {budgetLimit === 0 ? 'Gratis' : `${budgetLimit} kr`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Phases */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Din utvecklingsplan - {currentPath.title}
        </h3>

        {Object.entries(learningPhases).map(([key, phase], index) => {
          const Icon = phase.icon;
          const isAccessible = index === 0 || matchScore >= (index * 30);

          return (
            <div
              key={key}
              className={`bg-navy-800 rounded-xl border ${
                isAccessible ? 'border-navy-700' : 'border-navy-700/50 opacity-60'
              } overflow-hidden transition-all hover:border-navy-600`}
            >
              <div className={`h-2 bg-gradient-to-r ${phase.color}`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${phase.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        Fas {index + 1}: {phase.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-2">{phase.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {phase.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {phase.skills.length} kompetenser
                        </span>
                        {!isAccessible && (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Låses upp vid {index * 30}% matchning
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAccessible && index === 0 && (
                    <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all">
                      Börja här →
                    </button>
                  )}
                </div>

                {/* Skills in this phase */}
                {isAccessible && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {phase.skills.slice(0, 4).map((skill, idx) => (
                      <div
                        key={idx}
                        className="bg-navy-900/50 rounded-lg p-3 flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-gray-500" />
                          {skill.skill}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          skill.importance === 'essential'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {skill.suggestions.length} kurser
                        </span>
                      </div>
                    ))}
                    {phase.skills.length > 4 && (
                      <div className="bg-navy-900/50 rounded-lg p-3 flex items-center justify-center text-sm text-gray-400">
                        +{phase.skills.length - 4} till...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Course Recommendations */}
      <div className="bg-navy-800 rounded-xl p-6 border border-navy-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Smarta kursrekommendationer
        </h3>

        <div className="bg-navy-900/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-300">
            <span className="text-green-400 font-semibold">💡 Tips:</span> Dessa kurser täcker flera kompetensområden
            samtidigt och ger dig mest valuta för pengarna!
          </p>
        </div>

        <div className="grid gap-3">
          {optimizedCourses.slice(0, 3).map((course, index) => (
            <div
              key={index}
              className="bg-navy-900/50 rounded-lg p-4 hover:bg-navy-900 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      {course.efficiency}x
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{course.title}</h4>
                      <p className="text-sm text-gray-400 mb-2">{course.provider}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {course.skillsCovered?.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-navy-800 text-blue-300 rounded"
                          >
                            {String(skill)}
                          </span>
                        ))}
                        {course.skillsCovered && course.skillsCovered.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-navy-800 text-gray-400 rounded">
                            +{course.skillsCovered.length - 3} till
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {course.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        )}
                        {course.cost && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {course.cost}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {course.direct_url && (
                  <a
                    href={course.direct_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Visa kurs →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">
                🎯 Optimal väg identifierad!
              </p>
              <p className="text-xs text-gray-400">
                Med dessa {optimizedCourses.slice(0, 3).length} kurser täcker du {
                  optimizedCourses.slice(0, 3).flatMap(c => c.skillsCovered || [])
                    .filter((skill, index, self) => self.indexOf(skill) === index).length
                } kompetensområden
              </p>
            </div>
            <Users className="w-8 h-8 text-pink-400" />
          </div>
        </div>
      </div>

      {/* Next Steps Call-to-Action */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Redo att börja din resa?</h3>
            <p className="text-white/90 text-sm">
              Baserat på din valda strategi ({currentPath.title}) och {timeCommitment} per vecka,
              kan du nå ditt mål om cirka {estimatedTimeToGoal} månader!
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Skapa min lärandeplan →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningJourneyDashboard;