'use client';

import { motion } from 'framer-motion';
import { Brain, Calendar, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface CVAnalysis {
  id: string;
  display_name: string;
  created_at: string;
  result: {
    atsFriendliness: {
      score: number;
    };
    skillSuggestions: Array<{
      skill: string;
      relevance: 'high' | 'medium' | 'low';
    }>;
  };
}

interface AnalysisSelectorProps {
  analyses: CVAnalysis[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

const BentoCard = ({ children, className = "", spotlight = false, onClick, ...props }: any) => (
  <motion.div
    className={`
      relative bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50
      shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer
      ${spotlight ? 'ring-2 ring-pink-500/40 shadow-pink-500/20' : ''}
      ${className}
    `}
    onClick={onClick}
    whileHover={{
      scale: 1.02,
      y: -4,
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    {...props}
  >
    {/* Glassmorphism glow effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

    {/* Hover gradient overlay */}
    <div className={`absolute inset-0 transition-all duration-500 pointer-events-none
                    ${spotlight
                      ? 'bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10'
                      : 'bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5'
                    }`}
    />

    {/* Shimmer effect on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                      bg-gradient-to-r from-transparent via-white/20 to-transparent
                      transition-transform duration-1000 ease-out" />
    </div>

    <div className="relative z-10">{children}</div>
  </motion.div>
);

export default function AnalysisSelector({ analyses, selectedId, onSelect, loading }: AnalysisSelectorProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50"
      >
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Inga CV-analyser hittades
        </h3>
        <p className="text-gray-600 mb-6">
          Du behöver först analysera ditt CV för att få jobbmatchningar
        </p>
        <a
          href="/dashboard/cv-analys"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Analysera CV
          <ArrowRight className="w-5 h-5" />
        </a>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {analyses.map((analysis, index) => {
        const isSelected = analysis.id === selectedId;
        const topSkills = analysis.result.skillSuggestions
          ?.filter(s => s.relevance === 'high')
          ?.slice(0, 3) || [];

        return (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <BentoCard
              spotlight={isSelected}
              onClick={() => onSelect(analysis.id)}
            >
              <div className="p-6">
                {/* Selected badge */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full p-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                )}

                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                      {analysis.display_name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDistanceToNow(new Date(analysis.created_at), {
                        addSuffix: true,
                        locale: sv
                      })}
                    </span>
                  </div>
                </div>

                {/* ATS Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">ATS-poäng</span>
                    <span className="text-sm font-bold text-gray-900">
                      {analysis.result.atsFriendliness.score}/100
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.result.atsFriendliness.score}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className={`h-full rounded-full ${
                        analysis.result.atsFriendliness.score >= 70
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : analysis.result.atsFriendliness.score >= 40
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Top Skills */}
                {topSkills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Toppkompetenser</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200"
                        >
                          {skill.skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Select Button */}
                <motion.button
                  onClick={() => onSelect(analysis.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Vald
                    </>
                  ) : (
                    <>
                      Välj denna analys
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </BentoCard>
          </motion.div>
        );
      })}
    </div>
  );
}
