/**
 * Konto och inställningar bakom profilbilden (konceptets kontoVy). Proxyn
 * skriver om appens /dashboard/installningar hit. Allt på en skärm, inga
 * undermenyer, ingen flikrad.
 *
 * Premium visas med källan: köpt i Google Play hanteras i Play (knappen
 * öppnar Play-appens prenumerationer), köpt på webben hanteras på
 * jobbcoach.ai. Appen visar aldrig Stripe. Påminnelsen sparas i app_enheter
 * (docs/plan-app.md 2.7), och "Se Premium" går till appens köpvy via /priser.
 */
import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { createServerClient } from '@/lib/supabase/server';
import { hamtaPremiumLage } from '@/lib/mobilapp/kop';
import { rensaTid } from '@/lib/mobilapp/notis';
import { datumText } from '@/lib/traning/rubrik';
import { dagSthlm } from '@/lib/traning/datum';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import { deltesterForPlan, mittTestNamn, mittTestUrPlan } from '@/lib/traning/mittTest';
import { appPlattform, appVersion } from '@/lib/mobilapp/appvag';
import FlikInnehall from '@/components/mobilapp/FlikInnehall';
import KontoHandlingar from '@/components/mobilapp/KontoHandlingar';
import Tillbaka from '@/components/mobilapp/Tillbaka';
import HanteraPlay from '@/components/mobilapp/kop/HanteraPlay';
import PaminnelseRad from '@/components/mobilapp/notiser/PaminnelseRad';
import { initialer } from '@/components/mobilapp/Topprad';
import { IkonChev, TypIkon } from '@/components/mobilapp/ikoner';

const KALLA: Record<string, string> = { webben: 'Via jobbcoach.ai', play: 'Via Google Play', app_store: 'Via App Store' };
const LEVERANTOR: Record<string, string> = { google: 'Google', apple: 'Apple', email: 'e-post' };

export default async function Konto() {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');
  const supabase = createServerClient({ cookies: await cookies() });
  const [lage, profilRes, planRes, enhetRes, h] = await Promise.all([
    hamtaPremiumLage(supabase, user.id),
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase.from('test_planer').select('testtyper, leverantor, variant, mitt_test, mitt_test_variant, extra_typer, provdatum').eq('user_id', user.id).maybeSingle(),
    supabase.from('app_enheter').select('aktiv, paminnelse_tid, senast_sedd').eq('user_id', user.id).order('senast_sedd', { ascending: false }).limit(1),
    headers(),
  ]);
  const profil = (profilRes.data ?? null) as { full_name?: string | null } | null;
  const enhet = ((enhetRes.data ?? [])[0] ?? null) as { aktiv: boolean; paminnelse_tid: string } | null;
  const plan = (planRes.data ?? null) as Parameters<typeof mittTestUrPlan>[0] & { provdatum?: string | null };

  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  const namn = profil?.full_name || meta?.full_name || meta?.name || null;
  const leverantor = LEVERANTOR[(user.app_metadata as { provider?: string } | undefined)?.provider ?? 'email'] ?? 'e-post';
  const harPremium = lage.premium;
  const tillDag = lage.till ? dagSthlm(lage.till) : null;
  const butik = lage.kalla === 'play' || lage.kalla === 'app_store';
  const val = mittTestUrPlan(plan);
  const ua = h.get('user-agent');
  const plattform = appPlattform(ua) === 'ios' ? 'iOS' : 'Android';

  return (
    <div className="tk">
      <FlikInnehall>
        <div className="tk-topprad" style={{ paddingLeft: 6 }}>
          <Tillbaka />
          <h1 className="brand" style={{ fontSize: 17 }}>
            Konto
          </h1>
        </div>
        <div className="tk-pad tk-stack" style={{ paddingTop: 4 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '6px 2px 4px' }}>
            <span className="tk-avatar" style={{ width: 52, height: 52, fontSize: 20 }}>
              {initialer(namn, user.email)}
            </span>
            <div style={{ minWidth: 0 }}>
              {namn && <p style={{ fontWeight: 700, fontSize: 17 }}>{namn}</p>}
              <p className="tk-meta" style={{ overflowWrap: 'anywhere' }}>
                {user.email} · {leverantor}
              </p>
            </div>
          </div>

          <section className={`tk-kort${harPremium ? ' lyft' : ''}`} aria-label="Premium">
            <p className="tk-ey kop">{harPremium ? 'Premium' : 'Gratis'}</p>
            <p style={{ fontWeight: 600, marginTop: 2 }}>
              {harPremium
                ? [KALLA[lage.kalla ?? ''], tillDag ? `${butik ? 'förnyas' : 'gäller till'} ${datumText(tillDag)}` : null].filter(Boolean).join(', ') || 'Aktivt'
                : 'Nivåkollen och resultaten ingår'}
            </p>
            <p className="tk-meta">
              {!harPremium
                ? 'Passen varje dag ingår i Premium, 149 kr i månaden.'
                : butik
                  ? `Sägs upp i ${lage.kalla === 'play' ? 'Google Play' : 'App Store'}. Gäller även på jobbcoach.ai.`
                  : 'Köpt på jobbcoach.ai och hanteras där, under Prenumeration. Gäller även här, med samma konto.'}
            </p>
            {harPremium && lage.kalla === 'play' && <HanteraPlay />}
            {!harPremium && (
              <Link href="/priser" className="tk-knapp kop liten tk-tryck" style={{ marginTop: 12 }}>
                Se Premium
              </Link>
            )}
          </section>

          <div className="tk-rader">
            <PaminnelseRad aktiv={enhet ? enhet.aktiv : null} tid={rensaTid(enhet?.paminnelse_tid)} tillganglig={!enhetRes.error} />
            <Link href={TRANING_RUTT.installningar} className="tk-rad tk-tryck">
              <span className="tk-sym">
                <TypIkon typ={deltesterForPlan(plan)?.[0] ?? 'plan'} px={40} />
              </span>
              <span className="t">
                <b>Mitt test</b>
                <span>
                  {val ? mittTestNamn(val, plan?.mitt_test_variant ?? null) : 'Inget valt än'}
                  {plan?.provdatum ? `, ${datumText(plan.provdatum)}` : ''}
                </span>
              </span>
              <IkonChev />
            </Link>
          </div>

          <div className="tk-rader">
            <Link href="/kontakt" className="tk-rad tk-tryck">
              <span className="t">
                <b>Hjälp och kontakt</b>
              </span>
              <IkonChev />
            </Link>
            <Link href="/integritetspolicy" className="tk-rad tk-tryck">
              <span className="t">
                <b>Villkor och integritet</b>
              </span>
              <IkonChev />
            </Link>
          </div>

          <KontoHandlingar userId={user.id} epost={user.email ?? null} />

          <p className="tk-meta" style={{ textAlign: 'center' }}>
            Testklar {appVersion(ua) ?? ''} ({plattform}) · från jobbcoach.ai
          </p>
        </div>
      </FlikInnehall>
    </div>
  );
}
