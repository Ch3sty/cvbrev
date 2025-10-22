// src/components/cv/LearningPathVisualization.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen, Clock, DollarSign, AlertTriangle, ChevronRight,
  ExternalLink, Target, Award, Users, Calendar, Filter,
  ChevronDown, ChevronUp, Star, TrendingUp, Map, TreePine, BookOpenCheck
} from 'lucide-react';
import LearningJourneyDashboard from './LearningJourneyDashboard';
import SkillTreeVisualization from './SkillTreeVisualization';
import { prioritizeCourses, getCourseBadges } from '@/lib/learning/course-prioritization';
import type { Course } from '@/lib/learning/course-prioritization';

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
  jobId?: string;
}

const LearningPathVisualization: React.FC<LearningPathVisualizationProps> = ({
  matchScore,
  cvSummary,
  skillGaps,
  learningSuggestions,
  targetRole,
  jobId
}) => {
  const [expandedGaps, setExpandedGaps] = useState<Set<number>>(new Set([0])); // First gap expanded by default
  const [filterPriority, setFilterPriority] = useState<'all' | 'essential' | 'desirable'>('all');
  const [activeTab, setActiveTab] = useState<'journey' | 'skills' | 'courses'>('journey');

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
  const TypeIcon = ({ type }: { type?: string }) => {
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

  // Filter and prioritize suggestions
  const filteredSuggestions = useMemo(() => {
    const filtered = learningSuggestions.filter(gap => {
      if (filterPriority === 'all') return true;
      return gap.importance === filterPriority;
    });

    // Sort suggestions within each gap using prioritizeCourses
    return filtered.map(gap => ({
      ...gap,
      suggestions: prioritizeCourses(
        gap.suggestions.map(s => ({
          ...s,
          cost: s.cost || '',
          duration: s.duration || '',
          provider: s.provider || '',
        })) as Course[],
        matchScore
      )
    }));
  }, [learningSuggestions, filterPriority, matchScore]);

  // Calculate total time and cost (using MINIMUM per gap, not SUM of all alternatives)
  const calculateTotals = () => {
    let totalWeeks = 0;
    let minTotalCost = 0;
    let maxTotalCost = 0;

    learningSuggestions.forEach(gap => {
      let minCostForGap = Infinity;
      let maxCostForGap = 0;
      let minWeeksForGap = Infinity;

      // Find the cheapest and most expensive option for this gap
      gap.suggestions.forEach(suggestion => {
        // Parse duration - find shortest option
        if (suggestion.duration) {
          const duration = suggestion.duration.toLowerCase();
          let weeks = 0;

          if (duration.includes('veckor')) {
            weeks = parseInt(duration.match(/\d+/)?.[0] || '0');
          } else if (duration.includes('månad')) {
            const months = parseInt(duration.match(/\d+/)?.[0] || '0');
            weeks = months * 4;
          } else if (duration.includes('dag')) {
            const days = parseInt(duration.match(/\d+/)?.[0] || '0');
            weeks = Math.ceil(days / 7);
          } else if (duration.includes('år')) {
            const years = parseInt(duration.match(/\d+/)?.[0] || '0');
            weeks = years * 52;
          }

          if (weeks > 0 && weeks < minWeeksForGap) {
            minWeeksForGap = weeks;
          }
        }

        // Parse cost - track both min and max
        let cost = 0;
        if (suggestion.cost) {
          if (suggestion.cost.toLowerCase() === 'gratis') {
            cost = 0;
          } else {
            const costMatch = suggestion.cost.match(/\d+[\s]?\d*/);
            if (costMatch) {
              cost = parseInt(costMatch[0].replace(/\s/g, ''));
            }
          }
        }

        if (cost < minCostForGap) minCostForGap = cost;
        if (cost > maxCostForGap) maxCostForGap = cost;
      });

      // Add the minimum cost and time for this gap
      if (minCostForGap !== Infinity) {
        minTotalCost += minCostForGap;
      }
      if (maxCostForGap > 0) {
        maxTotalCost += maxCostForGap;
      }
      if (minWeeksForGap !== Infinity) {
        totalWeeks += minWeeksForGap;
      }
    });

    return {
      totalWeeks,
      minTotalCost,
      maxTotalCost,
      hasAlternatives: learningSuggestions.some(gap => gap.suggestions.length > 1)
    };
  };

  const { totalWeeks, minTotalCost, maxTotalCost, hasAlternatives } = calculateTotals();

  return (
    <div className="w-full space-y-6">
      {/* Match Score and Summary */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Din kompetensmatchning{targetRole ? ` mot ${targetRole}` : ''}
            </h2>
            <p className="text-gray-600 text-sm">Baserat på analys av ditt CV</p>
          </div>
          <div className={`px-6 py-3 rounded-lg border-2 ${getScoreColor(matchScore)}`}>
            <div className="text-3xl font-bold">{matchScore}%</div>
            <div className="text-xs opacity-80">matchning</div>
          </div>
        </div>

        {cvSummary && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-gray-700 leading-relaxed">{cvSummary}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-200/50 shadow-xl">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('journey')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'journey'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Map className="w-5 h-5" />
            <span>Utvecklingsresa</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'skills'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <TreePine className="w-5 h-5" />
            <span>Kompetensträd</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'courses'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BookOpenCheck className="w-5 h-5" />
            <span>Alla kurser</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'journey' && (
        <LearningJourneyDashboard
          skillGaps={skillGaps}
          learningSuggestions={learningSuggestions}
          targetRole={targetRole || ''}
          matchScore={matchScore}
          jobId={jobId}
        />
      )}

      {activeTab === 'skills' && (
        <SkillTreeVisualization
          skillGaps={skillGaps}
          learningSuggestions={learningSuggestions}
          targetRole={targetRole || ''}
        />
      )}

      {activeTab === 'courses' && (
        <>
          {/* Overview Stats */}
          {learningSuggestions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{skillGaps.length}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Utvecklingsområden</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between">
              <BookOpen className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {learningSuggestions.reduce((acc, gap) => acc + gap.suggestions.length, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Kurser funna</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">~{totalWeeks}v</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Total studietid</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">
                {minTotalCost === 0 && maxTotalCost === 0 ? 'Varierar' :
                 minTotalCost === maxTotalCost ? `${minTotalCost.toLocaleString('sv-SE')} kr` :
                 `${minTotalCost.toLocaleString('sv-SE')} - ${maxTotalCost.toLocaleString('sv-SE')} kr`}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Uppskattad kostnad</p>
          </div>
        </div>
          )}

          {/* Filter */}
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <button
              onClick={() => setFilterPriority('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterPriority === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              Alla ({learningSuggestions.length})
            </button>
            <button
              onClick={() => setFilterPriority('essential')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterPriority === 'essential'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              Kritiska ({learningSuggestions.filter(g => g.importance === 'essential').length})
            </button>
            <button
              onClick={() => setFilterPriority('desirable')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterPriority === 'desirable'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
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
                className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden"
              >
                {/* Gap Header */}
                <button
                  onClick={() => toggleGap(index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      gap.importance === 'essential' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {gap.importance === 'essential' ? <AlertTriangle className="w-4 h-4 text-white" /> : <TrendingUp className="w-4 h-4 text-white" />}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{gap.skill}</h3>
                      <p className="text-sm text-gray-600">
                        {gap.suggestions.length} {gap.suggestions.length === 1 ? 'kurs' : 'kurser'} tillgängliga
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge importance={gap.importance} />
                    {expandedGaps.has(index) ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedGaps.has(index) && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <div className="space-y-3 mt-4">
                      {gap.suggestions.map((suggestion, suggIndex) => (
                        <div
                          key={suggIndex}
                          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <TypeIcon type={suggestion.type} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                              {getCourseBadges(suggestion as Course).map((badge, idx) => (
                                <span key={idx} className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  badge === 'Gratis' || badge.includes('CSN') ? 'bg-green-100 text-green-700' :
                                  badge === 'Komvux' || badge === 'Högskola' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {badge}
                                </span>
                              ))}
                            </div>
                            {suggestion.provider && (
                              <p className="text-sm text-gray-600 mb-2">{suggestion.provider}</p>
                            )}
                          </div>
                        </div>
                        {suggestion.direct_url && (
                          <a
                            href={suggestion.direct_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                          >
                            Gå till kurs
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Course Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {suggestion.duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {suggestion.duration}
                          </div>
                        )}
                        {suggestion.cost && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-indigo-600 font-medium">{suggestion.cost.replace(/^\$\s*/, '')}</span>
                          </div>
                        )}
                        {suggestion.start_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {suggestion.start_date}
                          </div>
                        )}
                        {suggestion.study_format && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            {suggestion.study_format}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {suggestion.description && (
                        <p className="text-sm text-gray-700 leading-relaxed">
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
        </>
      )}
    </div>
  );
};

export default LearningPathVisualization;