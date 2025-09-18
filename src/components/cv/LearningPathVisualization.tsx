// src/components/cv/LearningPathVisualization.tsx
'use client';

import React, { useState } from 'react';
import {
  BookOpen, Clock, DollarSign, AlertTriangle, ChevronRight,
  ExternalLink, Target, Award, Users, Calendar, Filter,
  ChevronDown, ChevronUp, Star, TrendingUp
} from 'lucide-react';

interface LearningSuggestion {
  type: 'course' | 'certification' | 'self-study' | 'project';
  title: string;
  provider?: string;
  relevance?: string;
  direct_url?: string;
  duration?: string;
  cost?: string;
  start_date?: string;
  study_format?: string;
  priority?: 'essential' | 'recommended' | 'optional';
  description?: string;
  language?: 'sv' | 'en' | 'other';
}

interface SkillGapWithSuggestions {
  skill: string;
  importance: 'essential' | 'desirable';
  suggestions: LearningSuggestion[];
}

interface LearningPathVisualizationProps {
  matchScore: number;
  cvSummary: string;
  skillGaps: any[];
  learningSuggestions: SkillGapWithSuggestions[];
  targetRole?: string;
}

const LearningPathVisualization: React.FC<LearningPathVisualizationProps> = ({
  matchScore,
  cvSummary,
  skillGaps,
  learningSuggestions,
  targetRole
}) => {
  const [expandedGaps, setExpandedGaps] = useState<Set<number>>(new Set([0])); // First gap expanded by default
  const [filterPriority, setFilterPriority] = useState<'all' | 'essential' | 'desirable'>('all');

  // Toggle gap expansion
  const toggleGap = (index: number) => {
    const newExpanded = new Set(expandedGaps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGaps(newExpanded);
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
    if (score >= 40) return 'text-orange-400 bg-orange-500/20 border-orange-500';
    return 'text-red-400 bg-red-500/20 border-red-500';
  };

  // Get priority badge
  const PriorityBadge = ({ importance }: { importance: string }) => {
    if (importance === 'essential') {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-300 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Kritiskt
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full flex items-center gap-1">
        <Star className="w-3 h-3" />
        Rekommenderat
      </span>
    );
  };

  // Get type icon
  const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'certification':
        return <Award className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'project':
        return <Target className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // Filter suggestions
  const filteredSuggestions = learningSuggestions.filter(gap => {
    if (filterPriority === 'all') return true;
    return gap.importance === filterPriority;
  });

  // Calculate total time and cost
  const calculateTotals = () => {
    let totalWeeks = 0;
    let totalCost = 0;

    learningSuggestions.forEach(gap => {
      gap.suggestions.forEach(suggestion => {
        // Parse duration
        if (suggestion.duration) {
          const duration = suggestion.duration.toLowerCase();
          if (duration.includes('veckor')) {
            const weeks = parseInt(duration.match(/\d+/)?.[0] || '0');
            totalWeeks += weeks;
          } else if (duration.includes('månad')) {
            const months = parseInt(duration.match(/\d+/)?.[0] || '0');
            totalWeeks += months * 4;
          } else if (duration.includes('dag')) {
            const days = parseInt(duration.match(/\d+/)?.[0] || '0');
            totalWeeks += Math.ceil(days / 7);
          }
        }

        // Parse cost
        if (suggestion.cost && suggestion.cost !== 'Gratis') {
          const costMatch = suggestion.cost.match(/\d+[\s]?\d*/);
          if (costMatch) {
            const cost = parseInt(costMatch[0].replace(/\s/g, ''));
            totalCost += cost;
          }
        }
      });
    });

    return { totalWeeks, totalCost };
  };

  const { totalWeeks, totalCost } = calculateTotals();

  return (
    <div className="w-full space-y-6">
      {/* Match Score and Summary */}
      <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Din kompetensmatchning{targetRole ? ` mot ${targetRole}` : ''}
            </h2>
            <p className="text-gray-400 text-sm">Baserat på analys av ditt CV</p>
          </div>
          <div className={`px-6 py-3 rounded-lg border-2 ${getScoreColor(matchScore)}`}>
            <div className="text-3xl font-bold">{matchScore}%</div>
            <div className="text-xs opacity-80">matchning</div>
          </div>
        </div>

        {cvSummary && (
          <div className="bg-navy-900/50 rounded-lg p-4 mt-4">
            <p className="text-gray-300 leading-relaxed">{cvSummary}</p>
          </div>
        )}
      </div>

      {/* Overview Stats */}
      {learningSuggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">{skillGaps.length}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Utvecklingsområden</p>
          </div>

          <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
            <div className="flex items-center justify-between">
              <BookOpen className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {learningSuggestions.reduce((acc, gap) => acc + gap.suggestions.length, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Kurser funna</p>
          </div>

          <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">~{totalWeeks}v</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Total studietid</p>
          </div>

          <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
            <div className="flex items-center justify-between">
              <DollarSign className="w-5 h-5 text-pink-400" />
              <span className="text-2xl font-bold text-white">
                {totalCost > 0 ? `${totalCost.toLocaleString('sv-SE')} kr` : 'Varierar'}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Uppskattad kostnad</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <button
          onClick={() => setFilterPriority('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterPriority === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-navy-800 text-gray-400 hover:text-white'
          }`}
        >
          Alla ({learningSuggestions.length})
        </button>
        <button
          onClick={() => setFilterPriority('essential')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterPriority === 'essential'
              ? 'bg-red-500 text-white'
              : 'bg-navy-800 text-gray-400 hover:text-white'
          }`}
        >
          Kritiska ({learningSuggestions.filter(g => g.importance === 'essential').length})
        </button>
        <button
          onClick={() => setFilterPriority('desirable')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterPriority === 'desirable'
              ? 'bg-blue-500 text-white'
              : 'bg-navy-800 text-gray-400 hover:text-white'
          }`}
        >
          Rekommenderade ({learningSuggestions.filter(g => g.importance === 'desirable').length})
        </button>
      </div>

      {/* Learning Path Cards */}
      <div className="space-y-4">
        {filteredSuggestions.map((gap, index) => (
          <div
            key={index}
            className="bg-navy-800 rounded-lg border border-navy-700 overflow-hidden"
          >
            {/* Gap Header */}
            <button
              onClick={() => toggleGap(index)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-navy-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  gap.importance === 'essential' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  {gap.importance === 'essential' ? <AlertTriangle className="w-4 h-4 text-white" /> : <TrendingUp className="w-4 h-4 text-white" />}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">{gap.skill}</h3>
                  <p className="text-sm text-gray-400">
                    {gap.suggestions.length} {gap.suggestions.length === 1 ? 'kurs' : 'kurser'} tillgängliga
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PriorityBadge importance={gap.importance} />
                {expandedGaps.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {expandedGaps.has(index) && (
              <div className="px-6 pb-6 border-t border-navy-700">
                <div className="space-y-3 mt-4">
                  {gap.suggestions.map((suggestion, suggIndex) => (
                    <div
                      key={suggIndex}
                      className="bg-navy-900/50 rounded-lg p-4 hover:bg-navy-900 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-navy-700 rounded-lg">
                            <TypeIcon type={suggestion.type} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{suggestion.title}</h4>
                            {suggestion.provider && (
                              <p className="text-sm text-gray-400 mb-2">{suggestion.provider}</p>
                            )}
                          </div>
                        </div>
                        {suggestion.direct_url && (
                          <a
                            href={suggestion.direct_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Gå till kurs
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Course Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {suggestion.duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            {suggestion.duration}
                          </div>
                        )}
                        {suggestion.cost && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <DollarSign className="w-4 h-4" />
                            {suggestion.cost}
                          </div>
                        )}
                        {suggestion.start_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {suggestion.start_date}
                          </div>
                        )}
                        {suggestion.study_format && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="w-4 h-4" />
                            {suggestion.study_format}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {suggestion.description && (
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {suggestion.description}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* No suggestions fallback */}
                  {gap.suggestions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Inga specifika kurser hittades för detta utvecklingsområde.</p>
                      <p className="text-sm mt-1">Sök själv efter kurser inom "{gap.skill}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredSuggestions.length === 0 && (
        <div className="bg-navy-800 rounded-lg p-12 text-center border border-navy-700">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold text-white mb-2">Inga utvecklingsområden att visa</h3>
          <p className="text-gray-400">
            {filterPriority !== 'all'
              ? 'Prova att ändra filtret för att se fler resultat.'
              : 'Din kompetens matchar redan målrollen mycket bra!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningPathVisualization;