'use client';

import { motion } from 'framer-motion';
import { Microscope, TrendingUp, TrendingDown } from 'lucide-react';
import {
  DIMENSION_META,
  FACET_META,
  topFacets,
  bottomFacets,
} from '@/lib/personalityTest/insights';
import type { Dimension, Facet, FacetScores } from '@/lib/personalityTest/types';

interface FacetsBreakdownProps {
  facetScores: FacetScores;
}

const DIMENSION_FACETS: Record<Dimension, Facet[]> = {
  neuroticism: ['n1_anxiety', 'n2_anger', 'n3_depression', 'n4_self_consciousness', 'n5_immoderation', 'n6_vulnerability'],
  extraversion: ['e1_friendliness', 'e2_gregariousness', 'e3_assertiveness', 'e4_activity_level', 'e5_excitement_seeking', 'e6_cheerfulness'],
  openness: ['o1_imagination', 'o2_artistic_interests', 'o3_emotionality', 'o4_adventurousness', 'o5_intellect', 'o6_liberalism'],
  agreeableness: ['a1_trust', 'a2_morality', 'a3_altruism', 'a4_cooperation', 'a5_modesty', 'a6_sympathy'],
  conscientiousness: ['c1_self_efficacy', 'c2_orderliness', 'c3_dutifulness', 'c4_achievement_striving', 'c5_self_discipline', 'c6_cautiousness'],
};

const ORDER: Dimension[] = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
];

export default function FacetsBreakdown({ facetScores }: FacetsBreakdownProps) {
  const top = topFacets(facetScores, 5);
  const bottom = bottomFacets(facetScores, 5);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4 }}
      className="space-y-4"
    >
      {/* Topp och botten */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl border border-emerald-100 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Dina starkaste drag
              </span>
            </div>
            <ul className="space-y-2">
              {top.map((t, i) => (
                <li key={t.facet} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-slate-700">
                    {i + 1}. {FACET_META[t.facet].name}
                  </span>
                  <span className="font-bold tabular-nums px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                    {t.score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                Mindre framträdande
              </span>
            </div>
            <ul className="space-y-2">
              {bottom.map((b, i) => (
                <li key={b.facet} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-slate-700">
                    {i + 1}. {FACET_META[b.facet].name}
                  </span>
                  <span className="font-bold tabular-nums px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-xs">
                    {b.score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Alla 30 facetter grupperade per dimension */}
      <div className="bg-white rounded-3xl border border-orange-100 overflow-hidden"
        style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}>
        <div className="h-1"
          style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }} />
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-3 mb-5">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.4)',
              }}
            >
              <Microscope className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
                Djupgående
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Alla 30 facetter
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Underliggande drag som tillsammans bildar din Big Five-profil.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {ORDER.map((dim) => {
              const meta = DIMENSION_META[dim];
              const facets = DIMENSION_FACETS[dim];
              return (
                <div key={dim}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-orange-700 mb-2">
                    {meta.name}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {facets.map((facet) => {
                      const score = facetScores[facet] ?? 0;
                      return (
                        <div key={facet} className="bg-slate-50 rounded-xl p-2.5">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-700 truncate">
                              {FACET_META[facet].name}
                            </span>
                            <span className="text-xs font-bold tabular-nums text-slate-900">
                              {score}
                            </span>
                          </div>
                          <div className="h-1 bg-white rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${score}%`,
                                background:
                                  'linear-gradient(90deg, #FB923C, #DC2626)',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
