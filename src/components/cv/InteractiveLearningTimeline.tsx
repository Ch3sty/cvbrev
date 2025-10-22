// src/components/cv/InteractiveLearningTimeline.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen, Bookmark, BookmarkCheck, ChevronRight, ChevronDown,
  Clock, Target, TrendingUp, Award, Sparkles, MapPin,
  CheckCircle2, Circle, ArrowRight, Zap, Info
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
  id: string;
  title: string;
  description: string;
  reasoning: string; // Why is this step needed?
  whatNext: string; // What happens after this step?
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
  // State
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['step1']));
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
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

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalMonths = matchScore < 40 ? 18 : matchScore < 70 ? 12 : 9;
    const totalSkills = learningSuggestions.length;
    const totalCourses = optimizedCourses.length;
    const freeCourses = optimizedCourses.filter(c =>
      (c.cost || '').toLowerCase().includes('gratis') ||
      (c.cost || '').toLowerCase().includes('free') ||
      (c.cost || '') === '0'
    ).length;

    return {
      totalMonths,
      totalSkills,
      totalCourses,
      freeCourses,
      costEstimate: freeCourses === totalCourses ? 'Gratis via CSN' : 'Mix gratis/betalda kurser'
    };
  }, [learningSuggestions, optimizedCourses, matchScore]);

  // Handlers
  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  // Helper function to generate unique course ID
  const getCourseId = (course: Course) => {
    return `${course.title}|||${course.provider || 'unknown'}`;
  };

  const handleSaveRoadmap = () => {
    if (!jobId) {
      alert('Jobbannonsen kunde inte hittas. Uppdatera sidan och försök igen.');
      return;
    }
    setShowPlanCreator(true);
  };

  return (
    <div className="w-full space-y-8">
      {/* Summary Overview Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Din utvecklingsväg mot {targetRole}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              En komplett färdplan anpassad efter din nuvarande kompetensnivå
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Total tid</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalMonths} mån</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-gray-600">Kompetenser</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalSkills}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600">Kurser</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalCourses}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Kostnad</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{summary.costEstimate}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Utvecklingsframsteg</span>
            <span className="text-sm font-medium text-gray-900">0% → 100%</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-700"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Information Box: Why select courses */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">
              💡 Bygg din personliga utvecklingsplan
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Välj de utbildningar som passar dig bäst från varje steg nedan. Vi rekommenderar minst en utbildning per steg för bästa resultat.
            </p>
            <p className="text-sm text-gray-600">
              Dina valda utbildningar sparas i din personliga utvecklingsplan som du kan följa, uppdatera och använda för att nå ditt mål.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Flow Roadmap (Desktop) / Vertical (Mobile) */}
      <div className="relative">
        {/* Desktop: Horizontal Flow */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-between gap-8">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className="flex-1 relative">
                {/* Step Card */}
                <div className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden transition-all ${
                  expandedSteps.has(step.id) ? 'ring-2 ring-blue-500' : ''
                }`}>
                  {/* Step Header */}
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${step.color}`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                        {step.duration}
                      </span>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {step.skillsCovered.length} kompetenser • {step.courseGroups.length} kurser
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedSteps.has(step.id) ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedSteps.has(step.id) && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-200/50">
                      {/* Reasoning */}
                      <div className="pt-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">❓ Varför detta steg?</h5>
                        <p className="text-sm text-gray-600">{step.reasoning}</p>
                      </div>

                      {/* What's Next */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">✨ Vad händer sen?</h5>
                        <p className="text-sm text-gray-600">{step.whatNext}</p>
                      </div>

                      {/* Course Groups */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3">📚 Utbildningar</h5>
                        <div className="space-y-2">
                          {step.courseGroups.map(group => (
                            <CourseGroupCard
                              key={group.id}
                              group={group}
                              isExpanded={expandedGroups.has(group.id)}
                              onToggle={() => toggleGroup(group.id)}
                              selectedCourses={selectedCourses}
                              onSelectCourse={toggleCourseSelection}
                              getCourseId={getCourseId}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow to next step */}
                {index < timelineSteps.length - 1 && (
                  <div className="absolute top-1/4 -right-8 z-10">
                    <ArrowRight className="w-8 h-8 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical Stack */}
        <div className="lg:hidden space-y-6">
          {timelineSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden ${
                expandedSteps.has(step.id) ? 'ring-2 ring-blue-500' : ''
              }`}>
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${step.color}`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                      {step.duration}
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {step.skillsCovered.length} kompetenser • {step.courseGroups.length} kurser
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedSteps.has(step.id) ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>

                {expandedSteps.has(step.id) && (
                  <div className="px-6 pb-6 space-y-4 border-t border-gray-200/50">
                    <div className="pt-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">❓ Varför detta steg?</h5>
                      <p className="text-sm text-gray-600">{step.reasoning}</p>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">✨ Vad händer sen?</h5>
                      <p className="text-sm text-gray-600">{step.whatNext}</p>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">📚 Utbildningar</h5>
                      <div className="space-y-2">
                        {step.courseGroups.map(group => (
                          <CourseGroupCard
                            key={group.id}
                            group={group}
                            isExpanded={expandedGroups.has(group.id)}
                            onToggle={() => toggleGroup(group.id)}
                            selectedCourses={selectedCourses}
                            onSelectCourse={toggleCourseSelection}
                            getCourseId={getCourseId}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Down arrow for mobile */}
              {index < timelineSteps.length - 1 && (
                <div className="flex justify-center py-4">
                  <ChevronDown className="w-8 h-8 text-blue-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA: Save Roadmap */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-xl text-center">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {selectedCourses.size > 0
            ? `Aktivera din utvecklingsplan (${selectedCourses.size} utbildningar)`
            : 'Börja bygga din utvecklingsplan'}
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          {selectedCourses.size > 0
            ? 'Din plan sparas och du kan börja följa dina framsteg under "Min Utvecklingsplan" i menyn'
            : 'Välj utbildningar från stegen ovan för att skapa din personliga utvecklingsplan'}
        </p>
        <button
          onClick={handleSaveRoadmap}
          disabled={!jobId || selectedCourses.size === 0}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md ${
            jobId && selectedCourses.size > 0
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          {selectedCourses.size > 0
            ? 'Aktivera min utvecklingsplan'
            : 'Välj utbildningar först'}
          <ChevronRight className="w-4 h-4" />
        </button>
        {selectedCourses.size > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Efter aktivering hittar du din plan under "Min Utvecklingsplan" där du kan följa framsteg och uppdatera status
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
        />
      )}
    </div>
  );
};

// Sub-component: Course Group Card
interface CourseGroupCardProps {
  group: CourseGroup;
  isExpanded: boolean;
  onToggle: () => void;
  selectedCourses: Set<string>;
  onSelectCourse: (courseId: string) => void;
  getCourseId: (course: Course) => string;
}

const CourseGroupCard: React.FC<CourseGroupCardProps> = ({
  group,
  isExpanded,
  onToggle,
  selectedCourses,
  onSelectCourse,
  getCourseId
}) => {
  const shouldGroup = shouldDisplayAsGroup(group);
  const displayText = getGroupDisplayText(group);

  if (!shouldGroup) {
    // Single course - display directly
    const course = group.courses[0];
    const courseId = getCourseId(course);
    const isSelected = selectedCourses.has(courseId);

    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200/50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h6 className="font-medium text-gray-900 text-sm mb-1">{course.title}</h6>
            {course.provider && (
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {course.provider}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {course.duration && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                  {course.duration}
                </span>
              )}
              {course.cost && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  (course.cost.toLowerCase().includes('gratis') || course.cost === '0')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {course.cost}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onSelectCourse(courseId)}
            title={isSelected ? 'Ta bort från min plan' : 'Lägg till i min utvecklingsplan'}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
            }`}
          >
            {isSelected ? (
              <><BookmarkCheck className="w-4 h-4" />✓ Tillagd</>
            ) : (
              <><Bookmark className="w-4 h-4" />Lägg till</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Grouped courses - show expandable group
  const variants = getCourseVariants(group);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h6 className="font-medium text-gray-900 text-sm mb-1">{group.baseTitle}</h6>
            <p className="text-xs text-gray-600">{displayText}</p>
            <div className="flex items-center gap-2 mt-2">
              {group.duration && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                  {group.duration}
                </span>
              )}
              {group.isFree && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                  Gratis
                </span>
              )}
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`} />
        </div>
      </button>

      {/* Expanded Variants */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-200/50">
          {variants.map((course, idx) => {
            const courseId = getCourseId(course);
            const isSelected = selectedCourses.has(courseId);
            return (
              <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-900 font-medium mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {course.provider || `Alternativ ${idx + 1}`}
                    </p>
                    {course.description && (
                      <p className="text-xs text-gray-600">{course.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectCourse(courseId)}
                    title={isSelected ? 'Ta bort från min plan' : 'Lägg till i min utvecklingsplan'}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {isSelected ? (
                      <><CheckCircle2 className="w-3 h-3" />✓</>
                    ) : (
                      <><Circle className="w-3 h-3" />Lägg till</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InteractiveLearningTimeline;
