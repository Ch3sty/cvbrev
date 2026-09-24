/**
 * Prenumeration: en vy, tre tillstånd
 * (docs/plan-paket-och-onboarding.md, Fas 2D avsnitt 3).
 *
 * Gratis, spår och Hela paketet. Skelettet är detsamma i alla tre: sidhuvud, en
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
import { isPlanKey } from '@/lib/plans/plans';
import { harPaket } from '@/lib/plans/harPaket';
import type { Scope } from '@/lib/access/features';
import { lasBlockeringar, foreslaPaket, type Blockeringar } from './blockeringar';
import PrenumerationClient from './PrenumerationClient';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

interface SubscriptionProfile {
  subscription_tier?: string | null;
  premium_until?: string | null;
  premium_source?: string | null;
  premium_scope?: string | null;
  subscription_id?: string | null;
  subscription_status?: string | null;
  onboarding_track?: string | null;
  price_id?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
}

function lasTrack(varde: unknown): Scope | null {
  return varde === 'cv' || varde === 'tester' || varde === 'allt' ? varde : null;
}

export default async function PrenumerationPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  let profile: SubscriptionProfile | null = null;
  let scope: Scope | null = null;

  const [profileRes, scopeRes] = await Promise.allSettled([
    supabase
      .from('profiles')
      .select(
        'subscription_tier, premium_until, premium_source, premium_scope, subscription_id, subscription_status, onboarding_track, price_id, current_period_end, cancel_at_period_end'
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

  // Längden ur prisid:t när det finns (bugg 2 i köptestet), annars gissningen.
  const paket = harPaket(scope, premiumUntil, new Date(), {
    priceId: profile?.price_id ?? null,
    status: profile?.subscription_status ?? null,
  });

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

  // Statusradens datum: nästa dragning för en prenumeration, sluttiden för
  // tidsbegränsad premium. Webhooken nollar premium_until för prenumerationer,
  // så utan current_period_end hade raden saknat datum.
  const slutIso = harStripePrenumeration
    ? (profile?.current_period_end ?? premiumUntilIso)
    : premiumUntilIso;
  const uppsagd = harStripePrenumeration && profile?.cancel_at_period_end === true;

  return (
    <PrenumerationClient
      tillstand={tillstand}
      scope={scope}
      track={track}
      paket={paket && isPlanKey(paket) ? paket : null}
      premiumUntil={slutIso}
      uppsagd={uppsagd}
      premiumSource={premiumSource}
      harStripePrenumeration={harStripePrenumeration}
      blockeringar={blockeringar}
      foreslagetPaket={foreslaPaket(blockeringar, track)}
    />
  );
}
