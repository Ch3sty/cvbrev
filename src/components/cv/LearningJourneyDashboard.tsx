// src/components/cv/LearningJourneyDashboard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Target, Clock, BookOpen,
  Map, Trophy,
  Calendar, Brain, Info
} from 'lucide-react';
import LearningPlanCreator from './LearningPlanCreator';
import { determineStrategy, getStrategyConfig, prioritizeCourses } from '@/lib/learning/course-prioritization';
import type { Course } from '@/lib/learning/course-prioritization';

interface LearningSuggestion {
  skill: string;
  importance: 'essential' | 'desirable';
  reasoning: string;
  suggestions: Course[];
}

// Course type now imported from course-prioritization utility

interface LearningJourneyDashboardProps {
  matchScore: number;
  skillGaps: any[];
  learningSuggestions: any[];
  targetRole: string;
  jobId?: string;
}

const LearningJourneyDashboard: React.FC<LearningJourneyDashboardProps> = ({
  matchScore,
  skillGaps,
  learningSuggestions,
  targetRole,
  jobId
}) => {
  const [showPlanCreator, setShowPlanCreator] = useState(false);

  // Automatically determine strategy based on match score
  const strategy = useMemo(() => determineStrategy(matchScore), [matchScore]);
  const strategyConfig = useMemo(() => getStrategyConfig(strategy), [strategy]);

  // Calculate optimized course recommendations with smart prioritization
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
    const enrichedCourses = allCourses.map(course => ({
      ...course,
      skillsCovered: courseSkillMap[course.title + course.provider] || [],
      efficiency: courseSkillMap[course.title + course.provider]?.length || 1
    }));

    // Use smart prioritization based on match score
    return prioritizeCourses(enrichedCourses, matchScore);
  }, [learningSuggestions, matchScore]);

  // Calculate time to goal based on automatic strategy
  const estimatedTimeToGoal = useMemo(() => {
    const hoursPerWeek = strategyConfig.defaultHoursPerWeek;
    const totalGaps = skillGaps.length;
    const weeksPerGap = strategy === 'refinement' ? 2 : strategy === 'adaptation' ? 3 : 4;
    const totalWeeks = totalGaps * weeksPerGap * (10 / hoursPerWeek);
    const months = Math.ceil(totalWeeks / 4.3);
    return months;
  }, [skillGaps.length, strategy, strategyConfig]);

  return (
    <div className="w-full space-y-6">
      {/* Hero Section - Your Learning Journey */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200/50 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Map className="w-8 h-8 text-blue-600" />
                Din utvecklingsresa mot {targetRole}
              </h2>
              <p className="text-gray-700">
                En personlig utvecklingsplan baserad på din nuvarande kompetens
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">{matchScore}%</div>
              <div className="text-sm text-gray-600">Nuvarande matchning</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200/30">
              <Target className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{skillGaps.length}</div>
              <div className="text-xs text-gray-600">Utvecklingsområden</div>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200/30">
              <BookOpen className="w-5 h-5 text-indigo-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{optimizedCourses.length}</div>
              <div className="text-xs text-gray-600">Rekommenderade kurser</div>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200/30">
              <Clock className="w-5 h-5 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">~{estimatedTimeToGoal}</div>
              <div className="text-xs text-gray-600">Månader till mål</div>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200/30">
              <Trophy className="w-5 h-5 text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">85%</div>
              <div className="text-xs text-gray-600">Målmatchning</div>
            </div>
          </div>

          {/* Motivational Progress Bar */}
          <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200/30">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Din resa</span>
              <span className="text-gray-900 font-medium">Mål: {targetRole}</span>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${matchScore}%` }}
              />
              <div className="absolute inset-y-0 left-0 w-full flex items-center justify-between px-2">
                <div className="text-[10px] text-white font-bold">{matchScore}%</div>
                <div className="text-[10px] text-gray-500">85%</div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Nuläge</span>
              <span>50% - God matchning</span>
              <span>85% - Mycket stark</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automatic Strategy Display */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 shadow-xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">{strategyConfig.emoji}</div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {strategyConfig.title}
            </h3>
            <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
              {strategyConfig.fullDescription}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>Denna rekommendation baseras på din matchningsscore ({matchScore}%)</span>
            </div>
          </div>
        </div>

        {/* Strategy Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{strategyConfig.defaultHoursPerWeek}h</div>
            <div className="text-xs text-gray-600">Rekommenderad tid/vecka</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">~{estimatedTimeToGoal}</div>
            <div className="text-xs text-gray-600">Månader till mål</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{optimizedCourses.length}</div>
            <div className="text-xs text-gray-600">Rekommenderade kurser</div>
          </div>
        </div>
      </div>

      {/* Smart Course Recommendations */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          Smarta kursrekommendationer
        </h3>

        <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="text-blue-600 font-semibold">💡 Tips:</span> Dessa kurser täcker flera kompetensområden
            samtidigt och är optimerade baserat på din matchningsscore!
          </p>
        </div>

        <div className="grid gap-3">
          {optimizedCourses.slice(0, 3).map((course, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 hover:bg-white transition-all border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      {course.efficiency}x
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{course.provider}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {course.skillsCovered?.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                          >
                            {String(skill)}
                          </span>
                        ))}
                        {course.skillsCovered && course.skillsCovered.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                            +{course.skillsCovered.length - 3} till
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {course.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        )}
                        {course.cost && (
                          <span className="flex items-center gap-1">
                            💰 {course.cost.replace(/^\$\s*/, '')}
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
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Visa kurs →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                🎯 Optimal väg identifierad!
              </p>
              <p className="text-xs text-gray-600">
                Med dessa {optimizedCourses.slice(0, 3).length} kurser täcker du {
                  optimizedCourses.slice(0, 3).flatMap(c => c.skillsCovered || [])
                    .filter((skill, index, self) => self.indexOf(skill) === index).length
                } kompetensområden
              </p>
            </div>
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Next Steps Call-to-Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Redo att börja din resa?</h3>
            <p className="text-white/90 text-sm">
              Baserat på din matchningsscore ({matchScore}%) och vår rekommenderade strategi,
              kan du nå ditt mål om cirka {estimatedTimeToGoal} månader!
            </p>
          </div>
          <button
            onClick={() => setShowPlanCreator(true)}
            className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Aktivera min plan →
          </button>
        </div>
      </div>

      {/* Learning Plan Creator Modal */}
      {showPlanCreator && jobId && (
        <LearningPlanCreator
          isOpen={showPlanCreator}
          onClose={() => setShowPlanCreator(false)}
          jobData={{
            jobId,
            targetRole,
            matchScore,
            learningSuggestions
          }}
        />
      )}
    </div>
  );
};

export default LearningJourneyDashboard;