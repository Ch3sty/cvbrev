'use client';

/**
 * Kvotöversikt på prenumerationssidan (punkt 1 i
 * docs/plan-inloggat-saljflode.md).
 *
 * Komponenten sa tidigare "Inga gränser" och "Obegränsat" till
 * gratisanvändare som har ett brev per dygn. Det var felaktig information på
 * den enda sida där vi ber om pengar.
 *
 * Siffrorna kommer från samma uträkning som /api/quota/summary, numera hämtad
 * på servern och skickad hit som prop. Räknas de på två ställen glider de
 * isär. Förut fetchade komponenten själv efter hydrering, vilket både kostade
 * en rundtur och flyttade sidan när skelettsiffrorna byttes mot riktiga.
 */

import type { QuotaSummary } from '@/lib/quota/getQuotaSummary';

interface UsageStatsProps {
  /** Sant för premium: då visas använt utan tak. */
  isPremium: boolean;
  /** Kvoterna, hämtade på servern. null betyder att hämtningen gick fel. */
  summary: QuotaSummary | null;
}

export default function UsageStats({ isPremium, summary }: UsageStatsProps) {
  // Hellre ingen sektion än fel siffror.
  if (!summary) return null;

  return (
    <section className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Din användning</h2>
      <p className="text-sm text-neutral-600 mt-1">
        {isPremium
          ? 'Så mycket har du använt. Inga gränser på din plan.'
          : 'Så mycket har du kvar idag. Kvoterna nollställs vid midnatt.'}
      </p>

      <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summary.items.map((item) => {
          const isSpent = item.limit !== null && item.used >= item.limit;
          return (
            <div key={item.key}>
              <dd
                className={`text-lg tabular-nums leading-tight ${
                  isSpent ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-900'
                }`}
              >
                {item.limit === null ? item.used : `${item.used} av ${item.limit}`}
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
