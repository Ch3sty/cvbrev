/**
 * Tratt (spec-admin-tydlighet 2026-09-22, punkt 8 och 11).
 *
 * Ersätter Flöde och Funnel, som svarade på samma fråga med olika tal. En
 * tratt, ett tal per steg, en källa per steg: konton ur profiles, spårval
 * och köpsteg ur PostHog (via admin_flode_daily och admin_funnel_weekly),
 * köp och intäkt ur Stripe.
 *
 * Tre vyer via ?vy=, så att varje vy bara läser det den visar och LCP
 * håller sig under 1,5 sekunder:
 *
 *   kopvag      (standard) köpvägen i ett fönster, var det tar stopp, Kom
 *               igång och förnyelser, intäkt per paket
 *   veckor      vecka för vecka, pågående vecka märkt, per paket
 *   anvandning  funktioner, tester, mallar, kohorter, Datakvalitet
 *
 * Kritiska vägen läser bara Supabase. Stripe ligger i Suspense med
 * reserverad höjd i varje vy.
 */

import PageHeader from '@/components/shell/PageHeader';
import { hamtaUndantagCachad } from '@/lib/admin/metrics';
import { undantagText } from '@/lib/admin/undantag';
import { Flikar, type Vy } from './delar';
import { valjFonster } from './berakning';
import KopvagVy from './KopvagVy';
import VeckorVy from './VeckorVy';
import AnvandningVy from './AnvandningVy';

export const dynamic = 'force-dynamic';

export default async function AdminTrattPage({
  searchParams,
}: {
  searchParams: Promise<{ vy?: string; fonster?: string; veckor?: string }>;
}) {
  const params = await searchParams;
  const vy: Vy = params.vy === 'veckor' || params.vy === 'anvandning' ? params.vy : 'kopvag';
  const u = await hamtaUndantagCachad();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tratt"
        description="Från nytt konto till köp, med en källa per steg: konton ur databasen, spårval och köpsteg ur PostHog, köp ur Stripe."
      >
        <p className="mb-3 text-meta text-ink-3">{undantagText(u)} i alla tal på sidan.</p>
        <Flikar vy={vy} />
      </PageHeader>

      {vy === 'kopvag' ? (
        <KopvagVy fonster={valjFonster(params.fonster)} konton={u.konton} />
      ) : vy === 'veckor' ? (
        <VeckorVy antalVeckor={Number(params.veckor)} konton={u.konton} />
      ) : (
        <AnvandningVy konton={u.konton} />
      )}
    </div>
  );
}
