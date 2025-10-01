// src/components/cv/analysis/UnifiedATSSection.tsx
/**
 * Unified ATS Section Component
 * Combines ATS score circle, improvement stats, progression bar, and value insights
 * Follows jobbcoach.ai light theme design system
 */
'use client';

import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface UnifiedATSSectionProps {
  atsScore: number;
  totalImprovements: number;
  sectionsToImprove: number;
  currentScore: number;
  potentialScore: number;
  feedback?: string;
  valueInsights?: string[];
}

export function UnifiedATSSection({
  atsScore,
  totalImprovements,
  sectionsToImprove,
  currentScore,
  potentialScore,
  feedback,
  valueInsights
}: UnifiedATSSectionProps) {
  // Determine color based on ATS score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  const progressPercentage = (potentialScore / 100) * 100;
  const currentPercentage = (currentScore / 100) * 100;
  const improvement = potentialScore - currentScore;

  return (
    <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white border border-slate-200 shadow-lg">
      <div className="p-6">
        {/* Header: Score Circle + Stats Grid */}
        <div className="flex items-center gap-8 mb-6">
          {/* ATS Circle */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                className="stroke-slate-200"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                className={getStrokeColor(atsScore)}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(atsScore / 100) * 220} 220`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(atsScore)}`}>
                {atsScore}
              </span>
              <span className="text-xs text-slate-600">av 100</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            <div>
              <div className="text-3xl font-bold text-slate-900">
                {totalImprovements}
              </div>
              <div className="text-sm text-slate-600">
                förbättringar identifierade
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">
                {sectionsToImprove}
              </div>
              <div className="text-sm text-slate-600">
                sektioner att förbättra
              </div>
            </div>
          </div>
        </div>

        {/* Progression Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Nuvarande: {currentScore}
            </span>
            <span className="text-sm font-bold text-green-600">
              Potential: {potentialScore} (+{improvement})
            </span>
          </div>
          <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
            {/* Current score background */}
            <div
              className="absolute h-full bg-slate-400 rounded-full transition-all duration-500"
              style={{ width: `${currentPercentage}%` }}
            />
            {/* Potential score gradient */}
            <div
              className="absolute h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <p className="text-sm text-slate-700 mb-4 leading-relaxed">
            {feedback}
          </p>
        )}

        {/* Value Insights */}
        {valueInsights && valueInsights.length > 0 && (
          <div className="grid gap-2">
            {valueInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{insight}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
