'use client';

import React from 'react';
import {
  Clock,
  Calendar,
  DollarSign,
  MapPin,
  ChevronRight,
  BookOpen,
  Award,
  Target,
  ExternalLink
} from 'lucide-react';

interface CourseStep {
  type: 'certification' | 'course' | 'education' | 'milestone';
  title: string;
  provider?: string;
  duration: string;
  cost?: string;
  start_date?: string;
  direct_url?: string;
  study_format?: string;
  priority: 'essential' | 'recommended' | 'optional';
  description?: string;
}

interface LearningPathTimelineProps {
  suggestions: any[];
  targetRole: string;
  className?: string;
}

export default function LearningPathTimeline({
  suggestions,
  targetRole,
  className = ''
}: LearningPathTimelineProps) {

  // Group suggestions by priority and create timeline steps
  const essentialCourses = suggestions.filter(s => s.priority === 'essential');
  const recommendedCourses = suggestions.filter(s => s.priority === 'recommended');

  // Create a structured learning path
  const learningPath: CourseStep[] = [
    // Start with essential certifications (short duration first)
    ...essentialCourses
      .filter(c => c.type === 'certification')
      .sort((a, b) => {
        const durationA = parseDuration(a.duration);
        const durationB = parseDuration(b.duration);
        return durationA - durationB;
      }),
    // Then essential courses
    ...essentialCourses.filter(c => c.type === 'course'),
    // Finally recommended courses
    ...recommendedCourses
  ];

  // Helper to parse duration into days for sorting
  function parseDuration(duration: string): number {
    if (duration.includes('dag')) {
      const days = parseInt(duration.match(/\d+/)?.[0] || '1');
      return days;
    }
    if (duration.includes('vecka') || duration.includes('veckor')) {
      const weeks = parseInt(duration.match(/\d+/)?.[0] || '1');
      return weeks * 7;
    }
    if (duration.includes('månad')) {
      const months = parseInt(duration.match(/\d+/)?.[0] || '1');
      return months * 30;
    }
    if (duration.includes('år')) {
      const years = parseInt(duration.match(/\d+/)?.[0] || '1');
      return years * 365;
    }
    return 30; // Default
  }

  // Calculate total time estimate
  const totalDays = learningPath.reduce((sum, course) => sum + parseDuration(course.duration), 0);
  const totalTimeString = totalDays < 30
    ? `${totalDays} dagar`
    : totalDays < 365
    ? `${Math.round(totalDays / 30)} månader`
    : `${Math.round(totalDays / 365)} år`;

  if (learningPath.length === 0) {
    return null;
  }

  return (
    <div className={`w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mt-8 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Din rekommenderade lärandeväg mot {targetRole}
        </h3>
        <p className="text-gray-600">
          Total uppskattad tid: <span className="font-semibold">{totalTimeString}</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-blue-300"></div>

        {/* Timeline steps */}
        <div className="space-y-6">
          {learningPath.map((course, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className={`
                relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg
                ${course.priority === 'essential'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 border-2 border-blue-600'}
              `}>
                {course.type === 'certification' ? (
                  <Award className="w-5 h-5" />
                ) : (
                  <BookOpen className="w-5 h-5" />
                )}
              </div>

              {/* Content card */}
              <div className={`
                flex-1 bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow
                ${course.priority === 'essential' ? 'border-l-4 border-blue-600' : ''}
              `}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">
                      {course.title}
                    </h4>
                    {course.provider && (
                      <p className="text-sm text-gray-600 mt-1">{course.provider}</p>
                    )}
                  </div>
                  {course.priority === 'essential' && (
                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                      Obligatorisk
                    </span>
                  )}
                </div>

                {/* Course details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>

                  {course.cost && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{course.cost}</span>
                    </div>
                  )}

                  {course.start_date && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{course.start_date}</span>
                    </div>
                  )}

                  {course.study_format && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{course.study_format}</span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                {course.direct_url && (
                  <a
                    href={course.direct_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Läs mer & ansök
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {/* Progress indicator for multi-step path */}
                {index < learningPath.length - 1 && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <ChevronRight className="w-5 h-5 text-blue-400 rotate-90" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Final goal */}
          <div className="relative flex gap-4">
            <div className="relative z-10 w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-200">
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                🎯 Mål uppnått: {targetRole}
              </h4>
              <p className="text-gray-600">
                Efter genomförd utbildningsplan är du redo för rollen som {targetRole}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary box */}
      <div className="mt-8 bg-blue-100 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Finansieringsmöjligheter</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• CSN-stöd för längre utbildningar</li>
          <li>• Arbetsförmedlingens utbildningsstöd för bristyrken</li>
          <li>• Kompetensutveckling via nuvarande arbetsgivare</li>
          <li>• Skattefria utbildningsförmåner upp till 5000 kr/år</li>
        </ul>
      </div>
    </div>
  );
}