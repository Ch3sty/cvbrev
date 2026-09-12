/**
 * Prenumeration är en server component.
 *
 * Förut var hela sidan 'use client' och visade ett skelett tills useProfile
 * hade satt loading till false i en effekt. Först därefter monterade
 * UsageStats, som fetchade /api/quota/summary och där inne körde
 * auth.getUser(), premiumkontrollen och fyra räkningar. Skelettet som byttes
 * mot riktigt innehåll var sidans layoutförskjutning.
 *
 * Nu läses sessionen, profilen och kvoterna här på servern i en parallell
 * omgång. Kvoterna kommer via den delade getQuotaSummary, inte genom att
 * fetcha vår egen HTTP-route.
 *
 * Köp- och uppsägningsflödet är orört. Hela avgörandet om vilket läge kontot
 * är i (betalande, admin, tidsbegränsad, gratis) räknas ut ur exakt samma
 * fält och med exakt samma regler som förut, bara på servern. Stripe-knappar,
 * portal och uppsägning ligger kvar i sina egna komponenter.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getQuotaSummary, type QuotaSummary } from '@/lib/quota/getQuotaSummary';
import PrenumerationClient from './PrenumerationClient';

interface SubscriptionProfile {
  subscription_tier?: string | null;
  premium_until?: string | null;
  premium_source?: string | null;
  subscription_id?: string | null;
  subscription_status?: string | null;
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
  let quota: QuotaSummary | null = null;

  const [profileRes, quotaRes] = await Promise.allSettled([
    supabase
      .from('profiles')
      .select(
        'subscription_tier, premium_until, premium_source, subscription_id, subscription_status'
      )
      .eq('id', user.id)
      .maybeSingle(),
    getQuotaSummary(supabase, user.id),
  ]);

  if (profileRes.status === 'fulfilled') {
    profile = (profileRes.value.data ?? null) as SubscriptionProfile | null;
  } else {
    console.error('Fel vid server-hämtning av prenumerationsprofilen:', profileRes.reason);
  }

  if (quotaRes.status === 'fulfilled') {
    quota = quotaRes.value;
  } else {
    // Hellre ingen användningssektion än fel siffror, precis som förut.
    console.error('Fel vid server-hämtning av kvoter:', quotaRes.reason);
  }

  // Nedan är rad för rad samma regler som låg i klienten.
  const premiumUntil = profile?.premium_until ?? null;
  const premiumSource = profile?.premium_source ?? null;

  // resolveTier i useProfile: 'premium' i tabellen, och en premium_until som
  // inte passerat.
  const isPremium =
    profile?.subscription_tier === 'premium' &&
    (!premiumUntil || new Date(premiumUntil) > new Date());

  const isTrialUser = ['signup_trial', 'oauth_signup_trial'].includes(premiumSource ?? '');
  const isAdminGranted = premiumSource === 'admin';
  const isOnboardingReward = premiumSource === 'onboarding_completion';
  const isGuestInvitation = premiumSource === 'guest_invitation';

  // Har användaren en riktig, betalande Stripe-prenumeration? Vi litar på
  // Stripe-fälten, inte på premium_source: den som först fick gratispremie
  // via onboarding och sedan tecknade abonnemang behåller sin gamla
  // premium_source och måste ändå se vägen till uppsägning.
  const subscriptionId = profile?.subscription_id ?? null;
  const hasStripeSubscription =
    Boolean(subscriptionId) &&
    !String(subscriptionId).startsWith('sub_test') &&
    ['active', 'trialing', 'past_due', 'unpaid'].includes(
      profile?.subscription_status ?? ''
    );

  // En riktig Stripe-prenumeration slår alltid ut gratispremie-märkningen.
  // Annars fastnar den som uppgraderat efter onboarding i "temporär premium"
  // och ser varken portal eller uppsägning.
  const isTemporaryPremium =
    !hasStripeSubscription && (isTrialUser || isOnboardingReward || isGuestInvitation);
  const isPaidPremium =
    hasStripeSubscription || (isPremium && !isTemporaryPremium && !isAdminGranted);

  return (
    <PrenumerationClient
      quota={quota}
      isPremium={isPremium}
      isPaidPremium={isPaidPremium}
      isAdminGranted={isAdminGranted}
      isTemporaryPremium={isTemporaryPremium}
      hasStripeSubscription={hasStripeSubscription}
      premiumUntil={premiumUntil}
      premiumSource={premiumSource}
    />
  );
}
