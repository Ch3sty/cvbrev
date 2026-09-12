'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PersonalityProfileIllustration } from './illustrations/TesterHubIcons';
import { DIMENSION_META } from '@/lib/personalityTest/insights';
import type { PersonalityTestStats } from '@/hooks/use-personality-test-stats';

const ORDER = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
] as const;

interface Props {
  personality: PersonalityTestStats;
  index?: number;
}

/**
 * Tredje kortet i personlighetsraden: visar användarens faktiska resultat.
 * Speglar den "bästa" profilen (avancerad om den finns, annars grund). Har profil
 * -> mini Big Five + länk till hela analysen. Ingen profil -> tom-state med CTA.
 */
export default function PersonalityResultCard({ personality, index = 0 }: Props) {
  // Avancerad väger tyngst om den finns, annars grund.
  const source = personality.avancerad.hasProfile ? 'avancerad' : 'grund';
  const stat = source === 'avancerad' ? personality.avancerad : personality.grund;
  const hasProfile = stat.hasProfile && !!stat.latestScores;

  const resultsHref =
    hasProfile && stat.latestSessionId
      ? `/dashboard/tester/personlighet-${source}/test/${stat.latestSessionId}/results`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.04 }}
    >
      {hasProfile && resultsHref ? (
        <Link
          href={resultsHref}
          className="group relative block bg-white rounded-xl border border-orange-100 overflow-hidden transition-all hover:-translate-y-0.5 hover:border-orange-200 touch-manipulation h-full"
        >
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-3 mb-3">
              <PersonalityProfileIllustration className="w-11 h-11 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700 mb-0.5">
                  Resultat
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                  Ditt testresultat
                </h3>
                <p className="text-xs sm:text-xs text-neutral-400 leading-tight">
                  Vad personlighetstestet visar
                </p>
              </div>
            </div>

            {/* Mini Big Five */}
            <div className="space-y-1.5 mb-3">
              {ORDER.map((dim) => {
                const score = stat.latestScores?.[dim] ?? 0;
                return (
                  <div key={dim} className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 w-20 flex-shrink-0 truncate">
                      {DIMENSION_META[dim].name}
                    </span>
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-600"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-700 tabular-nums w-6 text-right">
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-700">
                Se hela analysen
              </span>
              <ArrowRight
                className="w-4 h-4 text-orange-700 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </Link>
      ) : (
        <div
          className="relative bg-white rounded-xl border border-dashed border-neutral-200 overflow-hidden h-full"
        >
          <div className="p-3 sm:p-4 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <PersonalityProfileIllustration className="w-11 h-11 flex-shrink-0 opacity-70 grayscale" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 mb-0.5">
                  Resultat
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                  Inget resultat än
                </h3>
                <p className="text-xs sm:text-xs text-neutral-400 leading-tight">
                  Gör personlighetstestet
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-3 flex-1">
              Gör personlighetstestet så ritar vi upp din profil och visar vad dina svar
              berättar för en rekryterare, och vad du själv kan lyfta i intervjun.
            </p>

            <Link
              href="/dashboard/tester/personlighet-grund"
              className="inline-flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition-all hover:-translate-y-0.5 min-h-[44px] touch-manipulation bg-orange-600 hover:bg-orange-700"
            >
              Skapa din profil
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}
