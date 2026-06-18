'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LineChart, ArrowRight, UserCircle2, CheckCircle2 } from 'lucide-react';
import TestProgressCard from './TestProgressCard';
import { ALL_COGNITIVE_TESTS, PERSONALITY_TESTS } from './testCatalog';
import { EmptyStateIllustration } from './illustrations/TesterHubIcons';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';
import type { PersonalityTestStats } from '@/hooks/use-personality-test-stats';

interface Props {
  perTest: Record<TestSlug, PerTestStats>;
  personality: PersonalityTestStats;
}

export default function DevelopmentView({ perTest, personality }: Props) {
  const testedCognitive = ALL_COGNITIVE_TESTS.filter((t) => perTest[t.slug]?.attempts > 0);
  const hasAnyPersonality =
    personality.grund.hasProfile || personality.avancerad.hasProfile;

  // Visa hela utvecklingsvyn när det finns minst ett kognitivt resultat ELLER
  // en personlighetsprofil. Personlighetskorten visas alltid (klara + tomma).
  const hasAny = testedCognitive.length > 0 || hasAnyPersonality;

  if (!hasAny) {
    return <DevelopmentEmpty />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 sm:space-y-6"
    >
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
          <LineChart className="w-3.5 h-3.5" strokeWidth={2.5} />
          Din utveckling
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Så har du förbättrats
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Varje stapel är ett försök. Linjen visar hur dina resultat rör sig över tid.
        </p>
      </div>

      {testedCognitive.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {testedCognitive.map((def, i) => (
            <TestProgressCard key={def.slug} def={def} stats={perTest[def.slug]} index={i} />
          ))}
        </div>
      )}

      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-3">
          Personlighetstest
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {PERSONALITY_TESTS.map((def) => {
            const stat =
              def.slug === 'personlighet-grund' ? personality.grund : personality.avancerad;
            return (
              <PersonalityProgressCard
                key={def.slug}
                slug={def.slug}
                levelLabel={def.levelLabel}
                hasProfile={stat.hasProfile}
                attempts={stat.attempts}
                lastCompletedAt={stat.lastCompletedAt}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function PersonalityProgressCard({
  slug,
  levelLabel,
  hasProfile,
  attempts,
  lastCompletedAt,
}: {
  slug: string;
  levelLabel: string;
  hasProfile: boolean;
  attempts: number;
  lastCompletedAt: string | null;
}) {
  return (
    <div
      className={`relative bg-white rounded-3xl overflow-hidden p-4 sm:p-5 border ${
        hasProfile ? 'border-orange-100' : 'border-dashed border-slate-200'
      }`}
      style={
        hasProfile
          ? { boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }
          : undefined
      }
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{
          background: hasProfile
            ? 'linear-gradient(90deg, #FB923C, #DC2626)'
            : 'linear-gradient(90deg, #CBD5E1, #94A3B8)',
        }}
      />
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            hasProfile ? 'bg-orange-50' : 'bg-slate-100'
          }`}
        >
          <UserCircle2
            className={`w-5 h-5 ${hasProfile ? 'text-orange-600' : 'text-slate-400'}`}
            strokeWidth={2}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 leading-tight">
            Personlighetstest
          </h3>
          <p className="text-xs text-slate-500">{levelLabel}</p>
        </div>
      </div>

      {hasProfile ? (
        <>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
            <span className="text-xs text-slate-700">
              <span className="font-bold text-slate-900">{attempts}</span>{' '}
              {attempts === 1 ? 'profil klar' : 'profiler klara'}
              {lastCompletedAt && (
                <>
                  {' · senast '}
                  {new Date(lastCompletedAt).toLocaleDateString('sv-SE', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </>
              )}
            </span>
          </div>

          <Link
            href={`/dashboard/tester/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:gap-2 transition-all"
          >
            Visa din profil
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 mb-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Ingen profil än. Gör testet så ser du vad dina svar säger rekryteraren,
              och vad du kan lyfta i intervjun.
            </p>
          </div>

          <Link
            href={`/dashboard/tester/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:gap-2 transition-all"
          >
            Skapa din profil
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </>
      )}
    </div>
  );
}

function DevelopmentEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl border border-orange-200/60 p-6 sm:p-8 text-center"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.12)' }}
    >
      <div className="flex justify-center mb-3">
        <EmptyStateIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
        Din utveckling visas här
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mb-4">
        Gör ett test så börjar vi rita upp hur dina resultat förbättras över tid, test för test.
      </p>
      <Link
        href="/dashboard/tester/matrislogik-grund"
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[44px] touch-manipulation"
        style={{
          background: 'linear-gradient(135deg, #F97316, #DC2626)',
          boxShadow: '0 6px 16px -4px rgba(220, 38, 38, 0.4)',
        }}
      >
        Gör ditt första test
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </Link>
    </motion.div>
  );
}
