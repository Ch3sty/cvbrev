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
    <section className="rounded-xl border border-kant bg-panel p-4">
      <h2 className="text-kort text-ink-1">Din användning</h2>
      <p className="mt-1 text-sm text-ink-2">
        {isPremium
          ? 'Så mycket har du använt. Inga gränser på din plan.'
          : 'Så mycket har du kvar idag. Kvoterna nollställs vid midnatt.'}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summary.items.map((item) => (
          <div key={item.key}>
            <dd className="text-tal tabular-nums text-ink-1">
              {item.limit === null ? item.used : `${item.used}/${item.limit}`}
            </dd>
            <dt className="mt-0.5 text-meta text-ink-3">
              {item.label}
              {item.key === 'analysis' && item.limit !== null ? ' (72 h)' : null}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
