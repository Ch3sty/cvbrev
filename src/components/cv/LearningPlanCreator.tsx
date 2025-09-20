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
  learningPath: 'quick' | 'balanced' | 'comprehensive';
  timeCommitment: number;
}

const LearningPlanCreator: React.FC<LearningPlanCreatorProps> = ({
  isOpen,
  onClose,
  jobData,
  learningPath,
  timeCommitment
}) => {
  const [planTitle, setPlanTitle] = useState(`Min väg till ${jobData.targetRole}`);
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected skills based on learning path
  useMemo(() => {
    if (!jobData.learningSuggestions) return;

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
                (learningPath === 'comprehensive') ||
                (learningPath === 'balanced' && index < 10) ||
                (learningPath === 'quick' && index < 5)
    }));

    setSelectedSkills(skills.filter(s => s.selected));
  }, [jobData, learningPath]);

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

  const totalHours = useMemo(() =>
    selectedSkills.reduce((sum, skill) => sum + skill.estimatedHours, 0),
    [selectedSkills]
  );

  const estimatedWeeks = useMemo(() =>
    Math.ceil(totalHours / timeCommitment),
    [totalHours, timeCommitment]
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
          learningPath,
          timeCommitmentHours: timeCommitment,
          selectedSkills
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-navy-800 border-b border-navy-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Skapa din lärandeplan
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Anpassa din väg mot {jobData.targetRole}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Plan Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Namn på din plan
            </label>
            <input
              type="text"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Min väg till..."
            />
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-navy-900 rounded-lg p-4 border border-navy-700">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">{selectedSkills.length}</span>
              </div>
              <p className="text-sm text-gray-400">Valda kompetenser</p>
            </div>
            <div className="bg-navy-900 rounded-lg p-4 border border-navy-700">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">~{estimatedWeeks}v</span>
              </div>
              <p className="text-sm text-gray-400">Beräknad tid</p>
            </div>
            <div className="bg-navy-900 rounded-lg p-4 border border-navy-700">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">{timeCommitment}h/v</span>
              </div>
              <p className="text-sm text-gray-400">Per vecka</p>
            </div>
          </div>

          {/* Skills Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
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
                        ? 'bg-navy-700 border-pink-500'
                        : 'bg-navy-900/50 border-navy-700 hover:border-navy-600'
                    }`}
                    onClick={() => toggleSkill(skillId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{gap.skill}</h4>
                          {gap.importance === 'essential' && (
                            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-300 rounded">
                              Kritisk
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {gap.suggestions?.length || 0} kurser tillgängliga
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-pink-500 border-pink-500'
                          : 'border-gray-600'
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
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-navy-800 border-t border-navy-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Avbryt
            </button>
            <button
              onClick={handleCreatePlan}
              disabled={isCreating || selectedSkills.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isCreating || selectedSkills.length === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
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
                  Skapa lärandeplan
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