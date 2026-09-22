/**
 * Prenumeration: en vy, tre tillstånd
 * (docs/plan-paket-och-onboarding.md, Fas 2D avsnitt 3).
 *
 * Gratis, spår och Allt. Skelettet är detsamma i alla tre: sidhuvud, en
 * statusrad som säger läget, en panel som säger vad hon har, noll till en
 * panel som föreslår nästa steg, och en hanteringslista. Skillnaden ligger i
 * panelernas innehåll, inte i hur sidan är byggd.
 *
 * Allt kommer serverrenderat, blockeringslistan likaså. Ingen panel hämtar
 * sig själv efter mount, eftersom LCP-budgeten är 1,0 s och ett kort som
 * byts ut efter hydrering är sidans layoutförskjutning.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createServerClient } from '@/lib/supabase/server';
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { isPlanKey, type PlanKey } from '@/lib/plans/plans';
import type { Scope } from '@/lib/access/features';
import { lasBlockeringar, foreslaPaket, type Blockeringar } from './blockeringar';
import PrenumerationClient from './PrenumerationClient';

interface SubscriptionProfile {
  subscription_tier?: string | null;
  premium_until?: string | null;
  premium_source?: string | null;
  premium_scope?: string | null;
  subscription_id?: string | null;
  subscription_status?: string | null;
  onboarding_track?: string | null;
}

function lasTrack(varde: unknown): Scope | null {
  return varde === 'cv' || varde === 'tester' || varde === 'allt' ? varde : null;
}

/**
 * Paketet den betalande kunden faktiskt har.
 *
 * Scopet säger spåret, inte längden. Längden ligger i prenumerationens
 * prisid, och den läses av Stripe-vyn. Här räcker scopet plus längden ur
 * premium_until: den som förnyas om mindre än tio dagar har en vecka, resten
 * en månad eller ett kvartal. Saknas underlag faller vi tillbaka på veckan,
 * som är det de flesta har.
 */
function harPaket(scope: Scope | null, premiumUntil: Date | null): PlanKey | null {
  if (!scope) return null;
  if (scope === 'cv') return 'cv_week';
  if (scope === 'tester') return 'test_week';

  if (!premiumUntil) return 'all_week';
  const dagar = (premiumUntil.getTime() - Date.now()) / 86400000;
  if (dagar <= 1.5) return 'all_day';
  if (dagar <= 10) return 'all_week';
  if (dagar <= 45) return 'all_month';
  return 'all_quarter';
}

export default async function PrenumerationPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let profile: SubscriptionProfile | null = null;
  let scope: Scope | null = null;

  const [profileRes, scopeRes] = await Promise.allSettled([
    supabase
      .from('profiles')
      .select(
        'subscription_tier, premium_until, premium_source, premium_scope, subscription_id, subscription_status, onboarding_track'
      )
      .eq('id', user.id)
      .maybeSingle(),
    getUserScope(supabase, user.id),
  ]);

  if (profileRes.status === 'fulfilled') {
    profile = (profileRes.value.data ?? null) as SubscriptionProfile | null;
  } else {
    console.error('Fel vid server-hämtning av prenumerationsprofilen:', profileRes.reason);
  }

  if (scopeRes.status === 'fulfilled') {
    scope = scopeRes.value;
  } else {
    console.error('Fel vid server-hämtning av scope:', scopeRes.reason);
  }

  const premiumUntilIso = profile?.premium_until ?? null;
  const premiumUntil = premiumUntilIso ? new Date(premiumUntilIso) : null;
  const track = lasTrack(profile?.onboarding_track);

  // Blockeringarna läses först när de faktiskt används. En Allt-kund har
  // inget att blockeras av, och då är frågan bortkastad.
  let blockeringar: Blockeringar = { rader: [], totalt: 0, badaSparen: false };
  if (scope !== 'allt') {
    blockeringar = await lasBlockeringar(
      supabase,
      user.id,
      scope ? { utanforScope: scope } : undefined
    );
  }

  const tillstand: 'free' | 'track' | 'all' =
    scope === 'allt' ? 'all' : scope ? 'track' : 'free';

  const paket = harPaket(scope, premiumUntil);

  // Admin och tidsbegränsad premium är varianter av tillstånd Allt med en
  // annan statusrad och utan längdval (Fas 2D). Ingen egen skiss behövs.
  const premiumSource = profile?.premium_source ?? null;
  const subscriptionId = profile?.subscription_id ?? null;
  const harStripePrenumeration =
    Boolean(subscriptionId) &&
    !String(subscriptionId).startsWith('sub_test') &&
    ['active', 'trialing', 'past_due', 'unpaid'].includes(
      profile?.subscription_status ?? ''
    );

  return (
    <PrenumerationClient
      tillstand={tillstand}
      scope={scope}
      track={track}
      paket={paket && isPlanKey(paket) ? paket : null}
      premiumUntil={premiumUntilIso}
      premiumSource={premiumSource}
      harStripePrenumeration={harStripePrenumeration}
      blockeringar={blockeringar}
      foreslagetPaket={foreslaPaket(blockeringar, track)}
    />
  );
}
