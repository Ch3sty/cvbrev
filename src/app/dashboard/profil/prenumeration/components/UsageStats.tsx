'use client';

/**
 * Kvotöversikt på prenumerationssidan (punkt 1 i
 * docs/plan-inloggat-saljflode.md).
 *
 * Komponenten sa tidigare "Inga gränser" och "Obegränsat" till
 * gratisanvändare som har ett brev per dygn. Det var felaktig information på
 * den enda sida där vi ber om pengar.
 *
 * Siffrorna kommer från /api/quota/summary, samma källa som dashboardens
 * kvotrad. Räknas de på två ställen glider de isär.
 */

import { useEffect, useState } from 'react';
import type { QuotaSummary } from '@/app/api/quota/summary/route';

interface UsageStatsProps {
  /** Sant för premium: då visas använt utan tak. */
  isPremium: boolean;
}

export default function UsageStats({ isPremium }: UsageStatsProps) {
  const [summary, setSummary] = useState<QuotaSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/quota/summary')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('kvotfel'))))
      .then((data: QuotaSummary) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hellre ingen sektion än fel siffror.
  if (failed) return null;

  return (
    <section className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Din användning</h2>
      <p className="text-sm text-neutral-600 mt-1">
        {isPremium
          ? 'Så mycket har du använt. Inga gränser på din plan.'
          : 'Så mycket har du kvar idag. Kvoterna nollställs vid midnatt.'}
      </p>

      <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(summary?.items ?? PLACEHOLDERS).map((item) => {
          const isLoading = !summary;
          const isSpent = !isLoading && item.limit !== null && item.used >= item.limit;
          return (
            <div key={item.key}>
              <dd
                className={`text-lg tabular-nums leading-tight ${
                  isSpent ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-900'
                }`}
              >
                {isLoading ? (
                  <span className="inline-block h-5 w-12 rounded bg-neutral-100" aria-hidden="true" />
                ) : item.limit === null ? (
                  item.used
                ) : (
                  `${item.used} av ${item.limit}`
                )}
              </dd>
              <dt className="text-sm text-neutral-600 mt-0.5">
                {item.label}
                {item.key === 'analysis' && item.limit !== null ? (
                  <span className="text-neutral-500"> (72 h)</span>
                ) : null}
              </dt>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

/** Skelettrader medan svaret hämtas, i rätt ordning så inget hoppar. */
const PLACEHOLDERS: QuotaSummary['items'] = [
  { key: 'letters', label: 'Brev', used: 0, limit: 0 },
  { key: 'analysis', label: 'Analys', used: 0, limit: 0 },
  { key: 'chat', label: 'Chatt', used: 0, limit: 0 },
  { key: 'tests', label: 'Tester', used: 0, limit: 0 },
];
