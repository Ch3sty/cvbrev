'use client';

/**
 * Utvecklingsfliken: sektionsetikett och en panel per test med försök.
 * Personlighetsresultatet bor på Tester-fliken, inte här.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import EmptyState from '@/components/shell/EmptyState';
import { IlluTomTester } from '@/components/illustrations/EmptyStateIllustrations';
import TestProgressCard from './TestProgressCard';
import { ALL_COGNITIVE_TESTS } from './testCatalog';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';
import PaywallCard from '@/components/paywall/PaywallCard';
import type { Scope } from '@/lib/access/features';

interface Props {
  perTest: Record<TestSlug, PerTestStats>;
  /**
   * Sann när kontot har featuren test_history. Serverhämtningen har redan
   * trimmat serien till senaste sessionen när den är falsk, så den här
   * flaggan styr bara om vi säger varför (avsnitt 4).
   */
  hasHistory?: boolean;
  scope?: Scope | null;
}

export default function DevelopmentView({
  perTest,
  hasHistory = true,
  scope = null,
}: Props) {
  const testedCognitive = ALL_COGNITIVE_TESTS.filter((t) => perTest[t.slug]?.attempts > 0);

  // Hjälpredan Kom igång: brickan Din kurva kvitteras när fliken faktiskt
  // visar en serie, alltså med historik och minst ett gjort test. En vy,
  // ingen skrivning, så fliken anmäler sig själv. Tyst vid fel.
  useEffect(() => {
    if (!hasHistory || testedCognitive.length === 0) return;
    void fetch('/api/onboarding/komigang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'kurva' }),
    }).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHistory]);

  // Utvecklingsvyn handlar om kognitiva test där poäng kan följas över tid.
  if (testedCognitive.length === 0) {
    return (
      <div className="animate-thread-enter">
        <EmptyState
          illustration={IlluTomTester}
          title="Din utveckling visas här"
          description="Gör ett test så ritar vi upp hur dina resultat rör sig över tid, test för test."
          action={
            <Link
              href="/dashboard/tester/matrislogik-grund"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto"
            >
              Gör ditt första test
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <section className="animate-thread-enter space-y-2" aria-labelledby="utveckling-etikett">
      <div>
        <h2 id="utveckling-etikett" className="text-sm font-medium text-ink-3">
          Din utveckling
        </h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          {hasHistory
            ? 'Varje punkt är ett försök. Linjen visar hur dina resultat rör sig över tid.'
            : 'Du ser ditt senaste försök per test. Hela serien ingår i Träningspaketet.'}
        </p>
      </div>

      {hasHistory ? null : (
        <PaywallCard variant="historik" feature="test_history" scope={scope} bare />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {testedCognitive.map((def, i) => (
          <TestProgressCard key={def.slug} def={def} stats={perTest[def.slug]} index={i} />
        ))}
      </div>
    </section>
  );
}
