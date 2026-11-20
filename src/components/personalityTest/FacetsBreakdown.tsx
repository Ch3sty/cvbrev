'use client';

import { Microscope, TrendingUp, TrendingDown } from '@/components/illustrations/RumIkoner';
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
    <section className="steg s4 space-y-4">
      {/* Topp och botten */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="overflow-hidden rounded-2xl border border-kant bg-papper">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-positiv" strokeWidth={2.5} />
              <span className="text-ey uppercase text-positiv">
                Dina starkaste drag
              </span>
            </div>
            <ul className="space-y-2">
              {top.map((t, i) => (
                <li key={t.facet} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-ink-2">
                    {i + 1}. {FACET_META[t.facet].name}
                  </span>
                  <span className="rounded-full bg-positiv-mjuk px-2 py-0.5 text-xs font-bold tabular-nums text-positiv">
                    {t.score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-kant bg-papper">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-ink-3" strokeWidth={2.5} />
              <span className="text-ey uppercase text-ink-2">
                Mindre framträdande
              </span>
            </div>
            <ul className="space-y-2">
              {bottom.map((b, i) => (
                <li key={b.facet} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-ink-2">
                    {i + 1}. {FACET_META[b.facet].name}
                  </span>
                  <span className="font-bold tabular-nums px-2 py-0.5 rounded-full bg-papper-2 text-ink-2 border border-kant text-xs">
                    {b.score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Alla 30 facetter grupperade per dimension */}
      <div className="overflow-hidden rounded-2xl border border-kant bg-papper">
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-3 mb-5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-papper-2 text-ink-1">
              <Microscope className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div>
              <div className="mb-0.5 text-ey uppercase text-ink-3">
                Djupgående
              </div>
              <h2 className="font-display text-lg font-bold leading-tight text-ink-1 sm:text-xl">
                Alla 30 facetter
              </h2>
              <p className="text-xs sm:text-sm text-ink-2 mt-1">
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
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-3">
                    {meta.name}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {facets.map((facet) => {
                      const score = facetScores[facet] ?? 0;
                      return (
                        <div key={facet} className="bg-papper-2 rounded-xl p-2.5">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-ink-2 truncate">
                              {FACET_META[facet].name}
                            </span>
                            <span className="text-xs font-bold tabular-nums text-ink-1">
                              {score}
                            </span>
                          </div>
                          <div className="h-1 bg-papper rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-koppar" style={{ width: `${score}%` }} />
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
    </section>
  );
}
