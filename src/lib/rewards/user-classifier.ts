/**
 * User Classifier
 *
 * Determines user type and premium status for reward activation
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserClassification, UserType } from './types';

export async function classifyUser(
  supabase: SupabaseClient,
  userId: string
): Promise<UserClassification> {
  // Fetch user profile with all relevant fields
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, premium_until, stripe_customer_id, subscription_id, subscription_status')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw new Error('Failed to fetch user profile');
  }

  console.log('[classifyUser] Profile data:', {
    userId,
    subscription_status: profile.subscription_status,
    subscription_id: profile.subscription_id,
    stripe_customer_id: profile.stripe_customer_id,
    premium_until: profile.premium_until
  });

  const hasStripeSub = !!profile.subscription_id &&
    (profile.subscription_status === 'active' || profile.subscription_status === 'trialing');
  const isTrialing = profile.subscription_status === 'trialing';
  const premiumUntil = profile.premium_until ? new Date(profile.premium_until) : null;
  const hasValidPremiumUntil = premiumUntil && premiumUntil > new Date();
  const hasTemporaryPremium = !!(hasValidPremiumUntil && !hasStripeSub);

  let type: UserType = 'free';

  if (hasStripeSub) {
    type = isTrialing ? 'trial_premium' : 'paid_premium';
  } else if (hasTemporaryPremium) {
    type = 'temporary_premium';
  }

  const classification = {
    type,
    hasStripeSub,
    hasTemporaryPremium,
    premiumUntil,
    stripeCustomerId: profile.stripe_customer_id,
    subscriptionId: profile.subscription_id
  };

  console.log('[classifyUser] Classification result:', classification);

  return classification;
}

/**
 * Helper to check if user can receive temporary premium
 */
export function canReceiveTemporaryPremium(classification: UserClassification): boolean {
  return classification.type === 'free' || classification.type === 'temporary_premium';
}

/**
 * Helper to check if user can receive Stripe promotion codes
 */
export function canReceiveStripePromoCode(classification: UserClassification): boolean {
  return classification.hasStripeSub && !!classification.stripeCustomerId;
}

/**
 * Helper to determine if discount should be saved for later
 */
export function shouldSaveDiscountForLater(classification: UserClassification): boolean {
  return !classification.hasStripeSub;
}
