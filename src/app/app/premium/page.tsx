/**
 * Appens köpvy (docs/plan-app.md, avsnitt 2.6). Proxyn skriver om appens
 * /priser hit, så webbens köpknappar och betalväggar i de delade passen
 * landar här, och svarar på Stripes kassor med /priser. Appen visar aldrig
 * Stripe och länkar aldrig ut till köp.
 *
 * Helskärm utan flikrad, som kontot. Har kontot redan Premium (från webben
 * eller appen) visas läget, inte köpet.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { createServerClient } from '@/lib/supabase/server';
import { hamtaPremiumLage } from '@/lib/mobilapp/kop';
import { PLAN_BY_KEY, SALD_PLAN } from '@/lib/plans/plans';
import { datumText } from '@/lib/traning/rubrik';
import { dagSthlm } from '@/lib/traning/datum';
import { mittTestNamn, mittTestUrPlan } from '@/lib/traning/mittTest';
import FlikInnehall from '@/components/mobilapp/FlikInnehall';
import Tillbaka from '@/components/mobilapp/Tillbaka';
import KopVy from '@/components/mobilapp/kop/KopVy';

export const dynamic = 'force-dynamic';

export default async function Premium() {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');
  const supabase = createServerClient({ cookies: await cookies() });
  const [lage, planRes] = await Promise.all([
    hamtaPremiumLage(supabase, user.id),
    supabase.from('test_planer').select('testtyper, leverantor, variant, mitt_test, mitt_test_variant, extra_typer').eq('user_id', user.id).maybeSingle(),
  ]);
  const plan = (planRes.data ?? null) as Parameters<typeof mittTestUrPlan>[0] & { mitt_test_variant?: string | null };
  const val = mittTestUrPlan(plan);

  return (
    <div className="tk">
      <FlikInnehall>
        <div className="tk-topprad" style={{ paddingLeft: 6 }}>
          <Tillbaka />
          <h1 className="brand" style={{ fontSize: 17 }}>
            Premium
          </h1>
        </div>
        <div className="tk-pad" style={{ paddingTop: 4, paddingBottom: 24 }}>
          <KopVy
            userId={user.id}
            nyckel={process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || null}
            premium={lage.premium}
            kalla={lage.kalla}
            tillText={lage.till ? datumText(dagSthlm(lage.till)) : null}
            prenumeration={lage.prenumeration}
            mittTest={val ? mittTestNamn(val, plan?.mitt_test_variant ?? null) : null}
            pris={PLAN_BY_KEY[SALD_PLAN].amount}
          />
        </div>
      </FlikInnehall>
    </div>
  );
}
