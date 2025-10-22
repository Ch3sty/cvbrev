// src/components/cv/InteractiveLearningTimeline.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDown, ChevronUp, ExternalLink, Clock,
  BookOpen, Award, Target, CheckCircle, Info,
  Map as MapIcon
} from 'lucide-react';
import { getCourseBadges, isFreeOrSubsidized } from '@/lib/learning/course-prioritization';
import type { Course } from '@/lib/learning/course-prioritization';

interface LearningSuggestion {
  skill: string;
  importance: 'essential' | 'desirable';
  reasoning?: string;
  suggestions: Course[];
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: React.ElementType;
  color: string;
  skills: LearningSuggestion[];
  courses: Course[];
}

interface InteractiveLearningTimelineProps {
  matchScore: number;
  learningSuggestions: LearningSuggestion[];
  optimizedCourses: Course[];
  targetRole: string;
}

const InteractiveLearningTimeline: React.FC<InteractiveLearningTimelineProps> = ({
  matchScore,
  learningSuggestions,
  optimizedCourses,
  targetRole
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['step1']));
  const [expandedCourses, setExpandedCourses] = useState<{ [key: string]: boolean }>({});

  // Group skills into timeline steps
  const timelineSteps = useMemo<TimelineStep[]>(() => {
    const essential = learningSuggestions.filter(s => s.importance === 'essential');
    const desirable = learningSuggestions.filter(s => s.importance === 'desirable');

    // Distribute courses across steps based on priority and match score
    const allCourses = [...optimizedCourses];

    // Low match score (0-40%): Focus on fundamentals, longer courses first
    // Medium (40-70%): Balanced approach
    // High (70%+): Quick wins, shorter courses first

    const coursesPerStep = Math.ceil(allCourses.length / 3);

    return [
      {
        id: 'step1',
        title: 'Grundkompetens',
        description: matchScore < 40
          ? 'Börja med fundamental utbildning för att bygga en solid bas'
          : 'Börja här för att fylla de viktigaste kompetensluckorna',
        duration: '0-3 månader',
        icon: BookOpen,
        color: 'from-blue-500 to-blue-600',
        skills: essential.slice(0, Math.ceil(essential.length / 3)),
        courses: allCourses.slice(0, coursesPerStep)
      },
      {
        id: 'step2',
        title: 'Fördjupning',
        description: 'Bygg vidare på dina grundkunskaper och specialisera dig',
        duration: '3-6 månader',
        icon: Target,
        color: 'from-purple-500 to-purple-600',
        skills: essential.slice(Math.ceil(essential.length / 3), Math.ceil(essential.length * 2 / 3)),
        courses: allCourses.slice(coursesPerStep, coursesPerStep * 2)
      },
      {
        id: 'step3',
        title: 'Specialisering',
        description: 'Bli expert och differentiera dig från andra kandidater',
        duration: '6-9 månader',
        icon: Award,
        color: 'from-pink-500 to-pink-600',
        skills: [...essential.slice(Math.ceil(essential.length * 2 / 3)), ...desirable],
        courses: allCourses.slice(coursesPerStep * 2)
      }
    ];
  }, [learningSuggestions, optimizedCourses, matchScore]);

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleCourseDetails = (courseKey: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseKey]: !prev[courseKey]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MapIcon className="w-6 h-6 text-blue-600" />
          Din utvecklingsväg mot {targetRole}
        </h2>
        <p className="text-gray-600">
          En steg-för-steg guide med konkreta utbildningsalternativ anpassade efter din nuvarande kompetens
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="relative">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isExpanded = expandedSteps.has(step.id);
          const isLast = index === timelineSteps.length - 1;

          return (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent" />
              )}

              {/* Step Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden mb-6">
                {/* Colored Top Bar */}
                <div className={`h-2 bg-gradient-to-r ${step.color}`} />

                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Icon Circle */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Steg {index + 1}: {step.title}
                      </h3>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {step.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {step.skills.length} kompetenser
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {step.courses.length} kursalternativ
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    {/* Skills Overview */}
                    <div className="mt-4 mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Kompetenser att utveckla:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {step.skills.slice(0, 6).map((skill, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200"
                          >
                            {skill.skill}
                          </div>
                        ))}
                        {step.skills.length > 6 && (
                          <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 border border-gray-200 flex items-center justify-center">
                            +{step.skills.length - 6} till...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Alternatives */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Välj ett eller flera alternativ:
                      </h4>

                      {step.courses.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                          <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Inga specifika kurser hittades för detta steg.</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Sök själv efter kurser inom: {step.skills.map(s => s.skill).join(', ')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {step.courses.map((course, courseIdx) => {
                            const courseKey = `${step.id}-course-${courseIdx}`;
                            const isExpanded = expandedCourses[courseKey];
                            const badges = getCourseBadges(course);
                            const isFree = isFreeOrSubsidized(course);

                            return (
                              <div
                                key={courseIdx}
                                className="bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                              >
                                {/* Course Header */}
                                <div className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-start gap-2 mb-2">
                                        <h5 className="font-semibold text-gray-900 flex-1">
                                          {course.title}
                                        </h5>
                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-1">
                                          {badges.map((badge, idx) => (
                                            <span
                                              key={idx}
                                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                badge === 'Gratis' || badge.includes('CSN')
                                                  ? 'bg-green-100 text-green-700'
                                                  : badge === 'Komvux' || badge === 'Högskola'
                                                  ? 'bg-blue-100 text-blue-700'
                                                  : 'bg-gray-100 text-gray-700'
                                              }`}
                                            >
                                              {badge}
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      {course.provider && (
                                        <p className="text-sm text-gray-600 mb-2">{course.provider}</p>
                                      )}

                                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                                        {course.duration && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {course.duration}
                                          </span>
                                        )}
                                        {course.cost && (
                                          <span className={`font-medium ${isFree ? 'text-green-600' : 'text-gray-700'}`}>
                                            {course.cost.replace(/^\$\s*/, '')}
                                          </span>
                                        )}
                                      </div>

                                      {/* Skills Covered */}
                                      {course.skillsCovered && course.skillsCovered.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {course.skillsCovered.slice(0, 3).map((skill, idx) => (
                                            <span
                                              key={idx}
                                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200"
                                            >
                                              {String(skill)}
                                            </span>
                                          ))}
                                          {course.skillsCovered.length > 3 && (
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                              +{course.skillsCovered.length - 3}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                      {course.direct_url && (
                                        <a
                                          href={course.direct_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                                        >
                                          Gå till kurs
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      )}
                                      <button
                                        onClick={() => toggleCourseDetails(courseKey)}
                                        className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-all border border-gray-300"
                                      >
                                        {isExpanded ? 'Dölj detaljer' : 'Visa detaljer'}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Expanded Course Details */}
                                  {isExpanded && course.description && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {course.description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Redo att börja din utvecklingsresa?
            </h3>
            <p className="text-gray-600 mb-4">
              Du har nu en komplett översikt över alla steg och utbildningsalternativ.
              Välj de kurser som passar dig bäst och börja utveckla din kompetens!
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
              Spara min utvecklingsväg
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveLearningTimeline;
