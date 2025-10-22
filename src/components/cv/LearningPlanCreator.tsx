// src/components/cv/LearningPlanCreator.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { X, Check, ChevronRight, Clock, Target, Sparkles, BookOpen, Calendar } from 'lucide-react';

interface LearningPlanCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  jobData: {
    jobId: string;
    targetRole: string;
    matchScore: number;
    learningSuggestions: any[];
  };
  selectedCoursesByStep: {
    step1: Set<string>;
    step2: Set<string>;
    step3: Set<string>;
  };
  // learningPath and timeCommitment are now determined automatically based on matchScore
}

const LearningPlanCreator: React.FC<LearningPlanCreatorProps> = ({
  isOpen,
  onClose,
  jobData,
  selectedCoursesByStep
}) => {
  const [planTitle, setPlanTitle] = useState(`Min väg till ${jobData.targetRole}`);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert selectedCoursesByStep to total count
  const totalSelectedCourses = useMemo(() => {
    return selectedCoursesByStep.step1.size +
           selectedCoursesByStep.step2.size +
           selectedCoursesByStep.step3.size;
  }, [selectedCoursesByStep]);

  // Determine automatic time commitment based on match score
  const timeCommitmentHours = useMemo(() => {
    if (jobData.matchScore < 40) return 15; // Career change: 15h/week
    if (jobData.matchScore < 70) return 10; // Adaptation: 10h/week
    return 5; // Refinement: 5h/week
  }, [jobData.matchScore]);

  // Estimate total hours based on number of selected courses and steps
  const totalHours = useMemo(() => {
    const avgHoursPerCourse = 160; // Average ~4 months per course at 10h/week
    return totalSelectedCourses * avgHoursPerCourse;
  }, [totalSelectedCourses]);

  const estimatedWeeks = useMemo(() =>
    Math.ceil(totalHours / timeCommitmentHours),
    [totalHours, timeCommitmentHours]
  );

  // Calculate estimated months
  const estimatedMonths = useMemo(() => Math.ceil(estimatedWeeks / 4), [estimatedWeeks]);

  const handleCreatePlan = async () => {
    if (totalSelectedCourses === 0) {
      setError('Välj minst en utbildning för din plan');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Convert Sets to arrays for API
      const selectedCoursesData = {
        step1: Array.from(selectedCoursesByStep.step1),
        step2: Array.from(selectedCoursesByStep.step2),
        step3: Array.from(selectedCoursesByStep.step3)
      };

      const response = await fetch('/api/learning-plans/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: jobData.jobId,
          title: planTitle,
          targetRole: jobData.targetRole,
          selectedCoursesByStep: selectedCoursesData,
          matchScore: jobData.matchScore
          // learningPath and timeCommitmentHours are now auto-determined by backend
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kunde inte skapa lärandeplan');
      }

      // Success - redirect to the plan
      window.location.href = `/dashboard/learning-plan/${data.planId}`;

    } catch (err: any) {
      console.error('Error creating plan:', err);
      setError(err.message || 'Ett fel uppstod vid skapande av planen');
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                Skapa din utvecklingsplan
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Din väg mot {jobData.targetRole}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Plan Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Namn på din plan
            </label>
            <input
              type="text"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min väg till..."
            />
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200/50 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{totalSelectedCourses}</span>
              </div>
              <p className="text-sm text-gray-600">Valda utbildningar</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200/50 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-gray-900">~{estimatedMonths}mån</span>
              </div>
              <p className="text-sm text-gray-600">Beräknad tid</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200/50 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{timeCommitmentHours}h/v</span>
              </div>
              <p className="text-sm text-gray-600">Per vecka</p>
            </div>
          </div>

          {/* Course Distribution by Step */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Dina valda utbildningar
            </h3>
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Steg 1: Grundkompetens</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCoursesByStep.step1.size} utbildning{selectedCoursesByStep.step1.size !== 1 ? 'ar' : ''}
                    </p>
                  </div>
                  {selectedCoursesByStep.step1.size > 0 && (
                    <Check className="w-6 h-6 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Steg 2: Fördjupning</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCoursesByStep.step2.size} utbildning{selectedCoursesByStep.step2.size !== 1 ? 'ar' : ''}
                    </p>
                  </div>
                  {selectedCoursesByStep.step2.size > 0 && (
                    <Check className="w-6 h-6 text-indigo-600" />
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Steg 3: Specialisering</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCoursesByStep.step3.size} utbildning{selectedCoursesByStep.step3.size !== 1 ? 'ar' : ''}
                    </p>
                  </div>
                  {selectedCoursesByStep.step3.size > 0 && (
                    <Check className="w-6 h-6 text-purple-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Avbryt
            </button>
            <button
              onClick={handleCreatePlan}
              disabled={isCreating || totalSelectedCourses === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md ${
                isCreating || totalSelectedCourses === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
              }`}
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Skapar plan...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  Aktivera min plan
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPlanCreator;