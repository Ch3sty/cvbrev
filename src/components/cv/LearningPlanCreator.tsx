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
  // learningPath and timeCommitment are now determined automatically based on matchScore
}

const LearningPlanCreator: React.FC<LearningPlanCreatorProps> = ({
  isOpen,
  onClose,
  jobData
}) => {
  const [planTitle, setPlanTitle] = useState(`Min väg till ${jobData.targetRole}`);
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected skills - auto-select based on match score
  useMemo(() => {
    if (!jobData.learningSuggestions) return;

    // Determine strategy based on match score
    const isCareerChange = jobData.matchScore < 40;
    const isAdaptation = jobData.matchScore >= 40 && jobData.matchScore < 70;
    const isRefinement = jobData.matchScore >= 70;

    const skills = jobData.learningSuggestions.map((gap, index) => ({
      id: `skill-${index}`,
      name: gap.skill,
      importance: gap.importance,
      level: index < 3 ? 'foundation' : index < 7 ? 'intermediate' : 'advanced',
      estimatedHours: gap.suggestions?.[0]?.duration
        ? parseInt(gap.suggestions[0].duration.match(/\d+/)?.[0] || '40') * 4
        : 40,
      courses: gap.suggestions?.slice(0, 3).map((s: any) => ({
        title: s.title,
        provider: s.provider,
        url: s.direct_url,
        duration: s.duration,
        cost: s.cost
      })) || [],
      selected: gap.importance === 'essential' ||
                (isCareerChange) ||  // Career change: select all
                (isAdaptation && index < 10) ||  // Adaptation: balanced selection
                (isRefinement && index < 5)  // Refinement: quick selection
    }));

    setSelectedSkills(skills.filter(s => s.selected));
  }, [jobData]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => {
      const skill = jobData.learningSuggestions.find((_, i) => `skill-${i}` === skillId);
      if (!skill) return prev;

      const existing = prev.find(s => s.id === skillId);
      if (existing) {
        return prev.filter(s => s.id !== skillId);
      } else {
        const index = parseInt(skillId.split('-')[1]);
        const gap = jobData.learningSuggestions[index];
        return [...prev, {
          id: skillId,
          name: gap.skill,
          importance: gap.importance,
          level: index < 3 ? 'foundation' : index < 7 ? 'intermediate' : 'advanced',
          estimatedHours: 40,
          courses: gap.suggestions?.slice(0, 3).map((s: any) => ({
            title: s.title,
            provider: s.provider,
            url: s.direct_url,
            duration: s.duration,
            cost: s.cost
          })) || []
        }];
      }
    });
  };

  // Determine automatic time commitment based on match score
  const timeCommitmentHours = useMemo(() => {
    if (jobData.matchScore < 40) return 15; // Career change: 15h/week
    if (jobData.matchScore < 70) return 10; // Adaptation: 10h/week
    return 5; // Refinement: 5h/week
  }, [jobData.matchScore]);

  const totalHours = useMemo(() =>
    selectedSkills.reduce((sum, skill) => sum + skill.estimatedHours, 0),
    [selectedSkills]
  );

  const estimatedWeeks = useMemo(() =>
    Math.ceil(totalHours / timeCommitmentHours),
    [totalHours, timeCommitmentHours]
  );

  const handleCreatePlan = async () => {
    if (selectedSkills.length === 0) {
      setError('Välj minst en kompetens för din plan');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/learning-plans/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: jobData.jobId,
          title: planTitle,
          targetRole: jobData.targetRole,
          selectedSkills
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
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{selectedSkills.length}</span>
              </div>
              <p className="text-sm text-gray-600">Valda kompetenser</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200/50 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-gray-900">~{estimatedWeeks}v</span>
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

          {/* Skills Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Välj kompetenser att inkludera
            </h3>
            <div className="space-y-2">
              {jobData.learningSuggestions.map((gap, index) => {
                const skillId = `skill-${index}`;
                const isSelected = selectedSkills.some(s => s.id === skillId);

                return (
                  <div
                    key={skillId}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSkill(skillId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{gap.skill}</h4>
                          {gap.importance === 'essential' && (
                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded font-medium">
                              Kritisk
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {gap.suggestions?.length || 0} kurser tillgängliga
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
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
              disabled={isCreating || selectedSkills.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md ${
                isCreating || selectedSkills.length === 0
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