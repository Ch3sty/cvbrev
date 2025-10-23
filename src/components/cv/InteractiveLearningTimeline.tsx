// src/components/cv/InteractiveLearningTimeline.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen, Bookmark, BookmarkCheck, ChevronRight,
  Clock, Target, TrendingUp, Award, Sparkles, MapPin,
  CheckCircle2, Lock, Info, Zap, Calendar, ArrowRight
} from 'lucide-react';
import { groupCourses, shouldDisplayAsGroup, getGroupDisplayText, getCourseVariants } from '@/lib/learning/course-grouping';
import type { CourseGroup } from '@/lib/learning/course-grouping';
import type { Course } from '@/lib/learning/course-prioritization';
import LearningPlanCreator from './LearningPlanCreator';

interface LearningSuggestion {
  skill: string;
  importance: 'essential' | 'desirable';
  reasoning?: string;
  suggestions: Course[];
}

interface TimelineStep {
  id: 'step1' | 'step2' | 'step3';
  title: string;
  description: string;
  reasoning: string;
  whatNext: string;
  duration: string;
  icon: React.ElementType;
  color: string;
  skillsCovered: string[];
  courseGroups: CourseGroup[];
}

interface InteractiveLearningTimelineProps {
  matchScore: number;
  learningSuggestions: LearningSuggestion[];
  optimizedCourses: Course[];
  targetRole: string;
  jobId?: string;
}

const InteractiveLearningTimeline: React.FC<InteractiveLearningTimelineProps> = ({
  matchScore,
  learningSuggestions,
  optimizedCourses,
  targetRole,
  jobId
}) => {
  // State - organized by step
  const [selectedCoursesByStep, setSelectedCoursesByStep] = useState<{
    step1: Set<string>;
    step2: Set<string>;
    step3: Set<string>;
  }>({
    step1: new Set(),
    step2: new Set(),
    step3: new Set()
  });

  const [activeStep, setActiveStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [showPlanCreator, setShowPlanCreator] = useState(false);

  // Categorize skills by importance
  const { essential, desirable } = useMemo(() => {
    const essential = learningSuggestions.filter(s => s.importance === 'essential');
    const desirable = learningSuggestions.filter(s => s.importance === 'desirable');
    return { essential, desirable };
  }, [learningSuggestions]);

  // Build timeline steps with grouped courses
  const timelineSteps = useMemo<TimelineStep[]>(() => {
    const coursesPerStep = Math.ceil(optimizedCourses.length / 3);

    // Step 1: Foundation (first third of courses)
    const step1Courses = optimizedCourses.slice(0, coursesPerStep);
    const step1Groups = groupCourses(step1Courses);

    // Step 2: Development (middle third)
    const step2Courses = optimizedCourses.slice(coursesPerStep, coursesPerStep * 2);
    const step2Groups = groupCourses(step2Courses);

    // Step 3: Specialization (last third)
    const step3Courses = optimizedCourses.slice(coursesPerStep * 2);
    const step3Groups = groupCourses(step3Courses);

    const steps: TimelineStep[] = [
      {
        id: 'step1',
        title: 'Grundkompetens',
        description: matchScore < 40
          ? 'Börja med fundamental utbildning som bygger din kompetens från grunden'
          : 'Börja här för att fylla de viktigaste luckorna',
        reasoning: matchScore < 40
          ? 'Vi börjar med grundläggande utbildningar eftersom det finns betydande kompetensgap att fylla. Dessa kurser ger dig den bas du behöver för att sedan bygga vidare.'
          : 'Även om du redan har erfarenhet, ger dessa kurser dig specifik kompetens som efterfrågas i rollen.',
        whatNext: 'Efter dessa kurser har du grundläggande förståelse och kan börja applicera kunskaperna i praktiken. Du är redo för mer specialiserade utbildningar.',
        duration: matchScore < 40 ? '0-6 månader' : '0-3 månader',
        icon: BookOpen,
        color: 'from-blue-500 to-blue-600',
        skillsCovered: essential.slice(0, Math.ceil(essential.length / 3)).map(s => s.skill),
        courseGroups: step1Groups
      },
      {
        id: 'step2',
        title: 'Fördjupning',
        description: 'Bygg på din kompetens med mer specialiserade kurser',
        reasoning: 'Nu när du har grunden på plats kan du fördjupa dig inom de områden som är mest relevanta för rollen. Dessa kurser ger dig praktisk erfarenhet och branschspecifik kunskap.',
        whatNext: 'Med fördjupad kunskap kan du ta dig an mer komplexa uppgifter och börja specialisera dig inom specifika områden. Du närmar dig expert-nivå.',
        duration: matchScore < 40 ? '6-12 månader' : '3-8 månader',
        icon: TrendingUp,
        color: 'from-indigo-500 to-indigo-600',
        skillsCovered: [
          ...essential.slice(Math.ceil(essential.length / 3), Math.ceil(essential.length * 2 / 3)).map(s => s.skill),
          ...desirable.slice(0, Math.ceil(desirable.length / 2)).map(s => s.skill)
        ],
        courseGroups: step2Groups
      },
      {
        id: 'step3',
        title: 'Specialisering',
        description: 'Nå expertis med avancerade kurser och certifieringar',
        reasoning: 'För att verkligen sticka ut och nå full kompetens för rollen behövs specialiserad kunskap. Dessa kurser och certifieringar ger dig den kompetitiva fördelen.',
        whatNext: 'Efter dessa kurser har du full kompetens för rollen. Du kan söka jobbet med självförtroende och har dokumenterad expertis genom certifieringar.',
        duration: matchScore < 40 ? '12-18 månader' : '8-12 månader',
        icon: Award,
        color: 'from-purple-500 to-purple-600',
        skillsCovered: [
          ...essential.slice(Math.ceil(essential.length * 2 / 3)).map(s => s.skill),
          ...desirable.slice(Math.ceil(desirable.length / 2)).map(s => s.skill)
        ],
        courseGroups: step3Groups
      }
    ];

    return steps;
  }, [learningSuggestions, optimizedCourses, matchScore, essential, desirable]);

  // Helper function to generate unique course ID
  const getCourseId = (course: Course) => {
    return `${course.title}|||${course.provider || 'unknown'}`;
  };

  // Calculate total selected courses across all steps
  const totalSelectedCourses = useMemo(() => {
    return selectedCoursesByStep.step1.size +
           selectedCoursesByStep.step2.size +
           selectedCoursesByStep.step3.size;
  }, [selectedCoursesByStep]);

  // Dependency validation
  const isStepLocked = (stepId: 'step1' | 'step2' | 'step3'): boolean => {
    if (stepId === 'step1') return false; // Step 1 never locked
    if (stepId === 'step2') return selectedCoursesByStep.step1.size === 0;
    if (stepId === 'step3') return selectedCoursesByStep.step2.size === 0;
    return false;
  };

  const getLockMessage = (stepId: 'step1' | 'step2' | 'step3'): string => {
    if (stepId === 'step2') return 'Välj minst 1 utbildning från Grundkompetens först';
    if (stepId === 'step3') return 'Välj minst 1 utbildning från Fördjupning först';
    return '';
  };

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const totalSteps = 3;
    let completedSteps = 0;
    if (selectedCoursesByStep.step1.size > 0) completedSteps++;
    if (selectedCoursesByStep.step2.size > 0) completedSteps++;
    if (selectedCoursesByStep.step3.size > 0) completedSteps++;

    // Base progress on match score + selected steps
    const baseProgress = matchScore;
    const stepBonus = (completedSteps / totalSteps) * (100 - matchScore);
    return Math.min(100, Math.round(baseProgress + stepBonus));
  }, [matchScore, selectedCoursesByStep]);

  // Handlers
  const toggleCourseForStep = (stepId: 'step1' | 'step2' | 'step3', courseId: string) => {
    if (isStepLocked(stepId)) return;

    setSelectedCoursesByStep(prev => {
      const newState = { ...prev };
      const stepSet = new Set(prev[stepId]);

      if (stepSet.has(courseId)) {
        stepSet.delete(courseId);
      } else {
        stepSet.add(courseId);
      }

      newState[stepId] = stepSet;
      return newState;
    });
  };

  const handleSaveRoadmap = () => {
    if (!jobId) {
      alert('Jobbannonsen kunde inte hittas. Uppdatera sidan och försök igen.');
      return;
    }
    setShowPlanCreator(true);
  };

  // Calculate estimated months based on selected courses
  const estimatedMonths = useMemo(() => {
    if (totalSelectedCourses === 0) return matchScore < 40 ? 18 : matchScore < 70 ? 12 : 9;

    // More accurate calculation based on actual selections
    const hasStep1 = selectedCoursesByStep.step1.size > 0;
    const hasStep2 = selectedCoursesByStep.step2.size > 0;
    const hasStep3 = selectedCoursesByStep.step3.size > 0;

    let months = 0;
    if (hasStep1) months += matchScore < 40 ? 6 : 3;
    if (hasStep2) months += matchScore < 40 ? 6 : 5;
    if (hasStep3) months += matchScore < 40 ? 6 : 4;

    return months;
  }, [matchScore, totalSelectedCourses, selectedCoursesByStep]);

  return (
    <div className="w-full space-y-8">
      {/* Journey Timeline Visualization */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Din utvecklingsväg mot {targetRole}
          </h3>
          <p className="text-sm text-gray-600">
            Välj utbildningar för varje steg nedan för att bygga din personliga färdplan
          </p>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Progress Line Background */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-gray-200 rounded-full"
                 style={{ marginLeft: '10%', marginRight: '10%' }}
            />
            {/* Progress Line Foreground */}
            <div className="absolute top-12 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-700"
                 style={{
                   marginLeft: '10%',
                   width: `${progressPercentage * 0.8}%`
                 }}
            />

            <div className="flex items-start justify-between relative">
              {/* Start Node: Current Position */}
              <div className="flex flex-col items-center w-1/5">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 border-2 border-gray-300 shadow-lg mb-3 relative z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow">
                      <MapPin className="w-6 h-6 text-gray-700" />
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Idag</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{matchScore}%</p>
                    <p className="text-xs text-gray-600 mt-1">{learningSuggestions.filter(s => s.importance === 'essential').length} kompetenser saknas</p>
                  </div>
                </div>
                <div className="text-center px-2">
                  <p className="text-xs font-medium text-blue-600 bg-blue-50 rounded px-2 py-1">DU ÄR HÄR</p>
                </div>
              </div>

              {/* Step Nodes */}
              {timelineSteps.map((step, index) => {
                const isLocked = isStepLocked(step.id);
                const selectedCount = selectedCoursesByStep[step.id].size;
                const isActive = activeStep === step.id;

                return (
                  <div key={step.id} className="flex flex-col items-center w-1/5">
                    <button
                      onClick={() => !isLocked && setActiveStep(step.id)}
                      disabled={isLocked}
                      className={`rounded-xl p-4 border-2 shadow-lg mb-3 relative z-10 transition-all ${
                        isLocked
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                          : isActive
                            ? `bg-gradient-to-br ${step.color} border-blue-500 ring-2 ring-blue-300`
                            : selectedCount > 0
                              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-400 hover:border-green-500'
                              : 'bg-white border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          isLocked
                            ? 'bg-gray-200'
                            : isActive || selectedCount > 0
                              ? 'bg-white shadow'
                              : 'bg-gray-50'
                        }`}>
                          {isLocked ? (
                            <Lock className="w-6 h-6 text-gray-500" />
                          ) : (
                            <step.icon className={`w-6 h-6 ${
                              isActive ? 'text-blue-600' : selectedCount > 0 ? 'text-green-600' : 'text-gray-600'
                            }`} />
                          )}
                        </div>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${
                          isLocked ? 'text-gray-500' : isActive ? 'text-white' : 'text-gray-700'
                        }`}>
                          Steg {index + 1}
                        </p>
                        <p className={`text-sm font-bold mt-1 ${
                          isLocked ? 'text-gray-600' : isActive ? 'text-white' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isLocked ? 'text-gray-500' : isActive ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          {step.duration}
                        </p>
                        {selectedCount > 0 && (
                          <div className="mt-2 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">{selectedCount} vald{selectedCount !== 1 ? 'a' : ''}</span>
                          </div>
                        )}
                      </div>
                    </button>
                    {isLocked && (
                      <div className="text-center px-2">
                        <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{getLockMessage(step.id)}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Goal Node */}
              <div className="flex flex-col items-center w-1/5">
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 border-2 border-green-400 shadow-lg mb-3 relative z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Målet</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">100%</p>
                    <p className="text-xs text-green-700 mt-1">Full kompetens</p>
                  </div>
                </div>
                <div className="text-center px-2">
                  <p className="text-xs font-medium text-green-700">{targetRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="lg:hidden space-y-4">
          {/* Start Node */}
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-3 border-2 border-gray-300 shadow flex-shrink-0">
              <MapPin className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Idag - {matchScore}%</p>
              <p className="text-sm text-gray-700">{learningSuggestions.filter(s => s.importance === 'essential').length} kompetenser saknas</p>
            </div>
          </div>

          {/* Vertical connector */}
          <div className="ml-5 h-8 w-0.5 bg-gray-300" />

          {/* Steps */}
          {timelineSteps.map((step, index) => {
            const isLocked = isStepLocked(step.id);
            const selectedCount = selectedCoursesByStep[step.id].size;
            const isActive = activeStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => !isLocked && setActiveStep(step.id)}
                  disabled={isLocked}
                  className={`flex items-center gap-4 w-full text-left ${isLocked ? 'opacity-60' : ''}`}
                >
                  <div className={`rounded-lg p-3 border-2 shadow flex-shrink-0 ${
                    isLocked
                      ? 'bg-gray-100 border-gray-300'
                      : isActive
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500'
                        : selectedCount > 0
                          ? 'bg-green-50 border-green-400'
                          : 'bg-white border-gray-300'
                  }`}>
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-gray-500" />
                    ) : (
                      <step.icon className={`w-5 h-5 ${isActive ? 'text-white' : selectedCount > 0 ? 'text-green-600' : 'text-gray-600'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Steg {index + 1}</p>
                    <p className="text-sm font-bold text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-600">{step.duration} • {selectedCount} vald{selectedCount !== 1 ? 'a' : ''}</p>
                  </div>
                </button>
                {index < timelineSteps.length - 1 && <div className="ml-5 h-8 w-0.5 bg-gray-300" />}
              </React.Fragment>
            );
          })}

          {/* Vertical connector */}
          <div className="ml-5 h-8 w-0.5 bg-gray-300" />

          {/* Goal Node */}
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 border-2 border-green-400 shadow flex-shrink-0">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase">Målet - 100%</p>
              <p className="text-sm font-bold text-green-900">{targetRole}</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Beräknad tid</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{estimatedMonths} mån</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-gray-600">Valda kurser</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{totalSelectedCourses}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600">Kompetenser</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{learningSuggestions.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Framsteg</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{progressPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">
              💡 Så fungerar det
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Välj utbildningar från varje steg nedan. Du måste börja med Steg 1 (Grundkompetens) innan du kan välja kurser från Steg 2 eller 3.
            </p>
            <p className="text-sm text-gray-600">
              Rekommendation: Välj minst 1-2 utbildningar per steg för bästa resultat. Alla valda utbildningar sparas i din personliga utvecklingsplan.
            </p>
          </div>
        </div>
      </div>

      {/* Course Selection Interface */}
      {timelineSteps.map(step => {
        const isLocked = isStepLocked(step.id);
        const isActive = activeStep === step.id;
        const selectedCount = selectedCoursesByStep[step.id].size;

        return (
          <div
            key={step.id}
            id={`step-${step.id}`}
            className={`bg-white/80 backdrop-blur-xl rounded-2xl border-2 shadow-xl overflow-hidden transition-all ${
              isActive ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200/50'
            }`}
          >
            {/* Step Header */}
            <div className={`p-6 ${isLocked ? 'bg-gray-100' : `bg-gradient-to-r ${step.color}`}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${isLocked ? 'bg-gray-300' : 'bg-white shadow-lg'}`}>
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-gray-600" />
                    ) : (
                      <step.icon className={`w-6 h-6 ${isLocked ? 'text-gray-600' : 'text-blue-600'}`} />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold mb-1 ${isLocked ? 'text-gray-700' : 'text-white'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mb-2 ${isLocked ? 'text-gray-600' : 'text-white/90'}`}>
                      {step.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`flex items-center gap-1 ${isLocked ? 'text-gray-600' : 'text-white/80'}`}>
                        <Clock className="w-4 h-4" />
                        {step.duration}
                      </span>
                      <span className={`flex items-center gap-1 ${isLocked ? 'text-gray-600' : 'text-white/80'}`}>
                        <BookOpen className="w-4 h-4" />
                        {step.courseGroups.length} utbildningar
                      </span>
                    </div>
                  </div>
                </div>

                {selectedCount > 0 && !isLocked && (
                  <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-bold text-gray-900">{selectedCount} vald{selectedCount !== 1 ? 'a' : ''}</span>
                    </div>
                  </div>
                )}
              </div>

              {isLocked && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{getLockMessage(step.id)}</p>
                </div>
              )}
            </div>

            {/* Course Grid */}
            {!isLocked && (
              <div className="p-6">
                {/* Why this step */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    Varför detta steg?
                  </h4>
                  <p className="text-sm text-gray-700">{step.reasoning}</p>
                </div>

                {/* Courses */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {step.courseGroups.map(group => {
                    const shouldGroup = shouldDisplayAsGroup(group);

                    if (!shouldGroup) {
                      // Single course
                      const course = group.courses[0];
                      const courseId = getCourseId(course);
                      const isSelected = selectedCoursesByStep[step.id].has(courseId);

                      return (
                        <div
                          key={courseId}
                          className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-semibold text-gray-900 text-sm flex-1 pr-2">{course.title}</h5>
                            <button
                              onClick={() => toggleCourseForStep(step.id, courseId)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300 hover:border-blue-500'
                              }`}
                              title={isSelected ? 'Ta bort från plan' : 'Lägg till i plan'}
                            >
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </button>
                          </div>

                          {course.provider && (
                            <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3" />
                              {course.provider}
                            </p>
                          )}

                          {course.description && (
                            <p className="text-xs text-gray-700 mb-3 line-clamp-2">
                              {course.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mb-3">
                            {course.duration && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-medium">
                                {course.duration}
                              </span>
                            )}
                            {course.cost && (
                              <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                                (course.cost.toLowerCase().includes('gratis') || course.cost === '0')
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {course.cost}
                              </span>
                            )}
                          </div>

                          {course.direct_url && (
                            <a
                              href={course.direct_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Se kursinformation
                              <ChevronRight className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    } else {
                      // Grouped courses
                      const variants = getCourseVariants(group);

                      return (
                        <div key={group.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h5 className="font-semibold text-gray-900 text-sm mb-1">{group.baseTitle}</h5>
                            <p className="text-xs text-gray-600">{getGroupDisplayText(group)}</p>
                          </div>
                          <div className="p-3 space-y-2">
                            {variants.map((course, idx) => {
                              const courseId = getCourseId(course);
                              const isSelected = selectedCoursesByStep[step.id].has(courseId);

                              return (
                                <div
                                  key={idx}
                                  className={`rounded-lg border p-3 transition-all ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-gray-900 flex items-center gap-1 mb-1">
                                        <MapPin className="w-3 h-3" />
                                        {course.provider || `Alternativ ${idx + 1}`}
                                      </p>
                                      {course.duration && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                                          {course.duration}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => toggleCourseForStep(step.id, courseId)}
                                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isSelected
                                          ? 'bg-blue-600 border-blue-600'
                                          : 'border-gray-300 hover:border-blue-500'
                                      }`}
                                    >
                                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </button>
                                  </div>
                                  {course.description && (
                                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                                      {course.description}
                                    </p>
                                  )}
                                  {course.direct_url && (
                                    <a
                                      href={course.direct_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Se kursinformation
                                      <ChevronRight className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* CTA: Activate Plan */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200/50 shadow-xl text-center">
        <h4 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          {totalSelectedCourses > 0
            ? `Spara din utvecklingsplan`
            : 'Börja bygga din utvecklingsplan'}
        </h4>
        <p className="text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
          {totalSelectedCourses > 0
            ? `Du har valt ${totalSelectedCourses} utbildning${totalSelectedCourses !== 1 ? 'ar' : ''} fördelade över ${Object.values(selectedCoursesByStep).filter(s => s.size > 0).length} steg. Din plan sparas och du kan följa dina framsteg under "Min Utvecklingsplan" i menyn.`
            : 'Välj utbildningar från stegen ovan för att skapa din personliga utvecklingsplan. Börja med Steg 1!'}
        </p>
        <button
          onClick={handleSaveRoadmap}
          disabled={!jobId || totalSelectedCourses === 0}
          className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
            jobId && totalSelectedCourses > 0
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-6 h-6" />
          {totalSelectedCourses > 0
            ? 'Spara min utvecklingsplan'
            : 'Välj utbildningar först'}
          <ArrowRight className="w-5 h-5" />
        </button>
        {totalSelectedCourses > 0 && (
          <p className="text-xs text-gray-500 mt-4 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Beräknad tid: {estimatedMonths} månader • {progressPercentage}% matchning vid slutförande
          </p>
        )}
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
          selectedCoursesByStep={selectedCoursesByStep}
        />
      )}
    </div>
  );
};

export default InteractiveLearningTimeline;
